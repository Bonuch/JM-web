import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";

/**
 * Верх внутренней страницы. Отступ сверху рассчитан на фиксированную шапку,
 * а крупный заголовок сразу задаёт тот же масштаб, что и на главной.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="container-page pt-40 pb-16 md:pt-52 md:pb-24">
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>

      <TextReveal as="h1" immediate delay={0.1} text={title} className="display-xl mt-6 text-sand" />

      {subtitle && (
        <Reveal delay={0.2}>
          <p className="body-lead mt-8 max-w-2xl">{subtitle}</p>
        </Reveal>
      )}
    </header>
  );
}
