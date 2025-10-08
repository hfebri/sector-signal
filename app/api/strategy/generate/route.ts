import { NextRequest, NextResponse } from "next/server";
import { generateAnnualStrategy } from "@/lib/ai/strategy-generator";
import { getBrandProfile } from "@/lib/db/storage";

export async function POST(request: NextRequest) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    // Get brand profile
    const brandProfile = await getBrandProfile(brandId);
    if (!brandProfile) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Generate strategy using AI
    const strategy = await generateAnnualStrategy(brandProfile);

    return NextResponse.json({
      success: true,
      strategy,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Strategy generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate strategy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}