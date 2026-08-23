"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import {
  deleteProjectAction,
  moveProjectAction,
  toggleFeaturedAction,
  togglePublishedAction,
  type ActionResult,
} from "@/lib/actions/admin";
import type { Project } from "@/lib/types";

const CATEGORY_LABELS: Record<Project["category"], string> = {
  apartment: "Квартира",
  house: "Дом",
  commercial: "Коммерция",
  furniture: "Предметная",
};

export function ProjectList({ projects }: { projects: Project[] }) {
  const [pending, startTransition] = useTransition();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Действия админки возвращают причину сбоя вместо исключения — показываем её. */
  const run = (action: () => Promise<ActionResult>, onSuccess?: () => void) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.ok) onSuccess?.();
      else setError(result.error);
    });

  return (
    <div className={cn("mt-10 border-t border-line", pending && "opacity-60")}>
      {error && (
        <p className="border-b border-accent/30 bg-accent/10 px-4 py-3 text-xs leading-relaxed text-sand">
          {error}
        </p>
      )}

      {projects.map((project, index) => (
        <div
          key={project.id}
          className="flex flex-wrap items-center gap-5 border-b border-line py-5"
        >
          <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-surface">
            {project.cover ? (
              <Image
                src={project.cover.thumbUrl || project.cover.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full items-center justify-center text-[10px] text-muted">
                нет фото
              </span>
            )}
          </div>

          <div className="min-w-48 flex-1">
            <Link
              href={`/admin/projects/${project.id}`}
              className="font-display text-xl text-sand transition-colors hover:text-accent"
            >
              {project.title.ru || project.title.en || "Без названия"}
            </Link>
            <p className="mt-1 text-xs text-muted">
              {CATEGORY_LABELS[project.category]}
              {project.location.ru && ` · ${project.location.ru}`}
              {project.year && ` · ${project.year}`} · {project.images.length} кадр(ов)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusButton
              active={project.published}
              activeLabel="Опубликован"
              inactiveLabel="Черновик"
              onClick={() => run(() => togglePublishedAction(project.id))}
            />
            <StatusButton
              active={project.featured}
              activeLabel="В избранном"
              inactiveLabel="Не в избранном"
              onClick={() => run(() => toggleFeaturedAction(project.id))}
            />
          </div>

          <div className="flex items-center gap-1">
            <IconButton
              label="Выше"
              disabled={index === 0}
              onClick={() => run(() => moveProjectAction(project.id, "up"))}
            >
              ↑
            </IconButton>
            <IconButton
              label="Ниже"
              disabled={index === projects.length - 1}
              onClick={() => run(() => moveProjectAction(project.id, "down"))}
            >
              ↓
            </IconButton>
          </div>

          {confirmingId === project.id ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  run(
                    () => deleteProjectAction(project.id),
                    () => setConfirmingId(null),
                  )
                }
                className="rounded-full bg-accent px-4 py-2 text-[10px] tracking-[0.12em] text-ink uppercase"
              >
                Удалить
              </button>
              <button
                type="button"
                onClick={() => setConfirmingId(null)}
                className="text-[10px] tracking-[0.12em] text-muted uppercase hover:text-sand"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingId(project.id)}
              className="text-[10px] tracking-[0.12em] text-muted uppercase transition-colors hover:text-accent"
            >
              Удалить
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function StatusButton({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase transition-colors",
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-line text-muted hover:border-line-strong hover:text-sand",
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

function IconButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-sand-dim transition-colors hover:border-accent hover:text-accent disabled:opacity-30 disabled:hover:border-line disabled:hover:text-sand-dim"
    >
      {children}
    </button>
  );
}
