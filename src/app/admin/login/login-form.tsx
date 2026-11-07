"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { loginAction, type LoginState } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-zinc-700">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue="admin@estudio.local"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-zinc-700">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
        />
      </label>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Verificando credenciales…</span>
          </>
        ) : (
          <>
            <span>Ingresar al panel</span>
            <ArrowRight className="size-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
