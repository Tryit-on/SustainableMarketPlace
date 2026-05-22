import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Leaf, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import type { ReplacementGuide } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  kitchen: "bg-amber-100 text-amber-700",
  bathroom: "bg-blue-100 text-blue-700",
  cleaning: "bg-green-100 text-green-700",
  personal_care: "bg-purple-100 text-purple-700",
  laundry: "bg-cyan-100 text-cyan-700",
};

export default function Replace() {
  const [search, setSearch] = useState("");

  const { data: guides, isLoading } = useQuery<ReplacementGuide[]>({
    queryKey: ["/api/replacement-guides"],
  });

  const filtered = guides?.filter((g) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      g.conventionalItem.toLowerCase().includes(q) ||
      g.zeroWasteAlternative.toLowerCase().includes(q) ||
      (g.seoDescription ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 py-14">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-1 rounded-full mb-4">
            <Leaf className="h-4 w-4" />
            Zero-waste swaps
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Replace This with That</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Every plastic item in your home has a zero-waste alternative. Browse swaps backed by real carbon data.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for an item (e.g. cling film, shampoo)..."
              className="pl-10 bg-white dark:bg-background"
            />
          </div>
        </div>
      </section>

      <main className="flex-1 container px-4 max-w-5xl mx-auto py-12">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {!isLoading && !filtered?.length && (
          <div className="text-center py-20">
            <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? `No swaps found for "${search}".` : "No replacement guides available yet."}
            </p>
          </div>
        )}

        {filtered && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((guide) => (
              <Link key={guide.id} href={`/replace/${guide.slug}`}>
                <Card className="hover-elevate h-full cursor-pointer group">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                          <span className="line-through">{guide.conventionalItem}</span>
                          <ArrowRight className="h-3 w-3 flex-shrink-0" />
                        </div>
                        <h3 className="font-semibold text-base leading-tight">{guide.zeroWasteAlternative}</h3>
                      </div>
                      {guide.category && (
                        <Badge className={`${CATEGORY_COLORS[guide.category] ?? "bg-muted text-muted-foreground"} border-0 text-xs ml-2 flex-shrink-0`}>
                          {guide.category.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>

                    {guide.seoDescription && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                        {guide.seoDescription}
                      </p>
                    )}

                    <div className="mt-auto">
                      {guide.conventionalCarbonKgPerYear && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 mb-3">
                          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            Typical saving: up to {guide.conventionalCarbonKgPerYear} kg CO₂/year
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                        See swap guide <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
