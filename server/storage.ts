import { db } from "./db";
import { eq, and, desc, sql, ilike, inArray, gte, lte, or, ne } from "drizzle-orm";
import {
  users,
  products,
  categories,
  certificationBodies,
  sellerApplications,
  certificationDocuments,
  sellerCertifications,
  productCertifications,
  reviews,
  cartItems,
  wishlistItems,
  orders,
  orderItems,
  replacementGuides,
  challenges,
  challengeParticipants,
  productQA,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type CertificationBody,
  type InsertCertificationBody,
  type SellerApplication,
  type InsertSellerApplication,
  type CertificationDocument,
  type InsertCertificationDocument,
  type SellerCertification,
  type InsertSellerCertification,
  type Review,
  type InsertReview,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type InsertWishlistItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ReplacementGuide,
  type InsertReplacementGuide,
  type Challenge,
  type InsertChallenge,
  type ChallengeParticipant,
  type ProductQA,
  type InsertProductQA,
  type ProductWithDetails,
  type CartItemWithProduct,
  type WishlistItemWithProduct,
  type OrderWithItems,
  type ReviewWithUser,
  type SellerApplicationWithDocs,
  type PublicSellerProfile,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Certification bodies
  getCertificationBodies(): Promise<CertificationBody[]>;
  getCertificationBody(id: string): Promise<CertificationBody | undefined>;
  createCertificationBody(body: InsertCertificationBody): Promise<CertificationBody>;

  // Seller applications
  createSellerApplication(app: InsertSellerApplication): Promise<SellerApplication>;
  getSellerApplication(id: string): Promise<SellerApplicationWithDocs | undefined>;
  getSellerApplicationByUser(userId: string): Promise<SellerApplication | undefined>;
  getSellerApplications(status?: string): Promise<SellerApplicationWithDocs[]>;
  updateSellerApplication(id: string, data: Partial<SellerApplication>): Promise<SellerApplication | undefined>;

  // Certification documents
  createCertificationDocument(doc: InsertCertificationDocument): Promise<CertificationDocument>;
  getCertificationDocumentsByApplication(applicationId: string): Promise<CertificationDocument[]>;
  updateCertificationDocument(id: string, data: Partial<CertificationDocument>): Promise<CertificationDocument | undefined>;

  // Seller certifications
  createSellerCertification(cert: InsertSellerCertification): Promise<SellerCertification>;
  getSellerCertifications(userId: string): Promise<(SellerCertification & { certificationBody: CertificationBody })[]>;
  deactivateExpiredCertifications(): Promise<number>;
  getExpiringCertifications(withinDays: number): Promise<(SellerCertification & { certificationBody: CertificationBody; user: Pick<User, "id" | "email" | "sellerName"> })[]>;

  // Products
  getProducts(filters?: ProductFilters): Promise<ProductWithDetails[]>;
  getProductsFeatured(): Promise<ProductWithDetails[]>;
  getProduct(id: string): Promise<ProductWithDetails | undefined>;
  getProductBySlug(slug: string): Promise<ProductWithDetails | undefined>;
  getProductsByCategory(categoryId: string): Promise<ProductWithDetails[]>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  createProduct(product: InsertProduct, certificationIds?: string[]): Promise<Product>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<void>;

  // Reviews
  getProductReviews(productId: string): Promise<ReviewWithUser[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Cart
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  getCartItem(id: string): Promise<CartItem | undefined>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Wishlist
  getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]>;
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: string): Promise<void>;
  getWishlistCount(userId: string): Promise<number>;

  // Orders
  getOrders(userId: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  getSellerOrders(sellerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Replacement guides
  getReplacementGuides(): Promise<ReplacementGuide[]>;
  getReplacementGuide(slug: string): Promise<ReplacementGuide | undefined>;
  createReplacementGuide(guide: InsertReplacementGuide): Promise<ReplacementGuide>;

  // Challenges
  getChallenges(activeOnly?: boolean): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, data: Partial<Challenge>): Promise<Challenge | undefined>;
  joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant>;
  getChallengeParticipants(challengeId: string): Promise<number>;
  getUserChallenges(userId: string): Promise<ChallengeParticipant[]>;

  // Product Q&A
  getProductQA(productId: string, approvedOnly?: boolean): Promise<ProductQA[]>;
  createProductQA(qa: InsertProductQA): Promise<ProductQA>;
  updateProductQA(id: string, data: Partial<ProductQA>): Promise<ProductQA | undefined>;
  getPendingQA(): Promise<(ProductQA & { product: Pick<Product, "id" | "name" | "slug"> })[]>;

  // Seller public profile
  getSellerProfile(slug: string): Promise<PublicSellerProfile | undefined>;
  getSellerProfileById(id: string): Promise<PublicSellerProfile | undefined>;

  // Stripe helpers
  getUserByStripeAccount(stripeAccountId: string): Promise<User | undefined>;
  updateUserByStripeAccount(stripeAccountId: string, data: Partial<User>): Promise<void>;
  updateUserByStripeCustomer(customerId: string, data: Partial<User>): Promise<void>;
}

export interface ProductFilters {
  categorySlug?: string;
  certificationBodyIds?: string[];
  packagingType?: string;
  minScore?: number;
  maxCarbon?: number;
  manufacturingCountry?: string;
  hasCarbonData?: boolean;
  inStockOnly?: boolean;
  search?: string;
  sort?: "score_desc" | "carbon_asc" | "price_asc" | "price_desc" | "newest" | "rating_desc";
  page?: number;
  limit?: number;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
    return result[0];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await db.insert(categories).values(category).returning();
    return result;
  }

  // Certification bodies
  async getCertificationBodies(): Promise<CertificationBody[]> {
    return db.select().from(certificationBodies).where(eq(certificationBodies.isActive, true));
  }

  async getCertificationBody(id: string): Promise<CertificationBody | undefined> {
    const result = await db.select().from(certificationBodies).where(eq(certificationBodies.id, id)).limit(1);
    return result[0];
  }

  async createCertificationBody(body: InsertCertificationBody): Promise<CertificationBody> {
    const [result] = await db.insert(certificationBodies).values(body).returning();
    return result;
  }

  // Seller applications
  async createSellerApplication(app: InsertSellerApplication): Promise<SellerApplication> {
    const [result] = await db.insert(sellerApplications).values(app).returning();
    return result;
  }

  async getSellerApplication(id: string): Promise<SellerApplicationWithDocs | undefined> {
    const result = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id)).limit(1);
    if (!result[0]) return undefined;
    return this.enrichApplication(result[0]);
  }

  async getSellerApplicationByUser(userId: string): Promise<SellerApplication | undefined> {
    const result = await db
      .select()
      .from(sellerApplications)
      .where(eq(sellerApplications.userId, userId))
      .orderBy(desc(sellerApplications.submittedAt))
      .limit(1);
    return result[0];
  }

  async getSellerApplications(status?: string): Promise<SellerApplicationWithDocs[]> {
    const query = db.select().from(sellerApplications);
    const list = status
      ? await query.where(eq(sellerApplications.status, status)).orderBy(desc(sellerApplications.submittedAt))
      : await query.orderBy(desc(sellerApplications.submittedAt));
    return Promise.all(list.map((a) => this.enrichApplication(a)));
  }

  async updateSellerApplication(id: string, data: Partial<SellerApplication>): Promise<SellerApplication | undefined> {
    const result = await db.update(sellerApplications).set(data).where(eq(sellerApplications.id, id)).returning();
    return result[0];
  }

  private async enrichApplication(app: SellerApplication): Promise<SellerApplicationWithDocs> {
    const user = await db.select().from(users).where(eq(users.id, app.userId)).limit(1);
    const docs = await db
      .select()
      .from(certificationDocuments)
      .where(eq(certificationDocuments.applicationId, app.id));
    const docsWithBodies = await Promise.all(
      docs.map(async (doc) => {
        const body = doc.certificationBodyId
          ? await db.select().from(certificationBodies).where(eq(certificationBodies.id, doc.certificationBodyId)).limit(1)
          : [];
        return { ...doc, certificationBody: body[0] ?? null };
      })
    );
    return {
      ...app,
      user: user[0]
        ? { id: user[0].id, email: user[0].email, firstName: user[0].firstName, lastName: user[0].lastName }
        : { id: "", email: null, firstName: null, lastName: null },
      documents: docsWithBodies,
    };
  }

  // Certification documents
  async createCertificationDocument(doc: InsertCertificationDocument): Promise<CertificationDocument> {
    const [result] = await db.insert(certificationDocuments).values(doc).returning();
    return result;
  }

  async getCertificationDocumentsByApplication(applicationId: string): Promise<CertificationDocument[]> {
    return db.select().from(certificationDocuments).where(eq(certificationDocuments.applicationId, applicationId));
  }

  async updateCertificationDocument(id: string, data: Partial<CertificationDocument>): Promise<CertificationDocument | undefined> {
    const result = await db.update(certificationDocuments).set(data).where(eq(certificationDocuments.id, id)).returning();
    return result[0];
  }

  // Seller certifications
  async createSellerCertification(cert: InsertSellerCertification): Promise<SellerCertification> {
    const [result] = await db.insert(sellerCertifications).values(cert).returning();
    return result;
  }

  async getSellerCertifications(userId: string): Promise<(SellerCertification & { certificationBody: CertificationBody })[]> {
    const certs = await db
      .select()
      .from(sellerCertifications)
      .where(and(eq(sellerCertifications.userId, userId), eq(sellerCertifications.isActive, true)));
    return Promise.all(
      certs.map(async (cert) => {
        const body = await db.select().from(certificationBodies).where(eq(certificationBodies.id, cert.certificationBodyId)).limit(1);
        return { ...cert, certificationBody: body[0]! };
      })
    );
  }

  async deactivateExpiredCertifications(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(sellerCertifications)
      .set({ isActive: false })
      .where(
        and(
          eq(sellerCertifications.isActive, true),
          lte(sellerCertifications.validUntil, now)
        )
      )
      .returning();
    return result.length;
  }

  async getExpiringCertifications(withinDays: number): Promise<(SellerCertification & { certificationBody: CertificationBody; user: Pick<User, "id" | "email" | "sellerName"> })[]> {
    const now = new Date();
    const future = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
    const certs = await db
      .select()
      .from(sellerCertifications)
      .where(
        and(
          eq(sellerCertifications.isActive, true),
          gte(sellerCertifications.validUntil, now),
          lte(sellerCertifications.validUntil, future)
        )
      );
    return Promise.all(
      certs.map(async (cert) => {
        const body = await db.select().from(certificationBodies).where(eq(certificationBodies.id, cert.certificationBodyId)).limit(1);
        const user = await db.select().from(users).where(eq(users.id, cert.userId)).limit(1);
        return {
          ...cert,
          certificationBody: body[0]!,
          user: user[0]
            ? { id: user[0].id, email: user[0].email, sellerName: user[0].sellerName }
            : { id: "", email: null, sellerName: null },
        };
      })
    );
  }

  // Products
  async getProducts(filters: ProductFilters = {}): Promise<ProductWithDetails[]> {
    let query = db.select().from(products).where(eq(products.isPublished, true));

    if (filters.inStockOnly !== false) {
      query = query.where(and(eq(products.isPublished, true), eq(products.inStock, true)));
    }

    let productList = await query.orderBy(desc(products.createdAt));

    // Apply JS-level filters for complex joins (category slug, cert bodies)
    if (filters.categorySlug) {
      const cat = await this.getCategoryBySlug(filters.categorySlug);
      if (cat) productList = productList.filter((p) => p.categoryId === cat.id);
    }
    if (filters.packagingType) {
      productList = productList.filter((p) => p.packagingType === filters.packagingType);
    }
    if (filters.minScore !== undefined) {
      productList = productList.filter((p) => (p.computedSustainabilityScore ?? 0) >= filters.minScore!);
    }
    if (filters.hasCarbonData) {
      productList = productList.filter((p) => p.carbonFootprint !== null);
    }
    if (filters.manufacturingCountry) {
      productList = productList.filter((p) => p.manufacturingCountry === filters.manufacturingCountry);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      productList = productList.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q)
      );
    }

    const enriched = await Promise.all(productList.map((p) => this.enrichProduct(p)));

    // Filter by certification bodies after enrichment
    let result = enriched;
    if (filters.certificationBodyIds && filters.certificationBodyIds.length > 0) {
      result = result.filter((p) =>
        p.certifications.some((c) => filters.certificationBodyIds!.includes(c.id))
      );
    }

    // Sort
    switch (filters.sort) {
      case "score_desc":
        result.sort((a, b) => (b.computedSustainabilityScore ?? 0) - (a.computedSustainabilityScore ?? 0));
        break;
      case "carbon_asc":
        result.sort((a, b) => parseFloat(a.carbonFootprint ?? "999") - parseFloat(b.carbonFootprint ?? "999"));
        break;
      case "price_asc":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_desc":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "rating_desc":
        result.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
        break;
      default:
        break;
    }

    // Pagination
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 48;
    return result.slice((page - 1) * limit, page * limit);
  }

  async getProductsFeatured(): Promise<ProductWithDetails[]> {
    const productList = await db
      .select()
      .from(products)
      .where(and(eq(products.isPublished, true), eq(products.inStock, true)))
      .orderBy(desc(products.computedSustainabilityScore))
      .limit(12);
    return Promise.all(productList.map((p) => this.enrichProduct(p)));
  }

  async getProduct(id: string): Promise<ProductWithDetails | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!result[0]) return undefined;
    return this.enrichProduct(result[0]);
  }

  async getProductBySlug(slug: string): Promise<ProductWithDetails | undefined> {
    const result = await db
      .select()
      .from(products)
      .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
      .limit(1);
    if (!result[0]) return undefined;
    return this.enrichProduct(result[0]);
  }

  async getProductsByCategory(categoryId: string): Promise<ProductWithDetails[]> {
    const productList = await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isPublished, true)))
      .orderBy(desc(products.createdAt));
    return Promise.all(productList.map((p) => this.enrichProduct(p)));
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.sellerId, sellerId));
  }

  private async enrichProduct(product: Product): Promise<ProductWithDetails> {
    const seller = await db.select().from(users).where(eq(users.id, product.sellerId)).limit(1);
    const category = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);

    // Get verified seller certifications (not product certs)
    const sellerCerts = seller[0]
      ? await db
          .select()
          .from(sellerCertifications)
          .where(and(eq(sellerCertifications.userId, seller[0].id), eq(sellerCertifications.isActive, true)))
      : [];

    const certBodies = await Promise.all(
      sellerCerts.map((sc) =>
        db.select().from(certificationBodies).where(eq(certificationBodies.id, sc.certificationBodyId)).limit(1)
      )
    );

    const reviewStats = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})::float`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, product.id));

    return {
      ...product,
      seller: seller[0]
        ? {
            id: seller[0].id,
            sellerName: seller[0].sellerName,
            sellerSlug: seller[0].sellerSlug,
            verificationStatus: seller[0].verificationStatus,
            profileImageUrl: seller[0].profileImageUrl,
          }
        : { id: "", sellerName: null, sellerSlug: null, verificationStatus: "unverified", profileImageUrl: null },
      category: category[0]!,
      certifications: sellerCerts
        .map((sc, i) => {
          const body = certBodies[i]?.[0];
          if (!body) return null;
          return { ...sc, certificationBody: body };
        })
        .filter(Boolean) as any[],
      sellerName: seller[0]?.sellerName ?? null,
      sellerSlug: seller[0]?.sellerSlug ?? null,
      averageRating: reviewStats[0]?.avgRating || 0,
      reviewCount: reviewStats[0]?.count || 0,
    };
  }

  async createProduct(product: InsertProduct, certificationIds?: string[]): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();
    if (certificationIds && certificationIds.length > 0) {
      await db.insert(productCertifications).values(
        certificationIds.map((certId) => ({ productId: result.id, certificationId: certId }))
      );
    }
    return result;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    // Prevent overwriting computed fields
    const { computedSustainabilityScore: _s, scoreComputedAt: _t, ...safeData } = data as any;
    const result = await db.update(products).set({ ...safeData, updatedAt: new Date() }).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(productCertifications).where(eq(productCertifications.productId, id));
    await db.delete(products).where(eq(products.id, id));
  }

  // Reviews
  async getProductReviews(productId: string): Promise<ReviewWithUser[]> {
    const reviewList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    return Promise.all(
      reviewList.map(async (review) => {
        const user = await db.select().from(users).where(eq(users.id, review.userId)).limit(1);
        return {
          ...review,
          user: user[0]
            ? { id: user[0].id, firstName: user[0].firstName, lastName: user[0].lastName, profileImageUrl: user[0].profileImageUrl }
            : { id: "", firstName: null, lastName: null, profileImageUrl: null },
        };
      })
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    return result;
  }

  // Cart
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.createdAt));
    return Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return { ...item, product: product[0]! };
      })
    );
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    const result = await db.select().from(cartItems).where(eq(cartItems.id, id)).limit(1);
    return result[0];
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)))
      .limit(1);
    if (existing[0]) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }
    const [result] = await db.insert(cartItems).values(item).returning();
    return result;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const result = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return result[0];
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Wishlist
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    const items = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt));
    return Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return { ...item, product: product[0]! };
      })
    );
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, item.userId), eq(wishlistItems.productId, item.productId)))
      .limit(1);
    if (existing[0]) return existing[0];
    const [result] = await db.insert(wishlistItems).values(item).returning();
    return result;
  }

  async removeFromWishlist(id: string): Promise<void> {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
  }

  async getWishlistCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId));
    return result[0]?.count || 0;
  }

  // Orders
  async getOrders(userId: string): Promise<OrderWithItems[]> {
    const orderList = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    return Promise.all(orderList.map((order) => this.enrichOrder(order)));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!result[0]) return undefined;
    return this.enrichOrder(result[0]);
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.paymentIntentId, paymentIntentId)).limit(1);
    return result[0];
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    const sellerProducts = await db.select({ id: products.id }).from(products).where(eq(products.sellerId, sellerId));
    const productIds = sellerProducts.map((p) => p.id);
    if (productIds.length === 0) return [];
    const sellerOrderItems = await db.select({ orderId: orderItems.orderId }).from(orderItems).where(inArray(orderItems.productId, productIds));
    const orderIds = Array.from(new Set(sellerOrderItems.map((oi) => oi.orderId)));
    if (orderIds.length === 0) return [];
    return db.select().from(orders).where(inArray(orders.id, orderIds)).orderBy(desc(orders.createdAt));
  }

  private async enrichOrder(order: Order): Promise<OrderWithItems> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return { ...item, product: product[0]! };
      })
    );
    return { ...order, items: itemsWithProducts };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const result = await db.update(orders).set({ ...data, updatedAt: new Date() }).where(eq(orders.id, id)).returning();
    return result[0];
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [result] = await db.insert(orderItems).values(item).returning();
    return result;
  }

  // Replacement guides
  async getReplacementGuides(): Promise<ReplacementGuide[]> {
    return db.select().from(replacementGuides).where(eq(replacementGuides.isActive, true));
  }

  async getReplacementGuide(slug: string): Promise<ReplacementGuide | undefined> {
    const result = await db.select().from(replacementGuides).where(eq(replacementGuides.slug, slug)).limit(1);
    return result[0];
  }

  async createReplacementGuide(guide: InsertReplacementGuide): Promise<ReplacementGuide> {
    const [result] = await db.insert(replacementGuides).values(guide).returning();
    return result;
  }

  // Challenges
  async getChallenges(activeOnly = false): Promise<Challenge[]> {
    const now = new Date();
    if (activeOnly) {
      return db
        .select()
        .from(challenges)
        .where(and(eq(challenges.isActive, true), lte(challenges.startDate, now), gte(challenges.endDate, now)));
    }
    return db.select().from(challenges).where(eq(challenges.isActive, true)).orderBy(desc(challenges.startDate));
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const result = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
    return result[0];
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [result] = await db.insert(challenges).values(challenge).returning();
    return result;
  }

  async updateChallenge(id: string, data: Partial<Challenge>): Promise<Challenge | undefined> {
    const result = await db.update(challenges).set(data).where(eq(challenges.id, id)).returning();
    return result[0];
  }

  async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    const existing = await db
      .select()
      .from(challengeParticipants)
      .where(and(eq(challengeParticipants.challengeId, challengeId), eq(challengeParticipants.userId, userId)))
      .limit(1);
    if (existing[0]) return existing[0];
    const [result] = await db.insert(challengeParticipants).values({ challengeId, userId }).returning();
    return result;
  }

  async getChallengeParticipants(challengeId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.challengeId, challengeId));
    return result[0]?.count || 0;
  }

  async getUserChallenges(userId: string): Promise<ChallengeParticipant[]> {
    return db.select().from(challengeParticipants).where(eq(challengeParticipants.userId, userId));
  }

  // Product Q&A
  async getProductQA(productId: string, approvedOnly = true): Promise<ProductQA[]> {
    const conditions = approvedOnly
      ? and(eq(productQA.productId, productId), eq(productQA.isApproved, true))
      : eq(productQA.productId, productId);
    return db.select().from(productQA).where(conditions).orderBy(desc(productQA.createdAt));
  }

  async createProductQA(qa: InsertProductQA): Promise<ProductQA> {
    const [result] = await db.insert(productQA).values(qa).returning();
    return result;
  }

  async updateProductQA(id: string, data: Partial<ProductQA>): Promise<ProductQA | undefined> {
    const result = await db.update(productQA).set(data).where(eq(productQA.id, id)).returning();
    return result[0];
  }

  async getPendingQA(): Promise<(ProductQA & { product: Pick<Product, "id" | "name" | "slug"> })[]> {
    const pending = await db.select().from(productQA).where(eq(productQA.isApproved, false)).orderBy(desc(productQA.createdAt));
    return Promise.all(
      pending.map(async (qa) => {
        const product = await db.select().from(products).where(eq(products.id, qa.productId)).limit(1);
        return {
          ...qa,
          product: product[0]
            ? { id: product[0].id, name: product[0].name, slug: product[0].slug }
            : { id: "", name: "", slug: "" },
        };
      })
    );
  }

  // Seller public profile
  async getSellerProfile(slug: string): Promise<PublicSellerProfile | undefined> {
    const user = await db.select().from(users).where(eq(users.sellerSlug, slug)).limit(1);
    if (!user[0]) return undefined;
    return this.buildSellerProfile(user[0]);
  }

  async getSellerProfileById(id: string): Promise<PublicSellerProfile | undefined> {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user[0]) return undefined;
    return this.buildSellerProfile(user[0]);
  }

  async getUserByStripeAccount(stripeAccountId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.stripeAccountId, stripeAccountId)).limit(1);
    return result[0];
  }

  async updateUserByStripeAccount(stripeAccountId: string, data: Partial<User>): Promise<void> {
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.stripeAccountId, stripeAccountId));
  }

  async updateUserByStripeCustomer(customerId: string, data: Partial<User>): Promise<void> {
    await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.stripeCustomerId, customerId));
  }

  private async buildSellerProfile(user: User): Promise<PublicSellerProfile> {
    const certs = await db
      .select()
      .from(sellerCertifications)
      .where(and(eq(sellerCertifications.userId, user.id), eq(sellerCertifications.isActive, true)));

    const certsWithBodies = await Promise.all(
      certs.map(async (cert) => {
        const body = await db.select().from(certificationBodies).where(eq(certificationBodies.id, cert.certificationBodyId)).limit(1);
        return { ...cert, certificationBody: body[0]! };
      })
    );

    const productCountResult = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(products)
      .where(and(eq(products.sellerId, user.id), eq(products.isPublished, true)));

    const avgScoreResult = await db
      .select({ avg: sql<number>`AVG(${products.computedSustainabilityScore})::float` })
      .from(products)
      .where(and(eq(products.sellerId, user.id), eq(products.isPublished, true)));

    return {
      id: user.id,
      sellerName: user.sellerName,
      sellerSlug: user.sellerSlug,
      sellerMission: user.sellerMission,
      sellerStory: user.sellerStory,
      sellerLocation: user.sellerLocation,
      sellerFoundedYear: user.sellerFoundedYear,
      profileImageUrl: user.profileImageUrl,
      verificationStatus: user.verificationStatus,
      stripeAccountId: user.stripeAccountId,
      stripeAccountStatus: user.stripeAccountStatus,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      certifications: certsWithBodies,
      productCount: productCountResult[0]?.count ?? 0,
      averageScore: Math.round(avgScoreResult[0]?.avg ?? 0),
    };
  }
}

export const storage = new DatabaseStorage();
