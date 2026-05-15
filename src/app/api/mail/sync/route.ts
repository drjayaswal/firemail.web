import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { encryptJsonPayload } from '@/lib/mail-crypto';
import { ensureUserRowFromSession } from '@/app/api/_db/user';
import { upsertEncryptedMailsForUser } from '@/app/api/_db/encrypted-mail';
import type { Mail } from '@/types';

export type MailSyncResponse = { ok: true; count: number } | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<MailSyncResponse>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  const ensured = await ensureUserRowFromSession(session);
  if (!ensured) {
    return NextResponse.json({ ok: false, error: 'Missing user id or email' }, { status: 400 });
  }
  let mails: Mail[];
  try {
    const body = (await req.json()) as { mails?: Mail[] };
    mails = Array.isArray(body.mails) ? body.mails : [];
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  if (mails.length === 0) {
    return NextResponse.json({ ok: false, error: 'No mails selected' }, { status: 400 });
  }
  try {
    await upsertEncryptedMailsForUser(userId, mails, encryptJsonPayload);
    return NextResponse.json({ ok: true, count: mails.length });
  } catch {
    return NextResponse.json({ ok: false, error: 'Sync failed' }, { status: 500 });
  }
}
