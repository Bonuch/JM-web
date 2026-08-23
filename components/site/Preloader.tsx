"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PreloaderScene } from "./PreloaderScene";

/**
 * Заставка первого захода: пока грузятся шрифты и тяжёлые рендеры, на экране
 * дорисовывается контур интерьера, а полоса внизу показывает прогресс.
 *
 * Через контекст сообщается момент, когда заставка ушла, — первый экран
 * начинает свою анимацию именно тогда, а не под перекрытием.
 */
const SiteReadyContext = createContext(true);

export function useSiteReady(): boolean {
  return useContext(SiteReadyContext);
}

/** Ключ в sessionStorage: полную заставку показываем раз за визит. */
const SEEN_KEY = "jm_intro_seen";

/** Минимальная длительность, чтобы чертёж успел прорисоваться. */
const MIN_DURATION_MS = 1500;
const REPEAT_DURATION_MS = 450;

export function SiteLoading({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    // повторные заходы в рамках визита не должны стоить полутора секунд
    const seen = sessionStorage.getItem(SEEN_KEY) === "1";
    const duration = reduced ? 0 : seen ? REPEAT_DURATION_MS : MIN_DURATION_MS;

    startedAt.current = performance.now();
    let frame = 0;
    let loaded = document.readyState === "complete";

    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;

      // время задаёт нижнюю границу, готовность страницы — верхнюю:
      // полоса не «застывает» на медленной сети и не врёт на быстрой
      const byTime = duration === 0 ? 1 : Math.min(1, elapsed / duration);
      const ceiling = loaded ? 1 : 0.9;
      const target = Math.min(ceiling, byTime);

      // Значение считаем от прошедшего времени, а не накапливаем по кадрам:
      // пока грузится страница, кадры пропускаются пачками, и накопление
      // давало рывок с единиц процентов сразу к половине шкалы.
      // Плавность обеспечивают CSS-переходы у полосы и линий сцены.
      setProgress((current) => (target > current ? target : current));

      if (elapsed >= duration && loaded) {
        setProgress(1);
        sessionStorage.setItem(SEEN_KEY, "1");
        // короткая пауза на «досмотреть» финальный штрих
        window.setTimeout(() => setVisible(false), reduced ? 0 : 280);
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
    };
  }, [reduced]);

  // пока висит заставка, страница под ней не должна прокручиваться
  useEffect(() => {
    if (!visible) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [visible]);

  return (
    <SiteReadyContext.Provider value={ready}>
      {children}

      <AnimatePresence onExitComplete={() => setReady(true)}>
        {visible && (
          <motion.div
            key="preloader"
            className="fixed inset-0 z-200 flex flex-col items-center justify-center bg-ink px-6"
            initial={false}
            exit={
              reduced
                ? { opacity: 0 }
                : { clipPath: "inset(0 0 100% 0)", transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] } }
            }
          >
            <div className="grain-overlay" />

            <div className="relative flex w-full max-w-4xl flex-col items-center">
              <PreloaderScene progress={progress} />

              <div className="mt-10 w-full max-w-md">
                <div className="h-px w-full bg-line">
                  <div
                    className="h-px bg-brass"
                    style={{
                      width: `${Math.round(progress * 100)}%`,
                      transition: "width 420ms ease-out",
                    }}
                  />
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[10px] tracking-[0.28em] text-muted uppercase">
                    Загружаем интерьер
                  </span>
                  <span className="text-[11px] text-sand-dim tabular-nums">
                    {String(Math.round(progress * 100)).padStart(3, "0")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteReadyContext.Provider>
  );
}
