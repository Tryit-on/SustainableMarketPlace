import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { CategoryCard, CategoryCardSkeleton } from "@/components/CategoryCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { 
  Leaf, 
  Truck, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  TreePine,
  Recycle,
  Globe2
} from "lucide-react";
import type { ProductWithDetails, Category } from "@shared/schema";

const trustIndicators = [
  { icon: ShieldCheck, text: "1000+ Verified Sellers" },
  { icon: Truck, text: "Carbon-Neutral Shipping" },
  { icon: Leaf, text: "Fair Trade Certified" },
];

const impactStats = [
  { value: "50K+", label: "Eco Products", icon: Leaf },
  { value: "2M+", label: "Trees Planted", icon: TreePine },
  { value: "100K+", label: "Tons CO2 Saved", icon: Recycle },
  { value: "150+", label: "Countries Served", icon: Globe2 },
];

export default function Landing() {
  const { data: products, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", "featured"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background with gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </div>

          <div className="container relative z-10 px-4 py-20 text-center text-white">
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-0 backdrop-blur-sm">
              <Leaf className="h-3 w-3 mr-1" />
              Sustainable Shopping Made Easy
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
              Shop Sustainably. <br className="hidden sm:block" />
              <span className="text-emerald-300">Live Consciously.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Discover eco-friendly products from verified sellers who care about our planet. 
              Every purchase helps build a sustainable future.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="gap-2" data-testid="button-hero-shop">
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
                data-testid="button-hero-seller"
              >
                <Link href="/become-seller">
                  Become a Seller
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {trustIndicators.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-white/80">
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-muted/50">
          <div className="container px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Shop by Category</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our curated collection of sustainable products across all categories
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categoriesLoading
                ? Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} />)
                : categories?.slice(0, 6).map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Featured Products</h2>
                <p className="text-muted-foreground">
                  Top-rated sustainable products loved by our community
                </p>
              </div>
              <Button variant="outline" asChild className="hidden sm:flex gap-2">
                <Link href="/shop">
                  View All
                  <ArrowRight className="h-4 w-4" />
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

            <div className="mt-8 text-center sm:hidden">
              <Button variant="outline" asChild className="gap-2">
                <Link href="/shop">
                  View All Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Impact Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Our Collective Impact</h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto">
                Together, we're making a difference for our planet
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {impactStats.map((stat, index) => (
                <Card key={index} className="bg-white/10 border-0 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="h-8 w-8 mx-auto mb-3 text-emerald-300" />
                    <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">How GreenMart Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Shopping sustainably has never been easier
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Browse Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore thousands of verified eco-friendly products from trusted sellers worldwide.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Check Sustainability</h3>
                  <p className="text-sm text-muted-foreground">
                    Review certifications, sustainability scores, and environmental impact data.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Shop & Make Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your purchase with carbon-neutral shipping and track your positive impact.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/50">
          <div className="container px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of conscious consumers who are shopping sustainably and making a positive impact on our planet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild data-testid="button-cta-shop">
                  <Link href="/shop">
                    Explore Products
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/api/login">
                    Create Account
                  </a>
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
