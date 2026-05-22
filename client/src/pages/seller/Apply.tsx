import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, FileCheck, ChevronRight, ChevronLeft, Loader2, Upload } from "lucide-react";
import type { CertificationBody } from "@shared/schema";

const PRODUCT_CATEGORIES = [
  "Kitchen & Food Storage",
  "Bathroom & Personal Care",
  "Cleaning & Laundry",
  "Home Textiles & Living",
];

type Step = "business" | "certifications" | "confirm";

export default function SellerApply() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("business");
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessWebsite, setBusinessWebsite] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<{ bodyId: string; certNumber: string; documentUrl: string; expiryDate: string }[]>([]);

  const { data: certBodies } = useQuery<CertificationBody[]>({
    queryKey: ["/api/certification-bodies"],
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const app = await apiRequest("POST", "/api/seller/apply", {
        businessName,
        businessWebsite,
        businessDescription,
        productCategories: selectedCategories,
      });
      const appData = await app.json();

      // Upload each document
      for (const cert of selectedCerts) {
        if (cert.documentUrl) {
          await apiRequest("POST", "/api/seller/documents", {
            applicationId: appData.id,
            certificationBodyId: cert.bodyId,
            certificationNumber: cert.certNumber,
            documentUrl: cert.documentUrl,
            documentType: "pdf",
            expiryDate: cert.expiryDate || null,
          });
        }
      }

      return appData;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message ?? "Submission failed", variant: "destructive" });
    },
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCert = (bodyId: string) => {
    setSelectedCerts((prev) =>
      prev.find((c) => c.bodyId === bodyId)
        ? prev.filter((c) => c.bodyId !== bodyId)
        : [...prev, { bodyId, certNumber: "", documentUrl: "", expiryDate: "" }]
    );
  };

  const updateCert = (bodyId: string, field: string, value: string) => {
    setSelectedCerts((prev) =>
      prev.map((c) => (c.bodyId === bodyId ? { ...c, [field]: value } : c))
    );
  };

  const canProceedStep1 =
    businessName.trim().length > 0 &&
    businessDescription.trim().length >= 100 &&
    selectedCategories.length > 0;

  const canProceedStep2 = selectedCerts.length > 0 && selectedCerts.every((c) => c.documentUrl);

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-16 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Application Submitted</h1>
          <p className="text-muted-foreground mb-6">
            We've received your application and certification documents. Our team reviews every application within 3 business days.
            You'll receive an email when we have a decision.
          </p>
          <Button asChild>
            <a href="/seller/application">Check Application Status</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-12 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Verified Seller</h1>
          <p className="text-muted-foreground">
            GreenMart only lists sellers with verified third-party certifications. This process
            takes 3–5 minutes and your application is reviewed within 3 business days.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {(["business", "certifications", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : i < ["business", "certifications", "confirm"].indexOf(step)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>
                {s === "business" ? "Business Details" : s === "certifications" ? "Certifications" : "Review & Submit"}
              </span>
              {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>

        {/* Step 1: Business details */}
        {step === "business" && (
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>Tell us about your business and the products you&apos;ll sell</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business or brand name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website (optional)</Label>
                <Input
                  id="website"
                  value={businessWebsite}
                  onChange={(e) => setBusinessWebsite(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">
                  Business Description * <span className="text-muted-foreground text-xs ml-1">({businessDescription.length}/100 min)</span>
                </Label>
                <Textarea
                  id="description"
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  placeholder="Describe what you make, how you make it, and why it qualifies as zero-waste..."
                  rows={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Product Categories * (select all that apply)</Label>
                <div className="mt-2 space-y-2">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <Checkbox
                        id={cat}
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleCategory(cat)}
                      />
                      <Label htmlFor={cat} className="cursor-pointer font-normal">{cat}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!canProceedStep1}
                onClick={() => setStep("certifications")}
              >
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Certifications */}
        {step === "certifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Certification Documents</CardTitle>
              <CardDescription>
                Select the certifications you hold and upload your documents. At least one is required.
                We manually review every document — genuine certifications only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {certBodies?.map((body) => {
                const selected = selectedCerts.find((c) => c.bodyId === body.id);
                return (
                  <div key={body.id} className={`rounded-lg border p-4 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border"}`}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={body.id}
                        checked={!!selected}
                        onCheckedChange={() => toggleCert(body.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor={body.id} className="font-medium cursor-pointer">
                          {body.name}
                        </Label>
                        <Badge variant="secondary" className="ml-2 text-xs">{body.category}</Badge>
                        {body.verificationUrl && (
                          <a
                            href={body.verificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-xs text-primary underline"
                          >
                            Learn more ↗
                          </a>
                        )}

                        {selected && (
                          <div className="mt-3 space-y-3">
                            <div>
                              <Label className="text-xs">Certificate Number (optional but recommended)</Label>
                              <Input
                                value={selected.certNumber}
                                onChange={(e) => updateCert(body.id, "certNumber", e.target.value)}
                                placeholder="e.g. SA-2024-12345"
                                className="mt-1 h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Document URL * (PDF or image link)</Label>
                              <div className="flex gap-2 mt-1">
                                <Input
                                  value={selected.documentUrl}
                                  onChange={(e) => updateCert(body.id, "documentUrl", e.target.value)}
                                  placeholder="https://your-storage.com/cert.pdf"
                                  className="h-8 text-sm"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Upload to Dropbox, Google Drive, or similar and paste the public link.
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs">Expiry Date (if applicable)</Label>
                              <Input
                                type="date"
                                value={selected.expiryDate}
                                onChange={(e) => updateCert(body.id, "expiryDate", e.target.value)}
                                className="mt-1 h-8 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("business")} className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button disabled={!canProceedStep2} onClick={() => setStep("confirm")} className="flex-1">
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && (
          <Card>
            <CardHeader>
              <CardTitle>Review & Submit</CardTitle>
              <CardDescription>Check your details before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <p className="text-sm font-medium">Business: {businessName}</p>
                {businessWebsite && <p className="text-sm text-muted-foreground">{businessWebsite}</p>}
                <p className="text-sm text-muted-foreground line-clamp-3">{businessDescription}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedCategories.map((c) => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Certifications ({selectedCerts.length})</p>
                <div className="space-y-2">
                  {selectedCerts.map((sc) => {
                    const body = certBodies?.find((b) => b.id === sc.bodyId);
                    return (
                      <div key={sc.bodyId} className="flex items-center gap-2 text-sm">
                        <FileCheck className="h-4 w-4 text-primary" />
                        {body?.name}
                        {sc.certNumber && <span className="text-muted-foreground">({sc.certNumber})</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  By submitting, you confirm these documents are genuine. False documents will result in
                  permanent account suspension.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("certifications")} className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                  onClick={() => applyMutation.mutate()}
                  disabled={applyMutation.isPending}
                  className="flex-1"
                >
                  {applyMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
