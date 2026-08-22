import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { getAdminPassword, getSessionSecret, isProduction } from "./secrets";

const COOKIE_NAME = "jm_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // две недели

function secretKey(): Uint8Array {
  return new TextEncoder().encode(getSessionSecret());
}

/** Сравнение без утечки времени: длина строк выравнивается хешированием буфера. */
export function passwordMatches(candidate: string): boolean {
  const expected = Buffer.from(getAdminPassword(), "utf8");
  const actual = Buffer.from(candidate, "utf8");
  if (expected.length !== actual.length) {
    // всё равно выполняем сравнение, чтобы время ответа не зависело от длины
    timingSafeEqual(expected, expected);
    return false;
  }
  return timingSafeEqual(expected, actual);
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** Бросает исключение, если запрос пришёл не от администратора. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) {
    throw new Error("UNAUTHORIZED");
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
