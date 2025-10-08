import { NextRequest, NextResponse } from "next/server";
import { getCompetitiveAnalysis } from "@/lib/rivaliq";

export async function POST(request: NextRequest) {
  try {
    const { landscapeId, startDate, endDate } = await request.json();

    if (!landscapeId) {
      return NextResponse.json(
        { error: "Landscape ID is required" },
        { status: 400 }
      );
    }

    const analysis = await getCompetitiveAnalysis(landscapeId, {
      start_date: startDate,
      end_date: endDate,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Competitive analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch competitive analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landscapeId = searchParams.get("landscapeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!landscapeId) {
      return NextResponse.json(
        { error: "Landscape ID is required" },
        { status: 400 }
      );
    }

    const analysis = await getCompetitiveAnalysis(landscapeId, {
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Competitive analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch competitive analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}