import "server-only";
import { decryptJson, encryptJson } from "./crypto";
import { getStorage } from "./storage";
import type { Lead } from "./types";

const LEADS_PATH = "content/leads.enc";
const MAX_STORED_LEADS = 500;

async function readLeads(): Promise<Lead[]> {
  const bytes = await getStorage().readBytes(LEADS_PATH);
  if (!bytes) return [];
  const leads = decryptJson<Lead[]>(bytes);
  return Array.isArray(leads) ? leads : [];
}

async function writeLeads(leads: Lead[]): Promise<void> {
  const trimmed = leads.slice(0, MAX_STORED_LEADS);
  await getStorage().writeBytes(LEADS_PATH, encryptJson(trimmed), "application/octet-stream");
}

export async function getLeads(): Promise<Lead[]> {
  const leads = await readLeads();
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getUnreadLeadCount(): Promise<number> {
  const leads = await readLeads();
  return leads.filter((lead) => !lead.read).length;
}

export async function saveLead(lead: Lead): Promise<void> {
  const leads = await readLeads();
  await writeLeads([lead, ...leads]);
}

export async function markLeadRead(id: string, read: boolean): Promise<void> {
  const leads = await readLeads();
  await writeLeads(leads.map((lead) => (lead.id === id ? { ...lead, read } : lead)));
}

export async function deleteLead(id: string): Promise<void> {
  const leads = await readLeads();
  await writeLeads(leads.filter((lead) => lead.id !== id));
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Отправка уведомления в Telegram. Ошибка здесь не должна ломать отправку
 * формы — заявка в любом случае остаётся в зашифрованном хранилище.
 */
export async function notifyTelegram(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatLeadMessage(lead: Lead): string {
  const lines = [
    "<b>Новая заявка с сайта</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Контакт:</b> ${escapeHtml(lead.contact)}`,
  ];
  if (lead.topic) lines.push(`<b>Услуга:</b> ${escapeHtml(lead.topic)}`);
  if (lead.message) lines.push("", escapeHtml(lead.message));
  lines.push("", `<i>Страница: ${escapeHtml(lead.source)} · ${lead.locale.toUpperCase()}</i>`);
  return lines.join("\n");
}
