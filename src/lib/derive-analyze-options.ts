import type { AnalyzeOptions, Mail } from '@/types';

export function deriveAnalyzeOptionsFromMails(mails: Mail[], store: boolean): AnalyzeOptions {
  if (mails.length === 0) {
    return { unread: false, days: 0, count: 0, important: false, starred: false, store };
  }
  const now = Date.now();
  let oldest = now;
  let important = false;
  let starred = false;
  let unreadCount = 0;
  let readCount = 0;
  for (const m of mails) {
    const ts = new Date(m.createdAt).getTime();
    if (!Number.isNaN(ts) && ts < oldest) oldest = ts;
    if (m.status === 'unread') unreadCount++;
    else readCount++;
    if (m.labels.includes('IMPORTANT')) important = true;
    if (m.labels.includes('STARRED')) starred = true;
  }
  const unread = unreadCount > 0 && readCount === 0;
  const days = Math.max(1, Math.ceil((now - oldest) / 86_400_000));
  return { unread, days, count: mails.length, important, starred, store };
}
