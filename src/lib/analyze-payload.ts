import type { AnalyzeRunPayload, Mail } from '@/types';

export function buildAnalyzePayload(
  mails: Mail[],
  options: AnalyzeRunPayload['options'],
): AnalyzeRunPayload {
  return { mails, options };
}

export function mergeAnalyzedMails(current: Mail[], incoming: Mail[]): Mail[] {
  const map = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) map.set(m.id, { ...map.get(m.id), ...m });
  return [...map.values()];
}
