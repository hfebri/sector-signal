import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { brands } from "@/lib/db/drizzle-schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      // Get single brand
      const brand = await db.select().from(brands).where(eq(brands.id, id));

      if (brand.length === 0) {
        return NextResponse.json(
          { success: false, error: "Brand not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        brand: brand[0],
      });
    } else {
      // Get all brands
      const allBrands = await db.select().from(brands);

      return NextResponse.json({
        success: true,
        brands: allBrands,
      });
    }
  } catch (error) {
    console.error("Error fetching brands:", error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newBrand = await db
      .insert(brands)
      .values({
        brandName: body.brandName,
        industry: body.industry,
        description: body.description || "",
        targetAudience: body.targetAudience || "",
        brandVoice: body.brandVoice || "",
        competitors: body.competitors || [],
        brandValues: body.brandValues || [],
        goals: body.goals || "",
      })
      .returning();

    return NextResponse.json({
      success: true,
      brand: newBrand[0],
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create brand",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Brand ID is required" },
        { status: 400 }
      );
    }

    const updatedBrand = await db
      .update(brands)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, id))
      .returning();

    if (updatedBrand.length === 0) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      brand: updatedBrand[0],
    });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update brand",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Brand ID is required" },
        { status: 400 }
      );
    }

    await db.delete(brands).where(eq(brands.id, id));

    return NextResponse.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete brand",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
