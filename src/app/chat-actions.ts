"use server";

import { db } from "@/app/db";
import { conversations as conversationsTable } from "@/app/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { Conversation, Message } from "@/types/chat";

export async function getConversationsAction(): Promise<{
  ok: boolean;
  conversations?: Conversation[];
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: "Unauthorized" };
    }

    const rows = await db.query.conversations.findMany({
      where: eq(conversationsTable.userId, session.user.id),
      orderBy: [desc(conversationsTable.updatedAt)],
    });

    const conversations = rows.map((r) => ({
      id: r.id,
      title: r.title,
      messages: (r.messages ?? []) as Message[],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return { ok: true, conversations };
  } catch (error: any) {
    console.error("Failed to load conversations:", error);
    return { ok: false, error: error.message || "Failed to load conversations" };
  }
}

export async function createConversationAction(title: string): Promise<{
  ok: boolean;
  conversation?: Conversation;
  error?: string;
}> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: "Unauthorized" };
    }

    const [row] = await db
      .insert(conversationsTable)
      .values({
        id: crypto.randomUUID(),
        title,
        userId: session.user.id,
        messages: [],
      })
      .returning();

    const conversation: Conversation = {
      id: row.id,
      title: row.title,
      messages: (row.messages ?? []) as Message[],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };

    return { ok: true, conversation };
  } catch (error: any) {
    console.error("Failed to create conversation:", error);
    return { ok: false, error: error.message || "Failed to create conversation" };
  }
}

export async function updateConversationAction(
  id: string,
  updates: { title?: string; messages?: Message[] }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: "Unauthorized" };
    }

    const valuesToSet: any = {
      updatedAt: new Date(),
    };
    if (updates.title !== undefined) {
      valuesToSet.title = updates.title;
    }
    if (updates.messages !== undefined) {
      valuesToSet.messages = updates.messages;
    }

    await db
      .update(conversationsTable)
      .set(valuesToSet)
      .where(
        and(
          eq(conversationsTable.id, id),
          eq(conversationsTable.userId, session.user.id)
        )
      );

    return { ok: true };
  } catch (error: any) {
    console.error("Failed to update conversation:", error);
    return { ok: false, error: error.message || "Failed to update conversation" };
  }
}

export async function deleteConversationAction(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { ok: false, error: "Unauthorized" };
    }

    await db
      .delete(conversationsTable)
      .where(
        and(
          eq(conversationsTable.id, id),
          eq(conversationsTable.userId, session.user.id)
        )
      );

    return { ok: true };
  } catch (error: any) {
    console.error("Failed to delete conversation:", error);
    return { ok: false, error: error.message || "Failed to delete conversation" };
  }
}
