import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { PageHeader } from "@/components/site/PageHeader";
import { ContactSection } from "@/components/site/ContactSection";

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
    title: dict.meta.contactsTitle,
    description: dict.meta.contactsDescription,
    alternates: { canonical: `/${locale}/contacts` },
  };
}

export default async function ContactsPage({
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
        eyebrow={dict.contacts.label}
        title={dict.contacts.title}
        subtitle={dict.contacts.subtitle}
      />
      <ContactSection locale={locale} dict={dict} settings={settings} showHeading={false} />
    </>
  );
}
