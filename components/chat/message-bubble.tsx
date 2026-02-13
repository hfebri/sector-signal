"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bot, FileText, ExternalLink, ChevronDown } from "lucide-react";
import { Citation } from "@/lib/ai/types/citations";
import { cn } from "@/lib/utils";

export interface Message {
    id?: string;
    role: "user" | "assistant";
    content: string;
    citations?: Citation[];
    createdAt?: Date;
}

async function openDocument(citation: Citation) {
    try {
        // Check if this is a sample document (from public/reports)
        if (citation.documentId.startsWith("sample-")) {
            // For sample files, trigger download
            const fileName = citation.metadata.fileName || citation.documentName;
            const link = document.createElement("a");
            link.href = `/reports/${fileName}`;
            link.download = fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // For stored documents, fetch the signed URL
        const response = await fetch(`/api/documents/${citation.documentId}/url`);
        const data = await response.json();

        if (response.ok && data.url) {
            // Create download link and trigger click
            const link = document.createElement("a");
            link.href = data.url;
            link.download = data.fileName || citation.documentName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (response.status === 404 || data.error?.includes("not found")) {
            // Document not found in database, try fallback to public folder
            console.warn("Document not found in database, trying public folder fallback");
            const fileName = citation.metadata.fileName || citation.documentName;
            const link = document.createElement("a");
            link.href = `/reports/${fileName}`;
            link.download = fileName;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (data.error) {
            console.error("Failed to get document URL:", data.error);
            alert(`Could not open document: ${data.error}`);
        }
    } catch (error) {
        console.error("Error opening document:", error);
        alert("Failed to open document. The file may no longer be available.");
    }
}

interface MessageBubbleProps {
    message: Message;
    showCitations?: boolean;
}

export function MessageBubble({ message, showCitations = true }: MessageBubbleProps) {
    const isUser = message.role === "user";
    const hasCitations = message.citations && message.citations.length > 0;
    const [showAllCitations, setShowAllCitations] = useState(false);

    const displayedCitations = showAllCitations
        ? message.citations || []
        : (message.citations || []).slice(0, 5);

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
                        {displayedCitations.map((citation, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="text-[10px] sm:text-xs font-normal px-1.5 py-0.5 sm:px-2 sm:py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-emerald-500 dark:hover:border-emerald-600 border border-transparent transition-all cursor-pointer max-w-[140px] sm:max-w-[180px] truncate group"
                                title={citation.documentName}
                                onClick={() => openDocument(citation)}
                            >
                                <FileText className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 inline-flex" />
                                {citation.metadata.platform
                                    ? `${citation.metadata.platform}: `
                                    : ""}
                                {citation.documentName}
                                <ExternalLink className="h-2 w-2 sm:h-2.5 sm:w-2.5 ml-1 opacity-0 group-hover:opacity-70 transition-opacity inline-flex" />
                            </Badge>
                        ))}
                        {(message.citations?.length ?? 0) > 5 && (
                            <Badge
                                variant="outline"
                                className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                onClick={() => setShowAllCitations(!showAllCitations)}
                            >
                                {showAllCitations ? (
                                    <span className="flex items-center gap-1">Show less <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 rotate-180" /></span>
                                ) : (
                                    <span className="flex items-center gap-1">+{(message.citations?.length ?? 0) - 5} more <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" /></span>
                                )}
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
