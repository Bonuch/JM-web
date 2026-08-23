"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/admin", label: "Проекты", exact: true },
  { href: "/admin/leads", label: "Заявки", exact: false },
  { href: "/admin/settings", label: "Настройки", exact: false },
];

export function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href || pathname.startsWith("/admin/projects")
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative text-[11px] tracking-[0.16em] uppercase transition-colors",
              active ? "text-accent" : "text-sand-dim hover:text-sand",
            )}
          >
            {item.label}
            {item.href === "/admin/leads" && unread > 0 && (
              <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-ink">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
