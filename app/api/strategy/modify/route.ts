import { NextRequest, NextResponse } from "next/server";
import { runStructuredPrompt } from "@/lib/ai/openai-client";

const TAB_SCHEMA_MAP: Record<string, any> = {
  positioning: {
    type: "object",
    properties: {
      statement: { type: "string" },
      differentiators: { type: "array", items: { type: "string" } },
      targetAudienceInsights: { type: "array", items: { type: "string" } },
    },
    required: ["statement", "differentiators", "targetAudienceInsights"],
  },
  swot: {
    type: "object",
    properties: {
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } },
      opportunities: { type: "array", items: { type: "string" } },
      threats: { type: "array", items: { type: "string" } },
    },
    required: ["strengths", "weaknesses", "opportunities", "threats"],
  },
  pillars: {
    type: "array",
    items: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        objectives: { type: "array", items: { type: "string" } },
        contentTypes: { type: "array", items: { type: "string" } },
        frequency: { type: "string" },
      },
    },
  },
  goals: {
    type: "array",
    items: {
      type: "object",
      properties: {
        goal: { type: "string" },
        metric: { type: "string" },
        target: { type: "string" },
        timeline: { type: "string" },
      },
    },
  },
  playbook: {
    type: "object",
    properties: {
      toneAndVoice: { type: "array", items: { type: "string" } },
      messagingFramework: { type: "array", items: { type: "string" } },
      visualGuidelines: { type: "array", items: { type: "string" } },
      contentFormats: { type: "array", items: { type: "string" } },
    },
  },
  kpis: {
    type: "array",
    items: {
      type: "object",
      properties: {
        category: { type: "string" },
        metrics: { type: "array", items: { type: "string" } },
        benchmarks: { type: "string" },
      },
    },
  },
};

const TAB_FIELD_MAP: Record<string, string> = {
  positioning: "brandPositioning",
  swot: "swotAnalysis",
  pillars: "contentPillars",
  goals: "annualGoals",
  playbook: "contentPlaybook",
  kpis: "kpiFramework",
};

export async function POST(request: NextRequest) {
  try {
    const { currentStrategy, tab, modification } = await request.json();

    console.log(`Modifying ${tab} with prompt: ${modification}`);

    if (!currentStrategy || !tab || !modification) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const fieldName = TAB_FIELD_MAP[tab];
    if (!fieldName) {
      return NextResponse.json({ error: "Invalid tab" }, { status: 400 });
    }

    const currentSection = currentStrategy[fieldName];

    // Build prompt for modification
    const prompt = `
You are a senior social media strategist. You need to modify a specific section of an annual strategy based on user feedback.

**Current ${tab} section:**
\`\`\`json
${JSON.stringify(currentSection, null, 2)}
\`\`\`

**User's modification request:**
${modification}

**Instructions:**
1. Keep the overall structure and format
2. Apply the requested changes thoughtfully
3. Maintain consistency with social media strategy best practices
4. Only modify what's necessary based on the request
5. Return ONLY the modified ${tab} section as valid JSON

Return the updated ${tab} section matching this exact structure:
\`\`\`json
${JSON.stringify(TAB_SCHEMA_MAP[tab], null, 2)}
\`\`\`
`;

    const modifiedSection = await runStructuredPrompt(prompt, {
      model: "gpt-5-nano",
      reasoningEffort: "medium",
      verbosity: "medium",
    });

    // Update the strategy with the modified section
    const updatedStrategy = {
      ...currentStrategy,
      [fieldName]: modifiedSection,
    };

    console.log(`Successfully modified ${tab}`);

    return NextResponse.json({
      success: true,
      strategy: updatedStrategy,
      modifiedSection: tab,
    });
  } catch (error) {
    console.error("Strategy modification error:", error);
    return NextResponse.json(
      {
        error: "Failed to modify strategy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
