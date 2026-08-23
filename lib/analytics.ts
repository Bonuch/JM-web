import { track } from "@vercel/analytics";

/**
 * Отправка событий в аналитику.
 *
 * Считаем в двух местах сразу: Vercel показывает посещаемость и скорость, а
 * Яндекс.Метрика — источники трафика, поведение и вебвизор. Оба подключения
 * необязательны: если счётчик не настроен, вызовы просто ничего не делают.
 */
declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: unknown[]) => void;
  }
}

function metrikaId(): number | null {
  const raw = process.env.NEXT_PUBLIC_METRIKA_ID;
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

/** Просмотр страницы при переходе внутри сайта (обычную загрузку считает сам счётчик). */
export function trackPageView(url: string): void {
  const id = metrikaId();
  if (id && typeof window !== "undefined" && window.ym) {
    window.ym(id, "hit", url);
  }
}

/**
 * Целевое действие. Главная цель у сайта одна — отправленная заявка,
 * по ней и считается, окупается ли реклама и какие страницы приводят клиентов.
 */
export function trackGoal(goal: string, params?: Record<string, string>): void {
  const id = metrikaId();
  if (id && typeof window !== "undefined" && window.ym) {
    window.ym(id, "reachGoal", goal, params);
  }

  try {
    track(goal, params);
  } catch {
    // аналитика не должна ломать интерфейс, если скрипт не загрузился
  }
}

export const GOAL_LEAD_SUBMITTED = "lead_submitted";
