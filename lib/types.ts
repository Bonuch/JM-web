/** Строка, у которой есть версия на каждом языке сайта. */
export type Localized = { ru: string; en: string };

export const LOCALES = ["ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Одно изображение. Оригинал сохраняется как есть — без уменьшения и без
 * перекодирования, чтобы рендер можно было показать в исходном качестве.
 * Дополнительно браузер готовит два лёгких превью: они нужны только там,
 * где кадр физически занимает пару сотен пикселей (сетка, админка).
 */
export type ImageAsset = {
  id: string;
  /** Исходный файл ровно в том виде, в котором его загрузили */
  url: string;
  /** До 2048px по длинной стороне — превью для сеток */
  mediumUrl: string;
  /** До 800px по длинной стороне — мелкие карточки и админка */
  thumbUrl: string;
  width: number;
  height: number;
  /** base64-заглушка, показывается пока грузится основной файл */
  blurDataURL: string;
  /** Размер оригинала в байтах — виден в админке */
  bytes: number;
  /** MIME-тип оригинала */
  format: string;
  alt: Localized;
};

export const CATEGORY_KEYS = [
  "apartment",
  "house",
  "commercial",
  "furniture",
] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export type Project = {
  id: string;
  slug: string;
  title: Localized;
  category: CategoryKey;
  /** Город / ЖК */
  location: Localized;
  /** Площадь, например «86 м²» */
  area: string;
  year: string;
  /** Стиль интерьера */
  style: Localized;
  /** Короткая подводка для карточки и мета-описания */
  excerpt: Localized;
  /** Полное описание кейса, абзацы разделяются пустой строкой */
  description: Localized;
  cover: ImageAsset | null;
  images: ImageAsset[];
  /** Показывать в блоке избранного на главной */
  featured: boolean;
  published: boolean;
  /** Меньше — выше в списке */
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceItem = {
  id: string;
  title: Localized;
  description: Localized;
  /** Цена как строка, чтобы можно было писать «от 3 500 ₽» */
  price: Localized;
  /** Срок выполнения */
  duration: Localized;
  /** Что входит в услугу */
  includes: Localized[];
  /** Выделить как основной тариф */
  highlighted: boolean;
  order: number;
};

export type FaqItem = {
  id: string;
  question: Localized;
  answer: Localized;
  order: number;
};

export type StatItem = {
  id: string;
  value: string;
  label: Localized;
};

export type Settings = {
  siteName: string;
  /**
   * true — везде отдаём исходные файлы без сжатия (максимальное качество,
   * страницы тяжелее). false — крупные кадры проходят через оптимизацию
   * Next.js с качеством 95, а оригинал остаётся в полноэкранном просмотре.
   */
  originalQuality: boolean;
  /** Подзаголовок в шапке и в hero */
  role: Localized;
  heroTitle: Localized;
  heroSubtitle: Localized;
  /** Фон hero-секции; если пусто — берётся обложка избранного проекта */
  heroImage: ImageAsset | null;
  email: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  instagram: string;
  behance: string;
  pinterest: string;
  city: Localized;
  stats: StatItem[];
  services: ServiceItem[];
  faq: FaqItem[];
};

export type Lead = {
  id: string;
  name: string;
  contact: string;
  message: string;
  /** Выбранный тариф или тип проекта */
  topic: string;
  /** Страница, с которой пришла заявка */
  source: string;
  locale: Locale;
  read: boolean;
  createdAt: string;
};

/** Публичные данные сайта: то, что видно посетителю. */
export type SiteData = {
  version: number;
  projects: Project[];
  settings: Settings;
};
