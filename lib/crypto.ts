import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { getSessionSecret } from "./secrets";

/**
 * Заявки содержат персональные данные, а объекты в Vercel Blob доступны по
 * прямой ссылке. Поэтому файл с заявками шифруется AES-256-GCM: даже если
 * URL станет известен, содержимое прочитать нельзя.
 *
 * Формат: salt(16) | iv(12) | authTag(16) | ciphertext
 */
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(getSessionSecret(), salt, 32);
}

export function encryptJson(value: unknown): Buffer {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(salt), iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([salt, iv, cipher.getAuthTag(), ciphertext]);
}

export function decryptJson<T>(payload: Buffer): T | null {
  try {
    if (payload.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) return null;
    const salt = payload.subarray(0, SALT_LENGTH);
    const iv = payload.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = payload.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const ciphertext = payload.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(salt), iv);
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch {
    // неверный ключ или повреждённый файл — считаем, что данных нет
    return null;
  }
}
