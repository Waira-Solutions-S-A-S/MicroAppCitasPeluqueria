"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Clock,
  Loader2,
  Repeat,
  Scissors,
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
};

const DAY_MS = 86_400_000;
const STEPS = ["Servicio", "Profesional", "Horario", "Tus datos"];

function dayLabel(iso: string): { weekday: string; day: string } {
  const date = new Date(`${iso}T00:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" })
      .format(date)
      .replace(".", ""),
    day: new Intl.DateTimeFormat("es-AR", { day: "2-digit", timeZone: "UTC" }).format(date),
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
  const [occurrences, setOccurrences] = useState(3);

  const service = services.find((item) => item.id === serviceId);
  const staffForService = useMemo(
    () => (serviceId ? staff.filter((member) => member.serviceIds.includes(serviceId)) : staff),
    [staff, serviceId],
  );
  const selectedSlot = slots.find((slot) => slotKeyFor(slot) === slotKey);

  const days = useMemo(() => {
    const base = Date.parse(`${todayKey}T00:00:00Z`);
    const count = Math.min(14, Math.max(1, maxAdvanceDays));
    return Array.from({ length: count }, (_, index) =>
      new Date(base + index * DAY_MS).toISOString().slice(0, 10),
    );
  }, [todayKey, maxAdvanceDays]);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSlots([]);
    setSlotKey("");
    setError("");

    const query = new URLSearchParams({ serviceId, date });
    if (staffId !== "any") query.set("staffId", staffId);

    fetch(`/api/availability?${query.toString()}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(Array.isArray(data.slots) ? data.slots : []);
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos cargar los horarios. Probá de nuevo.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, staffId, date]);

  const groups = useMemo(() => {
    const morning = slots.filter((slot) => new Date(slot.startAt).getUTCHours() < 12);
    const afternoon = slots.filter((slot) => {
      const hour = new Date(slot.startAt).getUTCHours();
      return hour >= 12 && hour < 18;
    });
    const evening = slots.filter((slot) => new Date(slot.startAt).getUTCHours() >= 18);
    return [
      { label: "Mañana", items: morning },
      { label: "Tarde", items: afternoon },
      { label: "Noche", items: evening },
    ].filter((group) => group.items.length > 0);
  }, [slots]);

  const canContinue =
    step === 0
      ? Boolean(serviceId)
      : step === 1
        ? staffForService.length > 0
        : step === 2
          ? Boolean(slotKey)
          : clientName.trim().length >= 2 && clientPhone.trim().length >= 6;

  async function submit() {
    if (!service || !selectedSlot) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          staffId: selectedSlot.staffId,
          startAt: selectedSlot.startAt,
          clientName,
          clientPhone,
          clientEmail,
          notes,
          repeat: repeatEnabled
            ? { intervalWeeks, occurrences }
            : null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No pudimos crear la reserva.");
        return;
      }

      router.push(`/reserva/${data.id}?nueva=1`);
    } catch {
      setError("No pudimos conectar con el servidor. Revisá tu conexión.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-20">
      <header className="flex items-center justify-between py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium transition hover:border-brand/40 hover:text-brand"
        >
          <ChevronLeft className="size-4" />
          Volver
        </Link>
        <span className="text-sm font-semibold tracking-tight">{businessName}</span>
      </header>

      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition ${
                index <= step
                  ? "bg-brand text-white"
                  : "bg-white text-muted ring-1 ring-ink/10"
              }`}
            >
              {index < step ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={`hidden text-xs font-medium sm:block ${
                index <= step ? "text-ink" : "text-muted"
              }`}
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={`h-px flex-1 ${index < step ? "bg-brand" : "bg-ink/10"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
          {step === 0 && (
            <section className="animate-rise">
              <h1 className="text-2xl font-semibold tracking-tight">¿Qué te vas a hacer?</h1>
              <p className="mt-1 text-sm text-muted">Elegí el servicio. Podés cambiarlo después.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-brand bg-brand-soft/60 ring-2 ring-brand/20"
                          : "border-ink/10 hover:border-brand/30 hover:bg-cream/60"
                      }`}
                    >
                      <span
                        className="mb-3 block size-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="block font-semibold">{item.name}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {item.description}
                      </span>
                      <span className="mt-3 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 text-muted">
                          <Clock className="size-3.5" />
                          {item.durationMin} min
                        </span>
                        <span className="font-semibold">
                          {formatPrice(item.priceCents, currency)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="animate-rise">
              <h1 className="text-2xl font-semibold tracking-tight">¿Con quién?</h1>
              <p className="mt-1 text-sm text-muted">
                Elegí una profesional o dejá que te asignemos la primera disponible.
              </p>
              {staffForService.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-dashed border-ink/15 bg-cream/50 p-5 text-sm text-muted">
                  Este servicio todavía no tiene profesionales asignados. Probá con otro
                  servicio.
                </p>
              ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStaffId("any")}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      staffId === "any"
                        ? "border-brand bg-brand-soft/60 ring-2 ring-brand/20"
                        : "border-ink/10 hover:border-brand/30"
                    }`}
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-brand text-white">
                      <User className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">Cualquiera</span>
                      <span className="block text-xs text-muted">Primera disponible</span>
                    </span>
                  </button>
                  {staffForService.map((member) => {
                    const active = staffId === member.id;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setStaffId(member.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-brand bg-brand-soft/60 ring-2 ring-brand/20"
                            : "border-ink/10 hover:border-brand/30"
                        }`}
                      >
                        <span
                          className="grid size-10 place-items-center rounded-full text-sm font-semibold text-white"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.slice(0, 1)}
                        </span>
                        <span className="font-semibold">{member.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="animate-rise">
              <h1 className="text-2xl font-semibold tracking-tight">¿Cuándo?</h1>
              <p className="mt-1 text-sm text-muted">
                {longDate(date)} · duración {service?.durationMin} min
              </p>

              <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
                {days.map((iso) => {
                  const active = iso === date;
                  const label = dayLabel(iso);
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setDate(iso)}
                      className={`flex min-w-16 shrink-0 flex-col items-center rounded-2xl border px-3 py-2.5 transition ${
                        active
                          ? "border-brand bg-brand text-white"
                          : "border-ink/10 bg-white hover:border-brand/30"
                      }`}
                    >
                      <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                        {label.weekday}
                      </span>
                      <span className="text-lg font-semibold leading-tight">{label.day}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 min-h-40">
                {loadingSlots ? (
                  <div className="flex items-center gap-2 py-10 text-sm text-muted">
                    <Loader2 className="size-4 animate-spin" />
                    Buscando horarios…
                  </div>
                ) : groups.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink/15 bg-cream/50 p-6 text-sm text-muted">
                    No quedan horarios para este día. Probá con otra fecha o profesional.
                  </div>
                ) : (
                  <div className="space-y-5">
                    {groups.map((group) => (
                      <div key={group.label}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
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
                                className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${
                                  active
                                    ? "border-brand bg-brand text-white"
                                    : "border-ink/10 hover:border-brand/40 hover:bg-brand-soft/40"
                                }`}
                              >
                                {slot.startAt.slice(11, 16)}
                                {staffId === "any" && (
                                  <span
                                    className={`mt-0.5 block text-[10px] font-medium ${
                                      active ? "text-white/70" : "text-muted"
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

          {step === 3 && (
            <section className="animate-rise">
              <h1 className="text-2xl font-semibold tracking-tight">Tus datos</h1>
              <p className="mt-1 text-sm text-muted">
                Te vamos a contactar para confirmar el turno.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-1">
                  <span className="mb-1.5 block text-sm font-medium">Nombre</span>
                  <input
                    value={clientName}
                    onChange={(event) => setClientName(event.target.value)}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="sm:col-span-1">
                  <span className="mb-1.5 block text-sm font-medium">Teléfono</span>
                  <input
                    value={clientPhone}
                    onChange={(event) => setClientPhone(event.target.value)}
                    placeholder="11 5555 1234"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium">
                    Email <span className="font-normal text-muted">(opcional)</span>
                  </span>
                  <input
                    value={clientEmail}
                    onChange={(event) => setClientEmail(event.target.value)}
                    placeholder="vos@email.com"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium">
                    Notas <span className="font-normal text-muted">(opcional)</span>
                  </span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={2}
                    placeholder="Alergias, referencia de color, lo que quieras contarnos…"
                    className="w-full resize-none rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-ink/10 bg-cream/60 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={repeatEnabled}
                    onChange={(event) => setRepeatEnabled(event.target.checked)}
                    className="mt-0.5 size-4 accent-[var(--color-brand)]"
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Repeat className="size-4" />
                      Repetir este turno
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                      Ideal para tintes o mantenimientos. Reservamos la serie completa de
                      una vez.
                    </span>
                  </span>
                </label>

                {repeatEnabled && (
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/10 pt-4">
                    <label>
                      <span className="mb-1 block text-xs font-medium text-muted">
                        Cada cuántas semanas
                      </span>
                      <select
                        value={intervalWeeks}
                        onChange={(event) => setIntervalWeeks(Number(event.target.value))}
                        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((weeks) => (
                          <option key={weeks} value={weeks}>
                            Cada {weeks} {weeks === 1 ? "semana" : "semanas"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="mb-1 block text-xs font-medium text-muted">
                        Cuántas veces
                      </span>
                      <select
                        value={occurrences}
                        onChange={(event) => setOccurrences(Number(event.target.value))}
                        className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-brand"
                      >
                        {Array.from({ length: 11 }, (_, index) => index + 2).map((times) => (
                          <option key={times} value={times}>
                            {times} turnos
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
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0 || submitting}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-muted transition hover:text-ink disabled:opacity-40"
            >
              <ArrowLeft className="size-4" />
              Atrás
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((current) => Math.min(3, current + 1))}
                disabled={!canContinue}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
              >
                Continuar
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canContinue || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Reservando…
                  </>
                ) : (
                  <>
                    Confirmar reserva
                    <Check className="size-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-ink/10 bg-ink p-5 text-white sm:p-6 lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            Tu reserva
          </p>

          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <Scissors className="size-5" />
            </span>
            <div>
              <p className="font-semibold">{service?.name ?? "Elegí un servicio"}</p>
              <p className="text-xs text-white/60">
                {service ? `${service.durationMin} min` : "Paso 1"}
              </p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/60">Profesional</dt>
              <dd className="text-right font-medium">
                {staffId === "any"
                  ? "Cualquiera"
                  : (staff.find((member) => member.id === staffId)?.name ?? "—")}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/60">Fecha</dt>
              <dd className="text-right font-medium">{longDate(date)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-white/60">Hora</dt>
              <dd className="text-right font-medium">
                {selectedSlot ? `${selectedSlot.startAt.slice(11, 16)} hs` : "—"}
              </dd>
            </div>
            {repeatEnabled && (
              <div className="flex items-center justify-between gap-4">
                <dt className="text-white/60">Repetición</dt>
                <dd className="text-right font-medium">
                  {occurrences} turnos · cada {intervalWeeks} sem.
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 text-base">
              <dt className="text-white/60">Total</dt>
              <dd className="font-semibold">
                {service ? formatPrice(service.priceCents, currency) : "—"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
