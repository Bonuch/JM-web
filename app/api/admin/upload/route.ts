import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getStorage, isReadOnlyDeployment } from "@/lib/storage";

/**
 * Приём файла при локальной разработке: файл кладётся в public/uploads как
 * есть, без сжатия. На Vercel этот маршрут не используется — там браузер
 * грузит оригинал прямо в Blob (см. /api/admin/blob-upload), потому что
 * serverless-функция не пропустила бы файл тяжелее 4.5 МБ.
 */
const ALLOWED_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/avif",
  "image/tiff",
  "application/octet-stream",
];

/** Путь приходит от клиента, поэтому проверяем его форму до записи на диск. */
const SAFE_PATHNAME = /^uploads\/\d{4}\/[a-zA-Z0-9-]+\.[a-zA-Z0-9]{2,5}$/;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  // Диск на Vercel только для чтения: без Blob сохранять файл просто некуда
  if (isReadOnlyDeployment()) {
    return NextResponse.json({ error: "BLOB_NOT_CONFIGURED" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const pathname = String(formData.get("pathname") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  if (!SAFE_PATHNAME.test(pathname)) {
    return NextResponse.json({ error: "BAD_PATHNAME" }, { status: 400 });
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "UNSUPPORTED_TYPE" }, { status: 415 });
  }

  try {
    const stored = await getStorage().putFile(
      pathname,
      Buffer.from(await file.arrayBuffer()),
      file.type || "application/octet-stream",
    );
    return NextResponse.json({ url: stored.url });
  } catch (error) {
    console.error("Не удалось сохранить изображение", error);
    return NextResponse.json({ error: "STORAGE_FAILED" }, { status: 500 });
  }
}
