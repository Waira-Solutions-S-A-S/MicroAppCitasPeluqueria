import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
} from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/admin/reservar", label: "Nueva reserva", icon: CalendarPlus },
  { href: "/admin/servicios", label: "Servicios", icon: Scissors },
  { href: "/admin/horarios", label: "Equipo y horarios", icon: Clock },
  { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="border-b border-ink/10 bg-white lg:min-h-dvh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-5 lg:flex-col lg:items-start lg:gap-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Panel
            </p>
            <p className="text-lg font-semibold tracking-tight">{settings.businessName}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted transition hover:text-brand lg:mt-2"
          >
            <ExternalLink className="size-3.5" />
            Ver sitio
          </Link>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink/70 transition hover:bg-brand-soft/60 hover:text-brand"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-ink/10 px-5 py-4 lg:block">
          <p className="truncate text-xs text-muted">{user.email}</p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-red-600"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">
        <div className="mb-5 flex justify-end lg:hidden">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1.5 text-xs font-medium text-muted"
            >
              <LogOut className="size-3.5" />
              Salir
            </button>
          </form>
        </div>
        {children}
      </main>
    </div>
  );
}
