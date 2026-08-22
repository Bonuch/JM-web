import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { isAuthenticated } from "@/lib/auth";
import { getUnreadLeadCount } from "@/lib/leads";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/lib/actions/admin";

/**
 * Настоящая проверка доступа. Проверка в proxy лишь оптимистична — она смотрит
 * на наличие куки, но не проверяет подпись, поэтому решение принимается здесь.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  const unread = await getUnreadLeadCount();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-xl text-sand">
              Управление
            </Link>
            <AdminNav unread={unread} />
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/ru"
              target="_blank"
              className="text-[11px] tracking-[0.16em] text-sand-dim uppercase transition-colors hover:text-brass"
            >
              Открыть сайт
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="text-[11px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-brass"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
    </div>
  );
}
