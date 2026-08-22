import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ImageAsset, Locale } from "@/lib/types";
import { t } from "@/lib/i18n";

/**
 * showcase — крупный показ: обложка кейса, первый экран, кадры в галерее.
 * card — карточка в сетке, где изображение занимает пару сотен пикселей.
 * tiny — служебные превью (админка).
 */
type Variant = "showcase" | "card" | "tiny";

function sourceFor(asset: ImageAsset, variant: Variant): string {
  if (variant === "tiny") return asset.thumbUrl || asset.mediumUrl || asset.url;
  if (variant === "card") return asset.mediumUrl || asset.url;
  return asset.url;
}

export function AssetImage({
  asset,
  locale,
  variant = "card",
  sizes,
  priority = false,
  className,
  alt,
  original = false,
}: {
  asset: ImageAsset;
  locale: Locale;
  variant?: Variant;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Переопределяет alt из данных — например, названием проекта */
  alt?: string;
  /**
   * Отдавать исходный файл без обработки. Тогда браузер получает ровно тот
   * рендер, который загрузили в админку, — без повторного сжатия в WebP/AVIF.
   */
  original?: boolean;
}) {
  const src = sourceFor(asset, variant);
  const hasBlur = Boolean(asset.blurDataURL);
  // без оптимизации отдаём оригинал только для крупных планов: в мелкой
  // карточке разницу не увидеть, а вес страницы вырос бы в разы
  const unoptimized = original && variant === "showcase";

  return (
    <Image
      src={src}
      alt={alt ?? t(asset.alt, locale)}
      fill
      sizes={sizes}
      priority={priority}
      quality={variant === "showcase" ? 95 : 90}
      unoptimized={unoptimized}
      placeholder={hasBlur ? "blur" : "empty"}
      blurDataURL={hasBlur ? asset.blurDataURL : undefined}
      className={cn("object-cover", className)}
    />
  );
}
