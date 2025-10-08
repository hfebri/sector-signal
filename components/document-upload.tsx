"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";

interface DocumentUploadProps {
  brandId: string;
  onUploadComplete?: () => void;
}

export function DocumentUpload({
  brandId,
  onUploadComplete,
}: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [category, setCategory] = useState("general");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("brandId", brandId);
      formData.append("category", category);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setIsOpen(false);
        setSelectedFile(null);
        setCategory("general");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onUploadComplete?.();
      } else {
        alert(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Brand Document</DialogTitle>
          <DialogDescription>
            Upload social media insights, analytics reports, or other brand
            documents. Supported formats: CSV, XLSX, PDF, DOC, DOCX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Document Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="facebook">Facebook Insights</SelectItem>
                <SelectItem value="instagram">Instagram Insights</SelectItem>
                <SelectItem value="twitter">Twitter Analytics</SelectItem>
                <SelectItem value="tiktok">TikTok Insights</SelectItem>
                <SelectItem value="rivaliq">RivalIQ Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              accept=".csv,.xlsx,.xls,.pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-slate-600 mt-2">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
