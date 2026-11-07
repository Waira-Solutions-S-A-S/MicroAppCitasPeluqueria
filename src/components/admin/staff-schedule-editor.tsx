"use client";

import { useState } from "react";
import { Check, Copy, Save } from "lucide-react";

import { saveHoursAction } from "@/app/admin/actions";
import { minutesToLabel, WEEKDAYS } from "@/lib/time";

type WorkingHourItem = {
  weekday: number;
  startMin: number;
  endMin: number;
  isClosed: boolean;
};

export function StaffScheduleEditor({
  staffId,
  staffName,
  workingHours,
}: {
  staffId: string;
  staffName: string;
  workingHours: WorkingHourItem[];
}) {
  const byDay = new Map(workingHours.map((h) => [h.weekday, h]));

  const initialDays = WEEKDAYS.map((name, weekday) => {
    const existing = byDay.get(weekday);
    return {
      name,
      weekday,
      start: minutesToLabel(existing ? existing.startMin : 9 * 60),
      end: minutesToLabel(existing ? existing.endMin : 19 * 60),
      isClosed: existing ? existing.isClosed : weekday === 0,
    };
  });

  const [days, setDays] = useState(initialDays);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const copyMondayToWeekdays = () => {
    const monday = days[1]; // Monday is index 1
    if (!monday) return;

    setDays((prev) =>
      prev.map((day) => {
        // Apply to Monday through Friday (1 to 5)
        if (day.weekday >= 1 && day.weekday <= 5) {
          return {
            ...day,
            start: monday.start,
            end: monday.end,
            isClosed: monday.isClosed,
          };
        }
        return day;
      }),
    );

    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <form action={saveHoursAction} className="space-y-3">
      <input type="hidden" name="staffId" value={staffId} />

      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-zinc-100">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Horario semanal de atención
        </p>

        <button
          type="button"
          onClick={copyMondayToWeekdays}
          className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          title="Copiar horario del lunes a martes, miércoles, jueves y viernes"
        >
          <Copy className="size-3 text-zinc-500" />
          <span>{copiedNotice ? "¡Copiado a Lun-Vie!" : "Copiar Lunes a Lun-Vie"}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase bg-[#f8f9fa]">
              <th className="py-2 px-3">Día</th>
              <th className="py-2 px-3">Hora Inicio</th>
              <th className="py-2 px-3">Hora Cierre</th>
              <th className="py-2 px-3 text-right">Atención</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {days.map((day) => (
              <tr
                key={day.name}
                className={`transition-colors ${day.isClosed ? "bg-zinc-50/60 text-zinc-400" : "hover:bg-zinc-50/50"}`}
              >
                <td className="py-2 px-3 font-semibold text-zinc-800">
                  {day.name}
                </td>
                <td className="py-2 px-3">
                  <input
                    type="time"
                    name={`start_${day.weekday}`}
                    value={day.start}
                    disabled={day.isClosed}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDays((prev) =>
                        prev.map((d) => (d.weekday === day.weekday ? { ...d, start: val } : d)),
                      );
                    }}
                    className="h-7 rounded border border-zinc-200 px-2 text-xs text-zinc-800 disabled:opacity-40"
                  />
                </td>
                <td className="py-2 px-3">
                  <input
                    type="time"
                    name={`end_${day.weekday}`}
                    value={day.end}
                    disabled={day.isClosed}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDays((prev) =>
                        prev.map((d) => (d.weekday === day.weekday ? { ...d, end: val } : d)),
                      );
                    }}
                    className="h-7 rounded border border-zinc-200 px-2 text-xs text-zinc-800 disabled:opacity-40"
                  />
                </td>
                <td className="py-2 px-3 text-right">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-700">
                    <input
                      type="checkbox"
                      name={`closed_${day.weekday}`}
                      checked={day.isClosed}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDays((prev) =>
                          prev.map((d) => (d.weekday === day.weekday ? { ...d, isClosed: checked } : d)),
                        );
                      }}
                      className="size-3.5 rounded border-zinc-300"
                    />
                    <span>{day.isClosed ? "Cerrado" : "Abierto"}</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded bg-zinc-900 px-4 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
        >
          <Save className="size-3.5" />
          <span>Guardar horarios de {staffName}</span>
        </button>
      </div>
    </form>
  );
}
