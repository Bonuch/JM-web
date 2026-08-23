"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { deleteLeadAction, setLeadReadAction, type ActionResult } from "@/lib/actions/admin";
import type { Lead } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

/** Определяет, можно ли по контакту сразу написать или позвонить. */
function contactHref(contact: string): string | null {
  const value = contact.trim();
  if (value.includes("@") && !value.startsWith("@")) return `mailto:${value}`;
  if (value.startsWith("@")) return `https://t.me/${value.slice(1)}`;
  const digits = value.replace(/[^+\d]/g, "");
  if (digits.length >= 7) return `tel:${digits}`;
  return null;
}

export function LeadList({ leads }: { leads: Lead[] }) {
  const [pending, startTransition] = useTransition();
  const [openId, setOpenId] = useState<string | null>(leads.find((lead) => !lead.read)?.id ?? null);
  const [error, setError] = useState<string | null>(null);

  /** Действия возвращают причину сбоя вместо исключения — показываем её. */
  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (!result.ok) setError(result.error);
    });

  return (
    <div className={cn("mt-8 border-t border-line", pending && "opacity-60")}>
      {error && (
        <p className="border-b border-accent/30 bg-accent/10 px-4 py-3 text-xs leading-relaxed text-sand">
          {error}
        </p>
      )}

      {leads.map((lead) => {
        const open = openId === lead.id;
        const href = contactHref(lead.contact);

        return (
          <div key={lead.id} className="border-b border-line">
            <button
              type="button"
              onClick={() => {
                setOpenId(open ? null : lead.id);
                if (!lead.read) run(() => setLeadReadAction(lead.id, true));
              }}
              className="flex w-full items-center gap-4 py-5 text-left"
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full",
                  lead.read ? "bg-transparent" : "bg-accent",
                )}
                aria-hidden="true"
              />
              <span className="min-w-32 flex-1">
                <span className="block text-sm text-sand">{lead.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{lead.contact}</span>
              </span>
              {lead.topic && (
                <span className="hidden text-xs text-sand-dim sm:block">{lead.topic}</span>
              )}
              <span className="shrink-0 text-xs text-muted">
                {dateFormatter.format(new Date(lead.createdAt))}
              </span>
            </button>

            {open && (
              <div className="pb-6 pl-6">
                {lead.message ? (
                  <p className="max-w-2xl text-sm leading-relaxed whitespace-pre-line text-sand-dim">
                    {lead.message}
                  </p>
                ) : (
                  <p className="text-sm text-muted">Комментарий не оставлен.</p>
                )}

                <p className="mt-4 text-xs text-muted">
                  Страница: {lead.source} · язык: {lead.locale.toUpperCase()}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {href && (
                    <a
                      href={href}
                      className="rounded-full border border-line-strong px-4 py-2 text-[10px] tracking-[0.12em] text-sand uppercase transition-colors hover:border-accent hover:text-accent"
                    >
                      Ответить
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => run(() => setLeadReadAction(lead.id, !lead.read))}
                    className="rounded-full border border-line px-4 py-2 text-[10px] tracking-[0.12em] text-muted uppercase transition-colors hover:border-accent hover:text-accent"
                  >
                    {lead.read ? "Пометить новой" : "Пометить прочитанной"}
                  </button>
                  <button
                    type="button"
                    onClick={() => run(() => deleteLeadAction(lead.id))}
                    className="text-[10px] tracking-[0.12em] text-muted uppercase transition-colors hover:text-accent"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
