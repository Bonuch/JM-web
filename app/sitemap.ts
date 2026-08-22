import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content";
import { LOCALES } from "@/lib/types";

const STATIC_PATHS = ["", "/portfolio", "/services", "/contacts"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const projects = await getPublishedProjects();
  const now = new Date();

  const staticEntries = LOCALES.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
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
