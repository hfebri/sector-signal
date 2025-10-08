/**
 * Import local reports from public/reports into the database
 * Usage: npx tsx scripts/import-local-reports.ts <brandId>
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { readdir, readFile } from "fs/promises";
import path from "path";
import { db } from "../lib/db/supabase";
import { supabase } from "../lib/db/supabase";
import { brandDocuments } from "../lib/db/drizzle-schema";
import { processDocument } from "../lib/ai/document-processor";

const REPORTS_DIR = path.join(process.cwd(), "public", "reports");

async function importLocalReports(brandId: string) {
  console.log("🚀 Starting local reports import...\n");
  console.log("Brand ID:", brandId);
  console.log("Reports directory:", REPORTS_DIR);
  console.log("");

  // Read all files from public/reports
  const files = await readdir(REPORTS_DIR);
  console.log(`📁 Found ${files.length} files\n`);

  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const fileName of files) {
    try {
      // Skip non-data files
      if (fileName.startsWith(".")) {
        skipped++;
        continue;
      }

      const fileExt = path.extname(fileName).toLowerCase().substring(1);
      if (!["csv", "xlsx", "xls"].includes(fileExt)) {
        console.log(`⏭️  Skipping ${fileName} (unsupported type)`);
        skipped++;
        continue;
      }

      console.log(`📄 Processing: ${fileName}`);

      // Determine category and metadata from filename
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
        console.log(`   ❌ Upload failed: ${uploadError.message}`);
        failed++;
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

      console.log(`   ✅ Uploaded to storage`);
      console.log(`   📋 Category: ${category}, Platform: ${platform || "N/A"}, Period: ${period || "N/A"}`);

      // Process document immediately
      console.log(`   ⚙️  Processing document...`);
      const result = await processDocument(document.id);

      if (result.success) {
        console.log(`   ✅ Processed: ${result.chunkCount} chunks created\n`);
        imported++;
      } else {
        console.log(`   ❌ Processing failed: ${result.error}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : "Unknown error"}\n`);
      failed++;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Import Summary");
  console.log("=".repeat(60));
  console.log(`✅ Successfully imported: ${imported}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Total files: ${files.length}`);
  console.log("=".repeat(60));
}

function detectCategory(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes("facebook") || lower.includes("fb")) return "facebook";
  if (lower.includes("instagram") || lower.includes("ig")) return "instagram";
  if (lower.includes("twitter") || lower.includes("tw") || lower.includes("tweet")) return "twitter";
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("rivaliq")) return "rivaliq";
  return "general";
}

function detectPlatform(fileName: string): string | undefined {
  const lower = fileName.toLowerCase();
  if (lower.includes("facebook") || lower.includes("fb")) return "facebook";
  if (lower.includes("instagram") || lower.includes("ig")) return "instagram";
  if (lower.includes("twitter") || lower.includes("tw") || lower.includes("tweet")) return "twitter";
  if (lower.includes("tiktok")) return "tiktok";
  return undefined;
}

function detectPeriod(fileName: string): string | undefined {
  // Match patterns like "April 2023", "2023-04", "20230401"
  const monthYearMatch = fileName.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s*(\d{4})/i);
  if (monthYearMatch) {
    return `${monthYearMatch[1]} ${monthYearMatch[2]}`;
  }

  const dateMatch = fileName.match(/(\d{4})(\d{2})(\d{2})/);
  if (dateMatch) {
    const year = dateMatch[1];
    const month = dateMatch[2];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

// Main execution
const brandId = process.argv[2];

if (!brandId) {
  console.error("❌ Error: Brand ID is required");
  console.error("Usage: npx tsx scripts/import-local-reports.ts <brandId>");
  process.exit(1);
}

importLocalReports(brandId)
  .then(() => {
    console.log("\n✨ Import complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Import failed:", error);
    process.exit(1);
  });
