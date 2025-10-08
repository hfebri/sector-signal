import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { annualStrategies } from "@/lib/db/drizzle-schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    // Get the most recent strategy for this brand
    const strategies = await db
      .select()
      .from(annualStrategies)
      .where(eq(annualStrategies.brandId, brandId))
      .orderBy(desc(annualStrategies.createdAt))
      .limit(1);

    if (strategies.length === 0) {
      return NextResponse.json({ strategy: null });
    }

    return NextResponse.json({
      success: true,
      strategy: strategies[0],
    });
  } catch (error) {
    console.error("Error fetching latest strategy:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch strategy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
