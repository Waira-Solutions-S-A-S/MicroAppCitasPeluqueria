"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  Clock,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  User as UserIcon,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/admin/actions";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

export function AdminShell({
  businessName,
  userEmail,
  userName,
  pendingCount = 0,
  children,
}: {
  businessName: string;
  userEmail: string;
  userName: string;
  pendingCount?: number;
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      title: "Navegación Principal",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/admin/agenda",
          label: "Agenda del día",
          icon: CalendarDays,
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
      ],
    },
    {
      title: "Gestión de Citas",
      items: [
        { href: "/admin/reservar", label: "Cargar cita manual", icon: CalendarPlus },
        { href: "/admin/servicios", label: "Servicios y tarifas", icon: Scissors },
        { href: "/admin/horarios", label: "Equipo y horarios", icon: Clock },
      ],
    },
    {
      title: "Configuración",
      items: [
        { href: "/admin/ajustes", label: "Ajustes del local", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-zinc-900 font-sans flex flex-col antialiased">
      {/* 1. TOP NAVBAR (Metis Bootstrap Admin Topbar - #top) */}
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-zinc-800 bg-[#1f2228] px-3 sm:px-5 text-white shadow-sm">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          {/* Hamburger toggle button (toggles mobile drawer on small screens, collapse on desktop) */}
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileDrawerOpen((prev) => !prev);
              } else {
                setSidebarCollapsed((prev) => !prev);
              }
            }}
            className="inline-flex size-9 items-center justify-center rounded bg-[#2b2f38] text-zinc-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
            aria-label="Alternar menú lateral"
            title="Alternar menú lateral"
          >
            <Menu className="size-4" />
          </button>

          {/* Brand Logo & Name */}
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <span className="flex size-7 items-center justify-center rounded bg-zinc-800 font-mono text-xs font-bold text-white ring-1 ring-zinc-700">
              ST
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white transition group-hover:text-zinc-200">
                {businessName}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Tools (Metis top nav right) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Public site link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded border border-zinc-700 bg-[#2b2f38] px-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
            title="Abrir página pública de reserva en nueva pestaña"
          >
            <ExternalLink className="size-3.5 text-zinc-400" />
            <span className="hidden md:inline">Sitio Web</span>
          </Link>

          {/* Pending Notification Bell */}
          <Link
            href="/admin"
            className="relative inline-flex size-8 items-center justify-center rounded border border-zinc-700 bg-[#2b2f38] text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
            title={`${pendingCount} turnos pendientes por confirmar`}
          >
            <Bell className="size-3.5" />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 animate-pulse">
                {pendingCount}
              </span>
            )}
          </Link>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 border-l border-zinc-700/80 pl-2.5 sm:pl-3">
            <div className="flex size-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white shadow-xs ring-1 ring-zinc-600">
              {userEmail.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-medium text-zinc-200 max-w-[130px] truncate leading-tight">
                {userName || "Administrador"}
              </p>
              <p className="text-[10px] text-zinc-400 max-w-[130px] truncate leading-tight">
                {userEmail}
              </p>
            </div>

            <form action={logoutAction} className="ml-1">
              <button
                type="submit"
                className="inline-flex size-8 items-center justify-center rounded text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE (Sidebar + Content Container) */}
      <div className="flex flex-1 relative">
        {/* Mobile Backdrop Overlay */}
        {mobileDrawerOpen && (
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Metis Dark Sidebar (#left) */}
        <aside
          className={`
            fixed inset-y-14 left-0 z-40 flex flex-col bg-[#22252c] border-r border-zinc-800 text-zinc-300 transition-all duration-200 ease-in-out
            lg:static lg:inset-y-auto lg:min-h-[calc(100vh-56px-48px)]
            ${mobileDrawerOpen ? "translate-x-0 shadow-2xl w-64" : "-translate-x-full lg:translate-x-0"}
            ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"}
          `}
        >
          {/* Metis User Box (.user-media) */}
          {!sidebarCollapsed && (
            <div className="border-b border-zinc-800/80 bg-[#1c1e24] p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-zinc-800 text-white ring-2 ring-zinc-700 shadow-xs">
                  <UserIcon className="size-5 text-zinc-300" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">
                    {userName || "Administrador"}
                  </p>
                  <p className="text-[11px] text-zinc-400">Atelier Studio</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                      En línea
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links (#menu) */}
          <nav className="flex-1 space-y-4 px-2 py-3 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title}>
                {!sidebarCollapsed && (
                  <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
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
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`flex min-h-[38px] items-center justify-between rounded px-3 py-2 text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-[#181a1f] font-semibold text-white border-l-4 border-zinc-100"
                            : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                        } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`size-4 shrink-0 ${
                              isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                            }`}
                          />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && item.badge !== undefined && (
                          <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-zinc-950">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Link */}
          {!sidebarCollapsed && (
            <div className="border-t border-zinc-800/80 p-3 text-center">
              <span className="text-[10px] text-zinc-500 font-mono">
                v2.4 · Metis Admin Panel
              </span>
            </div>
          )}
        </aside>

        {/* 3. CONTENT CANVAS (#content / .outer / .inner) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* 4. METIS FOOTER (#footer) */}
      <footer className="border-t border-zinc-200 bg-white py-3 px-6 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          2026 &copy; <strong className="text-zinc-800">{businessName}</strong> · Sistema de Gestión de Citas & Agenda
        </p>
        <p className="text-[11px] text-zinc-400">
          Plantilla adaptada de <a href="https://preview.colorlib.com/theme/metis/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-700">Metis Bootstrap Admin Template</a>
        </p>
      </footer>
    </div>
  );
}
