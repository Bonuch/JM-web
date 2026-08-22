"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, passwordMatches, requireAdmin } from "@/lib/auth";
import {
  deleteProject,
  getAllProjects,
  getProjectById,
  getSiteData,
  invalidateSiteCache,
  reorderProjects,
  saveSettings,
  uniqueSlug,
  upsertProject,
} from "@/lib/content";
import { deleteLead, formatLeadMessage, markLeadRead, notifyTelegram } from "@/lib/leads";
import {
  blobTokenVariableNames,
  getStorage,
  isBlobConfigured,
  storageVariableNames,
} from "@/lib/storage";
import type { ImageAsset, Project, Settings } from "@/lib/types";

/** Публичные страницы кэшируются, поэтому после каждой правки сбрасываем их. */
function revalidateSite() {
  invalidateSiteCache();
  revalidatePath("/[locale]", "layout");
}

export type LoginState = { error: string | null };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  if (!passwordMatches(password)) {
    return { error: "Неверный пароль" };
  }

  await createSession();
  // открытый редирект недопустим: принимаем только пути внутри админки
  redirect(from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/** Все URL картинок проекта — нужны, чтобы подчистить хранилище. */
function assetUrls(assets: (ImageAsset | null | undefined)[]): string[] {
  return assets
    .filter((asset): asset is ImageAsset => Boolean(asset))
    .flatMap((asset) => [asset.url, asset.mediumUrl, asset.thumbUrl])
    .filter(Boolean);
}

export async function saveProjectAction(input: Project): Promise<{ id: string; slug: string }> {
  await requireAdmin();

  const existing = await getProjectById(input.id);
  const now = new Date().toISOString();

  const slugSource = input.slug.trim() || input.title.ru || input.title.en || "project";
  const slug = await uniqueSlug(slugSource, input.id);

  const project: Project = {
    ...input,
    slug,
    cover: input.cover ?? input.images[0] ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  // картинки, удалённые из проекта, чистим и в хранилище
  if (existing) {
    const keptUrls = new Set(assetUrls([project.cover, ...project.images]));
    const orphaned = assetUrls([existing.cover, ...existing.images]).filter(
      (url) => !keptUrls.has(url),
    );
    if (orphaned.length > 0) {
      await getStorage().deleteFiles(orphaned);
    }
  }

  await upsertProject(project);
  revalidateSite();

  return { id: project.id, slug: project.slug };
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await deleteProject(id);
  if (removed) {
    const urls = assetUrls([removed.cover, ...removed.images]);
    if (urls.length > 0) await getStorage().deleteFiles(urls);
  }
  revalidateSite();
}

export async function togglePublishedAction(id: string): Promise<void> {
  await requireAdmin();
  const project = await getProjectById(id);
  if (!project) return;
  await upsertProject({
    ...project,
    published: !project.published,
    updatedAt: new Date().toISOString(),
  });
  revalidateSite();
}

export async function toggleFeaturedAction(id: string): Promise<void> {
  await requireAdmin();
  const project = await getProjectById(id);
  if (!project) return;
  await upsertProject({
    ...project,
    featured: !project.featured,
    updatedAt: new Date().toISOString(),
  });
  revalidateSite();
}

/** Перемещение проекта на одну позицию вверх или вниз по списку. */
export async function moveProjectAction(id: string, direction: "up" | "down"): Promise<void> {
  await requireAdmin();
  const projects = await getAllProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) return;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= projects.length) return;

  const ordered = [...projects];
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

  await reorderProjects(ordered.map((project) => project.id));
  revalidateSite();
}

export async function saveSettingsAction(settings: Settings): Promise<void> {
  await requireAdmin();

  // если из настроек убрали hero-изображение, удаляем и файл
  const current = await getSiteData();
  const previousHero = current.settings.heroImage;
  if (previousHero && previousHero.id !== settings.heroImage?.id) {
    await getStorage().deleteFiles(assetUrls([previousHero]));
  }

  await saveSettings(settings);
  revalidateSite();
}

export async function setLeadReadAction(id: string, read: boolean): Promise<void> {
  await requireAdmin();
  await markLeadRead(id, read);
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(id: string): Promise<void> {
  await requireAdmin();
  await deleteLead(id);
  revalidatePath("/admin/leads");
}

export type StorageCheck = {
  tokenPresent: boolean;
  kind: "local" | "blob";
  onVercel: boolean;
  ok: boolean;
  message: string;
  /** Имена переменных с токеном, которые видит сервер. Значения не раскрываем. */
  tokenVariables: string[];
  /** Все переменные, относящиеся к хранилищу, — на случай неожиданного имени. */
  storageVariables: string[];
};

/**
 * Проверка хранилища «по-настоящему»: пробуем записать и прочитать файл.
 * Наличия токена мало — стор может быть подключён не к тому проекту или не
 * разрешать публичные файлы, и узнать об этом лучше здесь, чем на середине
 * загрузки рендера.
 */
export async function checkStorageAction(): Promise<StorageCheck> {
  await requireAdmin();

  const storage = getStorage();
  const base = {
    tokenPresent: isBlobConfigured(),
    kind: storage.kind,
    onVercel: Boolean(process.env.VERCEL),
    tokenVariables: blobTokenVariableNames(),
    storageVariables: storageVariableNames(),
  };

  if (!base.tokenPresent && base.onVercel) {
    return {
      ...base,
      ok: false,
      message:
        "Токена хранилища нет в окружении. Проверьте в панели Vercel: Settings → Environment Variables. Если переменной BLOB_READ_WRITE_TOKEN там нет, хранилище связано не с этим проектом либо после связывания не было повторного деплоя.",
    };
  }

  const probePath = "content/.healthcheck";
  const stamp = new Date().toISOString();

  try {
    await storage.writeText(probePath, stamp, "text/plain");
    const readBack = await storage.readText(probePath);

    if (readBack?.trim() !== stamp) {
      return {
        ...base,
        ok: false,
        message: "Файл записался, но прочитать его обратно не удалось — проверьте настройки стора.",
      };
    }

    return {
      ...base,
      ok: true,
      message:
        storage.kind === "blob"
          ? "Хранилище Vercel Blob работает: тестовый файл записан и прочитан."
          : "Файлы сохраняются в папку проекта. Для локальной разработки это нормально.",
    };
  } catch (error) {
    return {
      ...base,
      ok: false,
      message: `Ошибка хранилища: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/** Проверка, что бот настроен и пишет в нужный чат. */
export async function sendTestNotificationAction(): Promise<{ ok: boolean }> {
  await requireAdmin();
  const ok = await notifyTelegram(
    formatLeadMessage({
      id: "test",
      name: "Проверка связи",
      contact: "—",
      message: "Если вы видите это сообщение, уведомления о заявках работают.",
      topic: "",
      source: "/admin/settings",
      locale: "ru",
      read: true,
      createdAt: new Date().toISOString(),
    }),
  );
  return { ok };
}
