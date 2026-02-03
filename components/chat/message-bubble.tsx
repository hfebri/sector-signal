"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bot, FileText } from "lucide-react";
import { Citation } from "@/lib/ai/types/citations";
import { cn } from "@/lib/utils";

export interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
    createdAt?: Date;
}

interface MessageBubbleProps {
    message: Message;
    showCitations?: boolean;
}

export function MessageBubble({ message, showCitations = true }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const hasCitations = message.citations && message.citations.length > 0;

    return (
        <div className={cn("flex w-full gap-2 sm:gap-3 mb-3 sm:mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            <div
                className={cn(
                    "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow-sm",
                    isUser
                        ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                )}
            >
                {isUser ? (
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
            </div>

            {/* Message Content */}
            <div className={cn("flex flex-col max-w-[85%] sm:max-w-[80%]", isUser ? "items-end" : "items-start")}>
                <Card
                    className={cn(
                        "shadow-sm transition-all",
                        isUser
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 sm:px-4 sm:py-2.5"
                            : "bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-2.5 border-slate-200 dark:border-slate-700"
                    )}
                >
                    {/* Render markdown content */}
                    <div
                        className={cn(
                            "text-xs sm:text-sm whitespace-pre-wrap break-words prose prose-sm max-w-none",
                            isUser ? "prose-invert prose-p:m-0" : "prose-p:m-0"
                        )}
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                    />
                </Card>

                {/* Citations for assistant messages */}
                {!isUser && showCitations && hasCitations && (
                    <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-1.5">
                        {message.citations?.slice(0, 5).map((citation, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[10px] sm:text-xs font-normal px-1.5 py-0.5 sm:px-2 sm:py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
                                title={citation.documentName}
                            >
                                <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 inline-flex" />
                                {citation.metadata.platform
                                    ? `${citation.metadata.platform}: `
                                    : ""}
                                {citation.documentName}
                            </Badge>
                        ))}
                        {(message.citations?.length ?? 0) > 5 && (
                            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                                +{(message.citations?.length ?? 0) - 5} more
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to build class attribute strings
const cls = (name: string) => 'class="' + name + '"';

/**
 * Basic markdown formatter for chat messages
 * Handles: bold, italic, code blocks, lists, headers
 */
function formatMarkdown(text: string): string {
    // Escape HTML first to prevent XSS
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code blocks (must be before inline code)
    html = html.replace(
        /```(\w*)\n([\s\S]*?)```/g,
        "<pre " + cls("bg-slate-100 dark:bg-slate-900 p-2 sm:p-3 rounded-lg overflow-x-auto my-2 text-[10px] sm:text-xs") + "><code>$2</code></pre>"
    );

    // Inline code
    html = html.replace(
        /`([^`]+)`/g,
        "<code " + cls("bg-slate-100 dark:bg-slate-700 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-mono") + ">$1</code>"
    );

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Headers
    html = html.replace(
        /^### (.+)$/gm,
        "<h3 " + cls("text-sm sm:text-base font-semibold mt-2 sm:mt-3 mb-1") + ">$1</h3>"
    );
    html = html.replace(
        /^## (.+)$/gm,
        "<h2 " + cls("text-base sm:text-lg font-semibold mt-2 sm:mt-3 mb-1") + ">$1</h2>"
    );
    html = html.replace(
        /^# (.+)$/gm,
        "<h1 " + cls("text-lg sm:text-xl font-bold mt-2 sm:mt-3 mb-1") + ">$1</h1>"
    );

    // Unordered lists
    html = html.replace(
        /^- (.+)$/gm,
        "<li " + cls("ml-3 sm:ml-4 list-disc") + ">$1</li>"
    );
    html = html.replace(
        /(<li.*<\/li>\n?)+/g,
        "<ul " + cls("my-1") + ">$&</ul>"
    );

    // Ordered lists
    html = html.replace(
        /^\d+\. (.+)$/gm,
        "<li " + cls("ml-3 sm:ml-4 list-decimal") + ">$1</li>"
    );

    // Line breaks and paragraph wrapping
    html = html.replace(/\n\n/g, "</p><p " + cls("my-1.5 sm:my-2") + ">");
    html = html.replace(/\n/g, "<br />");
    html = "<p " + cls("my-0") + ">" + html + "</p>";

    return html;
}

/**
 * Component for loading state
 */
export function MessageBubbleSkeleton({ isUser = false }: { isUser?: boolean }) {
    return (
        <div className={cn("flex w-full gap-2 sm:gap-3 mb-3 sm:mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            <div className={cn(
                "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full animate-pulse",
                isUser
                    ? "bg-gradient-to-br from-primary/20 to-primary/10"
                    : "bg-gradient-to-br from-emerald-500/20 to-teal-600/20"
            )} />

            {/* Message skeleton */}
            <div className={cn("flex flex-col max-w-[85%] sm:max-w-[80%]", isUser ? "items-end" : "items-start")}>
                <Card className="px-3 py-2 sm:px-4 sm:py-3 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl">
                    <div className="space-y-1.5 sm:space-y-2">
                        <div className="h-2.5 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-32 sm:w-48" />
                        <div className="h-2.5 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-24 sm:w-32" />
                        <div className="h-2.5 sm:h-3 bg-slate-200 dark:bg-slate-700 rounded w-28 sm:w-40" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
