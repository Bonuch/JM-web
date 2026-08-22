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
    cached = process.env.BLOB_READ_WRITE_TOKEN ? blobStorage : localStorage;
  }
  return cached;
}

export type { StorageAdapter, StoredFile } from "./types";
