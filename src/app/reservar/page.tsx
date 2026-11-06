import type { Metadata } from "next";
import Link from "next/link";

import { BookingWizard } from "@/components/booking-wizard";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { dateKey, nowWallClock } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Reservar turno" };

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const params = await searchParams;
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
      <div className="flex min-h-dvh w-full items-center justify-center bg-zinc-50 px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">
            Servicios no disponibles en este momento
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Estamos configurando los turnos y servicios. Por favor volvé a consultar en unos instantes.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-zinc-950 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
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
      embedded={false}
    />
  );
}
