import { auth } from '@/lib/auth';

export function isAdminEmail(email: string | null | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return Boolean(adminEmail && email && email === adminEmail);
}

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.accessToken) {
    return { ok: false as const, status: 401, error: 'Unauthorized' };
  }
  if (!isAdminEmail(session.user?.email)) {
    return { ok: false as const, status: 403, error: 'Forbidden' };
  }
  return { ok: true as const, session };
}
