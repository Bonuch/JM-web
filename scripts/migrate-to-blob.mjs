import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { head, put } from "@vercel/blob";

/**
 * Перенос локального контента в Vercel Blob.
 *
 *   npm run migrate:blob            — перенести
 *   npm run migrate:blob -- --dry   — показать план, ничего не загружая
 *   npm run migrate:blob -- --force — перезаписать данные, уже лежащие в Blob
 *
 * Проекты, добавленные на локальной машине, лежат в .data и public/uploads —
 * обе папки вне git, поэтому на боевом сайте их нет. Скрипт заливает файлы в
 * Blob, подменяет ссылки на новые и кладёт туда же сам файл с данными сайта.
 *
 * Нужен BLOB_READ_WRITE_TOKEN от того же хранилища, что подключено к проекту
 * на Vercel. Проще всего получить его так:
 *   npx vercel link      (один раз, привязать папку к проекту)
 *   npx vercel env pull .env.local
 */
const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, ".data", "content__site.json");
const LEADS_FILE = path.join(ROOT, ".data", "content__leads.enc");
const PUBLIC_DIR = path.join(ROOT, "public");
const REMOTE_DATA_PATH = "content/site.json";

const CONTENT_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry") || args.includes("--dry-run");
const force = args.includes("--force");

function formatBytes(bytes) {
  const units = ["Б", "КБ", "МБ", "ГБ"];
  const power = Math.min(units.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)));
  return `${(bytes / 1024 ** power).toFixed(power === 0 ? 0 : 1)} ${units[power]}`;
}

function isLocalUpload(url) {
  return typeof url === "string" && url.startsWith("/uploads/");
}

/** /uploads/2026/file.webp -> { file: public/uploads/..., pathname: uploads/... } */
function resolveLocal(url) {
  const relative = url.replace(/^\//, "");
  return { file: path.join(PUBLIC_DIR, relative), pathname: relative };
}

async function ensureToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return;
  console.error("Не задан BLOB_READ_WRITE_TOKEN — скрипту некуда загружать файлы.\n");
  console.error("Возьмите токен того хранилища, что подключено к проекту на Vercel:");
  console.error("  npx vercel link");
  console.error("  npx vercel env pull .env.local");
  console.error("\nПосле этого запустите перенос снова: npm run migrate:blob");
  process.exit(1);
}

async function readLocalData() {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8"));
  } catch {
    console.error(`Не нашли локальные данные: ${DATA_FILE}`);
    console.error("Похоже, переносить нечего — проекты добавляются через админку.");
    process.exit(1);
  }
}

/** Не затираем боевой контент молча: вдруг там уже что-то добавили. */
async function checkRemote() {
  try {
    const meta = await head(REMOTE_DATA_PATH);
    const response = await fetch(`${meta.url}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const remote = await response.json();
    const count = Array.isArray(remote.projects) ? remote.projects.length : 0;
    if (count > 0 && !force) {
      console.error(`В хранилище уже есть данные: проектов — ${count}.`);
      console.error("Перенос перезапишет их. Если это то, что нужно, повторите с флагом --force:");
      console.error("  npm run migrate:blob -- --force");
      process.exit(1);
    }
    if (count > 0) {
      console.log(`Внимание: в хранилище уже ${count} проект(ов), они будут заменены.\n`);
    }
  } catch {
    // файла ещё нет — это обычный первый перенос
  }
}

async function main() {
  // в режиме проверки токен не нужен: ничего никуда не отправляем
  if (!dryRun) await ensureToken();

  const data = await readLocalData();
  const projects = Array.isArray(data.projects) ? data.projects : [];

  // Один и тот же файл встречается в обложке и в списке кадров, поэтому
  // собираем уникальные адреса, чтобы не загружать одно и то же дважды.
  const localUrls = new Set();
  const collect = (asset) => {
    if (!asset) return;
    for (const key of ["url", "mediumUrl", "thumbUrl"]) {
      if (isLocalUpload(asset[key])) localUrls.add(asset[key]);
    }
  };

  for (const project of projects) {
    collect(project.cover);
    for (const image of project.images ?? []) collect(image);
  }
  collect(data.settings?.heroImage);

  if (localUrls.size === 0) {
    console.log("Локальных файлов не нашли — переносить нечего.");
    console.log("Возможно, работы уже загружены через админку на боевом сайте.");
    return;
  }

  let totalBytes = 0;
  const missing = [];
  for (const url of localUrls) {
    const { file } = resolveLocal(url);
    try {
      totalBytes += (await stat(file)).size;
    } catch {
      missing.push(url);
    }
  }

  console.log(`Проектов: ${projects.length}`);
  console.log(`Файлов к переносу: ${localUrls.size} (${formatBytes(totalBytes)})`);
  if (missing.length > 0) {
    console.log(`Не найдено на диске: ${missing.length} — такие ссылки останутся как есть.`);
  }

  if (dryRun) {
    console.log("\nРежим проверки: ничего не загружено.");
    return;
  }

  await checkRemote();
  console.log("\nЗагружаем…");

  const replacements = new Map();
  let uploaded = 0;
  let failed = 0;

  for (const url of localUrls) {
    const { file, pathname } = resolveLocal(url);
    try {
      const body = await readFile(file);
      const extension = path.extname(file).toLowerCase();
      const result = await put(pathname, body, {
        access: "public",
        contentType: CONTENT_TYPES[extension] ?? "application/octet-stream",
        addRandomSuffix: false,
        allowOverwrite: true,
        // имя файла содержит уникальный id, содержимое не меняется
        cacheControlMaxAge: 60 * 60 * 24 * 365,
        multipart: body.length > 8 * 1024 * 1024,
      });
      replacements.set(url, result.url);
      uploaded += 1;
      process.stdout.write(`\r  ${uploaded} из ${localUrls.size}`);
    } catch (error) {
      failed += 1;
      console.log(`\n  не удалось: ${url} — ${error.message}`);
    }
  }

  process.stdout.write("\n");

  if (replacements.size === 0) {
    console.error("Ни один файл не загрузился. Данные не меняем.");
    process.exit(1);
  }

  const rewrite = (asset) => {
    if (!asset) return asset;
    const next = { ...asset };
    for (const key of ["url", "mediumUrl", "thumbUrl"]) {
      const replacement = replacements.get(next[key]);
      if (replacement) next[key] = replacement;
    }
    return next;
  };

  const migrated = {
    ...data,
    projects: projects.map((project) => ({
      ...project,
      cover: rewrite(project.cover),
      images: (project.images ?? []).map(rewrite),
    })),
    settings: { ...data.settings, heroImage: rewrite(data.settings?.heroImage) },
  };

  await put(REMOTE_DATA_PATH, JSON.stringify(migrated, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
  });

  console.log(`\nГотово: ${uploaded} файлов (${formatBytes(totalBytes)}), проектов — ${projects.length}.`);
  if (failed > 0) console.log(`Не удалось перенести: ${failed}. Их можно догрузить через админку.`);

  try {
    await stat(LEADS_FILE);
    console.log(
      "\nЗаявки не переносятся: они зашифрованы локальным SESSION_SECRET, а на сервере ключ другой.",
    );
  } catch {
    // локальных заявок нет
  }

  console.log("\nСайт подхватит контент в течение пяти минут (столько живёт кэш страниц).");
  console.log("Чтобы увидеть сразу — сделайте Redeploy в панели Vercel.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
