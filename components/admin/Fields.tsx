"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Localized } from "@/lib/types";

const inputClass =
  "w-full border border-line bg-surface/40 px-4 py-3 text-sm text-sand transition-colors placeholder:text-muted/60 focus:border-brass focus:outline-none";

export function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-4">
      <span className="text-[11px] tracking-[0.18em] text-muted uppercase">{children}</span>
      {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>
        <Label hint={hint}>{label}</Label>
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>
        <Label>{label}</Label>
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={cn(inputClass, "appearance-none")}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Поле с двумя языками. Вкладки вместо двух полей подряд: форма остаётся
 * компактной, а переключение показывает, что перевод — это та же мысль,
 * а не отдельная сущность.
 */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 5,
  placeholder,
  hint,
}: {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  const [lang, setLang] = useState<keyof Localized>("ru");
  const id = useId();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-[11px] tracking-[0.18em] text-muted uppercase">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {(["ru", "en"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setLang(item)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] tracking-[0.12em] uppercase transition-colors",
                lang === item ? "bg-brass/15 text-brass" : "text-muted hover:text-sand",
                !value[item].trim() && "opacity-50",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {multiline ? (
        <textarea
          id={id}
          rows={rows}
          value={value[lang]}
          placeholder={placeholder}
          onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
          className={cn(inputClass, "resize-y leading-relaxed")}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value[lang]}
          placeholder={placeholder}
          onChange={(event) => onChange({ ...value, [lang]: event.target.value })}
          className={inputClass}
        />
      )}

      {hint && <p className="mt-2 text-[11px] leading-relaxed text-muted/70">{hint}</p>}
    </div>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-4 border border-line bg-surface/30 p-4 text-left transition-colors hover:border-line-strong"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-brass" : "bg-surface-2",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-ink transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span>
        <span className="block text-sm text-sand">{label}</span>
        {description && <span className="mt-1 block text-xs text-muted">{description}</span>}
      </span>
    </button>
  );
}
