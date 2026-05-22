import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Clock, CheckCircle2, XCircle, AlertTriangle, Search, ExternalLink, MessageSquare } from "lucide-react";
import type { SellerApplicationWithDocs } from "@shared/schema";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
  info_requested: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  if (!(user as any)?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Admin access required.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Badge variant="secondary">Admin</Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending Applications</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Certs</TabsTrigger>
            <TabsTrigger value="qa">Q&A Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ApplicationList status="pending" search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="approved">
            <ApplicationList status="approved" search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="rejected">
            <ApplicationList status="rejected" search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="expiring">
            <ExpiringCerts />
          </TabsContent>
          <TabsContent value="qa">
            <QAModeration />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function ApplicationList({ status, search, setSearch }: { status: string; search: string; setSearch: (s: string) => void }) {
  const { data: applications, isLoading } = useQuery<SellerApplicationWithDocs[]>({
    queryKey: ["/api/admin/applications", status],
    queryFn: async () => {
      const res = await fetch(`/api/admin/applications?status=${status}`, { credentials: "include" });
      return res.json();
    },
  });

  const filtered = applications?.filter((a) =>
    !search || a.businessName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by business name..." className="pl-10" />
      </div>

      {isLoading && <div className="py-8 text-center text-muted-foreground">Loading...</div>}

      {!isLoading && !filtered?.length && (
        <div className="py-8 text-center text-muted-foreground">No {status} applications.</div>
      )}

      {filtered?.map((app) => (
        <Card key={app.id} className="hover-elevate">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{app.businessName}</span>
                <Badge className={`${STATUS_BADGE[app.status ?? "pending"]} border-0 text-xs`}>{app.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {app.user?.email} · {app.documents?.length ?? 0} document(s) · Submitted {new Date(app.submittedAt!).toLocaleDateString("en-GB")}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {app.productCategories?.map((c: string) => (
                  <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/applications/${app.id}`}>
                Review <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExpiringCerts() {
  const { data: certs, isLoading } = useQuery({
    queryKey: ["/api/admin/expiring-certs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/expiring-certs?days=60", { credentials: "include" });
      return res.json();
    },
  });

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  if (!certs?.length) return <div className="py-8 text-center text-muted-foreground">No certifications expiring within 60 days.</div>;

  return (
    <div className="space-y-3">
      {certs.map((cert: any) => {
        const daysLeft = Math.ceil((new Date(cert.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <Card key={cert.id} className={daysLeft <= 7 ? "border-red-200" : daysLeft <= 30 ? "border-amber-200" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{cert.user?.sellerName ?? "Unknown Seller"}</p>
                <p className="text-sm text-muted-foreground">{cert.certificationBody?.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cert.user?.email}</p>
              </div>
              <div className="text-right">
                <Badge
                  className={`${
                    daysLeft <= 7
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                      : daysLeft <= 30
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  } border-0`}
                >
                  {daysLeft} days left
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires {new Date(cert.validUntil).toLocaleDateString("en-GB")}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function QAModeration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pendingQA, isLoading } = useQuery({
    queryKey: ["/api/admin/qa"],
    queryFn: async () => {
      const res = await fetch("/api/admin/qa", { credentials: "include" });
      return res.json();
    },
  });

  const updateQA = useMutation({
    mutationFn: async ({ id, isApproved, answer }: { id: string; isApproved: boolean; answer?: string }) => {
      const res = await fetch(`/api/admin/qa/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isApproved, answer }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/qa"] });
      toast({ title: "Q&A updated" });
    },
  });

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  if (!pendingQA?.length) return <div className="py-8 text-center text-muted-foreground">No pending Q&A items.</div>;

  return (
    <div className="space-y-4">
      {pendingQA.map((qa: any) => (
        <Card key={qa.id}>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Product: {qa.product?.name}</p>
              <p className="font-medium mt-1">{qa.question}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => updateQA.mutate({ id: qa.id, isApproved: true })}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => updateQA.mutate({ id: qa.id, isApproved: false })}>Reject</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
