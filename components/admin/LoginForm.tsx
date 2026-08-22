"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/admin";

const initialState: LoginState = { error: null };

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-10 space-y-6">
      <input type="hidden" name="from" value={from ?? "/admin"} />

      <div>
        <label htmlFor="password" className="block text-[11px] tracking-[0.2em] text-muted uppercase">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className="mt-3 w-full border-b border-line bg-transparent py-3 text-sand transition-colors duration-300 focus:border-brass focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-brass">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sand px-8 py-3.5 text-xs font-medium tracking-[0.1em] text-ink uppercase transition-colors duration-300 hover:bg-brass disabled:opacity-60"
      >
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
