"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { t, type Dictionary, type Locale } from "@/lib/i18n";
import type { ServiceItem } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Прайс в виде разворачивающегося списка: сначала видно только название,
 * цену и срок — это самое частое, что ищут. Детали открываются по клику,
 * поэтому страница не превращается в стену текста.
 */
export function ServicesSection({
  services,
  locale,
  dict,
  onSelect,
}: {
  services: ServiceItem[];
  locale: Locale;
  dict: Dictionary;
  /** Клик по «Заказать» — прокрутка к форме с выбранным тарифом */
  onSelect?: (serviceTitle: string) => void;
}) {
  const ordered = [...services].sort((a, b) => a.order - b.order);
  const [openId, setOpenId] = useState<string | null>(ordered[0]?.id ?? null);

  return (
    <div className="hairline mt-16">
      {ordered.map((service, index) => {
        const open = openId === service.id;
        const title = t(service.title, locale);

        return (
          <Reveal key={service.id} delay={index * 0.05}>
            <div
              className={cn(
                "border-b border-line transition-colors duration-500",
                open && "bg-surface/40",
              )}
            >
              <button
                type="button"
                onClick={() => setOpenId(open ? null : service.id)}
                aria-expanded={open}
                className="group flex w-full items-center gap-6 px-1 py-8 text-left md:px-4 md:py-10"
              >
                <span className="hidden w-10 shrink-0 text-[11px] tracking-[0.2em] text-muted tabular-nums md:block">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span
                      className={cn(
                        "display-md transition-colors duration-500",
                        open ? "text-brass" : "text-sand group-hover:text-brass",
                      )}
                    >
                      {title}
                    </span>
                    {service.highlighted && (
                      <span className="rounded-full border border-brass/40 px-3 py-1 text-[10px] tracking-[0.18em] text-brass uppercase">
                        {locale === "ru" ? "чаще всего" : "most popular"}
                      </span>
                    )}
                  </span>
                  <span className="mt-2 block text-sm text-muted md:hidden">
                    {t(service.price, locale)}
                  </span>
                </span>

                <span className="hidden shrink-0 text-right md:block">
                  <span className="block text-sm text-sand">{t(service.price, locale)}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {dict.services.duration}: {t(service.duration, locale)}
                  </span>
                </span>

                <span
                  className={cn(
                    "relative ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                    open ? "rotate-45 border-brass text-brass" : "border-line-strong text-sand-dim",
                  )}
                  aria-hidden="true"
                >
                  <span className="absolute h-px w-3 bg-current" />
                  <span className="absolute h-3 w-px bg-current" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-8 px-1 pb-10 md:grid-cols-2 md:gap-16 md:px-4 md:pl-16">
                      <div>
                        <p className="body-lead">{t(service.description, locale)}</p>
                        <p className="mt-6 text-sm text-muted md:hidden">
                          {dict.services.duration}: {t(service.duration, locale)}
                        </p>
                        {onSelect && (
                          <button
                            type="button"
                            onClick={() => onSelect(title)}
                            className="link-underline mt-8 text-[11px] tracking-[0.18em] text-brass uppercase"
                          >
                            {dict.services.order}
                          </button>
                        )}
                      </div>

                      <div>
                        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
                          {dict.services.includes}
                        </p>
                        <ul className="mt-5 space-y-3">
                          {service.includes.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex gap-3 text-sm text-sand-dim">
                              <span className="mt-2 h-1 w-1 shrink-0 rotate-45 bg-brass" />
                              {t(item, locale)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
