import { SearchResult } from "./vector-search";

/**
 * Context with citation mapping for inline citations
 */
export interface ContextWithCitations {
  context: string;
  citationMap: Map<number, SearchResult>;
}

/**
 * Format retrieved chunks into readable context for AI prompts
 */
export function buildRAGContext(searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return "";
  }

  // Group results by platform/category
  const groupedByPlatform = searchResults.reduce((acc, result) => {
    const platform = result.metadata.platform || result.metadata.category || "general";
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Build formatted context
  let context = "\n\n## ACTUAL BRAND PERFORMANCE DATA\n";
  context += "*(Retrieved from uploaded social media analytics reports)*\n\n";

  Object.entries(groupedByPlatform).forEach(([platform, results]) => {
    context += `### ${platform.toUpperCase()} Performance Data\n`;

    results.forEach((result, index) => {
      const period = result.metadata.period
        ? ` (${result.metadata.period})`
        : "";
      const fileName = result.metadata.fileName
        ? ` - Source: ${result.metadata.fileName}`
        : "";

      context += `\n**Insight ${index + 1}${period}**${fileName}\n`;
      context += `${result.content.trim()}\n`;
    });

    context += "\n";
  });

  context += "---\n\n";

  return context;
}

/**
 * Build context specifically for performance metrics
 */
export function buildPerformanceContext(searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return "";
  }

  let context = "\n\n## KEY PERFORMANCE METRICS\n";

  searchResults.forEach((result) => {
    const platform = result.metadata.platform || result.metadata.category;
    const period = result.metadata.period || "Recent";

    context += `\n**${platform?.toUpperCase()} - ${period}:**\n`;
    context += `${result.content.trim()}\n`;
  });

  context += "\n";
  return context;
}

/**
 * Build context for content insights
 */
export function buildContentContext(searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return "";
  }

  let context = "\n\n## TOP PERFORMING CONTENT INSIGHTS\n";

  searchResults.forEach((result, index) => {
    context += `\n**${index + 1}. ${result.metadata.fileName || "Content Insight"}**\n`;
    context += `${result.content.trim()}\n`;
  });

  context += "\n";
  return context;
}

/**
 * Build context for audience insights
 */
export function buildAudienceContext(searchResults: SearchResult[]): string {
  if (searchResults.length === 0) {
    return "";
  }

  let context = "\n\n## AUDIENCE INSIGHTS & DEMOGRAPHICS\n";

  searchResults.forEach((result) => {
    context += `\n${result.content.trim()}\n`;
  });

  context += "\n";
  return context;
}

/**
 * Extract key metrics from search results
 */
export function extractKeyMetrics(searchResults: SearchResult[]): {
  metrics: string[];
  platforms: string[];
  periods: string[];
} {
  const metrics: string[] = [];
  const platforms = new Set<string>();
  const periods = new Set<string>();

  searchResults.forEach((result) => {
    // Extract platform
    if (result.metadata.platform) {
      platforms.add(result.metadata.platform);
    }

    // Extract period
    if (result.metadata.period) {
      periods.add(result.metadata.period);
    }

    // Extract metrics from content (simple regex matching)
    const metricPatterns = [
      /(\d+[,.]?\d*[KkMm]?)\s*(impressions?|reach|engagement|likes?|comments?|shares?|saves?|views?|interactions?)/gi,
      /engagement rate:?\s*(\d+[.,]?\d*%?)/gi,
      /(increase|decrease|growth)\s*of\s*(\d+[.,]?\d*%?)/gi,
    ];

    metricPatterns.forEach((pattern) => {
      const matches = result.content.matchAll(pattern);
      for (const match of matches) {
        metrics.push(match[0]);
      }
    });
  });

  return {
    metrics: [...new Set(metrics)].slice(0, 10), // Top 10 unique metrics
    platforms: Array.from(platforms),
    periods: Array.from(periods),
  };
}

/**
 * Build a comprehensive context for strategy generation with citation tracking
 */
export function buildStrategyContext(params: {
  performance?: SearchResult[];
  content?: SearchResult[];
  audience?: SearchResult[];
  competitive?: SearchResult[];
}): ContextWithCitations {
  const { performance = [], content = [], audience = [], competitive = [] } = params;

  let context = "\n\n# BRAND DATA ANALYSIS\n";
  context += "*(Based on actual uploaded analytics and reports)*\n\n";

  // Create citation mapping
  const citationMap = new Map<number, SearchResult>();
  let citationNumber = 1;

  // Add data usage instructions with INLINE CITATIONS
  context += "## IMPORTANT: CITATION INSTRUCTIONS\n";
  context += "When using data from the sources below, you MUST cite them using inline citation numbers:\n";
  context += "- Each data source below is marked with [1], [2], [3], etc.\n";
  context += "- When you use information from a source, add the citation number at the END of the sentence or claim\n";
  context += "- Example: 'Instagram engagement increased by 45% in Q1 [1]'\n";
  context += "- Example: 'Video content performs best with 28,871 views average [2]'\n";
  context += "- Use specific metrics and numbers from the data provided\n";
  context += "- If no specific data exists for a recommendation, do NOT add a citation number\n\n";
  context += "---\n\n";

  // Add performance data with citation numbers
  if (performance.length > 0) {
    context += "\n\n## KEY PERFORMANCE METRICS\n";
    performance.forEach((result) => {
      const platform = result.metadata.platform || result.metadata.category;
      const period = result.metadata.period || "Recent";
      const fileName = result.metadata.fileName || "Unknown Source";

      context += `\n**[${citationNumber}] ${platform?.toUpperCase()} - ${period}**\n`;
      context += `Source: ${fileName}\n`;
      context += `${result.content.trim()}\n`;

      citationMap.set(citationNumber, result);
      citationNumber++;
    });
    context += "\n";
  }

  // Add content insights with citation numbers
  if (content.length > 0) {
    context += "\n\n## TOP PERFORMING CONTENT INSIGHTS\n";
    content.forEach((result) => {
      const fileName = result.metadata.fileName || "Content Insight";

      context += `\n**[${citationNumber}] ${fileName}**\n`;
      context += `${result.content.trim()}\n`;

      citationMap.set(citationNumber, result);
      citationNumber++;
    });
    context += "\n";
  }

  // Add audience insights with citation numbers
  if (audience.length > 0) {
    context += "\n\n## AUDIENCE INSIGHTS & DEMOGRAPHICS\n";
    audience.forEach((result) => {
      const fileName = result.metadata.fileName || "Audience Data";

      context += `\n**[${citationNumber}] ${fileName}**\n`;
      context += `${result.content.trim()}\n`;

      citationMap.set(citationNumber, result);
      citationNumber++;
    });
    context += "\n";
  }

  // Add competitive intelligence with citation numbers
  if (competitive.length > 0) {
    context += "\n\n## COMPETITIVE INTELLIGENCE\n";
    competitive.forEach((result) => {
      const fileName = result.metadata.fileName || "Competitive Analysis";

      context += `\n**[${citationNumber}] ${fileName}**\n`;
      context += `${result.content.trim()}\n`;

      citationMap.set(citationNumber, result);
      citationNumber++;
    });
    context += "\n";
  }

  const allResults = [...performance, ...content, ...audience, ...competitive];
  const { metrics, platforms, periods } = extractKeyMetrics(allResults);

  context += "\n## DATA SUMMARY\n";
  context += `- **Platforms Analyzed**: ${platforms.join(", ") || "N/A"}\n`;
  context += `- **Time Periods**: ${periods.join(", ") || "N/A"}\n`;
  context += `- **Key Metrics Found**: ${metrics.slice(0, 5).join(", ") || "N/A"}\n`;
  context += `- **Total Data Sources**: ${allResults.length} numbered citations available\n`;
  context += "\n---\n\n";

  return { context, citationMap };
}

/**
 * Limit context length to fit within token limits
 */
export function limitContextLength(
  context: string,
  maxTokens: number = 5000
): string {
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = maxTokens * 4;

  if (context.length <= maxChars) {
    return context;
  }

  // Truncate and add notice
  const truncated = context.substring(0, maxChars);
  return (
    truncated +
    "\n\n*(Note: Context truncated due to length. Additional data available in uploaded documents.)*\n"
  );
}
