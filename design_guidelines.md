# GreenMart Sustainable Product Marketplace - Design Guidelines

## Design Approach

**Reference-Based: E-Commerce with Sustainability Focus**

Drawing inspiration from Etsy's artisan marketplace feel, Shopify's clean product presentation, and Patagonia's environmental authenticity. The design emphasizes trust through transparency, showcasing sustainability credentials prominently while maintaining excellent e-commerce usability.

**Core Principles:**
- Transparency through visual hierarchy of certifications and sustainability data
- Trust-building through prominent reviews, ratings, and seller verification badges
- Natural, organic aesthetic that feels authentic rather than corporate
- Information density balanced with breathing room for product imagery

## Typography

**Hierarchy:**
- Display (Hero Headlines): Bold, 48-56px, tight leading for impact
- H1 (Page Titles): Semibold, 36-40px
- H2 (Section Headers): Semibold, 28-32px
- H3 (Card Titles, Product Names): Medium, 20-24px
- Body Large (Product Descriptions): Regular, 18px, relaxed leading
- Body (General Content): Regular, 16px, comfortable line-height 1.6
- Small (Metadata, Labels): Medium, 14px
- Caption (Certifications, Carbon Data): Regular, 12-13px

Use 2 font families: One contemporary sans-serif for headings (clean, modern), one readable sans-serif for body text.

## Layout System

**Spacing Scale:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (badges, icons): 2-4
- Component internal: 4-8
- Between components: 12-16
- Section padding: 16-24 (mobile), 20-32 (desktop)

**Grid System:**
- Product grids: 1 column (mobile), 2-3 columns (tablet), 4 columns (desktop)
- Feature sections: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- Container max-width: 1400px (wide for product displays)
- Content max-width: 1200px

## Component Library

**Navigation:**
- Sticky header with logo, main navigation (Shop, Sellers, Community, About), search bar, cart icon with badge, user account dropdown
- Mega menu for Shop category with visual category cards and sustainability filter shortcuts
- Mobile: Drawer navigation with category expansion

**Hero Section:**
- Full-width hero with large background image showcasing sustainable lifestyle
- Centered headline + subheadline emphasizing marketplace mission
- Primary CTA ("Start Shopping") and secondary CTA ("Become a Seller") with blurred backgrounds
- Floating trust indicators: "1000+ Verified Sellers" | "Carbon-Neutral Shipping" | "Fair Trade Certified"

**Product Cards:**
- High-quality product image (square aspect ratio)
- Sustainability score badge (top-left corner, prominent)
- Product name, seller name (smaller, linked)
- Price with original/sale display
- Quick certification icons row (Fair Trade, Organic, Vegan, etc. - max 4 visible)
- Add to Cart + Wishlist heart icon
- Hover state: Show quick view option

**Filters Sidebar:**
- Collapsible filter groups: Categories, Price Range, Certifications, Sustainability Score (slider), Shipping Options
- Active filters displayed as removable chips above products
- Filter count badges showing available products per option

**Product Detail Page:**
- Image gallery (main + 4-6 thumbnails, zoomable)
- Right column: Product name, seller info with verification badge, price, sustainability score (large, visual), quick certifications
- Detailed tabs: Description, Sustainability Details (materials, carbon footprint chart, lifecycle), Reviews, Seller Info
- Add to Cart sticky bar on mobile
- Related products carousel at bottom

**Seller Dashboard:**
- Left sidebar navigation (Overview, Products, Orders, Analytics, Profile)
- Overview cards: Total Sales, Active Products, Pending Orders, Rating
- Product management table with inline editing, image thumbnails
- Analytics graphs showing sales trends, popular products, sustainability impact metrics

**Community Section:**
- Blog-style article cards with featured images
- Categories: Guides, News, Success Stories, Eco-Challenges
- Article page: Hero image, author info, share buttons, related articles

**Reviews & Ratings:**
- Star rating with count, verified purchase badge
- Review cards with user photo, name, date, sustainability impact note ("Helped save 2kg CO2")
- Helpful vote buttons, seller response section

**Cart & Checkout:**
- Cart sidebar overlay with product thumbnails, quantity adjusters, subtotal
- Checkout: Multi-step progress indicator (Cart → Shipping → Payment)
- Shipping options with carbon footprint estimates and green shipping badges
- Order summary with sustainability impact (total CO2 saved, trees planted equivalent)

**Footer:**
- Four-column layout: About (mission statement), Shop (category links), Community (blog, challenges), Support (FAQ, contact)
- Newsletter signup with eco-tip preview
- Trust badges row (Secure Payment, Carbon-Neutral, Fair Trade Partner)
- Social media icons, copyright

**Misc Components:**
- Certification badges: Circular icons with tooltip explanations
- Sustainability score: Circular progress indicator (0-100) with leaf icon fill
- Carbon footprint display: Small graph or comparison metric
- Seller verification badge: Checkmark shield icon next to name
- Toast notifications for cart actions, wishlist adds

## Images

**Hero Section:**
Large, high-quality lifestyle image showing sustainable products in natural setting - think reusable bags at farmer's market, eco-friendly home setup, or person in sustainable clothing outdoors. Image should feel authentic, not overly polished. Include subtle overlay for text readability.

**Category Cards (Below Hero):**
Six category images showcasing: Sustainable Fashion, Organic Food, Eco Home, Green Beauty, Zero Waste, Fair Trade. Each image features representative products in natural lighting.

**Product Images:**
Professional product photography on clean white or natural backgrounds. Lifestyle shots in product galleries showing items in use.

**Community Section:**
Article header images featuring real people, sustainability practices, natural environments. Authentic photography over stock imagery.

**About/Mission Section:**
Team photos, partnership logos, impact statistics with supporting imagery (forests, clean oceans, happy farmers).

**Seller Profile:**
Seller workspace photos, product creation process, behind-the-scenes authenticity.