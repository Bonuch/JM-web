"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, localeFromPath } from "@/lib/i18n";
import { socialLinks } from "@/lib/socials";
import type { Settings } from "@/lib/types";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollProgress } from "./ScrollProgress";
import { SiteLoading } from "./Preloader";

/**
 * Постоянный каркас сайта.
 *
 * Он намеренно смонтирован выше сегмента [locale]: клиентский роутер Next
 * различает сегменты по значению, поэтому /ru и /en — это разные узлы дерева,
 * и всё, что лежит внутри, при смене языка пересобирается с нуля. Отсюда
 * заставка второй раз, переинициализация инерционной прокрутки и прыжок
 * в начало страницы.
 *
 * Здесь же язык берётся не из params (их выше сегмента нет), а из адреса.
 */
export function SiteShell({ settings, children }: { settings: Settings; children: ReactNode }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const dict = getDictionary(locale);

  // <html> отрисован серверным layout, который про язык не знает: держим
  // атрибут в актуальном состоянии сами (см. комментарий в (site)/layout.tsx).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <SiteLoading>
      <SmoothScroll>
        <ScrollProgress />
        <CustomCursor />
        <Header
          locale={locale}
          dict={dict}
          siteName={settings.siteName}
          contacts={{
            email: settings.email,
            phone: settings.phone,
            socials: socialLinks(settings),
          }}
        />
        <main id="main">{children}</main>
        <Footer locale={locale} dict={dict} settings={settings} />
      </SmoothScroll>
    </SiteLoading>
  );
}
