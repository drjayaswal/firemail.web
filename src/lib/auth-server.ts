import { eq, and } from "drizzle-orm";
import { db } from "@/app/db";
import { authAccount, authUser } from "@/app/db/auth-schema";
import { upsertOAuthUserFromCredentials } from "@/app/api/_db/user";
import type { Account } from "better-auth";

export type AppSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  accessToken?: string;
  error?: string;
};

export async function syncAppUserFromAuthAccount(
  account: Pick<
    Account,
    | "userId"
    | "providerId"
    | "accountId"
    | "accessToken"
    | "refreshToken"
    | "accessTokenExpiresAt"
    | "scope"
    | "idToken"
  >,
): Promise<void> {
  if (account.providerId !== "google") return;

  const [authUserRow] = await db
    .select({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      image: authUser.image,
    })
    .from(authUser)
    .where(eq(authUser.id, account.userId))
    .limit(1);

  if (!authUserRow?.email) return;

  const expiresAt =
    account.accessTokenExpiresAt != null
      ? Math.floor(account.accessTokenExpiresAt.getTime() / 1000)
      : null;

  try {
    await upsertOAuthUserFromCredentials({
      userId: authUserRow.id,
      email: authUserRow.email,
      name: authUserRow.name,
      image: authUserRow.image,
      oauthAccount: {
        providerAccountId: account.accountId,
        provider: account.providerId,
        access_token: account.accessToken,
        refresh_token: account.refreshToken,
        expires_at: expiresAt,
        scope: account.scope,
        id_token: account.idToken,
      },
    });
  } catch {
    // keep auth flow resilient if app user sync fails
  }
}

async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  accessToken?: string;
  expiresAt?: Date;
  error?: string;
}> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const tokens: { access_token?: string; expires_in?: number; error?: string } =
      await response.json();
    if (!response.ok) throw tokens;

    const expiresAt = new Date(Date.now() + (tokens.expires_in ?? 3600) * 1000);
    return { accessToken: tokens.access_token, expiresAt };
  } catch {
    return { error: "RefreshAccessTokenError" };
  }
}

export async function resolveGoogleAccessToken(userId: string): Promise<{
  accessToken?: string;
  error?: string;
}> {
  const [account] = await db
    .select()
    .from(authAccount)
    .where(and(eq(authAccount.userId, userId), eq(authAccount.providerId, "google")))
    .limit(1);

  if (!account) {
    return { error: "NoGoogleAccount" };
  }

  const expiresAt = account.accessTokenExpiresAt?.getTime() ?? 0;
  const stillValid = account.accessToken && expiresAt > Date.now() + 60_000;

  if (stillValid) {
    return { accessToken: account.accessToken! };
  }

  if (!account.refreshToken) {
    return account.accessToken
      ? { accessToken: account.accessToken }
      : { error: "RefreshAccessTokenError" };
  }

  const refreshed = await refreshGoogleAccessToken(account.refreshToken);
  if (!refreshed.accessToken) {
    return { error: refreshed.error ?? "RefreshAccessTokenError" };
  }

  await db
    .update(authAccount)
    .set({
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: refreshed.expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(authAccount.id, account.id));

  await syncAppUserFromAuthAccount({
    ...account,
    accessToken: refreshed.accessToken,
    accessTokenExpiresAt: refreshed.expiresAt ?? account.accessTokenExpiresAt,
  });

  return { accessToken: refreshed.accessToken };
}
