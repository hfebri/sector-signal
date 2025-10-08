import { pgTable, text, timestamp, uuid, jsonb, integer, customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Define pgvector type for embeddings
// Default: 768 dimensions for EmbeddingGemma (was 1536 for OpenAI)
const vector = customType<{ data: number[]; config: { dimensions: number } }>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 768})`;
  },
  toDriver(value: number[]) {
    return sql`${JSON.stringify(value)}::vector`;
  },
});

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull(),
  industry: text("industry").notNull(),
  description: text("description").notNull().default(""),
  targetAudience: text("target_audience").notNull().default(""),
  brandVoice: text("brand_voice").notNull().default(""),
  competitors: jsonb("competitors").$type<string[]>().notNull().default([]),
  brandValues: jsonb("brand_values").$type<string[]>().notNull().default([]),
  goals: text("goals").notNull().default(""),
  rivaliqLandscapeId: text("rivaliq_landscape_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const brandDocuments = pgTable("brand_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // csv, xlsx, pdf, doc, docx
  fileSize: integer("file_size").notNull(), // in bytes
  storagePath: text("storage_path").notNull(), // path in Supabase storage
  category: text("category").notNull().default("general"), // facebook, instagram, twitter, tiktok, rivaliq, general
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, completed, failed
  chunkCount: integer("chunk_count").default(0),
  processedAt: timestamp("processed_at"),
  metadata: jsonb("metadata").$type<{
    platform?: string;
    period?: string;
    description?: string;
  }>(),
});

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").notNull().references(() => brandDocuments.id, { onDelete: "cascade" }),
  brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  chunkText: text("chunk_text").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: vector({ dimensions: 768 }).notNull(), // EmbeddingGemma dimension (was 1536 for OpenAI)
  metadata: jsonb("metadata").$type<{
    platform?: string;
    period?: string;
    fileName?: string;
    startChar?: number;
    endChar?: number;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type BrandDocument = typeof brandDocuments.$inferSelect;
export type NewBrandDocument = typeof brandDocuments.$inferInsert;
export type DocumentChunk = typeof documentChunks.$inferSelect;
export type NewDocumentChunk = typeof documentChunks.$inferInsert;
