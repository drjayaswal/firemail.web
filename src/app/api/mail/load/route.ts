import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDatabaseMails } from '@/lib/action';
import type { LoadOptions, Mail } from '@/types';

export type DatabaseMailFetchResponse = { ok: true; mails: Mail[] } | { ok: false; error: string };

export async function POST(req: Request): Promise<NextResponse<DatabaseMailFetchResponse>> {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  let options: LoadOptions;
  try {
    options = (await req.json()) as LoadOptions;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    const mails = await getDatabaseMails({ ...options });
    return NextResponse.json({ ok: true, mails });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not load mail from Gmail' }, { status: 502 });
  }
}
