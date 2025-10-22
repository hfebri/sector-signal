/**
 * Data Quality Badge Component
 *
 * Shows whether the strategy is data-driven or generic,
 * with confidence level and document count.
 */

import { Badge } from "@/components/ui/badge";
import { DataQuality } from "@/lib/ai/types/citations";
import { Database, Info } from "lucide-react";

interface DataQualityBadgeProps {
  dataQuality: DataQuality;
  variant?: "compact" | "detailed";
}

export function DataQualityBadge({ dataQuality, variant = "compact" }: DataQualityBadgeProps) {
  if (!dataQuality.hasRAGData) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Info className="h-3 w-3" />
        Generic Strategy
      </Badge>
    );
  }

  const confidenceColors = {
    high: "bg-green-100 text-green-800 border-green-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    low: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const color = confidenceColors[dataQuality.confidenceLevel];

  if (variant === "compact") {
    return (
      <Badge className={`gap-1 ${color}`}>
        <Database className="h-3 w-3" />
        Data-Driven
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`gap-1 ${color}`}>
        <Database className="h-3 w-3" />
        Data-Driven
      </Badge>
      <span className="text-sm text-muted-foreground">
        {dataQuality.documentCount} documents • {dataQuality.confidenceLevel} confidence
      </span>
    </div>
  );
}
