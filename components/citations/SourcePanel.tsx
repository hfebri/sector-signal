/**
 * Source Panel Component
 *
 * Collapsible panel showing all citation sources
 */

"use client";

import { useState } from "react";
import { Citation } from "@/lib/ai/types/citations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { SourceCard } from "./SourceCard";

interface SourcePanelProps {
  citations: Citation[];
  title?: string;
  defaultExpanded?: boolean;
  highlightedCitationNumber?: number; // Track which citation is highlighted
  isExpanded?: boolean; // Controlled expanded state
  onExpandedChange?: (expanded: boolean) => void; // Callback for expansion changes
}

export function SourcePanel({
  citations,
  title = "Sources Used",
  defaultExpanded = false,
  highlightedCitationNumber,
  isExpanded: controlledExpanded,
  onExpandedChange
}: SourcePanelProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  if (citations.length === 0) {
    return null;
  }

  // Sort citations by citation number (if available)
  const sortedCitations = [...citations].sort((a, b) => {
    if (a.citationNumber && b.citationNumber) {
      return a.citationNumber - b.citationNumber;
    }
    return 0;
  });

  // Group citations by platform
  const groupedCitations: Record<string, Citation[]> = {};
  sortedCitations.forEach((citation) => {
    const platform = citation.metadata.platform || citation.metadata.category || "General";
    if (!groupedCitations[platform]) {
      groupedCitations[platform] = [];
    }
    groupedCitations[platform].push(citation);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {title} ({citations.length})
            </CardTitle>
            <CardDescription>
              Documents analyzed to generate this strategy
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {Object.entries(groupedCitations).map(([platform, platformCitations]) => (
            <div key={platform} className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                {platform} ({platformCitations.length})
              </h3>
              <div className="space-y-3">
                {platformCitations.map((citation, idx) => (
                  <SourceCard
                    key={citation.citationNumber || idx}
                    citation={citation}
                    highlighted={citation.citationNumber === highlightedCitationNumber}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
