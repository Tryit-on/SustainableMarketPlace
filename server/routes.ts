import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { computeSustainabilityScore } from "./scoring";
import { sendEmail } from "./email";
import { startCertificationExpiryJob } from "./jobs/certificationExpiry";
import Stripe from "stripe";
import { z } from "zod";
import {
  insertReviewSchema,
  insertCartItemSchema,
  insertWishlistItemSchema,
  insertProductSchema,
  insertSellerApplicationSchema,
  insertProductQASchema,
} from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: STRIPE_SECRET_KEY not set. Stripe features will not work.");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-04-30.basil" as any })
  : null;

// ─── Middleware helpers ────────────────────────────────────────────────────────

function getUserId(req: Request): string {
  return (req as any).user?.id;
}

async function requireAdmin(req: Request, res: Response): Promise<boolean> {
  const user = await storage.getUser(getUserId(req));
  if (!user?.isAdmin) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
}

async function requireVerifiedSeller(req: Request, res: Response): Promise<boolean> {
  const user = await storage.getUser(getUserId(req));
  if (!user?.isSeller || user.verificationStatus !== "verified") {
    res.status(403).json({ message: "Verified seller account required" });
    return false;
  }
  return true;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  startCertificationExpiryJob();

  // ── Auth ──────────────────────────────────────────────────────────────────

  app.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(getUserId(req));
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password: _pw, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Categories ────────────────────────────────────────────────────────────

  app.get("/api/categories", async (_req, res) => {
    try {
      res.json(await storage.getCategories());
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Certification bodies ──────────────────────────────────────────────────

  app.get("/api/certification-bodies", async (_req, res) => {
    try {
      res.json(await storage.getCertificationBodies());
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Products ──────────────────────────────────────────────────────────────

  app.get("/api/products", async (req, res) => {
    try {
      const {
        category,
        certBodies,
        packagingType,
        minScore,
        hasCarbonData,
        country,
        search,
        sort,
        page,
        limit,
      } = req.query as Record<string, string>;

      const products = await storage.getProducts({
        categorySlug: category,
        certificationBodyIds: certBodies ? certBodies.split(",") : undefined,
        packagingType,
        minScore: minScore ? parseInt(minScore) : undefined,
        hasCarbonData: hasCarbonData === "true",
        manufacturingCountry: country,
        search,
        sort: sort as any,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 48,
      });
      res.json(products);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/featured", async (_req, res) => {
    try {
      res.json(await storage.getProductsFeatured());
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/compare", async (req, res) => {
    try {
      const { ids } = req.query as { ids: string };
      if (!ids) return res.status(400).json({ message: "ids required" });
      const idList = ids.split(",").slice(0, 3);
      const products = await Promise.all(idList.map((id) => storage.getProduct(id)));
      res.json(products.filter(Boolean));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/related/:categoryId", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.categoryId);
      res.json(products.slice(0, 8));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:slug/score-breakdown", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ message: "Product not found" });
      const breakdown = await computeSustainabilityScore(product);
      res.json(breakdown);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:slug/reviews", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(await storage.getProductReviews(product.id));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products/:productId/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const validated = insertReviewSchema.extend({ rating: z.number().min(1).max(5) }).parse({
        ...req.body,
        productId: req.params.productId,
        userId,
      });
      res.status(201).json(await storage.createReview(validated));
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Validation error", errors: error.errors });
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Product Q&A ───────────────────────────────────────────────────────────

  app.get("/api/products/:slug/qa", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(await storage.getProductQA(product.id, true));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products/:productId/qa", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const qa = await storage.createProductQA({
        productId: req.params.productId,
        askerId: userId,
        question: req.body.question,
        isApproved: false,
      });
      res.status(201).json(qa);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Replacement guides ────────────────────────────────────────────────────

  app.get("/api/replacement-guides", async (_req, res) => {
    try {
      res.json(await storage.getReplacementGuides());
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/replacement-guides/:slug", async (req, res) => {
    try {
      const guide = await storage.getReplacementGuide(req.params.slug);
      if (!guide) return res.status(404).json({ message: "Guide not found" });
      res.json(guide);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Cart ──────────────────────────────────────────────────────────────────

  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      res.json(await storage.getCartItems(getUserId(req)));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { productId, quantity = 1 } = req.body;
      if (!productId) return res.status(400).json({ message: "Product ID is required" });
      res.status(201).json(await storage.addToCart({ userId, productId, quantity }));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const { quantity } = req.body;
      if (typeof quantity !== "number" || quantity < 1) return res.status(400).json({ message: "Invalid quantity" });
      const item = await storage.updateCartItem(req.params.id, quantity);
      if (!item) return res.status(404).json({ message: "Cart item not found" });
      res.json(item);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Wishlist ──────────────────────────────────────────────────────────────

  app.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      res.json(await storage.getWishlistItems(getUserId(req)));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/wishlist/count", isAuthenticated, async (req, res) => {
    try {
      res.json({ count: await storage.getWishlistCount(getUserId(req)) });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "Product ID is required" });
      res.status(201).json(await storage.addToWishlist({ userId: getUserId(req), productId }));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/wishlist/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.removeFromWishlist(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Orders ────────────────────────────────────────────────────────────────

  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      res.json(await storage.getOrders(getUserId(req)));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
      const { amount } = req.body;
      if (!amount || typeof amount !== "number") return res.status(400).json({ message: "Invalid amount" });
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "gbp",
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch {
      res.status(500).json({ message: "Error creating payment intent" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { shippingAddress, paymentIntentId, shippingCarbonKg = 0 } = req.body;
      const cartItems = await storage.getCartItems(userId);
      if (cartItems.length === 0) return res.status(400).json({ message: "Cart is empty" });

      const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);

      // Calculate carbon from product data
      const carbonKgTotal = cartItems.reduce((sum, item) => {
        const productCarbon = parseFloat(item.product.carbonFootprint ?? "0");
        return sum + productCarbon * item.quantity;
      }, shippingCarbonKg);

      const order = await storage.createOrder({
        userId,
        status: "pending",
        totalAmount: totalAmount.toFixed(2),
        shippingAddress,
        paymentIntentId,
        carbonKgTotal: carbonKgTotal > 0 ? carbonKgTotal.toFixed(3) : null,
      });

      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
        });
      }

      await storage.clearCart(userId);

      // Update buyer lifetime stats
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(userId, {
          lifetimeCarbonAvoidedKg: (
            parseFloat(user.lifetimeCarbonAvoidedKg ?? "0") + (carbonKgTotal > 0 ? 0 : 0)
          ).toFixed(3) as any,
        });
      }

      res.status(201).json(order);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Seller: Application ───────────────────────────────────────────────────

  app.get("/api/seller/application", isAuthenticated, async (req, res) => {
    try {
      const app = await storage.getSellerApplicationByUser(getUserId(req));
      if (!app) return res.status(404).json({ message: "No application found" });
      res.json(app);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/seller/apply", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const existing = await storage.getSellerApplicationByUser(userId);
      if (existing && existing.status === "pending") {
        return res.status(400).json({ message: "Application already pending" });
      }
      if (existing && existing.status === "approved") {
        return res.status(400).json({ message: "Already approved" });
      }

      const { businessName, businessWebsite, businessDescription, productCategories } = req.body;
      if (!businessName || !businessDescription || businessDescription.length < 100) {
        return res.status(400).json({ message: "Business name and description (min 100 chars) required" });
      }

      const application = await storage.createSellerApplication({
        userId,
        businessName,
        businessWebsite,
        businessDescription,
        productCategories,
        status: "pending",
      });

      // Update user to pending
      await storage.updateUser(userId, { verificationStatus: "pending" });

      const user = await storage.getUser(userId);
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: "GreenMart — Application Received",
          text: `Hi ${user.firstName ?? "there"},\n\nWe've received your seller application. Our team will review it within 3 business days.\n\nApplication ID: ${application.id}\n\nThanks,\nThe GreenMart Team`,
        });
      }

      res.status(201).json(application);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Document upload — expects base64 or URL (in production, use S3 presigned URL)
  app.post("/api/seller/documents", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const { applicationId, certificationBodyId, certificationNumber, documentUrl, documentType, expiryDate } = req.body;
      if (!documentUrl) return res.status(400).json({ message: "documentUrl required" });

      const doc = await storage.createCertificationDocument({
        userId,
        applicationId,
        certificationBodyId,
        certificationNumber,
        documentUrl,
        documentType,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        status: "pending",
      });
      res.status(201).json(doc);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Seller: Products ──────────────────────────────────────────────────────

  app.get("/api/seller/products", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user?.isSeller) return res.status(403).json({ message: "Not a seller" });
      res.json(await storage.getProductsBySeller(userId));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/seller/products", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!(await requireVerifiedSeller(req, res))) return;

      const { certificationIds, ...productData } = req.body;
      const slug =
        productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Date.now().toString(36);

      const product = await storage.createProduct(
        { ...productData, sellerId: userId, slug, isPublished: false },
        certificationIds
      );

      // Compute initial score
      const enriched = await storage.getProduct(product.id);
      if (enriched) {
        const breakdown = await computeSustainabilityScore(enriched);
        await storage.updateProduct(product.id, {
          computedSustainabilityScore: breakdown.total,
          scoreComputedAt: new Date(),
        } as any);
      }

      res.status(201).json(product);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/seller/products/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user?.isSeller) return res.status(403).json({ message: "Not a seller" });

      const existing = await storage.getProduct(req.params.id);
      if (!existing || existing.sellerId !== userId) return res.status(404).json({ message: "Product not found" });

      const updated = await storage.updateProduct(req.params.id, req.body);
      if (updated) {
        const enriched = await storage.getProduct(updated.id);
        if (enriched) {
          const breakdown = await computeSustainabilityScore(enriched);
          await storage.updateProduct(updated.id, {
            computedSustainabilityScore: breakdown.total,
            scoreComputedAt: new Date(),
          } as any);
        }
      }
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/seller/products/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user?.isSeller) return res.status(403).json({ message: "Not a seller" });
      const existing = await storage.getProduct(req.params.id);
      if (!existing || existing.sellerId !== userId) return res.status(404).json({ message: "Product not found" });
      await storage.deleteProduct(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/seller/products/:id/publish", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!(await requireVerifiedSeller(req, res))) return;
      const existing = await storage.getProduct(req.params.id);
      if (!existing || existing.sellerId !== userId) return res.status(404).json({ message: "Product not found" });
      const { isPublished } = req.body;
      res.json(await storage.updateProduct(req.params.id, { isPublished } as any));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seller orders
  app.get("/api/seller/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user?.isSeller) return res.status(403).json({ message: "Not a seller" });
      res.json(await storage.getSellerOrders(userId));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seller certifications
  app.get("/api/seller/certifications", isAuthenticated, async (req, res) => {
    try {
      res.json(await storage.getSellerCertifications(getUserId(req)));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Admin: Applications ───────────────────────────────────────────────────

  app.get("/api/admin/applications", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const { status } = req.query as { status?: string };
      res.json(await storage.getSellerApplications(status));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/applications/:id", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const app = await storage.getSellerApplication(req.params.id);
      if (!app) return res.status(404).json({ message: "Application not found" });
      res.json(app);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/applications/:id", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const adminId = getUserId(req);
      const { status, adminNotes, certificationIds } = req.body;

      const app = await storage.getSellerApplication(req.params.id);
      if (!app) return res.status(404).json({ message: "Application not found" });

      const updated = await storage.updateSellerApplication(req.params.id, {
        status,
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      });

      const user = await storage.getUser(app.userId);

      if (status === "approved") {
        // Activate seller account
        await storage.updateUser(app.userId, {
          isSeller: true,
          verificationStatus: "verified",
          sellerName: app.businessName,
          sellerSlug: app.businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        });

        // Create sellerCertification rows for verified docs
        for (const doc of app.documents.filter((d) => d.status === "verified")) {
          await storage.createSellerCertification({
            userId: app.userId,
            certificationBodyId: doc.certificationBodyId!,
            documentId: doc.id,
            isActive: true,
            validFrom: new Date(),
            validUntil: doc.expiryDate ?? undefined,
          });
        }

        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: "GreenMart — You're approved! 🎉",
            text: `Hi ${user.firstName ?? "there"},\n\nCongratulations — your GreenMart seller application has been approved!\n\nYou can now log in and start listing your products: https://greenmart.com/seller/dashboard\n\nThanks,\nThe GreenMart Team`,
          });
        }
      } else if (status === "rejected") {
        await storage.updateUser(app.userId, { verificationStatus: "rejected" });
        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: "GreenMart — Application Update",
            text: `Hi ${user.firstName ?? "there"},\n\nUnfortunately we weren't able to approve your application at this time.\n\nReason: ${adminNotes ?? "Not provided"}\n\nYou're welcome to reapply once you hold a qualifying certification.\n\nThanks,\nThe GreenMart Team`,
          });
        }
      } else if (status === "info_requested") {
        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: "GreenMart — More information needed",
            text: `Hi ${user.firstName ?? "there"},\n\nWe need a little more information to process your application:\n\n${adminNotes}\n\nPlease log in and resubmit: https://greenmart.com/seller/application\n\nThanks,\nThe GreenMart Team`,
          });
        }
      }

      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: verify/reject individual document
  app.patch("/api/admin/documents/:id", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const { status, adminNotes } = req.body;
      const updated = await storage.updateCertificationDocument(req.params.id, {
        status,
        adminNotes,
        verifiedAt: status === "verified" ? new Date() : undefined,
        verifiedBy: status === "verified" ? getUserId(req) : undefined,
      });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: expiring certifications
  app.get("/api/admin/expiring-certs", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const days = parseInt((req.query.days as string) ?? "60");
      res.json(await storage.getExpiringCertifications(days));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Q&A moderation
  app.get("/api/admin/qa", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      res.json(await storage.getPendingQA());
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/qa/:id", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const { isApproved, answer } = req.body;
      const updated = await storage.updateProductQA(req.params.id, {
        isApproved,
        answer,
        answeredBy: answer ? getUserId(req) : undefined,
        answeredAt: answer ? new Date() : undefined,
      });
      res.json(updated);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: recompute score
  app.post("/api/admin/products/:id/recompute-score", isAuthenticated, async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const product = await storage.getProduct(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      const breakdown = await computeSustainabilityScore(product);
      await storage.updateProduct(req.params.id, {
        computedSustainabilityScore: breakdown.total,
        scoreComputedAt: new Date(),
      } as any);
      res.json(breakdown);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Public seller profiles ─────────────────────────────────────────────────

  app.get("/api/sellers/:slug", async (req, res) => {
    try {
      const profile = await storage.getSellerProfile(req.params.slug);
      if (!profile) return res.status(404).json({ message: "Seller not found" });
      res.json(profile);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sellers/:slug/products", async (req, res) => {
    try {
      const profile = await storage.getSellerProfile(req.params.slug);
      if (!profile) return res.status(404).json({ message: "Seller not found" });
      const products = await storage.getProductsBySeller(profile.id);
      res.json(products.filter((p) => p.isPublished));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Badge SVG endpoint
  app.get("/api/badges/:slug.svg", async (req, res) => {
    try {
      const profile = await storage.getSellerProfile(req.params.slug);
      if (!profile || profile.verificationStatus !== "verified") {
        return res.status(404).send("Not found");
      }

      const name = profile.sellerName ?? req.params.slug;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <rect width="200" height="60" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
  <circle cx="24" cy="30" r="12" fill="#16a34a"/>
  <path d="M18 30l4 4 8-8" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="44" y="22" font-family="system-ui,sans-serif" font-size="9" font-weight="600" fill="#15803d">GreenMart Verified</text>
  <text x="44" y="38" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="#14532d">${name.substring(0, 20)}</text>
  <text x="44" y="52" font-family="system-ui,sans-serif" font-size="8" fill="#6b7280">greenmart.com/sellers/${req.params.slug}</text>
</svg>`;

      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(svg);
    } catch {
      res.status(500).send("Error");
    }
  });

  // ── Challenges ────────────────────────────────────────────────────────────

  app.get("/api/challenges", async (req, res) => {
    try {
      res.json(await storage.getChallenges(req.query.active === "true"));
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/challenges/:id/join", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const participant = await storage.joinChallenge(req.params.id, userId);
      res.status(201).json(participant);
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Impact dashboard ──────────────────────────────────────────────────────

  app.get("/api/account/impact", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "Not found" });

      const orderList = await storage.getOrders(userId);
      const certifiedProductCount = orderList.reduce((sum, order) => sum + order.items.length, 0);
      const totalCarbonOffset = orderList
        .filter((o) => o.offsetRequested)
        .reduce((sum, o) => sum + parseFloat(o.carbonKgTotal ?? "0"), 0);

      res.json({
        lifetimeCarbonOffsetKg: parseFloat(user.lifetimeCarbonOffsetKg ?? "0"),
        lifetimeCarbonAvoidedKg: parseFloat(user.lifetimeCarbonAvoidedKg ?? "0"),
        lifetimeCertifiedProducts: certifiedProductCount,
        totalOrders: orderList.length,
        totalCarbonOffset,
        orders: orderList.map((o) => ({
          id: o.id,
          createdAt: o.createdAt,
          carbonKgTotal: o.carbonKgTotal,
          offsetRequested: o.offsetRequested,
          offsetConfirmationId: o.offsetConfirmationId,
          offsetProviderUrl: o.offsetProviderUrl,
          itemCount: o.items.length,
        })),
      });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ── Sitemap ───────────────────────────────────────────────────────────────

  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const [products, guides] = await Promise.all([
        storage.getProducts({ limit: 1000 }),
        storage.getReplacementGuides(),
      ]);
      const base = process.env.SITE_URL ?? "https://greenmart.com";

      const staticUrls = ["/", "/shop", "/replace", "/learn", "/about"].map(
        (path) => `<url><loc>${base}${path}</loc><changefreq>weekly</changefreq></url>`
      );

      const productUrls = products.map(
        (p) => `<url><loc>${base}/product/${p.slug}</loc><changefreq>weekly</changefreq></url>`
      );

      const guideUrls = guides.map(
        (g) => `<url><loc>${base}/replace/${g.slug}</loc><changefreq>monthly</changefreq></url>`
      );

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...productUrls, ...guideUrls].join("\n")}
</urlset>`;

      res.setHeader("Content-Type", "application/xml");
      res.send(xml);
    } catch {
      res.status(500).send("Error generating sitemap");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
