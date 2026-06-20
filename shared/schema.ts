import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isAdmin: boolean("is_admin").default(false),
  isSeller: boolean("is_seller").default(false),
  // M0: Verification gate — replaces old sellerVerified boolean
  verificationStatus: varchar("verification_status").default("unverified"), // unverified | pending | verified | rejected
  sellerName: varchar("seller_name"),
  sellerSlug: varchar("seller_slug").unique(),
  sellerDescription: text("seller_description"),
  // M3: Seller profile enrichment
  sellerMission: text("seller_mission"),
  sellerStory: text("seller_story"),
  sellerLocation: varchar("seller_location"),
  sellerFoundedYear: integer("seller_founded_year"),
  // M6: Buyer lifetime impact
  lifetimeCarbonOffsetKg: decimal("lifetime_carbon_offset_kg", { precision: 10, scale: 3 }).default("0"),
  lifetimeCarbonAvoidedKg: decimal("lifetime_carbon_avoided_kg", { precision: 10, scale: 3 }).default("0"),
  lifetimeCertifiedProducts: integer("lifetime_certified_products").default(0),
  // Monetization: Stripe Connect (seller payouts)
  stripeAccountId: varchar("stripe_account_id"),
  stripeAccountStatus: varchar("stripe_account_status"), // null | pending | active | restricted
  // Monetization: Subscription tiers
  subscriptionTier: varchar("subscription_tier").default("starter"), // starter | pro
  subscriptionStatus: varchar("subscription_status"), // null | active | cancelled | past_due
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories — locked zero-waste taxonomy
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  parentSlug: varchar("parent_slug"), // for sub-categories
});

// M1: Certification body registry — seeded, not user-editable
export const certificationBodies = pgTable("certification_bodies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  country: varchar("country"),
  category: varchar("category"), // organic | fairtrade | bcorp | plasticfree | vegan | cruelty_free | environmental | social
  verificationUrl: varchar("verification_url"),
  logoUrl: varchar("logo_url"),
  isActive: boolean("is_active").default(true),
});

// M1: Seller verification applications
export const sellerApplications = pgTable("seller_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  businessWebsite: varchar("business_website"),
  businessDescription: text("business_description").notNull(),
  productCategories: text("product_categories").array(),
  status: varchar("status").default("pending"), // pending | approved | rejected | info_requested
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
});

// M1: Certification documents uploaded by sellers
export const certificationDocuments = pgTable("certification_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").references(() => sellerApplications.id),
  certificationBodyId: varchar("certification_body_id").references(() => certificationBodies.id),
  certificationNumber: varchar("certification_number"),
  documentUrl: varchar("document_url").notNull(),
  documentType: varchar("document_type"), // pdf | image
  expiryDate: timestamp("expiry_date"),
  status: varchar("status").default("pending"), // pending | verified | rejected | expired
  adminNotes: text("admin_notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// M1: Active verified certifications for a seller (post-approval)
export const sellerCertifications = pgTable("seller_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  certificationBodyId: varchar("certification_body_id").notNull().references(() => certificationBodies.id),
  documentId: varchar("document_id").references(() => certificationDocuments.id),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table — extended with M2 scoring + M4 carbon fields
export const products = pgTable(
  "products",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    sellerId: varchar("seller_id").notNull().references(() => users.id),
    categoryId: varchar("category_id").notNull().references(() => categories.id),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
    imageUrl: varchar("image_url"),
    images: text("images").array(),
    // M0: Publish gate — false until seller is verified
    isPublished: boolean("is_published").default(false),
    rejectionReason: text("rejection_reason"),
    // M2: Computed score (never seller-editable)
    computedSustainabilityScore: integer("computed_sustainability_score").default(0),
    scoreComputedAt: timestamp("score_computed_at"),
    // M2: Seller-declared sustainability inputs (admin spot-checked)
    packagingType: varchar("packaging_type"), // plastic_free | minimal_plastic | recycled | standard
    packagingMaterials: text("packaging_materials"),
    endOfLife: varchar("end_of_life"), // compostable | recyclable | landfill | mixed
    manufacturingCountry: varchar("manufacturing_country"),
    materials: text("materials"),
    lifecycle: text("lifecycle"),
    // M4: Carbon data with method + source
    carbonFootprint: decimal("carbon_footprint", { precision: 10, scale: 2 }),
    carbonFootprintMethod: varchar("carbon_footprint_method"), // lca_verified | category_default
    carbonFootprintSource: text("carbon_footprint_source"),
    lcaDocumentUrl: varchar("lca_document_url"),
    inStock: boolean("in_stock").default(true),
    stockQuantity: integer("stock_quantity").default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_products_published").on(table.isPublished),
    index("idx_products_seller").on(table.sellerId),
    index("idx_products_category").on(table.categoryId),
    index("idx_products_score").on(table.computedSustainabilityScore),
    index("idx_products_packaging").on(table.packagingType),
  ]
);

// Product certifications junction — kept for product-level cert display
export const productCertifications = pgTable("product_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  certificationId: varchar("certification_id").notNull().references(() => certificationBodies.id),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  title: varchar("title"),
  content: text("content"),
  helpful: integer("helpful").default(0),
  verifiedPurchase: boolean("verified_purchase").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cart items
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist items
export const wishlistItems = pgTable("wishlist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders — extended with M4 carbon integrity fields
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address"),
  paymentIntentId: varchar("payment_intent_id"),
  // M4: Real carbon data
  carbonKgTotal: decimal("carbon_kg_total", { precision: 10, scale: 3 }),
  offsetRequested: boolean("offset_requested").default(false),
  offsetConfirmationId: varchar("offset_confirmation_id"),
  offsetProviderUrl: varchar("offset_provider_url"),
  offsetAmountCharged: decimal("offset_amount_charged", { precision: 10, scale: 2 }),
  carbonOffsetProvider: varchar("carbon_offset_provider"),
  // Monetization: commission tracking
  platformFeeAmount: decimal("platform_fee_amount", { precision: 10, scale: 2 }),
  sellerPayoutAmount: decimal("seller_payout_amount", { precision: 10, scale: 2 }),
  stripeChargeId: varchar("stripe_charge_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

// M5: Replacement guides — "I want to replace my ___"
export const replacementGuides = pgTable("replacement_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conventionalItem: varchar("conventional_item").notNull(),
  slug: varchar("slug").notNull().unique(),
  headline: varchar("headline").notNull(),
  categorySlug: varchar("category_slug"),
  filterOverrides: jsonb("filter_overrides"),
  seoDescription: text("seo_description"),
  conventionalCarbonKgPerYear: decimal("conventional_carbon_kg_per_year", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
});

// M7: Community challenges
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  completionCondition: jsonb("completion_condition").notNull(),
  rewardDescription: varchar("reward_description"),
  rewardCode: varchar("reward_code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// M7: Challenge participants
export const challengeParticipants = pgTable("challenge_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  rewardIssuedAt: timestamp("reward_issued_at"),
});

// M7: Product Q&A (admin-moderated)
export const productQA = pgTable("product_qa", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  askerId: varchar("asker_id").references(() => users.id),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredBy: varchar("answered_by").references(() => users.id),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  answeredAt: timestamp("answered_at"),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  reviews: many(reviews),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  orders: many(orders),
  sellerApplications: many(sellerApplications),
  certificationDocuments: many(certificationDocuments),
  sellerCertifications: many(sellerCertifications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, { fields: [products.sellerId], references: [users.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  reviews: many(reviews),
  certifications: many(productCertifications),
  qa: many(productQA),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const certificationBodiesRelations = relations(certificationBodies, ({ many }) => ({
  sellerCertifications: many(sellerCertifications),
  documents: many(certificationDocuments),
}));

export const sellerApplicationsRelations = relations(sellerApplications, ({ one, many }) => ({
  user: one(users, { fields: [sellerApplications.userId], references: [users.id] }),
  documents: many(certificationDocuments),
}));

export const certificationDocumentsRelations = relations(certificationDocuments, ({ one }) => ({
  user: one(users, { fields: [certificationDocuments.userId], references: [users.id] }),
  application: one(sellerApplications, { fields: [certificationDocuments.applicationId], references: [sellerApplications.id] }),
  certificationBody: one(certificationBodies, { fields: [certificationDocuments.certificationBodyId], references: [certificationBodies.id] }),
}));

export const sellerCertificationsRelations = relations(sellerCertifications, ({ one }) => ({
  user: one(users, { fields: [sellerCertifications.userId], references: [users.id] }),
  certificationBody: one(certificationBodies, { fields: [sellerCertifications.certificationBodyId], references: [certificationBodies.id] }),
  document: one(certificationDocuments, { fields: [sellerCertifications.documentId], references: [certificationDocuments.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const productCertificationsRelations = relations(productCertifications, ({ one }) => ({
  product: one(products, { fields: [productCertifications.productId], references: [products.id] }),
  certificationBody: one(certificationBodies, { fields: [productCertifications.certificationId], references: [certificationBodies.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, { fields: [cartItems.userId], references: [users.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, { fields: [wishlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [wishlistItems.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  participants: many(challengeParticipants),
}));

export const challengeParticipantsRelations = relations(challengeParticipants, ({ one }) => ({
  challenge: one(challenges, { fields: [challengeParticipants.challengeId], references: [challenges.id] }),
  user: one(users, { fields: [challengeParticipants.userId], references: [users.id] }),
}));

export const productQARelations = relations(productQA, ({ one }) => ({
  product: one(products, { fields: [productQA.productId], references: [products.id] }),
  asker: one(users, { fields: [productQA.askerId], references: [users.id] }),
}));

// ─── Insert Schemas ────────────────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertCertificationBodySchema = createInsertSchema(certificationBodies).omit({ id: true });
export const insertSellerApplicationSchema = createInsertSchema(sellerApplications).omit({ id: true, submittedAt: true, reviewedAt: true, reviewedBy: true });
export const insertCertificationDocumentSchema = createInsertSchema(certificationDocuments).omit({ id: true, createdAt: true, verifiedAt: true });
export const insertSellerCertificationSchema = createInsertSchema(sellerCertifications).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true, computedSustainabilityScore: true, scoreComputedAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true, createdAt: true });
export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertReplacementGuideSchema = createInsertSchema(replacementGuides).omit({ id: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true });
export const insertProductQASchema = createInsertSchema(productQA).omit({ id: true, createdAt: true, answeredAt: true });

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type CertificationBody = typeof certificationBodies.$inferSelect;
export type InsertCertificationBody = z.infer<typeof insertCertificationBodySchema>;

export type SellerApplication = typeof sellerApplications.$inferSelect;
export type InsertSellerApplication = z.infer<typeof insertSellerApplicationSchema>;

export type CertificationDocument = typeof certificationDocuments.$inferSelect;
export type InsertCertificationDocument = z.infer<typeof insertCertificationDocumentSchema>;

export type SellerCertification = typeof sellerCertifications.$inferSelect;
export type InsertSellerCertification = z.infer<typeof insertSellerCertificationSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type ReplacementGuide = typeof replacementGuides.$inferSelect;
export type InsertReplacementGuide = z.infer<typeof insertReplacementGuideSchema>;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;

export type ProductQA = typeof productQA.$inferSelect;
export type InsertProductQA = z.infer<typeof insertProductQASchema>;

// ─── Extended / Composite Types ───────────────────────────────────────────────

export type ProductWithDetails = Product & {
  seller: Pick<User, "id" | "sellerName" | "sellerSlug" | "verificationStatus" | "profileImageUrl">;
  category: Category;
  certifications: (SellerCertification & { certificationBody: CertificationBody })[];
  averageRating?: number;
  reviewCount?: number;
  scoreBreakdown?: ScoreBreakdown;
  // Convenience fields flattened from seller
  sellerName?: string | null;
  sellerSlug?: string | null;
};

export type ScoreBreakdown = {
  packaging: { earned: number; max: number; label: string };
  certifications: { earned: number; max: number; label: string };
  materials: { earned: number; max: number; label: string };
  endOfLife: { earned: number; max: number; label: string };
  manufacturingLocation: { earned: number; max: number; label: string };
  carbonDataCompleteness: { earned: number; max: number; label: string };
  total: number;
  tier: "Exceptional" | "Strong" | "Good" | "Developing" | "Unrated";
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type WishlistItemWithProduct = WishlistItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "firstName" | "lastName" | "profileImageUrl">;
};

export type SellerApplicationWithDocs = SellerApplication & {
  user: Pick<User, "id" | "email" | "firstName" | "lastName">;
  documents: (CertificationDocument & { certificationBody: CertificationBody | null })[];
};

export type PublicSellerProfile = Pick<
  User,
  | "id"
  | "sellerName"
  | "sellerSlug"
  | "sellerMission"
  | "sellerStory"
  | "sellerLocation"
  | "sellerFoundedYear"
  | "profileImageUrl"
  | "verificationStatus"
  | "stripeAccountId"
  | "stripeAccountStatus"
  | "subscriptionTier"
  | "subscriptionStatus"
> & {
  certifications: (SellerCertification & { certificationBody: CertificationBody })[];
  productCount: number;
  averageScore: number;
};
