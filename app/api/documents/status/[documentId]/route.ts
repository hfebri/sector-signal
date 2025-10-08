import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const { documentId } = params;

    const docs = await db
      .select()
      .from(brandDocuments)
      .where(eq(brandDocuments.id, documentId))
      .limit(1);

    if (docs.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const document = docs[0];

    return NextResponse.json({
      id: document.id,
      fileName: document.fileName,
      processingStatus: document.processingStatus,
      chunkCount: document.chunkCount,
      processedAt: document.processedAt,
      uploadedAt: document.uploadedAt,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check status",
      },
      { status: 500 }
    );
  }
}
