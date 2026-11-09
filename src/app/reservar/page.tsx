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

  let services: any[] = [];
  let staffRecords: any[] = [];
  try {
    const res = await Promise.all([
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
    services = res[0];
    staffRecords = res[1];
  } catch (e) {
    console.warn("DB not initialized yet in /reservar:", e);
  }

  const staff = staffRecords.map(({ services: staffServices, ...member }: any) => ({
    ...member,
    serviceIds: (staffServices || []).map((service: { id: string }) => service.id),
  }));

  if (services.length === 0 || staff.length === 0) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-[#f4f6f9] px-4 py-12 antialiased text-zinc-900 font-sans">
        <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 sm:p-8 text-center shadow-xs">
          <h1 className="text-lg font-bold tracking-tight text-zinc-950">
            Servicios No Disponibles en Este Momento
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Estamos configurando los turnos y servicios. Por favor vuelve a consultar en unos instantes.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex min-h-[36px] items-center justify-center rounded bg-zinc-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
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
