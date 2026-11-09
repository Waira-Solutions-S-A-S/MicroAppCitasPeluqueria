"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  const [visible, setVisible] = useState(Boolean(ok || error));

  useEffect(() => {
    if (ok || error) {
      setVisible(true);
      // Clean query params from URL so F5 refresh doesn't trigger the flash again
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (url.searchParams.has("ok") || url.searchParams.has("error")) {
          url.searchParams.delete("ok");
          url.searchParams.delete("error");
          window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
        }
      }
    }
  }, [ok, error]);

  if (!visible || (!ok && !error)) return null;

  const isError = Boolean(error);
  const message = error ?? ok;

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-2.5 rounded border px-3.5 py-2.5 text-xs font-medium shadow-xs transition-all ${
        isError
          ? "border-red-300 bg-red-50 text-red-950"
          : "border-emerald-300 bg-emerald-50 text-emerald-950"
      }`}
    >
      <div className="flex items-center gap-2">
        {isError ? (
          <AlertTriangle className="size-4 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        )}
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={() => setVisible(false)}
        className="rounded p-1 text-zinc-500 hover:bg-black/5 hover:text-zinc-800 transition cursor-pointer"
        title="Cerrar notificación"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
