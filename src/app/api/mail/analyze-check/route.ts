import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCustomMails } from "@/lib/action";
import { ensureUserRowFromSession } from "@/app/api/_db/user";
import {
  getCategoriesAndPriorityByGmailIds,
  getExistingGmailMessageIdsForUser,
} from "@/app/api/_db/encrypted-mail";
import type { AnalyzeOptions, Mail } from "@/types";
import { DEFAULT_MAIL_PRIORITY } from "@/lib/mail-priority";

export type AnalyzeCheckResponse =
  | { ok: true; existingInDb: Mail[]; missingInDb: Mail[] }
  | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<AnalyzeCheckResponse>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let options: AnalyzeOptions;
  try {
    options = (await req.json()) as AnalyzeOptions;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const ensured = await ensureUserRowFromSession(session);
  if (!ensured) {
    return NextResponse.json(
      { ok: false, error: "Missing user id or email for vault" },
      { status: 400 },
    );
  }

  let mails: Mail[];
  try {
    mails = await getCustomMails(options);
  } catch {
    return NextResponse.json({ ok: false, error: "Could not load mail from Gmail" }, { status: 502 });
  }

  if (mails.length === 0) {
    return NextResponse.json({ ok: true, existingInDb: [], missingInDb: [] });
  }

  try {
    const gmailIds = mails.map((m) => m.id);
    const existingIdsSet = await getExistingGmailMessageIdsForUser(userId, gmailIds);

    const existingInDb: Mail[] = [];
    const missingInDb: Mail[] = [];
    for (const m of mails) {
      if (existingIdsSet.has(m.id)) existingInDb.push(m);
      else missingInDb.push(m);
    }

    const metaByGmailId = await getCategoriesAndPriorityByGmailIds(
      userId,
      existingInDb.map((m) => m.id),
    );
    const existingInDbWithStoreFields: Mail[] = existingInDb.map((m) => {
      const meta = metaByGmailId.get(m.id);
      return {
        ...m,
        categories: meta?.categories ?? null,
        priority: meta?.priority ?? DEFAULT_MAIL_PRIORITY,
      };
    });

    return NextResponse.json({ ok: true, existingInDb: existingInDbWithStoreFields, missingInDb });
  } catch (e) {
    console.error("analyze-check db error:", e);
    return NextResponse.json({ ok: false, error: "Sync failed during database check" }, { status: 500 });
  }
}
