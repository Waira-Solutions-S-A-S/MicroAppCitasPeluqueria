import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { decodeAppointmentNotes } from "@/lib/multi-service";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { nowWallClock, startOfDay } from "@/lib/time";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const settings = await getSettings();
  const today = startOfDay(nowWallClock(settings.timezone));

  const [pendingCount, pendingAppointments] = await Promise.all([
    prisma.appointment.count({
      where: {
        status: "PENDING",
        startAt: { gte: today },
      },
    }),
    prisma.appointment.findMany({
      where: {
        status: "PENDING",
        startAt: { gte: today },
      },
      orderBy: { startAt: "asc" },
      take: 5,
      select: {
        id: true,
        clientName: true,
        clientPhone: true,
        startAt: true,
        notes: true,
        service: { select: { name: true } },
        staff: { select: { name: true, color: true } },
      },
    }),
  ]);

  const serializedPending = pendingAppointments.map((p) => {
    const { extraServiceIds } = decodeAppointmentNotes(p.notes);
    const serviceName =
      extraServiceIds.length > 0
        ? `${p.service.name} (+${extraServiceIds.length})`
        : p.service.name;
    return {
      id: p.id,
      clientName: p.clientName,
      clientPhone: p.clientPhone,
      startAt: p.startAt.toISOString(),
      serviceName,
      staffName: p.staff.name,
      staffColor: p.staff.color,
    };
  });

  return (
    <AdminShell
      businessName={settings.businessName}
      userEmail={user.email}
      userName={user.name || "Administrador"}
      pendingCount={pendingCount}
      pendingItems={serializedPending}
    >
      {children}
    </AdminShell>
  );
}
