/**
 * JSON schemas for structured AI outputs
 */

export const annualStrategySchema = {
  type: "object",
  properties: {
    swotAnalysis: {
      type: "object",
      properties: {
        strengths: {
          type: "array",
          items: { type: "string" },
          description: "Brand strengths based on profile and market analysis"
        },
        weaknesses: {
          type: "array",
          items: { type: "string" },
          description: "Areas for improvement"
        },
        opportunities: {
          type: "array",
          items: { type: "string" },
          description: "Market opportunities to capitalize on"
        },
        threats: {
          type: "array",
          items: { type: "string" },
          description: "Competitive and market threats"
        }
      },
      required: ["strengths", "weaknesses", "opportunities", "threats"]
    },
    brandPositioning: {
      type: "object",
      properties: {
        statement: { type: "string", description: "Clear brand positioning statement" },
        differentiators: {
          type: "array",
          items: { type: "string" },
          description: "Key differentiators from competitors"
        },
        targetAudienceInsights: {
          type: "array",
          items: { type: "string" },
          description: "Key insights about target audience"
        }
      },
      required: ["statement", "differentiators", "targetAudienceInsights"]
    },
    contentPillars: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Pillar name" },
          description: { type: "string", description: "What this pillar covers" },
          objectives: {
            type: "array",
            items: { type: "string" },
            description: "Goals for this pillar"
          },
          contentTypes: {
            type: "array",
            items: { type: "string" },
            description: "Recommended content formats"
          },
          frequency: { type: "string", description: "How often to post from this pillar" }
        },
        required: ["name", "description", "objectives", "contentTypes", "frequency"]
      },
      minItems: 3,
      maxItems: 5,
      description: "3-5 main content themes"
    },
    annualGoals: {
      type: "array",
      items: {
        type: "object",
        properties: {
          goal: { type: "string", description: "Specific goal" },
          metric: { type: "string", description: "How to measure success" },
          target: { type: "string", description: "Target value" },
          timeline: { type: "string", description: "When to achieve by" }
        },
        required: ["goal", "metric", "target", "timeline"]
      },
      description: "Annual strategic goals"
    },
    contentPlaybook: {
      type: "object",
      properties: {
        toneAndVoice: {
          type: "array",
          items: { type: "string" },
          description: "Brand voice characteristics"
        },
        messagingFramework: {
          type: "array",
          items: { type: "string" },
          description: "Key messages to communicate"
        },
        visualGuidelines: {
          type: "array",
          items: { type: "string" },
          description: "Visual style recommendations"
        },
        contentFormats: {
          type: "array",
          items: { type: "string" },
          description: "Recommended content formats"
        }
      },
      required: ["toneAndVoice", "messagingFramework", "visualGuidelines", "contentFormats"]
    },
    kpiFramework: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string", description: "KPI category" },
          metrics: {
            type: "array",
            items: { type: "string" },
            description: "Specific metrics to track"
          },
          benchmarks: { type: "string", description: "Industry benchmarks" }
        },
        required: ["category", "metrics", "benchmarks"]
      },
      description: "KPI tracking framework"
    }
  },
  required: [
    "swotAnalysis",
    "brandPositioning",
    "contentPillars",
    "annualGoals",
    "contentPlaybook",
    "kpiFramework"
  ]
};

export const monthlyPlanSchema = {
  type: "object",
  properties: {
    month: { type: "string", description: "Month and year" },
    theme: { type: "string", description: "Monthly theme based on annual strategy" },
    objectives: {
      type: "array",
      items: { type: "string" },
      description: "Month-specific objectives"
    },
    contentCalendar: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string", description: "Post date" },
          pillar: { type: "string", description: "Content pillar" },
          platform: { type: "string", description: "Social platform" },
          contentType: { type: "string", description: "Format (image, video, carousel, etc.)" },
          topic: { type: "string", description: "Post topic" },
          caption: { type: "string", description: "Suggested caption" },
          hashtags: {
            type: "array",
            items: { type: "string" },
            description: "Recommended hashtags"
          },
          visualBrief: { type: "string", description: "Visual content description" }
        },
        required: ["date", "pillar", "platform", "contentType", "topic", "caption", "hashtags", "visualBrief"]
      },
      description: "Detailed content calendar entries"
    },
    keyDates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          event: { type: "string" },
          opportunity: { type: "string" }
        },
        required: ["date", "event", "opportunity"]
      },
      description: "Important dates and opportunities"
    }
  },
  required: ["month", "theme", "objectives", "contentCalendar", "keyDates"]
};

export const tacticalCampaignSchema = {
  type: "object",
  properties: {
    opportunity: {
      type: "object",
      properties: {
        type: { type: "string", description: "Opportunity type (trend, event, competitor gap, etc.)" },
        description: { type: "string", description: "What the opportunity is" },
        urgency: { type: "string", enum: ["low", "medium", "high"], description: "How urgent" },
        relevanceScore: { type: "number", description: "0-10 relevance to brand" }
      },
      required: ["type", "description", "urgency", "relevanceScore"]
    },
    campaignConcept: {
      type: "object",
      properties: {
        name: { type: "string", description: "Campaign name" },
        objective: { type: "string", description: "Campaign goal" },
        strategy: { type: "string", description: "How to execute" },
        targetAudience: { type: "string", description: "Who to target" }
      },
      required: ["name", "objective", "strategy", "targetAudience"]
    },
    contentAssets: {
      type: "array",
      items: {
        type: "object",
        properties: {
          platform: { type: "string" },
          contentType: { type: "string" },
          concept: { type: "string" },
          callToAction: { type: "string" }
        },
        required: ["platform", "contentType", "concept", "callToAction"]
      },
      description: "Recommended content pieces"
    },
    timeline: {
      type: "object",
      properties: {
        start: { type: "string", description: "Start date" },
        end: { type: "string", description: "End date" },
        phases: {
          type: "array",
          items: {
            type: "object",
            properties: {
              phase: { type: "string" },
              actions: { type: "array", items: { type: "string" } }
            },
            required: ["phase", "actions"]
          }
        }
      },
      required: ["start", "end", "phases"]
    },
    expectedOutcomes: {
      type: "array",
      items: { type: "string" },
      description: "Predicted results"
    }
  },
  required: ["opportunity", "campaignConcept", "contentAssets", "timeline", "expectedOutcomes"]
};