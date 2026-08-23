import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content";
import { LOCALES } from "@/lib/types";

const STATIC_PATHS = [
  { path: "", priority: 1 },
  { path: "/portfolio", priority: 0.8 },
  { path: "/services", priority: 0.8 },
  { path: "/contacts", priority: 0.8 },
  // служебная страница: индексировать стоит, но выше работ ей не место
  { path: "/privacy", priority: 0.3 },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const projects = await getPublishedProjects();
  const now = new Date();

  const staticEntries = LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((entry) => ({
      url: `${base}/${locale}${entry.path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: entry.priority,
    })),
  );

  const projectEntries = LOCALES.flatMap((locale) =>
    projects.map((project) => ({
      url: `${base}/${locale}/portfolio/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...projectEntries];
}
