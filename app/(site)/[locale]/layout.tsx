import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "@/app/globals.css";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { LOCALES } from "@/lib/types";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ScrollProgress } from "@/components/site/ScrollProgress";

// Переменное начертание: подключаем без перечисления весов, чтобы были
// доступны промежуточные значения (250, 275) — на них держатся заголовки.
// Файл подгружает сам Next, обращений к Google из браузера не происходит.
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const dict = getDictionary(locale);
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: `${settings.siteName} — ${dict.meta.homeTitle}`,
      template: `%s — ${settings.siteName}`,
    },
    description: dict.meta.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((item) => [item, `/${item}`])),
    },
    openGraph: {
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      siteName: settings.siteName,
      title: `${settings.siteName} — ${dict.meta.homeTitle}`,
      description: dict.meta.homeDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const dict = getDictionary(typedLocale);
  const settings = await getSettings();

  return (
    <html lang={typedLocale} className={inter.variable}>
      <body className="bg-ink text-sand antialiased">
        <SmoothScroll>
          <ScrollProgress />
          <CustomCursor />
          <Header locale={typedLocale} dict={dict} siteName={settings.siteName} />
          <main id="main">{children}</main>
          <Footer locale={typedLocale} dict={dict} settings={settings} />
        </SmoothScroll>
      </body>
    </html>
  );
}
