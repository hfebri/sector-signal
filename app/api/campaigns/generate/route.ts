import { NextRequest, NextResponse } from "next/server";
import {
  generateTacticalCampaign,
  generateMultipleCampaigns,
} from "@/lib/ai/campaign-generator";
import { getBrandProfile } from "@/lib/db/storage";
import { AnnualStrategy } from "@/lib/ai/strategy-generator";

export async function POST(request: NextRequest) {
  try {
    const { brandId, strategy, count, competitorData } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    if (!strategy) {
      return NextResponse.json(
        { error: "Annual strategy is required" },
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

    const annualStrategy: AnnualStrategy = strategy;

    // Generate single or multiple campaigns
    if (count && count > 1) {
      const campaigns = await generateMultipleCampaigns(
        brandProfile,
        annualStrategy,
        count,
        competitorData
      );

      return NextResponse.json({
        success: true,
        campaigns,
        generatedAt: new Date().toISOString(),
      });
    } else {
      const campaign = await generateTacticalCampaign(
        brandProfile,
        annualStrategy,
        competitorData
      );

      return NextResponse.json({
        success: true,
        campaign,
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Campaign generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate campaign",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}