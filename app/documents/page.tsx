"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentList } from "@/components/documents/DocumentList";
import { Button } from "@/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { FileText, Upload, Sparkles } from "lucide-react";

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const brandId = searchParams.get("brandId");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!brandId) {
      window.location.href = "/";
    }
  }, [brandId]);

  if (!brandId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No brand selected. Redirecting...</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Brand Documents</h1>
        </div>
        <p className="text-gray-600">
          Upload your social media analytics reports to enable data-driven AI insights.
        </p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              Enable RAG-Powered Insights
            </h3>
            <p className="text-xs text-blue-800">
              Upload your performance reports (CSV, XLSX, PDF) to give AI access to your
              actual brand data. This transforms generic recommendations into specific,
              data-driven strategies based on your real metrics.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </TabsTrigger>
          <TabsTrigger value="manage">
            <FileText className="h-4 w-4 mr-2" />
            Manage Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Upload New Documents</h2>
            <DocumentUpload brandId={brandId} onUploadComplete={handleRefresh} />
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Supported File Types
            </h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• <strong>PDF</strong> - Social media analytics reports</li>
              <li>• <strong>CSV/XLSX</strong> - Performance data exports</li>
              <li>• <strong>DOCX</strong> - Brand guidelines, strategy documents</li>
              <li>• <strong>TXT</strong> - Notes and content plans</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Documents</h2>
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
            </div>
            <DocumentList key={refreshKey} brandId={brandId} onRefresh={handleRefresh} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
