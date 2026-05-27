"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MODE_COLOR } from "./chat-panel";
import { useChatStore } from "@/store/chat-store";

interface MessageData {
    id: string;
    role: "user" | "assistant";
    content: string;
    thinking?: string;
    createdAt: string;
}

interface MessageProps {
    message: MessageData;
    showThinking?: boolean;
}

function parseContent(content: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const lines = content.split("\n");
    let i = 0;
    let key = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (/^\d+\.\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\d+\.\s/, ""));
                i++;
            }
            nodes.push(
                <ol key={key++} className="list-decimal list-outside ml-5 space-y-1.5 my-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-[13.5px] leading-relaxed pl-1">
                            {parseInline(item)}
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        if (/^[-*]\s/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*]\s/.test(lines[i])) {
                items.push(lines[i].replace(/^[-*]\s/, ""));
                i++;
            }
            nodes.push(
                <ul key={key++} className="list-disc list-outside ml-5 space-y-1.5 my-3">
                    {items.map((item, idx) => (
                        <li key={idx} className="text-[13.5px] leading-relaxed pl-1">
                            {parseInline(item)}
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        if (/^#{1,3}\s/.test(line)) {
            const level = (line.match(/^(#+)/)?.[1].length ?? 1);
            const text = line.replace(/^#{1,3}\s/, "");
            const cls =
                level === 1
                    ? "text-[15px] font-semibold mt-4 mb-1.5"
                    : level === 2
                        ? "text-[14px] font-semibold mt-3 mb-1"
                        : "text-[13.5px] font-medium mt-2.5 mb-0.5 text-foreground/80";
            nodes.push(
                <p key={key++} className={cls}>
                    {parseInline(text)}
                </p>
            );
            i++;
            continue;
        }

        if (line.trim() === "") {
            i++;
            continue;
        }

        nodes.push(
            <p key={key++} className="text-[13.5px] leading-relaxed my-1.5">
                {parseInline(line)}
            </p>
        );
        i++;
    }

    return nodes;
}

function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g;
    let last = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > last) {
            parts.push(text.slice(last, match.index));
        }
        if (match[2] !== undefined) {
            parts.push(
                <strong key={key++} className="font-semibold text-foreground">
                    {match[2]}
                </strong>
            );
        } else if (match[3] !== undefined) {
            parts.push(
                <code
                    key={key++}
                    className="font-mono text-[12px] bg-muted/60 px-1.5 py-0.5 rounded-md text-foreground/85"
                >
                    {match[3]}
                </code>
            );
        } else if (match[4] !== undefined) {
            parts.push(
                <em key={key++} className="italic text-foreground/80">
                    {match[4]}
                </em>
            );
        }
        last = match.index + match[0].length;
    }

    if (last < text.length) {
        parts.push(text.slice(last));
    }

    return parts;
}

function AssistantContent({ content }: { content: string }) {
    const nodes = parseContent(content);
    return <div className="space-y-0.5">{nodes}</div>;
}

export function Message({ message, showThinking }: MessageProps) {
    const [thinkingOpen, setThinkingOpen] = useState(false);
    const isUser = message.role === "user";
    const { activeMode } = useChatStore();
    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={cn("flex gap-3 w-full", isUser ? "flex-row-reverse" : "flex-row")}
        >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                {!isUser &&

                    <Image
                        src={MODE_COLOR[activeMode] === "#ffffff" ? "/logo-nobg.svg" : MODE_COLOR[activeMode] === "#6366f1" ? "/status-logos/logo-blue.svg" : "/logo.svg"}
                        alt="Firemail" width={24} height={24}
                        className={cn(MODE_COLOR[activeMode] === "#ffffff" && "invert opacity-20")}
                    />
                }
            </div>

            <div
                className={cn(
                    "flex flex-col gap-1.5 max-w-[90%]",
                    isUser ? "items-end" : "items-start"
                )}
            >
                {showThinking && message.thinking && (
                    <div className="w-full">
                        <motion.button
                            onClick={() => setThinkingOpen((p) => !p)}
                            whileTap={{ scale: 0.96 }}
                            className="flex items-center cursor-pointer gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150 font-bold uppercase tracking-wider mb-1"
                        >
                            <motion.span
                                animate={{ rotate: thinkingOpen ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                                className="flex"
                            >
                                <ChevronDown className="h-3 w-3" />
                            </motion.span>
                            Thinking
                        </motion.button>
                        <AnimatePresence initial={false}>
                            {thinkingOpen && (
                                <motion.div
                                    key="thinking"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-3.5 py-3 text-[11px] text-muted-foreground font-mono leading-relaxed mb-1.5">
                                        {message.thinking}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {isUser ? (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut", delay: 0.04 }}
                        className="rounded-2xl rounded-tr-none px-4 py-3 text-[13px] leading-relaxed text-black"
                    >
                        {message.content}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut", delay: 0.04 }}
                        className="rounded-2xl rounded-tl-none px-4 py-3.5 bg-white border border-border text-foreground shadow-sm"
                    >
                        <AssistantContent content={message.content} />
                    </motion.div>
                )}

                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                    className="text-[10px] text-muted-foreground px-1 font-semibold"
                >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </motion.span>
            </div>
        </motion.div>
    );
}