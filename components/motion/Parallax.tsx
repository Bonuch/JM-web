"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

type ParallaxProps = {
  children: ReactNode;
  /**
   * Насколько сильно слой отстаёт (положительное) или обгоняет (отрицательное)
   * прокрутку. 0.15 — деликатно, 0.4 — заметно.
   */
  speed?: number;
  className?: string;
  /**
   * Сглаживать движение пружиной. Для одиночных акцентных блоков — да,
   * для длинных сеток лучше выключить: меньше работы на кадр.
   */
  smooth?: boolean;
};

/**
 * Слой, который движется относительно прокрутки. Считаем смещение в процентах
 * от собственной высоты: тогда эффект одинаков и на телефоне, и на мониторе.
 */
export function Parallax({ children, speed = 0.2, className, smooth = true }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [`${speed * 50}%`, `${-speed * 50}%`]);
  const smoothed = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });
  const y = smooth ? smoothed : raw;

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Параллакс для фоновых изображений: картинка берётся с запасом по высоте и
 * плавно «проезжает» внутри своей рамки, не оставляя пустых полей.
 */
export function ParallaxImage({
  children,
  className,
  strength = 18,
}: {
  children: ReactNode;
  className?: string;
  /** Запас по высоте в процентах */
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${-strength / 2}%`, `${strength / 2}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        style={reduced ? undefined : { y }}
        className="absolute inset-0 will-change-transform"
        // запас сверху и снизу, чтобы при сдвиге не появлялись пустые полосы
        initial={false}
      >
        <div
          className="relative h-full w-full"
          style={{ height: reduced ? "100%" : `${100 + strength}%`, top: reduced ? 0 : `${-strength / 2}%` }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}
