"use client";

import { useState, useEffect, useRef } from "react";
import { useBrand } from "@/lib/brand-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, AlertCircle, Sparkles, MessageSquare, BarChart3, FileText, Lightbulb, X, Plus } from "lucide-react";
import { MessageBubble, MessageBubbleSkeleton, Message } from "@/components/chat/message-bubble";
import { ConversationSidebar, Conversation } from "@/components/chat/conversation-sidebar";
import { Citation } from "@/lib/ai/types/citations";
import { cn } from "@/lib/utils";

export default function ChatbotPage() {
    const { currentBrand } = useBrand();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string>();
    const [showSidebar, setShowSidebar] = useState(() => {
        // Initialize sidebar state based on screen size
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 1024; // Only show on desktop (lg breakpoint)
        }
        return false; // Default to hidden on mobile
    });
    const [error, setError] = useState<string | null>(null);
    const [streamingContent, setStreamingContent] = useState("");
    const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    // Handle window resize - close sidebar on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && showSidebar) {
                setShowSidebar(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [showSidebar]);

    // Load conversation when selected
    async function loadConversation(conversationId: string) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/chatbot/messages?conversationId=${encodeURIComponent(conversationId)}`);
            const data = await response.json();

            if (data.success) {
                setCurrentConversationId(conversationId);
                setMessages(
                    data.messages.map((msg: any) => ({
                        id: msg.id,
                        role: msg.role,
                        content: msg.content,
                        citations: msg.citations,
                        createdAt: new Date(msg.createdAt),
                    }))
                );
            }
        } catch (err) {
            console.error("Failed to load conversation:", err);
            setError("Failed to load conversation");
        } finally {
            setLoading(false);
        }
    }

    // Start a new chat
    function handleNewChat() {
        setCurrentConversationId(undefined);
        setMessages([]);
        setStreamingContent("");
        setStreamingCitations([]);
        setError(null);
        setInput("");
    }

    // Delete a conversation
    function handleDeleteConversation(conversationId: string) {
        if (currentConversationId === conversationId) {
            handleNewChat();
        }
    }

    // Send a message
    async function sendMessage() {
        if (!input.trim() || !currentBrand || loading) return;

        const userMessage = input.trim();
        setInput("");
        setLoading(true);
        setError(null);

        // Add user message immediately
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

        // Reset streaming state
        setStreamingContent("");
        setStreamingCitations([]);

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    brandId: currentBrand.id,
                    message: userMessage,
                    conversationId: currentConversationId,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";
            let finalCitations: Citation[] = [];
            let newConversationId: string | undefined;
            let buffer = ""; // Buffer for incomplete chunks

            if (!reader) {
                throw new Error("No response stream");
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;

                // Split by newlines and process complete lines
                const lines = buffer.split("\n");
                // Keep the last incomplete line in buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.content) {
                                fullContent += data.content;
                                setStreamingContent(fullContent);
                            }

                            if (data.citations) {
                                finalCitations = data.citations;
                                setStreamingCitations(data.citations);
                            }

                            if (data.conversationId) {
                                newConversationId = data.conversationId;
                                setCurrentConversationId(data.conversationId);
                            }

                            if (data.done) {
                                // Add final assistant message
                                setMessages((prev) => [
                                    ...prev,
                                    {
                                        role: "assistant",
                                        content: fullContent,
                                        citations: finalCitations,
                                    },
                                ]);
                                setStreamingContent("");
                                setStreamingCitations([]);
                            }

                            if (data.error) {
                                setError(data.error);
                                setStreamingContent("");
                                setStreamingCitations([]);
                            }
                        } catch (e) {
                            // Skip invalid JSON but log it for debugging
                            console.error("Failed to parse SSE data:", line, e);
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Chat error:", err);
            setError("Failed to send message. Please try again.");
            // Remove the user message if failed
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    }

    // Handle keyboard shortcut
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter" && !e.shiftKey && !loading) {
            e.preventDefault();
            sendMessage();
        }
    }

    if (!currentBrand) {
        return (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <Card className="p-8 max-w-md text-center shadow-lg border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">No Brand Selected</h2>
                    <p className="text-muted-foreground">Please select a brand to start chatting.</p>
                </Card>
            </div>
        );
    }

    const suggestions = [
        { icon: BarChart3, text: "Analyze my Instagram performance metrics" },
        { icon: FileText, text: "Overview my Competitors" },
        { icon: Lightbulb, text: "Generate monthly performance report" },
        { icon: Sparkles, text: "Find growth opportunities in my data" },
    ];

    return (
        <div className="h-full flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Mobile Backdrop */}
            {showSidebar && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setShowSidebar(false)}
                />
            )}

            {/* Sidebar - Desktop: static, Mobile: overlay drawer */}
            <div
                className={cn(
                    "fixed lg:relative inset-y-0 left-0 z-50 w-80 max-w-[85vw] lg:w-72 lg:max-w-none flex-shrink-0 transition-transform duration-300 ease-in-out lg:transition-none",
                    showSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Mobile close button */}
                    <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <MessageSquare className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-sm">Conversations</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleNewChat}
                                className="h-8 w-8 p-0 rounded-lg"
                                title="New chat"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowSidebar(false)}
                                className="h-8 w-8 p-0 rounded-lg"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <ConversationSidebar
                        brandId={currentBrand.id}
                        currentConversationId={currentConversationId}
                        onSelectConversation={(id) => {
                            loadConversation(id);
                            setShowSidebar(false);
                        }}
                        onNewChat={() => {
                            handleNewChat();
                            setShowSidebar(false);
                        }}
                        onDeleteConversation={handleDeleteConversation}
                    />
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-14 sm:h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-3 sm:px-4 justify-between shadow-sm sticky top-0 z-30">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="lg:hidden h-9 w-9 p-0 flex-shrink-0"
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="font-semibold text-sm truncate">AI Assistant</h1>
                                <p className="text-xs text-muted-foreground truncate hidden sm:block">{currentBrand.brandName}</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleNewChat}
                        className="rounded-lg border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 flex-shrink-0"
                    >
                        <span className="hidden sm:inline">New Chat</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1" ref={scrollRef}>
                    <div className="max-w-3xl sm:max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                        {messages.length === 0 && !loading && (
                            <div className="text-center py-8 sm:py-16">
                                <div className="mb-6 sm:mb-8">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                                        <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to AI Assistant</h2>
                                    <p className="text-muted-foreground max-w-md mx-auto text-sm sm:text-base px-4">
                                        I can help you analyze your brand performance, strategy, and documents. Ask me anything!
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-xl sm:max-w-2xl mx-auto px-2">
                                    {suggestions.map((suggestion) => (
                                        <Button
                                            key={suggestion.text}
                                            variant="outline"
                                            className="justify-start text-left h-auto py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all whitespace-normal"
                                            onClick={() => setInput(suggestion.text)}
                                        >
                                            <div className="flex items-start gap-2 sm:gap-3 w-full">
                                                <suggestion.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-xs sm:text-sm break-words leading-snug text-left flex-1">{suggestion.text}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Messages list */}
                        <div className="space-y-0">
                            {messages.map((msg, i) => (
                                <MessageBubble key={msg.id || i} message={msg} />
                            ))}

                            {loading && streamingContent && (
                                <MessageBubble
                                    message={{
                                        role: "assistant",
                                        content: streamingContent,
                                        citations: streamingCitations,
                                    }}
                                />
                            )}

                            {loading && !streamingContent && <MessageBubbleSkeleton />}

                            {error && (
                                <Card className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 rounded-2xl">
                                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </p>
                                </Card>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-lg">
                    <div className="max-w-3xl sm:max-w-4xl mx-auto">
                        <div className="flex gap-2 items-end">
                            <div className="flex-1 relative min-w-0">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about your brand performance, strategy, documents..."
                                    disabled={loading}
                                    className="pr-16 sm:pr-20 h-11 sm:h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 bg-slate-50 dark:bg-slate-800 text-sm"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground px-1.5 sm:px-2 hidden sm:block">
                                    Press Enter
                                </div>
                            </div>
                            <Button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                size="icon"
                                className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md flex-shrink-0"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 sm:mt-3 px-2">
                            AI responses are based on your uploaded documents and may not always be accurate.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
