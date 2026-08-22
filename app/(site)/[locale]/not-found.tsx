import Link from "next/link";
import { getDictionary, DEFAULT_LOCALE, localePath } from "@/lib/i18n";
import { ArrowRight } from "@/components/ui/Button";

/**
 * 404 внутри локали. Локаль здесь недоступна через params, поэтому берём
 * язык по умолчанию — страница всё равно ведёт только на главную.
 */
export default function NotFound() {
  const dict = getDictionary(DEFAULT_LOCALE);

  return (
    <section className="container-page flex min-h-[70svh] flex-col justify-center py-40">
      <p className="eyebrow">404</p>
      <h1 className="display-xl mt-6 max-w-3xl text-sand">{dict.notFound.title}</h1>
      <p className="body-lead mt-6 max-w-md">{dict.notFound.text}</p>

      <Link
        href={localePath(DEFAULT_LOCALE)}
        className="group mt-12 inline-flex w-fit items-center gap-3 text-[11px] tracking-[0.2em] text-brass uppercase"
      >
        {dict.notFound.button}
        <ArrowRight />
      </Link>
    </section>
  );
}
