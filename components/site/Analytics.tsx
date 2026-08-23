"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { trackPageView } from "@/lib/analytics";

/**
 * Подключение аналитики.
 *
 * Vercel считает посещаемость и скорость страниц, Яндекс.Метрика — источники
 * трафика и поведение. Метрика включается только если задан номер счётчика,
 * поэтому на локальной машине и в чужих копиях проекта ничего не грузится.
 *
 * В админку это не подключается: считать нужно посетителей, а не собственные
 * заходы в панель управления.
 */
export function SiteAnalytics() {
  const pathname = usePathname();
  const counterId = process.env.NEXT_PUBLIC_METRIKA_ID;
  const initialised = useRef(false);

  // Переходы внутри сайта происходят без перезагрузки, поэтому счётчик о них
  // не узнает сам — сообщаем вручную. Первый просмотр считает init.
  useEffect(() => {
    if (!counterId) return;
    if (!initialised.current) {
      initialised.current = true;
      return;
    }
    trackPageView(window.location.href);
  }, [pathname, counterId]);

  // В разработке эти пакеты грузят отладочные скрипты со своего домена и всё
  // равно ничего не считают. Локальной работе это только мешает: лишние
  // внешние запросы и ошибки в консоли, когда сети нет.
  const collectVercelStats = process.env.NODE_ENV === "production";

  return (
    <>
      {collectVercelStats && (
        <>
          <VercelAnalytics />
          <SpeedInsights />
        </>
      )}

      {counterId && (
        <>
          <Script
            id="yandex-metrika"
            src="https://mc.yandex.ru/metrika/tag.js"
            strategy="afterInteractive"
            onLoad={() => {
              window.ym?.(Number(counterId), "init", {
                webvisor: true,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                defer: true,
              });
              trackPageView(window.location.href);
            }}
          />
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://mc.yandex.ru/watch/${counterId}`}
                style={{ position: "absolute", left: "-9999px" }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}
    </>
  );
}
