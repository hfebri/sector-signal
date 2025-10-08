import { OpenAIEmbeddings } from "@langchain/openai";

/**
 * Initialize OpenAI embeddings for RAG system
 *
 * Using text-embedding-3-small:
 * - 1536-dimensional embeddings
 * - High quality semantic search
 * - Proven reliability for production use
 * - Cost-effective at $0.00002 per 1K tokens
 */
export function getEmbeddingModel() {
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small",
  });
}

/**
 * Alias for compatibility with existing code
 */
export function getEmbeddingModelWithFallback() {
  return getEmbeddingModel();
}

export const EMBEDDING_DIMENSIONS = 1536; // OpenAI text-embedding-3-small dimension