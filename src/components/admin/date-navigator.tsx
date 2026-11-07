"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export function DateNavigator({
  currentKey,
  todayKey,
  prevKey,
  nextKey,
}: {
  currentKey: string;
  todayKey: string;
  prevKey: string;
  nextKey: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center rounded-md border border-zinc-200 bg-white p-0.5 shadow-xs">
        <Link
          href={`/admin/agenda?fecha=${prevKey}`}
          className="grid size-8 place-items-center rounded text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          aria-label="Día anterior"
          title="Día anterior"
        >
          <ChevronLeft className="size-4" />
        </Link>

        <Link
          href={`/admin/agenda?fecha=${todayKey}`}
          className={`inline-flex h-8 items-center rounded px-3 text-xs font-semibold transition ${
            currentKey === todayKey
              ? "bg-zinc-900 text-white"
              : "text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          Hoy
        </Link>

        <Link
          href={`/admin/agenda?fecha=${nextKey}`}
          className="grid size-8 place-items-center rounded text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
          aria-label="Día siguiente"
          title="Día siguiente"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Date Picker Input */}
      <div className="relative flex items-center">
        <input
          type="date"
          value={currentKey}
          onChange={(e) => {
            if (e.target.value) {
              router.push(`/admin/agenda?fecha=${e.target.value}`);
            }
          }}
          className="h-9 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-800 shadow-xs outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 cursor-pointer"
          title="Seleccionar fecha específica"
        />
      </div>
    </div>
  );
}
