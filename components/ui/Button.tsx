import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full font-medium tracking-[0.08em] uppercase transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  solid: "bg-sand text-ink hover:text-ink",
  outline: "border border-line-strong text-sand hover:text-ink",
  ghost: "text-sand hover:text-brass",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-[11px]",
  lg: "px-8 py-4 text-xs",
};

/**
 * Заливка при наведении «наезжает» снизу — это читается как отклик на действие
 * и держит один язык движения со всем сайтом.
 */
function Fill({ variant }: { variant: Variant }) {
  if (variant === "ghost") return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100",
        variant === "solid" ? "bg-brass" : "bg-sand",
      )}
    />
  );
}

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
      <Fill variant={variant} />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
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
      <Fill variant={variant} />
      <span className="relative z-10 flex items-center gap-3">{children}</span>
    </Link>
  );
}

/** Стрелка-указатель, которая уезжает вправо вместе с наведением. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1",
        className,
      )}
    >
      <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
