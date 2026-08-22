import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale, type Localized } from "@/lib/types";
import { ru, type Dictionary } from "./ru";
import { en } from "./en";

const dictionaries: Record<Locale, Dictionary> = { ru, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

/** Достаёт нужный язык, откатываясь на второй, если перевод не заполнен. */
export function t(value: Localized | undefined | null, locale: Locale): string {
  if (!value) return "";
  const primary = value[locale]?.trim();
  if (primary) return primary;
  const fallback = locale === "ru" ? value.en : value.ru;
  return fallback?.trim() ?? "";
}

/** Ссылка внутри сайта с текущей локалью: localePath("ru", "/portfolio"). */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Русское склонение: 1 проект / 2 проекта / 5 проектов. */
export function plural(count: number, dict: Dictionary): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return dict.portfolio.countOne;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return dict.portfolio.countFew;
  return dict.portfolio.countMany;
}

export { LOCALES, DEFAULT_LOCALE, isLocale };
export type { Locale, Dictionary };
