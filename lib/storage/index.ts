import { blobStorage } from "./blob";
import { localStorage } from "./local";
import type { StorageAdapter } from "./types";

let cached: StorageAdapter | null = null;

/**
 * Vercel Blob, если задан токен, иначе локальная файловая система.
 * Так `npm run dev` работает сразу после клонирования, без облачных сервисов.
 */
export function getStorage(): StorageAdapter {
  if (!cached) {
    cached = isBlobConfigured() ? blobStorage : localStorage;
  }
  return cached;
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * На Vercel файловая система доступна только для чтения, поэтому запасной
 * локальный вариант там не работает: без подключённого Blob загрузка файлов
 * обречена. Отличаем этот случай, чтобы админка сказала об этом прямо, а не
 * показывала невнятную ошибку записи.
 */
export function isReadOnlyDeployment(): boolean {
  return Boolean(process.env.VERCEL) && !isBlobConfigured();
}

export type { StorageAdapter, StoredFile } from "./types";
