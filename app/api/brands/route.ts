import { NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { brands as brandsTable } from "@/lib/db/drizzle-schema";

const RIVALIQ_BASE_URL = "https://api.rivaliq.com/v3";

export async function GET() {
  try {
    console.log("=== Brands API Route ===");

    // Fetch brands from Supabase
    let supabaseBrands: any[] = [];
    try {
      supabaseBrands = await db.select().from(brandsTable);
      console.log("Supabase brands:", supabaseBrands.length);
    } catch (error) {
      console.error("Error fetching from Supabase:", error);
    }

    // Fetch brands from RivalIQ
    let rivaliqBrands: any[] = [];
    const apiKey = process.env.NEXT_RIVALIQ_API_KEY;

    if (apiKey) {
      try {
        const url = `${RIVALIQ_BASE_URL}/landscapes/?apiKey=${apiKey}`;
        console.log("Fetching from RivalIQ...");

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          console.log("RivalIQ landscapes:", data.landscapes?.length || 0);

          // Convert landscapes to brand format
          rivaliqBrands = (data.landscapes || []).map((landscape: any) => ({
            id: `rivaliq-${landscape.id}`,
            brandName: landscape.name,
            industry: "Unknown",
            description: "",
            targetAudience: "",
            brandVoice: "",
            competitors: [],
            brandValues: [],
            goals: "",
            rivaliqLandscapeId: landscape.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }));
        } else {
          console.log("RivalIQ API error:", response.status);
        }
      } catch (error) {
        console.error("Error fetching from RivalIQ:", error);
      }
    } else {
      console.log("RivalIQ API key not configured");
    }

    // Merge both sources
    const allBrands = [...supabaseBrands, ...rivaliqBrands];
    console.log("Total brands:", allBrands.length);
    console.log("======================");

    return NextResponse.json({
      success: true,
      brands: allBrands,
    });
  } catch (error) {
    console.error("=== Brands API ERROR ===");
    console.error("Error:", error);
    console.error("=======================");
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch brands",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
