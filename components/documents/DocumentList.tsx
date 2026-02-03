"use client";

import { useState, useEffect } from "react";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { Button } from "@/components/ui/button";
import { Play, Trash2, FileText } from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  chunkCount: number | null;
  uploadedAt: Date;
  processedAt: Date | null;
  metadata?: {
    platform?: string;
    period?: string;
    description?: string;
  };
}

interface DocumentListProps {
  brandId: string;
  onRefresh?: () => void;
}

export function DocumentList({ brandId, onRefresh }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?brandId=${encodeURIComponent(brandId)}`);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents as Document[]);
      } else {
        console.error("Failed to load documents:", data.error);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    // Auto-refresh every 5 seconds if there are processing documents
    const interval = setInterval(() => {
      const hasProcessing = documents.some(
        (doc) => doc.processingStatus === "processing"
      );
      if (hasProcessing) {
        loadDocuments();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [brandId, documents]);

  const handleProcess = async (documentId: string) => {
    setProcessingIds((prev) => new Set(prev).add(documentId));

    try {
      const response = await fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      await loadDocuments();
      onRefresh?.();
    } catch (error) {
      console.error("Processing error:", error);
      alert("Failed to process document");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`/api/documents?id=${encodeURIComponent(documentId)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        await loadDocuments();
        onRefresh?.();
      } else {
        alert("Failed to delete document: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm font-medium text-gray-900 mb-1">
          No documents uploaded yet
        </p>
        <p className="text-xs text-gray-500">
          Upload documents to enable data-driven AI insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {doc.fileName}
                </h3>
                <DocumentStatusBadge status={doc.processingStatus} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Type:</span> {doc.fileType.toUpperCase()}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {formatFileSize(doc.fileSize)}
                </div>
                <div>
                  <span className="font-medium">Category:</span>{" "}
                  {doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}
                </div>
                {doc.metadata?.platform && (
                  <div>
                    <span className="font-medium">Platform:</span>{" "}
                    {doc.metadata.platform.charAt(0).toUpperCase() +
                      doc.metadata.platform.slice(1)}
                  </div>
                )}
                {doc.metadata?.period && (
                  <div>
                    <span className="font-medium">Period:</span> {doc.metadata.period}
                  </div>
                )}
                {doc.processingStatus === "completed" && doc.chunkCount && (
                  <div>
                    <span className="font-medium">Chunks:</span> {doc.chunkCount}
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Uploaded: {formatDate(doc.uploadedAt)}
                {doc.processedAt && (
                  <> • Processed: {formatDate(doc.processedAt)}</>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {(doc.processingStatus === "pending" ||
                doc.processingStatus === "failed") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProcess(doc.id)}
                    disabled={processingIds.has(doc.id)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Process
                  </Button>
                )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(doc.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
