import { useParams, Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CertificationBadge } from "@/components/CertificationBadge";
import { StarRating } from "@/components/StarRating";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { CarbonFootprintCalculator } from "@/components/CarbonFootprintCalculator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  Truck,
  Shield,
  Leaf,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  ShieldCheck,
  MessageSquare,
  Send,
} from "lucide-react";
import type { ProductWithDetails, ReviewWithUser, ScoreBreakdown, ProductQA } from "@shared/schema";

function scoreTier(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "Exceptional", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" };
  if (score >= 60) return { label: "Strong", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
  if (score >= 40) return { label: "Good", className: "bg-lime-100 text-lime-700" };
  if (score >= 20) return { label: "Developing", className: "bg-amber-100 text-amber-700" };
  return { label: "Unrated", className: "bg-muted text-muted-foreground" };
}

const SCORE_DIMENSIONS: Array<{ key: keyof Omit<ScoreBreakdown, "total" | "tier">; label: string }> = [
  { key: "packaging", label: "Packaging" },
  { key: "certifications", label: "Certifications" },
  { key: "materials", label: "Materials" },
  { key: "endOfLife", label: "End of Life" },
  { key: "manufacturingLocation", label: "Manufacturing Location" },
  { key: "carbonDataCompleteness", label: "Carbon Data Completeness" },
];

function ScoreBreakdownPanel({ productSlug }: { productSlug: string }) {
  const { data: breakdown } = useQuery<ScoreBreakdown>({
    queryKey: [`/api/products/${productSlug}/score-breakdown`],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productSlug}/score-breakdown`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!breakdown) return null;

  return (
    <div className="space-y-3">
      {SCORE_DIMENSIONS.map(({ key, label }) => {
        const dim = breakdown[key];
        const pct = Math.round((dim.earned / dim.max) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{dim.earned} / {dim.max}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground pt-1">
        Score computed from verified product data. Not seller-editable.
      </p>
    </div>
  );
}

function QASection({ productSlug, productId }: { productSlug: string; productId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [question, setQuestion] = useState("");

  const { data: qaItems } = useQuery<ProductQA[]>({
    queryKey: [`/api/products/${productSlug}/qa`],
    queryFn: async () => {
      const res = await fetch(`/api/products/${productSlug}/qa`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const submitQuestion = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/products/${productId}/qa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ question }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/qa`] });
      setQuestion("");
      toast({ title: "Question submitted", description: "It will appear once reviewed." });
    },
    onError: () => toast({ title: "Could not submit question", variant: "destructive" }),
  });

  const approved = qaItems?.filter((q) => q.isApproved && q.answer) ?? [];

  return (
    <div className="space-y-6">
      {/* Answered questions */}
      {approved.length > 0 && (
        <div className="space-y-4">
          {approved.map((qa) => (
            <div key={qa.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex gap-2">
                <MessageSquare className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{qa.question}</p>
              </div>
              {qa.answer && (
                <div className="flex gap-2 pl-6">
                  <p className="text-sm text-muted-foreground">{qa.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {approved.length === 0 && (
        <p className="text-sm text-muted-foreground">No questions answered yet. Be the first to ask.</p>
      )}

      {/* Ask a question */}
      {user ? (
        <div className="space-y-3 border-t pt-5">
          <p className="text-sm font-medium">Ask a question</p>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about ingredients, packaging, shelf life..."
            rows={3}
          />
          <Button
            size="sm"
            disabled={!question.trim() || submitQuestion.isPending}
            onClick={() => submitQuestion.mutate()}
          >
            <Send className="h-4 w-4 mr-2" />
            {submitQuestion.isPending ? "Submitting..." : "Submit question"}
          </Button>
          <p className="text-xs text-muted-foreground">Questions are reviewed before appearing publicly.</p>
        </div>
      ) : (
        <div className="border-t pt-5">
          <p className="text-sm text-muted-foreground">
            <Link href="/login"><span className="text-primary underline">Sign in</span></Link> to ask a question.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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
        description: `${quantity} × ${product?.name} added to your cart.`,
      });
    },
    onError: () => {
      toast({ title: "Failed to add to cart", variant: "destructive" });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/wishlist", { productId: product?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({ title: "Saved to wishlist" });
    },
    onError: () => {
      toast({ title: "Failed to save to wishlist", variant: "destructive" });
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    addToCartMutation.mutate();
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) { setLocation("/login"); return; }
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
              This product doesn't exist or is not publicly listed.
            </p>
            <Button asChild><Link href="/shop">Back to Shop</Link></Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const price = parseFloat(product.price);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const score = product.computedSustainabilityScore ?? 0;
  const tier = score > 0 ? scoreTier(score) : null;

  const images = product.images?.length
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const isVerifiedSeller = product.seller?.verificationStatus === "verified";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link href="/shop">Shop</Link></BreadcrumbLink>
              </BreadcrumbItem>
              {product.category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/shop?category=${product.category.slug}`}>
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
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
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="h-16 w-16 text-muted-foreground/20" />
                  </div>
                )}

                {/* Score badge */}
                {score > 0 && tier && (
                  <div className="absolute top-4 left-4">
                    <div className={`${tier.className} px-2.5 py-1 rounded-full text-sm font-bold border-0 shadow-sm`}>
                      {score} · {tier.label}
                    </div>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      onClick={() => setSelectedImageIndex((p) => (p === 0 ? images.length - 1 : p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      onClick={() => setSelectedImageIndex((p) => (p === images.length - 1 ? 0 : p + 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === i ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map((cert) => (
                    <CertificationBadge
                      key={cert.id}
                      certificationBody={cert.certificationBody}
                      sellerCertification={cert as any}
                      size="sm"
                    />
                  ))}
                </div>
              )}

              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-product-title">
                  {product.name}
                </h1>
                {product.reviewCount && product.reviewCount > 0 ? (
                  <div className="flex items-center gap-2">
                    <StarRating rating={product.averageRating || 0} />
                    <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                  </div>
                ) : null}
              </div>

              {/* Seller */}
              {product.seller && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={product.seller.profileImageUrl ?? undefined} />
                    <AvatarFallback>{product.seller.sellerName?.charAt(0) ?? "S"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      {product.seller.sellerSlug ? (
                        <Link href={`/sellers/${product.seller.sellerSlug}`}>
                          <span className="hover:text-primary">{product.seller.sellerName}</span>
                        </Link>
                      ) : (
                        product.seller.sellerName
                      )}
                      {isVerifiedSeller && (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isVerifiedSeller ? "Verified Seller" : "Seller"}
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" data-testid="text-product-price">
                    £{price.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        £{originalPrice.toFixed(2)}
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
                    <span className="w-12 text-center" data-testid="text-quantity">{quantity}</span>
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
                    description={product.description || "Check out this verified zero-waste product on GreenMart."}
                    imageUrl={product.imageUrl ?? undefined}
                    compact
                  />
                </div>
              </div>

              <Separator />

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Free shipping</p>
                    <p className="text-xs text-muted-foreground">Orders over £40</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Verified seller</p>
                    <p className="text-xs text-muted-foreground">Docs reviewed by us</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto">
              {[
                { value: "description", label: "Description" },
                { value: "sustainability", label: "Sustainability" },
                { value: "qa", label: `Q&A` },
                { value: "reviews", label: `Reviews (${reviews?.length ?? 0})` },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6 prose prose-sm max-w-none dark:prose-invert">
                  <p>{product.description || "No description available."}</p>
                  {product.materials && (
                    <>
                      <h3>Materials</h3>
                      <p>{product.materials}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sustainability" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-primary" />
                      Sustainability Score
                      {tier && (
                        <Badge className={`${tier.className} border-0 text-xs ml-auto`}>
                          {score} · {tier.label}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {score > 0 ? (
                      <ScoreBreakdownPanel productSlug={product.slug} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Score not yet computed. This product may be missing sustainability data.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Carbon + Packaging */}
                <div className="space-y-5">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Carbon Footprint</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {product.carbonFootprint ? (
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {parseFloat(product.carbonFootprint).toFixed(2)} kg CO₂e
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.carbonFootprintMethod === "lca_verified"
                              ? "Source: Life Cycle Assessment (verified)"
                              : "Source: Category average (ADEME 2024)"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Carbon data not provided by seller.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Packaging & End of Life</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {product.packagingType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Packaging</span>
                          <span className="capitalize">{product.packagingType.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {product.endOfLife && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End of life</span>
                          <span className="capitalize">{product.endOfLife.replace(/_/g, " ")}</span>
                        </div>
                      )}
                      {product.manufacturingCountry && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Made in</span>
                          <span>{product.manufacturingCountry}</span>
                        </div>
                      )}
                      {!product.packagingType && !product.endOfLife && !product.manufacturingCountry && (
                        <p className="text-muted-foreground">No packaging or lifecycle data provided.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Carbon calculator */}
                <div className="md:col-span-2">
                  <CarbonFootprintCalculator
                    productCarbonFootprint={product.carbonFootprint ? parseFloat(product.carbonFootprint) : undefined}
                    carbonFootprintMethod={product.carbonFootprintMethod ?? undefined}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Questions & Answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QASection productSlug={product.slug} productId={product.id} />
                </CardContent>
              </Card>
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
                              <AvatarImage src={review.user?.profileImageUrl ?? undefined} />
                              <AvatarFallback>
                                {review.user?.firstName?.charAt(0) ?? "U"}
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
                                      <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(review.createdAt!).toLocaleDateString("en-GB")}
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
                      <p className="text-muted-foreground mb-4">No reviews yet for this product.</p>
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
