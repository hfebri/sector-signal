/**
 * Data Analysis Tools for OpenAI Agents
 *
 * These tools allow agents to extract and analyze numeric data from CSV files,
 * including Instagram analytics, follower counts, engagement metrics, etc.
 */

import { tool } from '@openai/agents';
import { z } from 'zod';
import { db } from '@/lib/db/supabase';
import { brandDocuments, documentChunks } from '@/lib/db/drizzle-schema';
import { eq, and, sql } from 'drizzle-orm';

// ============================================================================
// DATA EXTRACTION TOOLS
// ============================================================================

/**
 * Get document content for data analysis
 * Returns larger chunks of content that may contain tabular/numeric data
 */
export const getDocumentDataTool = tool({
  name: 'get_document_data',
  description: 'Get full document content for data analysis. Use this when you need to extract numeric data, tables, or metrics from documents like CSV files, analytics reports, etc.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    file_name: z.string().optional().describe('Optional: specific file name to filter (e.g., "instagram_analytics.csv")'),
    category: z.string().optional().describe('Optional: category to filter (e.g., "instagram", "facebook", "tiktok", "rivaliq")'),
  }),
  execute: async ({ brand_id, file_name, category }) => {
    try {
      // Build conditions
      const conditions = [eq(brandDocuments.brandId, brand_id)];

      if (file_name) {
        conditions.push(sql`LOWER(${brandDocuments.fileName}) LIKE ${`%${file_name.toLowerCase()}%`}`);
      }

      if (category) {
        conditions.push(eq(brandDocuments.category, category));
      }

      // Get matching documents
      const docs = await db
        .select({
          id: brandDocuments.id,
          fileName: brandDocuments.fileName,
          fileType: brandDocuments.fileType,
          category: brandDocuments.category,
          metadata: brandDocuments.metadata,
        })
        .from(brandDocuments)
        .where(and(...conditions))
        .orderBy(brandDocuments.uploadedAt)
        .limit(10);

      if (docs.length === 0) {
        return `No documents found for the given criteria. Brand ID: ${brand_id}, File: ${file_name || 'any'}, Category: ${category || 'any'}`;
      }

      // Get all chunks for these documents
      const documentIds = docs.map(d => d.id);

      const chunks = await db
        .select({
          documentId: documentChunks.documentId,
          chunkText: documentChunks.chunkText,
          chunkIndex: documentChunks.chunkIndex,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(sql`${documentChunks.documentId} = ANY(${documentIds})`)
        .orderBy(documentChunks.chunkIndex);

      // Group chunks by document
      const documentsWithData = docs.map(doc => {
        const docChunks = chunks
          .filter(c => c.documentId === doc.id)
          .sort((a, b) => a.chunkIndex - b.chunkIndex);

        return {
          id: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          category: doc.category,
          content: docChunks.map(c => c.chunkText).join('\n'),
          metadata: doc.metadata,
        };
      });

      return JSON.stringify({
        count: documentsWithData.length,
        documents: documentsWithData.map(d => ({
          fileName: d.fileName,
          fileType: d.fileType,
          category: d.category,
          // Return full content for data analysis
          content: d.content,
          preview: d.content.substring(0, 300) + (d.content.length > 300 ? '...' : ''),
          metadata: d.metadata,
        })),
      }, null, 2);
    } catch (error) {
      return `Error getting document data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Search for specific metrics in documents
 */
export const searchMetricsTool = tool({
  name: 'search_metrics',
  description: 'Search for specific metrics like followers, engagement, impressions, reach, etc. in document chunks. Returns the actual numeric values with context.',
  parameters: z.object({
    brand_id: z.string().describe('The UUID of the brand'),
    metric_name: z.string().describe('The metric to search for (e.g., "followers", "engagement", "impressions", "reach", "likes")'),
    platform: z.string().optional().describe('Optional: filter by platform (instagram, facebook, tiktok, twitter)'),
  }),
  execute: async ({ brand_id, metric_name, platform }) => {
    try {
      // Get document IDs for the brand, optionally filtered by platform
      const docs = await db
        .select({ id: brandDocuments.id })
        .from(brandDocuments)
        .where(and(
          eq(brandDocuments.brandId, brand_id),
          platform ? eq(brandDocuments.category, platform) : sql`1=1`,
        ));

      if (docs.length === 0) {
        return `No documents found for brand ${brand_id}${platform ? ` on platform ${platform}` : ''}`;
      }

      const documentIds = docs.map(d => d.id);

      // Search chunks containing the metric name
      const chunks = await db
        .select({
          chunkText: documentChunks.chunkText,
          metadata: documentChunks.metadata,
        })
        .from(documentChunks)
        .where(and(
          sql`${documentChunks.documentId} = ANY(${documentIds})`,
          sql`LOWER(${documentChunks.chunkText}) LIKE ${`%${metric_name.toLowerCase()}%`}`
        ))
        .limit(20);

      if (chunks.length === 0) {
        return `No data found for metric "${metric_name}"${platform ? ` on platform ${platform}` : ''}`;
      }

      // Extract relevant lines with numeric values
      const results = chunks.map(chunk => {
        const lines = chunk.chunkText.split('\n');
        const relevantLines = lines.filter(line =>
          line.toLowerCase().includes(metric_name.toLowerCase()) &&
          /\d+/.test(line) // Contains numbers
        );

        return {
          lines: relevantLines,
          metadata: chunk.metadata,
        };
      }).filter(r => r.lines.length > 0);

      return JSON.stringify({
        metric: metric_name,
        platform: platform || 'all',
        count: results.length,
        results: results,
      }, null, 2);
    } catch (error) {
      return `Error searching metrics: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// ============================================================================
// CALCULATION TOOLS
// ============================================================================

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChangeTool = tool({
  name: 'calculate_percentage_change',
  description: 'Calculate the percentage change between two values. Formula: ((new_value - old_value) / old_value) * 100',
  parameters: z.object({
    old_value: z.number().describe('The old/original value'),
    new_value: z.number().describe('The new/current value'),
  }),
  execute: async ({ old_value, new_value }) => {
    try {
      if (old_value === 0) {
        return {
          old_value,
          new_value,
          percentage_change: new_value > 0 ? 'Infinity (division by zero)' : 0,
          absolute_change: new_value - old_value,
          note: 'Old value is zero, percentage change is undefined',
        };
      }

      const percentageChange = ((new_value - old_value) / old_value) * 100;
      const absoluteChange = new_value - old_value;

      return JSON.stringify({
        old_value,
        new_value,
        absolute_change: absoluteChange,
        percentage_change: Number(percentageChange.toFixed(2)),
        formatted: `${absoluteChange >= 0 ? '+' : ''}${absoluteChange} (${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%)`,
      }, null, 2);
    } catch (error) {
      return `Error calculating percentage change: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Calculate growth rate
 */
export const calculateGrowthRateTool = tool({
  name: 'calculate_growth_rate',
  description: 'Calculate growth metrics including absolute growth, percentage growth, and compound growth rate over a period.',
  parameters: z.object({
    start_value: z.number().describe('The starting value'),
    end_value: z.number().describe('The ending value'),
    periods: z.number().describe('Number of periods (e.g., months for monthly growth rate)'),
  }),
  execute: async ({ start_value, end_value, periods }) => {
    try {
      const absoluteGrowth = end_value - start_value;
      const percentageGrowth = start_value !== 0 ? (absoluteGrowth / start_value) * 100 : 0;

      // Compound Annual/Monthly Growth Rate (CAGR) formula
      const cagr = start_value > 0
        ? (Math.pow(end_value / start_value, 1 / periods) - 1) * 100
        : 0;

      return JSON.stringify({
        start_value,
        end_value,
        periods,
        absolute_growth: absoluteGrowth,
        percentage_growth: Number(percentageGrowth.toFixed(2)),
        compound_growth_rate: Number(cagr.toFixed(2)),
        average_period_growth: Number((percentageGrowth / periods).toFixed(2)),
        formatted: `${absoluteGrowth >= 0 ? '+' : ''}${absoluteGrowth} total (${percentageGrowth >= 0 ? '+' : ''}${percentageGrowth.toFixed(2)}% over ${periods} periods)`,
      }, null, 2);
    } catch (error) {
      return `Error calculating growth rate: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Calculate average from an array of numbers
 */
export const calculateAverageTool = tool({
  name: 'calculate_average',
  description: 'Calculate the average (mean) of a set of numbers.',
  parameters: z.object({
    values: z.array(z.number()).describe('Array of numbers to calculate average'),
    label: z.string().optional().describe('Optional label for the values (e.g., "daily engagement")'),
  }),
  execute: async ({ values, label }) => {
    try {
      if (values.length === 0) {
        return JSON.stringify({ error: 'Cannot calculate average of empty array' }, null, 2);
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const average = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return JSON.stringify({
        label: label || 'values',
        count: values.length,
        sum: Number(sum.toFixed(2)),
        average: Number(average.toFixed(2)),
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        values: values,
      }, null, 2);
    } catch (error) {
      return `Error calculating average: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

/**
 * Extract and parse numeric values from text
 */
export const extractNumbersTool = tool({
  name: 'extract_numbers',
  description: 'Extract numeric values from text content. Useful for parsing numbers from CSV data, reports, or document chunks.',
  parameters: z.object({
    text: z.string().describe('The text content to extract numbers from'),
    context_lines: z.number().optional().describe('Number of characters of context to include around each number (default: 50)'),
  }),
  execute: async ({ text, context_lines = 50 }) => {
    try {
      // Find all numbers in the text (including decimals, thousands separators)
      const numberPattern = /(?:^|\s)([+-]?\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+\.?\d*)(?=\s|$|,|\.|\n)/g;
      const matches = [...text.matchAll(numberPattern)];

      const numbers = matches.map(match => {
        const value = parseFloat(match[1].replace(/,/g, ''));
        const start = Math.max(0, match.index - context_lines);
        const end = Math.min(text.length, match.index + match[0].length + context_lines);
        const context = text.substring(start, end);

        return {
          value: Number.isNaN(value) ? null : value,
          raw: match[1],
          position: match.index,
          context: context.trim(),
        };
      }).filter(n => n.value !== null);

      return JSON.stringify({
        total_found: numbers.length,
        numbers: numbers,
      }, null, 2);
    } catch (error) {
      return `Error extracting numbers: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
});

// Export all tools
export const dataTools = [
  getDocumentDataTool,
  searchMetricsTool,
  calculatePercentageChangeTool,
  calculateGrowthRateTool,
  calculateAverageTool,
  extractNumbersTool,
];
