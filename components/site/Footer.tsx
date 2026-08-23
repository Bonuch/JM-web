"use client";

import Link from "next/link";
import { localePath, t, type Dictionary, type Locale } from "@/lib/i18n";
import type { Settings } from "@/lib/types";
import { socialLinks } from "@/lib/socials";

/**
 * Подвал — только навигация, контакты и копирайт.
 *
 * Призыва к действию здесь намеренно нет: каждая страница сайта уже
 * заканчивается ContactSection с формой и прямыми контактами, поэтому кнопка
 * в подвале дублировала заголовок блока прямо над собой, а на /contacts вела
 * сама на себя. Если понадобится вернуть — сначала убрать ContactSection
 * с той страницы, где он не нужен.
 */
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

      <div className="container-page relative pt-20 pb-12 md:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <Link
              href={localePath(locale, "/privacy")}
              className="link-underline w-fit transition-colors duration-300 hover:text-sand"
            >
              {dict.footer.policy}
            </Link>
            <p className="tracking-[0.18em] uppercase">{t(settings.role, locale)}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
