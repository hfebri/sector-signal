import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { messages, conversations } from "@/lib/db/drizzle-schema";
import { eq } from "drizzle-orm";

// GET endpoint to fetch messages for a conversation
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: "conversationId is required" },
                { status: 400 }
            );
        }

        // Verify conversation exists
        const conversationList = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, conversationId))
            .limit(1);

        if (conversationList.length === 0) {
            return NextResponse.json(
                { success: false, error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Get messages
        const messageList = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(messages.createdAt);

        return NextResponse.json({
            success: true,
            conversation: conversationList[0],
            messages: messageList,
        });
    } catch (error) {
        console.error("[Chatbot Messages API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch messages",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
