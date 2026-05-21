import { NextResponse } from 'next/server';
import { db } from '@/app/db';
import { categories } from '@/app/db/schema';
import { requireAdminSession } from '@/lib/admin-auth';

export type AdminCategory = {
  id: string;
  name: string;
  description: string | null;
};

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  try {
    const rows = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      })
      .from(categories);

    return NextResponse.json({ ok: true, categories: rows });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ ok: false, error: 'Category name is required' }, { status: 400 });
    }

    const [created] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      });

    return NextResponse.json({ ok: true, category: created });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === '23505') {
      return NextResponse.json({ ok: false, error: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'Failed to create category' }, { status: 500 });
  }
}
