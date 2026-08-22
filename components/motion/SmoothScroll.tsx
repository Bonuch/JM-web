"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "motion/react";

/**
 * Инерционная прокрутка Lenis. Она задаёт весь ритм сайта: параллакс и
 * появления считаются от нативного scrollY, который Lenis обновляет плавно.
 *
 * При включённом «уменьшении движения» инстанс останавливается, и браузер
 * скроллит страницу как обычно — компонент при этом не перемонтируется,
 * чтобы не сбрасывать состояние дерева.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    if (reduced) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [reduced]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: 0.085,
        wheelMultiplier: 0.9,
        // на тачскринах нативная прокрутка ощущается лучше синтетической
        syncTouch: false,
        touchMultiplier: 1.6,
      }}
    >
      {children}
    </ReactLenis>
  );
}
