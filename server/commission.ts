// Commission rates by subscription tier.
// Starter: 12%  |  Pro: 8%  |  override via PLATFORM_COMMISSION_RATE env var.

const ENV_RATE = process.env.PLATFORM_COMMISSION_RATE
  ? parseFloat(process.env.PLATFORM_COMMISSION_RATE)
  : null;

const TIER_RATES: Record<string, number> = {
  starter: 0.12,
  pro: 0.08,
};

export function getCommissionRate(subscriptionTier?: string | null): number {
  if (ENV_RATE !== null && !isNaN(ENV_RATE)) return ENV_RATE;
  return TIER_RATES[subscriptionTier ?? "starter"] ?? TIER_RATES.starter;
}

export function calculateFee(subtotalGbp: number, subscriptionTier?: string | null): {
  platformFee: number;
  sellerPayout: number;
  commissionRate: number;
} {
  const commissionRate = getCommissionRate(subscriptionTier);
  const platformFee = Math.round(subtotalGbp * commissionRate * 100) / 100;
  const sellerPayout = Math.round((subtotalGbp - platformFee) * 100) / 100;
  return { platformFee, sellerPayout, commissionRate };
}
