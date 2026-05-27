"use client";

import { nanoid } from "nanoid";
import { useChatStore } from "@/store/chat-store";
import { useMemo, useState, useEffect, useRef } from "react";
import { ArrowUp, Paperclip, MoreHorizontal, Eye, EyeOff, CornerDownLeft, Sparkles } from "lucide-react";
import { Message } from "./message";
import { toast } from "@/lib/toast";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

const COMMANDS = [
    { value: "/new", label: "New Chat", desc: "Start a fresh session" },
    { value: "/modes", label: "Cycle Modes", desc: "Switch ASK / ANONYMOUS / ANALYZE" },
    { value: "/thinking", label: "Toggle Thinking", desc: "Show or hide AI reasoning" },
    { value: "/theme", label: "Cycle Themes", desc: "Cycle color palette" },
    { value: "/logout", label: "Log Out", desc: "Sign out of your account" },
];

export const MODE_COLOR: Record<string, string> = {
    ASK: "#ff3131",
    ANONYMOUS: "#ffffff",
    ANALYZE: "#6366f1",
};

export function ChatPanel() {
    const {
        conversations,
        activeConversationId,
        addMessage,
        thinkingEnabled,
        toggleThinking,
        activeMode,
        activeTheme,
        setMode,
        setTheme,
        createConversation,
    } = useChatStore();

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [commandIndex, setCommandIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeConversation = useMemo(
        () => conversations.find((c) => c.id === activeConversationId),
        [conversations, activeConversationId]
    );

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [activeConversation?.messages, loading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
        }
    }, [input]);

    const isCommandMenuOpen = input.startsWith("/");
    const filteredCommands = useMemo(
        () => (isCommandMenuOpen ? COMMANDS.filter((c) => c.value.startsWith(input.toLowerCase())) : []),
        [input, isCommandMenuOpen]
    );

    useEffect(() => setCommandIndex(0), [filteredCommands.length]);

    const modeColor = MODE_COLOR[activeMode] ?? "#ff3131";

    const executeCommand = async (cmdVal: string) => {
        setInput("");
        if (cmdVal === "/new") {
            await createConversation();
            toast.success("New conversation started");
        } else if (cmdVal === "/modes") {
            const modes = ["ASK", "ANONYMOUS", "ANALYZE"] as const;
            const next = modes[(modes.indexOf(activeMode) + 1) % modes.length];
            await setMode(next);
            toast.info(`Mode: ${next}`);
        } else if (cmdVal === "/thinking") {
            toggleThinking();
            toast.success(thinkingEnabled ? "Thinking hidden" : "Thinking visible");
        } else if (cmdVal === "/theme") {
            const { THEMES } = await import("@/lib/themes-list");
            const idx = THEMES.findIndex((t) => t.name === activeTheme);
            setTheme(THEMES[(idx + 1) % THEMES.length].name);
        } else if (cmdVal === "/logout") {
            await authClient.signOut();
            window.location.reload();
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeConversation) return;
        if (input.startsWith("/")) { await executeCommand(input.trim()); return; }

        const userMessage = { id: nanoid(), role: "user" as const, content: input, createdAt: new Date().toISOString() };
        addMessage(activeConversation.id, userMessage);
        const currentInput = input;
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        ...activeConversation.messages.map((m) => ({ role: m.role, content: m.content })),
                        { role: "user", content: currentInput },
                    ],
                    mode: activeMode,
                }),
            });
            if (!res.ok) throw new Error("Chat service failed");
            const data = await res.json();
            if (activeMode === "ANALYZE" && data.intent?.isGmailQuery) {
                toast.info(`Analyze: unread=${data.intent.unread}, limit=${data.intent.count}`);
            }
            addMessage(activeConversation.id, {
                id: nanoid(), role: "assistant", content: data.content, thinking: data.thinking, createdAt: new Date().toISOString(),
            });
        } catch (err: any) {
            toast.error(err?.message || "Failed to reach assistant");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isCommandMenuOpen && filteredCommands.length > 0) {
            if (e.key === "ArrowDown") { e.preventDefault(); setCommandIndex((p) => (p + 1) % filteredCommands.length); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); setCommandIndex((p) => (p - 1 + filteredCommands.length) % filteredCommands.length); return; }
            if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); executeCommand(filteredCommands[commandIndex].value); return; }
            if (e.key === "Escape") { e.preventDefault(); setInput(""); return; }
        }
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    if (!activeConversation) {
        return (
            <div className="flex h-full flex-col bg-background">
                <div className="flex h-12 shrink-0 items-center border-b border-border bg-white px-4 gap-3">
                    <SidebarTrigger className="h-7 w-7 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground tracking-wide uppercase">dashboard</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center flex items-center flex-col space-y-4">
                        <Image
                            src="/logo.svg"
                            alt="firemail"
                            width={100}
                            height={100}
                            quality={90}
                            className="grayscale opacity-50"
                            style={{ width: '50px', height: 'auto' }}
                            priority
                        />
                        <div>
                            <p className="text-[14px] font-bold text-foreground">No Conversation Selected</p>
                            <p className="text-[12px] text-muted-foreground mt-1">Start a new chat to begin</p>
                        </div>
                        <Button onClick={() => createConversation()} className="bg-gray-400 hover:bg-accent text-white rounded-xl h-9 px-5 text-[12px] font-bold">
                            New Conversation
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col bg-background overflow-hidden">
            <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-white px-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="h-7 w-7 text-muted-foreground hover:text-foreground" />
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: modeColor }}
                        />
                        <span className="text-[12px] font-bold text-foreground tracking-tight truncate max-w-[200px] sm:max-w-xs">
                            {activeConversation.title}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                        style={{ color: MODE_COLOR[activeMode] !== "#ffffff" ? "white" : "black", backgroundColor: `${modeColor}` }}
                    >
                        {activeMode}
                    </span>

                    <button
                        onClick={toggleThinking}
                        className={cn(
                            "flex items-center gap-1.5 text-[10px] font-bold uppercase cursor-pointer tracking-wider px-2.5 py-1 rounded-lg border transition-all",
                            !thinkingEnabled
                                ? "border-red-600 text-white bg-red-600"
                                : "border-green-600 text-white bg-green-600"
                        )}
                    >
                        {thinkingEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        Thinking
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
                <div className="mx-auto max-w-2xl flex flex-col gap-5 px-5 pt-6 pb-36">
                    {activeConversation.messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-5 h-5 text-accent" />
                            </div>
                            <p className="text-[13px] font-bold text-foreground">How can I help you today?</p>
                            <p className="text-[12px] text-muted-foreground mt-1">
                                Type a message or <kbd className="font-mono">/</kbd> for commands
                            </p>
                        </motion.div>
                    )}

                    {activeConversation.messages.map((message) => (
                        <Message key={message.id} message={message} showThinking={thinkingEnabled} />
                    ))}

                    {loading && (
                        <div className="flex items-center gap-2.5 px-4 py-3 w-fit">
                            <Image
                                src={MODE_COLOR[activeMode] === "#ffffff" ? "/logo-nobg.svg" : MODE_COLOR[activeMode] === "#6366f1" ? "/status-logos/logo-blue.svg" : "/logo.svg"}
                                alt="Firemail"
                                width={24}
                                height={24}
                                className={cn("animate-pulse", MODE_COLOR[activeMode] === "#ffffff" && "invert opacity-20")}
                            />
                            <span className="text-[12px] font-bold text-muted-foreground">Thinking...</span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 pt-10 bg-linear-to-t from-background via-background/95 to-transparent pointer-events-none">
                <div className="mx-auto max-w-2xl relative pointer-events-auto">
                    <AnimatePresence>
                        {isCommandMenuOpen && filteredCommands.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.12 }}
                                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border bg-white shadow-xl overflow-hidden z-40"
                            >
                                <div className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border">
                                    Commands
                                </div>
                                {filteredCommands.map((cmd, idx) => (
                                    <button
                                        key={cmd.value}
                                        onClick={() => executeCommand(cmd.value)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 text-[12px] transition-colors",
                                            commandIndex === idx
                                                ? "bg-accent/8 text-accent"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <span className="font-mono font-bold">{cmd.value}</span>
                                            <span className="text-muted-foreground">— {cmd.label}</span>
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/60 hidden sm:block">{cmd.desc}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div
                        className={cn(
                            "w-full rounded-[24px] flex items-center justify-between border bg-background px-4 pt-3 pb-3",
                            "transition-colors duration-150",
                            "shadow-[0_1px_6px_rgba(0,0,0,0.06)]",
                        )}
                        style={{ borderColor: input.trim() ? modeColor : "#e8e8e8" }}

                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Firemail..."
                            rows={1}
                            className={cn(
                                "w-full resize-none bg-transparent",
                                "text-[15px] leading-[1.55] text-foreground placeholder:text-muted-foreground/60",
                                "outline-none border-none",
                                "min-h-[24px] max-h-[180px] overflow-y-auto",
                                "scrollbar-none [&::-webkit-scrollbar]:hidden"
                            )}
                            style={{ height: "24px" }}
                        />
                            <div className="flex items-center gap-2">
                                {!loading && (
                                    <kbd className={cn(
                                        "hidden sm:inline-flex items-center gap-1",
                                        "text-[11px] font-mono text-muted-foreground",
                                        "border border-gray-100 rounded-md px-1.5 py-[3px]",
                                        "bg-muted/40 select-none leading-none",
                                        "transition-opacity duration-150",
                                        input.trim() ? "opacity-100" : "opacity-0"
                                    )}>
                                        Return <CornerDownLeft className="h-[9px] w-[9px]" />
                                    </kbd>
                                )}

                            <button
                                type="button"
                                disabled={loading || !input.trim()}
                                onClick={sendMessage}
                                aria-label="Send message"
                                className={cn(
                                    "w-[34px] h-[34px] rounded-full flex items-center justify-center",
                                    "transition-all duration-150 shadow-sm",
                                )}
                                style={{ color: MODE_COLOR[activeMode] === "#ffffff" ? "black" : "white", backgroundColor: MODE_COLOR[activeMode] }}
                            >
                                {loading ? (
                                    <span className="w-3 h-3 rounded-[3px] bg-current" />
                                ) : (
                                    <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                                )}
                            </button>
                            </div>
                    </div>
                </div>
            </div>
        </div>
    );
}