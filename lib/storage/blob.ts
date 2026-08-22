import { del, head, put } from "@vercel/blob";
import { getBlobToken } from "./token";
import type { StorageAdapter, StoredFile } from "./types";

/**
 * Продакшн-хранилище: Vercel Blob. Включается автоматически, как только в
 * окружении появляется BLOB_READ_WRITE_TOKEN.
 *
 * Vercel Blob не позволяет кэшировать объект меньше минуты, поэтому при
 * чтении JSON-данных добавляем cache-buster и просим fetch не кэшировать —
 * иначе админка показывала бы устаревший контент сразу после сохранения.
 */
async function resolveUrl(pathname: string): Promise<string | null> {
  try {
    const meta = await head(pathname, { token: getBlobToken() });
    return meta.url;
  } catch {
    return null;
  }
}

export const blobStorage: StorageAdapter = {
  kind: "blob",

  async readText(pathname) {
    const url = await resolveUrl(pathname);
    if (!url) return null;
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.text();
  },

  async readBytes(pathname) {
    const url = await resolveUrl(pathname);
    if (!url) return null;
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  },

  async writeText(pathname, value, contentType = "application/json") {
    await put(pathname, value, {
      access: "public",
      token: getBlobToken(),
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  },

  async writeBytes(pathname, value, contentType) {
    await put(pathname, value, {
      access: "public",
      token: getBlobToken(),
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
  },

  async putFile(pathname, data, contentType): Promise<StoredFile> {
    const result = await put(pathname, data, {
      access: "public",
      token: getBlobToken(),
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      // картинки неизменяемы: имя содержит уникальный id, кэшируем на год
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return { url: result.url, pathname: result.pathname };
  },

  async deleteFiles(urls) {
    if (urls.length === 0) return;
    try {
      // del принимает публичные URL напрямую
      await del(urls, { token: getBlobToken() });
    } catch {
      // не блокируем удаление проекта из-за осиротевшего файла
    }
  },
};
