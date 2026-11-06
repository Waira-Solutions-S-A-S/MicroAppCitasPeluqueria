import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  User,
} from "lucide-react";

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

  // Lookbook images from authentic studio gallery
  const studioLookbook = [
    { src: "/swiper-imgs/img-studio-001.jpg", title: "Corte & Estilo" },
    { src: "/swiper-imgs/img-studio-002.jpg", title: "Acabado Texturado" },
    { src: "/swiper-imgs/img-studio-003.jpg", title: "Diseño & Barba" },
    { src: "/swiper-imgs/img-studio-004.jpg", title: "Fade de Precisión" },
    { src: "/swiper-imgs/img-studio-005.jpg", title: "Color & Brillo" },
    { src: "/swiper-imgs/img-studio-006.jpg", title: "Espacio del Estudio" },
    { src: "/swiper-imgs/img-studio-007.jpg", title: "Tratamiento Capilar" },
    { src: "/swiper-imgs/img-studio-008.jpg", title: "Perfilado Clásico" },
  ];

  return (
    <div className="min-h-dvh bg-white text-zinc-900 antialiased selection:bg-zinc-200">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-medium tracking-tight text-zinc-950">
              {settings.businessName}
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#inicio"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Inicio
            </a>
            <a
              href="#studio"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              El Estudio
            </a>
            <a
              href="#servicios"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Peluquería & Barbería
            </a>
            <a
              href="#estetica"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Estética & Color
            </a>
            <a
              href="#contacto"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Contacto
            </a>
          </nav>

          {/* Action buttons */}
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
                Acceso staff
              </Link>
            )}

            <Link
              href="/reservar"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-5 py-2 text-xs font-medium tracking-wide text-white transition hover:bg-zinc-800"
            >
              <Calendar className="size-3.5" />
              <span>Marcar horario</span>
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

      {/* Hero Section (Sattis Style con Fondo Hero Real y Botón Minimalista) */}
      <section
        id="inicio"
        className="relative flex h-[580px] w-full flex-col justify-end overflow-hidden px-8 pb-16 md:h-[680px] md:px-16"
      >
        <img
          src="/studio/bg-hero.jpg"
          alt="Sattis Studio Ambience"
          className="absolute inset-0 size-full object-cover filter brightness-[0.75]"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
              {settings.businessName} · Studio & Grooming
            </p>
            <h1 className="mt-2 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
              Corte, Estilo & <br />
              <span className="font-medium">Cuidado Personal.</span>
            </h1>
          </div>

          <Link
            href="/reservar"
            className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-white/80 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-zinc-950"
          >
            <span>Marcar horario</span>
            <Calendar className="size-4" />
          </Link>
        </div>
      </section>

      {/* About Section: Transformamos estilo en expresión */}
      <section id="studio" className="w-full overflow-hidden pt-24 md:pt-32">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="flex flex-col gap-6 md:w-3/5">
            <h2 className="text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
              Transformamos <br />
              estilo en <span className="font-medium">expresión.</span>
            </h2>
            <p className="text-base font-normal leading-relaxed text-zinc-600 sm:text-lg">
              Cuidamos tu estilo con precisión y arte, elevando cada detalle para reflejar tu identidad única.
              Atención personalizada con reserva previa para garantizar dedicación exclusiva.
            </p>
          </div>
        </div>

        {/* Studio Lookbook Showcase Horizontal Strip */}
        <div className="no-scrollbar mt-14 flex gap-4 overflow-x-auto pl-8 pr-8 pb-4 md:pl-16">
          {studioLookbook.map((item, index) => (
            <div
              key={index}
              className="group relative h-[320px] w-[240px] shrink-0 overflow-hidden rounded-2xl bg-zinc-100 shadow-sm md:h-[380px] md:w-[280px]"
            >
              <img
                src={item.src}
                alt={item.title}
                className="size-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                <p className="text-xs font-medium tracking-wide">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 1: Peluquería & Barbería (Split Section Estilo Sattis) */}
      <section id="servicios" className="mx-auto max-w-7xl px-6 pt-28 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left: Full photo with huge overlay typography */}
          <div className="relative min-h-[420px] w-full overflow-hidden rounded-2xl md:min-h-[560px] md:w-1/2">
            <img
              src="/studio/img-section-01.jpg"
              alt="Barbería y Peluquería"
              className="size-full object-cover"
            />
            <span className="absolute bottom-6 left-6 text-5xl font-light tracking-tight text-white md:text-6xl">
              Barbería
            </span>
          </div>

          {/* Right: Clean panel with description and services list */}
          <div className="flex w-full flex-col justify-center rounded-2xl bg-zinc-100 p-8 sm:p-12 md:w-1/2 md:p-16">
            <h3 className="text-2xl font-light text-zinc-900 sm:text-3xl">
              Aquí, la tradición <br />
              <span className="font-medium">encuentra la modernidad.</span>
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              En nuestro espacio, cada corte de cabello, barba o peinado está pensado para realzar tu
              personalidad y asegurar que te lleves la mejor versión de vos mismo.
            </p>

            {/* Service Items List */}
            <div className="mt-8 space-y-3">
              {services.slice(0, 5).map((service) => (
                <Link
                  key={service.id}
                  href={`/reservar?servicio=${service.id}`}
                  className="group flex items-center justify-between border-b border-zinc-200/80 py-2.5 transition hover:border-zinc-950"
                >
                  <div className="flex items-center gap-3">
                    <Check className="size-4 text-zinc-900" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800 group-hover:text-zinc-950">
                      {service.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">{service.durationMin} min</span>
                    <span className="text-sm font-semibold text-zinc-900">
                      {formatPrice(service.priceCents, settings.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/reservar"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-950 bg-transparent px-6 py-2.5 text-xs font-medium tracking-wide text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
              >
                <span>Marcar horario</span>
                <Calendar className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Breath Section 1 (Statement con tipografía editorial pura) */}
      <div className="mx-auto max-w-7xl px-8 py-24 text-right md:px-16 md:py-32">
        <h3 className="text-3xl font-light leading-tight text-zinc-900 sm:text-4xl md:text-5xl">
          Descubrí la fusión perfecta entre{" "}
          <span className="block font-medium sm:inline">
            estilo, arte y cuidado.
          </span>
        </h3>
      </div>

      {/* Section 2: Estética & Color (Flipped Split Section Estilo Sattis) */}
      <section id="estetica" className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left: Content panel */}
          <div className="order-2 flex w-full flex-col justify-center rounded-2xl bg-zinc-100 p-8 sm:p-12 md:order-1 md:w-1/2 md:p-16">
            <h3 className="text-2xl font-light text-zinc-900 sm:text-3xl">
              Estilo y actitud <br />
              <span className="font-medium">en cada detalle.</span>
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Tratamientos capilares, colorimetría, peinados y cuidado personal ejecutados con
              técnicas de precisión y productos de primera línea para garantizar resultados duraderos.
            </p>

            <div className="mt-8 space-y-3">
              {services.slice(5).length > 0 ? (
                services.slice(5).map((service) => (
                  <Link
                    key={service.id}
                    href={`/reservar?servicio=${service.id}`}
                    className="group flex items-center justify-between border-b border-zinc-200/80 py-2.5 transition hover:border-zinc-950"
                  >
                    <div className="flex items-center gap-3">
                      <Check className="size-4 text-zinc-900" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800 group-hover:text-zinc-950">
                        {service.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">{service.durationMin} min</span>
                      <span className="text-sm font-semibold text-zinc-900">
                        {formatPrice(service.priceCents, settings.currency)}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="border-t border-zinc-200 pt-3 text-xs text-zinc-600">
                  <p>Diagnóstico de estilo y asesoría personalizada en el salón.</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/reservar"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-950 bg-transparent px-6 py-2.5 text-xs font-medium tracking-wide text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
              >
                <span>Agendar servicio</span>
                <Calendar className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Full photo with huge overlay typography */}
          <div className="order-1 relative min-h-[420px] w-full overflow-hidden rounded-2xl md:order-2 md:min-h-[560px] md:w-1/2">
            <img
              src="/studio/img-section-03.jpg"
              alt="Estética y Cuidado"
              className="size-full object-cover"
            />
            <span className="absolute bottom-6 left-6 text-5xl font-light tracking-tight text-white md:text-6xl">
              Estética
            </span>
          </div>
        </div>
      </section>

      {/* Breath Section 2 (Statement izquierdo) */}
      <div className="mx-auto max-w-7xl px-8 py-24 text-left md:px-16 md:py-32">
        <h3 className="text-3xl font-light leading-tight text-zinc-900 sm:text-4xl md:text-5xl">
          Cada detalle cuenta. <br />
          <span className="font-medium">Elevá tu presencia con confianza.</span>
        </h3>
      </div>

      {/* Staff / Equipo */}
      {staffMembers.length > 0 && (
        <section id="equipo" className="border-t border-zinc-200/80 bg-zinc-50/50 py-24">
          <div className="mx-auto max-w-7xl px-8 md:px-16">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Staff
              </p>
              <h2 className="mt-1 text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl">
                Nuestro <span className="font-medium">Equipo</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {staffMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex size-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-zinc-950">{member.name}</h3>
                      <p className="text-xs text-zinc-500">Profesional del estudio</p>
                    </div>
                  </div>

                  {member.services.length > 0 && (
                    <div className="mt-5 border-t border-zinc-100 pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                        Especialidades
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {member.services.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href="/reservar"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-100"
                  >
                    <span>Ver disponibilidad</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Estilo Sattis Studio */}
      <footer id="contacto" className="border-t border-zinc-200 bg-white pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-16 border-b border-zinc-200/80">
            {/* Brand */}
            <div>
              <p className="text-lg font-medium text-zinc-950">{settings.businessName}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                Espacio multifuncional dedicado a cortes, cuidado personal, estética y estilo con reserva previa.
              </p>
              <div className="mt-6">
                <Link
                  href="/reservar"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-6 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                >
                  <Calendar className="size-3.5" />
                  <span>Marcar horario</span>
                </Link>
              </div>
            </div>

            {/* Horarios */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Horario de atención
              </p>
              <p className="mt-3 text-xs text-zinc-600">
                Martes a Sábado: <br />
                09:30 a 12:30 hs y 14:30 a 19:00 hs
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Encerrados: Domingo, Lunes y Feriados seleccionados.
              </p>
            </div>

            {/* Ubicación y Contacto */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Contacto y Estudio
              </p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Atención con turno programado para garantizar puntualidad y dedicación.
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Cancelaciones o cambios sin cargo con 24 hs de anticipación.
              </p>
            </div>

            {/* Navegación y Staff */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Navegación
              </p>
              <ul className="mt-3 space-y-2 text-xs text-zinc-600">
                <li>
                  <a href="#inicio" className="transition hover:text-zinc-950">
                    Inicio
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="transition hover:text-zinc-950">
                    Barbería & Servicios
                  </a>
                </li>
                <li>
                  <a href="#estetica" className="transition hover:text-zinc-950">
                    Estética
                  </a>
                </li>
                <li>
                  {user ? (
                    <Link href="/admin" className="font-semibold text-zinc-950 hover:underline">
                      Panel Administrativo
                    </Link>
                  ) : (
                    <Link href="/admin/login" className="transition hover:text-zinc-950">
                      Acceso Profesionales
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} {settings.businessName}. Todos los derechos reservados.
            </p>
            <p className="mt-2 sm:mt-0">
              Diseñado con precisión e identidad editorial.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
