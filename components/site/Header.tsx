"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/cn";
import { localePath } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
  siteName: string;
};

export function Header({ locale, dict, siteName }: HeaderProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/services", label: dict.nav.services },
    { href: "/contacts", label: dict.nav.contacts },
  ];

  // Шапка уезжает при прокрутке вниз и возвращается при малейшем движении
  // вверх — навигация всегда под рукой, но не мешает смотреть рендеры.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    setScrolled(latest > 24);
    if (menuOpen) return;
    setHidden(latest > previous && latest > 220);
  });

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500",
          scrolled && !menuOpen
            ? "border-b border-line bg-ink/70 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
          <Link
            href={localePath(locale)}
            className="wordmark text-lg leading-none text-sand transition-colors duration-300 hover:text-brass md:text-xl"
          >
            {siteName}
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((link) => {
              const href = localePath(locale, link.href);
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={link.href}
                  href={href}
                  className={cn(
                    "link-underline text-[11px] tracking-[0.18em] uppercase transition-colors duration-300",
                    active ? "text-brass" : "text-sand-dim hover:text-sand",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <LocaleSwitch locale={locale} label={dict.common.langSwitch} />

            <Link
              href={localePath(locale, "/contacts")}
              className="hidden rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.16em] text-sand uppercase transition-colors duration-500 hover:border-brass hover:text-brass lg:inline-flex"
            >
              {dict.nav.cta}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? dict.nav.close : dict.nav.menu}
              aria-expanded={menuOpen}
              className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
            >
              <span className="relative block h-3 w-6">
                <motion.span
                  className="absolute left-0 block h-px w-full bg-sand"
                  animate={menuOpen ? { top: "50%", rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.span
                  className="absolute left-0 block h-px w-full bg-sand"
                  animate={menuOpen ? { top: "50%", rotate: -45 } : { top: "100%", rotate: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 pt-28 pb-10 md:hidden"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav className="flex flex-col gap-2">
              {[{ href: "/", label: dict.nav.home }, ...links].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 + index * 0.07, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={localePath(locale, link.href)}
                    onClick={() => setMenuOpen(false)}
                    className="display-lg block py-2 text-sand"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="hairline pt-6 text-[11px] tracking-[0.18em] text-muted uppercase"
            >
              {siteName}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
