import { useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/components/ProductFormDialog";
import { SellerVerificationCard } from "@/components/SellerVerificationCard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  Plus,
  TrendingUp,
  Leaf,
  Eye,
  Edit
} from "lucide-react";
import type { Product, Order } from "@shared/schema";

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/seller/products"],
    enabled: isAuthenticated && user?.isSeller,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/seller/orders"],
    enabled: isAuthenticated && user?.isSeller,
  });

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user?.isSeller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Not a Seller</h2>
            <p className="text-muted-foreground mb-6">
              You need to become a seller to access this dashboard.
            </p>
            <Button asChild>
              <Link href="/become-seller">Become a Seller</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0) || 0;
  const activeProducts = products?.filter((p) => p.inStock)?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending" || o.status === "processing")?.length || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Seller Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.sellerName || user.firstName}!
              </p>
            </div>
            <ProductFormDialog />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{activeProducts}</p>
                    <p className="text-sm text-muted-foreground">Active Products</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingOrders}</p>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>Your Products</CardTitle>
                  <Button variant="ghost" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : products && products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Eco Score</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.slice(0, 5).map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                                  {product.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge variant={product.inStock ? "default" : "secondary"}>
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Leaf className="h-4 w-4 text-primary" />
                                <span>{product.sustainabilityScore || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No products yet</p>
                      <ProductFormDialog 
                        trigger={
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Product
                          </Button>
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Verification Status */}
              <SellerVerificationCard user={user} />

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No orders yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Eco Impact */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Your Eco Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">CO2 Offset</span>
                    <span className="font-bold">125kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sustainable Sales</span>
                    <span className="font-bold">89%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Rating</span>
                    <span className="font-bold flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      4.8
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Tips to Grow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      Add more product photos to increase sales by 35%
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      Include sustainability certifications on all products
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      Respond to reviews to build customer trust
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
