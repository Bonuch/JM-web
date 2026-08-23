import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getDictionary, isLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { LOCALES } from "@/lib/types";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

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

/**
 * Сегмент языка. Каркас сайта (шапка, подвал, прокрутка, заставка) поднят в
 * (site)/layout — при смене языка он остаётся смонтированным, и меняется
 * только то, что отдаёт этот сегмент.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      {/* Корневой layout про язык не знает и ставит в <html lang> значение по
          умолчанию. Правим его здесь, до отрисовки содержимого страницы. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)}`,
        }}
      />
      {children}
    </>
  );
}
