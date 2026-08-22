/**
 * Поиск токена доступа к Vercel Blob.
 *
 * При подключении хранилища Vercel предлагает задать префикс для переменных
 * окружения. Если им воспользоваться, переменная получает имя вида
 * `IK_VISION_BLOB_READ_WRITE_TOKEN`, а библиотека @vercel/blob по умолчанию
 * читает строго `BLOB_READ_WRITE_TOKEN` — и хранилище выглядит неподключённым,
 * хотя оно на месте. Поэтому ищем токен и по префиксным именам тоже.
 */
const CANONICAL_NAME = "BLOB_READ_WRITE_TOKEN";

/** Имена переменных, похожих на токен хранилища. Значения не раскрываем. */
export function blobTokenVariableNames(): string[] {
  return Object.keys(process.env)
    .filter((name) => name === CANONICAL_NAME || name.endsWith(`_${CANONICAL_NAME}`))
    .filter((name) => Boolean(process.env[name]))
    .sort((a, b) => (a === CANONICAL_NAME ? -1 : b === CANONICAL_NAME ? 1 : a.localeCompare(b)));
}

export function getBlobToken(): string | undefined {
  const [name] = blobTokenVariableNames();
  return name ? process.env[name] : undefined;
}
