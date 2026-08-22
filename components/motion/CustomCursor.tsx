"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Курсор-кольцо. Включается только для мыши: на тач-устройствах и при
 * prefers-reduced-motion компонент ничего не рендерит и не трогает <body>.
 *
 * Подпись берётся из атрибута data-cursor на элементе под курсором — так
 * карточка проекта может сказать «Смотреть», а обычная ссылка просто
 * увеличивает кольцо.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const springX = useSpring(x, { stiffness: 420, damping: 38, mass: 0.28 });
  const springY = useSpring(y, { stiffness: 420, damping: 38, mass: 0.28 });

  useEffect(() => {
    if (reduced) return;
    const media = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("cursor-none");

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cursor], a, button, input, textarea, select, label",
      );
      if (!target) {
        setLabel(null);
        setActive(false);
        return;
      }
      const custom = target.dataset.cursor;
      setLabel(custom && custom !== "true" ? custom : null);
      setActive(true);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.body.classList.remove("cursor-none");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = label ? 96 : active ? 54 : 24;

  return (
    <div className="pointer-events-none fixed inset-0 z-100 hidden lg:block">
      {/* Кольцо: отдельный слой для позиции, вложенный — для размера,
          иначе анимация ширины конфликтует с центрирующим transform. */}
      <motion.div className="absolute top-0 left-0" style={{ x: springX, y: springY }}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
          animate={{
            width: size,
            height: size,
            opacity: visible ? 1 : 0,
            backgroundColor: label ? "rgba(194,163,107,0.95)" : "rgba(237,231,222,0)",
            borderColor: label ? "rgba(194,163,107,0)" : "rgba(237,231,222,0.55)",
          }}
          transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.4 }}
          initial={false}
        >
          <motion.span
            className="text-[10px] font-medium tracking-[0.18em] text-ink uppercase"
            animate={{ opacity: label ? 1 : 0 }}
            transition={{ duration: 0.18 }}
          >
            {label}
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Точка без инерции — она показывает истинное положение курсора */}
      <motion.div className="absolute top-0 left-0" style={{ x, y }}>
        <motion.div
          className="h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sand"
          animate={{ opacity: visible && !label ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    </div>
  );
}
