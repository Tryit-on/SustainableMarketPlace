import { useState, useCallback } from "react";
import { useSearch, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CertificationBadgeList } from "@/components/CertificationBadge";
import { Search, SlidersHorizontal, X, Star, Leaf, ArrowRight, LayoutGrid, Scale } from "lucide-react";
import type { ProductWithDetails, Category, CertificationBody } from "@shared/schema";
import { Link } from "wouter";

const PACKAGING_OPTIONS = [
  { value: "plastic_free", label: "Plastic-free" },
  { value: "minimal_plastic", label: "Minimal plastic" },
  { value: "recycled", label: "Recycled materials" },
];

const SCORE_TIERS = [
  { min: 80, label: "Exceptional (80+)" },
  { min: 60, label: "Strong (60+)" },
  { min: 40, label: "Good (40+)" },
  { min: 0, label: "All" },
];

export default function Shop() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(searchString);

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [certBodies, setCertBodies] = useState<string[]>(
    params.get("certBodies")?.split(",").filter(Boolean) ?? []
  );
  const [packagingType, setPackagingType] = useState(params.get("packagingType") ?? "");
  const [minScore, setMinScore] = useState(parseInt(params.get("minScore") ?? "0"));
  const [sort, setSort] = useState(params.get("sort") ?? "");
  const [hasCarbonData, setHasCarbonData] = useState(params.get("hasCarbonData") === "true");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const buildQueryString = useCallback(() => {
    const q: Record<string, string> = {};
    if (search) q.search = search;
    if (category) q.category = category;
    if (certBodies.length) q.certBodies = certBodies.join(",");
    if (packagingType) q.packagingType = packagingType;
    if (minScore > 0) q.minScore = String(minScore);
    if (hasCarbonData) q.hasCarbonData = "true";
    if (sort) q.sort = sort;
    return new URLSearchParams(q).toString();
  }, [search, category, certBodies, packagingType, minScore, hasCarbonData, sort]);

  const { data: products, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", search, category, certBodies.join(","), packagingType, minScore, hasCarbonData, sort],
    queryFn: async () => {
      const res = await fetch(`/api/products?${buildQueryString()}`);
      return res.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({ queryKey: ["/api/categories"] });
  const { data: certificationBodies } = useQuery<CertificationBody[]>({ queryKey: ["/api/certification-bodies"] });

  const topCategories = categories?.filter((c) => !c.parentSlug);

  const toggleCertBody = (id: string) => {
    setCertBodies((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const activeFilterCount = [
    category, packagingType, minScore > 0 ? "score" : "", hasCarbonData ? "carbon" : ""
  ].filter(Boolean).length + certBodies.length;

  const FilterPanel = () => (
    <div className="space-y-1">
      <Accordion type="multiple" defaultValue={["categories", "certifications", "packaging", "score"]}>
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              <div
                className={`flex items-center gap-2 cursor-pointer text-sm py-1 ${!category ? "font-medium text-primary" : "text-muted-foreground"}`}
                onClick={() => setCategory("")}
              >
                All categories
              </div>
              {topCategories?.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center gap-2 cursor-pointer text-sm py-1 ${category === cat.slug ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => setCategory(category === cat.slug ? "" : cat.slug)}
                >
                  {cat.name}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certifications">
          <AccordionTrigger className="text-sm">Certification</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {certificationBodies?.map((body) => (
                <div key={body.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`cert-${body.id}`}
                    checked={certBodies.includes(body.id)}
                    onCheckedChange={() => toggleCertBody(body.id)}
                  />
                  <Label htmlFor={`cert-${body.id}`} className="text-xs cursor-pointer font-normal leading-tight">{body.name}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="packaging">
          <AccordionTrigger className="text-sm">Packaging</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {PACKAGING_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`pkg-${opt.value}`}
                    checked={packagingType === opt.value}
                    onCheckedChange={() => setPackagingType(packagingType === opt.value ? "" : opt.value)}
                  />
                  <Label htmlFor={`pkg-${opt.value}`} className="text-sm cursor-pointer font-normal">{opt.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="score">
          <AccordionTrigger className="text-sm">Sustainability Score</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {SCORE_TIERS.map((tier) => (
                <div key={tier.min} className="flex items-center gap-2">
                  <Checkbox
                    id={`score-${tier.min}`}
                    checked={minScore === tier.min}
                    onCheckedChange={() => setMinScore(minScore === tier.min ? 0 : tier.min)}
                  />
                  <Label htmlFor={`score-${tier.min}`} className="text-sm cursor-pointer font-normal">{tier.label}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="carbon">
          <AccordionTrigger className="text-sm">Carbon Data</AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="carbon-data"
                checked={hasCarbonData}
                onCheckedChange={(v) => setHasCarbonData(!!v)}
              />
              <Label htmlFor="carbon-data" className="text-sm cursor-pointer font-normal">Only products with carbon data</Label>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Search + sort bar */}
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="container px-4 py-3 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search zero-waste products..."
                className="pl-10"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 hidden sm:flex">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Most Relevant</SelectItem>
                <SelectItem value="score_desc">Highest Score</SelectItem>
                <SelectItem value="carbon_asc">Lowest Carbon</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile filter toggle */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && <Badge className="h-5 w-5 p-0 text-xs justify-center">{activeFilterCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4 overflow-y-auto">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>

            {compareIds.length > 0 && (
              <Button size="sm" asChild className="gap-2 hidden sm:flex">
                <Link href={`/compare?ids=${compareIds.join(",")}`}>
                  <Scale className="h-4 w-4" /> Compare ({compareIds.length})
                </Link>
              </Button>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="container px-4 pb-2 flex flex-wrap gap-2">
              {category && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setCategory("")}>
                  {topCategories?.find((c) => c.slug === category)?.name ?? category}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {packagingType && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPackagingType("")}>
                  {PACKAGING_OPTIONS.find((p) => p.value === packagingType)?.label}
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {minScore > 0 && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setMinScore(0)}>
                  Score {minScore}+
                  <X className="h-3 w-3" />
                </Badge>
              )}
              {certBodies.map((id) => {
                const body = certificationBodies?.find((b) => b.id === id);
                return body ? (
                  <Badge key={id} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleCertBody(id)}>
                    {body.name}
                    <X className="h-3 w-3" />
                  </Badge>
                ) : null;
              })}
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                setCategory(""); setCertBodies([]); setPackagingType(""); setMinScore(0); setHasCarbonData(false);
              }}>
                Clear all
              </Button>
            </div>
          )}
        </div>

        <div className="container px-4 py-8">
          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-sm">Filters</span>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                      setCategory(""); setCertBodies([]); setPackagingType(""); setMinScore(0); setHasCarbonData(false);
                    }}>
                      Clear ({activeFilterCount})
                    </Button>
                  )}
                </div>
                <FilterPanel />
              </div>
            </aside>

            {/* Product grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {isLoading ? "Loading..." : `${products?.length ?? 0} products`}
                </p>
                {compareIds.length > 0 && (
                  <Button size="sm" asChild className="gap-2 sm:hidden">
                    <Link href={`/compare?ids=${compareIds.join(",")}`}>
                      <Scale className="h-4 w-4" /> Compare ({compareIds.length})
                    </Link>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading
                  ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : products?.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isInCompare={compareIds.includes(product.id)}
                        onToggleCompare={() => toggleCompare(product.id)}
                        canAddToCompare={compareIds.length < 3 || compareIds.includes(product.id)}
                      />
                    ))}
              </div>

              {!isLoading && !products?.length && (
                <div className="text-center py-16">
                  <Leaf className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">No products match your filters.</p>
                  <Button variant="outline" onClick={() => {
                    setCategory(""); setCertBodies([]); setPackagingType(""); setMinScore(0); setSearch("");
                  }}>Clear filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

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

function ProductCard({
  product,
  isInCompare,
  onToggleCompare,
  canAddToCompare,
}: {
  product: ProductWithDetails;
  isInCompare: boolean;
  onToggleCompare: () => void;
  canAddToCompare: boolean;
}) {
  const score = product.computedSustainabilityScore ?? 0;
  const tier = score >= 80 ? "Exceptional" : score >= 60 ? "Strong" : score >= 40 ? "Good" : null;

  return (
    <Card className="overflow-hidden h-full flex flex-col hover-elevate group">
      <Link href={`/product/${product.slug}`} className="flex-1">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="h-10 w-10 text-muted-foreground/20" />
            </div>
          )}
          {tier && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">{tier}</Badge>
          )}
        </div>
        <CardContent className="p-3 flex-1">
          <p className="text-xs text-muted-foreground truncate">{product.seller?.sellerName}</p>
          <p className="font-medium text-sm line-clamp-2 mt-0.5">{product.name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold">£{parseFloat(product.price).toFixed(2)}</span>
            {(product.averageRating ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {product.averageRating?.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
      <div className="px-3 pb-3">
        <Button
          size="sm"
          variant={isInCompare ? "default" : "outline"}
          className="w-full text-xs h-7"
          onClick={(e) => { e.preventDefault(); onToggleCompare(); }}
          disabled={!canAddToCompare && !isInCompare}
        >
          <Scale className="h-3 w-3 mr-1" />
          {isInCompare ? "In comparison" : "Compare"}
        </Button>
      </div>
    </Card>
  );
}
