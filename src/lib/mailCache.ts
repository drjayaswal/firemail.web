import type { Mail } from "@/types";

export function mailsCacheKey(email: string | null | undefined): string | null {
  if (!email) return null;
  return `fathommail:mails:${email}`;
}

export function readMailsFromCache(email: string | null | undefined): Mail[] {
  if (typeof window === "undefined") return [];
  const key = mailsCacheKey(email);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Mail[];
  } catch {
    return [];
  }
}

export function writeMailsToCache(email: string | null | undefined, mails: Mail[]): void {
  if (typeof window === "undefined") return;
  const key = mailsCacheKey(email);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(mails));
  } catch {
    return;
  }
}
