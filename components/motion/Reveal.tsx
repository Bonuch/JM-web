"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Задержка внутри группы, чтобы элементы появлялись каскадом */
  delay?: number;
  /** Сдвиг снизу в пикселях */
  distance?: number;
  className?: string;
};

/**
 * Появление блока при входе в область просмотра.
 * Один раз — повторный «мигающий» reveal при обратной прокрутке раздражает.
 */
export function Reveal({ children, delay = 0, distance = 28, className }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
