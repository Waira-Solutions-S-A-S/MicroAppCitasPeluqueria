import Link from "next/link";
import { ArrowRight, Calendar, Check } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const bookingBenefits = [
  { label: "Reserva online 24/7", tag: "24/7" },
  { label: "Confirmación automática", tag: "Al instante" },
  { label: "Recordatorios por WhatsApp y email", tag: "Automático" },
  { label: "Reprogramación sin llamadas", tag: "1 clic" },
  { label: "Seña o pago online", tag: "Opcional" },
];

const retentionBenefits = [
  { label: "Recordatorio de retorno", tag: "Automático" },
  { label: "Campañas para clientes inactivos", tag: "0 esfuerzo" },
  { label: "Historial y preferencias", tag: "Siempre a mano" },
  { label: "Recompensas por fidelidad", tag: "Más recompra" },
  { label: "Mensajes con tu marca", tag: "Personalizado" },
];

const audiences = [
  {
    name: "Peluquerías",
    initial: "P",
    color: "#18181b",
    description: "Cortes, color y tratamientos sin cruces de horarios.",
  },
  {
    name: "Barberías",
    initial: "B",
    color: "#7c3aed",
    description: "Turnos rápidos, clientes fieles y agenda siempre llena.",
  },
  {
    name: "Tatuadores",
    initial: "T",
    color: "#db2777",
    description: "Sesiones largas, señas y disponibilidad clara.",
  },
  {
    name: "Fotógrafos",
    initial: "F",
    color: "#0891b2",
    description: "Sesiones y entregas sin idas y vueltas.",
  },
  {
    name: "Maquilladoras",
    initial: "M",
    color: "#d97706",
    description: "Eventos, pruebas y clientas que vuelven.",
  },
  {
    name: "Estilistas y cosmetólogas",
    initial: "E",
    color: "#059669",
    description: "Tratamientos recurrentes y seguimiento personalizado.",
  },
];

const freeFeatures = [
  "Reservas ilimitadas",
  "Confirmaciones automáticas",
  "Recordatorios de retorno",
  "Historial de clientes",
  "Con publicidad",
];

const proFeatures = [
  "Todo lo del plan Gratis",
  "Sin publicidad",
  "Experiencia más limpia",
  "Tu marca, sin distracciones",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sesion?: string }>;
}) {
  const params = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  // Lookbook images from authentic studio gallery
  const studioLookbook = [
    { src: "/swiper-imgs/img-studio-001.jpg", title: "Reservá en segundos" },
    { src: "/swiper-imgs/img-studio-002.jpg", title: "Confirmación al instante" },
    { src: "/swiper-imgs/img-studio-003.jpg", title: "Recordatorio de retorno" },
    { src: "/swiper-imgs/img-studio-004.jpg", title: "Reprogramación fácil" },
    { src: "/swiper-imgs/img-studio-005.jpg", title: "Historial del cliente" },
    { src: "/swiper-imgs/img-studio-006.jpg", title: "Campañas de fidelización" },
    { src: "/swiper-imgs/img-studio-007.jpg", title: "Señas y pagos online" },
    { src: "/swiper-imgs/img-studio-008.jpg", title: "Tu marca, tu estilo" },
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
              href="#producto"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Producto
            </a>
            <a
              href="#beneficios"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Beneficios
            </a>
            <a
              href="#para-quien"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Para quién
            </a>
            <a
              href="#precios"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Precios
            </a>
            <a
              href="#fidelizacion"
              className="text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-950"
            >
              Fidelización
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
                  Mi cuenta
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
                Ingresar
              </Link>
            )}

            <Link
              href="#precios"
              className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-5 py-2 text-xs font-medium tracking-wide text-white transition hover:bg-zinc-800"
            >
              <ArrowRight className="size-3.5" />
              <span>Empezar gratis</span>
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

      {/* Hero Section */}
      <section
        id="inicio"
        className="relative flex h-[580px] w-full flex-col justify-end overflow-hidden px-8 pb-16 md:h-[680px] md:px-16"
      >
        <img
          src="/studio/bg-hero.jpg"
          alt="Estudio de belleza con agenda organizada"
          className="absolute inset-0 size-full object-cover filter brightness-[0.75]"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-300">
              Software de agendamiento y reservas
            </p>
            <h1 className="mt-2 text-4xl font-light tracking-tight text-white sm:text-5xl md:text-6xl">
              Tu agenda llena. <br />
              <span className="font-medium">Tus clientes, siempre volviendo.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-200 sm:text-base">
              Tus clientes reservan en segundos, reciben recordatorios para volver y vos
              recuperás horas de trabajo. Sin WhatsApp, sin planillas y sin turnos perdidos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#precios"
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-white bg-white px-7 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              <span>Empezar gratis</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/reservar"
              className="inline-flex min-h-[48px] items-center gap-2.5 rounded-full border border-white/80 bg-white/10 px-7 py-3 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white hover:text-zinc-950"
            >
              <span>Ver demo</span>
              <Calendar className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section: La experiencia de reserva */}
      <section id="producto" className="w-full overflow-hidden pt-24 md:pt-32">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="flex flex-col gap-6 md:w-3/5">
            <h2 className="text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
              La experiencia de reserva <br />
              <span className="font-medium">que tus clientes van a amar.</span>
            </h2>
            <p className="text-base font-normal leading-relaxed text-zinc-600 sm:text-lg">
              Menos fricción, más citas. Tus clientes eligen servicio, profesional y horario
              en menos de un minuto. Reciben confirmación y recordatorio automático, y pueden
              reprogramar sin llamarte. Vos ganás una agenda ordenada y tiempo para tu trabajo.
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

      {/* Section 1: Reservas ágiles */}
      <section id="beneficios" className="mx-auto max-w-7xl px-6 pt-28 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left: Full photo with huge overlay typography */}
          <div className="relative min-h-[420px] w-full overflow-hidden rounded-2xl md:min-h-[560px] md:w-1/2">
            <img
              src="/studio/img-section-01.jpg"
              alt="Barbería con reservas online"
              className="size-full object-cover"
            />
            <span className="absolute bottom-6 left-6 text-5xl font-light tracking-tight text-white md:text-6xl">
              Reservas
            </span>
          </div>

          {/* Right: Clean panel with description and benefits list */}
          <div className="flex w-full flex-col justify-center rounded-2xl bg-zinc-100 p-8 sm:p-12 md:w-1/2 md:p-16">
            <h3 className="text-2xl font-light text-zinc-900 sm:text-3xl">
              Reservar tiene que ser <br />
              <span className="font-medium">fácil para tu cliente.</span>
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              Cada paso extra es un cliente que abandona. Con un flujo simple, tus clientes
              reservan solos desde el celular, a cualquier hora, sin esperar que alguien
              conteste un mensaje.
            </p>

            {/* Benefit Items List */}
            <div className="mt-8 space-y-3">
              {bookingBenefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-center justify-between border-b border-zinc-200/80 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Check className="size-4 text-zinc-900" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                      {benefit.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">{benefit.tag}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="#precios"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-950 bg-transparent px-6 py-2.5 text-xs font-medium tracking-wide text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
              >
                <span>Quiero reservas así</span>
                <Calendar className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Breath Section 1 */}
      <div className="mx-auto max-w-7xl px-8 py-24 text-right md:px-16 md:py-32">
        <h3 className="text-3xl font-light leading-tight text-zinc-900 sm:text-4xl md:text-5xl">
          Cada turno que no se pierde{" "}
          <span className="block font-medium sm:inline">es dinero que sí entra.</span>
        </h3>
      </div>

      {/* Section 2: Fidelización y retoma */}
      <section id="fidelizacion" className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* Left: Content panel */}
          <div className="order-2 flex w-full flex-col justify-center rounded-2xl bg-zinc-100 p-8 sm:p-12 md:order-1 md:w-1/2 md:p-16">
            <h3 className="text-2xl font-light text-zinc-900 sm:text-3xl">
              Que vuelvan <br />
              <span className="font-medium">no es suerte. Es sistema.</span>
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600">
              El software detecta cuándo está por volver cada cliente, le recuerda su próximo
              turno y te ayuda a recuperar a los que se enfriaron. Más frecuencia, más ticket
              promedio y menos esfuerzo manual.
            </p>

            <div className="mt-8 space-y-3">
              {retentionBenefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className="flex items-center justify-between border-b border-zinc-200/80 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <Check className="size-4 text-zinc-900" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800">
                      {benefit.label}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">{benefit.tag}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="#precios"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-950 bg-transparent px-6 py-2.5 text-xs font-medium tracking-wide text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
              >
                <span>Quiero clientes que vuelvan</span>
                <Calendar className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Right: Full photo with huge overlay typography */}
          <div className="order-1 relative min-h-[420px] w-full overflow-hidden rounded-2xl md:order-2 md:min-h-[560px] md:w-1/2">
            <img
              src="/studio/img-section-03.jpg"
              alt="Estética y fidelización de clientes"
              className="size-full object-cover"
            />
            <span className="absolute bottom-6 left-6 text-5xl font-light tracking-tight text-white md:text-6xl">
              Fidelización
            </span>
          </div>
        </div>
      </section>

      {/* Breath Section 2 */}
      <div className="mx-auto max-w-7xl px-8 py-24 text-left md:px-16 md:py-32">
        <h3 className="text-3xl font-light leading-tight text-zinc-900 sm:text-4xl md:text-5xl">
          Tu negocio, organizado. <br />
          <span className="font-medium">Tu cabeza, tranquila.</span>
        </h3>
      </div>

      {/* Para quién es */}
      <section id="para-quien" className="border-t border-zinc-200/80 bg-zinc-50/50 py-24">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Para quién es
            </p>
            <h2 className="mt-1 text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl">
              Hecho para negocios <span className="font-medium">que viven de su agenda.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              Si tus ingresos dependen de turnos, esto es para vos.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {audiences.map((audience) => (
              <div
                key={audience.name}
                className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex size-12 items-center justify-center rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: audience.color }}
                  >
                    {audience.initial}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-zinc-950">{audience.name}</h3>
                    <p className="text-xs text-zinc-500">Negocio de agenda</p>
                  </div>
                </div>

                <p className="mt-5 border-t border-zinc-100 pt-4 text-xs leading-relaxed text-zinc-600">
                  {audience.description}
                </p>

                <Link
                  href="#precios"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 py-2.5 text-xs font-medium text-zinc-900 transition hover:bg-zinc-100"
                >
                  <span>Empezar gratis</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Precios
          </p>
          <h2 className="mt-2 text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
            Empezá gratis.{" "}
            <span className="font-medium">Pasá a Pro cuando quieras.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base">
            Sin contratos ni letra chica. El plan Gratis es totalmente funcional; el Pro te
            da la experiencia más limpia por solo $5 USD.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {/* Plan Gratis */}
          <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-xs">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Plan Gratis
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-light tracking-tight text-zinc-950">$0</span>
              <span className="text-xs text-zinc-500">sin costo</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Totalmente funcional, sostenido con publicidad.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-zinc-700">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-zinc-900" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/admin/login"
              className="mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-zinc-950 bg-transparent px-6 py-2.5 text-xs font-medium tracking-wide text-zinc-950 transition hover:bg-zinc-950 hover:text-white"
            >
              <span>Empezar gratis</span>
              <Calendar className="size-3.5" />
            </Link>
          </div>

          {/* Plan Pro */}
          <div className="relative flex flex-col rounded-2xl border border-zinc-950 bg-zinc-50 p-8 shadow-xs">
            <span className="absolute right-6 top-6 rounded-full bg-zinc-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Recomendado
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Plan Pro
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-light tracking-tight text-zinc-950">$5</span>
              <span className="text-xs text-zinc-500">USD</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Sin publicidad y con una experiencia más limpia.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-zinc-700">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <Check className="size-4 shrink-0 text-zinc-900" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/admin/login"
              className="mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-6 py-2.5 text-xs font-medium tracking-wide text-white transition hover:bg-zinc-800"
            >
              <span>Pasar a Pro</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          Precios en USD. Cancelás cuando quieras.
        </p>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t border-zinc-200 bg-white pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-8 md:px-16">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-16 border-b border-zinc-200/80">
            {/* Brand */}
            <div>
              <p className="text-lg font-medium text-zinc-950">{settings.businessName}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                El software de reservas para peluquerías, barberías, tatuadores, fotógrafos y
                profesionales que viven de su agenda.
              </p>
              <div className="mt-6">
                <Link
                  href="#precios"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-zinc-950 bg-zinc-950 px-6 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                >
                  <ArrowRight className="size-3.5" />
                  <span>Empezar gratis</span>
                </Link>
              </div>
            </div>

            {/* Producto */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Producto
              </p>
              <ul className="mt-3 space-y-2 text-xs text-zinc-600">
                <li>
                  <a href="#beneficios" className="transition hover:text-zinc-950">
                    Beneficios
                  </a>
                </li>
                <li>
                  <a href="#fidelizacion" className="transition hover:text-zinc-950">
                    Fidelización
                  </a>
                </li>
                <li>
                  <a href="#para-quien" className="transition hover:text-zinc-950">
                    Para quién
                  </a>
                </li>
                <li>
                  <a href="#precios" className="transition hover:text-zinc-950">
                    Precios
                  </a>
                </li>
              </ul>
            </div>

            {/* Cuenta */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Cuenta
              </p>
              <ul className="mt-3 space-y-2 text-xs text-zinc-600">
                <li>
                  <Link href="/admin/login" className="transition hover:text-zinc-950">
                    Ingresar
                  </Link>
                </li>
                <li>
                  <Link href="/reservar" className="transition hover:text-zinc-950">
                    Ver demo
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link
                      href="/admin"
                      className="font-semibold text-zinc-950 hover:underline"
                    >
                      Mi cuenta
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Empezá hoy */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                Empezá hoy
              </p>
              <p className="mt-3 text-xs leading-relaxed text-zinc-600">
                Plan Gratis funcional con publicidad. Plan Pro por $5 USD, sin publicidad y
                con una experiencia más limpia.
              </p>
              <a
                href="#precios"
                className="mt-3 inline-block text-xs font-semibold text-zinc-900 transition hover:underline"
              >
                Ver planes
              </a>
            </div>
          </div>

          <div className="pt-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left text-xs text-zinc-500">
            <p>
              © {new Date().getFullYear()} {settings.businessName}. Todos los derechos
              reservados.
            </p>
            <p className="mt-2 sm:mt-0">Hecho para que tu agenda trabaje por vos.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
