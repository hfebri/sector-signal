import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storagePath = searchParams.get("path");

    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: "Storage path is required" },
        { status: 400 }
      );
    }

    // Get signed URL for download
    const { data, error } = await supabase.storage
      .from("brand-documents")
      .createSignedUrl(storagePath, 60); // URL valid for 60 seconds

    if (error) {
      console.error("Error creating signed URL:", error);
      return NextResponse.json(
        { success: false, error: "Failed to generate download link" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
    });
  } catch (error) {
    console.error("Error downloading document:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to download document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
