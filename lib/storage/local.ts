import { promises as fs } from "node:fs";
import path from "node:path";
import type { StorageAdapter } from "./types";

/**
 * Хранилище для локальной разработки: JSON-данные в .data/, картинки в
 * public/uploads/. Оба каталога исключены из git.
 */
const DATA_DIR = path.join(process.cwd(), ".data");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function dataPath(pathname: string) {
  return path.join(DATA_DIR, pathname.replaceAll("/", "__"));
}

function uploadPath(pathname: string) {
  // uploads/2026/abc.webp -> public/uploads/2026/abc.webp
  const relative = pathname.startsWith("uploads/") ? pathname.slice("uploads/".length) : pathname;
  return path.join(UPLOAD_DIR, relative);
}

async function ensureDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export const localStorage: StorageAdapter = {
  kind: "local",

  async readText(pathname) {
    try {
      return await fs.readFile(dataPath(pathname), "utf8");
    } catch {
      return null;
    }
  },

  async readBytes(pathname) {
    try {
      return await fs.readFile(dataPath(pathname));
    } catch {
      return null;
    }
  },

  async writeText(pathname, value) {
    const target = dataPath(pathname);
    await ensureDir(target);
    await fs.writeFile(target, value, "utf8");
  },

  async writeBytes(pathname, value) {
    const target = dataPath(pathname);
    await ensureDir(target);
    await fs.writeFile(target, value);
  },

  async putFile(pathname, data) {
    const target = uploadPath(pathname);
    await ensureDir(target);
    await fs.writeFile(target, data);
    const relative = pathname.startsWith("uploads/") ? pathname.slice("uploads/".length) : pathname;
    return { url: `/uploads/${relative}`, pathname };
  },

  async deleteFiles(urls) {
    await Promise.all(
      urls.map(async (url) => {
        // /uploads/2026/file.webp -> public/uploads/2026/file.webp
        if (!url.startsWith("/uploads/")) return;
        try {
          await fs.unlink(uploadPath(url.slice(1)));
        } catch {
          // файла уже нет — это не ошибка
        }
      }),
    );
  },
};
