"use client";

import { useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface DocumentUploadProps {
  brandId: string;
  onUploadComplete?: () => void;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface UploadResult {
  fileName: string;
  status: "success" | "error";
  error?: string;
}

export function DocumentUpload({
  brandId,
  onUploadComplete,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("general");
  const [platform, setPlatform] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploadStatus("uploading");
    setUploadResults([]);

    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("brandId", brandId);
        formData.append("category", category);
        if (platform) formData.append("platform", platform);
        if (period) formData.append("period", period);

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          results.push({
            fileName: file.name,
            status: "error",
            error: data.error || "Upload failed",
          });
        } else {
          results.push({
            fileName: file.name,
            status: "success",
          });
        }
      } catch (error) {
        results.push({
          fileName: file.name,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    setUploadResults(results);

    const hasErrors = results.some((r) => r.status === "error");
    setUploadStatus(hasErrors ? "error" : "success");

    if (!hasErrors) {
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setUploadResults([]);
        setUploadStatus("idle");
        onUploadComplete?.();
      }, 3000);
    }
  };

  const isUploading = uploadStatus === "uploading";
  const canUpload = files.length > 0 && !isUploading;

  return (
    <div className="space-y-6">
      <FileDropzone
        onFilesSelected={setFiles}
        maxFiles={10}
        maxSize={10}
      />

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="rivaliq">RivalIQ Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform (Optional)</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period (Optional)</Label>
              <input
                id="period"
                type="text"
                placeholder="e.g., Q1 2024"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!canUpload}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading {files.length} file(s)...
              </>
            ) : (
              `Upload ${files.length} file(s)`
            )}
          </Button>
        </div>
      )}

      {uploadResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Upload Results:</p>
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 rounded-lg border bg-gray-50"
            >
              {result.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {result.fileName}
                </p>
                {result.error && (
                  <p className="text-xs text-red-600">{result.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ All files uploaded successfully! They will be processed automatically.
          </p>
        </div>
      )}
    </div>
  );
}
