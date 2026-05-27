"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuAction,
} from "@/components/ui/sidebar";
import { useChatStore } from "@/store/chat-store";
import { authClient } from "@/lib/auth-client";
import {
    Plus,
    Trash2,
    MessageSquare,
    ClockFadingIcon,
    ChartSplineIcon,
    MessageCircleIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MODES = ["ASK", "ANONYMOUS", "ANALYZE"] as const;

const MODE_ICONS: Record<string, React.ReactNode> = {
    ASK: <MessageCircleIcon className="size-4" />,
    ANONYMOUS: <ClockFadingIcon className="size-4" />,
    ANALYZE: <ChartSplineIcon className="size-4" />,
};

export function AppSidebar() {
    const {
        conversations,
        activeConversationId,
        activeMode,
        setActiveConversation,
        createConversation,
        deleteConversation,
        setMode,
    } = useChatStore();

    const { data: session } = authClient.useSession();
    const router = useRouter();

    return (
        <Sidebar className="border-r border-sidebar-border bg-sidebar w-[260px] shrink-0">
            <SidebarHeader className="px-3 py-6">
                <Image
                    src="/firemail-opensource.svg"
                    alt="firemail"
                    width={100}
                    height={100}
                    quality={90}
                    style={{ width: '150px', height: 'auto' }}
                    priority
                />
            </SidebarHeader>

            <SidebarContent className="overflow-y-auto no-scrollbar px-0">
                <SidebarGroup className="mb-2 px-0">
                    <p className="px-5 text-xs font-bold text-muted-foreground mb-1">
                        Mode
                    </p>
                    <div className="space-y-0.5 px-3">
                        {MODES.map((m, i) => {
                            const isActive = activeMode === m;
                            return (
                                <motion.button
                                    key={m}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setMode(m)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-200 relative rounded-lg",
                                        isActive
                                            ? "text-accent cursor-auto"
                                            : "text-muted-foreground cursor-pointer hover:text-foreground hover:bg-muted/60"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeModeBar"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="leading-none">{MODE_ICONS[m]}</span>
                                    {m}
                                </motion.button>
                            );
                        })}
                    </div>
                </SidebarGroup>

                <SidebarGroup className="px-0">
                    <div className="flex items-center justify-between px-5 mb-1">
                        <p className="text-xs font-bold text-muted-foreground">
                            Conversations
                        </p>
                        <button
                            onClick={() => createConversation()}
                            className="w-5 h-5 rounded-md cursor-pointer flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <SidebarMenu className="space-y-0.5 p-3">
                        {conversations.length === 0 ? (
                            <div className="px-3 py-6 text-center">
                                <p className="text-[11px] text-muted-foreground">No conversations yet</p>
                                <button
                                    onClick={() => createConversation()}
                                    className="mt-2 text-[11px] text-accent cursor-pointer font-bold hover:underline"
                                >
                                    Start one →
                                </button>
                            </div>
                        ) : (
                            conversations.map((conv) => {
                                const isActive = activeConversationId === conv.id;
                                return (
                                    <SidebarMenuItem key={conv.id} className="group/item">
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            onClick={() => setActiveConversation(conv.id)}
                                            className={cn(
                                                "w-full flex items-center cursor-pointer gap-2.5 rounded-lg px-3 py-2.5 text-[12px] transition-all duration-200 relative",
                                                isActive
                                                    ? "text-accent"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                                            )}
                                        >
                                            <MessageSquare
                                                className={cn("w-3.5 h-3.5 shrink-0", isActive ? "text-accent" : "text-muted-foreground")}
                                            />
                                            <span className="truncate font-bold">{conv.title}</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuAction
                                            onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                            className="opacity-0 cursor-pointer group-hover/item:opacity-100 text-muted-foreground hover:text-destructive transition-all right-2"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </SidebarMenuAction>
                                    </SidebarMenuItem>
                                );
                            })
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-4 pb-5 pt-3 border-t border-gray-200">
                <div
                    onClick={() => { router.push("/profile") }}
                    className="flex items-center gap-2.5 cursor-pointer">
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xl font-bold bg-accent/15 border-0! text-accent uppercase">
                            {session?.user?.name?.[0] ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-bold text-foreground">{session?.user?.name || "User"}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{session?.user?.email || "anonymous"}</p>
                    </div>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}