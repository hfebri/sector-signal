/**
 * Database Tools for OpenAI Agents
 *
 * These tools allow agents to query the internal documentation database,
 * including brands, documents, document chunks (with semantic search),
 * and generated strategies.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { db } from '@/lib/db/supabase';
import {
  brands,
  brandDocuments,
  documentChunks,
  annualStrategies,
} from '@/lib/db/drizzle-schema';
import { eq, sql, desc, and, like } from 'drizzle-orm';
import { getEmbeddingModelWithFallback } from '@/lib/ai/embeddings';

// ============================================================================
// BRAND TOOLS
// ============================================================================

/**
 * List all brands in the database
 */
export const listBrandsTool = tool({
  name: 'list_brands',
  description: 'List all brands in the database. Use this to see available brands before querying specific data.',
  parameters: z.object({}),
  execute: async () => {
    try {
      const results = await db.select({
        id: brands.id,
        brandName: brands.brandName,
        industry: brands.industry,
        description: brands.description,
        createdAt: brands.createdAt,
      }).from(brands).limit(50);

      return JSON.stringify({
        count: results.length,
        brands: results.map(b => ({
          id: b.id,
          name: b.brandName,
          industry: b.industry,
          description: b.description?.substring(0, 200),
        })),
      }, null, 2);
    } catch (error) {
      return `Error listing brands: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get detailed information about a specific brand
 */
export const getBrandTool = tool({
  name: 'get_brand',
  description: 'Get detailed information about a specific brand including competitors, values, and goals.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    try {
      const result = await db.select().from(brands).where(eq(brands.id, brand_id)).limit(1);

      if (result.length === 0) {
        return `Brand not found with ID: ${brand_id}`;
      }

      const brand = result[0];
      return JSON.stringify({
        id: brand.id,
        name: brand.brandName,
        industry: brand.industry,
        description: brand.description,
        targetAudience: brand.targetAudience,
        brandVoice: brand.brandVoice,
        competitors: brand.competitors,
        brandValues: brand.brandValues,
        goals: brand.goals,
        rivaliqLandscapeId: brand.rivaliqLandscapeId,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      }, null, 2);
    } catch (error) {
      return `Error getting brand: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// ============================================================================
// DOCUMENT TOOLS
// ============================================================================

/**
 * List documents for a brand
 */
export const listDocumentsTool = tool({
  name: 'list_documents',
  description: 'List all documents uploaded for a brand. Shows file names, types, categories, and processing status.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    try {
      const results = await db.select()
        .from(brandDocuments)
        .where(eq(brandDocuments.brandId, brand_id))
        .orderBy(desc(brandDocuments.uploadedAt));

      return JSON.stringify({
        count: results.length,
        documents: results.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: `${(doc.fileSize / 1024).toFixed(2)} KB`,
          category: doc.category,
          status: doc.processingStatus,
          chunkCount: doc.chunkCount,
          metadata: doc.metadata,
          uploadedAt: doc.uploadedAt,
        })),
      }, null, 2);
    } catch (error) {
      return `Error listing documents: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// ============================================================================
// SEMANTIC SEARCH TOOLS
// ============================================================================

/**
 * Semantic search across document chunks
 */
export const searchDocumentsTool = tool({
  name: 'search_documents',
  description: 'Perform semantic search across all document chunks for a brand. Uses AI embeddings to find relevant content based on meaning, not just keywords.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand to search within'),
    search_query: z.string().describe('The search query - describe what information you are looking for'),
  }),
  execute: async ({ brand_id, search_query }) => {
    try {
      // Generate embedding for the query
      const embeddingModel = getEmbeddingModelWithFallback();
      const queryEmbedding = await embeddingModel.embedQuery(search_query);

      // Perform similarity search
      const results = await db
        .select({
          id: documentChunks.id,
          documentId: documentChunks.documentId,
          chunkText: documentChunks.chunkText,
          chunkIndex: documentChunks.chunkIndex,
          metadata: documentChunks.metadata,
          similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`,
        })
        .from(documentChunks)
        .where(eq(documentChunks.brandId, brand_id))
        .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`)
        .limit(5);

      return JSON.stringify({
        query: search_query,
        count: results.length,
        results: results.map(r => ({
          documentId: r.documentId,
          chunkIndex: r.chunkIndex,
          content: r.chunkText.substring(0, 500) + (r.chunkText.length > 500 ? '...' : ''),
          similarity: Number(r.similarity).toFixed(3),
          metadata: r.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error searching documents: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Search for performance metrics
 */
export const searchPerformanceTool = tool({
  name: 'search_performance',
  description: 'Search for performance metrics, engagement data, analytics, and KPIs for a brand.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    const query = 'engagement metrics, impressions, reach, interactions, likes, comments, shares, saves, performance data, analytics';

    try {
      const embeddingModel = getEmbeddingModelWithFallback();
      const queryEmbedding = await embeddingModel.embedQuery(query);

      const results = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
          similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`,
        })
        .from(documentChunks)
        .where(eq(documentChunks.brandId, brand_id))
        .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`)
        .limit(10);

      return JSON.stringify({
        type: 'performance_data',
        count: results.length,
        results: results.map(r => ({
          content: r.chunkText.substring(0, 400),
          similarity: Number(r.similarity).toFixed(3),
          metadata: r.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error searching performance data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Search for competitive insights
 */
export const searchCompetitiveTool = tool({
  name: 'search_competitive',
  description: 'Search for competitive analysis, benchmark data, and market insights for a brand.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    const query = 'competitor analysis, benchmark, industry comparison, competitive landscape, market positioning';

    try {
      const embeddingModel = getEmbeddingModelWithFallback();
      const queryEmbedding = await embeddingModel.embedQuery(query);

      const results = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
          similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`,
        })
        .from(documentChunks)
        .where(and(
          eq(documentChunks.brandId, brand_id),
          sql`metadata->>'category' = 'rivaliq'`
        ))
        .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`)
        .limit(8);

      return JSON.stringify({
        type: 'competitive_insights',
        count: results.length,
        results: results.map(r => ({
          content: r.chunkText.substring(0, 400),
          similarity: Number(r.similarity).toFixed(3),
          metadata: r.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error searching competitive data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// ============================================================================
// STRATEGY TOOLS
// ============================================================================

/**
 * List strategies for a brand
 */
export const listStrategiesTool = tool({
  name: 'list_strategies',
  description: 'List all generated strategies for a brand.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    try {
      const results = await db.select({
        id: annualStrategies.id,
        startDate: annualStrategies.startDate,
        endDate: annualStrategies.endDate,
        generatedWithRag: annualStrategies.generatedWithRag,
        documentCount: annualStrategies.documentCount,
        createdAt: annualStrategies.createdAt,
      })
        .from(annualStrategies)
        .where(eq(annualStrategies.brandId, brand_id))
        .orderBy(desc(annualStrategies.createdAt))
        .limit(10);

      return JSON.stringify({
        count: results.length,
        strategies: results.map(s => ({
          id: s.id,
          period: `${s.startDate} to ${s.endDate}`,
          usedRag: s.generatedWithRag === 1,
          documentCount: s.documentCount,
          createdAt: s.createdAt,
        })),
      }, null, 2);
    } catch (error) {
      return `Error listing strategies: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get a specific strategy
 */
export const getStrategyTool = tool({
  name: 'get_strategy',
  description: 'Get the full details of a specific strategy including all strategy data and citations.',
  parameters: z.object({
    strategy_id: z.string().describe('The UUID of the strategy'),
  }),
  execute: async ({ strategy_id }) => {
    try {
      const result = await db.select()
        .from(annualStrategies)
        .where(eq(annualStrategies.id, strategy_id))
        .limit(1);

      if (result.length === 0) {
        return `Strategy not found with ID: ${strategy_id}`;
      }

      return JSON.stringify(result[0], null, 2);
    } catch (error) {
      return `Error getting strategy: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// ============================================================================
// DATABASE SCHEMA TOOL
// ============================================================================

/**
 * Get database schema information
 */
export const getSchemaTool = tool({
  name: 'get_schema',
  description: 'Get information about the database schema including tables and their columns.',
  parameters: z.object({}),
  execute: async () => {
    const schema = {
      tables: {
        brands: {
          description: 'Brand profiles with industry, description, target audience, competitors, values, and goals',
          columns: ['id', 'brand_name', 'industry', 'description', 'target_audience', 'brand_voice', 'competitors', 'brand_values', 'goals', 'rivaliq_landscape_id', 'created_at', 'updated_at'],
        },
        brand_documents: {
          description: 'Uploaded documents with metadata, file info, and processing status',
          columns: ['id', 'brand_id', 'file_name', 'file_type', 'file_size', 'storage_path', 'category', 'uploaded_at', 'processing_status', 'chunk_count', 'processed_at', 'metadata'],
        },
        document_chunks: {
          description: 'Text chunks from documents with embeddings for semantic search',
          columns: ['id', 'document_id', 'brand_id', 'chunk_text', 'chunk_index', 'embedding', 'metadata', 'created_at'],
        },
        annual_strategies: {
          description: 'Generated annual strategies with full strategy data and citations',
          columns: ['id', 'brand_id', 'strategy_data', 'citations', 'data_quality', 'start_date', 'end_date', 'generated_with_rag', 'document_count', 'created_at', 'updated_at'],
        },
      },
    };

    return JSON.stringify(schema, null, 2);
  },
});

// Export all tools
export const databaseTools = [
  listBrandsTool,
  getBrandTool,
  listDocumentsTool,
  searchDocumentsTool,
  searchPerformanceTool,
  searchCompetitiveTool,
  listStrategiesTool,
  getStrategyTool,
  getSchemaTool,
];
