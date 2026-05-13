import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatEmailContent = (rawContent: string): string => {
  if (!rawContent) return "";

  let processed = rawContent;

  processed = processed.replace(/<(script|style|title)[^>]*>[\s\S]*?<\/\1>/gi, "");

  processed = processed.replace(/<br\s*\/?>/gi, "\n");
  processed = processed.replace(/<(p|div|tr|h1|h2|h3)[^>]*>/gi, "\n");
  processed = processed.replace(/<[^>]+>/g, "");

  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  processed = processed.replace(urlRegex, (url) => `[LINK: ${url}]`);

  processed = processed
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return processed;
};