"use server";

import { fetchInternalApi } from "@/lib/internal-api";
import { getMails } from "@/lib/action";
import type { AnalyzeOptions, Mail } from "@/types";

export async function fetchMailsAction(count:number): Promise<Mail[]> {
  try {
    return await getMails(count);
  } catch {
    return [];
  }
}

export async function syncEncryptedMailsToDb(count:number): Promise<{
  ok: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/sync", { method: "POST" },{
      count:count
    });
    const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Sync failed" };
    }
    if (data.ok === true && typeof data.count === "number") {
      return { ok: true, count: data.count };
    }
    return { ok: false, error: typeof data.error === "string" ? data.error : "Sync failed" };
  } catch {
    return { ok: false, error: "Sync failed" };
  }
}

export async function analyzeMailsAction(options: AnalyzeOptions): Promise<{
  ok: boolean;
  existingInDb?: Mail[];
  missingInDb?: Mail[];
  error?: string;
}> {
  try {
    const res = await fetchInternalApi("/api/mail/analyze-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      existingInDb?: Mail[];
      missingInDb?: Mail[];
      error?: string;
    };
    if (!res.ok) {
      return { ok: false, error: typeof data.error === "string" ? data.error : "Request failed" };
    }
    if (data.ok === true && Array.isArray(data.existingInDb) && Array.isArray(data.missingInDb)) {
      return { ok: true, existingInDb: data.existingInDb, missingInDb: data.missingInDb };
    }
    return { ok: false, error: typeof data.error === "string" ? data.error : "Request failed" };
  } catch (e) {
    console.error("analyzeMailsAction:", e);
    return { ok: false, error: "Sync failed during database check" };
  }
}
