import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertificationBadge } from "@/components/CertificationBadge";
import { Leaf, CheckCircle2, XCircle, Minus, ArrowLeft, ShoppingCart } from "lucide-react";
import type { ProductWithDetails } from "@shared/schema";

function scoreTier(score: number | null): { label: string; className: string } {
  if (!score || score === 0) return { label: "Unrated", className: "bg-muted text-muted-foreground" };
  if (score >= 80) return { label: "Exceptional", className: "bg-emerald-100 text-emerald-700" };
  if (score >= 60) return { label: "Strong", className: "bg-green-100 text-green-700" };
  if (score >= 40) return { label: "Good", className: "bg-lime-100 text-lime-700" };
  return { label: "Developing", className: "bg-amber-100 text-amber-700" };
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`p-4 text-sm align-top border-b border-border ${className}`}>{children}</td>;
}

function RowLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <td className="p-4 text-sm font-medium text-muted-foreground bg-muted/30 border-b border-border whitespace-nowrap w-40">
      {label}
      {sub && <div className="text-xs font-normal mt-0.5">{sub}</div>}
    </td>
  );
}

function BoolCell({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) return <Cell><Minus className="h-4 w-4 text-muted-foreground/40" /></Cell>;
  return (
    <Cell>
      {value
        ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        : <XCircle className="h-4 w-4 text-muted-foreground/40" />
      }
    </Cell>
  );
}

const PACKAGING_LABELS: Record<string, string> = {
  plastic_free: "Plastic-free",
  recycled: "Recycled materials",
  minimal_plastic: "Minimal plastic",
  standard: "Standard",
};

export default function Compare() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  const { data: products, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products/compare", ids.join(",")],
    queryFn: async () => {
      if (!ids.length) return [];
      const res = await fetch(`/api/products/compare?ids=${ids.join(",")}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: ids.length > 0,
  });

  const cols = products ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 max-w-5xl mx-auto py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/shop">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to shop
            </button>
          </Link>
          <h1 className="text-xl font-bold">Compare Products</h1>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {!isLoading && cols.length === 0 && (
          <div className="text-center py-20">
            <Leaf className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No products selected for comparison.</p>
            <Button asChild variant="outline">
              <Link href="/shop">Browse shop</Link>
            </Button>
          </div>
        )}

        {cols.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-40" />
                  {cols.map((p) => (
                    <th key={p.id} className="p-4 text-left align-top border-b border-border">
                      <Link href={`/product/${p.slug}`}>
                        <div className="group">
                          <div className="aspect-square w-24 rounded-lg overflow-hidden bg-muted mb-3">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Leaf className="h-6 w-6 text-muted-foreground/30" /></div>
                            }
                          </div>
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{p.name}</p>
                          {p.sellerName && (
                            <p className="text-xs text-muted-foreground mt-0.5">{p.sellerName}</p>
                          )}
                        </div>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr>
                  <RowLabel label="Price" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      <span className="font-bold text-base">£{parseFloat(p.price).toFixed(2)}</span>
                    </Cell>
                  ))}
                </tr>

                {/* Sustainability score */}
                <tr>
                  <RowLabel label="Sustainability Score" sub="out of 100" />
                  {cols.map((p) => {
                    const score = p.computedSustainabilityScore ?? 0;
                    const tier = scoreTier(score);
                    return (
                      <Cell key={p.id}>
                        {score > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">{score}</span>
                            <Badge className={`${tier.className} border-0 text-xs`}>{tier.label}</Badge>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Unrated</span>
                        )}
                      </Cell>
                    );
                  })}
                </tr>

                {/* Certifications */}
                <tr>
                  <RowLabel label="Certifications" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.certifications && p.certifications.length > 0 ? (
                        <div className="space-y-1.5">
                          {p.certifications.map((cert) => (
                            <CertificationBadge
                              key={cert.id}
                              certificationBody={cert.certificationBody}
                              sellerCertification={cert as any}
                              size="sm"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">None verified</span>
                      )}
                    </Cell>
                  ))}
                </tr>

                {/* Packaging */}
                <tr>
                  <RowLabel label="Packaging" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.packagingType
                        ? <span>{PACKAGING_LABELS[p.packagingType] ?? p.packagingType}</span>
                        : <span className="text-muted-foreground text-xs">Not specified</span>
                      }
                    </Cell>
                  ))}
                </tr>

                {/* End of life */}
                <tr>
                  <RowLabel label="End of Life" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.endOfLife
                        ? <span className="capitalize">{p.endOfLife.replace(/_/g, " ")}</span>
                        : <span className="text-muted-foreground text-xs">Not specified</span>
                      }
                    </Cell>
                  ))}
                </tr>

                {/* Carbon footprint */}
                <tr>
                  <RowLabel label="Carbon Footprint" sub="kg CO₂e per unit" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.carbonFootprint ? (
                        <div>
                          <span className="font-semibold">{parseFloat(p.carbonFootprint).toFixed(2)} kg</span>
                          {p.carbonFootprintMethod && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {p.carbonFootprintMethod === "lca_verified" ? "LCA verified" : "Category average"}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No data</span>
                      )}
                    </Cell>
                  ))}
                </tr>

                {/* Manufacturing */}
                <tr>
                  <RowLabel label="Made In" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.manufacturingCountry ?? <span className="text-muted-foreground text-xs">Unknown</span>}
                    </Cell>
                  ))}
                </tr>

                {/* Seller */}
                <tr>
                  <RowLabel label="Seller" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.seller?.sellerSlug ? (
                        <Link href={`/sellers/${p.seller.sellerSlug}`}>
                          <span className="text-primary underline text-sm">{p.seller.sellerName}</span>
                        </Link>
                      ) : (
                        <span className="text-sm">{p.seller?.sellerName ?? "—"}</span>
                      )}
                    </Cell>
                  ))}
                </tr>

                {/* Rating */}
                <tr>
                  <RowLabel label="Rating" />
                  {cols.map((p) => (
                    <Cell key={p.id}>
                      {p.rating && parseFloat(p.rating) > 0 ? (
                        <div>
                          <span className="font-semibold">{parseFloat(p.rating).toFixed(1)}</span>
                          <span className="text-muted-foreground text-xs"> / 5</span>
                          {p.reviewCount ? (
                            <div className="text-xs text-muted-foreground">({p.reviewCount} reviews)</div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No reviews yet</span>
                      )}
                    </Cell>
                  ))}
                </tr>

                {/* CTA */}
                <tr>
                  <td className="p-4 bg-muted/30" />
                  {cols.map((p) => (
                    <td key={p.id} className="p-4">
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/product/${p.slug}`}>
                          <ShoppingCart className="h-4 w-4 mr-2" /> View Product
                        </Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
