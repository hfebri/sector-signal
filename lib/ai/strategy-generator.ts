import { runStructuredPrompt } from "./openai-client";
import { BrandProfile } from "@/lib/db/schema";
import {
  searchPerformanceData,
  searchContentInsights,
  searchAudienceInsights,
  searchCompetitiveInsights,
} from "./vector-search";
import { buildStrategyContext } from "./context-builder";
import { db } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { eq, and } from "drizzle-orm";

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
 * Generate a comprehensive annual social media strategy
 */
export async function generateAnnualStrategy(
  brandProfile: BrandProfile
): Promise<AnnualStrategy> {
  try {
    // Check if brand has uploaded documents for RAG
    const hasDocuments = await checkBrandHasDocuments(brandProfile.id);

    let ragContext = "";
    if (hasDocuments) {
      try {
        // Retrieve actual brand performance data
        const [performance, content, audience, competitive] = await Promise.all([
          searchPerformanceData(brandProfile.id),
          searchContentInsights(brandProfile.id),
          searchAudienceInsights(brandProfile.id),
          searchCompetitiveInsights(brandProfile.id),
        ]);

        // Build formatted context for AI
        ragContext = buildStrategyContext({
          performance,
          content,
          audience,
          competitive,
        });
      } catch (error) {
        console.error("Error retrieving RAG context:", error);
        // Continue without RAG if there's an error
      }
    }

    const prompt = buildStrategyPrompt(brandProfile, ragContext, hasDocuments);

    const strategy = await runStructuredPrompt<AnnualStrategy>(prompt, {
      model: "gpt-5-nano",
      reasoningEffort: "high",
      verbosity: "high",
    });

    return strategy;
  } catch (error) {
    console.error("Error in generateAnnualStrategy:", error);
    throw error;
  }
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
- **Brand Values**: ${Array.isArray(brand.brandValues) ? brand.brandValues.join(", ") : brand.brandValues || "N/A"}
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
   - Each pillar should align with brand values${Array.isArray(brand.brandValues) && brand.brandValues.length > 0 ? ": " + brand.brandValues.join(", ") : ""}
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