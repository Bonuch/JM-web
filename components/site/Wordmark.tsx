import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/types";

/**
 * Марка сайта в шапке и подвале: загруженный логотип, а пока его нет —
 * название, набранное разрядкой.
 *
 * Развилка живёт в одном месте намеренно: шапка и подвал должны показывать
 * одно и то же, а два одинаковых условия в разных файлах рано или поздно
 * разойдутся.
 */
export function Wordmark({
  logo,
  siteName,
  imageClassName,
  textClassName,
}: {
  logo: ImageAsset | null;
  siteName: string;
  /** Задаёт логотипу высоту — ширину он подберёт по своим пропорциям */
  imageClassName?: string;
  textClassName?: string;
}) {
  if (!logo) return <span className={textClassName}>{siteName}</span>;

  return (
    <Image
      src={logo.url}
      alt={siteName}
      width={logo.width}
      height={logo.height}
      className={cn("w-auto", imageClassName)}
      // Логотип весит килобайты, и он же — первое, что видно на странице:
      // отложенная загрузка тут экономила бы ничто ценой пустого места.
      priority
      // Оптимизировать нечего: файл и так мал, а SVG проходить через
      // оптимизатор Next и вовсе не умеет без отдельного разрешения.
      unoptimized
    />
  );
}
