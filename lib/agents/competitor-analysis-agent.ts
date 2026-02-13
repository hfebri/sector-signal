
/**
 * Analyze competitor content strategies
 */
export async function analyzeCompetitorContent(brandId: string, platform?: string): Promise<string> {
  const agent = createCompetitorAnalysisAgent();
  const platformText = platform || 'all platforms';
  const result = await run(
    agent,
    `Analyze competitor content strategies on ${platformText} for brand ID ${brandId}. Include:
    1. What content types perform best for competitors
    2. Posting frequency and timing patterns
    3. Engagement strategies competitors use
    4. Content gaps we can exploit
    5. Recommended content approach`
  );
  return result.finalOutput ?? '';
}

/**
 * Find competitive opportunities
 */
export async function findCompetitiveOpportunities(brandId: string): Promise<string> {
  const agent = createCompetitorAnalysisAgent();
  const result = await run(
    agent,
    `Find competitive opportunities for brand ID ${brandId}. Identify:
    1. Areas where competitors are weak
    2. Underserved content themes or formats
    3. Engagement strategies competitors aren't using
    4. Timing or posting frequency opportunities
    5. Quick wins we can implement`
  );
  return result.finalOutput ?? '';
}

/**
 * Convenience function for general competitive analysis query
 */
export async function analyzeCompetitors(query: string, brandId: string): Promise<string> {
  const agent = createCompetitorAnalysisAgent();
  const result = await run(
    agent,
    `Brand ID: ${brandId}\n\nQuery: ${query}\n\nUse competitor data from RivalIQ to answer this question. Provide specific, actionable insights.`
  );
  return result.finalOutput ?? '';
}

export default createCompetitorAnalysisAgent;
