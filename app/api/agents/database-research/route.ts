import { NextRequest, NextResponse } from "next/server";
import { createDatabaseResearchAgent } from "@/lib/agents";
import { run } from "@openai/agents";

/**
 * POST /api/agents/database-research
 *
 * Run a research query using the Database Research Agent.
 *
 * Request body:
 * - query: string - The research question or task
 * - stream: boolean (optional) - Enable streaming response (default: false)
 * - context: object (optional) - Additional context for the agent
 *
 * Response:
 * - Non-streaming: { success: boolean, output: string, toolCalls: array }
 * - Streaming: Server-Sent Events with content chunks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, stream = false, context } = body;

    // Validate inputs
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, error: "query is required and must be a string" },
        { status: 400 }
      );
    }

    // Create the agent
    const agent = createDatabaseResearchAgent();

    // Handle streaming response
    if (stream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // Run agent and get streaming result
            const result = await run(agent, query, { context });

            // Stream the output
            const finalOutput = result.finalOutput || "";

            // Send content in chunks for better UX
            const chunkSize = 50;
            for (let i = 0; i < finalOutput.length; i += chunkSize) {
              const chunk = finalOutput.slice(i, i + chunkSize);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`
                )
              );
              // Small delay for streaming effect
              await new Promise((resolve) => setTimeout(resolve, 10));
            }

            // Send completion
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "done",
                  output: finalOutput,
                })}\n\n`
              )
            );

            controller.close();
          } catch (error) {
            console.error("[Database Research Agent] Stream error:", error);
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  error: error instanceof Error ? error.message : "Unknown error",
                })}\n\n`
              )
            );
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Non-streaming response
    const result = await run(agent, query, { context });

    return NextResponse.json({
      success: true,
      output: result.finalOutput,
      agent: agent.name,
    });
  } catch (error) {
    console.error("[Database Research Agent] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process research query",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/database-research
 *
 * Get information about the Database Research Agent and its available tools.
 */
export async function GET() {
  const tools = [
    {
      name: "list_brands",
      description: "List all brands in the database",
      parameters: ["limit (optional)", "industry (optional)"],
    },
    {
      name: "get_brand",
      description: "Get detailed information about a specific brand",
      parameters: ["brandId (required)"],
    },
    {
      name: "list_documents",
      description: "List all documents uploaded for a brand",
      parameters: ["brandId (required)", "category (optional)", "status (optional)"],
    },
    {
      name: "get_document",
      description: "Get detailed information about a specific document",
      parameters: ["documentId (required)"],
    },
    {
      name: "search_documents",
      description: "Semantic search across all document chunks using AI embeddings",
      parameters: ["brandId (required)", "query (required)", "limit (optional)", "platform (optional)", "category (optional)"],
    },
    {
      name: "search_performance",
      description: "Search for performance metrics, engagement data, and analytics",
      parameters: ["brandId (required)", "platform (optional)"],
    },
    {
      name: "search_competitive",
      description: "Search for competitive analysis and market insights",
      parameters: ["brandId (required)"],
    },
    {
      name: "list_strategies",
      description: "List all generated strategies for a brand",
      parameters: ["brandId (required)", "limit (optional)"],
    },
    {
      name: "get_strategy",
      description: "Get the full details of a specific strategy",
      parameters: ["strategyId (required)"],
    },
    {
      name: "execute_sql",
      description: "Execute a raw SQL query (SELECT only)",
      parameters: ["query (required)"],
    },
    {
      name: "get_schema",
      description: "Get information about the database schema",
      parameters: [],
    },
  ];

  return NextResponse.json({
    success: true,
    agent: {
      name: "Database Research Agent",
      model: "gpt-5-nano",
      description:
        "An AI agent that can query internal documentation stored in the database using semantic search and structured queries.",
      capabilities: [
        "List and search brands",
        "Browse documents by category or platform",
        "Semantic search across document content",
        "Retrieve performance metrics and competitive insights",
        "Access generated strategies",
        "Execute custom SQL queries (read-only)",
      ],
      tools,
    },
    usage: {
      endpoint: "/api/agents/database-research",
      method: "POST",
      body: {
        query: "string (required) - The research question or task",
        stream: "boolean (optional) - Enable streaming response",
        context: "object (optional) - Additional context for the agent",
      },
      examples: [
        {
          query: "List all brands in the database",
        },
        {
          query: "Search for Instagram performance data for brand ID xxx-xxx-xxx",
        },
        {
          query: "What competitive insights do we have for Acme Corp?",
        },
      ],
    },
  });
}
