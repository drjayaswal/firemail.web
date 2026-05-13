"use server";

import { auth } from "@/lib/auth";
import { db } from "@/app/db";
import { encryptedMail } from "@/app/db/schema";
import { ensureUserRowFromSession } from "@/lib/oauthDbSync";
import { getGmailMails } from "@/lib/action";
import { encryptJsonPayload } from "@/lib/mail-crypto";
import type { Mail } from "@/types";

export async function fetchMailsAction(): Promise<Mail[]> {
  try {
    return await getGmailMails();
  } catch {
    return [];
  }
}

export async function syncEncryptedMailsToDb(): Promise<{
  ok: boolean;
  count?: number;
  error?: string;
}> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false, error: "Unauthorized" };
  }
  const ensured = await ensureUserRowFromSession(session);
  if (!ensured) {
    return { ok: false, error: "Missing user id or email for vault" };
  }
  let mails: Mail[];
  try {
    mails = await getGmailMails();
  } catch {
    return { ok: false, error: "Could not load mail from Gmail" };
  }
  if (mails.length === 0) {
    return { ok: false, error: "No mails to sync" };
  }
  try {
    const now = new Date();
    for (const m of mails) {
      const ciphertext = encryptJsonPayload(m);
      await db
        .insert(encryptedMail)
        .values({
          userId,
          gmailMessageId: m.id,
          ciphertext,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: [encryptedMail.userId, encryptedMail.gmailMessageId],
          set: {
            ciphertext,
            updatedAt: now,
          },
        });
    }
    return { ok: true, count: mails.length };
  } catch {
    return { ok: false, error: "Sync failed" };
  }
}
