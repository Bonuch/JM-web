"use client";

import { useRouter, usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/types";

/**
 * Переключает язык, оставаясь на той же странице: /ru/portfolio -> /en/portfolio.
 * Выбор запоминается в куке, которую читает proxy при заходе на голый URL.
 */
export function LocaleSwitch({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const target = LOCALES.find((item) => item !== locale) ?? locale;

  const switchLocale = () => {
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    const rest = pathname.replace(new RegExp(`^/${locale}`), "");
    router.push(`/${target}${rest}`);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="text-[11px] tracking-[0.18em] text-sand-dim uppercase transition-colors duration-300 hover:text-brass"
      aria-label={`Switch language to ${target.toUpperCase()}`}
    >
      {label}
    </button>
  );
}
