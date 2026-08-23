import { t, type Dictionary, type Locale } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { LeadForm } from "./LeadForm";
import { socialLinks } from "@/lib/socials";

/**
 * Финальный экран убеждения: слева — способы связаться напрямую (кто-то
 * всегда предпочитает мессенджер форме), справа — сама заявка.
 */
export function ContactSection({
  locale,
  dict,
  settings,
  id = "contact",
  topic,
  showHeading = true,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: Settings;
  id?: string;
  /** Предвыбранный тариф, когда пользователь пришёл из блока услуг */
  topic?: string;
  /** На странице контактов заголовок уже стоит выше — здесь он лишний */
  showHeading?: boolean;
}) {
  const socials = socialLinks(settings);

  return (
    <section id={id} className="relative overflow-hidden py-section">
      <div className="absolute inset-x-0 top-0 h-px bg-line" />
      <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(237,231,222,0.10)_0%,transparent_65%)] blur-2xl" />

      <div className="container-page relative grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          {showHeading && (
            <>
              <Reveal>
                <p className="eyebrow">{dict.cta.label}</p>
              </Reveal>

              <TextReveal as="h2" text={dict.cta.title} className="display-lg mt-5 text-sand" />

              <Reveal delay={0.1}>
                <p className="body-lead mt-6 max-w-md">{dict.cta.text}</p>
              </Reveal>
            </>
          )}

          <Reveal delay={0.16}>
            <div className={showHeading ? "hairline mt-12 pt-10" : ""}>
              <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
                {dict.contacts.directContact}
              </p>
              <div className="mt-6 space-y-4">
                {settings.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="link-underline block font-display text-2xl text-sand transition-colors duration-500 hover:text-accent md:text-3xl"
                  >
                    {settings.email}
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
                    className="link-underline block font-display text-2xl text-sand transition-colors duration-500 hover:text-accent md:text-3xl"
                  >
                    {settings.phone}
                  </a>
                )}
              </div>

              {socials.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-3">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded-full border border-line px-4 py-2 text-[11px] tracking-[0.16em] text-sand-dim uppercase transition-colors duration-500 hover:border-accent hover:text-accent"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              )}

              <p className="mt-8 text-xs text-muted">
                {t(settings.city, locale)} · {dict.contacts.subtitle}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <LeadForm locale={locale} dict={dict} services={settings.services} topic={topic} />
        </Reveal>
      </div>
    </section>
  );
}
