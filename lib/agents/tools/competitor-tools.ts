/**
 * Competitor Analysis Tools for OpenAI Agents
 *
 * These tools allow agents to analyze competitor data from RivalIQ,
 * compare performance metrics, identify gaps, and find opportunities.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { db } from '@/lib/db/supabase';
import { brands, brandDocuments, documentChunks } from '@/lib/db/drizzle-schema';
import { eq, and, sql, desc } from 'drizzle-orm';

// ============================================================================
// COMPETITOR DATA TOOLS
// ============================================================================

/**
 * Get competitor list for a brand
 */
export const getCompetitorsTool = tool({
  name: 'get_competitors',
  description: 'Get the list of competitors for a brand from their profile.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    try {
      const result = await db
        .select({
          id: brands.id,
          brandName: brands.brandName,
          competitors: brands.competitors,
          rivaliqLandscapeId: brands.rivaliqLandscapeId,
        })
        .from(brands)
        .where(eq(brands.id, brand_id))
        .limit(1);

      if (result.length === 0) {
        return `Brand not found with ID: ${brand_id}`;
      }

      const brand = result[0];

      return JSON.stringify({
        brand_id: brand.id,
        brand_name: brand.brandName,
        competitors: brand.competitors || [],
        rivaliq_landscape_id: brand.rivaliqLandscapeId,
        has_competitors: (brand.competitors?.length || 0) > 0,
      }, null, 2);
    } catch (error) {
      return `Error getting competitors: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Search competitor data in documents
 */
export const searchCompetitorDataTool = tool({
  name: 'search_competitor_data',
  description: 'Search for competitor-related data, benchmarking, and competitive insights from RivalIQ documents.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    competitor_name: z.string().optional().describe('Optional: specific competitor name to search for'),
  }),
  execute: async ({ brand_id, competitor_name }) => {
    try {
      // Get RivalIQ documents for this brand
      const docs = await db
        .select({ id: brandDocuments.id })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          eq(brandDocuments.category, 'rivaliq'),
        ));

      if (docs.length === 0) {
        return `No RivalIQ documents found for brand ${brand_id}. Make sure RivalIQ data has been imported.`;
      }

      const documentIds = docs.map(d => d.id);

      // Build search query
      const searchQuery = competitor_name
        ? `competitor ${competitor_name} benchmark comparison performance metrics`
        : 'competitor benchmark comparison performance metrics industry analysis';

      // Search for competitor-related content
      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          competitor_name
            ? sql`LOWER(${documentChunks.chunkText}) LIKE ${`%${competitor_name.toLowerCase()}%`}`
            : sql`1=1`,
        ))
        .limit(30);

      if (chunks.length === 0) {
        return `No competitor data found${competitor_name ? ` for "${competitor_name}"` : ''} in RivalIQ documents.`;
      }

      return JSON.stringify({
        competitor_name: competitor_name || 'all',
        results_count: chunks.length,
        data: chunks.map(c => ({
          content: c.chunkText.substring(0, 500),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error searching competitor data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get competitor metrics/benchmarks
 */
export const getCompetitorBenchmarksTool = tool({
  name: 'get_competitor_benchmarks',
  description: 'Get competitive benchmarks including follower counts, engagement rates, posting frequency, and content performance.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    platform: z.string().optional().describe('Optional: filter by platform (instagram, facebook, tiktok, twitter)'),
  }),
  execute: async ({ brand_id, platform }) => {
    try {
      // Get RivalIQ documents
      const docs = await db
        .select({ id: brandDocuments.id })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          eq(brandDocuments.category, 'rivaliq'),
        ));

      if (docs.length === 0) {
        return `No RivalIQ documents found for brand ${brand_id}`;
      }

      const documentIds = docs.map(d => d.id);

      // Search for benchmark/metric related content
      const benchmarkTerms = [
        'benchmark',
        'followers',
        'engagement rate',
        'posting frequency',
        'avg',
        'average',
        'growth',
        'impressions',
        'reach',
      ];

      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`(${benchmarkTerms.map(term => `LOWER(${documentChunks.chunkText}) LIKE ${`%${term}%`}`).join(' OR ')})`,
          platform ? sql`LOWER(${documentChunks.chunkText}) LIKE ${`%${platform.toLowerCase()}%`}` : sql`1=1`,
        ))
        .limit(20);

      if (chunks.length === 0) {
        return `No benchmark data found${platform ? ` for platform ${platform}` : ''}`;
      }

      return JSON.stringify({
        platform: platform || 'all',
        results_count: chunks.length,
        benchmarks: chunks.map(c => ({
          content: c.chunkText.substring(0, 400),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting competitor benchmarks: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get competitor content analysis
 */
export const getCompetitorContentTool = tool({
  name: 'get_competitor_content',
  description: 'Get competitor content analysis including top performing posts, content types, and strategies.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    content_type: z.string().optional().describe('Optional: filter by content type (image, video, carousel, reel, etc.)'),
  }),
  execute: async ({ brand_id, content_type }) => {
    try {
      const docs = await db
        .select({ id: brandDocuments.id })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          eq(brandDocuments.category, 'rivaliq'),
        ));

      if (docs.length === 0) {
        return `No RivalIQ documents found`;
      }

      const documentIds = docs.map(d => d.id);

      // Search for content-related data
      const contentTerms = [
        'content',
        'posts',
        'top performing',
        'engagement',
        'likes',
        'comments',
        'shares',
        'media type',
      ];

      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`(${contentTerms.map(term => `LOWER(${documentChunks.chunkText}) LIKE ${`%${term}%`}`).join(' OR ')})`,
          content_type ? sql`LOWER(${documentChunks.chunkText}) LIKE ${`%${content_type.toLowerCase()}%`}` : sql`1=1`,
        ))
        .limit(25);

      if (chunks.length === 0) {
        return `No content analysis data found`;
      }

      return JSON.stringify({
        content_type: content_type || 'all',
        results_count: chunks.length,
        content_data: chunks.map(c => ({
          content: c.chunkText.substring(0, 400),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting competitor content: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Search brand's own metrics for comparison
 */
export const getBrandMetricsTool = tool({
  name: 'get_brand_metrics',
  description: 'Get the brand\'s own performance metrics for comparison with competitors.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    platform: z.string().optional().describe('Optional: filter by platform'),
  }),
  execute: async ({ brand_id, platform }) => {
    try {
      // Get platform-specific documents
      const docs = await db
        .select({ id: brandDocuments.id, category: brandDocuments.category })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          platform ? sql`LOWER(${brandDocuments.category}) = ${platform.toLowerCase()}` : sql`1=1`,
        ));

      if (docs.length === 0) {
        return `No documents found for brand ${brand_id}${platform ? ` on platform ${platform}` : ''}`;
      }

      const documentIds = docs.map(d => d.id);

      // Search for metrics data
      const metricTerms = ['followers', 'engagement', 'impressions', 'reach', 'likes', 'comments'];

      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`(${metricTerms.map(term => `LOWER(${documentChunks.chunkText}) LIKE ${`%${term}%`}`).join(' OR ')})`,
        ))
        .limit(15);

      return JSON.stringify({
        platform: platform || 'all',
        results_count: chunks.length,
        metrics: chunks.map(c => ({
          content: c.chunkText.substring(0, 400),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting brand metrics: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// Export all tools
export const competitorTools = [
  getCompetitorsTool,
  searchCompetitorDataTool,
  getCompetitorBenchmarksTool,
  getCompetitorContentTool,
  getBrandMetricsTool,
];
