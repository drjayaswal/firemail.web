import { Conversation } from "@/types/chat";

const STORAGE_KEY = "ai-support-conversations";

export function getConversations(): Conversation[] {
    if (typeof window === "undefined") return [];

    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return [];

    return JSON.parse(data);
}

export function saveConversations(conversations: Conversation[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}