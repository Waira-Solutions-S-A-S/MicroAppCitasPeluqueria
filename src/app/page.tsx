import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { labelDateLong, nowWallClock } from "@/lib/time";

export const dynamic = "force-dynamic";

function getServiceImage(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("color") || lower.includes("tint") || lower.includes("mecha") || lower.includes("balayage")) {
    return "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("manicur") || lower.includes("uña") || lower.includes("kapping")) {
    return "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("barba") || lower.includes("barber")) {
    return "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80";
  }
  if (lower.includes("peinado") || lower.includes("styling") || lower.includes("brushing")) {
    return "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80";
  }
  // Default haircut / precision styling
  return "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80";
}

function getStaffImage(index: number): string {
  const avatars = [
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  ];
  return avatars[index % avatars.length];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sesion?: string }>;
}) {
  const params = await searchParams;
  const [settings, services, staffMembers] = await Promise.all([
    getSettings(),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      include: {
        services: { select: { id: true, name: true } },
      },
    }),
  ]);

  const today = nowWallClock(settings.timezone);
  const user = await getCurrentUser();

  return (
    <div className="min-h-dvh bg-white text-zinc-900 antialiased selection:bg-zinc-200">
      {/* Top Banner */}
      <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-center text-xs font-medium text-zinc-600">
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Agenda online abierta · Turnos para hoy {labelDateLong(today)} y próximas semanas
        </span>
      </div>

      {/* Navbar (Sattis Studio Style) */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex size-9 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold tracking-widest text-white transition group-hover:bg-zinc-800">
              ST
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-zinc-950 uppercase">
                {settings.businessName}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Studio & Barbershop
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#servicios"
              className="text-xs font-semibold text-zinc-600 transition hover:text-zinc-950"
            >
              Servicios
            </a>
            <a
              href="#estudio"
              className="text-xs font-semibold text-zinc-600 transition hover:text-zinc-950"
            >
              Sobre el Estudio
            </a>
            <a
              href="#galeria"
              className="text-xs font-semibold text-zinc-600 transition hover:text-zinc-950"
            >
              Galería
            </a>
            <a
              href="#equipo"
              className="text-xs font-semibold text-zinc-600 transition hover:text-zinc-950"
            >
              Profesionales
            </a>
            <a
              href="#contacto"
              className="text-xs font-semibold text-zinc-600 transition hover:text-zinc-950"
            >
              Horarios & Local
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-medium text-zinc-800 transition hover:bg-zinc-100"
                >
                  Panel
                </Link>
                <a
                  href="/salir"
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 transition hover:text-red-600"
                >
                  Salir
                </a>
              </div>
            ) : (
              <Link
                href="/admin/login"
                className="hidden rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900 sm:inline-block"
              >
                Equipo
              </Link>
            )}

            <Link
              href="/reservar"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800 active:scale-95"
            >
              <span>Agendar Cita</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {params.sesion === "cerrada" && (
        <div className="mx-auto mt-4 max-w-6xl px-6">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700">
            Sesión cerrada correctamente.
          </div>
        </div>
      )}

      {/* Hero Section (Sattis Style con Imagen Principal) */}
      <section className="relative overflow-hidden border-b border-zinc-100 bg-gradient-to-b from-zinc-50/70 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-semibold text-zinc-700 shadow-xs">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>ESTUDIO PROFESIONAL · ATENCIÓN CON RESERVA</span>
              </div>

              <h1 className="mt-6 text-4xl font-black uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
                Corte, Estilo & <br />
                <span className="text-zinc-500">Cuidado Personal.</span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg">
                Un concepto contemporáneo de barbería, peluquería y estética. Atención personalizada,
                espacio diseñado para tu confort y reserva online instantánea sin llamadas ni esperas.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/reservar"
                  className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-zinc-800 active:scale-95"
                >
                  <span>Agendar Turno</span>
                  <ArrowRight className="size-4" />
                </Link>

                <a
                  href="#servicios"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-700 shadow-xs transition hover:border-zinc-300 hover:text-zinc-950"
                >
                  Ver Servicios
                </a>
              </div>

              {/* Badges / Metrics */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-200 pt-6">
                <div>
                  <p className="text-xl font-black text-zinc-950">0 min</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Demora previa</p>
                </div>
                <div>
                  <p className="text-xl font-black text-zinc-950">100%</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Dedicación individual</p>
                </div>
                <div>
                  <p className="text-xl font-black text-zinc-950">24/7</p>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Agenda en línea</p>
                </div>
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="overflow-hidden rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-950/5">
                  <img
                    src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80"
                    alt="Sattis Studio Interior"
                    className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-5 -left-5 rounded-2xl border border-zinc-200/80 bg-white/95 p-4 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">Atención puntual</p>
                      <p className="text-[11px] text-zinc-500">Sin filas ni demoras</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section con Fotos Reales (Sattis Style) */}
      <section id="servicios" className="py-20 bg-zinc-50/60 border-b border-zinc-200/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Carta de Servicios
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-950 sm:text-4xl">
                Cortes, Color & Cuidado
              </h2>
            </div>
            <p className="text-xs text-zinc-500">
              Precios transparentes · Incluyen diagnóstico de estilo y lavado profesional
            </p>
          </div>

          {/* Cards Grid con Imagen */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md"
              >
                {/* Service Photo */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
                  <img
                    src={getServiceImage(service.name)}
                    alt={service.name}
                    className="size-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-900 shadow-xs backdrop-blur-xs">
                      <Clock className="size-3 text-zinc-500" />
                      {service.durationMin} min
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950 group-hover:text-zinc-900">
                      {service.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-2">
                      {service.description ?? "Tratamiento personalizado en el estudio."}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                        Precio
                      </span>
                      <p className="text-lg font-black text-zinc-950">
                        {formatPrice(service.priceCents, settings.currency)}
                      </p>
                    </div>

                    <Link
                      href={`/reservar?servicio=${service.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800 active:scale-95"
                    >
                      <span>Agendar</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Quick Schedule Prompt */}
          <div className="mt-10 rounded-3xl border border-zinc-200 bg-white p-6 sm:flex sm:items-center sm:justify-between sm:p-8 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-zinc-950">
                ¿Querés agendar una serie de citas periódicas o elegir un horario directo?
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-xl">
                Nuestra plataforma te permite seleccionar cualquier profesional y verificar en tiempo
                real los huecos libres disponibles.
              </p>
            </div>
            <Link
              href="/reservar"
              className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 sm:mt-0"
            >
              <span>Abrir Agenda Completa</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sobre el Estudio / Ambiance (Sattis Studio About) */}
      <section id="estudio" className="py-20 border-b border-zinc-200/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-zinc-200 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1000&q=80"
                  alt="Espacio del estudio"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Sobre Nosotros
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-950 sm:text-4xl">
                Un Espacio Pensado Para Vos
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                En nuestro estudio combinamos técnicas clásicas y de vanguardia para ofrecerte un
                resultado que represente tu personalidad. Cada cita es individual, garantizando
                dedicación absoluta desde que entrás hasta que terminás tu sesión.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-950">
                      Puntualidad Garantizada
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      No superponemos turnos. Tu horario es exclusivo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-950">
                      Productos de Calidad Profesional
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Tratamientos certificados para el cuidado de tu cabello y piel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                    <Compass className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-950">
                      Diagnóstico Personalizado
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Te asesoramos para elegir el estilo que mejor se adapta a vos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook / Galería de Trabajos (Grid de Fotos Reales) */}
      <section id="galeria" className="py-20 bg-zinc-50/60 border-b border-zinc-200/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Lookbook & Trabajos
            </p>
            <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-950 sm:text-4xl">
              Nuestra Galería
            </h2>
            <p className="mt-2 text-xs text-zinc-500">
              Cortes, estilos y terminaciones realizadas en nuestro estudio.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80"
                alt="Corte y textura"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80"
                alt="Color y nutrición"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=600&q=80"
                alt="Detalle de barba"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=600&q=80"
                alt="Corte bob y peinado"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80"
                alt="Uñas y esmaltado"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
              <img
                src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=600&q=80"
                alt="Fade y precisión"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Members con Foto */}
      {staffMembers.length > 0 && (
        <section id="equipo" className="py-20 border-b border-zinc-200/80">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Staff Profesional
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-950 sm:text-4xl">
                Nuestro Equipo
              </h2>
              <p className="mt-2 text-xs text-zinc-500">
                Elegí a tu estilista o barbero de confianza para tu próximo servicio.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {staffMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs transition hover:border-zinc-300 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                    <img
                      src={getStaffImage(index)}
                      alt={member.name}
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-zinc-950">{member.name}</h3>
                    <p className="text-xs text-zinc-500">Profesional del Estudio</p>

                    {member.services.length > 0 && (
                      <div className="mt-4 border-t border-zinc-100 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Especialidades
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {member.services.map((s) => (
                            <span
                              key={s.id}
                              className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link
                      href="/reservar"
                      className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-bold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100"
                    >
                      <span>Ver turnos con {member.name}</span>
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Horarios & Local (Contacto) */}
      <section id="contacto" className="py-20 bg-zinc-50/60 border-b border-zinc-200/80">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Información Práctica
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-zinc-950">
                Horarios & Ubicación
              </h2>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-950">
                      Horarios de Atención
                    </h4>
                    <p className="text-xs text-zinc-600 mt-1">
                      Martes a Sábado: 10:00 a 20:00 hs
                    </p>
                    <p className="text-xs text-zinc-400">Domingos y Lunes: Cerrado</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-950">
                      Dirección del Estudio
                    </h4>
                    <p className="text-xs text-zinc-600 mt-1">
                      Atención en espacio privado con cita previa para garantizar dedicación
                      exclusiva.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-900">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-950">
                      Tolerancia y Cancelación
                    </h4>
                    <p className="text-xs text-zinc-600 mt-1">
                      10 minutos de tolerancia. Podés cancelar o reprogramar tu cita sin costo
                      avisando con hasta 24 hs de anticipación.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm flex flex-col justify-between h-full">
                <div>
                  <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Reserva Fácil
                  </span>
                  <h3 className="mt-4 text-2xl font-black uppercase tracking-tight text-zinc-950">
                    Asegurá tu lugar en la agenda
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                    Sin llamadas, sin esperas y desde tu celular en 4 pasos simples. Elegí tu servicio
                    y horario preferido.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100">
                  <Link
                    href="/reservar"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-zinc-800 active:scale-95"
                  >
                    <span>Agendar mi turno</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-md bg-zinc-950 text-[10px] font-bold text-white">
              ST
            </span>
            <p>
              © {new Date().getFullYear()} {settings.businessName} · Studio & Barbershop.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#servicios" className="transition hover:text-zinc-900 font-medium">
              Servicios
            </a>
            <a href="#galeria" className="transition hover:text-zinc-900 font-medium">
              Galería
            </a>
            <Link href="/reservar" className="transition hover:text-zinc-900 font-bold">
              Reservar
            </Link>
            {user ? (
              <Link href="/admin" className="font-semibold text-zinc-900 hover:underline">
                Panel administrativo
              </Link>
            ) : (
              <Link href="/admin/login" className="transition hover:text-zinc-900">
                Acceso del equipo
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
