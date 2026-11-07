"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBookingLink() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const url = `${window.location.origin}/reservar`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-950 active:scale-98 cursor-pointer"
      title="Copiar enlace de reservas para clientes"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-emerald-600" />
          <span className="text-emerald-900 font-bold">¡Copiado!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5 text-zinc-500" />
          <span>Copiar enlace</span>
        </>
      )}
    </button>
  );
}
