import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Leaf, 
  Recycle, 
  Globe2,
  FileCheck,
  Loader2
} from "lucide-react";
import type { User } from "@shared/schema";

const verificationFormSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  businessDescription: z.string().min(50, "Please provide a detailed description (at least 50 characters)"),
  sustainabilityPractices: z.string().min(50, "Please describe your sustainability practices (at least 50 characters)"),
  certifications: z.string().optional(),
  supplyChainInfo: z.string().min(30, "Please provide supply chain information"),
  commitments: z.array(z.string()).min(2, "Please agree to at least 2 sustainability commitments"),
});

type VerificationFormValues = z.infer<typeof verificationFormSchema>;

interface SellerVerificationCardProps {
  user: User;
}

const sustainabilityCommitments = [
  { id: "eco-packaging", label: "Use eco-friendly packaging materials" },
  { id: "carbon-offset", label: "Offset carbon emissions from shipping" },
  { id: "ethical-sourcing", label: "Source materials ethically and sustainably" },
  { id: "fair-wages", label: "Ensure fair wages throughout supply chain" },
  { id: "waste-reduction", label: "Minimize waste in production processes" },
  { id: "transparency", label: "Maintain full supply chain transparency" },
];

export function SellerVerificationCard({ user }: SellerVerificationCardProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      businessName: user.sellerName || "",
      businessDescription: user.sellerDescription || "",
      sustainabilityPractices: "",
      certifications: "",
      supplyChainInfo: "",
      commitments: [],
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: VerificationFormValues) => {
      await apiRequest("POST", "/api/seller/verification/apply", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Application submitted",
        description: "Your verification application has been submitted. We'll review it within 2-3 business days.",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VerificationFormValues) => {
    applyMutation.mutate(data);
  };

  if (user.sellerVerified) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Verified Seller
            </CardTitle>
            <Badge className="bg-primary text-primary-foreground">
              Verified
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your seller account is verified. This badge appears on all your products and helps build customer trust.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-background rounded-lg">
              <Leaf className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Eco Certified</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Recycle className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Sustainable</p>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Globe2 className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">Fair Trade</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Seller Verification
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Not Verified
          </Badge>
        </div>
        <CardDescription>
          Get verified to increase customer trust and visibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p className="font-medium">Benefits of verification:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Verified badge on all your products
            </li>
            <li className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary shrink-0" />
              Higher visibility in search results
            </li>
            <li className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-primary shrink-0" />
              Access to sustainability certifications
            </li>
          </ul>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" data-testid="button-apply-verification">
              Apply for Verification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sustainability Verification Application</DialogTitle>
              <DialogDescription>
                Complete this form to apply for seller verification. We review applications within 2-3 business days.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your business or brand name" data-testid="input-business-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business, products, and mission..."
                          className="min-h-[80px]"
                          data-testid="input-business-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sustainabilityPractices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sustainability Practices</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your sustainability practices, eco-friendly initiatives, and environmental commitments..."
                          className="min-h-[100px]"
                          data-testid="input-sustainability-practices"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Include details about materials, manufacturing, packaging, and shipping
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Existing Certifications (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Fair Trade, GOTS, B-Corp, USDA Organic..."
                          data-testid="input-certifications"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        List any sustainability or ethical certifications you already hold
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplyChainInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supply Chain Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your supply chain, sourcing practices, and how you ensure ethical standards..."
                          className="min-h-[80px]"
                          data-testid="input-supply-chain"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="commitments"
                  render={() => (
                    <FormItem>
                      <FormLabel>Sustainability Commitments</FormLabel>
                      <FormDescription className="text-xs">
                        Select the commitments you agree to uphold as a verified seller
                      </FormDescription>
                      <div className="space-y-2 mt-2">
                        {sustainabilityCommitments.map((commitment) => (
                          <FormField
                            key={commitment.id}
                            control={form.control}
                            name="commitments"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(commitment.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, commitment.id]);
                                      } else {
                                        field.onChange(current.filter((id) => id !== commitment.id));
                                      }
                                    }}
                                    data-testid={`checkbox-commitment-${commitment.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {commitment.label}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200">Important Note</p>
                      <p className="text-amber-700 dark:text-amber-300 mt-1">
                        By submitting this application, you confirm that all information is accurate and agree to comply with GreenMart's sustainability standards.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={applyMutation.isPending} data-testid="button-submit-verification">
                    {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
