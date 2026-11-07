"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  LayoutDashboard,
  Scissors,
  Settings,
} from "lucide-react";

type NavGroup = {
  title: string;
  items: {
    href: string;
    label: string;
    icon: typeof LayoutDashboard;
  }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Navegación Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/agenda", label: "Agenda del día", icon: CalendarDays },
    ],
  },
  {
    title: "Gestión de Citas",
    items: [
      { href: "/admin/reservar", label: "Cargar cita manual", icon: CalendarPlus },
      { href: "/admin/servicios", label: "Servicios y precios", icon: Scissors },
      { href: "/admin/horarios", label: "Equipo y horarios", icon: Clock },
    ],
  },
  {
    title: "Administración",
    items: [
      { href: "/admin/ajustes", label: "Ajustes del local", icon: Settings },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-5 px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[40px] items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-800/90 font-semibold text-white shadow-xs border-l-2 border-white"
                      : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`size-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
