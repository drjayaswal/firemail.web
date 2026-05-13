import type { Session } from "next-auth";
import { db } from "@/app/db";
import { user } from "@/app/db/schema";

type OAuthAccountInput = {
  providerAccountId: string;
  provider: string;
  access_token?: string | null;
  refresh_token?: string | null;
  expires_at?: number | null;
  scope?: string | null;
  id_token?: string | null;
};

function stableAccessToken(userId: string, token: string | null | undefined): string {
  const t = token?.trim();
  if (t) return t;
  return `oauth:${userId}`;
}

export async function ensureUserRowFromSession(session: Session | null): Promise<boolean> {
  const userId = session?.user?.id;
  const email = session?.user?.email;
  if (!userId || !email) return false;
  const accessToken = stableAccessToken(userId, session.accessToken ?? null);
  const now = new Date();
  await db
    .insert(user)
    .values({
      id: userId,
      email,
      accessToken,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: user.id,
      set: {
        email,
        accessToken,
      },
    });
  return true;
}

export async function syncOAuthUserToDatabase(opts: {
  userId: string;
  email: string;
  name: string | null | undefined;
  image: string | null | undefined;
  oauthAccount: OAuthAccountInput;
}): Promise<void> {
  const now = new Date();
  const { userId, email, oauthAccount: acc } = opts;
  const accessToken = stableAccessToken(userId, acc.access_token ?? null);
  await db
    .insert(user)
    .values({
      id: userId,
      email,
      accessToken,
      createdAt: now,
    })
    .onConflictDoUpdate({
      target: user.id,
      set: {
        email,
        accessToken,
      },
    });
}
