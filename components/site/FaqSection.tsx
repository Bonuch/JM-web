"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { t, type Locale } from "@/lib/i18n";
import type { FaqItem } from "@/lib/types";
import { Reveal } from "@/components/motion/Reveal";

/** Ответы на возражения — последний рубеж перед формой заявки. */
export function FaqSection({ items, locale }: { items: FaqItem[]; locale: Locale }) {
  const ordered = [...items].sort((a, b) => a.order - b.order);
  const [openId, setOpenId] = useState<string | null>(null);

  if (ordered.length === 0) return null;

  return (
    <div className="hairline mt-14">
      {ordered.map((item, index) => {
        const open = openId === item.id;
        return (
          <Reveal key={item.id} delay={index * 0.04}>
            <div className="border-b border-line">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                className="group flex w-full items-start gap-6 py-7 text-left"
              >
                <span
                  className={cn(
                    "flex-1 font-display text-xl transition-colors duration-500 md:text-2xl",
                    open ? "text-accent" : "text-sand group-hover:text-accent",
                  )}
                >
                  {t(item.question, locale)}
                </span>
                <span
                  className={cn(
                    "relative mt-1 flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-500",
                    open ? "rotate-45 text-accent" : "text-sand-dim",
                  )}
                  aria-hidden="true"
                >
                  <span className="absolute h-0.5 w-4 bg-current" />
                  <span className="absolute h-4 w-0.5 bg-current" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-8 text-sm leading-relaxed text-sand-dim md:text-base">
                      {t(item.answer, locale)}
                    </p>
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
