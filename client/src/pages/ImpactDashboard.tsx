import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, ShoppingBag, Award, TrendingUp, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ImpactData {
  lifetimeCarbonAvoidedKg: number;
  lifetimeCarbonOffsetKg: number;
  lifetimeCertifiedProducts: number;
  orderCount: number;
  orders: Array<{
    id: string;
    createdAt: string;
    total: string;
    carbonKgTotal: number | null;
    status: string;
    items: Array<{ productName: string; quantity: number }>;
  }>;
}

const MILESTONES = [
  { kg: 5, label: "First 5 kg avoided", icon: "🌱" },
  { kg: 20, label: "20 kg avoided", icon: "🌿" },
  { kg: 50, label: "50 kg avoided", icon: "🌳" },
  { kg: 100, label: "100 kg avoided", icon: "🏆" },
  { kg: 250, label: "250 kg avoided", icon: "🌍" },
];

export default function ImpactDashboard() {
  const { user } = useAuth();

  const { data: impact, isLoading } = useQuery<ImpactData>({
    queryKey: ["/api/account/impact"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Sign in to see your impact.</p>
            <Button asChild><Link href="/login">Sign in</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  const avoided = impact?.lifetimeCarbonAvoidedKg ?? 0;
  const certified = impact?.lifetimeCertifiedProducts ?? 0;
  const orders = impact?.orderCount ?? 0;
  const nextMilestone = MILESTONES.find((m) => m.kg > avoided);
  const achievedMilestones = MILESTONES.filter((m) => m.kg <= avoided);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 py-12">
        <div className="container px-4 max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Your Impact</h1>
          <p className="text-muted-foreground">Every certified purchase contributes to measurable change.</p>
        </div>
      </section>

      <main className="flex-1 container px-4 max-w-4xl mx-auto py-10 space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Leaf className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">{avoided.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground mt-1">kg CO₂e avoided</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">vs. conventional equivalents</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">{certified}</p>
              <p className="text-sm text-muted-foreground mt-1">certified products bought</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">with verified sustainability credentials</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-primary">{orders}</p>
              <p className="text-sm text-muted-foreground mt-1">orders placed</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">all from verified sellers</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Next milestone: {nextMilestone.icon} {nextMilestone.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{avoided.toFixed(1)} kg</span>
                <span>{nextMilestone.kg} kg</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (avoided / nextMilestone.kg) * 100).toFixed(1)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {(nextMilestone.kg - avoided).toFixed(1)} kg to go
              </p>
            </CardContent>
          </Card>
        )}

        {/* Achieved milestones */}
        {achievedMilestones.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Milestones achieved</h2>
            <div className="flex flex-wrap gap-3">
              {achievedMilestones.map((m) => (
                <div key={m.kg} className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-full px-4 py-2">
                  <span className="text-lg">{m.icon}</span>
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carbon offset note */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-5 flex gap-3">
            <Leaf className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Carbon offset — coming soon</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                We're integrating with a verified partner (Gold Standard) before offering carbon offset purchases.
                When live, you'll be able to offset your remaining footprint with certified credits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order history */}
        {impact?.orders && impact.orders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Order history</h2>
            <div className="space-y-3">
              {impact.orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                        <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-GB")} ·{" "}
                        {order.items?.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">£{parseFloat(order.total).toFixed(2)}</p>
                      {order.carbonKgTotal && (
                        <p className="text-xs text-muted-foreground">{order.carbonKgTotal.toFixed(2)} kg CO₂e</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {impact?.orders?.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet. Start shopping to build your impact.</p>
            <Button asChild><Link href="/shop">Browse verified products</Link></Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
