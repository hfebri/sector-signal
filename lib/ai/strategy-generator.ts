import { runStructuredPrompt } from "@/lib/replicate";
import { annualStrategySchema } from "./schemas";
import { BrandProfile } from "@/lib/db/schema";

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
 * Generate a comprehensive annual social media strategy
 */
export async function generateAnnualStrategy(
  brandProfile: BrandProfile
): Promise<AnnualStrategy> {
  const prompt = buildStrategyPrompt(brandProfile);

  const strategy = await runStructuredPrompt<AnnualStrategy>(
    prompt,
    annualStrategySchema,
    {
      reasoningEffort: "high",
      enableWebSearch: true,
      verbosity: "high",
    }
  );

  return strategy;
}

function buildStrategyPrompt(brand: BrandProfile): string {
  return `
You are a senior social media strategist tasked with creating a comprehensive annual social media strategy.

# Brand Information
- **Brand Name**: ${brand.brandName}
- **Industry**: ${brand.industry}
- **Description**: ${brand.description}
- **Target Audience**: ${brand.targetAudience}
- **Brand Values**: ${brand.brandValues.join(", ")}
- **Goals**: ${brand.goals.join(", ")}
- **Competitors**: ${brand.competitors.join(", ")}

# Your Task
Create a comprehensive annual social media strategy that includes:

1. **SWOT Analysis**: Analyze the brand's competitive position
   - Research current market trends in ${brand.industry}
   - Analyze competitor positioning: ${brand.competitors.join(", ")}
   - Identify unique opportunities based on brand values and target audience

2. **Brand Positioning**: Define clear differentiation
   - Create a compelling positioning statement
   - Identify 3-5 key differentiators from competitors
   - Provide insights about the target audience: ${brand.targetAudience}

3. **Content Pillars**: Develop 3-5 main content themes
   - Each pillar should align with brand values: ${brand.brandValues.join(", ")}
   - Include specific content types and posting frequency
   - Connect pillars to business goals: ${brand.goals.join(", ")}

4. **Annual Goals**: Set measurable objectives
   - Align with brand goals: ${brand.goals.join(", ")}
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

Use web search to gather:
- Current social media trends in ${brand.industry}
- Competitor analysis for ${brand.competitors.join(", ")}
- Industry benchmarks and KPIs
- Target audience behavior patterns for ${brand.targetAudience}

Create a strategy that is actionable, data-driven, and aligned with the brand's goals.
`;
}