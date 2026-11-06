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
  { href: "/admin/agenda", label: "Agenda del día", icon: CalendarDays },
  { href: "/admin/reservar", label: "Nueva reserva manual", icon: CalendarPlus },
  { href: "/admin/servicios", label: "Servicios", icon: Scissors },
  { href: "/admin/horarios", label: "Equipo y horarios", icon: Clock },
  { href: "/admin/ajustes", label: "Ajustes del local", icon: Settings },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const settings = await getSettings();

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 lg:flex antialiased">
      <aside className="border-b border-zinc-200 bg-white lg:min-h-dvh lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-6 py-5 lg:flex-col lg:items-start lg:gap-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Panel Administrativo
            </p>
            <p className="text-base font-black tracking-tight text-zinc-950 uppercase">
              {settings.businessName}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 lg:mt-3"
          >
            <ExternalLink className="size-3.5" />
            <span>Ver sitio público</span>
          </Link>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3 lg:flex-col lg:overflow-visible lg:px-4 lg:pb-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
              >
                <Icon className="size-4 text-zinc-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-zinc-100 px-6 py-4 lg:block">
          <p className="truncate text-xs text-zinc-400">{user.email}</p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-red-600"
            >
              <LogOut className="size-3.5" />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-6 py-6 sm:px-10 sm:py-8">
        <div className="mb-5 flex justify-end lg:hidden">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700"
            >
              <LogOut className="size-3.5" />
              <span>Salir</span>
            </button>
          </form>
        </div>
        {children}
      </main>
    </div>
  );
}
