import { blobStorage } from "./blob";
import { localStorage } from "./local";
import { getBlobToken } from "./token";
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
  return Boolean(getBlobToken());
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

export { blobTokenVariableNames, getBlobToken } from "./token";
export type { StorageAdapter, StoredFile } from "./types";
