"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Repeat,
  Scissors,
  User,
  X,
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
const STEPS = ["Servicios", "Profesional", "Fecha y hora", "Tus datos"];

function dayLabel(iso: string): { weekday: string; day: string; month: string } {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat("es-CO", { weekday: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
    day: new Intl.DateTimeFormat("es-CO", { day: "2-digit", timeZone: "UTC" }).format(date),
    month: new Intl.DateTimeFormat("es-CO", { month: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
  };
}

function longDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("es-CO", {
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
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialServiceId ? [initialServiceId] : [],
  );
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

  // Selected services in order of user selection
  const selectedServices = useMemo(() => {
    return selectedServiceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is WizardService => Boolean(s));
  }, [selectedServiceIds, services]);

  const totalDurationMin = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.durationMin, 0);
  }, [selectedServices]);

  const totalPriceCents = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.priceCents, 0);
  }, [selectedServices]);

  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
    setSlotKey("");
  };

  // Staff members who can provide ALL selected services
  const staffForService = useMemo(() => {
    if (selectedServiceIds.length === 0) return [];
    return staff.filter((member) =>
      selectedServiceIds.every((srvId) => member.serviceIds.includes(srvId)),
    );
  }, [selectedServiceIds, staff]);

  // If currently selected staffId cannot provide all services, reset to "any"
  useEffect(() => {
    if (staffId !== "any" && !staffForService.some((m) => m.id === staffId)) {
      setStaffId("any");
      setSlotKey("");
    }
  }, [staffForService, staffId]);

  const days = useMemo(() => {
    const list: string[] = [];
    const base = new Date(`${todayKey}T00:00:00Z`).getTime();
    for (let i = 0; i < maxAdvanceDays; i++) {
      const current = new Date(base + i * DAY_MS);
      list.push(current.toISOString().slice(0, 10));
    }
    return list;
  }, [todayKey, maxAdvanceDays]);

  const visibleDays = useMemo(() => {
    const selectedIndex = Math.max(days.indexOf(date), 0);
    const start = Math.min(Math.max(selectedIndex - 2, 0), Math.max(days.length - 5, 0));
    return days.slice(start, start + 5);
  }, [days, date]);

  const shiftDate = (offset: number) => {
    const currentIndex = Math.max(days.indexOf(date), 0);
    const nextIndex = Math.min(Math.max(currentIndex + offset, 0), days.length - 1);
    setDate(days[nextIndex] ?? date);
    setSlotKey("");
  };

  useEffect(() => {
    if (selectedServiceIds.length === 0 || !date) return;
    let cancelled = false;

    async function fetchSlots() {
      setLoadingSlots(true);
      setError("");
      try {
        const query = new URLSearchParams({
          serviceIds: selectedServiceIds.join(","),
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
  }, [selectedServiceIds, staffId, date]);

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
    if (step === 0) return selectedServiceIds.length > 0;
    if (step === 1) return Boolean(staffId) && staffForService.length > 0;
    if (step === 2) return Boolean(selectedSlot);
    if (step === 3) return clientName.trim().length >= 2 && clientPhone.trim().length >= 6;
    return false;
  }, [step, selectedServiceIds, staffId, staffForService, selectedSlot, clientName, clientPhone]);

  async function submit() {
    if (selectedServices.length === 0 || !selectedSlot) return;
    setSubmitting(true);
    setError("");

    try {
      const body = {
        serviceIds: selectedServiceIds,
        serviceId: selectedServiceIds[0],
        staffId: selectedSlot.staffId,
        startAt: selectedSlot.startAt,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        repeat: repeatEnabled ? { intervalWeeks, occurrences } : undefined,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(data.error ?? "No se pudo confirmar la reserva. Intenta nuevamente.");
        return;
      }

      if (embedded) {
        router.push(`/admin/agenda?fecha=${date}`);
      } else {
        router.push(`/reserva/${data.id}?nueva=1`);
      }
    } catch {
      setError("No pudimos conectar con el servidor. Revisa tu conexión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={embedded ? "w-full pb-10" : "mx-auto w-full max-w-5xl px-4 sm:px-6 pb-20 pt-6 text-zinc-900"}>
      {!embedded && (
        <header className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-950"
          >
            <ChevronLeft className="size-3.5" />
            <span>Volver a la portada</span>
          </Link>
          <span className="text-xs font-bold tracking-wider uppercase text-zinc-600">
            {businessName}
          </span>
        </header>
      )}

      {/* Stepper Header */}
      <div className="mb-6 rounded-md border border-zinc-200 bg-white p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((label, index) => {
            const isDone = index < step;
            const isCurrent = index === step;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded font-mono text-xs font-bold transition ${
                    isDone
                      ? "bg-zinc-900 text-white"
                      : isCurrent
                        ? "border-2 border-zinc-900 bg-white text-zinc-900"
                        : "border border-zinc-200 bg-zinc-50 text-zinc-400"
                  }`}
                >
                  {isDone ? <Check className="size-3" strokeWidth={3} /> : index + 1}
                </div>
                <span
                  className={`hidden text-xs sm:block ${
                    isCurrent ? "text-zinc-950 font-bold" : isDone ? "text-zinc-700 font-medium" : "text-zinc-400"
                  }`}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={`h-px flex-1 transition ${
                      index < step ? "bg-zinc-900" : "bg-zinc-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs">
          {/* Paso 1: Servicios (Permite Selección Múltiple) */}
          {step === 0 && (
            <section className="animate-rise">
              <div className="flex flex-col gap-1 border-b border-zinc-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Paso 1 de 4
                  </span>
                  <h1 className="text-xl font-bold tracking-tight text-zinc-950">
                    Elige tus Servicios
                  </h1>
                  <p className="text-xs text-zinc-500">
                    Puedes seleccionar uno o combinar varios servicios para tu cita (ej. Corte + Barba).
                  </p>
                </div>

                {selectedServices.length > 0 && (
                  <span className="self-start sm:self-auto rounded bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    {selectedServices.length} {selectedServices.length === 1 ? "seleccionado" : "seleccionados"}
                  </span>
                )}
              </div>

              {/* Multi-Service Active Strip Banner */}
              {selectedServices.length > 0 && (
                <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50/80 p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-900">
                      Servicios en tu cita ({selectedServices.length}):
                    </span>
                    <span className="font-mono font-bold text-zinc-950">
                      {totalDurationMin} min · {formatPrice(totalPriceCents, currency)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedServices.map((item) => (
                      <span
                        key={item.id}
                        className="inline-flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-zinc-800 shadow-2xs"
                      >
                        <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleService(item.id)}
                          className="hover:text-red-600 cursor-pointer ml-0.5"
                          title={`Quitar ${item.name}`}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((item) => {
                  const active = selectedServiceIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleService(item.id)}
                      className={`relative flex flex-col justify-between rounded-md border p-4 text-left transition cursor-pointer ${
                        active
                          ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex items-center gap-1.5">
                            {active ? (
                              <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white">
                                <Check className="size-2.5" />
                                <span>Seleccionado</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-zinc-400 font-medium hover:text-zinc-700">
                                <Plus className="size-3" />
                                <span>Sumar</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="mt-2.5 text-xs font-bold text-zinc-950">{item.name}</h3>
                        {item.description && (
                          <p className="mt-1 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-2.5 text-xs">
                        <span className="inline-flex items-center gap-1 text-zinc-500 font-mono">
                          <Clock className="size-3 text-zinc-400" />
                          {item.durationMin} min
                        </span>
                        <span className="font-bold text-zinc-950 font-mono">
                          {formatPrice(item.priceCents, currency)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Paso 2: Profesional (Filtrado por quienes realizan TODOS los servicios seleccionados) */}
          {step === 1 && (
            <section className="animate-rise">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Paso 2 de 4
              </span>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                ¿Con quién te atenderás?
              </h1>
              <p className="mt-1 text-xs text-zinc-600">
                {selectedServices.length > 1 ? (
                  <>
                    Mostrando profesionales capacitados para atender tus{" "}
                    <strong>{selectedServices.length} servicios</strong> seleccionados.
                  </>
                ) : (
                  "Elige un profesional o selecciona «Cualquiera disponible» para mayor disponibilidad."
                )}
              </p>

              {staffForService.length === 0 ? (
                <div className="mt-5 rounded-md border border-dashed border-red-200 bg-red-50/60 p-5 text-center text-xs text-red-800">
                  <p className="font-bold">Ningún profesional atiende todos los servicios seleccionados a la vez.</p>
                  <p className="mt-1 text-red-600">
                    Prueba quitando uno de los servicios en el paso anterior o reservándolos en citas separadas.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <ArrowLeft className="size-3" />
                    <span>Modificar selección de servicios</span>
                  </button>
                </div>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStaffId("any");
                      setSlotKey("");
                    }}
                    className={`flex items-center gap-3 rounded-md border p-3.5 text-left transition cursor-pointer ${
                      staffId === "any"
                        ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                        : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                    }`}
                  >
                    <div className="flex size-9 items-center justify-center rounded bg-zinc-100 text-zinc-700">
                      <User className="size-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-zinc-950">
                        Cualquiera disponible
                      </span>
                      <span className="block text-[11px] text-zinc-500">Mayor disponibilidad de horarios</span>
                    </div>
                  </button>

                  {staffForService.map((member) => {
                    const active = staffId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => {
                          setStaffId(member.id);
                          setSlotKey("");
                        }}
                        className={`flex items-center gap-3 rounded-md border p-3.5 text-left transition cursor-pointer ${
                          active
                            ? "border-zinc-950 bg-zinc-50 shadow-xs ring-1 ring-zinc-950"
                            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                        }`}
                      >
                        <div
                          className="flex size-9 items-center justify-center rounded font-mono text-xs font-bold text-white shadow-xs"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-zinc-950">
                            {member.name}
                          </span>
                          <span className="block text-[11px] text-zinc-500">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Paso 3 de 4
              </span>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                Selecciona Fecha y Hora
              </h1>
              <p className="mt-1 text-xs text-zinc-600 capitalize">
                {longDate(date)} · Duración estimada total: <strong>{totalDurationMin} min</strong>
              </p>

              {/* Date navigator */}
              <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => shiftDate(-1)}
                    disabled={date === days[0]}
                    className="grid size-8 shrink-0 place-items-center rounded border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Día anterior"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <input
                    type="date"
                    value={date}
                    min={days[0]}
                    max={days[days.length - 1]}
                    onChange={(event) => {
                      if (days.includes(event.target.value)) {
                        setDate(event.target.value);
                        setSlotKey("");
                      }
                    }}
                    className="h-8 min-w-0 flex-1 rounded border border-zinc-200 bg-white px-3 text-center text-xs font-semibold text-zinc-800 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    aria-label="Seleccionar fecha"
                  />
                  <button
                    type="button"
                    onClick={() => shiftDate(1)}
                    disabled={date === days[days.length - 1]}
                    className="grid size-8 shrink-0 place-items-center rounded border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Día siguiente"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>

                <div className="mt-2.5 grid grid-cols-5 gap-1.5">
                  {visibleDays.map((iso) => {
                    const active = iso === date;
                    const label = dayLabel(iso);
                    return (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => {
                          setDate(iso);
                          setSlotKey("");
                        }}
                        className={`flex min-h-[58px] min-w-0 flex-col items-center justify-center rounded border px-1 py-1.5 transition cursor-pointer ${
                          active
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                            : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider opacity-75">
                          {label.weekday}
                        </span>
                        <span className="text-base font-bold font-mono leading-tight">
                          {label.day}
                        </span>
                        <span className="text-[9px] font-semibold opacity-75 uppercase">
                          {label.month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div className="mt-5 min-h-40 border-t border-zinc-100 pt-4">
                {loadingSlots ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-xs font-medium text-zinc-500">
                    <Loader2 className="size-4 animate-spin text-zinc-400" />
                    Consultando disponibilidad en tiempo real…
                  </div>
                ) : groups.length === 0 ? (
                  <div className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-xs text-zinc-500">
                    No hay turnos disponibles continuos de {totalDurationMin} min para esta fecha. Intenta seleccionando otro día o
                    eligiendo «Cualquiera disponible».
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groups.map((group) => (
                      <div key={group.label}>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
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
                                className={`rounded border py-2 px-2.5 text-center transition cursor-pointer ${
                                  active
                                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                                    : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-300 hover:bg-zinc-50"
                                }`}
                              >
                                <span className="block text-xs font-bold font-mono">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Paso 4 de 4
              </span>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
                Datos de la Reserva
              </h1>
              <p className="mt-1 text-xs text-zinc-600">
                Ingresa los datos para registrar y confirmar el turno.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-1">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    Nombre completo <span className="text-zinc-500">*</span>
                  </span>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Ej. Lucas García"
                    autoComplete="name"
                    className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>

                <label className="sm:col-span-1">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    WhatsApp / Teléfono <span className="text-zinc-500">*</span>
                  </span>
                  <input
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.target.value)}
                    placeholder="Ej. 300 123 4567"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 font-mono"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    Email <span className="font-normal text-zinc-500">(opcional)</span>
                  </span>
                  <input
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold text-zinc-800">
                    Comentarios o especificaciones <span className="font-normal text-zinc-500">(opcional)</span>
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    placeholder="Detalles sobre el corte, barba, diseño o preferencias…"
                    className="w-full resize-none rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </label>
              </div>

              {/* Turnos periódicos */}
              <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50/70 p-3.5">
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={repeatEnabled}
                    onChange={(event) => setRepeatEnabled(event.target.checked)}
                    className="mt-0.5 size-4 accent-zinc-950"
                  />
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                      <Repeat className="size-3.5 text-zinc-600" />
                      Agendar serie periódica recurrente
                    </span>
                    <span className="mt-0.5 block text-[11px] text-zinc-500 leading-relaxed">
                      Reserva varios turnos continuos para mantenimiento periódico de corte o color.
                    </span>
                  </div>
                </label>

                {repeatEnabled && (
                  <div className="mt-3 grid grid-cols-2 gap-3 border-t border-zinc-200 pt-3">
                    <label>
                      <span className="mb-1 block text-[11px] font-semibold text-zinc-600">
                        Frecuencia
                      </span>
                      <select
                        value={intervalWeeks}
                        onChange={(event) => setIntervalWeeks(Number(event.target.value))}
                        className="w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
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
                        className="w-full rounded border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-900 outline-none focus:border-zinc-900"
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
            <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="size-3.5" />
              <span>Atrás</span>
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                disabled={!canContinue}
                className="inline-flex items-center justify-center gap-2 rounded bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Siguiente paso</span>
                <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canContinue || submitting}
                  className="inline-flex items-center justify-center gap-2 rounded bg-zinc-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-zinc-800 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
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
                {!canContinue && (
                  <span className="text-[11px] text-zinc-500">
                    Ingresa nombre y teléfono para continuar
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumen lateral */}
        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-xs lg:sticky lg:top-6">
          <div className="border-b border-zinc-200 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Resumen de la Cita
            </span>

            {selectedServices.length === 0 ? (
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                Selecciona al menos un servicio
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {selectedServices.map((srv, idx) => (
                  <div key={srv.id} className="flex items-start justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: srv.color }} />
                      <span className="font-semibold text-zinc-900 truncate">
                        {idx + 1}. {srv.name}
                      </span>
                    </div>
                    <span className="font-mono text-zinc-600 shrink-0 font-medium">
                      {formatPrice(srv.priceCents, currency)}
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-[11px] text-zinc-500 font-mono">
                  Duración total: {totalDurationMin} min
                </p>
              </div>
            )}
          </div>

          <dl className="mt-3.5 space-y-2.5 text-xs text-zinc-600">
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
              <dd className="font-semibold text-zinc-950 capitalize">
                {date ? longDate(date) : "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="text-zinc-500">Horario</dt>
              <dd className="font-semibold text-zinc-950 font-mono">
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

            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-3 text-xs font-semibold text-zinc-950">
              <dt>Total estimado</dt>
              <dd className="text-base font-bold font-mono">
                {selectedServices.length > 0 ? formatPrice(totalPriceCents, currency) : "—"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded border border-zinc-200 bg-zinc-50 p-2.5 text-[11px] text-zinc-600 leading-relaxed">
            Se abona en el estudio al finalizar el servicio. Atención puntual garantizada.
          </div>
        </aside>
      </div>
    </div>
  );
}
