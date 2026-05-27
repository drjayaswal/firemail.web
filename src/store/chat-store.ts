"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";
import { Conversation, Message } from "@/types/chat";
import {
  getConversationsAction,
  createConversationAction,
  updateConversationAction,
  deleteConversationAction,
} from "@/app/chat-actions";

type ModeType = "ASK" | "ANONYMOUS" | "ANALYZE";

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    thinkingEnabled: boolean;
    activeMode: ModeType;
    activeTheme: string;
    loading: boolean;
    mobileSidebarOpen: boolean;
    initialize: () => Promise<void>;
    createConversation: () => Promise<void>;
    setActiveConversation: (id: string) => void;
    toggleThinking: () => void;
    addMessage: (conversationId: string, message: Message) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    setMode: (mode: ModeType) => Promise<void>;
    setTheme: (theme: string) => void;
    setMobileSidebarOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    thinkingEnabled: true,
    activeMode: "ASK",
    activeTheme: "Firemail",
    loading: false,
    mobileSidebarOpen: false,

    initialize: async () => {
        if (typeof window === "undefined") return;

        const savedMode = (localStorage.getItem("firemail-mode") as ModeType) || "ASK";
        const savedTheme = localStorage.getItem("firemail-theme") || "Firemail";
        const savedThinking = localStorage.getItem("firemail-thinking") !== "false";

        set({
            activeMode: savedMode,
            activeTheme: savedTheme,
            thinkingEnabled: savedThinking,
            loading: true,
        });

        try {
            if (savedMode === "ASK") {
                const res = await getConversationsAction();
                if (res.ok && res.conversations) {
                    if (res.conversations.length === 0) {
                        const createRes = await createConversationAction(`New ${savedMode.charAt(0).toUpperCase() + savedMode.slice(1).toLowerCase()} Conversation`,);
                        if (createRes.ok && createRes.conversation) {
                            set({
                                conversations: [createRes.conversation],
                                activeConversationId: createRes.conversation.id,
                            });
                        }
                    } else {
                        set({
                            conversations: res.conversations,
                            activeConversationId: res.conversations[0].id,
                        });
                    }
                } else {
                    const localData = localStorage.getItem(`firemail-conversations-${savedMode}`);
                    const conversations = localData ? JSON.parse(localData) : [];
                    if (conversations.length === 0) {
                        const newConv: Conversation = {
                            id: nanoid(),
                            title: `New ${savedMode.charAt(0).toUpperCase() + savedMode.slice(1).toLowerCase()} Conversation`,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            messages: [],
                        };
                        localStorage.setItem(`firemail-conversations-${savedMode}`, JSON.stringify([newConv]));
                        set({ conversations: [newConv], activeConversationId: newConv.id });
                    } else {
                        set({ conversations, activeConversationId: conversations[0].id });
                    }
                }
            } else {
                const localData = localStorage.getItem(`firemail-conversations-${savedMode}`);
                const conversations = localData ? JSON.parse(localData) : [];
                if (conversations.length === 0) {
                    const newConv: Conversation = {
                        id: nanoid(),
                        title: `New ${savedMode.charAt(0).toUpperCase() + savedMode.slice(1).toLowerCase()} Conversation`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        messages: [],
                    };
                    localStorage.setItem(`firemail-conversations-${savedMode}`, JSON.stringify([newConv]));
                    set({ conversations: [newConv], activeConversationId: newConv.id });
                } else {
                    set({ conversations, activeConversationId: conversations[0].id });
                }
            }
        } catch (err) {
            console.error("Initialize failed:", err);
        } finally {
            set({ loading: false });
        }
    },

    createConversation: async () => {
        const mode = get().activeMode;
        set({ loading: true });

        try {
            if (mode === "ASK") {
                const title = `New ${mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase()} Conversation`
                const res = await createConversationAction(title);
                if (res.ok && res.conversation) {
                    set({
                        conversations: [res.conversation, ...get().conversations],
                        activeConversationId: res.conversation.id,
                    });
                }
            } else {
                const newConv: Conversation = {
                    id: nanoid(),
                    title: `New ${mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase()} Conversation`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    messages: [],
                };
                const updatedConversations = [newConv, ...get().conversations];
                localStorage.setItem(`firemail-conversations-${mode}`, JSON.stringify(updatedConversations));
                set({
                    conversations: updatedConversations,
                    activeConversationId: newConv.id,
                });
            }
        } catch (err) {
            console.error("Failed to create conversation:", err);
        } finally {
            set({ loading: false });
        }
    },

    setActiveConversation: (id) => {
        set({ activeConversationId: id });
    },

    toggleThinking: () => {
        const nextThinking = !get().thinkingEnabled;
        localStorage.setItem("firemail-thinking", String(nextThinking));
        set({ thinkingEnabled: nextThinking });
    },

    addMessage: async (conversationId, message) => {
        const mode = get().activeMode;
        const currentConv = get().conversations.find((c) => c.id === conversationId);
        if (!currentConv) return;

        let newTitle = currentConv.title;
        if (currentConv.messages.length === 0 || currentConv.title.startsWith("New Conversation")) {
            const rawTitle = message.content.slice(0, 30);
            newTitle = rawTitle.includes(`with ${mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase()}`) ? rawTitle : `${rawTitle}`;
        }

        const updatedMessages = [...currentConv.messages, message];
        const updatedConv = {
            ...currentConv,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: updatedMessages,
        };

        const updatedConversations = get().conversations.map((c) =>
            c.id === conversationId ? updatedConv : c
        );

        set({ conversations: updatedConversations });

        if (mode === "ASK") {
            try {
                await updateConversationAction(conversationId, {
                    title: newTitle,
                    messages: updatedMessages,
                });
            } catch (err) {
                console.error("Failed to save message to DB:", err);
            }
        } else {
            localStorage.setItem(
                `firemail-conversations-${mode}`,
                JSON.stringify(updatedConversations)
            );
        }
    },

    deleteConversation: async (id) => {
        const mode = get().activeMode;
        const remaining = get().conversations.filter((c) => c.id !== id);
        
        set({ conversations: remaining });
        
        if (remaining.length > 0) {
            set({ activeConversationId: remaining[0].id });
        } else {
            set({ activeConversationId: null });
        }

        if (mode === "ASK") {
            try {
                await deleteConversationAction(id);
            } catch (err) {
                console.error("Failed to delete conversation from DB:", err);
            }
        } else {
            localStorage.setItem(
                `firemail-conversations-${mode}`,
                JSON.stringify(remaining)
            );
        }

        if (remaining.length === 0) {
            await get().createConversation();
        }
    },

    setMode: async (mode) => {
        localStorage.setItem("firemail-mode", mode);
        set({ activeMode: mode });
        await get().initialize();
    },

    setTheme: (theme) => {
        localStorage.setItem("firemail-theme", theme);
        set({ activeTheme: theme });
    },

    setMobileSidebarOpen: (open) => {
        set({ mobileSidebarOpen: open });
    },
}));