"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { plural, type Dictionary, type Locale } from "@/lib/i18n";
import { CATEGORY_KEYS, type CategoryKey, type Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";
import { gridSizes, gridSlot } from "./ProjectGrid";
import { Parallax } from "@/components/motion/Parallax";

type Filter = CategoryKey | "all";

/**
 * Каталог работ с фильтром по типу объекта. Фильтрация идёт на клиенте:
 * проектов у визуализатора десятки, а не тысячи, зато переключение
 * мгновенное и с анимацией перестроения сетки.
 */
export function PortfolioBrowser({
  projects,
  locale,
  dict,
}: {
  projects: Project[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  // Показываем только те категории, в которых реально есть работы
  const available = useMemo(() => {
    const used = new Set(projects.map((project) => project.category));
    return CATEGORY_KEYS.filter((key) => used.has(key));
  }, [projects]);

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((project) => project.category === filter)),
    [projects, filter],
  );

  return (
    <div>
      <div className="hairline flex flex-wrap items-center justify-between gap-6 pt-8">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {(["all", ...available] as Filter[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "relative pb-1 text-[11px] tracking-[0.18em] uppercase transition-colors duration-300",
                filter === key ? "text-brass" : "text-muted hover:text-sand",
              )}
            >
              {dict.categories[key]}
              {filter === key && (
                <motion.span
                  layoutId="portfolio-filter"
                  className="absolute inset-x-0 -bottom-px h-px bg-brass"
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </button>
          ))}
        </div>

        <p className="text-[11px] tracking-[0.18em] text-muted uppercase tabular-nums">
          {visible.length} {plural(visible.length, dict)}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="body-lead mt-24 text-center">{dict.portfolio.empty}</p>
      ) : (
        <motion.div layout className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12 lg:gap-y-24">
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => {
              const slot = gridSlot(index);
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={`${slot.span} ${slot.offset}`}
                >
                  <Parallax speed={slot.speed} smooth={false}>
                    <ProjectCard
                      project={project}
                      locale={locale}
                      dict={dict}
                      aspect={slot.aspect}
                      sizes={gridSizes(index)}
                      priority={index < 2}
                      index={index}
                    />
                  </Parallax>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
