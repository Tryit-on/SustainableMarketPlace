import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Leaf } from "lucide-react";
import type { Category, Certification, Product } from "@shared/schema";

const productFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  originalPrice: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  sustainabilityScore: z.string().refine(
    (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0 && parseInt(val) <= 100),
    { message: "Score must be between 0 and 100" }
  ),
  materials: z.string().optional(),
  carbonFootprint: z.string().optional(),
  lifecycle: z.string().optional(),
  stockQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "Stock must be a non-negative number",
  }),
  certificationIds: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  product?: Product;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ProductFormDialog({ product, trigger, onSuccess }: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const isEditing = !!product;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: certifications = [] } = useQuery<Certification[]>({
    queryKey: ["/api/certifications"],
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      categoryId: product?.categoryId || "",
      price: product?.price || "",
      originalPrice: product?.originalPrice || "",
      imageUrl: product?.imageUrl || "",
      sustainabilityScore: product?.sustainabilityScore?.toString() || "70",
      materials: product?.materials || "",
      carbonFootprint: product?.carbonFootprint || "",
      lifecycle: product?.lifecycle || "",
      stockQuantity: product?.stockQuantity?.toString() || "100",
      certificationIds: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const payload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        originalPrice: data.originalPrice || null,
        imageUrl: data.imageUrl || null,
        sustainabilityScore: parseInt(data.sustainabilityScore) || 70,
        materials: data.materials || null,
        carbonFootprint: data.carbonFootprint || null,
        lifecycle: data.lifecycle || null,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        inStock: parseInt(data.stockQuantity) > 0,
        certificationIds: data.certificationIds || [],
      };
      await apiRequest("POST", "/api/seller/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "Your product has been added to the marketplace.",
      });
      form.reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const payload = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        originalPrice: data.originalPrice || null,
        imageUrl: data.imageUrl || null,
        sustainabilityScore: parseInt(data.sustainabilityScore) || 70,
        materials: data.materials || null,
        carbonFootprint: data.carbonFootprint || null,
        lifecycle: data.lifecycle || null,
        stockQuantity: parseInt(data.stockQuantity) || 0,
        inStock: parseInt(data.stockQuantity) > 0,
      };
      await apiRequest("PATCH", `/api/seller/products/${product?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seller/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "Your product has been updated.",
      });
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormValues) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2" data-testid="button-add-product">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your product details below."
              : "Add a new sustainable product to your store."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Organic Cotton T-Shirt" data-testid="input-product-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product, its sustainability features, and why customers will love it..."
                      className="min-h-[100px]"
                      data-testid="input-product-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="29.99" data-testid="input-product-price" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="39.99" data-testid="input-product-original-price" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Optional, for sale items</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="100" data-testid="input-product-stock" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" data-testid="input-product-image" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Direct URL to your product image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border rounded-lg p-4 space-y-4 bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-medium">
                <Leaf className="h-5 w-5" />
                Sustainability Information
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sustainabilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sustainability Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" placeholder="85" data-testid="input-sustainability-score" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Higher scores indicate more sustainable products
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carbonFootprint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carbon Footprint (kg CO2)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" placeholder="2.5" data-testid="input-carbon-footprint" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="materials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Materials</FormLabel>
                    <FormControl>
                      <Input placeholder="100% Organic Cotton, Recycled Polyester" data-testid="input-materials" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifecycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lifecycle & Care</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="How to care for this product to extend its life..."
                        className="min-h-[60px]"
                        data-testid="input-lifecycle"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isEditing && (
                <FormField
                  control={form.control}
                  name="certificationIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Certifications</FormLabel>
                      <FormDescription className="text-xs">
                        Select all certifications that apply to your product
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {certifications.map((cert) => (
                          <FormField
                            key={cert.id}
                            control={form.control}
                            name="certificationIds"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(cert.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, cert.id]);
                                      } else {
                                        field.onChange(current.filter((id) => id !== cert.id));
                                      }
                                    }}
                                    data-testid={`checkbox-cert-${cert.slug}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {cert.name}
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
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} data-testid="button-submit-product">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
