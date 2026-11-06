import type { Metadata } from "next";
import Link from "next/link";

import { BookingWizard } from "@/components/booking-wizard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { dateKey, nowWallClock } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reservar" };

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const params = await searchParams;
  const settings = await getSettings();

  const [services, staff] = await Promise.all([
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
      select: { id: true, name: true, color: true },
    }),
  ]);

  if (services.length === 0 || staff.length === 0) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-semibold">Todavía no hay servicios cargados</h1>
        <p className="text-sm text-muted">
          Entrá al panel del negocio para crear servicios y profesionales.
        </p>
        <Link
          href="/admin"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
        >
          Ir al panel
        </Link>
      </div>
    );
  }

  const initialServiceId = services.some((service) => service.id === params.servicio)
    ? params.servicio
    : undefined;

  return (
    <BookingWizard
      businessName={settings.businessName}
      currency={settings.currency}
      services={services}
      staff={staff}
      todayKey={dateKey(nowWallClock(settings.timezone))}
      maxAdvanceDays={settings.maxAdvanceDays}
      initialServiceId={initialServiceId}
    />
  );
}
