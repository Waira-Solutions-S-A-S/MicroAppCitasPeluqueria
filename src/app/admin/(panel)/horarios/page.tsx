import type { Metadata } from "next";

import { Flash } from "@/components/admin/flash";
import { StaffManager } from "@/components/admin/staff-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Equipo y Horarios · Panel" };

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;

  const [staff, services] = await Promise.all([
    prisma.staffMember.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        workingHours: true,
        services: { select: { id: true, name: true } },
      },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6 antialiased text-zinc-900">
      {/* Page Header */}
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <nav className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <span>Panel</span> <span className="mx-1">/</span> <span className="text-zinc-900">Equipo</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950">
            Equipo y Horarios de Atención
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Define la disponibilidad, turnos semanales y servicios que atiende cada miembro del equipo.
          </p>
        </div>
      </div>

      <Flash ok={params.ok} error={params.error} />

      {/* Metis Master-Detail Staff Manager (Pestañas por miembro sin scroll excesivo) */}
      <StaffManager staff={staff} services={services} />
    </div>
  );
}
