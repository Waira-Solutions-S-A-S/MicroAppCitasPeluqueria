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
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Todavía no hay servicios ni profesionales</h1>
        <p className="text-sm text-muted">
          Creá al menos un servicio y un profesional para empezar a cargar reservas.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/admin/servicios"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            Crear servicios
          </Link>
          <Link
            href="/admin/horarios"
            className="rounded-full border border-ink/10 bg-white px-5 py-2.5 text-sm font-semibold"
          >
            Crear profesionales
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">Agenda</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Nueva reserva</h1>
        <p className="mt-1 text-sm text-muted">Cargá un turno para un cliente.</p>
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
