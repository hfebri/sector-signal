import { runStructuredPrompt } from "./openai-client";
import { BrandProfile } from "@/lib/db/schema";
import {
  searchPerformanceData,
  searchContentInsights,
  searchAudienceInsights,
  searchCompetitiveInsights,
  getCitationsForStrategy,
} from "./vector-search";
import { buildStrategyContext } from "./context-builder";
import { db } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { eq, and } from "drizzle-orm";
import { StrategyWithCitations, Citation } from "./types/citations";
import { calculateDataQuality } from "./confidence-scorer";
import { deduplicateCitations } from "./citation-tracker";

export interface AnnualStrategy {
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  brandPositioning: {
    statement: string;
    differentiators: string[];
    targetAudienceInsights: string[];
  };
  contentPillars: Array<{
    name: string;
    description: string;
    objectives: string[];
    contentTypes: string[];
    frequency: string;
  }>;
  annualGoals: Array<{
    goal: string;
    metric: string;
    target: string;
    timeline: string;
  }>;
  contentPlaybook: {
    toneAndVoice: string[];
    messagingFramework: string[];
    visualGuidelines: string[];
    contentFormats: string[];
  };
  kpiFramework: Array<{
    category: string;
    metrics: string[];
    benchmarks: string;
  }>;
}

/**
 * Check if brand has processed documents
 */
async function checkBrandHasDocuments(brandId: string): Promise<boolean> {
  try {
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
  } catch (error) {
    console.error("Error checking for documents:", error);
    // If there's an error checking documents, just proceed without RAG
    return false;
  }
}

/**
 * Generate a comprehensive annual social media strategy with citations
 */
export async function generateAnnualStrategyWithCitations(
  brandProfile: BrandProfile
): Promise<StrategyWithCitations> {
  try {
    // Check if brand has uploaded documents for RAG
    const hasDocuments = await checkBrandHasDocuments(brandProfile.id);

    let ragContext = "";
    let allCitations: Citation[] = [];

    if (hasDocuments) {
      try {
        console.log("Fetching RAG context for brand:", brandProfile.id);

        // Retrieve actual brand performance data
        const [performance, content, audience, competitive] = await Promise.all([
          searchPerformanceData(brandProfile.id).catch(e => {
            console.error("Performance search error:", e);
            return [];
          }),
          searchContentInsights(brandProfile.id).catch(e => {
            console.error("Content search error:", e);
            return [];
          }),
          searchAudienceInsights(brandProfile.id).catch(e => {
            console.error("Audience search error:", e);
            return [];
          }),
          searchCompetitiveInsights(brandProfile.id).catch(e => {
            console.error("Competitive search error:", e);
            return [];
          }),
        ]);

        console.log(`RAG search completed - Performance: ${performance.length}, Content: ${content.length}, Audience: ${audience.length}, Competitive: ${competitive.length}`);

        // Build formatted context for AI with citation numbers
        const { context, citationMap } = buildStrategyContext({
          performance,
          content,
          audience,
          competitive,
        });
        ragContext = context;

        // Convert citationMap to Citation[] with citation numbers
        allCitations = Array.from(citationMap.entries()).map(([citationNumber, searchResult]) => ({
          documentId: searchResult.metadata.documentId,
          documentName: searchResult.metadata.fileName || "Unknown Document",
          chunkIndex: searchResult.metadata.chunkIndex || 0,
          excerpt: searchResult.content.substring(0, 200),
          relevanceScore: searchResult.score,
          citationNumber, // Add the citation number
          metadata: {
            platform: searchResult.metadata.platform,
            period: searchResult.metadata.period,
            category: searchResult.metadata.category,
            fileName: searchResult.metadata.fileName,
          },
        }));

        console.log(`Final citations with numbers: ${allCitations.length} (numbered 1-${citationMap.size})`);
      } catch (error) {
        console.error("Error retrieving RAG context:", error);
        // Continue without RAG if there's an error
      }
    }

    const prompt = buildStrategyPrompt(brandProfile, ragContext, hasDocuments);

    const strategy = await runStructuredPrompt<AnnualStrategy>(prompt, {
      model: "gpt-5-nano",
      reasoningEffort: "medium", // Changed from "high" to reduce generation time (high: 2-3min, medium: 1-2min)
      verbosity: "medium", // Changed from "high" for faster responses
    });

    // Calculate data quality metrics
    const dataQuality = calculateDataQuality(allCitations, brandProfile.id);

    // Return strategy with citations
    return {
      strategy,
      citations: {
        overall: allCitations,
        bySection: {
          // For now, all citations apply to all sections
          // In a more advanced implementation, we could track which citations
          // were used for each section during generation
        },
      },
      dataQuality,
    };
  } catch (error) {
    console.error("Error in generateAnnualStrategyWithCitations:", error);
    throw error;
  }
}

/**
 * Generate a comprehensive annual social media strategy (legacy method)
 * @deprecated Use generateAnnualStrategyWithCitations instead
 */
export async function generateAnnualStrategy(
  brandProfile: BrandProfile
): Promise<AnnualStrategy> {
  const result = await generateAnnualStrategyWithCitations(brandProfile);
  return result.strategy;
}

function buildStrategyPrompt(
  brand: BrandProfile,
  ragContext: string,
  hasDocuments: boolean
): string {
  return `
You are a senior social media strategist tasked with creating a comprehensive annual social media strategy.

${ragContext}

${
  hasDocuments
    ? `
⚠️ CRITICAL INSTRUCTION: The BRAND DATA ANALYSIS section above contains ACTUAL performance data from uploaded analytics reports. You MUST use these real metrics, insights, and trends to inform your strategy. Do NOT make generic assumptions - base all recommendations on the specific data provided above.
`
    : `
ℹ️ NOTE: No performance data has been uploaded yet. Base your strategy on the brand profile below and industry best practices. Recommendations will be general until actual performance data is available.
`
}

# Brand Information
- **Brand Name**: ${brand.brandName}
- **Industry**: ${brand.industry}
- **Description**: ${brand.description}
- **Target Audience**: ${brand.targetAudience}
- **Brand Voice**: ${brand.brandVoice || "N/A"}
- **Goals**: ${brand.goals || "N/A"}
- **Competitors**: ${Array.isArray(brand.competitors) ? brand.competitors.join(", ") : brand.competitors || "N/A"}

# Your Task
Create a comprehensive annual social media strategy that includes:

1. **SWOT Analysis**: Analyze the brand's competitive position
   - Research current market trends in ${brand.industry}
   - Analyze competitor positioning${Array.isArray(brand.competitors) && brand.competitors.length > 0 ? ": " + brand.competitors.join(", ") : ""}
   - Identify unique opportunities based on brand values and target audience

2. **Brand Positioning**: Define clear differentiation
   - Create a compelling positioning statement
   - Identify 3-5 key differentiators from competitors
   - Provide insights about the target audience: ${brand.targetAudience}

3. **Content Pillars**: Develop 3-5 main content themes
   - Each pillar should align with brand voice and positioning
   - Include specific content types and posting frequency
   - Connect pillars to business goals

4. **Annual Goals**: Set measurable objectives
   - Align with brand goals${brand.goals ? ": " + brand.goals : ""}
   - Include specific metrics and targets
   - Define clear timelines

5. **Content Playbook**: Establish guidelines
   - Define tone and voice that reflects brand personality
   - Create messaging framework
   - Provide visual style direction
   - Recommend content formats

6. **KPI Framework**: Define success metrics
   - Research industry benchmarks for ${brand.industry}
   - Group metrics by category (awareness, engagement, conversion)
   - Provide realistic benchmarks based on current market standards

# Response Format
You MUST respond with a valid JSON object matching this exact structure:

{
  "swotAnalysis": {
    "strengths": ["strength 1", "strength 2", ...],
    "weaknesses": ["weakness 1", "weakness 2", ...],
    "opportunities": ["opportunity 1", "opportunity 2", ...],
    "threats": ["threat 1", "threat 2", ...]
  },
  "brandPositioning": {
    "statement": "positioning statement",
    "differentiators": ["differentiator 1", "differentiator 2", ...],
    "targetAudienceInsights": ["insight 1", "insight 2", ...]
  },
  "contentPillars": [
    {
      "name": "pillar name",
      "description": "pillar description",
      "objectives": ["objective 1", "objective 2", ...],
      "contentTypes": ["type 1", "type 2", ...],
      "frequency": "posting frequency"
    }
  ],
  "annualGoals": [
    {
      "goal": "goal description",
      "metric": "metric name",
      "target": "target value",
      "timeline": "timeline"
    }
  ],
  "contentPlaybook": {
    "toneAndVoice": ["tone 1", "tone 2", ...],
    "messagingFramework": ["message 1", "message 2", ...],
    "visualGuidelines": ["guideline 1", "guideline 2", ...],
    "contentFormats": ["format 1", "format 2", ...]
  },
  "kpiFramework": [
    {
      "category": "category name",
      "metrics": ["metric 1", "metric 2", ...],
      "benchmarks": "benchmark description"
    }
  ]
}

Create a strategy that is actionable, data-driven, and aligned with the brand's goals.
`;
}