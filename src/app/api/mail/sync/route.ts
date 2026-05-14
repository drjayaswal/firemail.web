import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMails } from "@/lib/action";
import { encryptJsonPayload } from "@/lib/mail-crypto";
import { ensureUserRowFromSession } from "@/app/api/_db/user";
import { upsertEncryptedMailsForUser } from "@/app/api/_db/encrypted-mail";

export type MailSyncResponse =
  | { ok: true; count: number }
  | { ok: false; error: string };

export async function POST(): Promise<NextResponse<MailSyncResponse>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const ensured = await ensureUserRowFromSession(session);
  if (!ensured) {
    return NextResponse.json(
      { ok: false, error: "Missing user id or email for vault" },
      { status: 400 },
    );
  }

  let mails;
  try {
    mails = await getMails();
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load mail from Gmail" }, { status: 502 });
  }

  if (mails.length === 0) {
    return NextResponse.json({ ok: false, error: "No mails to sync" }, { status: 400 });
  }

  try {
    await upsertEncryptedMailsForUser(userId, mails, encryptJsonPayload);
    return NextResponse.json({ ok: true, count: mails.length });
  } catch (e) {
    console.error("mail sync error:", e);
    return NextResponse.json({ ok: false, error: "Sync failed" }, { status: 500 });
  }
}
