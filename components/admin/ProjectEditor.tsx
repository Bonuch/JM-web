"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { deleteProjectAction, saveProjectAction } from "@/lib/actions/admin";
import type { CategoryKey, Project } from "@/lib/types";
import type { StorageKind } from "@/lib/image-processing";
import { ImageUploader } from "./ImageUploader";
import { LocalizedField, SelectField, TextField, Toggle } from "./Fields";

const CATEGORY_OPTIONS: { value: CategoryKey; label: string }[] = [
  { value: "apartment", label: "Квартира" },
  { value: "house", label: "Частный дом" },
  { value: "commercial", label: "Коммерческое пространство" },
  { value: "furniture", label: "Предметная визуализация" },
];

export function ProjectEditor({
  project: initial,
  isNew,
  storageKind,
}: {
  project: Project;
  isNew: boolean;
  storageKind: StorageKind;
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const patch = <K extends keyof Project>(key: K, value: Project[K]) => {
    setProject((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const titleFilled = project.title.ru.trim() || project.title.en.trim();
  const canSave = Boolean(titleFilled) && project.images.length > 0;

  const save = (publish?: boolean) => {
    setError(null);
    startTransition(async () => {
      try {
        const next = publish === undefined ? project : { ...project, published: publish };
        const result = await saveProjectAction(next);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setSaved(true);
        setProject((current) => ({
          ...current,
          slug: result.data.slug,
          published: next.published,
        }));
        if (isNew) router.replace(`/admin/projects/${result.data.id}`);
        router.refresh();
      } catch {
        setError("Не удалось сохранить. Проверьте соединение и попробуйте ещё раз.");
      }
    });
  };

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-[11px] tracking-[0.16em] text-muted uppercase hover:text-accent">
            ← Все проекты
          </Link>
          <h1 className="mt-3 font-display text-4xl text-sand">
            {isNew ? "Новый проект" : project.title.ru || project.title.en || "Проект"}
          </h1>
          {!isNew && project.slug && (
            <p className="mt-2 text-xs text-muted">
              Адрес страницы: <span className="text-sand-dim">/ru/portfolio/{project.slug}</span>
            </p>
          )}
        </div>

        {!isNew && (
          <div className="flex items-center gap-3">
            <Link
              href={`/ru/portfolio/${project.slug}`}
              target="_blank"
              className="text-[11px] tracking-[0.16em] text-sand-dim uppercase hover:text-accent"
            >
              Посмотреть на сайте
            </Link>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <LocalizedField
            label="Название"
            value={project.title}
            onChange={(value) => patch("title", value)}
            placeholder="Квартира в Хамовниках"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              label="Тип объекта"
              value={project.category}
              options={CATEGORY_OPTIONS}
              onChange={(value) => patch("category", value)}
            />
            <LocalizedField
              label="Локация"
              value={project.location}
              onChange={(value) => patch("location", value)}
              placeholder="Москва"
            />
            <TextField
              label="Площадь"
              value={project.area}
              onChange={(value) => patch("area", value)}
              placeholder="86 м²"
            />
            <TextField
              label="Год"
              value={project.year}
              onChange={(value) => patch("year", value)}
              placeholder="2026"
            />
          </div>

          <LocalizedField
            label="Стиль"
            value={project.style}
            onChange={(value) => patch("style", value)}
            placeholder="Современная классика"
          />

          <LocalizedField
            label="Короткое описание"
            value={project.excerpt}
            onChange={(value) => patch("excerpt", value)}
            multiline
            rows={3}
            placeholder="Одно-два предложения для карточки и поисковой выдачи"
            hint="Используется в описании страницы для поисковиков и в соцсетях."
          />

          <LocalizedField
            label="Описание проекта"
            value={project.description}
            onChange={(value) => patch("description", value)}
            multiline
            rows={9}
            placeholder="Задача, решение, особенности материалов и света"
            hint="Пустая строка между абзацами разделит текст на блоки."
          />

          <ImageUploader
            storageKind={storageKind}
            images={project.images}
            onChange={(images) => {
              setProject((current) => ({
                ...current,
                images,
                // обложка не должна ссылаться на удалённый кадр
                cover:
                  images.find((image) => image.id === current.cover?.id) ?? images[0] ?? null,
              }));
              setSaved(false);
            }}
            coverId={project.cover?.id ?? null}
            onCoverChange={(id) => {
              const cover = project.images.find((image) => image.id === id) ?? null;
              patch("cover", cover);
            }}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-3">
            <Toggle
              label="Опубликован"
              description="Черновик виден только в админке"
              checked={project.published}
              onChange={(checked) => patch("published", checked)}
            />
            <Toggle
              label="В избранном"
              description="Показывать в подборке на главной"
              checked={project.featured}
              onChange={(checked) => patch("featured", checked)}
            />
          </div>

          <TextField
            label="Адрес страницы"
            value={project.slug}
            onChange={(value) => patch("slug", value)}
            placeholder="создастся автоматически"
            hint="можно оставить пустым"
          />

          {!canSave && (
            <p className="text-xs leading-relaxed text-muted">
              Чтобы сохранить, нужно название и хотя бы один загруженный кадр.
            </p>
          )}

          {error && <p className="text-xs text-accent">{error}</p>}
          {saved && !pending && <p className="text-xs text-accent">Сохранено</p>}

          <div className="space-y-3">
            <button
              type="button"
              disabled={!canSave || pending}
              onClick={() => save()}
              className="w-full rounded-full bg-sand px-6 py-3.5 text-xs font-medium tracking-[0.1em] text-ink uppercase transition-colors hover:bg-accent disabled:opacity-40"
            >
              {pending ? "Сохраняем…" : "Сохранить"}
            </button>

            {!project.published && (
              <button
                type="button"
                disabled={!canSave || pending}
                onClick={() => save(true)}
                className="w-full rounded-full border border-line-strong px-6 py-3.5 text-xs tracking-[0.1em] text-sand uppercase transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Сохранить и опубликовать
              </button>
            )}
          </div>

          {!isNew && (
            <div className={cn("border-t border-line pt-6", confirmingDelete && "text-accent")}>
              {confirmingDelete ? (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-muted">
                    Проект и все его изображения будут удалены безвозвратно.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          const result = await deleteProjectAction(project.id);
                          if (!result.ok) {
                            setError(result.error);
                            setConfirmingDelete(false);
                            return;
                          }
                          router.push("/admin");
                        })
                      }
                      className="rounded-full bg-accent px-5 py-2.5 text-[10px] tracking-[0.12em] text-ink uppercase"
                    >
                      Удалить
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(false)}
                      className="text-[10px] tracking-[0.12em] text-muted uppercase hover:text-sand"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="text-[10px] tracking-[0.12em] text-muted uppercase transition-colors hover:text-accent"
                >
                  Удалить проект
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
