import "server-only";
import { getStorage } from "./storage";
import { defaultSettings } from "./defaults";
import type { Project, Settings, SiteData } from "./types";

const DATA_PATH = "content/site.json";
const CACHE_TTL_MS = 5_000;

type CacheEntry = { data: SiteData; at: number };
let cache: CacheEntry | null = null;

function emptyData(): SiteData {
  return { version: 1, projects: [], settings: defaultSettings() };
}

/**
 * Настройки могли быть сохранены более старой версией сайта, поэтому
 * недостающие поля добираем из дефолтов, а не падаем на undefined.
 */
function mergeSettings(stored: Partial<Settings> | undefined): Settings {
  const base = defaultSettings();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    stats: stored.stats?.length ? stored.stats : base.stats,
    services: stored.services?.length ? stored.services : base.services,
    faq: stored.faq?.length ? stored.faq : base.faq,
  };
}

function normalize(raw: unknown): SiteData {
  if (!raw || typeof raw !== "object") return emptyData();
  const value = raw as Partial<SiteData>;
  return {
    version: value.version ?? 1,
    projects: Array.isArray(value.projects) ? value.projects : [],
    settings: mergeSettings(value.settings),
  };
}

export async function getSiteData(): Promise<SiteData> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return cache.data;

  const raw = await getStorage().readText(DATA_PATH);
  let data: SiteData;
  if (!raw) {
    data = emptyData();
  } else {
    try {
      data = normalize(JSON.parse(raw));
    } catch {
      // повреждённый JSON не должен ронять весь сайт
      data = emptyData();
    }
  }

  cache = { data, at: now };
  return data;
}

export async function saveSiteData(data: SiteData): Promise<void> {
  await getStorage().writeText(DATA_PATH, JSON.stringify(data, null, 2));
  cache = { data, at: Date.now() };
}

/** Сбрасывает кэш процесса — вызывается после записи из другого модуля. */
export function invalidateSiteCache(): void {
  cache = null;
}

export async function getSettings(): Promise<Settings> {
  return (await getSiteData()).settings;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const data = await getSiteData();
  await saveSiteData({ ...data, settings });
}

function byOrder(a: Project, b: Project): number {
  if (a.order !== b.order) return a.order - b.order;
  return b.createdAt.localeCompare(a.createdAt);
}

/** Все проекты, включая черновики — только для админки. */
export async function getAllProjects(): Promise<Project[]> {
  const data = await getSiteData();
  return [...data.projects].sort(byOrder);
}

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getAllProjects();
  return projects.filter((project) => project.published && project.cover !== null);
}

export async function getFeaturedProjects(limit = 4): Promise<Project[]> {
  const published = await getPublishedProjects();
  const featured = published.filter((project) => project.featured);
  const pool = featured.length > 0 ? featured : published;
  return pool.slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const data = await getSiteData();
  return data.projects.find((project) => project.slug === slug) ?? null;
}

export async function getProjectById(id: string): Promise<Project | null> {
  const data = await getSiteData();
  return data.projects.find((project) => project.id === id) ?? null;
}

/** Соседи по списку — для навигации «предыдущий / следующий проект». */
export async function getProjectNeighbours(
  slug: string,
): Promise<{ prev: Project | null; next: Project | null }> {
  const published = await getPublishedProjects();
  const index = published.findIndex((project) => project.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? published[index - 1] : published[published.length - 1] ?? null,
    next: index < published.length - 1 ? published[index + 1] : published[0] ?? null,
  };
}

export async function upsertProject(project: Project): Promise<void> {
  const data = await getSiteData();
  const index = data.projects.findIndex((item) => item.id === project.id);
  const projects = [...data.projects];
  if (index === -1) {
    projects.push(project);
  } else {
    projects[index] = project;
  }
  await saveSiteData({ ...data, projects });
}

export async function deleteProject(id: string): Promise<Project | null> {
  const data = await getSiteData();
  const project = data.projects.find((item) => item.id === id) ?? null;
  if (!project) return null;
  await saveSiteData({ ...data, projects: data.projects.filter((item) => item.id !== id) });
  return project;
}

export async function reorderProjects(orderedIds: string[]): Promise<void> {
  const data = await getSiteData();
  const position = new Map(orderedIds.map((id, index) => [id, index]));
  const projects = data.projects.map((project) => ({
    ...project,
    order: position.get(project.id) ?? project.order,
  }));
  await saveSiteData({ ...data, projects });
}

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** Транслитерация в url-совместимый slug: «Квартира в Москве» -> kvartira-v-moskve. */
export function slugify(input: string): string {
  const transliterated = input
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_MAP[char] ?? char)
    .join("");
  return transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Гарантирует уникальность слага среди существующих проектов. */
export async function uniqueSlug(desired: string, exceptId?: string): Promise<string> {
  const base = slugify(desired) || "project";
  const data = await getSiteData();
  const taken = new Set(
    data.projects.filter((project) => project.id !== exceptId).map((project) => project.slug),
  );
  if (!taken.has(base)) return base;
  let counter = 2;
  while (taken.has(`${base}-${counter}`)) counter += 1;
  return `${base}-${counter}`;
}
