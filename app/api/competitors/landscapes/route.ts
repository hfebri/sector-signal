import { NextRequest, NextResponse } from "next/server";
import { getLandscapes, getLandscape } from "@/lib/rivaliq";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landscapeId = searchParams.get("id");

    if (landscapeId) {
      // Get specific landscape
      const landscape = await getLandscape(landscapeId);
      return NextResponse.json({
        success: true,
        landscape,
      });
    } else {
      // Get all landscapes
      const landscapes = await getLandscapes();
      return NextResponse.json({
        success: true,
        landscapes,
      });
    }
  } catch (error) {
    console.error("Landscapes error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch landscapes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}