import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

// Use OpenAI API
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
 */
export async function runStructuredPrompt<T>(
  prompt: string,
  config: OpenAIConfig = {}
): Promise<T> {
  const {
    model = "gpt-4o",
    temperature = 0.7,
  } = config;

  try {
    const completion = await openai.chat.completions.create({
      model,
      temperature,
      max_tokens: 4000,
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
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
    throw new Error("Failed to generate AI response");
  }
}
