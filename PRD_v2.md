# GreenMart PRD v2.0 — Trust-First Zero-Waste Marketplace
**Version:** 2.0  
**Date:** 2026-05-18  
**Stack:** Vite + React + Express + Drizzle ORM + PostgreSQL + Stripe  

---

## 1. Strategic Context

### 1.1 The Problem with v1
GreenMart v1 is a generic marketplace with green branding. Its sustainability scores are self-reported integers with no enforcement. Its certification badges are display-only fields any seller can populate. Its carbon offset is priced without a real partner. Its community is hardcoded mockup data. None of the differentiators are structurally enforced — they are aesthetic, not architectural.

### 1.2 The Repositioning
GreenMart v2 becomes the **trust-first zero-waste marketplace** for home and personal care. The value proposition hardens: a "GreenMart Verified" badge requires documented third-party certification. A seller cannot claim organic without uploading a Soil Association certificate reviewed by an admin. A sustainability score is computed from verified inputs, not seller-entered. The badge becomes a signal eco-sellers *want* on their own websites, making listing on GreenMart worth it independent of traffic.

### 1.3 Niche Focus
**Category:** Zero-waste home & personal care  
**Examples:** reusable kitchen wraps, shampoo bars, bamboo toothbrushes, compostable cleaning products, package-free refill products, natural fibre textiles for the home  
**Why this niche:**
- High repeat purchase frequency (consumables = retention, not one-and-done)
- Products are objectively verifiable (plastic-free is visible; organic has certification bodies)
- Buyer intent is specific and high (replacing known items, not browsing)
- Weaker competition than sustainable fashion or organic food

---

## 2. User Personas

### 2.1 The Conscious Switcher (Primary Buyer)
Age 26–40. Already committed to reducing waste. Currently buys piecemeal across multiple brand sites and zero-waste blogs. Pain: fragmented discovery, can't verify claims, no single trusted source. Willing to pay 15–30% premium for verified eco credentials. High lifetime value if retained.

### 2.2 The Eco Seller (Primary Seller)
Small-to-medium DTC brand (1–50 employees). Already certified (B Corp, Fair Trade, Soil Association, etc.) but those badges get lost in Amazon/Etsy's noise. Pain: existing platforms charge high fees without amplifying their sustainability story. Wants to reach buyers who value what they've worked to achieve. The "GreenMart Verified" badge is a marketing asset, not just a listing requirement.

### 2.3 The Platform Admin
Internal operator responsible for verifying seller certification documents, approving/rejecting applications, managing categories, and monitoring platform quality. Needs a dedicated admin dashboard, not direct database access.

---

## 3. Guiding Principles

1. **Trust is structural, not cosmetic.** No badge renders unless it is verified. No score displays unless it is computed from verified inputs.
2. **Seller credibility is the product.** Buyers come because sellers are worth trusting. GTM runs through seller acquisition, not buyer acquisition.
3. **Narrow beats broad.** Every feature decision defaults to zero-waste home & personal care. Expand only after this niche is saturated.
4. **Honest metrics only.** No fabricated "50K products / 2M trees" copy until the numbers are real.
5. **Carbon features ship real or don't ship.** The offset integration has a verified third-party partner or it is removed.

---

## 4. Module Sequence Overview

| Module | Name | Effort | Dependency |
|--------|------|--------|------------|
| M0 | Foundation Reset | 1 week | None |
| M1 | Seller Verification Pipeline | 3 weeks | M0 |
| M2 | Computed Sustainability Score | 2 weeks | M1 |
| M3 | Seller Value Dashboard | 3 weeks | M1, M2 |
| M4 | Carbon Integrity Integration | 2 weeks | M1 |
| M5 | Buyer Discovery & Comparison | 3 weeks | M2, M4 |
| M6 | Buyer Impact Dashboard | 2 weeks | M4, M5 |
| M7 | Real Community System | 3 weeks | M6 |
| M8 | Growth & SEO Infrastructure | 2 weeks | M5, M7 |

---

## 5. Module 0 — Foundation Reset

**Goal:** Remove all claims and UI that are currently dishonest or misleading. Establish the niche. Create the structural preconditions for M1.

### 5.1 Content & Copy Changes

#### Landing.tsx
- Remove hardcoded trust indicators: "1000+ Verified Sellers", "Carbon-Neutral Shipping", "Fair Trade Certified" — replace with: "Certified Sellers Only", "Real Carbon Data", "Verified Before Listed"
- Remove hardcoded impact stats: "50K+ Eco Products", "2M+ Trees Planted", "100K+ Tons CO2 Saved", "150+ Countries Served" — replace with a single honest statement: "Every seller on GreenMart is certification-verified before their first product goes live."
- Hero headline: "Shop Zero-Waste. Live Plastic-Free." (replaces generic "Shop Sustainably. Live Consciously.")
- Subheadline: "Certified zero-waste home and personal care products from sellers we've actually verified."

#### CarbonFootprintCalculator.tsx
- Remove carbon offset checkbox entirely until M4 is complete. Replace with a static informational note: "Carbon offset integration coming soon — we'll only offer it when it's real."
- The shipping carbon display (kg CO2 per method) is accurate enough to retain.

#### Community.tsx
- Remove entire page from navigation. Redirect `/community` to `/coming-soon`. Will be rebuilt in M7.

### 5.2 Category Schema Reset

Replace the current open-ended `categories` table seed data with the following locked taxonomy for zero-waste home & personal care:

```
Kitchen & Food Storage
  - Reusable wraps & covers
  - Compostable bags & liners
  - Reusable bottles & containers
  - Package-free pantry staples

Bathroom & Personal Care
  - Shampoo & conditioner bars
  - Plastic-free oral care
  - Natural skincare & soap
  - Reusable personal care items

Cleaning & Laundry
  - Concentrated/refillable cleaners
  - Natural scrubbers & cloths
  - Compostable sponges
  - Plastic-free laundry

Home Textiles & Living
  - Natural fibre textiles
  - Sustainable candles & scents
  - Eco stationery & gifting
```

### 5.3 Seller Onboarding Gate

Add a `verificationStatus` field to the `users` table with states: `unverified | pending | verified | rejected`. Default: `unverified`.

- Only sellers with `verificationStatus = 'verified'` can have products displayed publicly.
- Products from unverified sellers are saved but hidden (add `isPublished boolean` to `products`).
- Seller dashboard shows verification status and blocks product listing until verified.

**Schema addition:**
```sql
ALTER TABLE users ADD COLUMN verification_status VARCHAR DEFAULT 'unverified';
ALTER TABLE products ADD COLUMN is_published BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN rejection_reason TEXT;
```

### 5.4 Acceptance Criteria — M0
- [ ] Landing page contains no fabricated statistics
- [ ] Carbon offset UI is removed until M4
- [ ] Community page is removed from nav
- [ ] Category taxonomy is locked to zero-waste home & personal care
- [ ] `verificationStatus` and `isPublished` fields exist in schema
- [ ] Unverified seller products do not appear in any public product listing API endpoint

---

## 6. Module 1 — Seller Verification Pipeline

**Goal:** Build the operational backbone that makes GreenMart's trust claim structural. Sellers submit certification documents; admins review and approve. No badge renders without this pipeline completing.

### 6.1 New Database Tables

```typescript
// Certification body registry (seeded, not user-editable)
certificationBodies: pgTable("certification_bodies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),          // "Soil Association Organic"
  slug: varchar("slug").notNull().unique(), // "soil-association-organic"
  country: varchar("country"),              // "GB"
  category: varchar("category"),            // "organic" | "fairtrade" | "bcorp" | "plasticfree" | "vegan" | "cruelty_free"
  verificationUrl: varchar("verification_url"), // URL to verify cert number on issuer's site
  logoUrl: varchar("logo_url"),
  isActive: boolean("is_active").default(true),
})

// Seller verification applications
sellerApplications: pgTable("seller_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  businessWebsite: varchar("business_website"),
  businessDescription: text("business_description").notNull(),
  productCategories: text("product_categories").array(), // which GreenMart categories they'll sell in
  status: varchar("status").default("pending"),  // pending | approved | rejected | info_requested
  adminNotes: text("admin_notes"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
})

// Certification documents submitted by sellers
certificationDocuments: pgTable("certification_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationId: varchar("application_id").references(() => sellerApplications.id),
  certificationBodyId: varchar("certification_body_id").references(() => certificationBodies.id),
  certificationNumber: varchar("certification_number"), // for issuer cross-check
  documentUrl: varchar("document_url").notNull(),       // S3/Cloudflare R2 URL
  documentType: varchar("document_type"),               // "pdf" | "image"
  expiryDate: timestamp("expiry_date"),
  status: varchar("status").default("pending"),         // pending | verified | rejected | expired
  adminNotes: text("admin_notes"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
})

// Verified certifications attached to a seller (post-approval)
sellerCertifications: pgTable("seller_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  certificationBodyId: varchar("certification_body_id").notNull().references(() => certificationBodies.id),
  documentId: varchar("document_id").references(() => certificationDocuments.id),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
})
```

### 6.2 Seller Application Flow (Frontend)

**Route:** `/seller/apply`

**Step 1 — Business Details**
- Business name (required)
- Business website (optional)
- Business description (min 100 chars) — what they make, how, and why it's zero-waste
- Which product categories they will sell in (multi-select from locked taxonomy)

**Step 2 — Certification Documents**
- For each certification body they hold (multi-select from seeded list):
  - Upload document (PDF or image, max 10MB)
  - Enter certification number (optional but recommended for cross-check)
  - Enter expiry date
- At least ONE certification from the approved list is required to submit
- Informational note: "We manually review every application. You'll hear back within 3 business days."

**Step 3 — Confirmation**
- Summary of submitted certifications
- Status: "Application under review"
- Email confirmation sent

**API endpoints:**
```
POST /api/seller/apply              — submit application + metadata
POST /api/seller/upload-document    — upload certification file (returns signed URL or stored URL)
GET  /api/seller/application-status — poll verification status
```

### 6.3 Admin Verification Dashboard

**Route:** `/admin` (gated by `isAdmin: boolean` on users table — add this field)

**Application Queue View**
- List of all pending applications with: business name, submitted date, number of certs uploaded, category
- Click through to full application detail

**Application Detail View**
- Business info summary
- Each certification document with:
  - Inline PDF/image viewer
  - Certification body name + link to issuer's verification page
  - Certification number (for admin to cross-check on issuer site)
  - Expiry date
  - Per-document decision: Verified / Rejected + required notes field
- Overall application decision: Approve / Reject / Request More Info
- Approval triggers:
  - `users.verificationStatus` → `'verified'`
  - `users.isSeller` → `true`
  - `sellerCertifications` rows created for each verified document
  - Automated email to seller: "You're approved — start listing"
- Rejection triggers:
  - `users.verificationStatus` → `'rejected'`
  - Email to seller with admin notes explaining the rejection
- Info Request triggers:
  - Status → `'info_requested'`
  - Email with specific questions; seller can resubmit

**Certification Expiry Monitor**
- Separate tab showing all active certifications expiring within 60 days
- One-click "Request renewal" sends automated email to seller
- Expired certifications automatically set `sellerCertifications.isActive = false` and products re-hidden

**API endpoints:**
```
GET    /api/admin/applications           — list all with filters (pending/approved/rejected)
GET    /api/admin/applications/:id       — application detail
PATCH  /api/admin/applications/:id       — update status + notes
PATCH  /api/admin/documents/:id          — verify/reject individual document
GET    /api/admin/expiring-certs         — certs expiring within N days
POST   /api/admin/certs/:id/renewal-request — send renewal email
```

### 6.4 Certification Badge Display Rules

`CertificationBadge.tsx` must be refactored:
- Only render if `sellerCertifications.isActive = true` AND `sellerCertifications.validUntil` is in the future (or null)
- Badge must source from `certificationBodies.logoUrl` (official logo, not generic icon)
- Tooltip on hover: certification body name + "Verified [date]" + "Valid until [date]"
- Expired badge: greyed out with "Verification expired" tooltip — never silently hidden, always shown as expired so buyers know it lapsed

### 6.5 Acceptance Criteria — M1
- [ ] `certificationBodies` seeded with minimum 12 bodies (Soil Association Organic, Fairtrade Foundation, B Corp, PETA Vegan, Leaping Bunny, FSC, COSMOS Organic, Rainforest Alliance, 1% for the Planet, EU Ecolabel, Zero Waste Certified, Plastic Free Trust)
- [ ] Seller can complete application and upload documents without admin intervention
- [ ] Admin can view, review, and decide on every application from the dashboard
- [ ] No certification badge renders unless backed by an active `sellerCertifications` row
- [ ] Certification expiry job runs daily and deactivates expired certs
- [ ] Sellers receive automated email on approval, rejection, and info request
- [ ] Unverified seller products are never returned by public product listing endpoints

---

## 7. Module 2 — Computed Sustainability Score

**Goal:** Replace the self-reported `sustainabilityScore integer` with a score computed deterministically from verified inputs. Make it transparent so buyers understand what it means.

### 7.1 Score Methodology

The score is 0–100, computed server-side. It is never entered by the seller.

**Scoring dimensions (weights sum to 100):**

| Dimension | Weight | Data source |
|-----------|--------|-------------|
| Packaging | 25 | Seller-declared, admin-spot-checked |
| Certifications held | 25 | Verified `sellerCertifications` rows |
| Materials / ingredients | 20 | Seller-declared with category-specific schema |
| End of life | 15 | Seller-declared (compostable / recyclable / landfill) |
| Manufacturing location | 10 | Seller-declared country; shorter = lower transport |
| Carbon data completeness | 5 | Whether `products.carbonFootprint` is populated with source |

**Packaging sub-score (25 pts):**
- Plastic-free packaging (verified): 25
- Minimal plastic + recycled content: 15
- Standard packaging with offset claim: 8
- No declaration: 0

**Certifications sub-score (25 pts):**
- 1 active cert: 10
- 2 active certs: 18
- 3+ active certs: 25

**Score tier labelling:**
- 80–100: "Exceptional"
- 60–79: "Strong"
- 40–59: "Good"
- 20–39: "Developing"
- 0–19: "Unrated"

### 7.2 New Schema Fields

```typescript
// Added to products table
packagingType: varchar("packaging_type"),        // "plastic_free" | "minimal_plastic" | "standard" | null
packagingMaterials: text("packaging_materials"), // free text description
endOfLife: varchar("end_of_life"),               // "compostable" | "recyclable" | "landfill" | "mixed"
manufacturingCountry: varchar("manufacturing_country"),
carbonFootprintSource: text("carbon_footprint_source"), // methodology or URL
computedSustainabilityScore: integer("computed_sustainability_score"), // replaces old field, read-only
scoreComputedAt: timestamp("score_computed_at"),
```

### 7.3 Score Computation

Server-side function `computeSustainabilityScore(productId)` runs:
1. On product creation/update
2. When a seller's certifications change (new cert added or cert expires)
3. On-demand via admin

The existing `sustainabilityScore` column is deprecated in favour of `computedSustainabilityScore`. All frontend reads switch to the new field.

### 7.4 Score Transparency UI

On the product detail page, below the score badge:
- Expandable "How is this scored?" section
- Shows each dimension with its earned points out of max
- Example: "Certifications: 18/25 — 2 verified certifications held"
- Link: "Learn about our scoring methodology"

**API endpoint:**
```
GET /api/products/:id/score-breakdown  — returns per-dimension breakdown
```

### 7.5 Acceptance Criteria — M2
- [ ] `computedSustainabilityScore` is never editable by sellers
- [ ] Score recomputes automatically when certifications change
- [ ] Score breakdown is accessible to buyers from product detail page
- [ ] Old `sustainabilityScore` column is dropped from public API responses
- [ ] Score tier label ("Exceptional", "Strong", etc.) displays alongside numeric score
- [ ] Admin can trigger manual score recompute for any product

---

## 8. Module 3 — Seller Value Dashboard

**Goal:** Give verified sellers a reason to prefer GreenMart over Etsy/Amazon. The dashboard makes their sustainability story tangible, measurable, and shareable.

### 8.1 Seller Dashboard Routes

All routes under `/seller/*`, accessible only to `isSeller = true` users.

**`/seller/overview`** — Summary
- Total orders, revenue, average order value (30d / 90d / all time)
- Average sustainability score across product catalogue
- Total verified carbon offset facilitated through their orders
- Certification status panel: each active cert with expiry countdown

**`/seller/products`** — Product Management
- List of all products with: name, score, published/hidden status, stock
- Inline publish/unpublish toggle
- "Score details" link per product
- Add/edit product (existing `ProductFormDialog.tsx` expanded with new schema fields: packaging type, end-of-life, manufacturing country, carbon footprint + source)

**`/seller/profile`** — Public Sustainability Profile
- Preview of their public seller profile page (see §8.2)
- Edit: seller story, mission statement, how they got certified
- Edit: certifications display order
- Manage product images

**`/seller/badge`** — Off-Platform Badge
- The GreenMart Verified badge embed (see §8.3)
- Copy-paste embed code
- Badge style selector (light / dark / minimal)

**`/seller/analytics`** — Sustainability Analytics
- Chart: sustainability score over time as certifications were added
- Chart: order carbon footprint breakdown (product vs. shipping)
- Downloadable CSV: orders with carbon data

### 8.2 Public Seller Profile Page

**Route:** `/sellers/:sellerSlug`

Replaces the sparse seller reference in `ProductWithDetails`. Each verified seller gets a full profile page:

- Hero: seller name, verified badge, mission statement
- Certifications grid: official cert logos with "Verified [date]" labels
- Sustainability score: aggregate across their catalogue
- Story section: rich text, how they make their products
- Product listings: all their active products

**Schema addition:**
```typescript
// Added to users table
sellerSlug: varchar("seller_slug").unique(),
sellerMission: text("seller_mission"),          // 1-3 sentence mission statement
sellerStory: text("seller_story"),              // longer rich text
sellerLocation: varchar("seller_location"),     // "Bristol, UK"
sellerFoundedYear: integer("seller_founded_year"),
```

### 8.3 Off-Platform Verified Badge

A static embeddable badge that sellers can put on their own website:

```html
<!-- GreenMart Verified Badge -->
<a href="https://greenmart.com/sellers/[sellerSlug]" target="_blank">
  <img src="https://greenmart.com/badges/verified/[sellerSlug].svg" 
       alt="GreenMart Verified Seller" width="160" />
</a>
```

**API endpoint:**
```
GET /api/badges/:sellerSlug.svg  — returns dynamically generated SVG badge
```

The SVG contains: GreenMart logo, "Verified Seller", seller name, and a QR-code-sized unique verification hash. Clicking through to their profile page confirms authenticity. This is the primary seller acquisition mechanism — every seller who embeds the badge on their site drives awareness.

### 8.4 Seller Onboarding Checklist

First-time seller experience post-approval. Inline checklist in the dashboard:
- [x] Application approved
- [ ] Add your first product
- [ ] Complete your seller profile (mission + story)
- [ ] Embed your GreenMart Verified badge
- [ ] Set up Stripe payouts

Progress bar at top of dashboard until all complete.

### 8.5 Acceptance Criteria — M3
- [ ] Seller dashboard is accessible only post-verification
- [ ] All product management uses the new schema fields from M2
- [ ] Public seller profile page exists for every verified seller
- [ ] Off-platform badge SVG endpoint is publicly accessible with valid sellerSlug
- [ ] Seller analytics show real data, no hardcoded values
- [ ] Onboarding checklist tracks real completion state

---

## 9. Module 4 — Carbon Integrity Integration

**Goal:** Either make carbon offset real or remove it. This module makes it real with a verified third-party partner.

### 9.1 Carbon Offset Partner

Integrate with **Gold Standard API** (primary) or **Pachama API** (alternative). Both issue verified offset credits against real reforestation and conservation projects with third-party auditing.

If neither is feasible in the build window, ship a "notify me when carbon offset launches" email capture instead of a placeholder checkbox. Do not ship a fake offset.

### 9.2 Per-Product Carbon Methodology

The `products.carbonFootprint` field must be sourced data, not a seller guess. Options (in order of credibility):

1. **Lifecycle Assessment (LCA) upload** — seller uploads a formal LCA document; admin verifies; carbon value is taken from LCA
2. **Category default factors** — if no LCA, use published category-average emission factors (sourced from ADEME / ecoinvent database, cited in the UI)
3. **No data** — if neither, `carbonFootprint` is null and product shows "Carbon data not available" rather than a fabricated number

**Schema addition:**
```typescript
// Added to products table
carbonFootprintMethod: varchar("carbon_footprint_method"), // "lca_verified" | "category_default" | null
carbonFootprintCitation: varchar("carbon_footprint_citation"), // source URL or "ADEME 2024 factor"
lcaDocumentUrl: varchar("lca_document_url"),
```

### 9.3 Order-Level Carbon Tracking

When an order is placed:
1. Sum `product.carbonFootprint * quantity` for each line item (if available)
2. Add shipping carbon from `CarbonFootprintCalculator` selection
3. Store as `orders.carbonKgTotal`
4. If buyer opted in to offset: call Gold Standard API to purchase offset credits for `carbonKgTotal`
5. Store offset confirmation: `orders.offsetConfirmationId`, `orders.offsetProviderUrl`
6. Offset cost is real (priced at current Gold Standard market rate, typically $15–40/tonne = $0.015–0.04/kg) — NOT the current $0.05/kg flat fee

**Schema changes:**
```typescript
// Replace on orders table
carbonKgTotal: decimal("carbon_kg_total", { precision: 10, scale: 3 }),
offsetRequested: boolean("offset_requested").default(false),
offsetConfirmationId: varchar("offset_confirmation_id"), // from Gold Standard
offsetProviderUrl: varchar("offset_provider_url"),       // link to project page
offsetAmountCharged: decimal("offset_amount_charged", { precision: 10, scale: 2 }),
```

### 9.4 Offset UI Changes (Checkout)

Replace the current toy checkbox with:
- Real cost based on `carbonKgTotal * currentOffsetRate` fetched from the partner API
- "What is this?" tooltip: "This charges the current Gold Standard market rate to purchase verified carbon credits, directly funding [project name]."
- After payment, order confirmation shows: offset confirmation number + link to the Gold Standard project page
- Email receipt includes offset confirmation

### 9.5 Acceptance Criteria — M4
- [ ] Carbon offset checkbox only renders if Gold Standard/Pachama API is integrated and live
- [ ] Offset cost is fetched from partner API at runtime, not hardcoded
- [ ] Every completed offset generates a retrievable confirmation ID
- [ ] Per-product carbon data shows its source method ("LCA Verified", "Category average", or "Not available")
- [ ] Category-default carbon factors are cited to a published source
- [ ] No product shows a carbon number without a corresponding `carbonFootprintMethod`

---

## 10. Module 5 — Buyer Discovery & Comparison

**Goal:** Make it fast and confident for the Conscious Switcher to find exactly what they need, filtered by what they actually trust.

### 10.1 Search & Filter Overhaul

Current `Shop.tsx` has basic filtering. Expand to:

**Filter panel (left sidebar on desktop, bottom sheet on mobile):**
- Category (locked taxonomy from M0)
- Certifications (multi-select from active `certificationBodies` — only show bodies that at least one active product holds)
- Sustainability score tier (Exceptional / Strong / Good / Developing)
- Carbon data available (toggle)
- Price range (slider)
- Packaging type (Plastic-free / Minimal plastic)
- Manufacturing location (UK / EU / Rest of World)
- In stock only (toggle, default on)

**Sort options:**
- Most relevant (default)
- Highest sustainability score
- Lowest carbon footprint
- Newest listings
- Price: low to high / high to low
- Most reviewed

**API endpoint upgrade:**
```
GET /api/products?category=&certBody=&scoreTier=&packagingType=&maxCarbon=&sort=&page=&limit=
```

### 10.2 Product Comparison Tool

Buyers can compare up to 3 products side-by-side.

**UI:** "Compare" toggle on product cards (appears on hover). Sticky comparison bar at bottom showing selected products. "Compare" button opens full comparison view.

**Comparison view columns:** for each product:
- Image, name, price
- Sustainability score (with tier colour)
- Certifications held
- Carbon footprint (product + estimated shipping)
- Packaging type
- End of life
- Manufacturing location
- Rating & review count

**Route:** `/compare?ids=id1,id2,id3`

### 10.3 "Replace This" Discovery Pattern

A landing-page feature (and dedicated route `/replace`) targeting the Conscious Switcher's specific intent. They're not browsing — they're replacing a specific household item.

**UI:** A prominent search/select widget: "I want to replace my ___" with typeahead options:
- Cling film → shows reusable beeswax wraps
- Plastic toothbrush → shows bamboo alternatives
- Liquid shampoo → shows shampoo bars
- Plastic bottles → shows reusable alternatives

This is seeded as a `replacements` lookup table: `conventional_item → category_slug + optional_filter`. Not AI-generated, curated manually to start. Drives high-intent landing pages with SEO value (see M8).

**Schema:**
```typescript
replacementGuides: pgTable("replacement_guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conventionalItem: varchar("conventional_item").notNull(), // "cling film"
  slug: varchar("slug").notNull().unique(),                 // "cling-film"
  headline: varchar("headline").notNull(),
  categorySlug: varchar("category_slug"),
  filterOverrides: jsonb("filter_overrides"),              // e.g. {"packagingType": "plastic_free"}
  seoDescription: text("seo_description"),
})
```

### 10.4 Acceptance Criteria — M5
- [ ] Filter panel renders only certification bodies that have at least one active product
- [ ] All filter combinations return correct results with O(log n) query performance (indexes on filtered columns)
- [ ] Comparison tool supports exactly 3 products, persists selection across page navigation (sessionStorage)
- [ ] "Replace This" widget is on the landing page and has its own route
- [ ] Minimum 20 replacement guides seeded at launch

---

## 11. Module 6 — Buyer Impact Dashboard

**Goal:** Give buyers a tangible, growing record of the environmental impact of their purchasing decisions. This is the primary retention mechanism.

### 11.1 Impact Dashboard Route

**`/account/impact`** — accessible to all logged-in buyers.

**Lifetime stats:**
- Total orders on GreenMart
- Total carbon kg offset (from verified offsets on orders)
- Total carbon kg avoided (sum of `product.carbonFootprint` deltas vs. conventional equivalent — sourced from `replacementGuides.conventionalItemCarbonKg`)
- Number of certified products purchased
- Visual: "equivalent to X car journeys / X flights avoided"

**Per-order history:**
- Expandable order list with per-order carbon breakdown
- Offset confirmation link for offset orders

**Milestones:**
- Visual milestone system (not a gamification layer — just honest milestones):
  - "First certified product"
  - "First carbon-offset order"
  - "10 plastic-free products"
  - "1 tonne CO2 offset"
- Email notification on milestone hit

### 11.2 Schema Additions

```typescript
// Added to users table
lifetimeCarbonOffsetKg: decimal("lifetime_carbon_offset_kg", { precision: 10, scale: 3 }).default('0'),
lifetimeCarbonAvoidedKg: decimal("lifetime_carbon_avoided_kg", { precision: 10, scale: 3 }).default('0'),
lifetimeCertifiedProducts: integer("lifetime_certified_products").default(0),
```

These are updated server-side on order completion. Never edited directly by user.

### 11.3 Shareable Impact Card

A generated image (or styled page) buyers can share: "I've offset Xkg of CO2 through GreenMart." Route: `/account/impact/share`

Simple server-side rendered SVG/HTML card, no third-party image generation needed.

### 11.4 Acceptance Criteria — M6
- [ ] Impact dashboard shows only real data sourced from completed orders
- [ ] Carbon avoided calculation is cited to a source (not fabricated)
- [ ] Milestones trigger email on first achievement only (no repeat)
- [ ] Shareable card contains no fabricated numbers
- [ ] Lifetime stats are recomputed on each order completion, not cached stale values

---

## 12. Module 7 — Real Community System

**Goal:** Replace the static mockup community with a real, operational one. Small and real beats large and fake.

### 12.1 Blog / Editorial

Integrate a headless CMS (recommended: **Sanity** with free tier, or **Contentful**). Blog content is managed by the GreenMart team, not user-generated to start.

**Post types:**
- Guide ("How to go plastic-free in your bathroom")
- Product spotlight (feature a verified seller)
- Certification explainer ("What does Soil Association Organic actually mean?")
- Impact story (a buyer's journey)

**Route:** `/learn` (replaces `/community`)  
Blog post route: `/learn/[slug]`

The "Replace This" guides from M5 are also surfaced here as editorial content, doubling as SEO landing pages.

### 12.2 Community Challenges (Real)

Challenges are no longer hardcoded. They are:
1. Created by admin in a `/admin/challenges` interface
2. Have a defined start/end date
3. Have a measurable completion condition tied to real platform actions:
   - "Buy 3 plastic-free products this month" → checked against order history
   - "Complete your first carbon-offset order" → checked against `orders.offsetRequested`
   - "Try a new product category" → checked against order `categoryId` diversity

**Schema:**
```typescript
challenges: pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  completionCondition: jsonb("completion_condition").notNull(), // {type, threshold, filters}
  rewardDescription: varchar("reward_description"),
  rewardCode: varchar("reward_code"), // discount code to issue on completion
  isActive: boolean("is_active").default(true),
})

challengeParticipants: pgTable("challenge_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  rewardIssuedAt: timestamp("reward_issued_at"),
})
```

Completion check runs as a daily job against participant order history.

### 12.3 Q&A on Product Pages

Simple, moderated Q&A section on each product page. Not a forum — just: buyers can submit questions, sellers (or admin) answer them. Questions are admin-approved before appearing.

**Schema:**
```typescript
productQA: pgTable("product_qa", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  askerId: varchar("asker_id").references(() => users.id),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredBy: varchar("answered_by").references(() => users.id),
  isApproved: boolean("is_approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  answeredAt: timestamp("answered_at"),
})
```

### 12.4 Acceptance Criteria — M7
- [ ] `/community` route is permanently replaced by `/learn`
- [ ] Blog is CMS-driven (no hardcoded post data)
- [ ] Challenge completion conditions are checked against real order data
- [ ] Reward codes are generated and emailed automatically on challenge completion
- [ ] Q&A is admin-approved before appearing publicly
- [ ] Zero hardcoded community content remains anywhere in the codebase

---

## 13. Module 8 — Growth & SEO Infrastructure

**Goal:** Create compounding organic acquisition — primarily through high-intent search traffic and seller-driven word-of-mouth.

### 13.1 SEO Technical Foundations

- Server-side rendering (SSR) or pre-rendering for all public pages: product detail, seller profile, category pages, blog posts, "replace this" guides
- `<title>` and `<meta description>` dynamically generated per-page (not the current SPA default)
- Structured data (JSON-LD) for:
  - `Product` schema on product detail pages (includes: name, price, description, aggregateRating, brand)
  - `Organization` schema on seller profile pages
  - `BreadcrumbList` on all category/product pages
  - `Article` on blog posts
- `sitemap.xml` auto-generated from: all public products, all seller profiles, all blog posts, all replacement guides, all category pages
- `robots.txt` configured correctly

### 13.2 "Replace This" SEO Landing Pages

Each `replacementGuides` entry from M5 becomes a standalone SEO landing page at `/replace/[slug]`:
- H1: "The best zero-waste alternative to [conventional item]"
- Intro paragraph (from `seoDescription`)
- Filtered product grid (from `filterOverrides`)
- Comparison with conventional: carbon impact, waste, cost over time
- Internal links to related replacement guides

These pages target navigational and commercial investigation queries ("plastic-free cling film alternative", "bamboo toothbrush UK") — the highest-intent eco consumer searches.

### 13.3 Seller Referral Programme

Sellers who embed the GreenMart Verified badge (M3) and drive traffic to their GreenMart profile get:
- Referral tracking via UTM parameters on badge links
- Commission reduction (standard rate reduced by 1–2%) for orders sourced via their own badge traffic
- Monthly referral report in seller dashboard

This turns every verified seller into a distribution channel.

### 13.4 Email Infrastructure

Transactional emails (already implied by M1–M7) consolidated into a single system. Recommended: **Resend** (simple API, generous free tier).

Email triggers:
- Seller application received confirmation
- Seller application approved (with onboarding checklist link)
- Seller application rejected (with notes)
- Certification expiry warning (60 days, 30 days, 7 days)
- Buyer order confirmation (with carbon data if available, offset confirmation if applicable)
- Challenge completion + reward code
- Milestone achievement
- Seller Q&A response notification

All emails use a shared template system (React Email or Resend templates) with GreenMart branding.

### 13.5 Acceptance Criteria — M8
- [ ] All public-facing routes have correct `<title>` and `<meta description>` tags
- [ ] Product, seller, and article JSON-LD is valid per Google's Rich Results Test
- [ ] `sitemap.xml` is auto-generated and up-to-date within 24h of new content
- [ ] Minimum 20 replacement guide landing pages live at launch
- [ ] All transactional emails go through a single provider (no ad-hoc nodemailer)
- [ ] Seller referral tracking is in place before any seller promotion campaigns run

---

## 14. Non-Functional Requirements

### 14.1 Performance
- Product listing page: first contentful paint < 1.5s on 4G
- All database queries on listing/filter endpoints: < 200ms p95 (add indexes on `products.categoryId`, `products.computedSustainabilityScore`, `products.packagingType`, `products.isPublished`, `products.inStock`)
- Image uploads: max 5MB per product image, processed through a CDN (Cloudflare R2 or similar), not served from the Express process

### 14.2 Security
- Admin routes enforce `isAdmin = true` server-side on every request — never trust frontend routing alone
- Document uploads (certification files) stored in private bucket — signed URL access only, never public
- Certification document URLs never exposed to non-admin API responses
- Carbon offset API keys stored in env vars, never in client bundle
- Seller cannot modify `computedSustainabilityScore`, `verificationStatus`, `sellerCertifications` via any API endpoint — these are admin/system-only writes

### 14.3 Data Integrity
- `computedSustainabilityScore` recomputes are idempotent — running twice produces the same result
- Certification expiry job is idempotent — running multiple times doesn't double-deactivate
- All monetary values (prices, offset costs) stored as `decimal(10,2)` — never floats

---

## 15. Success Metrics

### Phase Milestones (12 months post-M0)

| Metric | 3 months | 6 months | 12 months |
|--------|----------|----------|-----------|
| Verified sellers | 20 | 75 | 200 |
| Active product listings | 150 | 600 | 2000 |
| Monthly active buyers | 500 | 2500 | 10000 |
| Verified badge embeds on seller sites | 15 | 60 | 175 |
| Organic search sessions/month | 200 | 2000 | 15000 |
| % orders with carbon data | 40% | 70% | 90% |
| % orders with verified offset | 5% | 12% | 20% |

### Quality Gates (non-negotiable)
- Zero products live with uncertified sustainability claims
- Zero fake statistics on any public-facing page
- Carbon offset conversion rate > 5% before any "carbon-neutral platform" marketing copy is written
- All active certifications audited for expiry monthly

---

## 16. Out of Scope (v2)

The following are deliberately excluded until the zero-waste home & personal care niche is saturated and the trust infrastructure is proven:

- Sustainable fashion
- Organic food / grocery
- AI-generated product descriptions or scoring
- User-generated reviews without verified purchase gate
- Marketplace expansion beyond UK/EU in Phase 1
- Native mobile app
- Subscription / recurring orders (consider for M9)
- B2B / wholesale buying

---

## 17. Implementation Notes for Existing Codebase

### Files Requiring Changes in M0
- [client/src/pages/Landing.tsx](client/src/pages/Landing.tsx) — copy overhaul, remove fake stats
- [client/src/components/CarbonFootprintCalculator.tsx](client/src/components/CarbonFootprintCalculator.tsx) — remove offset checkbox
- [client/src/App.tsx](client/src/App.tsx) — remove `/community` route
- [shared/schema.ts](shared/schema.ts) — add `verificationStatus`, `isPublished`
- [server/routes.ts](server/routes.ts) — filter `isPublished = false` from all public product endpoints

### Files to Delete in M0
- `client/src/pages/Community.tsx` (replaced in M7)

### New Files Required (M1)
- `client/src/pages/seller/Apply.tsx`
- `client/src/pages/seller/ApplicationStatus.tsx`
- `client/src/pages/admin/Dashboard.tsx`
- `client/src/pages/admin/ApplicationDetail.tsx`
- `server/jobs/certificationExpiry.ts`
- `server/email.ts` (Resend integration)

### Database Migration Strategy
All schema changes use Drizzle's `db:push` for development. For production, generate migration files with `drizzle-kit generate` before each module ships.
