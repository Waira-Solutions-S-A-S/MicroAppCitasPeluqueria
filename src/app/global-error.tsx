"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#1f2228] text-white font-sans">
        <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-[#2b2f38] p-6 text-center shadow-xl">
          <h2 className="text-base font-bold mb-1">Algo salió mal</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Ocurrió un error inesperado al procesar la solicitud.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-8 items-center justify-center rounded bg-white px-4 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-100 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
