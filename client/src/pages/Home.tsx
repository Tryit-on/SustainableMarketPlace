import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { CategoryCard, CategoryCardSkeleton } from "@/components/CategoryCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight,
  Package,
  Heart,
  Clock,
  TrendingUp,
  Leaf
} from "lucide-react";
import type { ProductWithDetails, Category, Order } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", "featured"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: wishlistCount } = useQuery<{ count: number }>({
    queryKey: ["/api/wishlist/count"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Welcome Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-emerald-500/5 py-12">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-welcome">
                  Welcome back, {user?.firstName || "Eco Warrior"}!
                </h1>
                <p className="text-muted-foreground">
                  Ready to continue your sustainable shopping journey?
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild data-testid="button-shop-now">
                  <Link href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {user?.isSeller && (
                  <Button variant="outline" asChild data-testid="button-seller-dashboard">
                    <Link href="/seller/dashboard">
                      Seller Dashboard
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8">
          <div className="container px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{recentOrders?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Orders</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Heart className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{wishlistCount?.count || 0}</p>
                    <p className="text-sm text-muted-foreground">Wishlist</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Leaf className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12.5kg</p>
                    <p className="text-sm text-muted-foreground">CO2 Saved</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">85</p>
                    <p className="text-sm text-muted-foreground">Eco Score</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        {recentOrders && recentOrders.length > 0 && (
          <section className="py-8">
            <div className="container px-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Orders
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/orders">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            ${parseFloat(order.totalAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Browse Categories */}
        <section className="py-8">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Browse Categories</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/shop">View All</Link>
              </Button>
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

        {/* Recommended Products */}
        <section className="py-8 bg-muted/50">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Recommended for You</h2>
                <p className="text-sm text-muted-foreground">Based on your preferences</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/shop">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products?.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-8">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">New Arrivals</h2>
                <p className="text-sm text-muted-foreground">Fresh sustainable products</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/shop?sort=newest">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products?.slice(4, 8).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
