import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";

import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { labelDateLong, nowWallClock } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, services, staff] = await Promise.all([
    getSettings(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const today = nowWallClock(settings.timezone);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 pb-16">
      <header className="flex items-center justify-between py-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30">
            <Scissors className="size-5" strokeWidth={2.4} />
          </span>
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight">{settings.businessName}</p>
            <p className="text-xs text-muted">{settings.tagline}</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur transition hover:border-brand/40 hover:text-brand"
        >
          Panel del negocio
        </Link>
      </header>

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">
            <Sparkles className="size-3.5" />
            Reservas online · también recurrentes
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Tu próximo turno,
            <br />
            <span className="text-brand-soft">a un toque.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Elegí servicio, profesional y horario. Confirmá en segundos y, si tu color
            necesita mantenimiento, reservá la serie completa de una sola vez.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-brand-soft"
            >
              Reservar ahora
              <ArrowRight className="size-4" />
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-3 text-sm text-white/70">
              <CalendarDays className="size-4" />
              {labelDateLong(today)}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Servicios</h2>
            <p className="mt-1 text-sm text-muted">
              Precios de referencia. El turno se confirma desde el panel.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/reservar?servicio=${service.id}`}
              className="group flex flex-col justify-between rounded-3xl border border-ink/8 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
            >
              <div>
                <span
                  className="mb-4 inline-block size-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <h3 className="text-lg font-semibold tracking-tight">{service.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {service.description ?? "Servicio del estudio."}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4">
                <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <Clock className="size-4" />
                  {service.durationMin} min
                </span>
                <span className="text-base font-semibold">
                  {formatPrice(service.priceCents, settings.currency)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-4 rounded-3xl border border-ink/8 bg-white p-6 sm:grid-cols-2 sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Nuestro equipo</h2>
          <p className="mt-1 text-sm text-muted">
            Elegí profesional al reservar o dejá que te asignemos el primero disponible.
          </p>
          <ul className="mt-5 space-y-3">
            {staff.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <span
                  className="grid size-9 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.slice(0, 1)}
                </span>
                <span className="font-medium">{member.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-cream-deep/70 p-6">
          <div className="flex items-center gap-1 text-accent">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-4 fill-current" />
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/80">
            “Reservé el corte y el retoque de color cada 6 semanas en una sola pantalla.
            Nunca más el ida y vuelta por WhatsApp.”
          </p>
          <p className="mt-3 text-xs font-medium text-muted">— Clienta frecuente</p>
        </div>
      </section>

      <footer className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ink/8 pt-6 text-sm text-muted sm:flex-row">
        <p>
          {settings.businessName} · Instalá la app desde el navegador para reservar más
          rápido.
        </p>
        <Link href="/admin/login" className="font-medium text-brand hover:underline">
          Acceso del negocio
        </Link>
      </footer>
    </div>
  );
}
