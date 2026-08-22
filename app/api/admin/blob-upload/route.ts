import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthenticated } from "@/lib/auth";

/**
 * Выдаёт браузеру одноразовый токен, чтобы тот залил файл в Vercel Blob
 * напрямую. Так оригинал рендера любого веса минует serverless-функцию с её
 * лимитом в 4.5 МБ, а сервер по-прежнему решает, кому это можно.
 */
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
];

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // токен выдаём только администратору: кука приходит вместе с запросом
        if (!(await isAuthenticated())) {
          throw new Error("UNAUTHORIZED");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: false,
          // имя содержит uuid, поэтому совпадений быть не должно
          allowOverwrite: false,
          // оригиналы неизменяемы — кэшируем на год
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
      // Уведомление о завершении не используется: клиент получает URL прямо
      // из ответа upload() и сохраняет его вместе с проектом.
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPLOAD_FAILED";
    return NextResponse.json({ error: message }, { status: message === "UNAUTHORIZED" ? 401 : 400 });
  }
}
