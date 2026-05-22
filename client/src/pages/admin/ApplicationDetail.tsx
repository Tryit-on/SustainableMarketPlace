import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, MessageSquare, FileText, ExternalLink, ArrowLeft, Loader2 } from "lucide-react";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [adminNotes, setAdminNotes] = useState("");
  const [decision, setDecision] = useState("");
  const [docStatuses, setDocStatuses] = useState<Record<string, string>>({});

  const { data: application, isLoading } = useQuery({
    queryKey: ["/api/admin/applications", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/applications/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const updateApp = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: decision, adminNotes }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Application updated" });
      setLocation("/admin");
    },
    onError: () => toast({ title: "Error updating application", variant: "destructive" }),
  });

  const updateDoc = useMutation({
    mutationFn: async ({ docId, status }: { docId: string; status: string }) => {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: (_, { docId, status }) => {
      setDocStatuses((prev) => ({ ...prev, [docId]: status }));
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications", id] });
      toast({ title: `Document ${status}` });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Application not found.</p>
        </main>
      </div>
    );
  }

  const app = application as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 max-w-3xl mx-auto">
        <button
          onClick={() => setLocation("/admin")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold">{app.businessName}</h1>
          <Badge variant="secondary">{app.status}</Badge>
        </div>

        {/* Business info */}
        <Card className="mb-5">
          <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact</span>
              <span>{app.user?.email}</span>
            </div>
            {app.businessWebsite && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Website</span>
                <a href={app.businessWebsite} target="_blank" rel="noopener noreferrer" className="text-primary underline flex items-center gap-1">
                  {app.businessWebsite} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1">Description</p>
              <p className="bg-muted rounded p-3">{app.businessDescription}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {app.productCategories?.map((c: string) => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="mb-5">
          <CardHeader><CardTitle className="text-base">Certification Documents ({app.documents?.length ?? 0})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {app.documents?.map((doc: any) => {
              const currentStatus = docStatuses[doc.id] ?? doc.status;
              return (
                <div key={doc.id} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{doc.certificationBody?.name ?? "Unknown certification"}</p>
                      {doc.certificationNumber && (
                        <p className="text-xs text-muted-foreground">Cert #: {doc.certificationNumber}</p>
                      )}
                      {doc.expiryDate && (
                        <p className="text-xs text-muted-foreground">Expires: {new Date(doc.expiryDate).toLocaleDateString("en-GB")}</p>
                      )}
                    </div>
                    <Badge
                      className={`border-0 text-xs ${
                        currentStatus === "verified"
                          ? "bg-green-100 text-green-700"
                          : currentStatus === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {currentStatus}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary underline"
                    >
                      <FileText className="h-4 w-4" /> View Document ↗
                    </a>
                    {doc.certificationBody?.verificationUrl && (
                      <a
                        href={doc.certificationBody.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground underline"
                      >
                        Verify on {doc.certificationBody.name} ↗
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={currentStatus === "verified" ? "default" : "outline"}
                      disabled={updateDoc.isPending}
                      onClick={() => updateDoc.mutate({ docId: doc.id, status: "verified" })}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Verify
                    </Button>
                    <Button
                      size="sm"
                      variant={currentStatus === "rejected" ? "destructive" : "outline"}
                      disabled={updateDoc.isPending}
                      onClick={() => updateDoc.mutate({ docId: doc.id, status: "rejected" })}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Decision */}
        <Card>
          <CardHeader><CardTitle className="text-base">Application Decision</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Decision</Label>
              <Select value={decision} onValueChange={setDecision}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a decision..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve — activate seller account</SelectItem>
                  <SelectItem value="rejected">Reject — decline application</SelectItem>
                  <SelectItem value="info_requested">Request more information</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes to seller {decision === "rejected" || decision === "info_requested" ? "*" : "(optional)"}</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Reason for decision or information needed..."
                rows={4}
                className="mt-1"
              />
            </div>
            <Button
              className="w-full"
              disabled={!decision || updateApp.isPending || ((decision === "rejected" || decision === "info_requested") && !adminNotes)}
              onClick={() => updateApp.mutate()}
            >
              {updateApp.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                `Submit Decision: ${decision || "—"}`
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
