import { NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { sql } from "drizzle-orm";

export async function POST() {
    try {
        console.log("Applying chatbot migration...");

        // Create conversations table
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "brand_id" uuid NOT NULL REFERENCES "public"."brands"("id") ON DELETE cascade,
        "title" text DEFAULT 'New Chat' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);
        console.log("✓ Created conversations table");

        // Create messages table
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "conversation_id" uuid NOT NULL REFERENCES "public"."conversations"("id") ON DELETE cascade,
        "role" text NOT NULL,
        "content" text NOT NULL,
        "citations" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
        console.log("✓ Created messages table");

        // Create indexes
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_conversations_brand_id" ON "conversations"("brand_id");
    `);
        console.log("✓ Created index on conversations.brand_id");

        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages"("conversation_id");
    `);
        console.log("✓ Created index on messages.conversation_id");

        console.log("✓ Migration completed successfully!");

        return NextResponse.json({ success: true, message: "Migration applied successfully" });
    } catch (error) {
        console.error("Migration failed:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Migration failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
