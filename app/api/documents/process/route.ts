import { NextRequest, NextResponse } from "next/server";
import {
  processDocument,
  processBatchDocuments,
  processAllBrandDocuments,
} from "@/lib/ai/document-processor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, documentIds, brandId } = body;

    // Process single document
    if (documentId) {
      const result = await processDocument(documentId);
      return NextResponse.json(result);
    }

    // Process batch of documents
    if (documentIds && Array.isArray(documentIds)) {
      const result = await processBatchDocuments(documentIds);
      return NextResponse.json(result);
    }

    // Process all pending documents for a brand
    if (brandId) {
      const result = await processAllBrandDocuments(brandId);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Please provide documentId, documentIds, or brandId" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Processing failed",
      },
      { status: 500 }
    );
  }
}
