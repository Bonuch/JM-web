import Link from "next/link";
import { cn } from "@/lib/cn";
import { localePath, t, type Dictionary, type Locale } from "@/lib/i18n";
import type { Project } from "@/lib/types";
import { AssetImage } from "./AssetImage";

/**
 * Карточка проекта. Вся анимация наведения — на CSS-трансформах, поэтому
 * карточка остаётся серверным компонентом и не утяжеляет клиентский бандл.
 */
export function ProjectCard({
  project,
  locale,
  dict,
  aspect = "aspect-[4/3]",
  sizes,
  priority = false,
  index,
}: {
  project: Project;
  locale: Locale;
  dict: Dictionary;
  aspect?: string;
  sizes: string;
  priority?: boolean;
  /** Порядковый номер выводится как «01», «02» — держит ритм сетки */
  index?: number;
}) {
  if (!project.cover) return null;

  return (
    <Link
      href={localePath(locale, `/portfolio/${project.slug}`)}
      data-cursor={dict.common.viewProject}
      className="group block"
    >
      <div className={cn("relative overflow-hidden bg-surface", aspect)}>
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
          <AssetImage
            asset={project.cover}
            locale={locale}
            variant="card"
            sizes={sizes}
            priority={priority}
            alt={t(project.title, locale)}
          />
        </div>

        {/* Тёмная вуаль появляется при наведении — подпись поверх остаётся читаемой */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-70 transition-opacity duration-700 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-7">
          <div className="translate-y-2 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-[10px] tracking-[0.22em] text-brass uppercase">
              {dict.categories[project.category]}
            </span>
          </div>
          {typeof index === "number" && (
            <span className="font-display text-2xl leading-none text-sand/40">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-6">
        <h3 className="font-display text-2xl leading-tight text-sand transition-colors duration-500 group-hover:text-brass md:text-3xl">
          {t(project.title, locale)}
        </h3>
        <span className="shrink-0 text-[11px] tracking-[0.16em] text-muted uppercase">
          {[t(project.location, locale), project.year].filter(Boolean).join(" · ")}
        </span>
      </div>

      {project.area && (
        <p className="mt-2 text-sm text-muted">
          {project.area}
          {project.style.ru || project.style.en ? ` · ${t(project.style, locale)}` : ""}
        </p>
      )}
    </Link>
  );
}
