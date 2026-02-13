/**
 * Report Generator Agent
 *
 * An AI agent that generates professional reports from brand data,
 * including weekly, monthly, and platform-specific performance reports.
 *
 * Capabilities:
 * - Weekly performance reports
 * - Monthly summary reports
 * - Platform-specific reports
 * - Period-over-period comparisons
 * - Executive summaries
 */

import { Agent, run } from '@openai/agents';
import { reportTools } from './tools/report-tools';
import { databaseTools } from './tools/database-tools';

/**
 * Creates a report generator agent
 */
export function createReportGeneratorAgent() {
  return new Agent({
    name: 'Report Generator Agent',
    instructions: `You are a Report Generator Agent that creates professional, actionable reports from brand performance data.

## Your Capabilities
You can generate:
- **Weekly Performance Reports**: Quick weekly summaries for internal tracking
- **Monthly Reports**: Comprehensive monthly analysis for clients
- **Platform-Specific Reports**: Deep dives into Instagram, Facebook, TikTok, etc.
- **Comparison Reports**: Period-over-period growth analysis
- **Executive Summaries**: High-level insights for stakeholders

## How to Use Your Tools

### Step 1: Get Brand Context
1. Use \`get_brand_info\` for report header (brand name, industry, etc.)
2. Use \`list_brands\` if brand_id is not provided

### Step 2: Gather Report Data
- Use \`get_brand_report_data\` for comprehensive metrics across all platforms
- Use \`get_top_performing_content\` for best/worst performing posts
- Use \`get_posting_patterns\` for frequency and timing insights
- Use \`get_period_comparison\` for month-over-month or week-over-week analysis

### Step 3: Generate the Report
Structure the report with clear sections, metrics, and actionable insights.

## Report Structure

### Standard Monthly Report:
\`\`\`
# [Brand Name] - Monthly Performance Report
**Period:** [Month Year]
**Generated:** [Date]

---

## Executive Summary
3-5 bullet points of key findings

---

## Platform Overview
### Instagram
- Followers: [X] ([+/-]X%)
- Engagement Rate: [X]%
- Total Posts: [X]

### Facebook
[Same format]

### TikTok
[Same format]

---

## Top Performing Content
1. [Content description] - [Engagement metrics]
2. [Content description] - [Engagement metrics]
3. ...

---

## Key Insights
- [Insight 1]
- [Insight 2]
- ...

---

## Recommendations
1. [Actionable recommendation]
2. [Actionable recommendation]
3. ...

---

## Next Month's Focus
- [Priority 1]
- [Priority 2]
\`\`\`

## Best Practices
1. **Be Specific**: Use actual numbers, not vague statements
   - Bad: "Growth was good"
   - Good: "Followers increased by 12.5% (+2,340 followers)"

2. **Show Context**: Always include period comparisons
   - "Engagement rate: 3.2% (up from 2.8% last month)"

3. **Be Actionable**: Recommendations should be specific steps
   - Bad: "Post more content"
   - Good: "Increase posting frequency from 3x to 5x per week on Instagram"

4. **Format for Readability**: Use tables, bullet points, headers
5. **Highlight Key Metrics**: Bold important numbers
6. **Include Data Sources**: Reference which documents/data were used

## Response Format
Generate reports in markdown format with:
- Clear section headers (##, ###)
- Bullet points for lists
- Tables for comparisons (when applicable)
- Bold for key metrics (**12.5%**)
- Numbered lists for recommendations

## Important Notes
- Only use data from actual documents - don't make up metrics
- If data is missing for a platform, state "No data available"
- Always include the report period and generation date
- Keep executive summaries concise (3-5 bullets max)
- Focus on insights, not just data reporting`,
    model: 'gpt-5-nano',
    tools: [...reportTools, ...databaseTools],
  });
}

/**
 * Generate a weekly performance report
 */
export async function generateWeeklyReport(brandId: string, platform?: string): Promise<string> {
  const agent = createReportGeneratorAgent();
  const platformText = platform || 'all platforms';
  const result = await run(
    agent,
    `Generate a weekly performance report for brand ID ${brandId} on ${platformText}.

    Include:
    1. Executive summary (3-5 key bullets)
    2. Key metrics with period-over-period comparison
    3. Top 3 performing posts
    4. Quick wins for next week

    Keep it concise and actionable.`
  );
  return result.finalOutput ?? '';
}

/**
 * Generate a monthly performance report
 */
export async function generateMonthlyReport(brandId: string, platform?: string): Promise<string> {
  const agent = createReportGeneratorAgent();
  const platformText = platform || 'all platforms';
  const result = await run(
    agent,
    `Generate a comprehensive monthly performance report for brand ID ${brandId} on ${platformText}.

    Include:
    1. Executive summary
    2. Platform overview with all key metrics
    3. Top/bottom performing content
    4. Posting patterns and frequency
    5. Month-over-month comparison
    6. Key insights
    7. 5 actionable recommendations
    8. Next month's focus areas

    Format as a professional client-facing report.`
  );
  return result.finalOutput ?? '';
}

/**
 * Generate a platform-specific deep dive report
 */
export async function generatePlatformReport(brandId: string, platform: string): Promise<string> {
  const agent = createReportGeneratorAgent();
  const result = await run(
    agent,
    `Generate a detailed ${platform} performance report for brand ID ${brandId}.

    Include:
    1. Platform-specific executive summary
    2. Follower growth analysis
    3. Engagement rate and trends
    4. Content performance breakdown
    5. Posting frequency and optimal times
    6. Top 5 and bottom 5 posts
    7. Benchmark against industry standards
    8. Platform-specific recommendations

    Make it comprehensive for ${platform}.`
  );
  return result.finalOutput ?? '';
}

/**
 * Generate a comparison report (period over period)
 */
export async function generateComparisonReport(
  brandId: string,
  currentPeriod: string,
  previousPeriod: string,
  platform?: string
): Promise<string> {
  const agent = createReportGeneratorAgent();
  const result = await run(
    agent,
    `Generate a comparison report for brand ID ${brandId} comparing ${currentPeriod} to ${previousPeriod}${platform ? ` on ${platform}` : ''}.

    Include:
    1. Summary of changes between periods
    2. Metric comparison table (current vs previous)
    3. Percentage changes for all key metrics
    4. What improved and what declined
    5. Insights on the changes
    6. Recommendations based on trends

    Focus on growth and performance changes.`
  );
  return result.finalOutput ?? '';
}

/**
 * Generate an executive summary (stakeholder-friendly)
 */
export async function generateExecutiveSummary(brandId: string): Promise<string> {
  const agent = createReportGeneratorAgent();
  const result = await run(
    agent,
    `Generate an executive summary for brand ID ${brandId} suitable for stakeholders.

    Include:
    1. Overall performance snapshot
    2. Top 3 achievements
    3. Top 3 areas for improvement
    4. Key metrics at a glance
    5. Strategic recommendations (3 max)

    Keep it brief, high-level, and business-focused. No jargon.`
  );
  return result.finalOutput ?? '';
}

/**
 * Convenience function for custom report generation
 */
export async function generateReport(
  brandId: string,
  reportType: 'weekly' | 'monthly' | 'platform' | 'comparison' | 'executive',
  options?: {
    platform?: string;
    currentPeriod?: string;
    previousPeriod?: string;
  }
): Promise<string> {
  const agent = createReportGeneratorAgent();

  let prompt = `Generate a ${reportType} report for brand ID ${brandId}.`;

  if (options?.platform) {
    prompt += ` Platform: ${options.platform}.`;
  }
  if (options?.currentPeriod && options?.previousPeriod) {
    prompt += ` Compare ${options.currentPeriod} to ${options.previousPeriod}.`;
  }

  prompt += ` Use available data and create a professional, actionable report.`;

  const result = await run(agent, prompt);
  return result.finalOutput ?? '';
}

export default createReportGeneratorAgent;
