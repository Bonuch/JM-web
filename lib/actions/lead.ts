"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { formatLeadMessage, notifyTelegram, saveLead } from "@/lib/leads";
import { isLocale, type Lead, type Locale } from "@/lib/types";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  /** Ключи полей с ошибками — форма подсвечивает их локализованным текстом */
  fieldErrors?: Partial<Record<"name" | "contact" | "message", true>>;
};

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(160),
  message: z.string().trim().max(4000).optional().default(""),
  topic: z.string().trim().max(160).optional().default(""),
  source: z.string().trim().max(300).optional().default(""),
  locale: z.string().trim().max(5).optional().default("ru"),
  // honeypot: настоящий человек это поле не видит и не заполняет
  company: z.string().max(0).optional().default(""),
});

/**
 * Простое ограничение частоты в памяти процесса. На serverless это не даёт
 * стопроцентной защиты между инстансами, но отсекает самый частый случай —
 * скрипт, который долбит форму с одного адреса.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((at) => now - at < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    attempts.set(key, recent);
    return true;
  }
  recent.push(now);
  attempts.set(key, recent);
  return false;
}

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    contact: formData.get("contact") ?? "",
    message: formData.get("message") ?? "",
    topic: formData.get("topic") ?? "",
    source: formData.get("source") ?? "",
    locale: formData.get("locale") ?? "ru",
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: LeadFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "contact" || field === "message") {
        fieldErrors[field] = true;
      }
      // сработавший honeypot притворяемся успешной отправкой
      if (field === "company") return { status: "success" };
    }
    return { status: "error", fieldErrors };
  }

  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return { status: "error" };
  }

  const locale: Locale = isLocale(parsed.data.locale) ? parsed.data.locale : "ru";

  const lead: Lead = {
    id: crypto.randomUUID(),
    name: parsed.data.name,
    contact: parsed.data.contact,
    message: parsed.data.message,
    topic: parsed.data.topic,
    source: parsed.data.source || "/",
    locale,
    read: false,
    createdAt: new Date().toISOString(),
  };

  // Заявка не должна потеряться, даже если один из каналов недоступен,
  // поэтому сохранение и уведомление идут независимо друг от друга.
  const results = await Promise.allSettled([
    saveLead(lead),
    notifyTelegram(formatLeadMessage(lead)),
  ]);

  const stored = results[0].status === "fulfilled";
  const notified = results[1].status === "fulfilled" && results[1].value === true;

  if (!stored && !notified) {
    console.error("Не удалось ни сохранить, ни отправить заявку", results);
    return { status: "error" };
  }

  return { status: "success" };
}
