import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Palette, Scissors, Sparkles } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { labelDateLong, nowWallClock } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sesion?: string }>;
}) {
  const params = await searchParams;
  const [settings, services] = await Promise.all([
    getSettings(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  ]);

  const today = nowWallClock(settings.timezone);
  const user = await getCurrentUser();

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
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur transition hover:border-brand/40 hover:text-brand"
            >
              Panel
            </Link>
            <a
              href="/salir"
              className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-muted backdrop-blur transition hover:border-red-200 hover:text-red-600"
            >
              Salir
            </a>
          </div>
        ) : (
          <Link
            href="/admin/login"
            className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur transition hover:border-brand/40 hover:text-brand"
          >
            Ingresar
          </Link>
        )}
      </header>

      {params.sesion === "cerrada" && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Sesión cerrada. Podés volver a ingresar cuando quieras.
        </div>
      )}

      <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 ring-1 ring-white/15">
            <Sparkles className="size-3.5" />
            Reservas online al instante
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Tu próximo turno,
            <br />
            <span className="text-brand-soft">a un toque.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Elegí servicio, profesional y horario en pocos pasos. Reservá online las 24 horas y asegurá tu lugar sin esperas.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/reservar"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-brand-soft"
            >
              Reservar ahora
              <ArrowRight className="size-4" />
            </Link>
            {user && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Ir al panel
              </Link>
            )}
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
              Elegí un servicio para iniciar tu reserva.
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
                <h3 className="text-lg font-semibold tracking-tight group-hover:text-brand transition-colors">
                  {service.name}
                </h3>
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

      <section className="mt-14">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Galería demo</h2>
          <p className="mt-1 text-sm text-muted">
            Imágenes de ejemplo para mostrar el estilo del estudio.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <DemoCard
            title="Corte"
            caption="Ejemplo de corte y styling."
            gradient="from-violet-500 via-fuchsia-500 to-rose-400"
            icon={<Scissors className="size-7" strokeWidth={1.8} />}
          />
          <DemoCard
            title="Color"
            caption="Ejemplo de color y nutrición."
            gradient="from-rose-400 via-orange-400 to-amber-300"
            icon={<Palette className="size-7" strokeWidth={1.8} />}
          />
          <DemoCard
            title="Uñas"
            caption="Ejemplo de esculpidas y semipermanente."
            gradient="from-sky-500 via-cyan-400 to-teal-300"
            icon={<Sparkles className="size-7" strokeWidth={1.8} />}
          />
        </div>
      </section>

      <footer className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-ink/8 pt-6 text-sm text-muted sm:flex-row">
        <p>
          {settings.businessName} · Reservas online y gestión para profesionales.
        </p>
        {user ? (
          <a href="/salir" className="font-medium text-brand hover:underline">
            Cerrar sesión
          </a>
        ) : (
          <Link href="/admin/login" className="font-medium text-brand hover:underline">
            Acceso del negocio
          </Link>
        )}
      </footer>
    </div>
  );
}

function DemoCard({
  title,
  caption,
  gradient,
  icon,
}: {
  title: string;
  caption: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-sm">
      <div
        className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${gradient}`}
      >
        <span className="grid size-16 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-sm">
          {icon}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          Demo
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-xs text-muted">{caption}</p>
      </div>
    </article>
  );
}
