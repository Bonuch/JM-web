import "server-only";

/**
 * Секреты приложения. В разработке подставляются заглушки, чтобы проект
 * запускался сразу после клонирования; в продакшне отсутствие переменной —
 * это ошибка конфигурации, о которой надо узнать при первом же запросе.
 */
const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";
const DEV_FALLBACK_PASSWORD = "admin";

export const isProduction = process.env.NODE_ENV === "production";

export function getSessionSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 16) return value;
  if (isProduction) {
    throw new Error(
      "SESSION_SECRET не задан. Добавьте переменную окружения длиной не менее 16 символов.",
    );
  }
  return DEV_FALLBACK_SECRET;
}

export function getAdminPassword(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (value && value.length > 0) return value;
  if (isProduction) {
    throw new Error("ADMIN_PASSWORD не задан. Без него вход в админку невозможен.");
  }
  return DEV_FALLBACK_PASSWORD;
}

/** Показывать ли в админке предупреждение о небезопасных значениях по умолчанию. */
export function usingDevCredentials(): boolean {
  return !process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET;
}
