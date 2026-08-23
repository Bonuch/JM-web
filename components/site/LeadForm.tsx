"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/cn";
import { submitLead, type LeadFormState } from "@/lib/actions/lead";
import { localePath, t, type Dictionary, type Locale } from "@/lib/i18n";
import { GOAL_LEAD_SUBMITTED, trackGoal } from "@/lib/analytics";
import type { ServiceItem } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const initialState: LeadFormState = { status: "idle" };

/**
 * Форма заявки. Работает через Server Action, поэтому отправка не зависит от
 * клиентского JS больше, чем необходимо, а сама заявка уходит сразу в два
 * канала — в хранилище и в Telegram.
 */
export function LeadForm({
  locale,
  dict,
  services,
  topic,
  className,
}: {
  locale: Locale;
  dict: Dictionary;
  services: ServiceItem[];
  /** Предвыбранный тариф, если пользователь пришёл из блока услуг */
  topic?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(submitLead, initialState);
  const pathname = usePathname();
  const [selectedTopic, setSelectedTopic] = useState(topic ?? "");
  const [lastTopic, setLastTopic] = useState(topic);
  const formId = useId();
  const goalSent = useRef(false);

  // Отправленная заявка — главная цель сайта: по ней видно, какие страницы и
  // источники реально приводят заказчиков. Считаем её ровно один раз.
  useEffect(() => {
    if (state.status !== "success" || goalSent.current) return;
    goalSent.current = true;
    trackGoal(GOAL_LEAD_SUBMITTED, { source: pathname, locale });
  }, [state.status, pathname, locale]);

  // Выбор тарифа приходит извне (клик по «Заказать» в прайсе). Подстраиваем
  // состояние прямо во время рендера: эффект здесь вызвал бы лишний проход
  // и мигание уже выбранного значения.
  if (topic !== lastTopic) {
    setLastTopic(topic);
    if (topic) setSelectedTopic(topic);
  }

  const options = [...services]
    .sort((a, b) => a.order - b.order)
    .map((service) => t(service.title, locale));

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        {state.status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[22rem] flex-col justify-center border border-line bg-surface/40 p-10 text-center"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent text-accent">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                <path d="m5 13 4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <p className="display-md mt-6 text-sand">{dict.form.success}</p>
            <p className="mt-3 text-sm text-muted">{dict.form.successText}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            action={formAction}
            initial={false}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="source" value={pathname} />

            {/* honeypot: скрыт от людей, но привлекателен для ботов */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={`${formId}-company`}>Company</label>
              <input id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
            </div>

            <Field
              id={`${formId}-name`}
              name="name"
              label={dict.form.name}
              placeholder={dict.form.namePlaceholder}
              autoComplete="name"
              required
              invalid={Boolean(state.fieldErrors?.name)}
              errorText={dict.form.required}
            />

            <Field
              id={`${formId}-contact`}
              name="contact"
              label={dict.form.contact}
              placeholder={dict.form.contactPlaceholder}
              autoComplete="tel"
              required
              invalid={Boolean(state.fieldErrors?.contact)}
              errorText={dict.form.invalidContact}
            />

            <div>
              <label
                htmlFor={`${formId}-topic`}
                className="block text-[11px] tracking-[0.2em] text-muted uppercase"
              >
                {dict.form.topic}
              </label>
              <select
                id={`${formId}-topic`}
                name="topic"
                value={selectedTopic}
                onChange={(event) => setSelectedTopic(event.target.value)}
                className="mt-3 w-full appearance-none border-b border-line bg-transparent py-3 text-sand transition-colors duration-500 focus:border-accent focus:outline-none"
              >
                <option value="" className="bg-ink">
                  {dict.form.topicPlaceholder}
                </option>
                {options.map((option) => (
                  <option key={option} value={option} className="bg-ink">
                    {option}
                  </option>
                ))}
                <option value={dict.form.topicOther} className="bg-ink">
                  {dict.form.topicOther}
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor={`${formId}-message`}
                className="block text-[11px] tracking-[0.2em] text-muted uppercase"
              >
                {dict.form.message}
              </label>
              <textarea
                id={`${formId}-message`}
                name="message"
                rows={4}
                placeholder={dict.form.messagePlaceholder}
                className="mt-3 w-full resize-none border-b border-line bg-transparent py-3 text-sand placeholder:text-muted/70 transition-colors duration-500 focus:border-accent focus:outline-none"
              />
            </div>

            {state.status === "error" && !state.fieldErrors && (
              <p className="text-sm text-accent">{dict.form.error}</p>
            )}

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <Button type="submit" size="lg" disabled={pending} className="disabled:opacity-60">
                {pending ? dict.form.sending : dict.form.submit}
              </Button>

              {/* Согласие читают редко, но прочесть его должно быть можно:
                  text-muted здесь не проходит по контрасту, а ссылка внутри
                  строки различается только цветом — поэтому подчёркивание
                  постоянное, а не по наведению. Открываем в новой вкладке:
                  уход со страницы стёр бы уже заполненную форму. */}
              <p className="max-w-xs text-xs leading-relaxed text-sand-dim">
                {dict.form.consent}{" "}
                <Link
                  href={localePath(locale, "/privacy")}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sand underline decoration-line-strong underline-offset-4 transition-colors duration-300 hover:text-accent hover:decoration-accent"
                >
                  {dict.form.consentPolicy}
                </Link>
                .
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  id,
  name,
  label,
  placeholder,
  autoComplete,
  required,
  invalid,
  errorText,
}: {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  invalid?: boolean;
  errorText: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] tracking-[0.2em] text-muted uppercase">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={invalid || undefined}
        className={cn(
          "mt-3 w-full border-b bg-transparent py-3 text-sand placeholder:text-muted/70 transition-colors duration-500 focus:outline-none",
          invalid ? "border-accent" : "border-line focus:border-accent",
        )}
      />
      {invalid && <p className="mt-2 text-xs text-accent">{errorText}</p>}
    </div>
  );
}
