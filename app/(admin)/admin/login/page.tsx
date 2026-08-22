import { LoginForm } from "@/components/admin/LoginForm";
import { usingDevCredentials } from "@/lib/secrets";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-[11px] tracking-[0.24em] text-brass uppercase">Управление сайтом</p>
        <h1 className="mt-4 font-display text-4xl text-sand">Вход</h1>
        <p className="mt-3 text-sm text-muted">
          Введите пароль администратора, чтобы добавлять проекты и менять настройки.
        </p>

        <LoginForm from={from} />

        {usingDevCredentials() && (
          <p className="mt-8 rounded border border-brass/30 bg-brass/5 p-4 text-xs leading-relaxed text-sand-dim">
            Переменные <code className="text-brass">ADMIN_PASSWORD</code> и{" "}
            <code className="text-brass">SESSION_SECRET</code> не заданы. Сейчас работает пароль по
            умолчанию <code className="text-brass">admin</code> — задайте свои значения в{" "}
            <code className="text-brass">.env.local</code> до публикации сайта.
          </p>
        )}
      </div>
    </main>
  );
}
