"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { localePath, t, type Dictionary, type Locale } from "@/lib/i18n";
import type { Project } from "@/lib/types";
import { TextReveal } from "@/components/motion/TextReveal";
import { AssetImage } from "./AssetImage";
import { ArrowRight } from "@/components/ui/Button";

/** Обложка кейса: тот же язык движения, что и на главной, но спокойнее. */
export function ProjectHero({
  project,
  locale,
  dict,
  originalQuality,
}: {
  project: Project;
  locale: Locale;
  dict: Dictionary;
  originalQuality: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-[88svh] min-h-[32rem] w-full flex-col justify-end overflow-hidden"
    >
      {project.cover && (
        <motion.div className="absolute inset-0" style={reduced ? undefined : { y, scale }}>
          <AssetImage
            asset={project.cover}
            locale={locale}
            variant="showcase"
            original={originalQuality}
            sizes="100vw"
            priority
            alt={t(project.title, locale)}
          />
        </motion.div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
      <div className="grain-overlay" />

      <motion.div
        className="container-page relative z-10 pb-16 md:pb-24"
        style={reduced ? undefined : { opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={localePath(locale, "/portfolio")}
            className="group inline-flex items-center gap-3 text-[11px] tracking-[0.2em] text-sand-dim uppercase transition-colors duration-300 hover:text-brass"
          >
            <ArrowRight className="rotate-180 group-hover:-translate-x-1" />
            {dict.common.backToPortfolio}
          </Link>
        </motion.div>

        <TextReveal
          as="h1"
          immediate
          delay={0.15}
          text={t(project.title, locale)}
          className="display-xl mt-6 max-w-5xl text-sand"
        />

        <motion.p
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] tracking-[0.2em] text-sand-dim uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.55 }}
        >
          <span>{dict.categories[project.category]}</span>
          {t(project.location, locale) && (
            <>
              <span className="h-1 w-1 rotate-45 bg-brass" />
              <span>{t(project.location, locale)}</span>
            </>
          )}
          {project.year && (
            <>
              <span className="h-1 w-1 rotate-45 bg-brass" />
              <span>{project.year}</span>
            </>
          )}
        </motion.p>
      </motion.div>
    </section>
  );
}
