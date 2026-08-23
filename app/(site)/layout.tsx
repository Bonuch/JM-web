import type { Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";

import { DEFAULT_LOCALE } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { SiteShell } from "@/components/site/SiteShell";
import { SiteAnalytics } from "@/components/site/Analytics";

// Переменное начертание: подключаем без перечисления весов, чтобы были
// доступны промежуточные значения (250, 275) — на них держатся заголовки.
// Файл подгружает сам Next, обращений к Google из браузера не происходит.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

/**
 * Корневой layout сайта. Он намеренно ничего не знает про язык: сегмент
 * [locale] лежит ниже, и всё смонтированное здесь переживает его смену.
 *
 * Плата за это — lang в исходном HTML: параметра здесь нет, а читать его из
 * заголовков запроса нельзя, иначе весь сайт уедет из статики в рендер на
 * каждый запрос. Поэтому в разметке стоит язык по умолчанию, а фактический
 * проставляет [locale]/layout сразу при разборе документа.
 *
 * Отсюда и suppressHydrationWarning на <html>: к моменту гидратации lang уже
 * не тот, что пришёл с сервера, и React считает это ошибкой на каждой
 * странице, кроме русской. Подавление действует только на атрибуты самого
 * <html> — расхождения внутри дерева по-прежнему видны.
 */
export default async function SiteRootLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang={DEFAULT_LOCALE} className={inter.variable} suppressHydrationWarning>
      <body className="bg-ink text-sand antialiased">
        <SiteShell settings={settings}>{children}</SiteShell>
        <SiteAnalytics />
      </body>
    </html>
  );
}
