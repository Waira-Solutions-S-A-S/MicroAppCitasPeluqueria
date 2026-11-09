import { AlertTriangle, CheckCircle2 } from "lucide-react";

export function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;

  const isError = Boolean(error);
  const message = error ?? ok;

  return (
    <div
      role="alert"
      className={`flex items-center gap-2.5 rounded border px-4 py-3 text-xs font-medium shadow-xs transition-all ${
        isError
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-emerald-300 bg-emerald-50 text-emerald-900"
      }`}
    >
      {isError ? (
        <AlertTriangle className="size-4 shrink-0 text-red-600" />
      ) : (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
      )}
      <span className="flex-1">{message}</span>
    </div>
  );
}
