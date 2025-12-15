import { useEffect } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  Leaf, 
  Store,
  ChevronRight,
  TreePine,
  Recycle,
  Globe2
} from "lucide-react";
import type { Order, WishlistItem } from "@shared/schema";

export default function Profile() {
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

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const { data: wishlistItems } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: isAuthenticated,
  });

  if (authLoading || !isAuthenticated || !user) {
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

  const impactStats = [
    { label: "CO2 Saved", value: "12.5kg", icon: Leaf },
    { label: "Trees Planted", value: "3", icon: TreePine },
    { label: "Plastic Avoided", value: "2.1kg", icon: Recycle },
    { label: "Countries", value: "5", icon: Globe2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback className="text-2xl">
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold" data-testid="text-user-name">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4" data-testid="text-user-email">
                      {user.email}
                    </p>
                    {user.isSeller && (
                      <Badge className="mb-4">
                        <Store className="h-3 w-3 mr-1" />
                        Verified Seller
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(user.createdAt!).toLocaleDateString()}
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <nav className="space-y-2">
                    <Link href="/orders">
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Orders
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{orders?.length || 0}</Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Button>
                    </Link>
                    <Link href="/wishlist">
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Wishlist
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{wishlistItems?.length || 0}</Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </Button>
                    </Link>
                    {user.isSeller && (
                      <Link href="/seller/dashboard">
                        <Button variant="ghost" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            Seller Dashboard
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-between" disabled>
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>

                  <Separator className="my-6" />

                  <Button variant="outline" className="w-full" asChild>
                    <a href="/api/logout">Log Out</a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Eco Impact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Your Eco Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {impactStats.map((stat, index) => (
                      <div key={index} className="text-center p-4 rounded-lg bg-muted/50">
                        <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Your sustainable shopping choices are making a real difference!
                  </p>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/orders">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Button asChild>
                        <Link href="/shop">Start Shopping</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Become a Seller CTA */}
              {!user.isSeller && (
                <Card className="bg-gradient-to-br from-primary/10 via-emerald-500/5 to-background border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Become a Seller</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Share your sustainable products with our eco-conscious community. 
                          Reach thousands of customers who care about the planet.
                        </p>
                        <Button asChild>
                          <Link href="/become-seller">Apply Now</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
