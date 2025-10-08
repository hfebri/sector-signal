import { db } from "@/lib/db/supabase";
import { documentChunks } from "@/lib/db/drizzle-schema";
import { eq, sql } from "drizzle-orm";
import { getEmbeddingModelWithFallback } from "@/lib/ai/embeddings";

export interface SearchFilters {
  platform?: string; // facebook, instagram, twitter, tiktok
  category?: string; // facebook, instagram, twitter, tiktok, rivaliq, general
  period?: string; // e.g., "Q1 2024", "March 2024"
  fileName?: string;
}

export interface SearchResult {
  content: string;
  metadata: {
    documentId: string;
    brandId: string;
    fileName: string;
    category: string;
    platform?: string;
    period?: string;
    chunkIndex?: number;
  };
  score: number;
}

/**
 * Search brand documents using direct SQL vector similarity
 */
export async function searchBrandDocuments(
  brandId: string,
  query: string,
  options: {
    limit?: number;
    filters?: SearchFilters;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 5, filters = {} } = options;

  try {
    // Generate embedding for the query
    const embeddingModel = getEmbeddingModelWithFallback();
    const queryEmbedding = await embeddingModel.embedQuery(query);

    // Build WHERE conditions
    const conditions = [eq(documentChunks.brandId, brandId)];

    // Add metadata filters if provided
    const metadataConditions: string[] = [];
    if (filters.platform) {
      metadataConditions.push(`metadata->>'platform' = '${filters.platform}'`);
    }
    if (filters.category) {
      metadataConditions.push(`metadata->>'category' = '${filters.category}'`);
    }
    if (filters.period) {
      metadataConditions.push(`metadata->>'period' = '${filters.period}'`);
    }
    if (filters.fileName) {
      metadataConditions.push(`metadata->>'fileName' = '${filters.fileName}'`);
    }

    // Perform similarity search using raw SQL
    const results = await db
      .select({
        id: documentChunks.id,
        documentId: documentChunks.documentId,
        brandId: documentChunks.brandId,
        chunkText: documentChunks.chunkText,
        chunkIndex: documentChunks.chunkIndex,
        metadata: documentChunks.metadata,
        similarity: sql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`,
      })
      .from(documentChunks)
      .where(
        sql`${documentChunks.brandId} = ${brandId}${
          metadataConditions.length > 0
            ? sql` AND ${sql.raw(metadataConditions.join(" AND "))}`
            : sql``
        }`
      )
      .orderBy(sql`${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`)
      .limit(limit);

    return results.map((row) => ({
      content: row.chunkText,
      metadata: {
        documentId: row.documentId,
        brandId: row.brandId,
        fileName: (row.metadata as any)?.fileName || "",
        category: (row.metadata as any)?.category || "",
        platform: (row.metadata as any)?.platform,
        period: (row.metadata as any)?.period,
        chunkIndex: row.chunkIndex,
      },
      score: row.similarity,
    }));
  } catch (error) {
    console.error("Vector search error:", error);
    throw new Error(
      `Failed to search documents: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Search for performance metrics and engagement data
 */
export async function searchPerformanceData(
  brandId: string,
  platform?: string
): Promise<SearchResult[]> {
  const query = `engagement metrics, impressions, reach, interactions, likes, comments, shares, saves, performance data, analytics${platform ? ` for ${platform}` : ""}`;

  return searchBrandDocuments(brandId, query, {
    limit: 10,
    filters: platform ? { platform } : undefined,
  });
}

/**
 * Search for content insights and best practices
 */
export async function searchContentInsights(
  brandId: string,
  contentType?: string
): Promise<SearchResult[]> {
  const query = `best performing content, top posts, viral content, content performance, engagement rate, ${contentType || "content types"}, successful campaigns`;

  return searchBrandDocuments(brandId, query, {
    limit: 8,
  });
}

/**
 * Search for audience insights and demographics
 */
export async function searchAudienceInsights(
  brandId: string
): Promise<SearchResult[]> {
  const query =
    "audience demographics, age gender, location, interests, follower insights, target audience, user behavior";

  return searchBrandDocuments(brandId, query, {
    limit: 6,
  });
}

/**
 * Search for trending topics and opportunities
 */
export async function searchTrendingTopics(
  brandId: string
): Promise<SearchResult[]> {
  const query =
    "trending topics, popular hashtags, viral trends, industry trends, opportunities, high engagement topics";

  return searchBrandDocuments(brandId, query, {
    limit: 8,
  });
}

/**
 * Search for competitive insights
 */
export async function searchCompetitiveInsights(
  brandId: string
): Promise<SearchResult[]> {
  const query =
    "competitor analysis, benchmark, industry comparison, competitive landscape, market positioning";

  return searchBrandDocuments(brandId, query, {
    limit: 6,
    filters: { category: "rivaliq" },
  });
}

/**
 * Get comprehensive brand context for strategy generation
 */
export async function getBrandContext(
  brandId: string,
  focus?: "performance" | "content" | "audience" | "trends" | "competitive"
): Promise<SearchResult[]> {
  switch (focus) {
    case "performance":
      return searchPerformanceData(brandId);
    case "content":
      return searchContentInsights(brandId);
    case "audience":
      return searchAudienceInsights(brandId);
    case "trends":
      return searchTrendingTopics(brandId);
    case "competitive":
      return searchCompetitiveInsights(brandId);
    default:
      // Get a mix of all contexts
      const [performance, content, audience] = await Promise.all([
        searchPerformanceData(brandId),
        searchContentInsights(brandId),
        searchAudienceInsights(brandId),
      ]);
      return [...performance.slice(0, 4), ...content.slice(0, 3), ...audience.slice(0, 3)];
  }
}
