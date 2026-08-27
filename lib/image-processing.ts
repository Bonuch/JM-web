import { upload } from "@vercel/blob/client";
import type { ImageAsset } from "./types";

/**
 * Подготовка изображения в браузере.
 *
 * Оригинал загружается как есть: ни уменьшения, ни перекодирования — на сайте
 * рендер должен показываться ровно в том качестве, в котором его просчитали.
 * Дополнительно готовятся два лёгких превью; они используются только там, где
 * кадр занимает пару сотен пикселей, и никогда не подменяют оригинал в
 * полноэкранном просмотре.
 */
export const PREVIEW_SIZES = {
  medium: 2048,
  thumb: 800,
} as const;

/** Превью тоже должны быть чистыми: разница с оригиналом не должна читаться. */
const PREVIEW_QUALITY = 0.94;

export type StorageKind = "local" | "blob";

function fit(width: number, height: number, maxSide: number) {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("ENCODE_FAILED"))),
      "image/webp",
      quality,
    );
  });
}

function draw(source: ImageBitmap, maxSide: number): HTMLCanvasElement {
  const { width, height } = fit(source.width, source.height, maxSide);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  const fromType = file.type.split("/")[1];
  return fromType ?? "bin";
}

/**
 * Кладёт файл в хранилище и возвращает публичный URL.
 *
 * На Vercel загрузка идёт из браузера прямо в Blob: serverless-функция
 * принимает не больше 4.5 МБ, а исходный рендер легко весит в разы больше.
 * Локально файл уходит в собственный маршрут, там ограничения нет.
 */
async function putFile(
  pathname: string,
  body: Blob,
  contentType: string,
  storageKind: StorageKind,
  onUploadProgress?: (ratio: number) => void,
): Promise<string> {
  if (storageKind === "blob") {
    const result = await upload(pathname, body, {
      access: "public",
      contentType,
      handleUploadUrl: "/api/admin/blob-upload",
      // крупные файлы уходят частями, с параллельной отправкой и ретраями
      multipart: body.size > 8 * 1024 * 1024,
      onUploadProgress: onUploadProgress
        ? ({ percentage }) => onUploadProgress(percentage / 100)
        : undefined,
    });
    return result.url;
  }

  const formData = new FormData();
  formData.append("file", body, pathname.split("/").pop() ?? "upload");
  formData.append("pathname", pathname);

  const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? "UPLOAD_FAILED");
  }

  const { url } = (await response.json()) as { url: string };
  return url;
}

export type UploadProgress = {
  /** Что происходит прямо сейчас — показывается в интерфейсе загрузки */
  stage: "preparing" | "uploading";
  /** Доля отправленного оригинала, 0…1 */
  ratio: number;
};

export async function uploadImage(
  file: File,
  storageKind: StorageKind,
  onProgress?: (progress: UploadProgress) => void,
): Promise<ImageAsset> {
  onProgress?.({ stage: "preparing", ratio: 0 });

  const bitmap = await createImageBitmap(file);
  let previews: { medium: Blob; thumb: Blob; blurDataURL: string };
  const width = bitmap.width;
  const height = bitmap.height;

  try {
    const [medium, thumb] = await Promise.all([
      toBlob(draw(bitmap, PREVIEW_SIZES.medium), PREVIEW_QUALITY),
      toBlob(draw(bitmap, PREVIEW_SIZES.thumb), PREVIEW_QUALITY),
    ]);
    previews = {
      medium,
      thumb,
      blurDataURL: draw(bitmap, 24).toDataURL("image/webp", 0.6),
    };
  } finally {
    bitmap.close();
  }

  const id = crypto.randomUUID();
  const folder = `uploads/${new Date().getFullYear()}`;
  const extension = extensionFor(file);

  onProgress?.({ stage: "uploading", ratio: 0 });

  // оригинал отправляем первым и отдельно: он самый тяжёлый
  const originalUrl = await putFile(
    `${folder}/${id}-original.${extension}`,
    file,
    file.type || "application/octet-stream",
    storageKind,
    // превью занимают последние проценты полосы прогресса
    (ratio) => onProgress?.({ stage: "uploading", ratio: ratio * 0.9 }),
  );

  onProgress?.({ stage: "uploading", ratio: 0.9 });

  const [mediumUrl, thumbUrl] = await Promise.all([
    putFile(`${folder}/${id}-md.webp`, previews.medium, "image/webp", storageKind),
    putFile(`${folder}/${id}-sm.webp`, previews.thumb, "image/webp", storageKind),
  ]);

  onProgress?.({ stage: "uploading", ratio: 1 });

  return {
    id,
    url: originalUrl,
    mediumUrl,
    thumbUrl,
    width,
    height,
    blurDataURL: previews.blurDataURL,
    bytes: file.size,
    format: file.type || "image/*",
    alt: { ru: "", en: "" },
  };
}

/**
 * Размеры SVG из самой разметки: createImageBitmap векторы не открывает
 * ни в одном браузере, а next/image без ширины и высоты не построит рамку
 * под картинку и страница будет прыгать при загрузке.
 *
 * viewBox точнее атрибутов width/height: он есть почти всегда и задаёт
 * пропорцию, тогда как width может стоять в процентах или em.
 */
async function svgSize(file: File): Promise<{ width: number; height: number }> {
  const markup = await file.text();

  const viewBox = markup.match(
    /viewBox\s*=\s*["']\s*[\d.eE+-]+[\s,]+[\d.eE+-]+[\s,]+([\d.eE+]+)[\s,]+([\d.eE+]+)/i,
  );
  if (viewBox) {
    return { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) };
  }

  const width = markup.match(/\bwidth\s*=\s*["']([\d.]+)(?:px)?["']/i);
  const height = markup.match(/\bheight\s*=\s*["']([\d.]+)(?:px)?["']/i);
  if (width && height) {
    return { width: Math.round(Number(width[1])), height: Math.round(Number(height[1])) };
  }

  throw new Error("SVG_NO_SIZE");
}

/**
 * Загрузка логотипа.
 *
 * От рендера он отличается всем: весит килобайты, показывается высотой
 * в пару десятков пикселей и чаще всего приходит вектором. Поэтому превью
 * ему не готовятся — они были бы тяжелее оригинала, — а в хранилище уходит
 * ровно один файл.
 */
export async function uploadLogo(
  file: File,
  storageKind: StorageKind,
  onProgress?: (progress: UploadProgress) => void,
): Promise<ImageAsset> {
  onProgress?.({ stage: "preparing", ratio: 0 });

  let width: number;
  let height: number;

  if (file.type === "image/svg+xml") {
    ({ width, height } = await svgSize(file));
  } else {
    const bitmap = await createImageBitmap(file);
    width = bitmap.width;
    height = bitmap.height;
    bitmap.close();
  }

  const id = crypto.randomUUID();

  onProgress?.({ stage: "uploading", ratio: 0 });

  const url = await putFile(
    `uploads/${new Date().getFullYear()}/${id}-logo.${extensionFor(file)}`,
    file,
    file.type || "application/octet-stream",
    storageKind,
    (ratio) => onProgress?.({ stage: "uploading", ratio }),
  );

  onProgress?.({ stage: "uploading", ratio: 1 });

  return {
    id,
    url,
    // Превью нет: везде показывается сам файл. Поля заполнены им же, чтобы
    // остальной код — удаление файлов, галереи — не спотыкался о пустоту.
    mediumUrl: url,
    thumbUrl: url,
    width,
    height,
    blurDataURL: "",
    bytes: file.size,
    format: file.type || "image/*",
    alt: { ru: "", en: "" },
  };
}

/** «12.4 МБ» — для показа веса оригинала в админке. */
export function formatBytes(bytes: number): string {
  if (!bytes) return "";
  const units = ["Б", "КБ", "МБ", "ГБ"];
  const power = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** power;
  return `${value.toFixed(value >= 10 || power === 0 ? 0 : 1)} ${units[power]}`;
}
