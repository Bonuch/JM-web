"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { snapToPixel } from "@/components/motion/pixel-snap";
import { localePath, plural, t, type Dictionary, type Locale } from "@/lib/i18n";
import type { ImageAsset, Settings } from "@/lib/types";
import { TextReveal } from "@/components/motion/TextReveal";
import { useSiteReady } from "./Preloader";
import { AssetImage } from "./AssetImage";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Первый экран. Фон уезжает медленнее контента и подсвечивается тёплым
 * градиентом — за счёт этого рендер воспринимается как окно вглубь кадра,
 * а не как обои на подложке.
 */
export function Hero({
  locale,
  dict,
  settings,
  image,
  projectCount,
}: {
  locale: Locale;
  dict: Dictionary;
  settings: Settings;
  image: ImageAsset | null;
  projectCount: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // первый экран оживает не при монтировании, а когда уходит заставка
  const ready = useSiteReady();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  // Текст первого экрана уезжает вверх на четверть своей высоты. Считаем сдвиг
  // в пикселях и округляем: на дробных значениях глифы пересглаживаются каждый
  // кадр, и на замедлении прокрутки заголовок заметно дрожит.
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setContentHeight(entry.contentRect.height));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const contentY = useTransform(scrollYProgress, (value) =>
    snapToPixel(-value * 0.28 * contentHeight),
  );

  return (
    <section
      ref={ref}
      className="relative flex h-[100svh] min-h-[36rem] w-full flex-col justify-end overflow-hidden"
    >
      {/* Фоновый слой */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y: backgroundY, scale: backgroundScale }}
      >
        {image ? (
          <AssetImage
            asset={image}
            locale={locale}
            variant="showcase"
            original={settings.originalQuality}
            sizes="100vw"
            priority
            alt={t(settings.role, locale)}
            className="scale-105"
          />
        ) : (
          // Пока проектов нет — вместо рендера мягкая световая сцена
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_20%,#2b2620_0%,#141416_45%,#0a0a0b_100%)]" />
        )}
      </motion.div>

      {/* Затемнение: снизу глубже, чтобы текст читался на любом рендере */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_85%,rgba(10,10,11,0.85)_0%,transparent_60%)]" />
      <div className="grain-overlay" />

      <motion.div
        ref={contentRef}
        className="container-page relative z-10 pb-12 md:pb-16 will-change-transform"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {t(settings.role, locale)}
        </motion.p>

        <TextReveal
          as="h1"
          immediate
          delay={0.25}
          text={t(settings.heroTitle, locale)}
          className="display-xl mt-5 max-w-5xl text-sand"
        />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            className="body-lead max-w-xl text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            {t(settings.heroSubtitle, locale)}
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <ButtonLink href={localePath(locale, "/portfolio")} size="lg">
              {dict.hero.cta}
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/services")} variant="outline" size="lg">
              {dict.hero.secondary}
            </ButtonLink>
          </motion.div>
        </div>

        <motion.div
          className="hairline mt-10 flex items-center justify-between pt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1, delay: 1.05 }}
        >
          <div className="flex items-center gap-3 text-[11px] tracking-[0.22em] text-muted uppercase">
            <span className="relative flex h-8 w-px overflow-hidden bg-line-strong">
              <span className="absolute inset-x-0 h-2 animate-[var(--animate-scroll-hint)] bg-accent" />
            </span>
            {dict.hero.scroll}
          </div>

          {projectCount > 0 && (
            <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {projectCount} {plural(projectCount, dict)}
            </p>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
