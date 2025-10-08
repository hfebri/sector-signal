import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

/**
 * Initialize EmbeddingGemma embeddings via HuggingFace Inference API
 *
 * EmbeddingGemma is Google's 308M parameter on-device embedding model
 * - Trained on 100+ languages
 * - 768-dimensional embeddings (can be truncated to 512, 256, or 128)
 * - Best-in-class performance for models under 500M parameters
 * - Free and open source
 */
export function getEmbeddingModel() {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: process.env.HUGGINGFACEHUB_API_KEY,
    model: "google/embeddinggemma-300m",
  });
}

/**
 * Fallback to OpenAI embeddings if HuggingFace API is not configured
 * This allows gradual migration without breaking existing functionality
 */
export function getEmbeddingModelWithFallback() {
  if (process.env.HUGGINGFACEHUB_API_KEY) {
    return getEmbeddingModel();
  }

  // Fallback to OpenAI
  const { OpenAIEmbeddings } = require("@langchain/openai");
  return new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: "text-embedding-3-small",
  });
}

export const EMBEDDING_DIMENSIONS = 768; // EmbeddingGemma default dimension