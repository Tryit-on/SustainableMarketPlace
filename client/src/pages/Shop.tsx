import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Grid3X3,
  List
} from "lucide-react";
import type { ProductWithDetails, Category, Certification } from "@shared/schema";

export default function Shop() {
  const searchParams = useSearch();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(searchParams);

  const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") || "");
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>(
    params.get("certifications")?.split(",").filter(Boolean) || []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sustainabilityMin, setSustainabilityMin] = useState(0);
  const [sortBy, setSortBy] = useState(params.get("sort") || "featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const urlCategory = urlParams.get("category") || "";
    const urlSearch = urlParams.get("search") || "";
    const urlSort = urlParams.get("sort") || "featured";
    if (urlCategory !== selectedCategory) setSelectedCategory(urlCategory);
    if (urlSearch !== searchQuery) setSearchQuery(urlSearch);
    if (urlSort !== sortBy) setSortBy(urlSort);
  }, [searchParams]);

  const { data: products, isLoading: productsLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: certifications } = useQuery<Certification[]>({
    queryKey: ["/api/certifications"],
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category?.slug === selectedCategory);
    }

    // Certification filter
    if (selectedCertifications.length > 0) {
      filtered = filtered.filter((p) =>
        p.certifications?.some((c) => selectedCertifications.includes(c.slug))
      );
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const price = parseFloat(p.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sustainability filter
    if (sustainabilityMin > 0) {
      filtered = filtered.filter((p) => (p.sustainabilityScore || 0) >= sustainabilityMin);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
        break;
      case "rating":
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case "sustainability":
        filtered.sort(
          (a, b) => (b.sustainabilityScore || 0) - (a.sustainabilityScore || 0)
        );
        break;
      default:
        // featured - no specific sort
        break;
    }

    return filtered;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedCertifications,
    priceRange,
    sustainabilityMin,
    sortBy,
  ]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    selectedCertifications.length +
    (sustainabilityMin > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0);

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedCertifications([]);
    setPriceRange([0, 500]);
    setSustainabilityMin(0);
    setSearchQuery("");
  };

  const toggleCertification = (slug: string) => {
    setSelectedCertifications((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]
    );
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger className="text-sm font-semibold">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
              {categories?.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.slug ? "" : category.slug
                    )
                  }
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category.slug
                      ? "bg-primary text-primary-foreground"
                      : "hover-elevate"
                  }`}
                  data-testid={`filter-category-${category.slug}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Price Range */}
      <Accordion type="single" collapsible defaultValue="price">
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4 px-1">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                min={0}
                max={500}
                step={10}
                data-testid="slider-price"
              />
              <div className="flex items-center justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Certifications */}
      <Accordion type="single" collapsible defaultValue="certifications">
        <AccordionItem value="certifications">
          <AccordionTrigger className="text-sm font-semibold">Certifications</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {certifications?.map((cert) => (
                <div key={cert.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={cert.slug}
                    checked={selectedCertifications.includes(cert.slug)}
                    onCheckedChange={() => toggleCertification(cert.slug)}
                    data-testid={`filter-cert-${cert.slug}`}
                  />
                  <Label htmlFor={cert.slug} className="text-sm cursor-pointer">
                    {cert.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Sustainability Score */}
      <Accordion type="single" collapsible defaultValue="sustainability">
        <AccordionItem value="sustainability">
          <AccordionTrigger className="text-sm font-semibold">
            Sustainability Score
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4 px-1">
              <Slider
                value={[sustainabilityMin]}
                onValueChange={(value) => setSustainabilityMin(value[0])}
                min={0}
                max={100}
                step={10}
                data-testid="slider-sustainability"
              />
              <div className="flex items-center justify-between text-sm">
                <span>Min: {sustainabilityMin}</span>
                <span>100</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
          data-testid="button-clear-filters"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Shop Sustainable Products</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} products available
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary">{activeFiltersCount}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FilterContent />
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-product-search"
                  />
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="sustainability">Sustainability Score</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mobile Filters Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2" data-testid="button-mobile-filters">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters */}
              {(selectedCategory ||
                selectedCertifications.length > 0 ||
                searchQuery) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {categories?.find((c) => c.slug === selectedCategory)?.name}
                      <button onClick={() => setSelectedCategory("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCertifications.map((cert) => (
                    <Badge key={cert} variant="secondary" className="gap-1">
                      {certifications?.find((c) => c.slug === cert)?.name}
                      <button onClick={() => toggleCertification(cert)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {productsLoading ? (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </Card>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
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
