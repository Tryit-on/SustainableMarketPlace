import type { ProductWithDetails, ScoreBreakdown } from "@shared/schema";

// ─── Scoring methodology ───────────────────────────────────────────────────
// Total: 100 points across 6 dimensions.
// Score is computed deterministically from verified/declared product data.
// Sellers cannot edit computedSustainabilityScore directly.

const COUNTRY_PROXIMITY_SCORE: Record<string, number> = {
  GB: 10, IE: 10, FR: 9, DE: 9, NL: 9, BE: 9, SE: 8, DK: 8, NO: 8, FI: 8,
  ES: 8, PT: 8, IT: 8, AT: 8, CH: 8, PL: 7, CZ: 7, HU: 7, RO: 7,
  US: 5, CA: 5, AU: 4, NZ: 4,
};

function packagingScore(packagingType: string | null | undefined): { earned: number; label: string } {
  switch (packagingType) {
    case "plastic_free":
      return { earned: 25, label: "Plastic-free packaging" };
    case "minimal_plastic":
      return { earned: 15, label: "Minimal plastic, recycled content" };
    case "recycled":
      return { earned: 18, label: "Recycled materials packaging" };
    case "standard":
      return { earned: 8, label: "Standard packaging with offset claim" };
    default:
      return { earned: 0, label: "No declaration" };
  }
}

function certificationScore(certCount: number): { earned: number; label: string } {
  if (certCount >= 3) return { earned: 25, label: `${certCount} verified certifications` };
  if (certCount === 2) return { earned: 18, label: "2 verified certifications" };
  if (certCount === 1) return { earned: 10, label: "1 verified certification" };
  return { earned: 0, label: "No verified certifications" };
}

function materialsScore(materials: string | null | undefined): { earned: number; label: string } {
  if (!materials) return { earned: 0, label: "No materials declared" };
  const m = materials.toLowerCase();
  const organic = m.includes("organic") || m.includes("natural") || m.includes("plant");
  const recycled = m.includes("recycled") || m.includes("reclaimed");
  const sustainable = m.includes("bamboo") || m.includes("hemp") || m.includes("linen");
  const score = (organic ? 8 : 0) + (recycled ? 7 : 0) + (sustainable ? 5 : 0);
  return { earned: Math.min(score, 20), label: score > 0 ? "Natural/recycled/sustainable materials" : "Standard materials" };
}

function endOfLifeScore(endOfLife: string | null | undefined): { earned: number; label: string } {
  switch (endOfLife) {
    case "compostable":
      return { earned: 15, label: "Compostable at end of life" };
    case "recyclable":
      return { earned: 12, label: "Recyclable at end of life" };
    case "mixed":
      return { earned: 5, label: "Mixed end-of-life options" };
    case "landfill":
      return { earned: 0, label: "Landfill at end of life" };
    default:
      return { earned: 0, label: "End-of-life not declared" };
  }
}

function manufacturingLocationScore(country: string | null | undefined): { earned: number; label: string } {
  if (!country) return { earned: 0, label: "Manufacturing location not declared" };
  const score = COUNTRY_PROXIMITY_SCORE[country.toUpperCase()] ?? 2;
  return { earned: score, label: `Manufactured in ${country}` };
}

function carbonDataScore(method: string | null | undefined): { earned: number; label: string } {
  if (method === "lca_verified") return { earned: 5, label: "LCA-verified carbon data" };
  if (method === "category_default") return { earned: 3, label: "Category-average carbon data (ADEME)" };
  return { earned: 0, label: "No carbon data" };
}

function scoreTier(total: number): ScoreBreakdown["tier"] {
  if (total >= 80) return "Exceptional";
  if (total >= 60) return "Strong";
  if (total >= 40) return "Good";
  if (total >= 20) return "Developing";
  return "Unrated";
}

export async function computeSustainabilityScore(product: ProductWithDetails): Promise<ScoreBreakdown> {
  const packaging = packagingScore(product.packagingType);
  const certs = certificationScore(product.certifications?.length ?? 0);
  const mats = materialsScore(product.materials);
  const eol = endOfLifeScore(product.endOfLife);
  const location = manufacturingLocationScore(product.manufacturingCountry);
  const carbon = carbonDataScore(product.carbonFootprintMethod);

  const total = packaging.earned + certs.earned + mats.earned + eol.earned + location.earned + carbon.earned;

  return {
    packaging: { earned: packaging.earned, max: 25, label: packaging.label },
    certifications: { earned: certs.earned, max: 25, label: certs.label },
    materials: { earned: mats.earned, max: 20, label: mats.label },
    endOfLife: { earned: eol.earned, max: 15, label: eol.label },
    manufacturingLocation: { earned: location.earned, max: 10, label: location.label },
    carbonDataCompleteness: { earned: carbon.earned, max: 5, label: carbon.label },
    total: Math.min(total, 100),
    tier: scoreTier(Math.min(total, 100)),
  };
}
