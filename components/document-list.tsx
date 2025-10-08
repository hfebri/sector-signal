"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Loader2 } from "lucide-react";
import type { BrandDocument } from "@/lib/db/drizzle-schema";

interface DocumentListProps {
  brandId: string;
  refreshTrigger?: number;
}

export function DocumentList({ brandId, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<BrandDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?brandId=${brandId}`);
      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [brandId, refreshTrigger]);

  const handleDownload = async (doc: BrandDocument) => {
    try {
      // Check if this is a sample file (from public/reports)
      if (doc.id.startsWith("sample-")) {
        // For sample files, just open the file directly from public folder
        window.open(doc.storagePath, "_blank");
        return;
      }

      const response = await fetch(
        `/api/documents/download?path=${encodeURIComponent(doc.storagePath)}`
      );
      const data = await response.json();

      if (data.success) {
        window.open(data.url, "_blank");
      } else {
        alert("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/documents?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(documents.filter((doc) => doc.id !== id));
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete document");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      facebook: "bg-blue-100 text-blue-800",
      instagram: "bg-pink-100 text-pink-800",
      twitter: "bg-sky-100 text-sky-800",
      tiktok: "bg-purple-100 text-purple-800",
      rivaliq: "bg-orange-100 text-orange-800",
      general: "bg-slate-100 text-slate-800",
    };
    return colors[category] || colors.general;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <p>No documents uploaded yet</p>
        <p className="text-sm mt-2">
          Upload social media insights and analytics reports to get started
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white dark:bg-slate-950 z-10">
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    {doc.fileName}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(doc.category)}>
                    {doc.category}
                  </Badge>
                </TableCell>
                <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {!doc.id.startsWith("sample-") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
