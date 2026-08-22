"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * template.tsx монтируется заново на каждую навигацию, поэтому мягкое
 * проявление контента здесь работает как переход между страницами.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
