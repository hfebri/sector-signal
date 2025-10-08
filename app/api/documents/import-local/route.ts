import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db/supabase";
import { supabase } from "@/lib/db/supabase";
import { brandDocuments } from "@/lib/db/drizzle-schema";
import { processDocument } from "@/lib/ai/document-processor";

const REPORTS_DIR = path.join(process.cwd(), "public", "reports");

export async function POST(request: NextRequest) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 }
      );
    }

    console.log("Starting import for brand:", brandId);

    // Read all files
    const files = await readdir(REPORTS_DIR);
    console.log(`Found ${files.length} files`);

    const results = [];

    for (const fileName of files) {
      try {
        if (fileName.startsWith(".")) continue;

        const fileExt = path.extname(fileName).toLowerCase().substring(1);
        if (!["csv", "xlsx", "xls"].includes(fileExt)) {
          results.push({ fileName, status: "skipped", reason: "unsupported type" });
          continue;
        }

        console.log(`Processing: ${fileName}`);

        const category = detectCategory(fileName);
        const platform = detectPlatform(fileName);
        const period = detectPeriod(fileName);

        // Read file
        const filePath = path.join(REPORTS_DIR, fileName);
        const fileBuffer = await readFile(filePath);
        const fileSize = fileBuffer.length;

        // Upload to Supabase Storage
        const storagePath = `${brandId}/${category}/${Date.now()}_${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("brand-documents")
          .upload(storagePath, fileBuffer, {
            contentType: getContentType(fileExt),
            upsert: false,
          });

        if (uploadError) {
          results.push({ fileName, status: "failed", error: uploadError.message });
          continue;
        }

        // Create database record
        const metadata: Record<string, string> = {};
        if (platform) metadata.platform = platform;
        if (period) metadata.period = period;

        const [document] = await db
          .insert(brandDocuments)
          .values({
            brandId,
            fileName,
            fileType: fileExt,
            fileSize,
            storagePath,
            category,
            metadata,
            processingStatus: "pending",
          })
          .returning();

        // Process document
        const result = await processDocument(document.id);

        results.push({
          fileName,
          status: result.success ? "success" : "failed",
          chunkCount: result.chunkCount,
          error: result.error,
          category,
          platform,
          period,
        });
      } catch (error) {
        results.push({
          fileName,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary = {
      total: files.length,
      success: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: results.filter((r) => r.status === "skipped").length,
    };

    console.log("Import summary:", summary);

    return NextResponse.json({
      success: true,
      summary,
      results,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 }
    );
  }
}

function detectCategory(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("facebook") || lower.includes("fb")) return "facebook";
  if (lower.includes("instagram") || lower.includes("ig")) return "instagram";
  if (lower.includes("twitter") || lower.includes("tw") || lower.includes("tweet"))
    return "twitter";
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("rivaliq")) return "rivaliq";
  return "general";
}

function detectPlatform(fileName: string): string | undefined {
  const lower = fileName.toLowerCase();
  if (lower.includes("facebook") || lower.includes("fb")) return "facebook";
  if (lower.includes("instagram") || lower.includes("ig")) return "instagram";
  if (lower.includes("twitter") || lower.includes("tw") || lower.includes("tweet"))
    return "twitter";
  if (lower.includes("tiktok")) return "tiktok";
  return undefined;
}

function detectPeriod(fileName: string): string | undefined {
  const monthYearMatch = fileName.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})/i
  );
  if (monthYearMatch) {
    return `${monthYearMatch[1]} ${monthYearMatch[2]}`;
  }

  const dateMatch = fileName.match(/(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    const year = dateMatch[1];
    const month = dateMatch[2];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  return undefined;
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
  };
  return types[ext] || "application/octet-stream";
}
