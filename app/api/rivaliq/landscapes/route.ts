import { NextRequest, NextResponse } from "next/server";
import { getLandscapes, getLandscape, getCompanies } from "@/lib/rivaliq";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landscapeId = searchParams.get("id");

    if (landscapeId) {
      // Get specific landscape with companies
      const landscape = await getLandscape(landscapeId);
      const companies = await getCompanies(landscapeId);

      return NextResponse.json({
        success: true,
        landscape: {
          ...landscape,
          companies,
        },
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
    console.error("RivalIQ landscapes error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch RivalIQ landscapes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}