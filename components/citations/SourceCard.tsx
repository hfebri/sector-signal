/**
 * Source Card Component
 *
 * Displays an individual citation source with metadata
 */

"use client";

import { useState } from "react";
import { Citation } from "@/lib/ai/types/citations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentPreviewModal } from "./DocumentPreviewModal";

interface SourceCardProps {
  citation: Citation;
  index?: number;
  highlighted?: boolean; // For scroll highlighting
}

export function SourceCard({ citation, index, highlighted = false }: SourceCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const relevancePercentage = Math.round(citation.relevanceScore * 100);

  // Use citation number if available, otherwise fall back to index
  const displayNumber = citation.citationNumber ?? (index !== undefined ? index + 1 : undefined);
  const citationId = displayNumber ? `citation-${displayNumber}` : undefined;

  // Get relevance color
  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-gray-600";
  };

  // Handle view document - open preview modal
  const handleViewDocument = () => {
    setShowPreview(true);
  };

  return (
    <>
      <div
        id={citationId}
        className={`border rounded-lg p-4 space-y-2 transition-all scroll-mt-20 ${
          highlighted
            ? "bg-yellow-50 border-yellow-300 shadow-lg"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {displayNumber && (
                <span className="text-sm font-bold text-gray-700 min-w-[2rem]">
                  [{displayNumber}]
                </span>
              )}
              <Button
                variant="link"
                className="h-auto p-0 text-sm font-medium text-blue-600 hover:text-blue-800"
                onClick={handleViewDocument}
              >
                {citation.metadata.fileName || "View Document"}
              </Button>
            </div>
            {citation.metadata.period && (
              <p className="text-xs text-muted-foreground mt-1">
                {citation.metadata.period}
              </p>
            )}
          </div>
          <span className={`text-xs font-semibold ${getRelevanceColor(citation.relevanceScore)}`}>
            {relevancePercentage}%
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {citation.excerpt}
        </p>

        <div className="flex gap-2 flex-wrap">
          {citation.metadata.platform && (
            <Badge variant="outline" className="text-xs">
              {citation.metadata.platform}
            </Badge>
          )}
          {citation.metadata.category && (
            <Badge variant="outline" className="text-xs">
              {citation.metadata.category}
            </Badge>
          )}
        </div>
      </div>

      <DocumentPreviewModal
        citation={citation}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </>
  );
}
