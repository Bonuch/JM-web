"use client";

import type { ReactNode } from "react";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Ритм сетки задан вручную: чередование широких и вертикальных карточек со
 * сдвигами по вертикали читается как разворот журнала, а не как таблица.
 * Каждая позиция получает свою скорость параллакса — сетка «дышит».
 */
const PATTERN = [
  { span: "lg:col-span-7", aspect: "aspect-[4/3]", offset: "", speed: 0.1 },
  { span: "lg:col-span-5", aspect: "aspect-[3/4]", offset: "lg:mt-28", speed: -0.09 },
  { span: "lg:col-span-5", aspect: "aspect-[3/4]", offset: "", speed: 0.14 },
  { span: "lg:col-span-7", aspect: "aspect-[4/3]", offset: "lg:mt-20", speed: -0.06 },
  { span: "lg:col-span-12", aspect: "aspect-[2/1]", offset: "", speed: 0.05 },
] as const;

export function gridSlot(index: number) {
  return PATTERN[index % PATTERN.length];
}

/** Размер, который карточка занимает на экране — для корректного srcset. */
export function gridSizes(index: number): string {
  const slot = gridSlot(index);
  if (slot.span === "lg:col-span-12") return "(max-width: 1024px) 100vw, 92vw";
  if (slot.span === "lg:col-span-7") return "(max-width: 1024px) 100vw, 54vw";
  return "(max-width: 1024px) 100vw, 38vw";
}

export function ProjectGrid({ children }: { children: ReactNode[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12 lg:gap-y-24">
      {children.map((child, index) => {
        const slot = gridSlot(index);
        return (
          <div key={index} className={`${slot.span} ${slot.offset}`}>
            <Reveal distance={36}>
              <Parallax speed={slot.speed} smooth={false}>
                {child}
              </Parallax>
            </Reveal>
          </div>
        );
      })}
    </div>
  );
}
