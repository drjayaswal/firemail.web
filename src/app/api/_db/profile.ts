import { eq, and, count } from "drizzle-orm";
import { db } from "@/app/db";
import { user, encryptedMail } from "@/app/db/schema";
import { authUser, authAccount } from "@/app/db/auth-schema";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  authCreatedAt: string;
  appCreatedAt: string | null;
  totalEncryptedMails: number;
  provider: string | null;
  providerAccountId: string | null;
  scopes: string | null;
  providerLinkedAt: string | null;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [authRow] = await db
    .select({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      image: authUser.image,
      emailVerified: authUser.emailVerified,
      authCreatedAt: authUser.createdAt,
    })
    .from(authUser)
    .where(eq(authUser.id, userId))
    .limit(1);

  if (!authRow) return null;

  const [appRow] = await db
    .select({
      createdAt: user.createdAt,
      totalEncryptedMails: count(encryptedMail.id),
    })
    .from(user)
    .leftJoin(encryptedMail, eq(user.id, encryptedMail.userId))
    .where(eq(user.id, userId))
    .groupBy(user.id, user.createdAt)
    .limit(1);

  const [googleAccount] = await db
    .select({
      providerId: authAccount.providerId,
      accountId: authAccount.accountId,
      scope: authAccount.scope,
      createdAt: authAccount.createdAt,
    })
    .from(authAccount)
    .where(and(eq(authAccount.userId, userId), eq(authAccount.providerId, "google")))
    .limit(1);

  return {
    id: authRow.id,
    name: authRow.name,
    email: authRow.email,
    image: authRow.image,
    emailVerified: authRow.emailVerified,
    authCreatedAt: authRow.authCreatedAt.toISOString(),
    appCreatedAt: appRow?.createdAt?.toISOString() ?? null,
    totalEncryptedMails: Number(appRow?.totalEncryptedMails ?? 0),
    provider: googleAccount?.providerId ?? null,
    providerAccountId: googleAccount?.accountId ?? null,
    scopes: googleAccount?.scope ?? null,
    providerLinkedAt: googleAccount?.createdAt?.toISOString() ?? null,
  };
}
