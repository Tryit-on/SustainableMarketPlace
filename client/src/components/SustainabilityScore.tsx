import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface SustainabilityScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SustainabilityScore({ score, size = "md", showLabel = false }: SustainabilityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-lime-600 dark:text-lime-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 20) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 60) return "bg-lime-100 dark:bg-lime-900/30";
    if (score >= 40) return "bg-yellow-100 dark:bg-yellow-900/30";
    if (score >= 20) return "bg-orange-100 dark:bg-orange-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-lime-500";
    if (score >= 40) return "stroke-yellow-500";
    if (score >= 20) return "stroke-orange-500";
    return "stroke-red-500";
  };

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  const fontSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  const strokeWidth = size === "lg" ? 4 : 3;
  const radius = size === "lg" ? 32 : size === "md" ? 22 : 16;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative", sizeClasses[size], getBgColor(score), "rounded-full flex items-center justify-center")}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            className={cn("transition-all duration-500", getStrokeColor(score))}
          />
        </svg>
        <div className={cn("flex flex-col items-center justify-center", fontSizes[size], getScoreColor(score))}>
          <Leaf className={cn(size === "lg" ? "h-4 w-4" : "h-3 w-3", "mb-0.5")} />
          <span className="font-bold">{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">Eco Score</span>
      )}
    </div>
  );
}
