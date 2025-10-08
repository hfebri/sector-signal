import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.NEXT_REPLICATE_API_TOKEN,
});

// Note: File parsing has been removed. For document processing, use the RAG system instead.
// This test endpoint now only supports text prompts without file uploads.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const prompt = formData.get("prompt") as string;
    const model = formData.get("model") as string || "gpt-5-nano";
    const verbosity = formData.get("verbosity") as string || "medium";
    const reasoningEffort = formData.get("reasoningEffort") as string || "low";
    const enableWebSearch = formData.get("enableWebSearch") === "true";

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build the input object
    const input = {
      model,
      tools: [],
      prompt,
      verbosity,
      image_input: [],
      json_schema: {},
      simple_schema: [],
      input_item_list: [],
      reasoning_effort: reasoningEffort,
      enable_web_search: enableWebSearch,
    };

    console.log("Running GPT-5 with config:", {
      model,
      verbosity,
      reasoningEffort,
      enableWebSearch,
      promptLength: prompt.length,
    });

    const output = await replicate.run("openai/gpt-5-structured", { input });

    return NextResponse.json({
      success: true,
      output,
      config: {
        model,
        verbosity,
        reasoningEffort,
        enableWebSearch,
        promptLength: prompt.length,
      },
    });
  } catch (error) {
    console.error("GPT-5 test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run GPT-5",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
