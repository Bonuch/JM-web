"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { snapToPixel } from "./pixel-snap";

/**
 * Бегущая строка. Контент дублируется дважды, поэтому анимация на -50%
 * выглядит бесшовной. Дополнительно строка чуть смещается от прокрутки —
 * это связывает её с ритмом страницы.
 */
export function Marquee({
  items,
  reverse = false,
  className,
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // дробное смещение заставляет браузер пересглаживать буквы на каждом кадре
  const drift = useTransform(scrollYProgress, (value) =>
    snapToPixel((reverse ? 1 - value : value) * 160 - 80),
  );

  const row = [...items, ...items];

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`} aria-hidden="true">
      <motion.div style={reduced ? undefined : { x: drift }}>
        <div
          className="flex w-max items-center gap-10 whitespace-nowrap will-change-transform"
          style={
            reduced
              ? undefined
              : { animation: reverse ? "var(--animate-marquee-reverse)" : "var(--animate-marquee)" }
          }
        >
          {row.map((item, index) => (
            <span key={index} className="flex items-center gap-10">
              <span className="display-md text-sand/70">{item}</span>
              <span className="h-1.5 w-1.5 rotate-45 bg-accent/70" />
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
