import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";
type Size = "md" | "lg";

/**
 * Вся «физика» кнопки — свет сверху, тень снизу, поднимающаяся плита и
 * пробегающий блик — описана в globals.css (секция «Кнопки»). Здесь
 * остаются только размеры и состав содержимого.
 */
const base = "group btn";

const variants: Record<Variant, string> = {
  solid: "btn-solid",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[11px]",
  lg: "px-8 py-4 text-xs",
};

type ButtonBaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "solid",
  size = "md",
  children,
  className,
  ...props
}: ButtonBaseProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      <span className="flex items-center gap-3">{children}</span>
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  children,
  className,
  ...props
}: ButtonBaseProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      <span className="flex items-center gap-3">{children}</span>
    </Link>
  );
}

/**
 * Стрелка-указатель. При наведении она уезжает вправо, а на её место
 * из-за левого края въезжает такая же — движение читается как прокрутка
 * ленты, а не как дёрганье значка.
 */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative block h-3.5 w-3.5 overflow-hidden", className)}>
      <ArrowGlyph className="group-hover:translate-x-full" />
      <ArrowGlyph className="-translate-x-full group-hover:translate-x-0" />
    </span>
  );
}

function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        className,
      )}
    >
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
