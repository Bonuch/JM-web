"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatBytes, uploadLogo, type StorageKind } from "@/lib/image-processing";
import type { ImageAsset } from "@/lib/types";

const ERROR_TEXT: Record<string, string> = {
  UNAUTHORIZED: "Сессия истекла — войдите заново",
  UNSUPPORTED_TYPE: "Для логотипа подойдут SVG, PNG или WebP",
  STORAGE_FAILED: "Хранилище недоступно, попробуйте ещё раз",
  BLOB_NOT_CONFIGURED:
    "Хранилище Vercel Blob не подключено к проекту — файл сохранить некуда. Как это исправить, написано вверху страницы.",
  SVG_NO_SIZE: "В этом SVG нет ни viewBox, ни размеров — пересохраните файл из редактора",
  CANVAS_UNAVAILABLE: "Браузер не смог обработать изображение",
};

/**
 * Загрузка логотипа. Отдельно от ImageUploader намеренно: тому нужны превью,
 * порядок кадров и обложка, а логотипу — ровно один файл и честный просмотр.
 *
 * Просмотр показан всегда, даже когда логотип не загружен: тогда в нём стоит
 * название разрядкой — ровно то, что сейчас видит посетитель. Пустая рамка на
 * этом месте не отвечала бы на главный вопрос: «а что там сейчас?»
 *
 * Фон просмотра — цвет сайта, а высота — та же, что в шапке. На белой плашке
 * админки светлый знак выглядел бы неразличимым, а по крупному изображению
 * не понять, читается он мелким или превращается в пятно.
 */
export function LogoUploader({
  logo,
  siteName,
  onChange,
  storageKind,
}: {
  logo: ImageAsset | null;
  /** Подставляется в просмотр, пока логотип не загружен */
  siteName: string;
  onChange: (logo: ImageAsset | null) => void;
  storageKind: StorageKind;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file || !file.type.startsWith("image/")) return;

      setError(null);
      setRatio(0);
      try {
        onChange(await uploadLogo(file, storageKind, (progress) => setRatio(progress.ratio)));
      } catch (cause) {
        const code = cause instanceof Error ? cause.message : "UPLOAD_FAILED";
        setError(ERROR_TEXT[code] ?? `Не удалось загрузить «${file.name}». ${code}`);
      } finally {
        setRatio(null);
      }
    },
    [onChange, storageKind],
  );

  const uploading = ratio !== null;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="text-[11px] tracking-[0.18em] text-muted uppercase">Логотип</span>
        <span className="text-[11px] text-muted/70">
          {logo ? "сейчас в шапке — логотип" : "сейчас в шапке — название"}
        </span>
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
          "border transition-colors",
          dragging ? "border-accent" : "border-line",
        )}
      >
        <div className="flex min-h-[5.5rem] items-center bg-ink px-6 py-5">
          {logo ? (
            <Image
              src={logo.url}
              alt=""
              width={logo.width}
              height={logo.height}
              className="h-7 w-auto max-w-full object-contain"
              unoptimized
            />
          ) : (
            <span className="wordmark text-xl text-sand">{siteName}</span>
          )}
        </div>

        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t px-4 py-3 transition-colors",
            dragging ? "border-accent bg-accent/5" : "border-line bg-surface/20",
          )}
        >
          <p className="text-[10px] leading-relaxed text-muted">
            {logo ? (
              <>
                {logo.format === "image/svg+xml" ? "SVG" : `${logo.width}×${logo.height}`}
                {logo.bytes ? ` · ${formatBytes(logo.bytes)}` : ""}
              </>
            ) : (
              "Перетащите файл сюда. SVG, PNG или WebP: фон прозрачный, знак светлый."
            )}
          </p>

          <div className="flex items-center gap-4">
            {logo && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-[10px] tracking-[0.12em] text-muted uppercase transition-colors hover:text-accent"
              >
                Убрать
              </button>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="text-[10px] tracking-[0.12em] text-sand uppercase transition-colors hover:text-accent disabled:opacity-40"
            >
              {uploading
                ? `Загружаем — ${Math.round(ratio * 100)}%`
                : logo
                  ? "Заменить"
                  : "Выбрать файл"}
            </button>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-accent">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/svg+xml,image/png,image/webp,image/avif"
        hidden
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
