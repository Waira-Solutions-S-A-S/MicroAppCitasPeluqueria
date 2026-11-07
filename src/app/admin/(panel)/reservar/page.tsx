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
      <div className="mx-auto max-w-lg rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-xs">
        <h1 className="text-base font-bold tracking-tight text-zinc-950">
          Todavía no hay servicios ni profesionales
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Crea al menos un servicio y un profesional para empezar a registrar reservas manuales.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/admin/servicios"
            className="inline-flex min-h-[36px] items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-zinc-800"
          >
            Crear servicios
          </Link>
          <Link
            href="/admin/horarios"
            className="inline-flex min-h-[36px] items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50"
          >
            Crear profesionales
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metis Breadcrumb Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Nueva Cita</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Cargar Cita Manual
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Registra una cita solicitada por teléfono, WhatsApp o presencialmente en el estudio.
          </p>
        </div>
      </div>

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
