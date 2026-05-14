/** DB `encrypted_mail.priority`: `decimal(10,4)` as string (e.g. `"0.0000"`). */
export const DEFAULT_MAIL_PRIORITY = "0.0000";

export function parseMailPriority(value: string | undefined | null): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMailPriorityDisplay(value: string | undefined | null): string {
  return value != null && value !== "" ? value : DEFAULT_MAIL_PRIORITY;
}
