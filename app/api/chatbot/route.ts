import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/supabase";
import { conversations, messages, brands as brandsTable } from "@/lib/db/drizzle-schema";
import { generateStreamingChatResponse, generateConversationTitle } from "@/lib/ai/chatbot";
import { eq, desc } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { brandId, message, conversationId } = await request.json();

        // Validate inputs
        if (!brandId || !message) {
            return NextResponse.json(
                { success: false, error: "brandId and message are required" },
                { status: 400 }
            );
        }

        // Validate brand exists
        const brandList = await db.select().from(brandsTable).where(eq(brandsTable.id, brandId)).limit(1);
        if (brandList.length === 0) {
            return NextResponse.json(
                { success: false, error: "Brand not found" },
                { status: 404 }
            );
        }

        // Get conversation history if conversationId provided
        let history: Array<{ role: "user" | "assistant"; content: string }> = [];
        let currentConversationId = conversationId;

        if (conversationId) {
            const existingMessages = await db
                .select()
                .from(messages)
                .where(eq(messages.conversationId, conversationId))
                .orderBy(messages.createdAt);

            history = existingMessages.map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            }));
        } else {
            // Create new conversation
            const newConversations = await db
                .insert(conversations)
                .values({
                    brandId,
                    title: "New Chat",
                })
                .returning();

            currentConversationId = newConversations[0].id;
        }

        // Save user message
        await db.insert(messages).values({
            conversationId: currentConversationId,
            role: "user",
            content: message,
            citations: null,
        });

        // Create streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    let fullContent = "";
                    let finalCitations: any[] = [];

                    // Stream the response
                    for await (const chunk of generateStreamingChatResponse(brandId, message, history)) {
                        if (chunk.content) {
                            fullContent += chunk.content;
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
                        }

                        if (chunk.citations) {
                            finalCitations = chunk.citations;
                        }

                        if (chunk.done) {
                            // Send citations and done signal
                            controller.enqueue(
                                encoder.encode(
                                    `data: ${JSON.stringify({
                                        citations: finalCitations,
                                        conversationId: currentConversationId,
                                        done: true,
                                    })}\n\n`
                                )
                            );

                            // Save assistant message
                            await db
                                .insert(messages)
                                .values({
                                    conversationId: currentConversationId as string,
                                    role: "assistant",
                                    content: fullContent,
                                    citations: finalCitations,
                                })
                                .catch((err) => console.error("Error saving message:", err));

                            // Generate and update conversation title if it's the first message
                            if (!conversationId) {
                                try {
                                    const title = await generateConversationTitle(message);
                                    await db
                                        .update(conversations)
                                        .set({ title })
                                        .where(eq(conversations.id, currentConversationId as string))
                                        .catch((err) => console.error("Error updating title:", err));
                                } catch (err) {
                                    console.error("Error generating title:", err);
                                }
                            }
                        }
                    }

                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                error: "Failed to generate response",
                                done: true,
                            })}\n\n`
                        )
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("[Chatbot API] Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process chat request",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// GET endpoint to list conversations for a brand
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const brandId = searchParams.get("brandId");

        if (!brandId) {
            return NextResponse.json(
                { success: false, error: "brandId is required" },
                { status: 400 }
            );
        }

        const conversationList = await db
            .select()
            .from(conversations)
            .where(eq(conversations.brandId, brandId))
            .orderBy(desc(conversations.updatedAt));

        return NextResponse.json({
            success: true,
            conversations: conversationList,
        });
    } catch (error) {
        console.error("[Chatbot API] Error fetching conversations:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch conversations",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}

// DELETE endpoint to delete a conversation
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return NextResponse.json(
                { success: false, error: "conversationId is required" },
                { status: 400 }
            );
        }

        // Messages will be cascade deleted due to foreign key constraint
        await db.delete(conversations).where(eq(conversations.id, conversationId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Chatbot API] Error deleting conversation:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete conversation",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
