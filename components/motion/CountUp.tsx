"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Значения статистики хранятся строками («120+», «48 ч»), поэтому число
 * вынимается из начала строки, анимируется, а суффикс остаётся как есть.
 * Если числа в начале нет или включено «уменьшение движения», показываем
 * исходную строку — считать в этом случае нечего и незачем.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduced = useReducedMotion();

  const match = value.match(/^(\d+[\s ]?\d*)(.*)$/);
  const numeric = match ? Number(match[1].replace(/[\s ]/g, "")) : null;
  const suffix = match ? match[2] : "";

  const [counted, setCounted] = useState(() => `0${suffix}`);

  useEffect(() => {
    if (numeric === null || reduced || !inView) return;

    const controls = animate(0, numeric, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setCounted(`${Math.round(latest)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, numeric, reduced, suffix]);

  return (
    <span ref={ref} className={className}>
      {numeric === null || reduced ? value : counted}
    </span>
  );
}
