import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Configuration options for OpenAI API calls
 */
export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  reasoningEffort?: "low" | "medium" | "high";
  verbosity?: "low" | "medium" | "high";
}

/**
 * Run a structured prompt with JSON output using OpenAI
 * Supports both GPT-5-nano (responses API) and GPT-4 (chat completions API)
 */
export async function runStructuredPrompt<T>(
  prompt: string,
  config: OpenAIConfig = {}
): Promise<T> {
  const {
    model = "gpt-5-nano",
    reasoningEffort = "medium",
    verbosity = "medium",
  } = config;

  try {
    // GPT-5-nano uses the new responses API
    if (model === "gpt-5-nano") {
      const response = await openai.responses.create({
        model: "gpt-5-nano",
        input: [
          {
            role: "developer",
            content: [
              {
                type: "input_text",
                text: prompt,
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_object",
          },
          verbosity: verbosity,
        },
        reasoning: {
          effort: reasoningEffort,
        },
        tools: [],
        store: true,
        include: [
          "reasoning.encrypted_content",
          "web_search_call.action.sources",
        ],
      });

      const content = response.output_text;
      if (!content) {
        console.error("Empty response from GPT-5-nano");
        throw new Error("Empty response from GPT-5-nano");
      }

      return JSON.parse(content) as T;
    } else {
      // Fallback to GPT-4 chat completions API
      const completion = await openai.chat.completions.create({
        model,
        temperature: 0.7,
        max_completion_tokens: 4000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior social media strategist. Always respond with valid JSON that matches the requested schema.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      return JSON.parse(content) as T;
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
    throw new Error("Failed to generate AI response");
  }
}
