import type { Project } from "./types";

/** Заготовка нового проекта — все поля заполнены, чтобы форма была управляемой. */
export function emptyProject(): Project {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    slug: "",
    title: { ru: "", en: "" },
    category: "apartment",
    location: { ru: "", en: "" },
    area: "",
    year: String(new Date().getFullYear()),
    style: { ru: "", en: "" },
    excerpt: { ru: "", en: "" },
    description: { ru: "", en: "" },
    cover: null,
    images: [],
    featured: false,
    published: false,
    order: 0,
    createdAt: now,
    updatedAt: now,
  };
}
