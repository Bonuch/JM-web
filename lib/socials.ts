import type { Settings } from "./types";

/** Соцсети выводим только те, что реально заполнены в админке. */
export function socialLinks(settings: Settings): { label: string; href: string }[] {
  return [
    { label: "Behance", href: settings.behance },
    { label: "Telegram", href: settings.telegram },
    { label: "WhatsApp", href: settings.whatsapp },
    { label: "Instagram", href: settings.instagram },
    { label: "Pinterest", href: settings.pinterest },
  ].filter((item) => item.href.trim().length > 0);
}
