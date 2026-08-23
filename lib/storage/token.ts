/**
 * Поиск токена доступа к Vercel Blob.
 *
 * Имя переменной с токеном зависит от того, как подключали хранилище:
 *
 * - без префикса — `BLOB_READ_WRITE_TOKEN`;
 * - с префиксом — например `IKV_BLOB_READ_WRITE_TOKEN`;
 * - переменные, созданные подключением, Vercel помечает управляемыми и не
 *   даёт удалить вручную. Если от прежнего хранилища осталась переменная с
 *   каноническим именем, она будет перебивать новую — а убрать её из
 *   интерфейса невозможно.
 *
 * Поэтому есть `SITE_BLOB_TOKEN`: обычная переменная, которую заводят руками,
 * и она выигрывает у всех остальных. Это способ указать нужное хранилище явно,
 * не воюя с теми переменными, которые Vercel не отдаёт в управление.
 */
const OVERRIDE_NAME = "SITE_BLOB_TOKEN";
const CANONICAL_NAME = "BLOB_READ_WRITE_TOKEN";

function isTokenName(name: string): boolean {
  return name === OVERRIDE_NAME || name === CANONICAL_NAME || name.endsWith(`_${CANONICAL_NAME}`);
}

/** Приоритет: ручное переопределение, затем обычное имя, затем префиксные. */
function priority(name: string): number {
  if (name === OVERRIDE_NAME) return 0;
  if (name === CANONICAL_NAME) return 1;
  return 2;
}

/** Имена переменных с токеном, которые видит сервер. Значения не раскрываем. */
export function blobTokenVariableNames(): string[] {
  return Object.keys(process.env)
    .filter((name) => isTokenName(name) && Boolean(process.env[name]))
    .sort((a, b) => priority(a) - priority(b) || a.localeCompare(b));
}

export function getBlobToken(): string | undefined {
  const [name] = blobTokenVariableNames();
  return name ? process.env[name] : undefined;
}

/**
 * Имена всех переменных, относящихся к хранилищу, — чтобы в админке было
 * видно, что именно доходит до сервера, если токен назван неожиданно.
 * Возвращаем только имена: значения — это секреты.
 */
export function storageVariableNames(): string[] {
  return Object.keys(process.env)
    .filter((name) => name.includes("BLOB") || name.includes("STORAGE"))
    .filter((name) => Boolean(process.env[name]))
    .sort();
}
