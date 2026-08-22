"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatBytes, uploadImage, type StorageKind } from "@/lib/image-processing";
import type { ImageAsset } from "@/lib/types";

type UploadState = {
  total: number;
  done: number;
  /** Название файла, который отправляется прямо сейчас */
  current: string | null;
  ratio: number;
  stage: "preparing" | "uploading" | null;
  error: string | null;
};

const IDLE: UploadState = { total: 0, done: 0, current: null, ratio: 0, stage: null, error: null };

const ERROR_TEXT: Record<string, string> = {
  UNAUTHORIZED: "Сессия истекла — войдите заново",
  UNSUPPORTED_TYPE: "Поддерживаются JPG, PNG, WebP, AVIF и TIFF",
  STORAGE_FAILED: "Хранилище недоступно, попробуйте ещё раз",
  ENCODE_FAILED: "Браузер не смог подготовить превью для этого файла",
  CANVAS_UNAVAILABLE: "Браузер не смог обработать изображение",
};

/**
 * Загрузка рендеров. Оригинал уходит в хранилище без сжатия и уменьшения —
 * именно он потом показывается на сайте. Браузер дополнительно готовит два
 * лёгких превью для сеток, чтобы список работ не тянул десятки мегабайт.
 */
export function ImageUploader({
  images,
  onChange,
  coverId,
  onCoverChange,
  storageKind,
  label = "Кадры проекта",
  multiple = true,
}: {
  images: ImageAsset[];
  onChange: (images: ImageAsset[]) => void;
  /** id кадра, выбранного обложкой */
  coverId?: string | null;
  onCoverChange?: (id: string) => void;
  storageKind: StorageKind;
  label?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<UploadState>(IDLE);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
      if (files.length === 0) return;

      setState({ ...IDLE, total: files.length });
      const uploaded: ImageAsset[] = [];

      for (const [index, file] of files.entries()) {
        setState((current) => ({ ...current, current: file.name, done: index, ratio: 0 }));
        try {
          uploaded.push(
            await uploadImage(file, storageKind, (progress) =>
              setState((current) => ({ ...current, ...progress })),
            ),
          );
        } catch (error) {
          const code = error instanceof Error ? error.message : "UPLOAD_FAILED";
          setState((current) => ({
            ...current,
            error: ERROR_TEXT[code] ?? `Не удалось загрузить «${file.name}»`,
          }));
        }
      }

      if (uploaded.length > 0) {
        onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
      }
      setState((current) => ({ ...IDLE, error: current.error }));
    },
    [images, multiple, onChange, storageKind],
  );

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const uploading = state.total > 0;
  const progressLabel = uploading
    ? state.stage === "preparing"
      ? `Готовим ${state.done + 1} из ${state.total}…`
      : `Загружаем ${state.done + 1} из ${state.total} — ${Math.round(state.ratio * 100)}%`
    : "Выбрать файлы";

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-[11px] tracking-[0.18em] text-muted uppercase">{label}</span>
        {images.length > 0 && (
          <span className="text-[11px] text-muted/70">{images.length} шт.</span>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "border border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-brass bg-brass/5" : "border-line bg-surface/20",
        )}
      >
        <p className="text-sm text-sand">
          Перетащите {multiple ? "изображения" : "изображение"} сюда
        </p>
        <p className="mt-1 text-xs text-muted">
          Файлы сохраняются в исходном качестве, без сжатия. JPG, PNG, WebP, AVIF или TIFF.
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-5 rounded-full border border-line-strong px-5 py-2.5 text-[11px] tracking-[0.12em] text-sand uppercase transition-colors hover:border-brass hover:text-brass disabled:opacity-50"
        >
          {progressLabel}
        </button>

        {uploading && (
          <div className="mx-auto mt-5 h-px w-full max-w-sm bg-line">
            <div
              className="h-px bg-brass transition-[width] duration-300"
              style={{ width: `${Math.round(state.ratio * 100)}%` }}
            />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {state.error && <p className="mt-3 text-xs text-brass">{state.error}</p>}

      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => {
            const isCover = coverId === image.id;
            return (
              <div key={image.id} className="group relative">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image
                    src={image.thumbUrl || image.url}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                  {isCover && (
                    <span className="absolute top-2 left-2 rounded-full bg-brass px-2 py-1 text-[9px] tracking-[0.12em] text-ink uppercase">
                      Обложка
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[10px] text-muted tabular-nums">
                  {image.width}×{image.height}
                  {image.bytes ? ` · ${formatBytes(image.bytes)}` : ""}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {onCoverChange && !isCover && (
                    <MiniButton onClick={() => onCoverChange(image.id)}>обложка</MiniButton>
                  )}
                  {multiple && (
                    <>
                      <MiniButton disabled={index === 0} onClick={() => move(index, -1)}>
                        ←
                      </MiniButton>
                      <MiniButton
                        disabled={index === images.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        →
                      </MiniButton>
                    </>
                  )}
                  <MiniButton
                    onClick={() => onChange(images.filter((item) => item.id !== image.id))}
                  >
                    удалить
                  </MiniButton>
                </div>

                <input
                  type="text"
                  value={image.alt.ru}
                  placeholder="Подпись (необязательно)"
                  onChange={(event) =>
                    onChange(
                      images.map((item) =>
                        item.id === image.id
                          ? { ...item, alt: { ...item.alt, ru: event.target.value } }
                          : item,
                      ),
                    )
                  }
                  className="mt-2 w-full border-b border-line bg-transparent py-1.5 text-xs text-sand placeholder:text-muted/60 focus:border-brass focus:outline-none"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MiniButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-line px-2.5 py-1 text-[10px] text-muted transition-colors hover:border-brass hover:text-brass disabled:opacity-30 disabled:hover:border-line disabled:hover:text-muted"
    >
      {children}
    </button>
  );
}
