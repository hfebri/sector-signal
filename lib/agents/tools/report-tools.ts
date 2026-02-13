/**
 * Report Generator Tools for OpenAI Agents
 *
 * These tools allow agents to extract and format data for reports,
 * including performance summaries, metrics aggregation, and insights.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { db } from '@/lib/db/supabase';
import { brands, brandDocuments, documentChunks } from '@/lib/db/drizzle-schema';
import { eq, and, sql, desc, or } from 'drizzle-orm';

// ============================================================================
// REPORT DATA EXTRACTION TOOLS
// ============================================================================

/**
 * Get all available data for a brand across all platforms
 */
export const getBrandReportDataTool = tool({
  name: 'get_brand_report_data',
  description: 'Get comprehensive data for a brand report including follower counts, engagement metrics, and performance across all platforms.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    platform: z.string().optional().describe('Optional: filter by platform (instagram, facebook, tiktok, twitter)'),
    period: z.string().optional().describe('Optional: time period filter (e.g., "January 2025", "Q1 2025", "last 30 days")'),
  }),
  execute: async ({ brand_id, platform, period }) => {
    try {
      // Get documents with optional filters
      const docs = await db
        .select({
          id: brandDocuments.id,
          fileName: brandDocuments.fileName,
          category: brandDocuments.category,
          uploadedAt: brandDocuments.uploadedAt,
          metadata: brandDocuments.metadata,
        })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          platform ? eq(brandDocuments.category, platform) : sql`1=1`,
        ))
        .orderBy(desc(brandDocuments.uploadedAt))
        .limit(20);

      if (docs.length === 0) {
        return `No documents found for brand ${brand_id}${platform ? ` on platform ${platform}` : ''}`;
      }

      const documentIds = docs.map(d => d.id);

      // Get metrics from document chunks
      const metricTerms = ['followers', 'engagement', 'impressions', 'reach', 'likes', 'comments', 'shares', 'saves'];

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
        .limit(50);

      // Group by document/category
      const dataByPlatform = docs.reduce((acc, doc) => {
        if (!acc[doc.category]) {
          acc[doc.category] = {
            documents: [],
            metrics: [],
          };
        }
        acc[doc.category].documents.push({
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt,
        });

        // Add relevant chunks
        const docChunks = chunks.filter(c => {
          // Simple heuristic: chunk belongs to this document if metadata matches
          return c.metadata?.fileName === doc.fileName ||
                 c.metadata?.platform === doc.category;
        });
        acc[doc.category].metrics.push(...docChunks.map(c => c.chunkText));

        return acc;
      }, {} as Record<string, { documents: any[]; metrics: string[] }>);

      return JSON.stringify({
        brand_id,
        platform: platform || 'all',
        period: period || 'all available data',
        platforms: Object.keys(dataByPlatform),
        data: dataByPlatform,
        available_documents: docs.map(d => ({
          fileName: d.fileName,
          category: d.category,
          uploadedAt: d.uploadedAt,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting report data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get top/bottom performing content
 */
export const getTopPerformingContentTool = tool({
  name: 'get_top_performing_content',
  description: 'Get top and bottom performing content posts from analytics data.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    platform: z.string().optional().describe('Optional: filter by platform'),
    limit: z.number().optional().describe('Number of top/bottom posts to return (default: 5)'),
  }),
  execute: async ({ brand_id, platform, limit = 5 }) => {
    try {
      const docs = await db
        .select({ id: brandDocuments.id, category: brandDocuments.category })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          platform ? eq(brandDocuments.category, platform) : sql`1=1`,
        ));

      if (docs.length === 0) {
        return `No documents found for this brand`;
      }

      const documentIds = docs.map(d => d.id);

      // Search for content performance data
      const performanceTerms = [
        'top posts',
        'best performing',
        'highest engagement',
        'lowest engagement',
        'worst performing',
        'most likes',
        'least likes',
      ];

      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`(${performanceTerms.map(term => `LOWER(${documentChunks.chunkText}) LIKE ${`%${term}%`}`).join(' OR ')})`,
        ))
        .limit(30);

      if (chunks.length === 0) {
        return `No content performance data found. Try a more general search.`;
      }

      return JSON.stringify({
        platform: platform || 'all',
        limit,
        content_data: chunks.map(c => ({
          content: c.chunkText.substring(0, 500),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting top performing content: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get posting frequency and timing data
 */
export const getPostingPatternsTool = tool({
  name: 'get_posting_patterns',
  description: 'Get posting frequency, timing patterns, and schedule data.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    platform: z.string().optional().describe('Optional: filter by platform'),
  }),
  execute: async ({ brand_id, platform }) => {
    try {
      const docs = await db
        .select({ id: brandDocuments.id, category: brandDocuments.category })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          platform ? eq(brandDocuments.category, platform) : sql`1=1`,
        ));

      if (docs.length === 0) {
        return `No documents found`;
      }

      const documentIds = docs.map(d => d.id);

      const patternTerms = [
        'posting frequency',
        'posts per',
        'daily',
        'weekly',
        'monthly',
        'schedule',
        'timing',
        'best time to post',
        'optimal time',
      ];

      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`(${patternTerms.map(term => `LOWER(${documentChunks.chunkText}) LIKE ${`%${term}%`}`).join(' OR ')})`,
        ))
        .limit(20);

      return JSON.stringify({
        platform: platform || 'all',
        patterns: chunks.map(c => ({
          content: c.chunkText.substring(0, 400),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting posting patterns: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Compare current period vs previous period
 */
export const getPeriodComparisonTool = tool({
  name: 'get_period_comparison',
  description: 'Get data to compare current period (e.g., this month) with previous period (last month) for growth analysis.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    current_period: z.string().describe('Current period (e.g., "January", "2025-01", "this month")'),
    previous_period: z.string().describe('Previous period to compare (e.g., "December", "2024-12", "last month")'),
    platform: z.string().optional().describe('Optional: filter by platform'),
  }),
  execute: async ({ brand_id, current_period, previous_period, platform }) => {
    try {
      const docs = await db
        .select({ id: brandDocuments.id, category: brandDocuments.category, fileName: brandDocuments.fileName })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          platform ? eq(brandDocuments.category, platform) : sql`1=1`,
        ));

      if (docs.length === 0) {
        return `No documents found`;
      }

      const documentIds = docs.map(d => d.id);

      // Search for data mentioning both periods
      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`(LOWER(${documentChunks.chunkText}) LIKE ${`%${current_period.toLowerCase()}%`} OR LOWER(${documentChunks.chunkText}) LIKE ${`%${previous_period.toLowerCase()}%`})`,
        ))
        .limit(30);

      return JSON.stringify({
        current_period,
        previous_period,
        platform: platform || 'all',
        comparison_data: chunks.map(c => ({
          content: c.chunkText.substring(0, 400),
          metadata: c.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting period comparison: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Get brand info for report header
 */
export const getBrandInfoTool = tool({
  name: 'get_brand_info',
  description: 'Get brand information for report header (name, industry, description).',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
  }),
  execute: async ({ brand_id }) => {
    try {
      const result = await db
        .select()
        .from(brands)
        .where(eq(brands.id, brand_id))
        .limit(1);

      if (result.length === 0) {
        return `Brand not found with ID: ${brand_id}`;
      }

      const brand = result[0];

      return JSON.stringify({
        id: brand.id,
        name: brand.brandName,
        industry: brand.industry,
        description: brand.description,
        target_audience: brand.targetAudience,
        competitors: brand.competitors,
        goals: brand.goals,
        created_at: brand.createdAt,
        updated_at: brand.updatedAt,
      }, null, 2);
    } catch (error) {
      return `Error getting brand info: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// Export all tools
export const reportTools = [
  getBrandReportDataTool,
  getTopPerformingContentTool,
  getPostingPatternsTool,
  getPeriodComparisonTool,
  getBrandInfoTool,
];
