import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Leaf, Truck, Plane, Ship, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShippingOption {
  id: string;
  name: string;
  icon: typeof Truck;
  deliveryDays: string;
  price: number;
  carbonKg: number;
  description: string;
}

const shippingOptions: ShippingOption[] = [
  {
    id: "ground-eco",
    name: "Ground Eco",
    icon: Truck,
    deliveryDays: "7-10 days",
    price: 0,
    carbonKg: 0.5,
    description: "Lowest emissions, consolidated shipping",
  },
  {
    id: "ground-standard",
    name: "Ground Standard",
    icon: Truck,
    deliveryDays: "5-7 days",
    price: 4.99,
    carbonKg: 0.8,
    description: "Reliable ground shipping",
  },
  {
    id: "express",
    name: "Express",
    icon: Plane,
    deliveryDays: "2-3 days",
    price: 9.99,
    carbonKg: 2.5,
    description: "Air freight for faster delivery",
  },
  {
    id: "overnight",
    name: "Overnight",
    icon: Plane,
    deliveryDays: "1 day",
    price: 19.99,
    carbonKg: 4.2,
    description: "Priority air delivery",
  },
];

interface CarbonFootprintCalculatorProps {
  productCarbonFootprint?: number;
  carbonFootprintMethod?: string | null;
  onShippingSelect?: (option: ShippingOption) => void;
  compact?: boolean;
}

const getCarbonColor = (kg: number) => {
  if (kg <= 1) return "text-green-600 dark:text-green-400";
  if (kg <= 2) return "text-lime-600 dark:text-lime-400";
  if (kg <= 3) return "text-yellow-600 dark:text-yellow-400";
  return "text-orange-600 dark:text-orange-400";
};

export function CarbonFootprintCalculator({
  productCarbonFootprint = 0,
  carbonFootprintMethod,
  onShippingSelect,
  compact = false,
}: CarbonFootprintCalculatorProps) {
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].id);

  const selectedOption = useMemo(
    () => shippingOptions.find((o) => o.id === selectedShipping)!,
    [selectedShipping]
  );

  const totalCarbonKg = useMemo(
    () => productCarbonFootprint + selectedOption.carbonKg,
    [productCarbonFootprint, selectedOption]
  );

  const handleSelect = (shippingId: string) => {
    setSelectedShipping(shippingId);
    const option = shippingOptions.find((o) => o.id === shippingId)!;
    onShippingSelect?.(option);
  };

  const methodLabel =
    carbonFootprintMethod === "lca_verified"
      ? "LCA verified"
      : carbonFootprintMethod === "category_default"
      ? "Category average (ADEME 2024)"
      : null;

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Shipping Method</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                CO₂ figures are estimates. Choose the greenest shipping to reduce your
                footprint.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <RadioGroup value={selectedShipping} onValueChange={handleSelect}>
          {shippingOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedShipping === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                }`}
                onClick={() => handleSelect(option.id)}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label
                        htmlFor={option.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{option.deliveryDays}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`}
                  </p>
                  <p className={`text-xs ${getCarbonColor(option.carbonKg)}`}>
                    {option.carbonKg}kg CO₂
                  </p>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          Carbon Footprint
        </CardTitle>
        <CardDescription>
          Estimated emissions for this order
          {methodLabel && (
            <span className="ml-1 text-xs text-muted-foreground">
              — product figure from {methodLabel}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Carbon breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Estimated Carbon Emissions</h4>
          <div className="grid grid-cols-2 gap-4">
            {productCarbonFootprint > 0 && (
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Ship className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Product</span>
                </div>
                <p className={`text-xl font-bold ${getCarbonColor(productCarbonFootprint)}`}>
                  {productCarbonFootprint.toFixed(1)} kg
                </p>
                <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
              </div>
            )}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Shipping</span>
              </div>
              <p className={`text-xl font-bold ${getCarbonColor(selectedOption.carbonKg)}`}>
                {selectedOption.carbonKg.toFixed(1)} kg
              </p>
              <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
            </div>
          </div>
          <div className="p-4 rounded-lg border-2 border-dashed">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Estimate</span>
              <p className={`text-2xl font-bold ${getCarbonColor(totalCarbonKg)}`}>
                {totalCarbonKg.toFixed(1)} kg CO₂
              </p>
            </div>
          </div>
        </div>

        {/* Shipping options */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Shipping Method</h4>
          <RadioGroup value={selectedShipping} onValueChange={handleSelect}>
            <div className="grid gap-3">
              {shippingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedShipping === option.id;
                return (
                  <div
                    key={option.id}
                    className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover-elevate"
                    }`}
                    onClick={() => handleSelect(option.id)}
                    data-testid={`shipping-option-${option.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={option.id} id={`ship-${option.id}`} />
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <Label
                          htmlFor={`ship-${option.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {option.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.deliveryDays}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {option.price === 0 ? "Free" : `£${option.price.toFixed(2)}`}
                      </p>
                      <p className={`text-sm ${getCarbonColor(option.carbonKg)}`}>
                        {option.carbonKg} kg CO₂
                      </p>
                    </div>
                    {option.id === "ground-eco" && (
                      <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                        Greenest
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </div>

        {/* Honest offset note */}
        <div className="p-4 rounded-lg bg-muted/60 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Carbon offset coming soon.</strong> We&apos;re
            integrating with a verified partner (Gold Standard) before offering offsets. We
            won&apos;t charge for offsets until the integration is real and auditable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
