import { t, type Locale } from "@/lib/i18n";
import type { StatItem } from "@/lib/types";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

/** Полоса с цифрами: короткое доказательство опыта между большими блоками. */
export function StatsSection({ stats, locale }: { stats: StatItem[]; locale: Locale }) {
  if (stats.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <div className="hairline grid grid-cols-2 gap-x-8 gap-y-12 pt-12 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.id} delay={index * 0.08}>
            <div>
              <p className="display-md text-accent">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-3 text-sm leading-snug text-muted">{t(stat.label, locale)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
