import { NextRequest, NextResponse } from "next/server";
import { createReportGeneratorAgent, run } from "@/lib/agents";

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { success: false, error: "message is required" },
                { status: 400 }
            );
        }

        const agent = createReportGeneratorAgent();
        const result = await run(agent, message);

        return NextResponse.json({
            success: true,
            response: result.finalOutput ?? '',
        });
    } catch (error) {
        console.error("[Report Generator Agent] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process report generation request",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
