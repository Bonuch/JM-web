import Link from "next/link";
import { localePath, t, type Dictionary, type Locale } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";

/** Соцсети выводим только те, что реально заполнены в админке. */
export function socialLinks(settings: Settings): { label: string; href: string }[] {
  return [
    { label: "Behance", href: settings.behance },
    { label: "Telegram", href: settings.telegram },
    { label: "WhatsApp", href: settings.whatsapp },
    { label: "Instagram", href: settings.instagram },
    { label: "Pinterest", href: settings.pinterest },
  ].filter((item) => item.href.trim().length > 0);
}

export function Footer({
  locale,
  dict,
  settings,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: Settings;
}) {
  const socials = socialLinks(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink-soft">
      <div className="grain-overlay" />

      <div className="container-page relative pt-24 pb-12 md:pt-36">
        <Reveal>
          <p className="eyebrow">{dict.cta.label}</p>
        </Reveal>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <Reveal delay={0.05}>
            <h2 className="display-lg max-w-2xl text-sand">{dict.cta.title}</h2>
          </Reveal>

          <Reveal delay={0.12}>
            <ButtonLink href={localePath(locale, "/contacts")} size="lg" variant="solid">
              {dict.nav.cta}
              <ArrowRight />
            </ButtonLink>
          </Reveal>
        </div>

        <div className="hairline mt-20 grid gap-12 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="wordmark text-xl text-sand">{settings.siteName}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t(settings.role, locale)}</p>
            <p className="mt-1 text-sm text-muted">{t(settings.city, locale)}</p>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.22em] text-muted uppercase">{dict.footer.nav}</p>
            <ul className="mt-5 space-y-3">
              {[
                { href: "/", label: dict.nav.home },
                { href: "/portfolio", label: dict.nav.portfolio },
                { href: "/services", label: dict.nav.services },
                { href: "/contacts", label: dict.nav.contacts },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={localePath(locale, link.href)}
                    className="link-underline text-sm text-sand-dim transition-colors duration-300 hover:text-sand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {dict.footer.contacts}
            </p>
            <ul className="mt-5 space-y-3">
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="link-underline text-sm text-sand-dim transition-colors duration-300 hover:text-sand"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}
                    className="link-underline text-sm text-sand-dim transition-colors duration-300 hover:text-sand"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {dict.contacts.social}
            </p>
            <ul className="mt-5 space-y-3">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="link-underline text-sm text-sand-dim transition-colors duration-300 hover:text-sand"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="hairline mt-14 flex flex-col gap-3 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.siteName}. {dict.footer.rights}
          </p>
          <p className="tracking-[0.18em] uppercase">{t(settings.role, locale)}</p>
        </div>
      </div>
    </footer>
  );
}
