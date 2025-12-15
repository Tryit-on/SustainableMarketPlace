import { useParams, Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { SustainabilityScore } from "@/components/SustainabilityScore";
import { CertificationBadges } from "@/components/CertificationBadge";
import { StarRating } from "@/components/StarRating";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Leaf,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import type { ProductWithDetails, ReviewWithUser } from "@shared/schema";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<ProductWithDetails>({
    queryKey: ["/api/products", slug],
  });

  const { data: reviews } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/products", slug, "reviews"],
    enabled: !!product,
  });

  const { data: relatedProducts } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", "related", product?.categoryId],
    enabled: !!product?.categoryId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/cart", { productId: product?.id, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product?.name} added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", { productId: product?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: `${product?.name} saved to your wishlist.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToCartMutation.mutate();
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    addToWishlistMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-8">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const images = product.images?.length
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/shop">Shop</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/shop?category=${product.category?.slug}`}>
                    {product.category?.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <svg className="w-24 h-24 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}

                {/* Sustainability Score */}
                <div className="absolute top-4 left-4">
                  <SustainabilityScore score={product.sustainabilityScore || 0} size="lg" />
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? images.length - 1 : prev - 1
                        )
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === images.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <CertificationBadges certifications={product.certifications} showLabel />
              )}

              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-product-title">
                  {product.name}
                </h1>
                {product.reviewCount && product.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating rating={product.averageRating || 0} />
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Seller */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={product.seller?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {product.seller?.sellerName?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {product.seller?.sellerName || "Unknown Seller"}
                    {product.seller?.sellerVerified && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Verified Seller</p>
                </div>
              </div>

              <Separator />

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" data-testid="text-product-price">
                    ${price.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="destructive">-{discount}%</Badge>
                    </>
                  )}
                </div>
                {product.inStock ? (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="h-4 w-4" /> In Stock
                  </p>
                ) : (
                  <p className="text-sm text-destructive">Out of Stock</p>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid="button-qty-minus"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center" data-testid="text-quantity">
                      {quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="button-qty-plus"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                    disabled={!product.inStock || addToCartMutation.isPending}
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleAddToWishlist}
                    disabled={addToWishlistMutation.isPending}
                    data-testid="button-add-wishlist"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <SocialShareButtons 
                    title={product.name}
                    description={product.description || "Check out this sustainable product on GreenMart!"}
                    imageUrl={product.imageUrl || undefined}
                    compact 
                  />
                </div>
              </div>

              <Separator />

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                  <Truck className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">Free Shipping</span>
                  <span className="text-xs text-muted-foreground">Over $50</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                  <Shield className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">Secure</span>
                  <span className="text-xs text-muted-foreground">Checkout</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                  <Leaf className="h-6 w-6 text-primary mb-2" />
                  <span className="text-xs font-medium">Carbon Neutral</span>
                  <span className="text-xs text-muted-foreground">Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="sustainability"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Sustainability
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                Reviews ({reviews?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                  <p>{product.description || "No description available."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sustainability" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {product.materials || "Material information not available."}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Carbon Footprint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {product.carbonFootprint ? (
                      <p className="text-2xl font-bold text-primary">
                        {product.carbonFootprint}kg CO2
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Carbon footprint data not available.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Lifecycle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {product.lifecycle || "Lifecycle information not available."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                          <div className="flex items-start gap-4">
                            <Avatar>
                              <AvatarImage src={review.user?.profileImageUrl || undefined} />
                              <AvatarFallback>
                                {review.user?.firstName?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">
                                    {review.user?.firstName} {review.user?.lastName}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <StarRating rating={review.rating} size="sm" />
                                    {review.verifiedPurchase && (
                                      <Badge variant="secondary" className="text-xs">
                                        Verified Purchase
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt!).toLocaleDateString()}
                                </span>
                              </div>
                              {review.title && (
                                <h4 className="font-medium mb-1">{review.title}</h4>
                              )}
                              <p className="text-sm text-muted-foreground">{review.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No reviews yet.</p>
                      <Button variant="outline">Write a Review</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-6">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts
                  .filter((p) => p.id !== product.id)
                  .slice(0, 4)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
