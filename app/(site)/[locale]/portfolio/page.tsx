import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getPublishedProjects } from "@/lib/content";
import { PageHeader } from "@/components/site/PageHeader";
import { PortfolioBrowser } from "@/components/site/PortfolioBrowser";
import { ContactSection } from "@/components/site/ContactSection";
import { getSettings } from "@/lib/content";

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
    title: dict.meta.portfolioTitle,
    description: dict.meta.portfolioDescription,
    alternates: { canonical: `/${locale}/portfolio` },
  };
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const [projects, settings] = await Promise.all([getPublishedProjects(), getSettings()]);

  return (
    <>
      <PageHeader
        eyebrow={dict.portfolio.label}
        title={dict.portfolio.title}
        subtitle={dict.portfolio.subtitle}
      />

      <section className="container-page pb-section">
        <PortfolioBrowser projects={projects} locale={locale} dict={dict} />
      </section>

      <ContactSection locale={locale} dict={dict} settings={settings} />
    </>
  );
}
