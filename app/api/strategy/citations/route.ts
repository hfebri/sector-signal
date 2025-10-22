import { NextRequest, NextResponse } from "next/server";
import { getCitationsForStrategy } from "@/lib/ai/vector-search";
import { calculateDataQuality } from "@/lib/ai/confidence-scorer";
import { db } from "@/lib/db/supabase";
import { annualStrategies } from "@/lib/db/drizzle-schema";
import { eq, desc } from "drizzle-orm";
import { Citation, DataQuality } from "@/lib/ai/types/citations";

/**
 * GET /api/strategy/citations
 * Fetch citations for a brand's strategy (from cache or regenerate)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // First, try to get citations from the latest strategy in the database
    const [latestStrategy] = await db
      .select()
      .from(annualStrategies)
      .where(eq(annualStrategies.brandId, brandId))
      .orderBy(desc(annualStrategies.createdAt))
      .limit(1);

    // If we have cached citations, return them
    if (latestStrategy && latestStrategy.citations && latestStrategy.dataQuality) {
      console.log(`[Citations] Returning cached citations from strategy ${latestStrategy.id}`);
      return NextResponse.json({
        success: true,
        citations: latestStrategy.citations as Citation[],
        dataQuality: latestStrategy.dataQuality as DataQuality,
        cached: true,
      });
    }

    // Otherwise, regenerate citations
    console.log(`[Citations] No cached citations found, regenerating...`);
    const citations = await getCitationsForStrategy(brandId);
    const dataQuality = calculateDataQuality(citations, brandId);

    return NextResponse.json({
      success: true,
      citations,
      dataQuality,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching citations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch citations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
