export const DEFAULT_MAIL_PRIORITY = "0.0000";

export function parseMailPriority(value: string | undefined | null): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMailPriorityDisplay(value: string | undefined | null): string {
  return value != null && value !== "" ? value : DEFAULT_MAIL_PRIORITY;
}
