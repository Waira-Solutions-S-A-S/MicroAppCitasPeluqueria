import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
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

  const pendingCount = await prisma.appointment.count({
    where: {
      status: "PENDING",
      startAt: { gte: today },
    },
  });

  return (
    <AdminShell
      businessName={settings.businessName}
      userEmail={user.email}
      userName={user.name || "Administrador"}
      pendingCount={pendingCount}
    >
      {children}
    </AdminShell>
  );
}
