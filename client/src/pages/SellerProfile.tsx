import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CertificationBadge } from "@/components/CertificationBadge";
import { Leaf, MapPin, Calendar, ShieldCheck, Package } from "lucide-react";
import type { PublicSellerProfile, ProductWithDetails } from "@shared/schema";

export default function SellerProfile() {
  const { slug } = useParams<{ slug: string }>();

  const { data: profile, isLoading } = useQuery<PublicSellerProfile>({
    queryKey: [`/api/sellers/${slug}`],
    enabled: !!slug,
  });

  const { data: products } = useQuery<ProductWithDetails[]>({
    queryKey: [`/api/sellers/${slug}/products`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Seller not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const tierLabel = profile.averageScore >= 80 ? "Exceptional" : profile.averageScore >= 60 ? "Strong" : profile.averageScore >= 40 ? "Good" : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white py-16">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            {profile.profileImageUrl ? (
              <img src={profile.profileImageUrl} alt={profile.sellerName ?? ""} className="w-20 h-20 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/30">
                <Leaf className="h-9 w-9 text-white/60" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.sellerName}</h1>
                {profile.verificationStatus === "verified" && (
                  <Badge className="bg-white/20 text-white border-0 gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Seller
                  </Badge>
                )}
              </div>
              {profile.sellerMission && (
                <p className="text-white/80 text-lg max-w-2xl">{profile.sellerMission}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-white/60">
                {profile.sellerLocation && (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{profile.sellerLocation}</span>
                )}
                {profile.sellerFoundedYear && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Est. {profile.sellerFoundedYear}</span>
                )}
                <span className="flex items-center gap-1"><Package className="h-4 w-4" />{profile.productCount} products</span>
                {tierLabel && <span className="flex items-center gap-1"><Leaf className="h-4 w-4 text-emerald-300" />Avg. score: {tierLabel}</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 container px-4 max-w-4xl mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Certifications */}
            {profile.certifications?.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="font-semibold mb-3">Certifications</h2>
                  <div className="space-y-2">
                    {profile.certifications.map((cert) => (
                      <CertificationBadge
                        key={cert.id}
                        certificationBody={cert.certificationBody}
                        sellerCertification={cert}
                        size="sm"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sustainability score */}
            {profile.averageScore > 0 && (
              <Card>
                <CardContent className="p-5 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Average Sustainability Score</p>
                  <p className="text-4xl font-bold text-primary">{profile.averageScore}</p>
                  {tierLabel && <Badge variant="secondary" className="mt-2">{tierLabel}</Badge>}
                  <p className="text-xs text-muted-foreground mt-2">Computed from verified product data</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {profile.sellerStory && (
              <div>
                <h2 className="text-lg font-semibold mb-3">About {profile.sellerName}</h2>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{profile.sellerStory}</p>
              </div>
            )}

            {/* Products */}
            {products && products.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Products</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <a key={product.id} href={`/product/${product.slug}`} className="group">
                      <Card className="hover-elevate overflow-hidden">
                        <div className="aspect-square bg-muted">
                          {product.imageUrl
                            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            : <div className="w-full h-full flex items-center justify-center"><Leaf className="h-8 w-8 text-muted-foreground/30" /></div>
                          }
                        </div>
                        <CardContent className="p-3">
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-sm">£{parseFloat(product.price).toFixed(2)}</span>
                            {(product.computedSustainabilityScore ?? 0) > 0 && (
                              <span className="text-xs text-muted-foreground">Score: {product.computedSustainabilityScore}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
