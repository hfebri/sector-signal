import { NextRequest, NextResponse } from "next/server";
import { analyzeCompetitorContent } from "@/lib/rivaliq";

export async function POST(request: NextRequest) {
  try {
    const { companyIds, startDate, endDate } = await request.json();

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json(
        { error: "Company IDs array is required" },
        { status: 400 }
      );
    }

    const analysis = await analyzeCompetitorContent(companyIds, {
      start_date: startDate,
      end_date: endDate,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Content analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze competitor content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}