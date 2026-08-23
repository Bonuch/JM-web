"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { cn } from "@/lib/cn";
import { localePath } from "@/lib/i18n";
import type { Dictionary, Locale } from "@/lib/i18n";
import { ArrowRight, ButtonLink } from "@/components/ui/Button";
import { LocaleSwitch } from "./LocaleSwitch";

const EASE = [0.16, 1, 0.3, 1] as const;
const MENU_ID = "mobile-menu";
/** Длина обода кнопки меню: по ней считается прочерк латунной окружности. */
const RING_LENGTH = 2 * Math.PI * 21.5;

type SocialLink = { label: string; href: string };

type HeaderProps = {
  locale: Locale;
  dict: Dictionary;
  siteName: string;
  /** Прямые контакты дублируются в меню: с телефона проще нажать, чем искать в подвале. */
  contacts: { email: string; phone: string; socials: SocialLink[] };
};

/** Один набор вариантов на всю панель; при «уменьшении движения» длительности обнуляются. */
function panelMotion(reduce: boolean) {
  const d = (value: number) => (reduce ? 0 : value);

  return {
    panel: {
      closed: { clipPath: "inset(0 0 100% 0)", transition: { duration: d(0.45), ease: EASE } },
      open: { clipPath: "inset(0 0 0% 0)", transition: { duration: d(0.7), ease: EASE } },
    },
    list: {
      closed: { transition: { staggerChildren: d(0.03), staggerDirection: -1 } },
      open: { transition: { delayChildren: d(0.14), staggerChildren: d(0.06) } },
    },
    row: { closed: {}, open: {} },
    label: {
      closed: { y: "115%", transition: { duration: d(0.35), ease: EASE } },
      open: { y: "0%", transition: { duration: d(0.8), ease: EASE } },
    },
    index: {
      closed: { opacity: 0, transition: { duration: d(0.2) } },
      open: { opacity: 1, transition: { delay: d(0.18), duration: d(0.6) } },
    },
    rule: {
      closed: { scaleX: 0, transition: { duration: d(0.3), ease: EASE } },
      open: { scaleX: 1, transition: { duration: d(0.9), ease: EASE } },
    },
    tail: {
      closed: { opacity: 0, y: 12, transition: { duration: d(0.25) } },
      open: { opacity: 1, y: 0, transition: { delay: d(0.42), duration: d(0.7), ease: EASE } },
    },
  };
}

/**
 * Кнопка меню. Вместо трёх одинаковых полосок — стопка штрихов разной длины с
 * латунным акцентом посередине: иконка читается как часть фирменного стиля, а
 * не как дефолтный бургер. При открытии крайние линии складываются в крест,
 * средняя уезжает влево, а по ободу кнопки прочерчивается латунная окружность.
 */
function MenuToggle({
  open,
  onClick,
  label,
  reduce,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
  reduce: boolean;
}) {
  const move = { duration: reduce ? 0 : 0.55, ease: EASE };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      aria-controls={MENU_ID}
      whileTap={{ scale: 0.92 }}
      className={cn(
        "relative z-50 -mr-1.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-500 md:hidden",
        open ? "text-accent" : "text-sand",
      )}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-full border border-line" />

      <svg
        viewBox="0 0 44 44"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <motion.circle
          cx="22"
          cy="22"
          r="21.5"
          stroke="var(--color-accent)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          initial={{ strokeDashoffset: RING_LENGTH }}
          animate={{ strokeDashoffset: open ? 0 : RING_LENGTH }}
          transition={{ duration: reduce ? 0 : 0.75, ease: EASE }}
        />
      </svg>

      {/* Длины штрихов заданы классами, а не анимацией: иконка правильная уже в
          серверной разметке, скрипт только доводит её до креста. Внешний span
          отвечает за поворот вокруг центра, внутренний — за длину. */}
      <span className="relative block h-[13px] w-[19px]">
        <motion.span
          className="absolute inset-x-0 top-0 block h-px origin-center"
          animate={{ y: open ? 6 : 0, rotate: open ? 45 : 0 }}
          transition={move}
        >
          <span className="block h-px w-full bg-current" />
        </motion.span>

        <motion.span
          className="absolute inset-x-0 top-[6px] block h-px"
          animate={{ opacity: open ? 0 : 1 }}
          transition={move}
        >
          <motion.span
            className="block h-px w-1/2 origin-left bg-accent"
            animate={{ scaleX: open ? 0 : 1 }}
            transition={move}
          />
        </motion.span>

        <motion.span
          className="absolute inset-x-0 top-[12px] block h-px origin-center"
          animate={{ y: open ? -6 : 0, rotate: open ? -45 : 0 }}
          transition={move}
        >
          <motion.span
            className="block h-px w-[78%] origin-left bg-current"
            animate={{ scaleX: open ? 100 / 78 : 1 }}
            transition={move}
          />
        </motion.span>
      </span>
    </motion.button>
  );
}

export function Header({ locale, dict, siteName, contacts }: HeaderProps) {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const reduce = useReducedMotion() ?? false;
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const variants = useMemo(() => panelMotion(reduce), [reduce]);

  const links = [
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/services", label: dict.nav.services },
    { href: "/contacts", label: dict.nav.contacts },
  ];

  const menuLinks = [{ href: "/", label: dict.nav.home }, ...links];

  const isActive = (href: string) => {
    const target = localePath(locale, href);
    // Главная — только точное совпадение, иначе «/ru» подсветится на всех страницах.
    if (href === "/") return pathname === target;
    return pathname === target || pathname.startsWith(`${target}/`);
  };

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

  // Escape закрывает меню — с внешней клавиатуры на планшете это ожидаемо.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Смена адреса всегда закрывает панель — в том числе по кнопке «назад»,
  // когда клика по ссылке меню не было. Правка состояния прямо в рендере
  // дешевле эффекта: лишнего кадра с открытой панелью не появляется.
  const [shownPath, setShownPath] = useState(pathname);
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setMenuOpen(false);
  }

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
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6 md:h-20">
          <Link
            href={localePath(locale)}
            className="wordmark text-lg leading-none text-sand transition-colors duration-300 hover:text-accent md:text-xl"
          >
            {siteName}
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={localePath(locale, link.href)}
                className={cn(
                  "link-underline text-[11px] tracking-[0.18em] uppercase transition-colors duration-300",
                  isActive(link.href) ? "text-accent" : "text-sand-dim hover:text-sand",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <LocaleSwitch locale={locale} label={dict.common.langSwitch} />

            <Link
              href={localePath(locale, "/contacts")}
              className="hidden rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.16em] text-sand uppercase transition-colors duration-500 hover:border-accent hover:text-accent lg:inline-flex"
            >
              {dict.nav.cta}
            </Link>

            <MenuToggle
              open={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              label={menuOpen ? dict.nav.close : dict.nav.menu}
              reduce={reduce}
            />
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id={MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menu}
            className="fixed inset-0 z-40 md:hidden"
            variants={variants.panel}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Подложка размывает страницу, а не закрашивает её: меню читается как слой поверх работ. */}
            <div aria-hidden="true" className="absolute inset-0 bg-ink/90 backdrop-blur-2xl" />
            <div aria-hidden="true" className="grain-overlay" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-accent/10 blur-[90px]"
            />

            <div className="relative flex h-full flex-col overflow-y-auto overscroll-contain px-6 pt-24 pb-8">
              <motion.ul variants={variants.list} className="flex flex-col">
                {menuLinks.map((link, index) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li key={link.href} variants={variants.row} className="relative">
                      <Link
                        href={localePath(locale, link.href)}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className="flex items-center gap-4 py-3"
                      >
                        <motion.span
                          variants={variants.index}
                          className={cn(
                            "w-6 shrink-0 self-start pt-2 text-[10px] tracking-[0.2em] tabular-nums",
                            active ? "text-accent" : "text-muted",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </motion.span>

                        <span className="line-mask flex-1">
                          <motion.span
                            variants={variants.label}
                            className={cn(
                              "menu-link block pb-[0.1em]",
                              active ? "text-accent" : "text-sand",
                            )}
                          >
                            {link.label}
                          </motion.span>
                        </span>

                        <motion.span
                          variants={variants.index}
                          className={cn("shrink-0", active ? "text-accent" : "text-muted")}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.span>
                      </Link>

                      <motion.span
                        aria-hidden="true"
                        variants={variants.rule}
                        className="absolute inset-x-0 bottom-0 h-px origin-left bg-line"
                      />
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div variants={variants.tail} className="mt-auto pt-8">
                <ButtonLink
                  href={localePath(locale, "/contacts")}
                  onClick={() => setMenuOpen(false)}
                  size="lg"
                  variant="solid"
                  className="w-full"
                >
                  {dict.nav.cta}
                </ButtonLink>

                {(contacts.email || contacts.phone) && (
                  <div className="hairline mt-6 flex flex-col gap-2 pt-5">
                    {contacts.email && (
                      <a href={`mailto:${contacts.email}`} className="text-sm text-sand-dim">
                        {contacts.email}
                      </a>
                    )}
                    {contacts.phone && (
                      <a
                        href={`tel:${contacts.phone.replace(/[^+\d]/g, "")}`}
                        className="text-sm text-sand-dim"
                      >
                        {contacts.phone}
                      </a>
                    )}
                  </div>
                )}

                {contacts.socials.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {contacts.socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[11px] tracking-[0.18em] text-muted uppercase"
                      >
                        {social.label}
                      </a>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
