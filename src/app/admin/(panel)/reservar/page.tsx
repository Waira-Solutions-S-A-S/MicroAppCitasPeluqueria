import type { Metadata } from "next";
import Link from "next/link";

import { BookingWizard } from "@/components/booking-wizard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { dateKey, nowWallClock } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Nueva reserva · Panel" };

export default async function AdminReservarPage() {
  const settings = await getSettings();

  const [services, staffRecords] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        durationMin: true,
        priceCents: true,
        color: true,
      },
    }),
    prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        color: true,
        services: { select: { id: true } },
      },
    }),
  ]);

  const staff = staffRecords.map(({ services: staffServices, ...member }) => ({
    ...member,
    serviceIds: staffServices.map((service) => service.id),
  }));

  if (services.length === 0 || staff.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-medium tracking-tight text-zinc-900">
          Todavía no hay servicios ni profesionales
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Crea al menos un servicio y un profesional para empezar a registrar reservas manuales.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/admin/servicios"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Crear servicios
          </Link>
          <Link
            href="/admin/horarios"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
          >
            Crear profesionales
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Recepción / Agenda</p>
        <h1 className="mt-1 text-2xl font-medium tracking-tight text-zinc-900">Nueva reserva</h1>
        <p className="mt-1 text-sm text-zinc-600">Carga un turno presencial o telefónico para un cliente.</p>
      </header>

      <BookingWizard
        embedded
        businessName={settings.businessName}
        currency={settings.currency}
        services={services}
        staff={staff}
        todayKey={dateKey(nowWallClock(settings.timezone))}
        maxAdvanceDays={settings.maxAdvanceDays}
      />
    </div>
  );
}
