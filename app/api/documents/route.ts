import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { brandDocuments, brands } from "@/lib/db/drizzle-schema";
import { eq, and } from "drizzle-orm";
import { supabase } from "@/lib/db/supabase";
import fs from "fs";
import path from "path";

// Get documents for a brand
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get("brandId");
    const documentId = searchParams.get("id");

    if (documentId) {
      // Get single document
      const docs = await db
        .select()
        .from(brandDocuments)
        .where(eq(brandDocuments.id, documentId));

      if (docs.length === 0) {
        return NextResponse.json(
          { success: false, error: "Document not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        document: docs[0],
      });
    } else if (brandId) {
      // Check if this is BMW brand - if so, return sample files from public/reports
      const brand = await db
        .select()
        .from(brands)
        .where(eq(brands.id, brandId))
        .limit(1);

      if (brand.length > 0 && brand[0].brandName.toLowerCase().includes("bmw")) {
        // Return sample files from public/reports
        const reportsDir = path.join(process.cwd(), "public", "reports");
        const files = fs.readdirSync(reportsDir);

        const sampleDocuments = files
          .filter((file) => !file.startsWith(".")) // Exclude hidden files
          .map((file, index) => {
            const filePath = path.join(reportsDir, file);
            const stats = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase();

            // Determine category based on file name
            // Check most specific patterns first to avoid false matches
            let category = "general";
            const fileName = file.toLowerCase();
            if (fileName.includes("tiktok")) {
              category = "tiktok";
            } else if (fileName.includes("rivaliq")) {
              category = "rivaliq";
            } else if (fileName.includes("twitter") || fileName.includes(" tw ") || fileName.includes("_tw_") || fileName.match(/\btw\b/)) {
              category = "twitter";
            } else if (fileName.includes("instagram") || fileName.includes(" ig ") || fileName.includes("_ig_") || fileName.match(/\big\b/)) {
              category = "instagram";
            } else if (fileName.includes("facebook") || fileName.includes(" fb ") || fileName.includes("_fb_") || fileName.match(/\bfb\b/)) {
              category = "facebook";
            }

            return {
              id: `sample-${index}`,
              brandId: brandId,
              fileName: file,
              fileType: ext.replace(".", ""),
              fileSize: stats.size,
              storagePath: `/reports/${file}`,
              category: category,
              metadata: {},
              uploadedAt: stats.mtime,
              processingStatus: "pending",
              chunkCount: 0,
              processedAt: null,
            };
          })
          .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

        return NextResponse.json({
          success: true,
          documents: sampleDocuments,
        });
      }

      // Get all documents for a brand from database
      const docs = await db
        .select()
        .from(brandDocuments)
        .where(eq(brandDocuments.brandId, brandId))
        .orderBy(brandDocuments.uploadedAt);

      return NextResponse.json({
        success: true,
        documents: docs,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "brandId or id is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Upload document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const brandId = formData.get("brandId") as string;
    const category = (formData.get("category") as string) || "general";
    const metadata = formData.get("metadata") ? JSON.parse(formData.get("metadata") as string) : {};

    if (!file || !brandId) {
      return NextResponse.json(
        { success: false, error: "File and brandId are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only CSV, XLSX, PDF, DOC, and DOCX are allowed." },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExt = file.name.split(".").pop();
    const fileName = file.name;
    const storagePath = `${brandId}/${Date.now()}-${fileName}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("brand-documents")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file to storage", details: uploadError.message },
        { status: 500 }
      );
    }

    // Save document metadata to database
    const newDoc = await db
      .insert(brandDocuments)
      .values({
        brandId,
        fileName,
        fileType: fileExt || "unknown",
        fileSize: file.size,
        storagePath,
        category,
        metadata,
      })
      .returning();

    return NextResponse.json({
      success: true,
      document: newDoc[0],
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Delete document
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get document to find storage path
    const docs = await db
      .select()
      .from(brandDocuments)
      .where(eq(brandDocuments.id, id));

    if (docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Document not found" },
        { status: 404 }
      );
    }

    const doc = docs[0];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from("brand-documents")
      .remove([doc.storagePath]);

    if (deleteError) {
      console.error("Storage delete error:", deleteError);
    }

    // Delete from database
    await db.delete(brandDocuments).where(eq(brandDocuments.id, id));

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
