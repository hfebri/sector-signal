import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { db } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    // Get document from database
    const [document] = await db
      .select()
      .from(brandDocuments)
      .where(eq(brandDocuments.id, documentId))
      .limit(1);

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate signed URL from Supabase Storage (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from("brand-documents")
      .createSignedUrl(document.storagePath, 3600);

    if (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json(
        { error: "Failed to generate document URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.signedUrl,
      fileName: document.fileName,
      fileType: document.fileType,
    });
  } catch (error) {
    console.error("Error fetching document URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
