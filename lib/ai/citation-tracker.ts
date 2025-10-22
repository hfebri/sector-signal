/**
 * Citation Tracker Utility
 *
 * Handles conversion of vector search results to citations,
 * grouping, deduplication, and sorting operations.
 */

import { Citation, CitationTrackingOptions } from "./types/citations";
import { SearchResult } from "./vector-search";

/**
 * Convert vector search results to citation format
 */
export function trackCitations(
  searchResults: SearchResult[],
  options: CitationTrackingOptions = {}
): Citation[] {
  const {
    minRelevanceScore = 0.5,
    maxCitationsPerSection = 10,
    includeLowRelevance = false,
  } = options;

  console.log(`[trackCitations] Input: ${searchResults.length} results, minScore: ${minRelevanceScore}`);

  // Log scores for debugging
  searchResults.forEach((result, idx) => {
    console.log(`[trackCitations] Result ${idx}: score=${result.score}, fileName=${result.metadata.fileName}`);
  });

  // Filter by relevance score
  const filtered = searchResults.filter((result) => {
    if (includeLowRelevance) return true;
    return result.score >= minRelevanceScore;
  });

  console.log(`[trackCitations] After relevance filter: ${filtered.length} results (min score: ${minRelevanceScore})`);

  // Convert to citation format
  const citations: Citation[] = filtered.slice(0, maxCitationsPerSection).map((result) => ({
    documentId: result.metadata.documentId,
    documentName: result.metadata.fileName || "Unknown Document",
    chunkIndex: result.metadata.chunkIndex || 0,
    excerpt: truncateExcerpt(result.content, 200),
    relevanceScore: result.score,
    metadata: {
      platform: result.metadata.platform,
      period: result.metadata.period,
      category: result.metadata.category,
      fileName: result.metadata.fileName,
    },
  }));

  console.log(`[trackCitations] Final citations: ${citations.length}`);

  return citations;
}

/**
 * Group citations by platform
 */
export function groupCitationsByPlatform(
  citations: Citation[]
): Record<string, Citation[]> {
  const grouped: Record<string, Citation[]> = {};

  citations.forEach((citation) => {
    const platform = citation.metadata.platform || citation.metadata.category || "general";
    if (!grouped[platform]) {
      grouped[platform] = [];
    }
    grouped[platform].push(citation);
  });

  // Sort citations within each platform by relevance
  Object.keys(grouped).forEach((platform) => {
    grouped[platform] = sortCitationsByRelevance(grouped[platform]);
  });

  return grouped;
}

/**
 * Group citations by category
 */
export function groupCitationsByCategory(
  citations: Citation[]
): Record<string, Citation[]> {
  const grouped: Record<string, Citation[]> = {};

  citations.forEach((citation) => {
    const category = citation.metadata.category || "general";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(citation);
  });

  return grouped;
}

/**
 * Remove duplicate citations based on document ID and chunk index
 */
export function deduplicateCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const deduplicated: Citation[] = [];

  citations.forEach((citation) => {
    const key = `${citation.documentId}-${citation.chunkIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(citation);
    }
  });

  return deduplicated;
}

/**
 * Sort citations by relevance score (highest first)
 */
export function sortCitationsByRelevance(citations: Citation[]): Citation[] {
  return [...citations].sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Sort citations by recency (newest first) based on period metadata
 */
export function sortCitationsByRecency(citations: Citation[]): Citation[] {
  return [...citations].sort((a, b) => {
    const periodA = a.metadata.period || "";
    const periodB = b.metadata.period || "";

    // Simple string comparison (works for ISO dates and "Q3 2024" format)
    return periodB.localeCompare(periodA);
  });
}

/**
 * Get top N citations by relevance
 */
export function getTopCitations(citations: Citation[], count: number): Citation[] {
  return sortCitationsByRelevance(citations).slice(0, count);
}

/**
 * Filter citations by platform
 */
export function filterCitationsByPlatform(
  citations: Citation[],
  platform: string
): Citation[] {
  return citations.filter(
    (c) =>
      c.metadata.platform?.toLowerCase() === platform.toLowerCase() ||
      c.metadata.category?.toLowerCase() === platform.toLowerCase()
  );
}

/**
 * Filter citations by minimum relevance score
 */
export function filterCitationsByRelevance(
  citations: Citation[],
  minScore: number
): Citation[] {
  return citations.filter((c) => c.relevanceScore >= minScore);
}

/**
 * Extract unique platforms from citations
 */
export function getUniquePlatforms(citations: Citation[]): string[] {
  const platforms = new Set<string>();

  citations.forEach((citation) => {
    const platform = citation.metadata.platform || citation.metadata.category;
    if (platform) {
      platforms.add(platform);
    }
  });

  return Array.from(platforms).sort();
}

/**
 * Extract unique periods from citations
 */
export function getUniquePeriods(citations: Citation[]): string[] {
  const periods = new Set<string>();

  citations.forEach((citation) => {
    if (citation.metadata.period) {
      periods.add(citation.metadata.period);
    }
  });

  return Array.from(periods).sort();
}

/**
 * Get date range from citations
 */
export function getDateRange(citations: Citation[]): {
  oldest: string | null;
  newest: string | null;
} {
  const periods = citations
    .map((c) => c.metadata.period)
    .filter((p): p is string => p !== undefined && p !== null);

  if (periods.length === 0) {
    return { oldest: null, newest: null };
  }

  // Sort periods (works for ISO dates and quarters)
  const sorted = periods.sort();

  return {
    oldest: sorted[0],
    newest: sorted[sorted.length - 1],
  };
}

/**
 * Merge multiple citation arrays and deduplicate
 */
export function mergeCitations(...citationArrays: Citation[][]): Citation[] {
  const merged = citationArrays.flat();
  return deduplicateCitations(merged);
}

/**
 * Calculate average relevance score
 */
export function calculateAverageRelevance(citations: Citation[]): number {
  if (citations.length === 0) return 0;

  const sum = citations.reduce((acc, c) => acc + c.relevanceScore, 0);
  return sum / citations.length;
}

/**
 * Truncate text excerpt to specified length
 */
export function truncateExcerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text.trim();

  // Find last complete word before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace).trim() + "...";
  }

  return truncated.trim() + "...";
}

/**
 * Format citation for display in prompts
 */
export function formatCitationForPrompt(citation: Citation): string {
  const period = citation.metadata.period ? ` (${citation.metadata.period})` : "";
  return `[Source: ${citation.documentName}${period}]`;
}

/**
 * Extract metrics from citation excerpt using regex patterns
 */
export function extractMetricsFromExcerpt(excerpt: string): string[] {
  const metrics: string[] = [];

  // Common metric patterns
  const patterns = [
    // Numbers with units: "4.2%", "245K", "1.5M"
    /(\d+[,.]?\d*[KkMm]?%?)/g,
    // Engagement metrics: "engagement rate: 4.2%"
    /engagement\s+rate:?\s*(\d+[.,]?\d*%?)/gi,
    // Growth metrics: "increase of 15%"
    /(increase|decrease|growth)\s+of\s+(\d+[.,]?\d*%?)/gi,
    // Count metrics: "245K impressions"
    /(\d+[,.]?\d*[KkMm]?)\s+(impressions?|reach|likes?|comments?|shares?|saves?|views?|interactions?)/gi,
  ];

  patterns.forEach((pattern) => {
    const matches = excerpt.matchAll(pattern);
    for (const match of matches) {
      metrics.push(match[0]);
    }
  });

  return [...new Set(metrics)]; // Remove duplicates
}

/**
 * Check if citation is high quality (high relevance)
 */
export function isHighQualityCitation(citation: Citation): boolean {
  return citation.relevanceScore >= 0.8;
}

/**
 * Check if citation is medium quality
 */
export function isMediumQualityCitation(citation: Citation): boolean {
  return citation.relevanceScore >= 0.6 && citation.relevanceScore < 0.8;
}

/**
 * Check if citation is low quality
 */
export function isLowQualityCitation(citation: Citation): boolean {
  return citation.relevanceScore < 0.6;
}

/**
 * Get citation quality label
 */
export function getCitationQualityLabel(
  citation: Citation
): "high" | "medium" | "low" {
  if (isHighQualityCitation(citation)) return "high";
  if (isMediumQualityCitation(citation)) return "medium";
  return "low";
}
