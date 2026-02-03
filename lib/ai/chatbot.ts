/**
 * Simple Chatbot AI Module with RAG
 *
 * Uses OpenAI GPT-5-nano with Responses API for chatbot responses with RAG
 * (Retrieval-Augmented Generation) to answer questions about brand performance,
 * strategy, and documents.
 */

import { openai } from './openai-client';
import { searchBrandDocuments, convertSearchResultsToCitations } from './vector-search';
import { db } from '@/lib/db/supabase';
import { brands as brandsTable } from '@/lib/db/drizzle-schema';
import { eq } from 'drizzle-orm';
import type { Citation } from './types/citations';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    content: string;
    citations: Citation[];
}

/**
 * Build input items for the Responses API from messages
 */
function buildInputItems(
    systemPrompt: string,
    context: string,
    conversationHistory: ChatMessage[],
    userMessage: string
): Array<{ role: string; content: string }> {
    const items: Array<{ role: string; content: string }> = [];

    // Add system prompt
    items.push({
        role: 'developer',
        content: systemPrompt,
    });

    // Add context if available
    if (context) {
        items.push({
            role: 'developer',
            content: `**Relevant Context from Documents:**\n\n${context}\n\nUse this context to answer the user's question. Reference sources using [1], [2], etc.`,
        });
    }

    // Add conversation history
    for (const msg of conversationHistory) {
        items.push({ role: msg.role, content: msg.content });
    }

    // Add current message
    items.push({ role: 'user', content: userMessage });

    return items;
}

/**
 * Extract text content from a Responses API response
 */
function extractResponseText(response: any): string {
    let outputText = "";
    for (const item of response.output) {
        if (item.type === 'message') {
            for (const content of item.content) {
                if (content.type === 'output_text') {
                    outputText += content.text;
                }
            }
        }
    }
    return outputText;
}

/**
 * Generate a chat response using GPT-5-nano with RAG
 */
export async function generateChatResponse(
    brandId: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
    try {
        console.log('[Chatbot] Generating response for brand:', brandId);

        // 1. Get brand context
        const brands = await db.select().from(brandsTable).where(eq(brandsTable.id, brandId)).limit(1);

        if (brands.length === 0) {
            throw new Error('Brand not found');
        }

        const brand = brands[0];

        // 2. Search documents for context
        const searchResults = await searchBrandDocuments(brandId, userMessage, { limit: 10 });
        const citations = convertSearchResultsToCitations(searchResults);

        // 3. Build context from search results
        const context = searchResults
            .map((r, i) => `[${i + 1}] ${r.content}`)
            .join('\n\n');

        // 4. Build system prompt with brand context
        const systemPrompt = `You are a helpful AI assistant for ${brand.brandName}, a brand in the ${brand.industry} industry.

**Brand Context:**
- **Brand:** ${brand.brandName}
- **Industry:** ${brand.industry}
- **Description:** ${brand.description || 'Not specified'}
- **Target Audience:** ${brand.targetAudience || 'Not specified'}
- **Brand Voice:** ${brand.brandVoice || 'Professional and friendly'}
- **Goals:** ${brand.goals || 'Not specified'}

**Your Role:**
You help answer questions about brand performance, strategy, content recommendations, and insights.

**Guidelines:**
1. Use the provided context from documents to answer questions
2. Reference sources using [1], [2], etc. when using specific information
3. Be clear when information isn't available in the documents
4. Maintain the brand's voice and tone in your responses
5. Format responses using markdown for readability (headers, lists, etc.)`;

        // 5. Build input items
        const input = buildInputItems(systemPrompt, context, conversationHistory, userMessage);

        // 6. Call OpenAI Responses API
        const response = await openai.responses.create({
            model: 'gpt-5-nano',
            input,
            reasoning: {
                effort: 'medium',
            },
            text: {
                format: { type: 'text' },
                verbosity: 'medium',
            },
            store: false,
        });

        // 7. Extract content
        const content = extractResponseText(response);

        console.log('[Chatbot] Response generated, citations:', citations.length);

        return { content, citations };
    } catch (error) {
        console.error('[Chatbot] Error generating response:', error);
        throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a streaming chat response
 * Returns an async generator that yields chunks of the response
 */
export async function* generateStreamingChatResponse(
    brandId: string,
    userMessage: string,
    conversationHistory: ChatMessage[] = []
): AsyncGenerator<{ content?: string; citations?: Citation[]; done?: boolean }> {
    try {
        console.log('[Chatbot] Generating streaming response for brand:', brandId);

        // 1. Get brand context
        const brands = await db.select().from(brandsTable).where(eq(brandsTable.id, brandId)).limit(1);

        if (brands.length === 0) {
            throw new Error('Brand not found');
        }

        const brand = brands[0];

        // 2. Search documents for context
        const searchResults = await searchBrandDocuments(brandId, userMessage, { limit: 10 });
        const citations = convertSearchResultsToCitations(searchResults);

        // 3. Build context from search results
        const context = searchResults
            .map((r, i) => `[${i + 1}] ${r.content}`)
            .join('\n\n');

        // 4. Build system prompt with brand context
        const systemPrompt = `You are a helpful AI assistant for ${brand.brandName}, a brand in the ${brand.industry} industry.

**Brand Context:**
- **Brand:** ${brand.brandName}
- **Industry:** ${brand.industry}
- **Description:** ${brand.description || 'Not specified'}
- **Target Audience:** ${brand.targetAudience || 'Not specified'}
- **Brand Voice:** ${brand.brandVoice || 'Professional and friendly'}
- **Goals:** ${brand.goals || 'Not specified'}

**Your Role:**
You help answer questions about brand performance, strategy, content recommendations, and insights.

**Guidelines:**
1. Use the provided context from documents to answer questions
2. Reference sources using [1], [2], etc. when using specific information
3. Be clear when information isn't available in the documents
4. Maintain the brand's voice and tone in your responses
5. Format responses using markdown for readability (headers, lists, etc.)`;

        // 5. Build input items
        const input = buildInputItems(systemPrompt, context, conversationHistory, userMessage);

        // 6. Call OpenAI Responses API with streaming
        const stream = await openai.responses.create({
            model: 'gpt-5-nano',
            input,
            reasoning: {
                effort: 'medium',
            },
            text: {
                format: { type: 'text' },
                verbosity: 'medium',
            },
            store: false,
            stream: true,
        });

        // 7. Stream the response
        for await (const chunk of stream) {
            // The Responses API streaming format is different
            // Extract text from streaming events
            if (chunk.type === 'response.output_text.delta') {
                yield { content: chunk.delta?.text || '' };
            } else if (chunk.type === 'response.output_text.done') {
                yield { content: chunk.text || '' };
            }
        }

        // 8. Send final message with citations
        yield { citations, done: true };

        console.log('[Chatbot] Streaming complete, citations:', citations.length);
    } catch (error) {
        console.error('[Chatbot] Error in streaming response:', error);
        throw new Error(`Failed to generate streaming response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate a title for a conversation based on the first message
 */
export async function generateConversationTitle(firstMessage: string): Promise<string> {
    try {
        const response = await openai.responses.create({
            model: 'gpt-5-nano',
            input: [
                {
                    role: 'developer',
                    content: 'Generate a short, concise title (max 6 words) for a chat conversation based on the user\'s first message. The title should summarize the topic. Return ONLY the title, no quotes or extra text.',
                },
                {
                    role: 'user',
                    content: `First message: "${firstMessage}"`,
                },
            ],
            reasoning: {
                effort: 'minimal',
            },
            text: {
                format: { type: 'text' },
                verbosity: 'low',
            },
            store: false,
        });

        const title = extractResponseText(response).trim();
        // Clean up any quotes and limit length
        return title.replace(/^["']|["']$/g, '').substring(0, 50);
    } catch (error) {
        console.error('[Chatbot] Error generating title:', error);
        // Fallback to first 50 chars of message
        return firstMessage.substring(0, 50);
    }
}
