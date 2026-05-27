import { eq, and, count, sql } from "drizzle-orm";
import { db } from "@/app/db";
import { user, encryptedMail, account, session, conversations } from "@/app/db/schema";

export type Session = {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
};

export type ConversationSummary = {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConv: number;
};

export type ConversationAnalytics = {
  userCount: number;
  assistantCount: number;
  thinkingUsageCount: number;
  thinkingUsagePct: number;        // % of assistant msgs that used thinking
  avgUserMsgLength: number;        // chars
  avgAssistantMsgLength: number;   // chars
  avgThinkingLength: number;       // chars, 0 if never used
  avgResponseLatencySeconds: number;
};

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
  sessions: Session[];
  conversations: ConversationSummary;
  conversationAnalytics: ConversationAnalytics | null;
};

export async function getConversationAnalytics(
  userId: string
): Promise<ConversationAnalytics | null> {
  // ── 1. Per-role counts + avg lengths ──────────────────────────────────────
  const countsResult = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE m->>'role' = 'user')                              AS user_count,
      COUNT(*) FILTER (WHERE m->>'role' = 'assistant')                         AS assistant_count,
      COUNT(*) FILTER (
        WHERE m->>'role' = 'assistant'
          AND m->>'thinking' IS NOT NULL
          AND m->>'thinking' <> ''
      )                                                                         AS thinking_usage_count,
      COALESCE(
        AVG(CASE WHEN m->>'role' = 'user'
            THEN length(m->>'content') END), 0
      )                                                                         AS avg_user_msg_length,
      COALESCE(
        AVG(CASE WHEN m->>'role' = 'assistant'
            THEN length(m->>'content') END), 0
      )                                                                         AS avg_assistant_msg_length,
      COALESCE(
        AVG(CASE
          WHEN m->>'thinking' IS NOT NULL AND m->>'thinking' <> ''
          THEN length(m->>'thinking')
        END), 0
      )                                                                         AS avg_thinking_length
    FROM conversations,
         jsonb_array_elements(conversations.messages) AS m
    WHERE conversations."userId" = ${userId}
  `);

  // ── 2. Avg response latency: each user msg → immediately-following asst msg
  //    Uses WITH ORDINALITY to track position, then joins pos+1.
  const latencyResult = await db.execute(sql`
    WITH positioned AS (
      SELECT
        c.id                                       AS conv_id,
        (m.value->>'role')                         AS role,
        (m.value->>'createdAt')::timestamptz       AS created_at,
        m.ordinality                               AS pos
      FROM conversations c,
           jsonb_array_elements(c.messages) WITH ORDINALITY AS m(value, ordinality)
      WHERE c."userId" = ${userId}
    ),
    pairs AS (
      SELECT
        asst.created_at - usr.created_at           AS latency
      FROM positioned usr
      JOIN positioned asst
        ON  asst.conv_id   = usr.conv_id
        AND asst.pos       = usr.pos + 1
        AND usr.role       = 'user'
        AND asst.role      = 'assistant'
      WHERE asst.created_at > usr.created_at  -- sanity guard
    )
    SELECT COALESCE(AVG(EXTRACT(EPOCH FROM latency)), 0) AS avg_latency_seconds
    FROM pairs
  `);

  const c = countsResult.rows[0];
  const l = latencyResult.rows[0];

  if (!c) return null;

  const assistantCount = Number(c.assistant_count ?? 0);
  const thinkingCount = Number(c.thinking_usage_count ?? 0);

  return {
    userCount: Number(c.user_count ?? 0),
    assistantCount,
    thinkingUsageCount: thinkingCount,
    thinkingUsagePct: assistantCount > 0
      ? Math.round((thinkingCount / assistantCount) * 100)
      : 0,
    avgUserMsgLength: Math.round(Number(c.avg_user_msg_length ?? 0)),
    avgAssistantMsgLength: Math.round(Number(c.avg_assistant_msg_length ?? 0)),
    avgThinkingLength: Math.round(Number(c.avg_thinking_length ?? 0)),
    avgResponseLatencySeconds: Math.round(Number(l?.avg_latency_seconds ?? 0) * 10) / 10,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const [authRow, appRow, googleAccount, sessions, convStats, analytics] =
    await Promise.all([
      db.select().from(user).where(eq(user.id, userId)).limit(1),
      db
        .select({
          createdAt: user.createdAt,
          totalEncryptedMails: count(encryptedMail.id),
        })
        .from(user)
        .leftJoin(encryptedMail, eq(user.id, encryptedMail.userId))
        .where(eq(user.id, userId))
        .groupBy(user.id, user.createdAt),
      db
        .select()
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.providerId, "google"))),
      db.select().from(session).where(eq(session.userId, userId)),
      db
        .select({
          totalConversations: count(conversations.id),
          totalMessages: sql<number>`sum(jsonb_array_length(messages))`,
        })
        .from(conversations)
        .where(eq(conversations.userId, userId)),
      getConversationAnalytics(userId),
    ]);

  if (!authRow[0]) return null;

  const totalConvs = Number(convStats[0]?.totalConversations ?? 0);
  const totalMsgs = Number(convStats[0]?.totalMessages ?? 0);

  return {
    id: authRow[0].id,
    name: authRow[0].name,
    email: authRow[0].email,
    image: authRow[0].image,
    emailVerified: authRow[0].emailVerified,
    authCreatedAt: authRow[0].createdAt.toISOString(),
    appCreatedAt: appRow[0]?.createdAt?.toISOString() ?? null,
    totalEncryptedMails: Number(appRow[0]?.totalEncryptedMails ?? 0),
    provider: googleAccount[0]?.providerId ?? null,
    providerAccountId: googleAccount[0]?.accountId ?? null,
    scopes: googleAccount[0]?.scope ?? null,
    providerLinkedAt: googleAccount[0]?.createdAt?.toISOString() ?? null,
    conversationAnalytics: analytics,
    conversations: {
      totalConversations: totalConvs,
      totalMessages: totalMsgs,
      avgMessagesPerConv: totalConvs > 0 ? totalMsgs / totalConvs : 0,
    },
    sessions: sessions.map(({ token, ...rest }) => ({
      ...rest,
      expiresAt: rest.expiresAt.toISOString(),
      createdAt: rest.createdAt.toISOString(),
      updatedAt: rest.updatedAt.toISOString(),
    })),
  };
}