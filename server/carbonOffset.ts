// Carbon offset integration layer.
// Only active when CARBON_OFFSET_API_KEY is set — satisfies PRD principle "ship real or don't ship".
//
// To activate: set CARBON_OFFSET_API_KEY and CARBON_OFFSET_PROVIDER (default: "goldstandard").
// The API shape mirrors Gold Standard's offset purchase endpoint.
// When the key is absent, isEnabled() returns false and the checkout hides the offset option.

export type OffsetResult = {
  confirmationId: string;
  providerUrl: string;
  amountCharged: number; // GBP
  provider: string;
};

export function isOffsetEnabled(): boolean {
  return !!process.env.CARBON_OFFSET_API_KEY;
}

export async function purchaseOffset(carbonKg: number, currency = "gbp"): Promise<OffsetResult | null> {
  const apiKey = process.env.CARBON_OFFSET_API_KEY;
  if (!apiKey) return null;

  const provider = process.env.CARBON_OFFSET_PROVIDER ?? "goldstandard";

  // Gold Standard API endpoint (register at https://api.goldstandard.org)
  // Rate: ~£12–35/tonne = £0.012–0.035/kg — we fetch live rate from partner.
  const endpoint = process.env.CARBON_OFFSET_API_URL ?? "https://api.goldstandard.org/v1/offsets/purchase";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ carbonKg, currency }),
  });

  if (!response.ok) {
    throw new Error(`Carbon offset API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json() as {
    id: string;
    project_url: string;
    amount_charged: number;
  };

  return {
    confirmationId: data.id,
    providerUrl: data.project_url,
    amountCharged: data.amount_charged,
    provider,
  };
}

export async function getOffsetRate(): Promise<number | null> {
  const apiKey = process.env.CARBON_OFFSET_API_KEY;
  if (!apiKey) return null;

  const rateEndpoint = process.env.CARBON_OFFSET_RATE_URL ?? "https://api.goldstandard.org/v1/offsets/rate";
  try {
    const response = await fetch(rateEndpoint, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!response.ok) return null;
    const data = await response.json() as { rate_per_kg_gbp: number };
    return data.rate_per_kg_gbp;
  } catch {
    return null;
  }
}
