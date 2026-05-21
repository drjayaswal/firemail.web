import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/app/db';
import { categories } from '@/app/db/schema';
import { requireAdminSession } from '@/lib/admin-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Category id is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ ok: false, error: 'Category name is required' }, { status: 400 });
    }

    const [updated] = await db
      .update(categories)
      .set({
        name: name.trim(),
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
      })
      .where(eq(categories.id, id))
      .returning({
        id: categories.id,
        name: categories.name,
        description: categories.description,
      });

    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, category: updated });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === '23505') {
      return NextResponse.json({ ok: false, error: 'A category with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const admin = await requireAdminSession();
  if (!admin.ok) {
    return NextResponse.json({ ok: false, error: admin.error }, { status: admin.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Category id is required' }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to delete category' }, { status: 500 });
  }
}
