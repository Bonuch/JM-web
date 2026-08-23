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
import { LOCALES, type ImageAsset, type Project, type Settings } from "@/lib/types";

/**
 * Результат действия админки.
 *
 * Любая правка пишет данные в хранилище, и если оно недоступно, исключение из
 * серверного действия обрушивает страницу целиком — вместо интерфейса человек
 * видит «A server error occurred». Поэтому действия не бросают ошибку, а
 * возвращают её текст, и админка остаётся рабочей.
 */
export type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

/**
 * Приватное хранилище не отдаёт файлы по прямой ссылке, а сайту это нужно:
 * картинки открываются браузером напрямую с CDN. Ошибку про access стоит
 * объяснить словами, иначе она читается как сбой сайта.
 */
const PRIVATE_STORE_HINT =
  "Хранилище создано с приватным доступом, а сайту нужны публичные файлы: изображения открываются в браузере по прямой ссылке. Создайте публичное хранилище (Storage → Create → Blob) и подключите его к проекту.";

function describeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message === "UNAUTHORIZED") {
    return "Сессия истекла — войдите заново.";
  }
  if (/private store|private access/i.test(message)) {
    return PRIVATE_STORE_HINT;
  }
  // на Vercel диск доступен только для чтения: так выглядит запись без Blob
  if (/EROFS|read-only|ENOENT|EACCES|EPERM/i.test(message)) {
    return "Хранилище недоступно для записи. Проверьте, подключено ли к проекту Vercel Blob: Настройки → Служебное → Проверить хранилище.";
  }
  if (/token/i.test(message)) {
    return `Хранилище не приняло запрос: ${message}`;
  }
  return `Не удалось сохранить: ${message}`;
}

/**
 * Публичные страницы отдаются из кэша, поэтому после каждой правки его нужно
 * сбросить. Одного шаблона `/[locale]` мало: страницы собраны заранее под
 * конкретные языки, и надёжнее перечислить их прямо — иначе правка появляется
 * только после того, как истечёт срок жизни кэша.
 */
function revalidateSite() {
  invalidateSiteCache();

  revalidatePath("/[locale]", "layout");

  for (const locale of LOCALES) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/portfolio`);
    revalidatePath(`/${locale}/services`);
    revalidatePath(`/${locale}/contacts`);
    revalidatePath(`/${locale}/portfolio/[slug]`, "page");
  }
}

/** Сброс кэша по кнопке — на случай, если правка почему-то не проявилась. */
export async function refreshSiteAction(): Promise<ActionResult> {
  try {
    await requireAdmin();
    revalidateSite();
    return { ok: true };
  } catch (error) {
    return { ok: false, error: describeFailure(error) };
  }
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

export async function saveProjectAction(
  input: Project,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
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

    return { ok: true, data: { id: project.id, slug: project.slug } };
  } catch (error) {
    console.error("Не удалось сохранить проект", error);
    return { ok: false, error: describeFailure(error) };
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const removed = await deleteProject(id);
    if (removed) {
      const urls = assetUrls([removed.cover, ...removed.images]);
      if (urls.length > 0) await getStorage().deleteFiles(urls);
    }
    revalidateSite();
    return { ok: true };
  } catch (error) {
    console.error("Не удалось удалить проект", error);
    return { ok: false, error: describeFailure(error) };
  }
}

async function toggleFlag(id: string, flag: "published" | "featured"): Promise<ActionResult> {
  try {
    await requireAdmin();
    const project = await getProjectById(id);
    if (!project) return { ok: false, error: "Проект не найден." };

    await upsertProject({
      ...project,
      [flag]: !project[flag],
      updatedAt: new Date().toISOString(),
    });
    revalidateSite();
    return { ok: true };
  } catch (error) {
    console.error("Не удалось изменить статус проекта", error);
    return { ok: false, error: describeFailure(error) };
  }
}

export async function togglePublishedAction(id: string): Promise<ActionResult> {
  return toggleFlag(id, "published");
}

export async function toggleFeaturedAction(id: string): Promise<ActionResult> {
  return toggleFlag(id, "featured");
}

/** Перемещение проекта на одну позицию вверх или вниз по списку. */
export async function moveProjectAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const projects = await getAllProjects();
    const index = projects.findIndex((project) => project.id === id);
    if (index === -1) return { ok: false, error: "Проект не найден." };

    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= projects.length) return { ok: true };

    const ordered = [...projects];
    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];

    await reorderProjects(ordered.map((project) => project.id));
    revalidateSite();
    return { ok: true };
  } catch (error) {
    console.error("Не удалось изменить порядок проектов", error);
    return { ok: false, error: describeFailure(error) };
  }
}

export async function saveSettingsAction(settings: Settings): Promise<ActionResult> {
  try {
    await requireAdmin();

    // если из настроек убрали hero-изображение, удаляем и файл
    const current = await getSiteData();
    const previousHero = current.settings.heroImage;
    if (previousHero && previousHero.id !== settings.heroImage?.id) {
      await getStorage().deleteFiles(assetUrls([previousHero]));
    }

    await saveSettings(settings);
    revalidateSite();
    return { ok: true };
  } catch (error) {
    console.error("Не удалось сохранить настройки", error);
    return { ok: false, error: describeFailure(error) };
  }
}

export async function setLeadReadAction(id: string, read: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await markLeadRead(id, read);
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (error) {
    console.error("Не удалось обновить заявку", error);
    return { ok: false, error: describeFailure(error) };
  }
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await deleteLead(id);
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (error) {
    console.error("Не удалось удалить заявку", error);
    return { ok: false, error: describeFailure(error) };
  }
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
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...base,
      ok: false,
      message: /private store|private access/i.test(message)
        ? `${PRIVATE_STORE_HINT} Исходная ошибка: ${message}`
        : `Ошибка хранилища: ${message}`,
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
