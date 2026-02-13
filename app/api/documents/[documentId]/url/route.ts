import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { db } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;

    console.log("[Document URL] Fetching for documentId:", documentId);

    // Get document from database
    const documents = await db
      .select()
      .from(brandDocuments)
      .where(eq(brandDocuments.id, documentId))
      .limit(1);

    const document = documents[0];

    if (!document) {
      console.error("[Document URL] Document not found:", documentId);
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    console.log("[Document URL] Document found:", document.fileName, "storagePath:", document.storagePath);

    // Generate signed URL from Supabase Storage (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from("brand-documents")
      .createSignedUrl(document.storagePath, 3600);

    if (error) {
      console.error("[Document URL] Error creating signed URL:", error);
      return NextResponse.json(
        { error: "Failed to generate document URL" },
        { status: 500 }
      );
    }

    console.log("[Document URL] Signed URL generated successfully");

    return NextResponse.json({
      url: data.signedUrl,
      fileName: document.fileName,
      fileType: document.fileType,
    });
  } catch (error) {
    console.error("[Document URL] Error fetching document URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
