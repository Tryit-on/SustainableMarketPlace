import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ArrowRight, ArrowLeft, ShoppingCart, CheckCircle2 } from "lucide-react";
import type { ReplacementGuide as ReplacementGuideType, ProductWithDetails } from "@shared/schema";

function scoreTier(score: number): { label: string; className: string } {
  if (score >= 80) return { label: "Exceptional", className: "bg-emerald-100 text-emerald-700" };
  if (score >= 60) return { label: "Strong", className: "bg-green-100 text-green-700" };
  if (score >= 40) return { label: "Good", className: "bg-lime-100 text-lime-700" };
  if (score >= 20) return { label: "Developing", className: "bg-amber-100 text-amber-700" };
  return { label: "Unrated", className: "bg-muted text-muted-foreground" };
}

const HOW_TO_STEPS: Record<string, string[]> = {
  "plastic-cling-film": [
    "Wash and dry beeswax wraps before first use.",
    "Use the warmth of your hands to mould the wrap around bowls, cut produce, or sandwiches.",
    "Rinse in cool water with mild soap after each use — never hot water, it melts the wax.",
    "Air dry and store folded in a drawer.",
    "After 6–12 months of regular use, compost at end of life.",
  ],
  "plastic-toothbrush": [
    "Choose a head size that fits comfortably.",
    "Brush twice daily for two minutes — same technique as plastic.",
    "Rinse and stand upright to dry between uses.",
    "When bristles fray (usually 3 months), pull them out and compost the handle.",
    "Bamboo handles certified by FSC are not treated with chemicals — fully compostable.",
  ],
};

export default function ReplacementGuide() {
  const { slug } = useParams<{ slug: string }>();

  const { data: guide, isLoading } = useQuery<ReplacementGuideType>({
    queryKey: [`/api/replacement-guides/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/replacement-guides/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: products } = useQuery<ProductWithDetails[]>({
    queryKey: [`/api/products`, { replacementGuideId: guide?.id }],
    queryFn: async () => {
      const res = await fetch(`/api/products?replacementGuideId=${guide!.id}&limit=6`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!guide?.id,
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

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Guide not found.</p>
            <Button asChild variant="outline"><Link href="/replace">Back to swaps</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const howToSteps = HOW_TO_STEPS[guide.slug] ?? null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 text-white py-14">
        <div className="container px-4 max-w-3xl mx-auto">
          <Link href="/replace">
            <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
              <ArrowLeft className="h-4 w-4" /> All swaps
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-4 text-white/60">
            <span className="text-sm line-through">{guide.conventionalItem}</span>
            <ArrowRight className="h-4 w-4" />
            <span className="text-sm text-white">{guide.zeroWasteAlternative}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Replace {guide.conventionalItem} with {guide.zeroWasteAlternative}
          </h1>
          {guide.seoDescription && (
            <p className="text-white/80 text-lg max-w-2xl">{guide.seoDescription}</p>
          )}
          {guide.conventionalCarbonKgPerYear && (
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm px-4 py-2 rounded-full">
              <Leaf className="h-4 w-4" />
              Potential saving: up to {guide.conventionalCarbonKgPerYear} kg CO₂e/year
            </div>
          )}
        </div>
      </section>

      <main className="flex-1 container px-4 max-w-3xl mx-auto py-12 space-y-12">
        {/* Why swap */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Why make the switch?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "🌍", title: "Lower carbon", body: "Zero-waste alternatives typically have 60–90% lower lifetime carbon footprint." },
              { icon: "♻️", title: "Less waste", body: "Durable or compostable — no single-use plastic ending up in landfill." },
              { icon: "💷", title: "Long-term savings", body: "Higher upfront cost, lower cost per use. Most pay back within 3–6 months." },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5 text-center">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How to use (if we have steps) */}
        {howToSteps && (
          <section>
            <h2 className="text-xl font-semibold mb-4">How to use {guide.zeroWasteAlternative}</h2>
            <ol className="space-y-3">
              {howToSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* What to look for */}
        <section>
          <h2 className="text-xl font-semibold mb-4">What to look for when buying</h2>
          <ul className="space-y-2">
            {[
              "Verified certifications — not self-declared claims.",
              "Packaging that is plastic-free or fully compostable.",
              "Country of manufacture — closer means lower shipping footprint.",
              "A sustainability score backed by product data, not marketing copy.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Product recommendations */}
        {products && products.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Verified {guide.zeroWasteAlternative} options</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => {
                const score = product.computedSustainabilityScore ?? 0;
                const tier = scoreTier(score);
                return (
                  <Link key={product.id} href={`/product/${product.slug}`}>
                    <Card className="hover-elevate overflow-hidden group cursor-pointer">
                      <div className="aspect-video bg-muted relative">
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          : <div className="w-full h-full flex items-center justify-center"><Leaf className="h-8 w-8 text-muted-foreground/30" /></div>
                        }
                        {score > 0 && (
                          <Badge className={`${tier.className} border-0 text-xs absolute bottom-2 left-2`}>
                            Score: {score} · {tier.label}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                        {product.sellerName && (
                          <p className="text-xs text-muted-foreground mt-0.5">{product.sellerName}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold">£{parseFloat(product.price).toFixed(2)}</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <ShoppingCart className="h-3 w-3" /> View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href={`/shop?search=${encodeURIComponent(guide.zeroWasteAlternative)}`}>
                  See all {guide.zeroWasteAlternative} products
                </Link>
              </Button>
            </div>
          </section>
        )}

        {!products?.length && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Shop {guide.zeroWasteAlternative}</h2>
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Leaf className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No verified products listed yet for this swap.</p>
                <Button asChild variant="outline">
                  <Link href={`/shop?search=${encodeURIComponent(guide.zeroWasteAlternative)}`}>
                    Search the shop
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
