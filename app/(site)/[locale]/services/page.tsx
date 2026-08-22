import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { PageHeader } from "@/components/site/PageHeader";
import { ServicesPageContent } from "@/components/site/ServicesPageContent";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);
  return {
    title: dict.meta.servicesTitle,
    description: dict.meta.servicesDescription,
    alternates: { canonical: `/${locale}/services` },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        eyebrow={dict.services.label}
        title={dict.services.title}
        subtitle={dict.services.subtitle}
      />
      <ServicesPageContent locale={locale} dict={dict} settings={settings} />
    </>
  );
}
