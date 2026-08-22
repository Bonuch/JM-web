import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

/**
 * Единая шапка секции: надзаголовок, крупный заголовок с построчным выездом
 * и необязательная подводка. Повторяется по всему сайту и держит ритм.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** Элемент справа — например, ссылка «Все проекты» */
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
        </Reveal>
        <TextReveal as="h2" text={title} className="display-lg mt-5 text-sand" />
        {subtitle && (
          <Reveal delay={0.1}>
            <p className="body-lead mt-6 max-w-xl">{subtitle}</p>
          </Reveal>
        )}
      </div>
      {aside && <Reveal delay={0.15}>{aside}</Reveal>}
    </div>
  );
}
