"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  Repeat,
  User,
} from "lucide-react";

import { formatPrice } from "@/lib/format";

export type WizardService = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCents: number;
  color: string;
};

export type WizardStaff = { id: string; name: string; color: string; serviceIds: string[] };

type Slot = {
  startAt: string;
  endAt: string;
  staffId: string;
  staffName: string;
  staffColor: string;
};

type Props = {
  businessName: string;
  currency: string;
  services: WizardService[];
  staff: WizardStaff[];
  todayKey: string;
  maxAdvanceDays: number;
  initialServiceId?: string;
  embedded?: boolean;
};

const DAY_MS = 86_400_000;
const STEPS = ["Servicio", "Profesional", "Fecha y hora", "Tus datos"];

function dayLabel(iso: string): { weekday: string; day: string; month: string } {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
    day: new Intl.DateTimeFormat("es-AR", { day: "2-digit", timeZone: "UTC" }).format(date),
    month: new Intl.DateTimeFormat("es-AR", { month: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
  };
}

function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

function slotKeyFor(slot: Slot): string {
  return `${slot.startAt}|${slot.staffId}`;
}

export function BookingWizard({
  businessName,
  currency,
  services,
  staff,
  todayKey,
  maxAdvanceDays,
  initialServiceId,
  embedded = false,
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState(initialServiceId ? 1 : 0);
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [staffId, setStaffId] = useState("any");
  const [date, setDate] = useState(todayKey);
  const [slotKey, setSlotKey] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [intervalWeeks, setIntervalWeeks] = useState(4);
  const [occurrences, setOccurrences] = useState(4);

  const service = services.find((item) => item.id === serviceId);

  const staffForService = useMemo(() => {
    if (!serviceId) return [];
    return staff.filter((member) => member.serviceIds.includes(serviceId));
  }, [serviceId, staff]);

  const days = useMemo(() => {
    const list: string[] = [];
    const base = new Date(`${todayKey}T00:00:00Z`).getTime();
    for (let i = 0; i < maxAdvanceDays; i++) {
      const current = new Date(base + i * DAY_MS);
      list.push(current.toISOString().slice(0, 10));
    }
    return list;
  }, [todayKey, maxAdvanceDays]);

  useEffect(() => {
    if (!serviceId || !date) return;
    let cancelled = false;

    async function fetchSlots() {
      setLoadingSlots(true);
      setError("");
      try {
        const query = new URLSearchParams({
          serviceId,
          date,
          staffId: staffId === "any" ? "" : staffId,
        });
        const response = await fetch(`/api/availability?${query.toString()}`);
        if (!response.ok) {
          throw new Error("No se pudieron cargar los horarios");
        }
        const data = (await response.json()) as { slots: Slot[] };
        if (!cancelled) {
          setSlots(data.slots);
          if (slotKey && !data.slots.some((s) => slotKeyFor(s) === slotKey)) {
            setSlotKey("");
          }
        }
      } catch {
        if (!cancelled) {
          setError("No se pudieron consultar los horarios disponibles.");
          setSlots([]);
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    void fetchSlots();
    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, date, slotKey]);

  const selectedSlot = slots.find((s) => slotKeyFor(s) === slotKey);

  const groups = useMemo(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    for (const slot of slots) {
      const hour = Number(slot.startAt.slice(11, 13));
      if (hour < 13) {
        morning.push(slot);
      } else {
        afternoon.push(slot);
      }
    }
    const result: { label: string; items: Slot[] }[] = [];
    if (morning.length > 0) result.push({ label: "Turnos de la mañana", items: morning });
    if (afternoon.length > 0) result.push({ label: "Turnos de la tarde", items: afternoon });
    return result;
  }, [slots]);

  const canContinue = useMemo(() => {
    if (step === 0) return Boolean(serviceId);
    if (step === 1) return Boolean(staffId);
    if (step === 2) return Boolean(selectedSlot);
    if (step === 3) return clientName.trim().length >= 2 && clientPhone.trim().length >= 6;
    return false;
  }, [step, serviceId, staffId, selectedSlot, clientName, clientPhone]);

  async function submit() {
    if (!service || !selectedSlot) return;
    setSubmitting(true);
    setError("");

    try {
      const body = {
        serviceId: service.id,
        staffId: selectedSlot.staffId,
        startAt: selectedSlot.startAt,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        recurring: repeatEnabled ? { intervalWeeks, occurrences } : undefined,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(data.error ?? "No se pudo confirmar la reserva. Probá nuevamente.");
        return;
      }

      if (embedded) {
        router.push(`/admin/agenda?fecha=${date}`);
      } else {
        router.push(`/reserva/${data.id}?nueva=1`);
      }
    } catch {
      setError("No pudimos conectar con el servidor. Revisá tu conexión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={embedded ? "w-full pb-10" : "mx-auto w-full max-w-5xl px-6 pb-20 pt-6 text-zinc-900"}>
      {!embedded && (
        <header className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            <ChevronLeft className="size-3.5" />
            <span>Volver a la portada</span>
          </Link>
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
            {businessName}
          </span>
        </header>
      )}

      {/* Stepper (Sattis Style Light) */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, index) => {
            const isDone = index < step;
            const isCurrent = index === step;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                    isDone
                      ? "bg-zinc-950 text-white"
                      : isCurrent
                        ? "border-2 border-zinc-950 bg-white text-zinc-950"
                        : "border border-zinc-200 bg-white text-zinc-400"
                  }`}
                >
                  {isDone ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    isCurrent ? "text-zinc-950 font-bold" : isDone ? "text-zinc-700" : "text-zinc-400"
                  }`}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={`h-px flex-1 transition ${
                      index < step ? "bg-zinc-950" : "bg-zinc-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs sm:p-8">
          {/* Paso 1: Servicios */}
          {step === 0 && (
            <section className="animate-rise">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Paso 1 de 4
              </span>
              <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
                Elegí tu servicio
              </h1>
              <p className="mt-1.5 text-xs text-zinc-600">
                Seleccioná qué querés hacerte. Podés cambiarlo o sumar notas en el último paso.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {services.map((item) => {
                  const active = item.id === serviceId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setServiceId(item.id);
                        setStaffId("any");
                        setSlotKey("");
                      }}
                      className={`relative flex flex-col justify-between rounded-2xl border p-5 text-left transition duration-150 ${
                        active
                          ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {active && (
                            <span className="rounded-full bg-zinc-950 px-2 py-0.5 text-[10px] font-medium tracking-wide text-white">
                              Seleccionado
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-sm font-medium text-zinc-950">{item.name}</h3>
                        <p className="mt-1 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="size-3 text-zinc-400" />
                          {item.durationMin} min
                        </span>
                        <span className="text-sm font-semibold text-zinc-950">
                          {formatPrice(item.priceCents, currency)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Paso 2: Profesional */}
          {step === 1 && (
            <section className="animate-rise">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Paso 2 de 4
              </span>
              <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
                ¿Con quién te atendés?
              </h1>
              <p className="mt-1.5 text-xs text-zinc-600">
                Elegí un profesional específico o seleccioná «Cualquiera disponible» para ver más
                horarios.
              </p>

              {staffForService.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-xs text-zinc-500">
                  No hay profesionales disponibles para este servicio en este momento.
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStaffId("any")}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition ${
                      staffId === "any"
                        ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                      <User className="size-5" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-zinc-950">
                        Cualquiera disponible
                      </span>
                      <span className="block text-xs text-zinc-500">Mayor disponibilidad</span>
                    </div>
                  </button>

                  {staffForService.map((member) => {
                    const active = staffId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setStaffId(member.id)}
                        className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                        }`}
                      >
                        <div
                          className="flex size-10 items-center justify-center rounded-xl text-xs font-bold text-white shadow-xs"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-zinc-950">
                            {member.name}
                          </span>
                          <span className="block text-xs text-zinc-500">
                            Profesional
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Paso 3: Fecha y horario */}
          {step === 2 && (
            <section className="animate-rise">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Paso 3 de 4
              </span>
              <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
                Seleccioná fecha y hora
              </h1>
              <p className="mt-1.5 text-xs text-zinc-600">
                {longDate(date)} · Duración aproximada: {service?.durationMin} min
              </p>

              {/* Day selection strip */}
              <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
                {days.map((iso) => {
                  const active = iso === date;
                  const label = dayLabel(iso);
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setDate(iso)}
                      className={`flex min-w-[4.75rem] shrink-0 flex-col items-center rounded-2xl border py-3 px-2 transition ${
                        active
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                          : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                        {label.weekday}
                      </span>
                      <span className="text-xl font-black leading-tight">
                        {label.day}
                      </span>
                      <span className="text-[10px] font-semibold opacity-70 uppercase">
                        {label.month}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              <div className="mt-6 min-h-44 border-t border-zinc-100 pt-5">
                {loadingSlots ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-xs font-medium text-zinc-500">
                    <Loader2 className="size-4 animate-spin text-zinc-400" />
                    Consultando disponibilidad en tiempo real…
                  </div>
                ) : groups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-xs text-zinc-500">
                    No hay turnos disponibles para esta fecha. Probá seleccionando otro día o
                    eligiendo «Cualquiera disponible».
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groups.map((group) => (
                      <div key={group.label}>
                        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {group.items.map((slot) => {
                            const active = slotKeyFor(slot) === slotKey;
                            return (
                              <button
                                key={`${slot.startAt}-${slot.staffId}`}
                                type="button"
                                onClick={() => setSlotKey(slotKeyFor(slot))}
                                className={`rounded-xl border py-2.5 px-3 text-center transition ${
                                  active
                                    ? "border-zinc-950 bg-zinc-950 text-white shadow-xs"
                                    : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                                }`}
                              >
                                <span className="block text-sm font-bold tracking-tight">
                                  {slot.startAt.slice(11, 16)}
                                </span>
                                {staffId === "any" && (
                                  <span
                                    className={`mt-0.5 block truncate text-[10px] ${
                                      active ? "text-zinc-300 font-semibold" : "text-zinc-500"
                                    }`}
                                  >
                                    {slot.staffName}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Paso 4: Datos del cliente */}
          {step === 3 && (
            <section className="animate-rise">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                Paso 4 de 4
              </span>
              <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl">
                Tus datos de reserva
              </h1>
              <p className="mt-1.5 text-xs text-zinc-600">
                Ingresá tus datos para enviarte la confirmación de tu turno.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-1">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    Nombre y apellido <span className="text-zinc-500">*</span>
                  </span>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                    className="w-full min-h-[44px] rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>

                <label className="sm:col-span-1">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    WhatsApp / Teléfono <span className="text-zinc-500">*</span>
                  </span>
                  <input
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.target.value)}
                    placeholder="Ej. 11 2345 6789"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full min-h-[44px] rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    Email <span className="font-normal text-zinc-500">(opcional)</span>
                  </span>
                  <input
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full min-h-[44px] rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    Comentarios para el profesional <span className="font-normal text-zinc-500">(opcional)</span>
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    placeholder="Detalles sobre tu corte, diseño, alergias o referencias…"
                    className="w-full min-h-[72px] resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
                  />
                </label>
              </div>

              {/* Turnos periódicos */}
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={repeatEnabled}
                    onChange={(event) => setRepeatEnabled(event.target.checked)}
                    className="mt-0.5 size-4 accent-zinc-950"
                  />
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                      <Repeat className="size-3.5 text-zinc-600" />
                      Agendar serie periódica de turnos
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500 leading-relaxed">
                      Ideal para mantenimiento de corte, retoque de barba o color cada ciertas semanas.
                    </span>
                  </div>
                </label>

                {repeatEnabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-3">
                    <label>
                      <span className="mb-1 block text-[11px] font-semibold text-zinc-600">
                        Frecuencia
                      </span>
                      <select
                        value={intervalWeeks}
                        onChange={(event) => setIntervalWeeks(Number(event.target.value))}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((w) => (
                          <option key={w} value={w}>
                            Cada {w} {w === 1 ? "semana" : "semanas"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span className="mb-1 block text-[11px] font-semibold text-zinc-600">
                        Cantidad de turnos
                      </span>
                      <select
                        value={occurrences}
                        onChange={(event) => setOccurrences(Number(event.target.value))}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-950"
                      >
                        {[2, 3, 4, 6, 8].map((t) => (
                          <option key={t} value={t}>
                            {t} turnos en total
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            </section>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Botones de navegación */}
          <div className="mt-8 flex items-center justify-between border-t border-zinc-100 pt-5">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-zinc-600 transition hover:text-zinc-950 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="size-3.5" />
              <span>Atrás</span>
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                disabled={!canContinue}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 active:scale-98 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Siguiente paso</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canContinue || submitting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-zinc-800 active:scale-98 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Confirmando turno…</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar mi turno</span>
                    <Check className="size-3.5" strokeWidth={3} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Resumen lateral */}
        <aside className="h-fit rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-xs lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Resumen de la cita
          </p>

          <div className="mt-4 border-b border-zinc-200/80 pb-4">
            <p className="text-lg font-medium text-zinc-950">
              {service?.name ?? "Seleccioná un servicio"}
            </p>
            <p className="mt-0.5 text-xs text-zinc-600">
              {service ? `${service.durationMin} minutos de atención` : "Paso 1"}
            </p>
          </div>

          <dl className="mt-4 space-y-3 text-xs text-zinc-600">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Profesional</dt>
              <dd className="font-semibold text-zinc-950">
                {staffId === "any"
                  ? "Cualquiera disponible"
                  : (staff.find((m) => m.id === staffId)?.name ?? "—")}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Fecha</dt>
              <dd className="font-semibold text-zinc-950">
                {date ? longDate(date) : "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Horario</dt>
              <dd className="font-semibold text-zinc-950">
                {selectedSlot ? `${selectedSlot.startAt.slice(11, 16)} hs` : "—"}
              </dd>
            </div>

            {repeatEnabled && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-zinc-500">Serie periódica</dt>
                <dd className="font-semibold text-zinc-950">
                  {occurrences} turnos (c/{intervalWeeks} sem)
                </dd>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-4 text-sm font-semibold text-zinc-950">
              <dt>Total estimado</dt>
              <dd className="text-base font-semibold">
                {service ? formatPrice(service.priceCents, currency) : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-600 leading-relaxed shadow-xs">
            Se abona en el estudio al finalizar el servicio. Atención puntual garantizada.
          </div>
        </aside>
      </div>
    </div>
  );
}
