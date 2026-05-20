import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCategories } from '@/lib/action';

export type CategoryFetchResponse = { ok: true; categories: { name: string }[] } | { ok: false; error: string };

export async function POST(): Promise<NextResponse<CategoryFetchResponse>> {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const categories = await getCategories();
    return NextResponse.json({ ok: true, categories });
  } catch {
    return NextResponse.json({ ok: false, error: 'Could not load mail from Gmail' }, { status: 502 });
  }
}
