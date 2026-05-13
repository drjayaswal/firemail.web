import NextAuth from "next-auth";
import type { DefaultSession, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Account, User } from "next-auth";
import Google from "next-auth/providers/google";
import { syncOAuthUserToDatabase } from "@/lib/oauthDbSync";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user: DefaultSession["user"] & { id?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    expiresAt?: number;
    refreshToken?: string;
    error?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: Account | null }) {
      if (account) {
        const userId = user?.id ?? token.sub;
        const email =
          user?.email ??
          (typeof token.email === "string" ? token.email : undefined);
        if (userId && email) {
          try {
            await syncOAuthUserToDatabase({
              userId,
              email,
              name: user?.name,
              image: user?.image,
              oauthAccount: {
                providerAccountId: account.providerAccountId,
                provider: account.provider,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          } catch {
          }
        }
        return {
          ...token,
          accessToken: account.access_token,
          expiresAt: Math.floor(Date.now() / 1000 + (account.expires_in ?? 3600)),
          refreshToken: account.refresh_token ?? token.refreshToken,
        };
      }
      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token;
      }
      if (!token.refreshToken) {
        return token;
      }
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken as string,
          }),
        });

        const tokens: { access_token?: string; expires_in?: number } =
          await response.json();
        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          expiresAt: Math.floor(Date.now() / 1000 + (tokens.expires_in ?? 3600)),
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
