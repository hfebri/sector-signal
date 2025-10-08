-- Manual Migration: Add EmbeddingGemma Support (768-dimensional vectors)
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create document_chunks table with 768-dimensional embeddings
CREATE TABLE IF NOT EXISTS "document_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"chunk_text" text NOT NULL,
	"chunk_index" integer NOT NULL,
	"embedding" vector(768) NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Step 3: Add foreign key constraints
ALTER TABLE "document_chunks"
ADD CONSTRAINT "document_chunks_document_id_brand_documents_id_fk"
FOREIGN KEY ("document_id")
REFERENCES "public"."brand_documents"("id")
ON DELETE cascade
ON UPDATE no action;

ALTER TABLE "document_chunks"
ADD CONSTRAINT "document_chunks_brand_id_brands_id_fk"
FOREIGN KEY ("brand_id")
REFERENCES "public"."brands"("id")
ON DELETE cascade
ON UPDATE no action;

-- Step 4: Create vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  brand_id uuid,
  chunk_text text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.brand_id,
    document_chunks.chunk_text,
    document_chunks.chunk_index,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 5: Create index for faster similarity search (optional but recommended)
-- Note: This may take some time if you have a lot of data
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Done! Your database is now ready for EmbeddingGemma (768-dimensional embeddings)
