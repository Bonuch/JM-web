"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { t, type Dictionary, type Locale } from "@/lib/i18n";
import type { ImageAsset } from "@/lib/types";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { AssetImage } from "./AssetImage";

/**
 * Галерея кейса. Кадры чередуются по ширине, чтобы просмотр не превращался
 * в монотонную ленту, и открываются во весь экран по клику.
 */
export function ProjectGallery({
  images,
  locale,
  dict,
  title,
  originalQuality,
}: {
  images: ImageAsset[];
  locale: Locale;
  dict: Dictionary;
  title: string;
  /** Отдавать кадры кейса исходными файлами, без повторного сжатия */
  originalQuality: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + images.length) % images.length;
      }),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [openIndex, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-16 md:space-y-28">
        {images.map((image, index) => {
          // каждый третий кадр — во всю ширину, остальные с полями
          const wide = index % 3 === 2;
          return (
            <Reveal key={image.id} distance={40}>
              <figure
                className={cn(
                  "mx-auto",
                  wide ? "w-full" : "w-full max-w-5xl",
                  index % 3 === 1 && "md:ml-auto md:mr-0",
                )}
              >
                <Parallax speed={index % 2 === 0 ? 0.08 : -0.08} smooth={false}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    data-cursor={dict.common.images}
                    className="group relative block w-full overflow-hidden bg-surface"
                    style={{ aspectRatio: `${image.width} / ${image.height}` }}
                  >
                    <AssetImage
                      asset={image}
                      locale={locale}
                      variant="showcase"
                      original={originalQuality}
                      sizes={wide ? "100vw" : "(max-width: 768px) 100vw, 70vw"}
                      alt={`${title} — ${index + 1}`}
                      className="transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                    />
                  </button>
                </Parallax>
                {t(image.alt, locale) && (
                  <figcaption className="mt-4 text-xs tracking-[0.14em] text-muted uppercase">
                    {t(image.alt, locale)}
                  </figcaption>
                )}
              </figure>
            </Reveal>
          );
        })}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-ink/97 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <button
              type="button"
              onClick={close}
              aria-label={dict.common.close}
              className="absolute top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-sand transition-colors duration-300 hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <LightboxArrow
                  side="left"
                  label={dict.common.prevProject}
                  onClick={(event) => {
                    event.stopPropagation();
                    step(-1);
                  }}
                />
                <LightboxArrow
                  side="right"
                  label={dict.common.nextProject}
                  onClick={(event) => {
                    event.stopPropagation();
                    step(1);
                  }}
                />
              </>
            )}

            <motion.div
              key={openIndex}
              className="relative h-full max-h-[86vh] w-full max-w-[92vw]"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Лёгкое превью появляется мгновенно, поверх него догружается
                  исходный файл — так полноэкранный просмотр не ждёт оригинал,
                  но в итоге показывает именно его, без повторного сжатия. */}
              <Image
                src={images[openIndex].mediumUrl || images[openIndex].url}
                alt=""
                aria-hidden="true"
                fill
                sizes="92vw"
                quality={90}
                className="object-contain"
              />
              <Image
                src={images[openIndex].url}
                alt={`${title} — ${openIndex + 1}`}
                fill
                sizes="92vw"
                unoptimized
                className="object-contain"
                priority
              />
            </motion.div>

            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-muted tabular-nums">
              {String(openIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LightboxArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong text-sand transition-colors duration-300 hover:border-accent hover:text-accent",
        side === "left" ? "left-4 md:left-8" : "right-4 md:right-8",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cn("h-4 w-4", side === "left" && "rotate-180")}
        aria-hidden="true"
      >
        <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}
