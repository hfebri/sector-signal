import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { Document as LangchainDocument } from "@langchain/core/documents";
import { supabase } from "@/lib/db/supabase";
import { db } from "@/lib/db/supabase";
import { brandDocuments, documentChunks } from "@/lib/db/drizzle-schema";
import { eq } from "drizzle-orm";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import * as XLSX from "xlsx";
import { getEmbeddingModelWithFallback } from "@/lib/ai/embeddings";

/**
 * Process a document: chunk it, generate embeddings, and store in vector database
 */
export async function processDocument(documentId: string): Promise<{
  success: boolean;
  chunkCount?: number;
  error?: string;
}> {
  try {
    // Get document metadata from database
    const docs = await db
      .select()
      .from(brandDocuments)
      .where(eq(brandDocuments.id, documentId))
      .limit(1);

    if (docs.length === 0) {
      return { success: false, error: "Document not found" };
    }

    const document = docs[0];

    // Update status to processing
    await db
      .update(brandDocuments)
      .set({ processingStatus: "processing" })
      .where(eq(brandDocuments.id, documentId));

    // Load and parse document based on file type
    const langchainDocs = await loadDocument(document);

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });

    const chunks = await textSplitter.splitDocuments(langchainDocs);

    // Add metadata to each chunk
    const enrichedChunks = chunks.map((chunk, index) => ({
      ...chunk,
      metadata: {
        ...chunk.metadata,
        documentId: document.id,
        brandId: document.brandId,
        fileName: document.fileName,
        category: document.category,
        platform: document.metadata?.platform || document.category,
        period: document.metadata?.period,
        chunkIndex: index,
      },
    }));

    // Generate embeddings manually and store in database
    const embeddingModel = getEmbeddingModelWithFallback();

    for (let i = 0; i < enrichedChunks.length; i++) {
      const chunk = enrichedChunks[i];

      // Generate embedding for this chunk
      const embedding = await embeddingModel.embedQuery(chunk.pageContent);

      // Insert into database
      await db.insert(documentChunks).values({
        documentId: document.id,
        brandId: document.brandId,
        chunkText: chunk.pageContent,
        chunkIndex: i,
        embedding: embedding,
        metadata: chunk.metadata as any,
      });
    }

    // Update document status to completed
    await db
      .update(brandDocuments)
      .set({
        processingStatus: "completed",
        chunkCount: chunks.length,
        processedAt: new Date(),
      })
      .where(eq(brandDocuments.id, documentId));

    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    console.error("Document processing error:", error);

    // Update status to failed
    await db
      .update(brandDocuments)
      .set({ processingStatus: "failed" })
      .where(eq(brandDocuments.id, documentId));

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Load document content based on file type
 */
async function loadDocument(
  document: typeof brandDocuments.$inferSelect
): Promise<LangchainDocument[]> {
  // Download file from Supabase Storage
  const { data, error } = await supabase.storage
    .from("brand-documents")
    .download(document.storagePath);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());

  // Parse based on file type
  switch (document.fileType.toLowerCase()) {
    case "pdf": {
      const blob = new Blob([buffer], { type: "application/pdf" });
      const loader = new PDFLoader(blob);
      return await loader.load();
    }

    case "csv": {
      const text = buffer.toString("utf-8");
      const blob = new Blob([text], { type: "text/csv" });
      const loader = new CSVLoader(blob);
      return await loader.load();
    }

    case "xlsx":
    case "xls": {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      let content = "";

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        content += `\n=== Sheet: ${sheetName} ===\n${csv}\n`;
      });

      return [
        new LangchainDocument({
          pageContent: content,
          metadata: {
            fileName: document.fileName,
            fileType: "xlsx",
          },
        }),
      ];
    }

    case "docx":
    case "doc": {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const loader = new DocxLoader(blob);
      return await loader.load();
    }

    case "txt": {
      const text = buffer.toString("utf-8");
      return [
        new LangchainDocument({
          pageContent: text,
          metadata: {
            fileName: document.fileName,
            fileType: "txt",
          },
        }),
      ];
    }

    default:
      throw new Error(`Unsupported file type: ${document.fileType}`);
  }
}

/**
 * Process multiple documents in batch
 */
export async function processBatchDocuments(
  documentIds: string[]
): Promise<{
  success: boolean;
  results: Array<{ documentId: string; success: boolean; error?: string }>;
}> {
  const results = await Promise.all(
    documentIds.map(async (id) => {
      const result = await processDocument(id);
      return {
        documentId: id,
        success: result.success,
        error: result.error,
      };
    })
  );

  const allSuccessful = results.every((r) => r.success);

  return {
    success: allSuccessful,
    results,
  };
}

/**
 * Process all pending documents for a brand
 */
export async function processAllBrandDocuments(brandId: string): Promise<{
  success: boolean;
  processedCount: number;
  failedCount: number;
}> {
  // Get all pending documents for the brand
  const pendingDocs = await db
    .select()
    .from(brandDocuments)
    .where(eq(brandDocuments.brandId, brandId));

  const documentIds = pendingDocs.map((doc) => doc.id);

  if (documentIds.length === 0) {
    return { success: true, processedCount: 0, failedCount: 0 };
  }

  const result = await processBatchDocuments(documentIds);

  const processedCount = result.results.filter((r) => r.success).length;
  const failedCount = result.results.filter((r) => !r.success).length;

  return {
    success: result.success,
    processedCount,
    failedCount,
  };
}
