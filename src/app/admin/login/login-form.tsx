"use client";

import { useActionState } from "react";
import { AlertTriangle, ArrowRight, Loader2, Lock, Mail } from "lucide-react";

import { loginAction, type LoginState } from "../actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-300">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue="admin@estudio.local"
            className="w-full rounded border border-zinc-700 bg-[#282c34] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-300">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded border border-zinc-700 bg-[#282c34] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400"
          />
        </div>
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded border border-red-700/60 bg-red-950/60 p-2.5 text-xs text-red-200">
          <AlertTriangle className="size-3.5 shrink-0 text-red-400" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded border border-zinc-600 bg-zinc-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 shadow-sm transition hover:bg-white active:bg-zinc-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            <span>Verificando credenciales…</span>
          </>
        ) : (
          <>
            <span>Ingresar al Sistema</span>
            <ArrowRight className="size-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
