import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyPlan, generateAnnualCalendar } from "@/lib/ai/monthly-planner";
import { getBrandProfile } from "@/lib/db/storage";
import { AnnualStrategy } from "@/lib/ai/strategy-generator";

export async function POST(request: NextRequest) {
  try {
    const { brandId, strategy, month, year, postsPerMonth, generateFullYear } =
      await request.json();

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

    // Generate full year or single month
    if (generateFullYear) {
      const plans = await generateAnnualCalendar(
        brandProfile,
        annualStrategy,
        postsPerMonth || 20
      );

      return NextResponse.json({
        success: true,
        plans,
        generatedAt: new Date().toISOString(),
      });
    } else {
      if (!month || !year) {
        return NextResponse.json(
          { error: "Month and year are required for single month generation" },
          { status: 400 }
        );
      }

      const plan = await generateMonthlyPlan(
        brandProfile,
        annualStrategy,
        month,
        year,
        postsPerMonth || 20
      );

      return NextResponse.json({
        success: true,
        plan,
        generatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Monthly plan generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate monthly plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}