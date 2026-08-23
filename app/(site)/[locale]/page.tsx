import { notFound } from "next/navigation";
import { getDictionary, isLocale, localePath, t } from "@/lib/i18n";
import { getFeaturedProjects, getPublishedProjects, getSettings } from "@/lib/content";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/motion/Marquee";
import { FeaturedScroller } from "@/components/site/FeaturedScroller";
import { StatsSection } from "@/components/site/StatsSection";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ContactSection } from "@/components/site/ContactSection";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";

// Контент правится в админке, поэтому страница пересобирается по расписанию
// и принудительно — сразу после сохранения (см. revalidatePath в действиях).
export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const [settings, featured, published] = await Promise.all([
    getSettings(),
    getFeaturedProjects(6),
    getPublishedProjects(),
  ]);

  const heroImage = settings.heroImage ?? featured[0]?.cover ?? null;

  const marqueeItems =
    locale === "ru"
      ? ["Квартиры", "Частные дома", "Коммерция", "Предметная съёмка", "3ds Max + Corona"]
      : ["Apartments", "Private houses", "Commercial", "Product shots", "3ds Max + Corona"];

  const topServices = [...settings.services].sort((a, b) => a.order - b.order).slice(0, 4);

  return (
    <>
      <Hero
        locale={locale}
        dict={dict}
        settings={settings}
        image={heroImage}
        projectCount={published.length}
      />

      <section className="border-y border-line py-10">
        <Marquee items={marqueeItems} />
      </section>

      {featured.length > 0 && (
        <section className="pt-section">
          <div className="container-page">
            <SectionHeading
              eyebrow={dict.featured.label}
              title={dict.featured.title}
              subtitle={dict.featured.subtitle}
              aside={
                <ButtonLink href={localePath(locale, "/portfolio")} variant="outline">
                  {dict.common.allProjects}
                </ButtonLink>
              }
            />
          </div>

          <div className="mt-16 lg:mt-0">
            <FeaturedScroller projects={featured} locale={locale} dict={dict} />
          </div>
        </section>
      )}

      <StatsSection stats={settings.stats} locale={locale} />

      <section className="container-page py-section">
        <SectionHeading
          eyebrow={dict.services.label}
          title={dict.services.title}
          subtitle={dict.services.subtitle}
          aside={
            <ButtonLink href={localePath(locale, "/services")} variant="outline">
              {dict.common.more}
            </ButtonLink>
          }
        />

        <div className="mt-16 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {topServices.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.06}>
              <div className="flex h-full flex-col justify-between gap-8 bg-ink p-8 transition-colors duration-500 hover:bg-surface/60 md:p-10">
                <div>
                  <h3 className="font-display text-2xl text-sand md:text-3xl">
                    {t(service.title, locale)}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {t(service.description, locale)}
                  </p>
                </div>
                <div className="hairline flex items-baseline justify-between gap-4 pt-6">
                  <span className="text-sm text-accent">{t(service.price, locale)}</span>
                  <span className="text-xs text-muted">{t(service.duration, locale)}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 max-w-2xl text-xs leading-relaxed text-muted">
            {dict.services.priceNote}
          </p>
        </Reveal>
      </section>

      <ContactSection locale={locale} dict={dict} settings={settings} />
    </>
  );
}
