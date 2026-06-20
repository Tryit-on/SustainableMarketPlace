import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { CertificationBadge } from "@/components/CertificationBadge";
import {
  Package, ShoppingBag, BarChart3, User, ExternalLink,
  CheckCircle2, Clock, Copy, Leaf, ShieldCheck, Eye, EyeOff,
  CreditCard, Zap, AlertCircle, CheckCircle
} from "lucide-react";
import type { Product, SellerCertification, CertificationBody } from "@shared/schema";

export default function SellerDashboard() {
  const { tab } = useParams<{ tab?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(tab ?? "overview");

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Please log in.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const u = user as any;

  if (!u.isSeller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">You don't have a seller account yet.</p>
          <Button asChild><a href="/seller/apply">Apply to Become a Seller</a></Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (u.verificationStatus !== "verified") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">Your seller account is {u.verificationStatus === "pending" ? "under review" : u.verificationStatus}.</p>
          <Button asChild variant="outline"><a href="/seller/application">View Application Status</a></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{u.sellerName ?? "Seller Dashboard"}</h1>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">GreenMart Verified</span>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" />Products</TabsTrigger>
            <TabsTrigger value="payouts" className="gap-2"><CreditCard className="h-4 w-4" />Payouts</TabsTrigger>
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
            <TabsTrigger value="badge" className="gap-2"><ShieldCheck className="h-4 w-4" />Badge</TabsTrigger>
            <TabsTrigger value="orders" className="gap-2"><ShoppingBag className="h-4 w-4" />Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab userId={u.id} /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="payouts"><PayoutsTab /></TabsContent>
          <TabsContent value="profile"><ProfileTab user={u} /></TabsContent>
          <TabsContent value="badge"><BadgeTab user={u} /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function OverviewTab({ userId }: { userId: string }) {
  const { data: certs } = useQuery<(SellerCertification & { certificationBody: CertificationBody })[]>({
    queryKey: ["/api/seller/certifications"],
  });
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/seller/products"] });

  const published = products?.filter((p) => p.isPublished);
  const avgScore = published?.length
    ? Math.round(published.reduce((s, p) => s + (p.computedSustainabilityScore ?? 0), 0) / published.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Live Products" value={String(published?.length ?? 0)} icon={Package} />
        <StatCard label="Avg. Score" value={String(avgScore)} icon={Leaf} />
        <StatCard label="Certifications" value={String(certs?.filter((c) => c.isActive).length ?? 0)} icon={ShieldCheck} />
        <StatCard label="Total Products" value={String(products?.length ?? 0)} icon={BarChart3} />
      </div>

      {certs && certs.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your Certifications</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certs.map((cert) => {
                const daysLeft = cert.validUntil
                  ? Math.ceil((new Date(cert.validUntil as any).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                return (
                  <div key={cert.id} className="flex items-center justify-between">
                    <CertificationBadge certificationBody={cert.certificationBody} sellerCertification={cert} />
                    {daysLeft !== null && (
                      <span className={`text-xs ${daysLeft <= 30 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {daysLeft > 0 ? `Expires in ${daysLeft} days` : "Expired"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding checklist */}
      <OnboardingChecklist products={products} certs={certs} />
    </div>
  );
}

function PayoutsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connectStatus, isLoading: connectLoading } = useQuery<{
    connected: boolean;
    status: string | null;
    chargesEnabled?: boolean;
    payoutsEnabled?: boolean;
    accountId?: string;
  }>({
    queryKey: ["/api/seller/stripe/connect/status"],
  });

  const { data: subscription, isLoading: subLoading } = useQuery<{
    tier: string;
    subscriptionStatus: string | null;
    commissionRate: number;
    commissionPct: number;
    stripeSubscriptionId: string | null;
  }>({
    queryKey: ["/api/seller/subscription"],
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/seller/stripe/connect", {});
      return res.json() as Promise<{ onboardingUrl: string }>;
    },
    onSuccess: (data) => {
      window.location.href = data.onboardingUrl;
    },
    onError: () => {
      toast({ title: "Error", description: "Could not start Stripe onboarding. Please try again.", variant: "destructive" });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/seller/subscribe/pro", {});
      return res.json() as Promise<{ checkoutUrl: string }>;
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message ?? "Could not start subscription checkout.", variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/seller/subscribe/cancel", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/subscription"] });
      toast({ title: "Subscription cancellation scheduled", description: "Your Pro plan remains active until the end of the billing period." });
    },
  });

  if (connectLoading || subLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  }

  const isConnected = connectStatus?.connected && connectStatus?.chargesEnabled;
  const isPro = subscription?.tier === "pro" && subscription?.subscriptionStatus === "active";

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Stripe Payouts
          </CardTitle>
          <CardDescription>
            Connect your bank account to receive payouts when buyers purchase your products.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Payouts active</p>
                <p className="text-xs text-muted-foreground">Your bank account is connected and ready to receive transfers.</p>
              </div>
            </div>
          ) : connectStatus?.connected && !connectStatus?.chargesEnabled ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Onboarding incomplete</p>
                  <p className="text-xs text-muted-foreground">Stripe needs more information before you can receive payouts.</p>
                </div>
              </div>
              <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending} variant="outline">
                {connectMutation.isPending ? "Redirecting..." : "Continue Stripe Onboarding"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You haven't connected a bank account yet. Once connected, GreenMart will automatically transfer your earnings (minus the platform commission) after each sale.
              </p>
              <Button onClick={() => connectMutation.mutate()} disabled={connectMutation.isPending}>
                <CreditCard className="mr-2 h-4 w-4" />
                {connectMutation.isPending ? "Setting up..." : "Connect Bank Account"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission & Subscription Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Commission & Plan
          </CardTitle>
          <CardDescription>Your current commission rate and subscription tier.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold capitalize">{subscription?.tier ?? "Starter"}</p>
                {isPro && <Badge className="text-xs bg-emerald-600">Active</Badge>}
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-xs text-muted-foreground mb-1">Commission Rate</p>
              <p className="text-lg font-bold">{subscription?.commissionPct ?? 12}%</p>
              <p className="text-xs text-muted-foreground">per sale</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starter */}
            <div className={`p-4 rounded-lg border-2 ${!isPro ? "border-primary bg-primary/5" : "border-muted"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Starter</p>
                <p className="text-sm font-medium">Free</p>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 12% commission per sale</li>
                <li>• Up to 20 product listings</li>
                <li>• Basic seller dashboard</li>
                <li>• GreenMart Verified badge</li>
              </ul>
              {!isPro && (
                <Badge variant="outline" className="mt-3 text-xs">Current plan</Badge>
              )}
            </div>

            {/* Pro */}
            <div className={`p-4 rounded-lg border-2 ${isPro ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-muted"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Pro</p>
                <p className="text-sm font-medium">£29/month</p>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <span className="text-emerald-600 font-medium">8% commission per sale</span></li>
                <li>• Unlimited product listings</li>
                <li>• Full analytics dashboard</li>
                <li>• Featured placement eligibility</li>
              </ul>
              {isPro ? (
                <div className="mt-3 space-y-2">
                  <Badge className="text-xs bg-emerald-600">Active</Badge>
                  {subscription?.subscriptionStatus === "active" && (
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground h-auto p-0"
                        onClick={() => cancelMutation.mutate()}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? "Cancelling..." : "Cancel subscription"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => subscribeMutation.mutate()}
                  disabled={subscribeMutation.isPending}
                >
                  {subscribeMutation.isPending ? "Redirecting..." : "Upgrade to Pro"}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Commission is deducted from your payout — buyers always pay the listed price.
            Payouts are transferred to your connected bank account automatically after each confirmed sale.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function OnboardingChecklist({ products, certs }: { products?: Product[]; certs?: any[] }) {
  const { user } = useAuth();
  const u = user as any;

  const { data: connectStatus } = useQuery<{ connected: boolean; chargesEnabled?: boolean }>({
    queryKey: ["/api/seller/stripe/connect/status"],
  });

  const steps = [
    { done: true, label: "Application approved" },
    { done: (products?.length ?? 0) > 0, label: "Add your first product" },
    { done: !!(u?.sellerMission && u?.sellerStory), label: "Complete your seller profile" },
    { done: !!(connectStatus?.connected && connectStatus?.chargesEnabled), label: "Connect bank account for payouts" },
    { done: false, label: "Embed your GreenMart Verified badge" },
  ];
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  const pct = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Getting Started</CardTitle>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className={`flex items-center gap-2 text-sm ${step.done ? "text-muted-foreground line-through" : ""}`}>
              {step.done
                ? <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                : <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              }
              {step.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ProductsTab() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: products, isLoading } = useQuery<Product[]>({ queryKey: ["/api/seller/products"] });

  const togglePublish = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      await apiRequest("PATCH", `/api/seller/products/${id}/publish`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      toast({ title: "Product updated" });
    },
  });

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{products?.length ?? 0} products</p>
        <Button asChild size="sm"><a href="/seller/dashboard/new-product">Add Product</a></Button>
      </div>
      {products?.map((product) => (
        <Card key={product.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded object-cover" />
                : <div className="w-12 h-12 rounded bg-muted flex items-center justify-center"><Leaf className="h-5 w-5 text-muted-foreground/40" /></div>
              }
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">Score: {product.computedSustainabilityScore ?? 0}</span>
                  <span className="text-xs text-muted-foreground">· £{parseFloat(product.price).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {product.isPublished
                  ? <Eye className="h-4 w-4 text-primary" />
                  : <EyeOff className="h-4 w-4 text-muted-foreground" />
                }
                <Switch
                  checked={product.isPublished ?? false}
                  onCheckedChange={(v) => togglePublish.mutate({ id: product.id, isPublished: v })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {!products?.length && (
        <div className="text-center py-12">
          <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No products yet.</p>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mission, setMission] = useState(user.sellerMission ?? "");
  const [story, setStory] = useState(user.sellerStory ?? "");
  const [location, setLocation_] = useState(user.sellerLocation ?? "");
  const [founded, setFounded] = useState(user.sellerFoundedYear ?? "");

  const update = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/auth/user`, {
        sellerMission: mission,
        sellerStory: story,
        sellerLocation: location,
        sellerFoundedYear: founded ? parseInt(founded) : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile updated" });
    },
  });

  return (
    <div className="space-y-5 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Public Profile</CardTitle>
          <CardDescription>This appears on your public seller page at /sellers/{user.sellerSlug}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Mission Statement (1–3 sentences)</Label>
            <Textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={3} className="mt-1" placeholder="Why you do what you do..." />
          </div>
          <div>
            <Label>Your Story</Label>
            <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={6} className="mt-1" placeholder="How you started, how you make your products, what makes you different..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation_(e.target.value)} className="mt-1" placeholder="Bristol, UK" />
            </div>
            <div>
              <Label>Founded Year</Label>
              <Input value={founded} onChange={(e) => setFounded(e.target.value)} type="number" className="mt-1" placeholder="2019" />
            </div>
          </div>
          <Button onClick={() => update.mutate()} disabled={update.isPending}>Save Profile</Button>
        </CardContent>
      </Card>
      {user.sellerSlug && (
        <Button asChild variant="outline" className="w-full">
          <a href={`/sellers/${user.sellerSlug}`} target="_blank" rel="noopener noreferrer">
            View Public Profile <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}

function BadgeTab({ user }: { user: any }) {
  const { toast } = useToast();
  const slug = user.sellerSlug;
  const badgeHtml = `<a href="https://greenmart.com/sellers/${slug}" target="_blank" rel="noopener noreferrer">
  <img src="https://greenmart.com/api/badges/${slug}.svg" alt="GreenMart Verified Seller" width="200" />
</a>`;

  const copy = () => {
    navigator.clipboard.writeText(badgeHtml);
    toast({ title: "Badge code copied!" });
  };

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Verified Badge</CardTitle>
          <CardDescription>Embed this badge on your website to showcase your GreenMart verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {slug && (
            <div className="flex items-center justify-center p-6 bg-muted rounded-lg">
              <img src={`/api/badges/${slug}.svg`} alt="GreenMart Verified" width={200} />
            </div>
          )}
          <div>
            <Label className="text-xs">Embed Code</Label>
            <div className="relative mt-1">
              <pre className="text-xs bg-muted rounded p-3 overflow-x-auto whitespace-pre-wrap break-all">{badgeHtml}</pre>
              <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={copy}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            The badge links to your public seller profile. Buyers can click it to verify your certifications independently.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useQuery({ queryKey: ["/api/seller/orders"] });
  const { data: subscription } = useQuery<{ commissionPct: number }>({ queryKey: ["/api/seller/subscription"] });
  const orderList = orders as any[];
  const commissionPct = subscription?.commissionPct ?? 12;

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  if (!orderList?.length) return <div className="py-8 text-center text-muted-foreground">No orders yet.</div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Net payout shown after {commissionPct}% platform commission.
      </p>
      {orderList.map((order: any) => {
        const gross = parseFloat(order.totalAmount ?? "0");
        const fee = order.platformFeeAmount ? parseFloat(order.platformFeeAmount) : Math.round(gross * commissionPct) / 100;
        const net = order.sellerPayoutAmount ? parseFloat(order.sellerPayoutAmount) : gross - fee;
        return (
          <Card key={order.id}>
            <CardContent className="p-4 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Order #{order.id.slice(-8)}</p>
                <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">£{net.toFixed(2)} net</p>
                <p className="text-xs text-muted-foreground">£{gross.toFixed(2)} gross · −£{fee.toFixed(2)} fee</p>
                <Badge variant="outline" className="text-xs mt-1">{order.status}</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
