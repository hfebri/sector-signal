import Replicate from "replicate";

if (!process.env.NEXT_REPLICATE_API_TOKEN) {
  throw new Error("NEXT_REPLICATE_API_TOKEN is not set in environment variables");
}

export const replicate = new Replicate({
  auth: process.env.NEXT_REPLICATE_API_TOKEN,
});

/**
 * Get the appropriate GPT model based on environment
 * Development: gpt-5-nano for faster iteration and lower costs
 * Production: gpt-5 for full capabilities
 */
export function getGPTModel(): string {
  return process.env.NODE_ENV === "production" ? "gpt-5" : "gpt-5-nano";
}

/**
 * Configuration options for Replicate API calls
 */
export interface ReplicateConfig {
  model?: string;
  reasoningEffort?: "low" | "medium" | "high";
  enableWebSearch?: boolean;
  verbosity?: "low" | "medium" | "high";
  temperature?: number;
  maxTokens?: number;
}

/**
 * Run a structured prompt with JSON schema output
 */
export async function runStructuredPrompt<T>(
  prompt: string,
  jsonSchema: object,
  config: ReplicateConfig = {}
): Promise<T> {
  const {
    model = getGPTModel(),
    reasoningEffort = "medium",
    enableWebSearch = true,
    verbosity = "medium",
  } = config;

  const input = {
    model,
    tools: [],
    prompt,
    verbosity,
    image_input: [],
    json_schema: jsonSchema,
    simple_schema: [],
    input_item_list: [],
    reasoning_effort: reasoningEffort,
    enable_web_search: enableWebSearch,
  };

  try {
    const output = await replicate.run("openai/gpt-5-structured", { input });
    return output as T;
  } catch (error) {
    console.error("Replicate API error:", error);
    throw new Error(`Failed to generate AI response: ${error}`);
  }
}