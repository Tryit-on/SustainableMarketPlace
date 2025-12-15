import { db } from "./db";
import { eq, and, desc, sql, ilike, inArray } from "drizzle-orm";
import {
  users,
  products,
  categories,
  certifications,
  productCertifications,
  reviews,
  cartItems,
  wishlistItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Certification,
  type InsertCertification,
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
  type ProductWithDetails,
  type CartItemWithProduct,
  type WishlistItemWithProduct,
  type OrderWithItems,
  type ReviewWithUser,
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

  // Certifications
  getCertifications(): Promise<Certification[]>;
  getCertification(id: string): Promise<Certification | undefined>;
  createCertification(cert: InsertCertification): Promise<Certification>;

  // Products
  getProducts(): Promise<ProductWithDetails[]>;
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
  getSellerOrders(sellerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
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
        target: users.id,
        set: {
          email: userData.email,
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

  // Certifications
  async getCertifications(): Promise<Certification[]> {
    return db.select().from(certifications);
  }

  async getCertification(id: string): Promise<Certification | undefined> {
    const result = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
    return result[0];
  }

  async createCertification(cert: InsertCertification): Promise<Certification> {
    const [result] = await db.insert(certifications).values(cert).returning();
    return result;
  }

  // Products
  async getProducts(): Promise<ProductWithDetails[]> {
    const productList = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    return Promise.all(productList.map((p) => this.enrichProduct(p)));
  }

  async getProduct(id: string): Promise<ProductWithDetails | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!result[0]) return undefined;
    return this.enrichProduct(result[0]);
  }

  async getProductBySlug(slug: string): Promise<ProductWithDetails | undefined> {
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!result[0]) return undefined;
    return this.enrichProduct(result[0]);
  }

  async getProductsByCategory(categoryId: string): Promise<ProductWithDetails[]> {
    const productList = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));

    return Promise.all(productList.map((p) => this.enrichProduct(p)));
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.sellerId, sellerId));
  }

  private async enrichProduct(product: Product): Promise<ProductWithDetails> {
    // Get seller
    const seller = await db.select().from(users).where(eq(users.id, product.sellerId)).limit(1);

    // Get category
    const category = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);

    // Get certifications
    const prodCerts = await db
      .select({ certification: certifications })
      .from(productCertifications)
      .innerJoin(certifications, eq(productCertifications.certificationId, certifications.id))
      .where(eq(productCertifications.productId, product.id));

    // Get review stats
    const reviewStats = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})::float`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.productId, product.id));

    return {
      ...product,
      seller: seller[0] ? {
        id: seller[0].id,
        sellerName: seller[0].sellerName,
        sellerVerified: seller[0].sellerVerified,
        profileImageUrl: seller[0].profileImageUrl,
      } : { id: '', sellerName: null, sellerVerified: null, profileImageUrl: null },
      category: category[0]!,
      certifications: prodCerts.map((pc) => pc.certification),
      averageRating: reviewStats[0]?.avgRating || 0,
      reviewCount: reviewStats[0]?.count || 0,
    };
  }

  async createProduct(product: InsertProduct, certificationIds?: string[]): Promise<Product> {
    const [result] = await db.insert(products).values(product).returning();

    if (certificationIds && certificationIds.length > 0) {
      await db.insert(productCertifications).values(
        certificationIds.map((certId) => ({
          productId: result.id,
          certificationId: certId,
        }))
      );
    }

    return result;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const result = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
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
          user: user[0] ? {
            id: user[0].id,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            profileImageUrl: user[0].profileImageUrl,
          } : { id: '', firstName: null, lastName: null, profileImageUrl: null },
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
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));

    return Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return {
          ...item,
          product: product[0]!,
        };
      })
    );
  }

  async getCartItem(id: string): Promise<CartItem | undefined> {
    const result = await db.select().from(cartItems).where(eq(cartItems.id, id)).limit(1);
    return result[0];
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, item.userId), eq(cartItems.productId, item.productId)))
      .limit(1);

    if (existing[0]) {
      // Update quantity
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
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
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
    const items = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));

    return Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return {
          ...item,
          product: product[0]!,
        };
      })
    );
  }

  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, item.userId), eq(wishlistItems.productId, item.productId)))
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }

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
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return Promise.all(orderList.map((order) => this.enrichOrder(order)));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!result[0]) return undefined;
    return this.enrichOrder(result[0]);
  }

  async getSellerOrders(sellerId: string): Promise<Order[]> {
    const sellerProducts = await db.select({ id: products.id }).from(products).where(eq(products.sellerId, sellerId));
    const productIds = sellerProducts.map((p) => p.id);

    if (productIds.length === 0) return [];

    const sellerOrderItems = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .where(inArray(orderItems.productId, productIds));

    const orderIds = [...new Set(sellerOrderItems.map((oi) => oi.orderId))];

    if (orderIds.length === 0) return [];

    return db.select().from(orders).where(inArray(orders.id, orderIds)).orderBy(desc(orders.createdAt));
  }

  private async enrichOrder(order: Order): Promise<OrderWithItems> {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return {
          ...item,
          product: product[0]!,
        };
      })
    );

    return {
      ...order,
      items: itemsWithProducts,
    };
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await db.insert(orders).values(order).returning();
    return result;
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order | undefined> {
    const result = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [result] = await db.insert(orderItems).values(item).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
