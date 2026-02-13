/**
 * Data Analysis Agent
 *
 * An AI agent that can extract, analyze, and calculate metrics from
 * CSV files, analytics reports, and other numeric data sources.
 *
 * Capabilities:
 * - Extract numeric data from CSV files (Instagram analytics, etc.)
 * - Calculate percentage changes, growth rates, averages
 * - Compare metrics across time periods
 * - Analyze follower growth, engagement rates, impressions
 * - Provide data-driven insights with context
 */

import { Agent, run } from '@openai/agents';
import { dataTools } from './tools/data-tools';
import { databaseTools } from './tools/database-tools';

/**
 * Creates a data analysis agent with numeric analysis capabilities
 */
export function createDataAnalysisAgent() {
  return new Agent({
    name: 'Data Analysis Agent',
    instructions: `You are a Data Analysis Agent that helps extract, analyze, and calculate metrics from documents and data sources.

## Your Capabilities
You can analyze and calculate:
- **Follower Growth**: Track follower counts over time, calculate growth rates
- **Engagement Metrics**: Likes, comments, shares, saves, engagement rates
- **Reach & Impressions**: Audience reach and impression metrics
- **Percentage Changes**: Month-over-month, year-over-year comparisons
- **Averages**: Average engagement, reach, follower growth, etc.
- **Growth Rates**: Compound growth rates, trend analysis

## How to Use Your Tools

### Step 1: Identify Brand and Data Source
1. Use \`list_brands\` to see available brands (if brand_id not provided)
2. Use \`get_brand\` to understand brand context

### Step 2: Get Data
For specific metrics:
- Use \`search_metrics\` to find specific numeric data (followers, engagement, etc.)
- Use \`get_document_data\` with file_name or category filter for full document content
- Common categories: "instagram", "facebook", "tiktok", "twitter", "rivaliq"

### Step 3: Extract and Calculate
- Use \`extract_numbers\` to parse numeric values from text content
- Use \`calculate_percentage_change\` for comparing two values
- Use \`calculate_growth_rate\` for multi-period growth analysis
- Use \`calculate_average\` for mean calculations

## Analysis Workflow

### Example: "Berapa persent kenaikan followers bulan ini?"
1. \`get_document_data\` with category="instagram" or file_name like "analytics"
2. \`search_metrics\` with metric_name="followers" and platform="instagram"
3. \`extract_numbers\` from content to get follower values
4. \`calculate_percentage_change\` with old_value (last month) and new_value (current month)

### Example: "What's our average engagement rate?"
1. \`get_document_data\` for relevant platform
2. \`search_metrics\` with metric_name="engagement"
3. \`extract_numbers\` to get all engagement values
4. \`calculate_average\` with values array

## Best Practices
1. Always identify correct data source first (document/category)
2. Extract numbers carefully from CSV/table data - look for column headers
3. Verify time periods when calculating changes (month-to-month, year-to-year)
4. Provide context in your answers (time period, platform, source file)
5. Show your calculations for transparency

## Response Format
When presenting data analysis:
- State metric being analyzed
- Specify time period and data source
- Show calculation (old value → new value)
- Provide result with percentage/absolute change
- Add insight or interpretation when relevant
- Use user's language (Indonesian or English)

## Important Notes
- CSV data may be in chunks - reconstruct full picture
- Look for column headers when analyzing tables
- Handle edge cases (zero values, missing data) gracefully
- If data is unclear, ask for clarification or state assumptions

## CRITICAL: Aturan Sumber Data
1. **SELALU tundjukkan sumber data** (citations) saat menjawab dengan metrik analitik
2. **TANPA DATA = TIDAK BOLEH JAWAB**: Jika tidak bisa menemukan data analitik yang relevan:
   - Jelas nyatakan: "Maaf, saya tidak menemukan data analitik untuk platform/periode ini."
   - DO NOT make up atau halusinasi metrik
   - Sarankan pengguna unggah data analitik dulu (Instagram, Facebook, TikTok)
3. **Jangan asumsikan** metrik ada - cek dulu dengan search_metrics atau get_document_data tools
4. **Hanya jawab dengan data** yang sebenarnya ada di dokumen yang diunggah`,
    model: 'gpt-5-nano',
    tools: [...dataTools, ...databaseTools],
  });
}

/**
 * Analyze follower growth for a brand
 */
export async function analyzeFollowerGrowth(
  brandId: string,
  platform?: string
): Promise<string> {
  const agent = createDataAnalysisAgent();
  const platformText = platform ? `on ${platform}` : 'across all platforms';
  const result = await run(
    agent,
    `Analyze follower growth ${platformText} for brand ID ${brandId}. Calculate:
    1. Current follower count
    2. Previous period follower count
    3. Percentage change
    4. Growth trend analysis

    Look for CSV files or analytics reports containing follower data.`
  );
  return result.finalOutput ?? '';
}

/**
 * Calculate engagement metrics
 */
export async function calculateEngagementMetrics(
  brandId: string,
  platform?: string
): Promise<string> {
  const agent = createDataAnalysisAgent();
  const platformText = platform ? `on ${platform}` : 'across all platforms';
  const result = await run(
    agent,
    `Calculate engagement metrics ${platformText} for brand ID ${brandId}. Include:
    1. Average engagement rate
    2. Total engagement (likes + comments + shares + saves)
    3. Engagement trends over time

    Look for analytics CSV files with engagement data.`
  );
  return result.finalOutput ?? '';
}

/**
 * Compare metrics between two time periods
 */
export async function compareMetricsPeriods(
  brandId: string,
  metricName: string,
  period1: string,
  period2: string
): Promise<string> {
  const agent = createDataAnalysisAgent();
  const result = await run(
    agent,
    `Compare ${metricName} metrics between ${period1} and ${period2} for brand ID ${brandId}. Calculate percentage change and provide insights on trend.`
  );
  return result.finalOutput ?? '';
}

/**
 * Convenience function for general data analysis query
 */
export async function analyzeData(query: string, brandId: string): Promise<{
  success: boolean;
  response: string;
  citations: any[];
}> {
  const agent = createDataAnalysisAgent();
  const result = await run(agent, query);

  // Extract citations from agent context
  const response = result.finalOutput || '';
  const citations = (result as any).context?.citations || [];

  console.log('[Data Analysis] Response:', response);
  console.log('[Data Analysis] Citations:', citations);

  return {
    success: true,
    response: response,
    citations: citations,
  };
}

export default createDataAnalysisAgent;
