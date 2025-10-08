import { runStructuredPrompt } from "@/lib/replicate";
import { monthlyPlanSchema } from "./schemas";
import { BrandProfile } from "@/lib/db/schema";
import { AnnualStrategy } from "./strategy-generator";

export interface MonthlyPlan {
  month: string;
  theme: string;
  objectives: string[];
  contentCalendar: Array<{
    date: string;
    pillar: string;
    platform: string;
    contentType: string;
    topic: string;
    caption: string;
    hashtags: string[];
    visualBrief: string;
  }>;
  keyDates: Array<{
    date: string;
    event: string;
    opportunity: string;
  }>;
}

/**
 * Generate a monthly content plan based on annual strategy
 */
export async function generateMonthlyPlan(
  brandProfile: BrandProfile,
  annualStrategy: AnnualStrategy,
  month: string,
  year: number,
  postsPerMonth: number = 20
): Promise<MonthlyPlan> {
  const prompt = buildMonthlyPlanPrompt(
    brandProfile,
    annualStrategy,
    month,
    year,
    postsPerMonth
  );

  const plan = await runStructuredPrompt<MonthlyPlan>(
    prompt,
    monthlyPlanSchema,
    {
      reasoningEffort: "high",
      enableWebSearch: true,
      verbosity: "high",
    }
  );

  return plan;
}

function buildMonthlyPlanPrompt(
  brand: BrandProfile,
  strategy: AnnualStrategy,
  month: string,
  year: number,
  postsPerMonth: number
): string {
  const contentPillarsText = strategy.contentPillars
    .map((p) => `- ${p.name}: ${p.description} (${p.frequency})`)
    .join("\n");

  const goalsText = strategy.annualGoals
    .map((g) => `- ${g.goal}: ${g.target} by ${g.timeline}`)
    .join("\n");

  return `
You are a social media content strategist creating a detailed monthly content plan for ${month} ${year}.

# Brand Information
- **Brand Name**: ${brand.brandName}
- **Industry**: ${brand.industry}
- **Target Audience**: ${brand.targetAudience}
- **Brand Values**: ${brand.brandValues.join(", ")}

# Annual Strategy Context
## Content Pillars
${contentPillarsText}

## Annual Goals
${goalsText}

## Brand Voice
${strategy.contentPlaybook.toneAndVoice.join(", ")}

# Your Task
Create a comprehensive monthly content plan for ${month} ${year} with exactly ${postsPerMonth} posts.

1. **Monthly Theme**:
   - Select one of the content pillars to emphasize this month
   - Or create a seasonal theme relevant to ${month}
   - Align with current events or holidays in ${month} ${year}

2. **Monthly Objectives**:
   - Define 3-4 specific objectives for this month
   - Align with annual goals
   - Make them measurable and achievable within the month

3. **Content Calendar** (${postsPerMonth} posts):
   - Distribute posts across the month evenly
   - Balance content pillars: ${strategy.contentPillars.map((p) => p.name).join(", ")}
   - Mix content types: ${strategy.contentPlaybook.contentFormats.join(", ")}
   - Vary platforms: Instagram, Facebook, Twitter/X, LinkedIn, TikTok
   - For each post provide:
     * Specific date (format: YYYY-MM-DD)
     * Content pillar it belongs to
     * Platform to post on
     * Content type (image, video, carousel, reel, story, etc.)
     * Specific topic/concept
     * Complete caption draft (engaging, on-brand, include call-to-action)
     * 5-10 relevant hashtags
     * Visual brief (describe the image/video concept in detail)

4. **Key Dates**:
   - Research important dates, holidays, and events in ${month} ${year}
   - Identify relevant opportunities for ${brand.industry}
   - Show how to leverage these dates for content

Use web search to:
- Find holidays and events in ${month} ${year}
- Research trending topics in ${brand.industry} for this month
- Identify seasonal themes and opportunities
- Check competitor activity patterns

Create a plan that is:
- Strategically aligned with annual goals
- Diverse in content types and platforms
- Engaging and actionable
- Optimized for the target audience: ${brand.targetAudience}
`;
}

/**
 * Generate multiple months at once
 */
export async function generateMultipleMonths(
  brandProfile: BrandProfile,
  annualStrategy: AnnualStrategy,
  months: Array<{ month: string; year: number }>,
  postsPerMonth: number = 20
): Promise<MonthlyPlan[]> {
  const plans = await Promise.all(
    months.map((m) =>
      generateMonthlyPlan(
        brandProfile,
        annualStrategy,
        m.month,
        m.year,
        postsPerMonth
      )
    )
  );

  return plans;
}

/**
 * Generate next 12 months
 */
export async function generateAnnualCalendar(
  brandProfile: BrandProfile,
  annualStrategy: AnnualStrategy,
  postsPerMonth: number = 20
): Promise<MonthlyPlan[]> {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const next12Months = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const year = currentYear + Math.floor((currentMonth + i) / 12);
    next12Months.push({
      month: months[monthIndex],
      year,
    });
  }

  return generateMultipleMonths(
    brandProfile,
    annualStrategy,
    next12Months,
    postsPerMonth
  );
}