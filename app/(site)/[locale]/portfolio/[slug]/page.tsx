import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, localePath, t } from "@/lib/i18n";
import {
  getProjectBySlug,
  getProjectNeighbours,
  getPublishedProjects,
  getSettings,
} from "@/lib/content";
import { LOCALES } from "@/lib/types";
import { ProjectGallery } from "@/components/site/ProjectGallery";
import { ContactSection } from "@/components/site/ContactSection";
import { ProjectHero } from "@/components/site/ProjectHero";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight } from "@/components/ui/Button";

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return LOCALES.flatMap((locale) =>
    projects.map((project) => ({ locale, slug: project.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = t(project.title, locale);
  const description = t(project.excerpt, locale) || t(project.description, locale).slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/${locale}/portfolio/${slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: project.cover ? [{ url: project.cover.mediumUrl || project.cover.url }] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = await getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const dict = getDictionary(locale);
  const [settings, neighbours] = await Promise.all([
    getSettings(),
    getProjectNeighbours(slug),
  ]);

  const meta = [
    { label: dict.common.category, value: dict.categories[project.category] },
    { label: dict.common.location, value: t(project.location, locale) },
    { label: dict.common.area, value: project.area },
    { label: dict.common.year, value: project.year },
    { label: dict.common.style, value: t(project.style, locale) },
  ].filter((item) => item.value);

  const paragraphs = t(project.description, locale)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      <ProjectHero
        project={project}
        locale={locale}
        dict={dict}
        originalQuality={settings.originalQuality}
      />

      <section className="container-page py-section">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-4">
            <Reveal>
              <dl className="hairline space-y-6 pt-8">
                {meta.map((item) => (
                  <div key={item.label} className="flex items-baseline justify-between gap-6">
                    <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">
                      {item.label}
                    </dt>
                    <dd className="text-right text-sm text-sand">{item.value}</dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-6">
                  <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">
                    {dict.common.images}
                  </dt>
                  <dd className="text-right text-sm text-sand tabular-nums">
                    {project.images.length}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            {paragraphs.length > 0 ? (
              <div className="space-y-6">
                {paragraphs.map((paragraph, index) => (
                  <Reveal key={index} delay={index * 0.05}>
                    <p className="body-lead text-balance">{paragraph}</p>
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <p className="body-lead">{t(project.excerpt, locale)}</p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="container-page pb-section">
        <ProjectGallery
          images={project.images}
          locale={locale}
          dict={dict}
          title={t(project.title, locale)}
          originalQuality={settings.originalQuality}
        />
      </section>

      {(neighbours.next || neighbours.prev) && (
        <section className="border-t border-line">
          <div className="container-page grid gap-px sm:grid-cols-2">
            {neighbours.prev && (
              <NeighbourLink
                href={localePath(locale, `/portfolio/${neighbours.prev.slug}`)}
                label={dict.common.prevProject}
                title={t(neighbours.prev.title, locale)}
                align="left"
              />
            )}
            {neighbours.next && (
              <NeighbourLink
                href={localePath(locale, `/portfolio/${neighbours.next.slug}`)}
                label={dict.common.nextProject}
                title={t(neighbours.next.title, locale)}
                align="right"
              />
            )}
          </div>
        </section>
      )}

      <ContactSection locale={locale} dict={dict} settings={settings} />
    </>
  );
}

function NeighbourLink({
  href,
  label,
  title,
  align,
}: {
  href: string;
  label: string;
  title: string;
  align: "left" | "right";
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 py-14 transition-colors duration-500 hover:bg-surface/40 ${
        align === "right" ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="flex items-center gap-3 text-[11px] tracking-[0.2em] text-muted uppercase">
        {align === "left" && <ArrowRight className="rotate-180" />}
        {label}
        {align === "right" && <ArrowRight />}
      </span>
      <span className="display-md text-sand transition-colors duration-500 group-hover:text-accent">
        {title}
      </span>
    </Link>
  );
}
