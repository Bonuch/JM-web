"use client";

import { useRef, type ElementType } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useSiteReady } from "@/components/site/Preloader";

type TextRevealProps = {
  /** Переводы строк в тексте задают разбивку на анимируемые строки */
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Анимировать сразу после монтирования, а не по скроллу (для hero) */
  immediate?: boolean;
};

/**
 * Построчный «выезд» текста из-под маски — приём из промо-сайтов студий:
 * строка появляется целиком, но со сдвигом относительно соседней.
 *
 * Момент появления определяется по самому заголовку, а не по строкам внутри
 * маски: строка в исходном состоянии смещена вниз и полностью обрезана
 * родителем с overflow: hidden, поэтому IntersectionObserver считал бы её
 * невидимой всегда и анимация не запускалась бы вовсе.
 */
export function TextReveal({
  text,
  as: Tag = "h2",
  className,
  delay = 0,
  immediate = false,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  // заставка перекрывает первый экран: пока она видна, анимировать нечего
  const siteReady = useSiteReady();
  const lines = text.split("\n");

  if (reduced) {
    return (
      <Tag className={className}>
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  const visible = immediate ? siteReady : inView;

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, index) => (
        <span key={index} className="line-mask">
          <motion.span
            className="block will-change-transform"
            initial={{ y: "115%" }}
            animate={visible ? { y: "0%" } : { y: "115%" }}
            transition={{
              duration: 1.1,
              delay: delay + index * 0.09,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line || " "}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
