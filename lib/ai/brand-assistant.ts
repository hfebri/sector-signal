import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.NEXT_REPLICATE_API_TOKEN!,
});

export interface BrandSuggestions {
  competitors: string[];
  targetAudience: string;
  brandGuidelines: {
    voice: string;
    values: string[];
    messaging: string[];
  };
  marketInsights: {
    trends: string[];
    opportunities: string[];
    challenges: string[];
  };
}

/**
 * Get AI-powered brand suggestions based on brand name and industry
 */
export async function getBrandSuggestions(
  brandName: string,
  industry: string
): Promise<BrandSuggestions> {
  const prompt = `You are a brand strategy expert. Analyze the brand "${brandName}" in the ${industry} industry.

Provide comprehensive suggestions for:

1. **Main Competitors**: List 5-7 key competitors in the same market space
2. **Target Audience**: Describe the ideal customer demographic, psychographic, and behavioral profile
3. **Brand Guidelines**:
   - Brand voice characteristics (tone, style, personality)
   - Core brand values (3-5 values)
   - Key messaging pillars (3-5 messages)
4. **Market Insights**:
   - Current industry trends (3-5 trends)
   - Market opportunities (3-5 opportunities)
   - Key challenges (3-5 challenges)

Be specific, actionable, and based on real market knowledge. Format as JSON with this structure:
{
  "competitors": ["competitor1", "competitor2", ...],
  "targetAudience": "detailed description",
  "brandGuidelines": {
    "voice": "voice description",
    "values": ["value1", "value2", ...],
    "messaging": ["message1", "message2", ...]
  },
  "marketInsights": {
    "trends": ["trend1", "trend2", ...],
    "opportunities": ["opp1", "opp2", ...],
    "challenges": ["challenge1", "challenge2", ...]
  }
}`;

  const input = {
    prompt,
    messages: [],
    verbosity: "medium" as const,
    image_input: [],
    reasoning_effort: "medium" as const,
  };

  let fullResponse = "";

  for await (const event of replicate.stream("openai/gpt-5", { input })) {
    fullResponse += event.toString();
  }

  // Parse JSON from response
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/) ||
                      fullResponse.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      return JSON.parse(jsonStr);
    }

    // Try parsing the whole response as JSON
    return JSON.parse(fullResponse);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Failed to generate brand suggestions");
  }
}

/**
 * Generate mock social media performance data
 */
export function generateMockPerformanceData(brandName: string) {
  const platforms = ["Instagram", "Facebook", "Twitter", "LinkedIn", "TikTok"];
  const baseFollowers = Math.floor(Math.random() * 50000) + 10000;

  return {
    platforms: platforms.map((platform) => ({
      platform,
      followers: Math.floor(baseFollowers * (0.8 + Math.random() * 0.4)),
      engagement: {
        likes: Math.floor(Math.random() * 5000) + 500,
        comments: Math.floor(Math.random() * 500) + 50,
        shares: Math.floor(Math.random() * 300) + 30,
        engagementRate: (Math.random() * 3 + 1).toFixed(2) + "%",
      },
      postsPerWeek: Math.floor(Math.random() * 7) + 3,
      bestPostingTime: `${Math.floor(Math.random() * 12) + 9}:00 ${Math.random() > 0.5 ? "AM" : "PM"}`,
    })),
    overall: {
      totalFollowers: baseFollowers * 5,
      avgEngagementRate: (Math.random() * 2.5 + 1.5).toFixed(2) + "%",
      totalPosts: Math.floor(Math.random() * 500) + 200,
      reach: Math.floor(baseFollowers * 8),
      impressions: Math.floor(baseFollowers * 15),
    },
    topPerformingContent: [
      {
        type: "Video",
        engagement: Math.floor(Math.random() * 10000) + 5000,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
      },
      {
        type: "Image Carousel",
        engagement: Math.floor(Math.random() * 8000) + 4000,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
      },
      {
        type: "Story",
        engagement: Math.floor(Math.random() * 6000) + 3000,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
      },
    ],
  };
}