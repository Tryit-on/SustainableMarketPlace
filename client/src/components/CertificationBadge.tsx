import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Heart, 
  Recycle, 
  Globe2, 
  TreePine, 
  Sparkles,
  ShieldCheck,
  Ban
} from "lucide-react";
import type { Certification } from "@shared/schema";

interface CertificationBadgeProps {
  certification: Certification;
  showLabel?: boolean;
}

const certificationIcons: Record<string, typeof Leaf> = {
  "fair-trade": Globe2,
  "organic": Leaf,
  "vegan": Heart,
  "cruelty-free": Ban,
  "carbon-neutral": TreePine,
  "recycled": Recycle,
  "eco-friendly": Sparkles,
  "verified": ShieldCheck,
};

const certificationColors: Record<string, string> = {
  "fair-trade": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "organic": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "vegan": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "cruelty-free": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "carbon-neutral": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "recycled": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "eco-friendly": "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  "verified": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
};

export function CertificationBadge({ certification, showLabel = false }: CertificationBadgeProps) {
  const Icon = certificationIcons[certification.slug] || Leaf;
  const colorClass = certificationColors[certification.slug] || "bg-muted text-muted-foreground";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant="outline" 
          className={`${colorClass} border-0 gap-1 cursor-help no-default-active-elevate`}
          data-testid={`badge-certification-${certification.slug}`}
        >
          <Icon className="h-3 w-3" />
          {showLabel && <span className="text-xs">{certification.name}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{certification.name}</p>
        {certification.description && (
          <p className="text-xs text-muted-foreground max-w-xs">{certification.description}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function CertificationBadges({ 
  certifications, 
  max = 4, 
  showLabel = false 
}: { 
  certifications: Certification[]; 
  max?: number;
  showLabel?: boolean;
}) {
  const visibleCerts = certifications.slice(0, max);
  const remaining = certifications.length - max;

  return (
    <div className="flex flex-wrap gap-1">
      {visibleCerts.map((cert) => (
        <CertificationBadge key={cert.id} certification={cert} showLabel={showLabel} />
      ))}
      {remaining > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="text-xs cursor-help no-default-active-elevate">
              +{remaining}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              {certifications.slice(max).map((cert) => (
                <p key={cert.id} className="text-sm">{cert.name}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
