import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, t } from "@/lib/i18n";
import { getSettings } from "@/lib/content";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/motion/Reveal";

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
    title: dict.meta.privacyTitle,
    description: dict.meta.privacyDescription,
    alternates: { canonical: `/${locale}/privacy` },
  };
}

/**
 * Политика обработки персональных данных. Текст описывает то, что сайт делает
 * на самом деле: состав полей формы, шифрование заявок, уведомления и счётчики.
 * Меняя эти механизмы, правьте и текст — иначе документ начнёт врать.
 */
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const settings = await getSettings();

  // Реквизиты оператора (ФИО или ИП, ИНН, адрес) — личные данные владельца
  // сайта, поэтому они живут в переменной окружения, а не в репозитории.
  // Пока она не задана, в тексте стоит публичное имя сайта: документ будет
  // неполным, но посетитель хотя бы не увидит незаполненную заготовку.
  const operator = process.env.LEGAL_OPERATOR?.trim() || settings.siteName;

  return (
    <>
      <PageHeader
        eyebrow={dict.privacy.label}
        title={dict.privacy.title}
        subtitle={dict.privacy.intro}
      />

      <section className="container-narrow pb-section">
        <Reveal>
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
            {dict.privacy.updated}
          </p>
        </Reveal>

        <div className="mt-12 space-y-12">
          {dict.privacy.sections.map((section, index) => (
            <Reveal key={section.title} delay={Math.min(index, 4) * 0.04}>
              <article className="hairline pt-8">
                <h2 className="font-display text-xl text-sand md:text-2xl">{section.title}</h2>
                <div className="mt-5 space-y-4">
                  {section.body.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-sm leading-relaxed text-sand-dim">
                      {paragraph.replaceAll("{operator}", operator)}
                    </p>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal>
            <article className="hairline pt-8">
              <h2 className="font-display text-xl text-sand md:text-2xl">
                {dict.privacy.contactsTitle}
              </h2>
              <div className="mt-5 space-y-3">
                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="link-underline block w-fit text-sm text-sand transition-colors duration-500 hover:text-accent"
                  >
                    {settings.email}
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
                    className="link-underline block w-fit text-sm text-sand transition-colors duration-500 hover:text-accent"
                  >
                    {settings.phone}
                  </a>
                )}
                <p className="text-sm text-muted">
                  {settings.siteName} · {t(settings.city, locale)}
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>
    </>
  );
}
