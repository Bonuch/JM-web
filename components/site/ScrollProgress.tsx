"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Тонкая линия прогресса вверху страницы — ориентир в длинных разделах. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 34, mass: 0.3 });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-60 h-px origin-left bg-accent"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
