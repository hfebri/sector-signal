-- Enable pgvector extension in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for faster vector similarity search
-- This will be created after the table is pushed by Drizzle
-- CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
-- ON document_chunks USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);
