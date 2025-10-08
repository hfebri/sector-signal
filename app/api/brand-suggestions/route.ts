import { NextRequest, NextResponse } from "next/server";
import { getBrandSuggestions } from "@/lib/ai/brand-assistant";

export async function POST(request: NextRequest) {
  try {
    const { brandName, industry } = await request.json();

    if (!brandName || !industry) {
      return NextResponse.json(
        { error: "Brand name and industry are required" },
        { status: 400 }
      );
    }

    console.log("Generating suggestions for:", brandName, industry);

    const suggestions = await getBrandSuggestions(brandName, industry);

    console.log("Suggestions generated successfully");

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Brand suggestions error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate brand suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}