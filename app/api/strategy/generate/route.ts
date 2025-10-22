import { NextRequest, NextResponse } from "next/server";
import { generateAnnualStrategyWithCitations } from "@/lib/ai/strategy-generator";
import { db } from "@/lib/db/supabase";
import { brands, annualStrategies, brandDocuments } from "@/lib/db/drizzle-schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { brandId } = await request.json();
    console.log("Generating strategy for brand:", brandId);

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    // Get brand profile from database
    console.log("Fetching brand profile from database...");
    const brandResults = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId))
      .limit(1);

    if (brandResults.length === 0) {
      console.error("Brand not found:", brandId);
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    const brandProfile = brandResults[0];
    console.log("Brand profile loaded:", brandProfile.brandName);

    // Check how many documents were used
    const documentsUsed = await db
      .select()
      .from(brandDocuments)
      .where(
        and(
          eq(brandDocuments.brandId, brandId),
          eq(brandDocuments.processingStatus, "completed")
        )
      );

    const documentCount = documentsUsed.length;
    const generatedWithRag = documentCount > 0 ? 1 : 0;

    console.log(`Strategy will use ${documentCount} documents (RAG: ${generatedWithRag ? 'Yes' : 'No'})`);

    // Generate strategy using AI with citations
    console.log("Starting AI strategy generation with citation tracking...");
    const result = await generateAnnualStrategyWithCitations(brandProfile);
    console.log("Strategy generated successfully");
    console.log(`Citations tracked: ${result.citations.overall.length}`);
    console.log(`Data quality - Confidence: ${result.dataQuality.confidenceLevel}, Coverage: ${result.dataQuality.coverageScore}%`);

    // Calculate time period: current year to next year
    const now = new Date();
    const currentYear = now.getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year
    const endDate = new Date(currentYear + 1, 11, 31, 23, 59, 59); // December 31st of next year

    // Save strategy to database with citations and data quality
    const [savedStrategy] = await db
      .insert(annualStrategies)
      .values({
        brandId,
        strategyData: result.strategy,
        citations: result.citations.overall, // Save citations
        dataQuality: result.dataQuality, // Save data quality metrics
        startDate,
        endDate,
        generatedWithRag,
        documentCount,
      })
      .returning();

    console.log(`Strategy saved with ID: ${savedStrategy.id}`);
    console.log(`Period: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    return NextResponse.json({
      success: true,
      strategy: result.strategy,
      citations: result.citations,
      dataQuality: result.dataQuality,
      strategyId: savedStrategy.id,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        label: `${currentYear} - ${currentYear + 1}`,
      },
      generatedWithRag,
      documentCount,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("=== STRATEGY GENERATION ERROR ===");
    console.error("Error object:", error);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("================================");

    return NextResponse.json(
      {
        error: "Failed to generate strategy",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}