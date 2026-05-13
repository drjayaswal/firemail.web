# fathom²ail

A production-oriented Next.js dashboard for Gmail: read-only OAuth, browser caching, optional encrypted cloud backup, and a motion-first UI built with Tailwind CSS v4 and Framer Motion.

---

## Overview

| Capability | Description |
|------------|-------------|
| **Inbox** | Fetches a bounded set of messages via the Gmail API after explicit user action. |
| **Cache** | Persists the last successful result in `localStorage` per signed-in email. |
| **Cloud sync** | Optionally writes AES-256-GCM–encrypted message payloads to Postgres (`encrypted_mail`). |
| **Voice** | Client-side speech-to-text for search input (browser APIs). |

Legal and security disclosure for end users: **[Privacy & security](/policy)** · **[Terms of use](/terms)** · Dedicated route: **`/notfound`**. Unmatched URLs render the global **404** UI from [`src/app/not-found.tsx`](src/app/not-found.tsx).

---

## Architecture

- **App Router** (Next.js 16): server actions for Gmail fetch and vault sync, API route for NextAuth.
- **Auth**: NextAuth.js with Google provider (`gmail.readonly` scope). Session carries short-lived access context; sign-in flow can upsert a minimal `user` row for foreign keys used by the vault.
- **Data**: Drizzle ORM + Postgres (e.g. Neon). Schema lives in [`src/app/db/schema.ts`](src/app/db/schema.ts).
- **Crypto**: [`src/lib/mail-crypto.ts`](src/lib/mail-crypto.ts) — AES-256-GCM over JSON payloads; key material from `MAIL_ENCRYPTION_KEY` or `AUTH_SECRET` (see policy page for limits).

---

## Environment

Create `.env.local` (values are examples; use strong secrets in production):

```env
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
DATABASE_URL=
MAIL_ENCRYPTION_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

| Variable | Role |
|----------|------|
| `AUTH_SECRET` | NextAuth signing / fallback key derivation. |
| `AUTH_GOOGLE_*` | Google OAuth client. |
| `DATABASE_URL` | Postgres connection for Drizzle. |
| `MAIL_ENCRYPTION_KEY` | Preferred dedicated secret for vault encryption. |
| `NEXT_PUBLIC_API_URL` | Optional external API base for client-side mail mutations. |

---

## Local development

**Requirements:** Node.js 20+ (or Bun).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run lint
```

---

## Database

Push schema to your database before using cloud sync:

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

Tables include `user` and `encrypted_mail` (see Drizzle schema). Apply migrations in CI/CD for production.

---

## Product behavior (concise)

1. **Load:** Reads cache from `localStorage` if present; does not call Gmail on first paint.
2. **Fetch:** User confirms **cached** vs **live Gmail**; live path runs a server action, then refreshes cache.
3. **Sync:** Server loads mail from Gmail again, encrypts, and upserts into `encrypted_mail` (avoids shipping large bodies through server-action arguments).

---

## Repository layout (partial)

| Path | Purpose |
|------|---------|
| `src/app/page.tsx` | Landing / auth gate and main dashboard entry. |
| `src/components/Home.tsx` | Client shell: cache, fetch dialog, table, sync. |
| `src/lib/action.ts` | Gmail API integration. |
| `src/app/actions.ts` | Server actions: fetch, encrypted sync. |
| `src/app/terms`, `src/app/policy`, `src/app/notfound` | Legal and utility pages. |
| `src/app/not-found.tsx` | Global 404 UI. |

---

## Design tokens

Primary palette is documented in [`src/app/globals.css`](src/app/globals.css): black background, white foreground, accent `#d7df23`, muted zinc secondary text.

---

## Contributing & standards

See [`INSTRUCTIONS.md`](INSTRUCTIONS.md) for TypeScript, Tailwind v4, and motion conventions. See [`SKILLS.md`](SKILLS.md) for product design notes.

---

## License

Rights are reserved by the project copyright holder unless a `LICENSE` file in the repository states otherwise.
