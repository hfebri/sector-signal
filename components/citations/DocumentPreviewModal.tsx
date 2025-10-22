/**
 * Document Preview Modal
 *
 * Shows a preview of the document content in a modal instead of downloading
 */

"use client";

import { useState, useEffect } from "react";
import { Citation } from "@/lib/ai/types/citations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentPreviewModalProps {
  citation: Citation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewModal({
  citation,
  open,
  onOpenChange,
}: DocumentPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && !documentUrl) {
      fetchDocumentUrl();
    }
  }, [open]);

  const fetchDocumentUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${citation.documentId}/url`);
      if (response.ok) {
        const data = await response.json();
        setDocumentUrl(data.url);
      } else {
        setError("Failed to load document");
      }
    } catch (err) {
      setError("Error loading document");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{citation.documentName}</DialogTitle>
          <DialogDescription>
            {citation.metadata.period && `Period: ${citation.metadata.period}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          {citation.metadata.platform && (
            <Badge variant="outline">{citation.metadata.platform}</Badge>
          )}
          {citation.metadata.category && (
            <Badge variant="outline">{citation.metadata.category}</Badge>
          )}
          <Badge variant="secondary">
            Relevance: {Math.round(citation.relevanceScore * 100)}%
          </Badge>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex-1 overflow-auto border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold text-sm mb-2">Relevant Excerpt:</h4>
              <p className="text-sm whitespace-pre-wrap">{citation.excerpt}</p>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  This is a preview of the relevant section. Download or open the full document to see all content.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleDownload}
                disabled={!documentUrl}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Document
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
