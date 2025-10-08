import { runStructuredPrompt } from "./openai-client";
import { tacticalCampaignSchema } from "./schemas";
import { BrandProfile } from "@/lib/db/schema";
import { AnnualStrategy } from "./strategy-generator";
import { analyzeCompetitorContent } from "@/lib/rivaliq";
import {
  searchContentInsights,
  searchCompetitiveInsights,
  searchTrendingTopics,
} from "./vector-search";
import { buildRAGContext } from "./context-builder";
import { db } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { eq, and } from "drizzle-orm";

export interface TacticalCampaign {
  opportunity: {
    type: string;
    description: string;
    urgency: "low" | "medium" | "high";
    relevanceScore: number;
  };
  campaignConcept: {
    name: string;
    objective: string;
    strategy: string;
    targetAudience: string;
  };
  contentAssets: Array<{
    platform: string;
    contentType: string;
    concept: string;
    callToAction: string;
  }>;
  timeline: {
    start: string;
    end: string;
    phases: Array<{
      phase: string;
      actions: string[];
    }>;
  };
  expectedOutcomes: string[];
}

/**
 * Check if brand has processed documents
 */
async function checkBrandHasDocuments(brandId: string): Promise<boolean> {
  const docs = await db
    .select()
    .from(brandDocuments)
    .where(
      and(
        eq(brandDocuments.brandId, brandId),
        eq(brandDocuments.processingStatus, "completed")
      )
    )
    .limit(1);

  return docs.length > 0;
}

/**
 * Detect market opportunities and generate tactical campaign
 */
export async function generateTacticalCampaign(
  brandProfile: BrandProfile,
  annualStrategy: AnnualStrategy,
  competitorData?: {
    companyIds: string[];
    topPosts?: any[];
    insights?: any;
  }
): Promise<TacticalCampaign> {
  // Check if brand has uploaded documents for RAG
  const hasDocuments = await checkBrandHasDocuments(brandProfile.id);

  let ragContext = "";
  if (hasDocuments) {
    // Retrieve campaign-relevant data
    const [content, competitive, trending] = await Promise.all([
      searchContentInsights(brandProfile.id),
      searchCompetitiveInsights(brandProfile.id),
      searchTrendingTopics(brandProfile.id),
    ]);

    // Build formatted context
    const allResults = [...content, ...competitive, ...trending];
    ragContext = buildRAGContext(allResults);
  }

  const prompt = buildCampaignPrompt(
    brandProfile,
    annualStrategy,
    competitorData,
    ragContext,
    hasDocuments
  );

  const campaign = await runStructuredPrompt<TacticalCampaign>(prompt, {
    model: "gpt-5-nano",
    reasoningEffort: "high",
    verbosity: "high",
  });

  return campaign;
}

function buildCampaignPrompt(
  brand: BrandProfile,
  strategy: AnnualStrategy,
  competitorData?: {
    companyIds: string[];
    topPosts?: any[];
    insights?: any;
  },
  ragContext?: string,
  hasDocuments?: boolean
): string {
  const contentPillarsText = strategy.contentPillars
    .map((p) => `- ${p.name}: ${p.description}`)
    .join("\n");

  const competitorInsights = competitorData?.topPosts
    ? `\n\n# Competitor Insights\nTop performing competitor posts:\n${competitorData.topPosts
        .slice(0, 5)
        .map(
          (p: any) =>
            `- ${p.content?.slice(0, 100)}... (Engagement: ${p.engagement?.total || 0})`
        )
        .join("\n")}`
    : "";

  return `
You are a tactical campaign strategist identifying market opportunities and creating rapid-response campaigns.

${ragContext || ""}

${
  hasDocuments
    ? `
⚠️ CRITICAL INSTRUCTION: Use the ACTUAL brand performance data above to identify proven content approaches and gaps. Base campaign recommendations on real performance insights and competitive intelligence from uploaded reports.
`
    : `
ℹ️ NOTE: No performance data available. Base campaign on strategy framework and market research.
`
}

# Brand Information
- **Brand Name**: ${brand.brandName}
- **Industry**: ${brand.industry}
- **Target Audience**: ${brand.targetAudience}
- **Brand Values**: ${brand.brandValues.join(", ")}
- **Competitors**: ${brand.competitors.join(", ")}

# Strategic Context
## Content Pillars
${contentPillarsText}

## Brand Voice
${strategy.contentPlaybook.toneAndVoice.join(", ")}

## Key Differentiators
${strategy.brandPositioning.differentiators.join("\n")}
${competitorInsights}

# Your Task
Identify a current market opportunity and create a tactical campaign to capitalize on it.

1. **Opportunity Detection**:
   - Use web search to identify:
     * Current trending topics in ${brand.industry}
     * Recent events or news relevant to the brand
     * Competitor gaps or missed opportunities
     * Seasonal or timely opportunities
     * Emerging conversations in the target audience space
   - Assess urgency (low/medium/high)
   - Score relevance to brand (0-10)
   - Choose opportunity type: trend, event, competitor gap, seasonal, audience need, etc.

2. **Campaign Concept**:
   - Create a compelling campaign name
   - Define clear objective aligned with brand goals
   - Develop strategy that leverages the opportunity
   - Specify target audience segment
   - Ensure alignment with brand positioning and values

3. **Content Assets** (5-8 pieces):
   - Mix platforms: Instagram, Facebook, Twitter/X, LinkedIn, TikTok
   - Vary content types: posts, stories, reels, videos, carousels
   - Provide specific concept for each asset
   - Include strong call-to-action for each
   - Ensure consistency with brand voice

4. **Timeline & Execution**:
   - Set realistic start and end dates
   - Break into phases: preparation, launch, amplification, wrap-up
   - Define specific actions for each phase
   - Consider urgency of opportunity

5. **Expected Outcomes**:
   - Predict 3-5 measurable results
   - Align with brand KPIs
   - Be realistic based on opportunity type

Use web search to:
- Find current trending topics and hashtags in ${brand.industry}
- Research recent news and events
- Identify competitor activity and gaps
- Discover audience conversations and pain points
- Find relevant cultural moments or holidays coming up

Create a campaign that is:
- Timely and relevant
- Aligned with brand strategy
- Actionable and specific
- Data-driven with clear outcomes
- Optimized for ${brand.targetAudience}
`;
}

/**
 * Generate multiple campaign opportunities
 */
export async function generateMultipleCampaigns(
  brandProfile: BrandProfile,
  annualStrategy: AnnualStrategy,
  count: number = 3,
  competitorData?: {
    companyIds: string[];
    topPosts?: any[];
    insights?: any;
  }
): Promise<TacticalCampaign[]> {
  // Generate campaigns sequentially to get diverse opportunities
  const campaigns: TacticalCampaign[] = [];

  for (let i = 0; i < count; i++) {
    const campaign = await generateTacticalCampaign(
      brandProfile,
      annualStrategy,
      competitorData
    );
    campaigns.push(campaign);
  }

  return campaigns;
}

/**
 * Analyze competitor gaps and generate campaign
 */
export async function generateCompetitorGapCampaign(
  brandProfile: BrandProfile,
  annualStrategy: AnnualStrategy,
  competitorIds: string[]
): Promise<TacticalCampaign> {
  // Get competitor content analysis
  const analysis = await analyzeCompetitorContent(competitorIds, {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  // Extract insights
  const competitorData = {
    companyIds: competitorIds,
    topPosts: analysis.companies.flatMap((c) => c.topPosts),
    insights: analysis.companies.map((c) => c.contentInsights),
  };

  return generateTacticalCampaign(brandProfile, annualStrategy, competitorData);
}