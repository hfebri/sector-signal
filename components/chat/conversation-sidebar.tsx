"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ConversationSidebarProps {
    brandId: string | undefined;
    currentConversationId: string | undefined;
    onSelectConversation: (conversationId: string) => void;
    onNewChat: () => void;
    onDeleteConversation?: (conversationId: string) => void;
}

export function ConversationSidebar({
    brandId,
    currentConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation,
}: ConversationSidebarProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (brandId) {
            loadConversations();
        }
    }, [brandId]);

    async function loadConversations() {
        if (!brandId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/chatbot?brandId=${encodeURIComponent(brandId)}`);
            const data = await response.json();

            if (data.success) {
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(conversationId: string, e: React.MouseEvent) {
        e.stopPropagation();

        if (!confirm("Are you sure you want to delete this conversation?")) {
            return;
        }

        setDeletingId(conversationId);

        try {
            const response = await fetch(`/api/chatbot?conversationId=${encodeURIComponent(conversationId)}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setConversations((prev) => prev.filter((c) => c.id !== conversationId));
                if (onDeleteConversation) {
                    onDeleteConversation(conversationId);
                }
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
        } finally {
            setDeletingId(null);
        }
    }

    function formatDate(date: Date | string): string {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Today";
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return d.toLocaleDateString("en-US", { weekday: "short" });
        } else {
            return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-sm">Chats</h2>
                            <p className="text-xs text-muted-foreground">
                                {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onNewChat}
                        disabled={!brandId}
                        className="h-8 w-8 p-0 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Loading conversations...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                <Sparkles className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium mb-1">No conversations yet</p>
                            <p className="text-xs text-muted-foreground">
                                Start a new chat to begin
                            </p>
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => onSelectConversation(conversation.id)}
                                className={cn(
                                    "group relative rounded-lg p-3 cursor-pointer transition-all duration-200",
                                    currentConversationId === conversation.id
                                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 shadow-sm"
                                        : "hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent"
                                )}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        onSelectConversation(conversation.id);
                                    }
                                }}
                            >
                                <div className="pr-8">
                                    <p className={cn(
                                        "text-sm font-medium truncate mb-1",
                                        currentConversationId === conversation.id
                                            ? "text-emerald-900 dark:text-emerald-100"
                                            : "text-slate-900 dark:text-slate-100"
                                    )}>
                                        {conversation.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        {formatDate(conversation.updatedAt)}
                                    </p>
                                </div>

                                {/* Delete button */}
                                {onDeleteConversation && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className={cn(
                                            "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-slate-700",
                                            deletingId === conversation.id && "opacity-100"
                                        )}
                                        onClick={(e) => handleDelete(conversation.id, e)}
                                        disabled={deletingId === conversation.id}
                                    >
                                        {deletingId === conversation.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
