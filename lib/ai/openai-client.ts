import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

// Use OpenAI API
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Configuration options for OpenAI API calls using GPT-5-nano
 */
export interface OpenAIConfig {
  model?: string;
  temperature?: number;
  reasoningEffort?: "low" | "medium" | "high" | "minimal";
  verbosity?: "low" | "medium" | "high";
  include?: string[];
}

/**
 * Run a structured prompt with JSON output using GPT-5-nano
 */
export async function runStructuredPrompt<T>(
  prompt: string,
  config: OpenAIConfig = {}
): Promise<T> {
  const {
    model = "gpt-5-nano",
    temperature = 0.7,
    reasoningEffort = "medium",
    verbosity = "medium",
  } = config;

  try {
    const response = await openai.responses.create({
      model,
      input: [
        {
          role: "developer",
          content:
            "You are a senior social media strategist. Always respond with valid JSON that matches the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      reasoning: {
        effort: reasoningEffort,
      },
      text: {
        format: {
          type: "json",
        },
        verbosity,
      },
      store: false,
    });

    // Extract text from response
    let outputText = "";
    for (const item of response.output) {
      if (item.type === "message") {
        for (const content of item.content) {
          if (content.type === "output_text") {
            outputText += content.text;
          }
        }
      }
    }

    if (!outputText) {
      throw new Error("Empty response from OpenAI");
    }

    return JSON.parse(outputText) as T;
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Run a text prompt with GPT-5-nano
 */
export async function runTextPrompt(
  prompt: string,
  systemMessage?: string,
  config: OpenAIConfig = {}
): Promise<string> {
  const {
    model = "gpt-5-nano",
    temperature = 0.7,
    reasoningEffort = "medium",
    verbosity = "medium",
  } = config;

  try {
    const messages: Array<{ role: string; content: string }> = [];

    if (systemMessage) {
      messages.push({
        role: "developer",
        content: systemMessage,
      });
    }

    messages.push({
      role: "user",
      content: prompt,
    });

    const response = await openai.responses.create({
      model,
      input: messages,
      reasoning: {
        effort: reasoningEffort,
      },
      text: {
        format: {
          type: "text",
        },
        verbosity,
      },
      store: false,
    });

    // Extract text from response
    let outputText = "";
    for (const item of response.output) {
      if (item.type === "message") {
        for (const content of item.content) {
          if (content.type === "output_text") {
            outputText += content.text;
          }
        }
      }
    }

    if (!outputText) {
      throw new Error("Empty response from OpenAI");
    }

    return outputText;
  } catch (error) {
    console.error("OpenAI API error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
    throw new Error("Failed to generate AI response");
  }
}
