import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2, XCircle, MessageSquare, FileCheck } from "lucide-react";

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Under Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300", desc: "Our team is reviewing your application. We aim to respond within 3 business days." },
  approved: { icon: CheckCircle2, label: "Approved", color: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300", desc: "Congratulations! Your seller account is active. You can now list products." },
  rejected: { icon: XCircle, label: "Not Approved", color: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300", desc: "Your application was not approved at this time. See notes below." },
  info_requested: { icon: MessageSquare, label: "Information Needed", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300", desc: "We need more information from you. See notes below." },
};

export default function ApplicationStatus() {
  const { data: application, isLoading, error } = useQuery({
    queryKey: ["/api/seller/application"],
    retry: false,
  });

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

  if (error || !application) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-16 max-w-lg mx-auto text-center">
          <p className="text-muted-foreground mb-4">No application found.</p>
          <Button asChild><Link href="/seller/apply">Start an Application</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  const app = application as any;
  const status = (app.status as keyof typeof STATUS_CONFIG) ?? "pending";
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-12 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Application Status</h1>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <Badge className={`${config.color} border-0 mb-1`}>{config.label}</Badge>
                <p className="text-sm text-muted-foreground">{config.desc}</p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Business name</span>
                <span className="font-medium">{app.businessName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span>{new Date(app.submittedAt).toLocaleDateString("en-GB")}</span>
              </div>
              {app.reviewedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviewed</span>
                  <span>{new Date(app.reviewedAt).toLocaleDateString("en-GB")}</span>
                </div>
              )}
            </div>

            {app.adminNotes && (
              <div className="mt-4 p-3 rounded-lg bg-muted">
                <p className="text-xs font-medium mb-1 text-muted-foreground">Notes from our team</p>
                <p className="text-sm">{app.adminNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {app.documents?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {app.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between text-sm p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <span>{doc.certificationBody?.name ?? "Document"}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      doc.status === "verified"
                        ? "text-green-700 border-green-200"
                        : doc.status === "rejected"
                        ? "text-red-700 border-red-200"
                        : "text-amber-700 border-amber-200"
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {status === "approved" && (
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/seller/dashboard">Go to Seller Dashboard</Link>
            </Button>
          </div>
        )}

        {(status === "rejected" || status === "info_requested") && (
          <div className="mt-6">
            <Button asChild variant="outline" className="w-full">
              <Link href="/seller/apply">Submit a New Application</Link>
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
