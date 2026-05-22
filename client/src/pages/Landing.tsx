import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import {
  Leaf,
  ShieldCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Star,
} from "lucide-react";
import type { ProductWithDetails, Category } from "@shared/schema";

const trustPillars = [
  {
    icon: FileCheck,
    title: "Verified Before Listed",
    body: "Every seller submits certification documents reviewed by our team before their first product goes live. No self-reported claims.",
  },
  {
    icon: ShieldCheck,
    title: "Certifications Only",
    body: "Badges only render when we hold the paperwork — Soil Association, Fair Trade, B Corp, Leaping Bunny and more.",
  },
  {
    icon: Search,
    title: "Real Carbon Data",
    body: "Product carbon figures cite a source — LCA documents or published category averages. Never a made-up number.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Browse & Filter",
    body: "Filter by certification body, sustainability score tier, packaging type, and more. Every filter reflects verified data.",
  },
  {
    step: "2",
    title: "Check the Evidence",
    body: "See exactly which certifications a seller holds, how the sustainability score was computed, and the carbon data source.",
  },
  {
    step: "3",
    title: "Shop Confidently",
    body: "Purchase knowing the eco-credentials you read are the ones we checked — not claims the seller typed themselves.",
  },
];

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card animate-pulse">
      <div className="aspect-square bg-muted rounded-t-xl" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-1/4 mt-2" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithDetails }) {
  const tier =
    (product.computedSustainabilityScore ?? 0) >= 80
      ? "Exceptional"
      : (product.computedSustainabilityScore ?? 0) >= 60
      ? "Strong"
      : (product.computedSustainabilityScore ?? 0) >= 40
      ? "Good"
      : null;

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="hover-elevate cursor-pointer overflow-hidden h-full">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {tier && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
              {tier}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">{product.seller?.sellerName}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="font-bold">£{parseFloat(product.price).toFixed(2)}</span>
            {(product.averageRating ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.averageRating?.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Landing() {
  const { data: products, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>

          <div className="container relative z-10 px-4 py-20 text-center text-white">
            <Badge
              variant="secondary"
              className="mb-6 bg-white/20 text-white border-0 backdrop-blur-sm"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Every seller verified before listing
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
              Shop Zero-Waste.{" "}
              <span className="text-emerald-300">Live Plastic-Free.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Certified zero-waste home and personal care products from sellers
              we&apos;ve actually verified. Every badge is backed by documents we hold.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="gap-2">
                <Link href="/shop">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Link href="/seller/apply">Become a Verified Seller</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {[
                { icon: FileCheck, text: "Certified Sellers Only" },
                { icon: ShieldCheck, text: "Real Carbon Data" },
                { icon: CheckCircle2, text: "Verified Before Listed" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/80">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-muted/50">
          <div className="container px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Browse by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Zero-waste alternatives for every room in your home
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categoriesLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                  ))
                : categories?.filter((c) => !c.parentSlug).slice(0, 4).map((category) => (
                    <Link key={category.id} href={`/shop?category=${category.slug}`}>
                      <Card className="hover-elevate cursor-pointer h-24 flex items-center justify-center text-center p-4">
                        <div>
                          <Leaf className="h-5 w-5 text-primary mx-auto mb-2" />
                          <p className="text-sm font-medium">{category.name}</p>
                        </div>
                      </Card>
                    </Link>
                  ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" asChild>
                <Link href="/shop">View all categories <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust pillars */}
        <section className="py-16">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Why GreenMart is Different
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We don&apos;t let sellers call their products sustainable. We verify it.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {trustPillars.map((pillar, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <pillar.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground">{pillar.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-muted-foreground">
                  From sellers who have earned their verification
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex gap-2">
                <Link href="/shop">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsLoading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products?.slice(0, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
            {!productsLoading && (!products || products.length === 0) && (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Verified products coming soon as sellers complete verification.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">How GreenMart Works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Sustainable shopping built on evidence, not marketing copy
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, i) => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">{step.step}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Replace this CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Looking to replace a specific item?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Find certified zero-waste alternatives to everyday household items — cling
                film, plastic toothbrushes, liquid shampoo and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                >
                  <Link href="/replace">Find Replacements</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Link href="/seller/apply">Sell on GreenMart</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
