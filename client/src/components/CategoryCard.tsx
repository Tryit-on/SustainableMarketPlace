import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shirt, 
  Apple, 
  Home, 
  Sparkles, 
  Recycle, 
  Globe2,
  TreePine,
  Flower2
} from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

const categoryIcons: Record<string, typeof Shirt> = {
  "sustainable-fashion": Shirt,
  "fashion": Shirt,
  "organic-food": Apple,
  "food": Apple,
  "eco-home": Home,
  "home": Home,
  "green-beauty": Sparkles,
  "beauty": Sparkles,
  "zero-waste": Recycle,
  "fair-trade": Globe2,
  "green-tech": TreePine,
  "garden": Flower2,
};

const categoryGradients: Record<string, string> = {
  "sustainable-fashion": "from-violet-500/20 to-purple-500/20",
  "fashion": "from-violet-500/20 to-purple-500/20",
  "organic-food": "from-green-500/20 to-emerald-500/20",
  "food": "from-green-500/20 to-emerald-500/20",
  "eco-home": "from-amber-500/20 to-orange-500/20",
  "home": "from-amber-500/20 to-orange-500/20",
  "green-beauty": "from-pink-500/20 to-rose-500/20",
  "beauty": "from-pink-500/20 to-rose-500/20",
  "zero-waste": "from-teal-500/20 to-cyan-500/20",
  "fair-trade": "from-blue-500/20 to-indigo-500/20",
  "green-tech": "from-lime-500/20 to-green-500/20",
  "garden": "from-emerald-500/20 to-teal-500/20",
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = categoryIcons[category.slug] || Shirt;
  const gradient = categoryGradients[category.slug] || "from-primary/20 to-primary/10";

  return (
    <Link href={`/shop?category=${category.slug}`}>
      <Card className="group overflow-hidden hover-elevate cursor-pointer h-full" data-testid={`card-category-${category.slug}`}>
        <CardContent className={`p-6 flex flex-col items-center justify-center text-center h-full bg-gradient-to-br ${gradient}`}>
          <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Icon className="h-8 w-8 text-foreground/70" />
          </div>
          <h3 className="font-semibold text-sm mb-1" data-testid={`text-category-name-${category.slug}`}>
            {category.name}
          </h3>
          {category.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {category.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function CategoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse mb-4" />
        <div className="h-4 w-20 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
