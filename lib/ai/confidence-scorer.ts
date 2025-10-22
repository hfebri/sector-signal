/**
 * Confidence Scorer
 *
 * Calculates data quality metrics and confidence levels for RAG-powered strategies.
 * Determines how reliable the AI recommendations are based on available data.
 */

import { Citation, DataQuality } from "./types/citations";
import {
  calculateAverageRelevance,
  getUniquePlatforms,
  getDateRange,
} from "./citation-tracker";

/**
 * Calculate comprehensive data quality metrics from citations
 */
export function calculateDataQuality(
  citations: Citation[],
  brandId: string
): DataQuality {
  const hasRAGData = citations.length > 0;

  if (!hasRAGData) {
    return {
      hasRAGData: false,
      coverageScore: 0,
      documentCount: 0,
      chunkCount: 0,
      platforms: [],
      oldestDataDate: null,
      newestDataDate: null,
      confidenceLevel: "low",
      averageRelevance: 0,
    };
  }

  // Count unique documents
  const uniqueDocuments = new Set(citations.map((c) => c.documentId));
  const documentCount = uniqueDocuments.size;

  // Total chunks
  const chunkCount = citations.length;

  // Platforms covered
  const platforms = getUniquePlatforms(citations);

  // Date range
  const { oldest, newest } = getDateRange(citations);

  // Average relevance
  const averageRelevance = calculateAverageRelevance(citations);

  // Calculate coverage score (0-100)
  const coverageScore = calculateCoverageScore({
    documentCount,
    chunkCount,
    platformCount: platforms.length,
    averageRelevance,
  });

  // Determine confidence level
  const confidenceLevel = getConfidenceLevel(citations);

  return {
    hasRAGData: true,
    coverageScore,
    documentCount,
    chunkCount,
    platforms,
    oldestDataDate: oldest,
    newestDataDate: newest,
    confidenceLevel,
    averageRelevance,
  };
}

/**
 * Calculate coverage score (0-100) based on multiple factors
 */
function calculateCoverageScore(params: {
  documentCount: number;
  chunkCount: number;
  platformCount: number;
  averageRelevance: number;
}): number {
  const { documentCount, chunkCount, platformCount, averageRelevance } = params;

  // Scoring weights
  const weights = {
    documents: 0.3, // 30% - Number of documents
    chunks: 0.2, // 20% - Number of chunks
    platforms: 0.2, // 20% - Platform diversity
    relevance: 0.3, // 30% - Average relevance
  };

  // Score each factor (0-100)
  const documentScore = Math.min(100, (documentCount / 20) * 100); // Perfect at 20+ docs
  const chunkScore = Math.min(100, (chunkCount / 50) * 100); // Perfect at 50+ chunks
  const platformScore = Math.min(100, (platformCount / 4) * 100); // Perfect at 4+ platforms
  const relevanceScore = averageRelevance * 100; // 0-100 based on 0-1 score

  // Weighted average
  const totalScore =
    documentScore * weights.documents +
    chunkScore * weights.chunks +
    platformScore * weights.platforms +
    relevanceScore * weights.relevance;

  return Math.round(totalScore);
}

/**
 * Determine confidence level based on citation quality
 *
 * High: 10+ citations, avg relevance > 0.75, multiple platforms
 * Medium: 5-9 citations, avg relevance > 0.6
 * Low: <5 citations or avg relevance < 0.6
 */
export function getConfidenceLevel(citations: Citation[]): "low" | "medium" | "high" {
  if (citations.length === 0) return "low";

  const avgRelevance = calculateAverageRelevance(citations);
  const platforms = getUniquePlatforms(citations);
  const citationCount = citations.length;

  // High confidence criteria
  if (citationCount >= 10 && avgRelevance >= 0.75 && platforms.length >= 2) {
    return "high";
  }

  // Medium confidence criteria
  if (citationCount >= 5 && avgRelevance >= 0.6) {
    return "medium";
  }

  // Low confidence (fallback)
  return "low";
}

/**
 * Get confidence level color for UI display
 */
export function getConfidenceLevelColor(
  level: "low" | "medium" | "high"
): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case "high":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "medium":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
      };
    case "low":
      return {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
}

/**
 * Get confidence level label for display
 */
export function getConfidenceLevelLabel(level: "low" | "medium" | "high"): string {
  switch (level) {
    case "high":
      return "High Confidence";
    case "medium":
      return "Medium Confidence";
    case "low":
      return "Low Confidence";
  }
}

/**
 * Get confidence level description
 */
export function getConfidenceLevelDescription(
  level: "low" | "medium" | "high"
): string {
  switch (level) {
    case "high":
      return "Strong data backing with multiple high-quality sources from various platforms.";
    case "medium":
      return "Moderate data backing. Some recommendations based on available data, others on best practices.";
    case "low":
      return "Limited data available. Most recommendations based on industry best practices.";
  }
}

/**
 * Calculate coverage score percentage for display
 */
export function getCoveragePercentage(dataQuality: DataQuality): string {
  return `${dataQuality.coverageScore}%`;
}

/**
 * Get platform coverage summary
 */
export function getPlatformCoverageSummary(dataQuality: DataQuality): string {
  if (dataQuality.platforms.length === 0) {
    return "No platform data";
  }

  if (dataQuality.platforms.length === 1) {
    return `${capitalizeFirst(dataQuality.platforms[0])} only`;
  }

  if (dataQuality.platforms.length === 2) {
    return `${capitalizeFirst(dataQuality.platforms[0])} & ${capitalizeFirst(dataQuality.platforms[1])}`;
  }

  return `${dataQuality.platforms.length} platforms`;
}

/**
 * Get date range summary
 */
export function getDateRangeSummary(dataQuality: DataQuality): string {
  if (!dataQuality.oldestDataDate || !dataQuality.newestDataDate) {
    return "No date information";
  }

  if (dataQuality.oldestDataDate === dataQuality.newestDataDate) {
    return dataQuality.oldestDataDate;
  }

  return `${dataQuality.oldestDataDate} - ${dataQuality.newestDataDate}`;
}

/**
 * Check if data is stale (older than 6 months)
 */
export function isDataStale(dataQuality: DataQuality): boolean {
  if (!dataQuality.newestDataDate) return false;

  try {
    const newestDate = new Date(dataQuality.newestDataDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return newestDate < sixMonthsAgo;
  } catch {
    return false;
  }
}

/**
 * Get data freshness label
 */
export function getDataFreshnessLabel(dataQuality: DataQuality): string {
  if (!dataQuality.newestDataDate) return "Unknown";

  try {
    const newestDate = new Date(dataQuality.newestDataDate);
    const now = new Date();
    const diffMonths =
      (now.getFullYear() - newestDate.getFullYear()) * 12 +
      now.getMonth() -
      newestDate.getMonth();

    if (diffMonths < 1) return "Current";
    if (diffMonths < 3) return "Recent";
    if (diffMonths < 6) return "Somewhat Recent";
    return "Dated";
  } catch {
    return "Unknown";
  }
}

/**
 * Get recommendation based on data quality
 */
export function getDataQualityRecommendation(dataQuality: DataQuality): string | null {
  if (!dataQuality.hasRAGData) {
    return "Upload analytics reports to get data-driven recommendations.";
  }

  if (dataQuality.platforms.length < 2) {
    return "Upload data from more platforms for comprehensive insights.";
  }

  if (dataQuality.documentCount < 5) {
    return "Upload more historical data for better trend analysis.";
  }

  if (isDataStale(dataQuality)) {
    return "Consider uploading more recent data for up-to-date recommendations.";
  }

  return null; // No recommendations - data quality is good
}

/**
 * Helper: Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Calculate confidence score as number (0-100) for visual displays
 */
export function getConfidenceScore(dataQuality: DataQuality): number {
  // Map confidence level to score ranges
  switch (dataQuality.confidenceLevel) {
    case "high":
      return 85 + Math.round(dataQuality.averageRelevance * 15); // 85-100
    case "medium":
      return 60 + Math.round(dataQuality.averageRelevance * 25); // 60-85
    case "low":
      return Math.round(dataQuality.averageRelevance * 60); // 0-60
  }
}
