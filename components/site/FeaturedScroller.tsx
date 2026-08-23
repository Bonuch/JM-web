"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { localePath, t, type Dictionary, type Locale } from "@/lib/i18n";
import { snapToPixel } from "@/components/motion/pixel-snap";
import type { Project } from "@/lib/types";
import { AssetImage } from "./AssetImage";
import { ArrowRight } from "@/components/ui/Button";

/**
 * Избранные проекты в виде «плёнки», которая проматывается вбок, пока секция
 * приклеена к экрану. Приём даёт ощущение управляемой камеры: пользователь
 * крутит колесо вертикально, а кадр едет горизонтально.
 *
 * На узких экранах пиннинг выключен — там это обычная лента со снаппингом,
 * потому что вертикальная прокрутка на телефоне должна оставаться привычной.
 */
export function FeaturedScroller({
  projects,
  locale,
  dict,
}: {
  projects: Project[];
  locale: Locale;
  dict: Dictionary;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rawX = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const smoothX = useSpring(rawX, { stiffness: 140, damping: 30, mass: 0.5 });
  // подписи под кадрами едут вместе с лентой: держим их на пиксельной сетке
  const x = useTransform(smoothX, snapToPixel);

  // Насколько трек длиннее экрана — ровно на столько его и нужно сдвинуть
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects.length]);

  if (projects.length === 0) return null;

  const cards = projects.map((project, index) => (
    <FeaturedCard key={project.id} project={project} locale={locale} dict={dict} index={index} />
  ));

  return (
    <>
      {/* Мобильная лента */}
      <div className="lg:hidden">
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project, index) => (
            <div key={project.id} className="w-[82vw] shrink-0 snap-center">
              <FeaturedCard project={project} locale={locale} dict={dict} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Десктопная «плёнка» */}
      <div
        ref={sectionRef}
        className="relative hidden lg:block"
        style={{ height: `${Math.max(2, projects.length * 0.85) * 100}vh` }}
      >
        <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
          <motion.div
            ref={trackRef}
            className="flex gap-10 pl-[clamp(1.25rem,5vw,4.5rem)] will-change-transform"
            style={reduced ? undefined : { x }}
          >
            {cards.map((card, index) => (
              <div key={index} className="w-[46vw] shrink-0 first:w-[52vw]">
                {card}
              </div>
            ))}
            <div className="flex w-[28vw] shrink-0 items-center">
              <Link
                href={localePath(locale, "/portfolio")}
                className="group flex items-center gap-4 text-sand transition-colors duration-500 hover:text-accent"
              >
                <span className="display-md">{dict.common.allProjects}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

function FeaturedCard({
  project,
  locale,
  dict,
  index,
}: {
  project: Project;
  locale: Locale;
  dict: Dictionary;
  index: number;
}) {
  if (!project.cover) return null;

  return (
    <Link
      href={localePath(locale, `/portfolio/${project.slug}`)}
      data-cursor={dict.common.viewProject}
      className="group block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105">
          <AssetImage
            asset={project.cover}
            locale={locale}
            variant="card"
            sizes="(max-width: 1024px) 82vw, 50vw"
            alt={t(project.title, locale)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-90" />
        <span className="absolute top-6 left-6 font-display text-xl text-sand/50">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-6">
        <h3 className="display-md text-sand transition-colors duration-500 group-hover:text-accent">
          {t(project.title, locale)}
        </h3>
        <span className="shrink-0 text-[11px] tracking-[0.16em] text-muted uppercase">
          {dict.categories[project.category]}
        </span>
      </div>
    </Link>
  );
}
