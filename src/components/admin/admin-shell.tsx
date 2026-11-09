"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Minimize2,
  Menu,
  Scissors,
  Settings,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";

import { logoutAction } from "@/app/admin/actions";

export type PendingNotification = {
  id: string;
  clientName: string;
  clientPhone: string;
  startAt: string;
  serviceName: string;
  staffName: string;
  staffColor: string;
};

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

function formatShortTime(iso: string): string {
  const date = new Date(iso);
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${d}/${mo} ${h}:${m} hs`;
}

export function AdminShell({
  businessName,
  userEmail,
  userName,
  pendingCount = 0,
  pendingItems = [],
  children,
}: {
  businessName: string;
  userEmail: string;
  userName: string;
  pendingCount?: number;
  pendingItems?: PendingNotification[];
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menus on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  // Click outside to close menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

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
        <div className="flex items-center gap-2 sm:gap-2.5">
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

          {/* Fullscreen toggle button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex size-8 items-center justify-center rounded border border-zinc-700 bg-[#2b2f38] text-zinc-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </button>

          {/* Pending Notification Bell Dropdown */}
          <div className="relative" ref={notifMenuRef}>
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setUserMenuOpen(false);
              }}
              className="relative inline-flex size-8 items-center justify-center rounded border border-zinc-700 bg-[#2b2f38] text-zinc-300 transition hover:bg-zinc-700 hover:text-white cursor-pointer"
              title={`${pendingCount} turnos pendientes por confirmar`}
              aria-expanded={notificationsOpen}
            >
              <Bell className="size-3.5" />
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-zinc-950 animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-10 z-50 w-72 sm:w-80 rounded-md border border-zinc-200 bg-white shadow-xl text-zinc-800 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/75 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <Bell className="size-3.5 text-zinc-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                      Notificaciones
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {pendingCount} pendientes
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 text-xs">
                  {pendingItems.length === 0 ? (
                    <div className="p-6 text-center text-zinc-500">
                      <CheckCircle2 className="mx-auto size-6 text-emerald-500 mb-1" />
                      <p className="font-semibold text-zinc-800">¡Todo al día!</p>
                      <p className="text-[11px]">No hay solicitudes de citas pendientes por confirmar.</p>
                    </div>
                  ) : (
                    pendingItems.map((item) => (
                      <Link
                        key={item.id}
                        href="/admin"
                        onClick={() => setNotificationsOpen(false)}
                        className="block p-3 transition hover:bg-zinc-50/80"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-zinc-950 truncate">
                            {item.clientName}
                          </p>
                          <span className="shrink-0 text-[10px] text-zinc-400 font-mono">
                            {formatShortTime(item.startAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-zinc-600 truncate">
                          {item.serviceName}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-500">
                          <span
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: item.staffColor }}
                          />
                          <span>{item.staffName}</span>
                          <span className="text-zinc-300">·</span>
                          <span>{item.clientPhone}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>

                <div className="border-t border-zinc-100 bg-zinc-50/50 p-2 text-center">
                  <Link
                    href="/admin"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:underline"
                  >
                    Ver todas las citas en Dashboard &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown Menu (Metis / Bootstrap Style) */}
          <div className="relative border-l border-zinc-700/80 pl-2.5 sm:pl-3" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen((prev) => !prev);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 rounded p-1 transition hover:bg-zinc-800 cursor-pointer text-left"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="flex size-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-white shadow-xs ring-1 ring-zinc-600">
                {userEmail.slice(0, 1).toUpperCase()}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-xs font-medium text-zinc-200 max-w-[120px] truncate leading-tight">
                  {userName || "Administrador"}
                </p>
                <p className="text-[10px] text-zinc-400 max-w-[120px] truncate leading-tight">
                  En línea
                </p>
              </div>
              <ChevronDown className="size-3 text-zinc-400 hidden sm:block" />
            </button>

            {/* Dropdown Card */}
            {userMenuOpen && (
              <div className="absolute right-0 top-10 z-50 w-56 rounded-md border border-zinc-200 bg-white py-1.5 shadow-lg text-zinc-800 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="border-b border-zinc-100 px-3.5 py-2">
                  <p className="text-xs font-bold text-zinc-950 truncate">
                    {userName || "Administrador"}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {userEmail}
                  </p>
                  <span className="mt-1 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600">
                    Rol: Propietario / Admin
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/admin/ajustes"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    <Settings className="size-3.5 text-zinc-400" />
                    <span>Ajustes del local</span>
                  </Link>
                  <Link
                    href="/admin/horarios"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    <Clock className="size-3.5 text-zinc-400" />
                    <span>Equipo y horarios</span>
                  </Link>
                  <Link
                    href="/admin/servicios"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    <Scissors className="size-3.5 text-zinc-400" />
                    <span>Catálogo de servicios</span>
                  </Link>
                </div>

                <div className="border-t border-zinc-100 pt-1">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 px-3.5 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="size-3.5 text-red-500" />
                      <span>Cerrar sesión</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
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
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>

      {/* 4. MOBILE BOTTOM QUICK NAVIGATION BAR (UX Boost for Salon Operation) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex h-14 items-center justify-around border-t border-zinc-800 bg-[#1f2228] px-2 text-zinc-400 lg:hidden shadow-2xl">
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            pathname === "/admin" ? "text-white font-bold" : "hover:text-zinc-200"
          }`}
        >
          <LayoutDashboard className="size-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/admin/agenda"
          className={`relative flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            pathname.startsWith("/admin/agenda") ? "text-white font-bold" : "hover:text-zinc-200"
          }`}
        >
          <CalendarDays className="size-4" />
          <span>Agenda</span>
          {pendingCount > 0 && (
            <span className="absolute -top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-zinc-950">
              {pendingCount}
            </span>
          )}
        </Link>

        {/* Center + Cita Button */}
        <Link
          href="/admin/reservar"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            pathname.startsWith("/admin/reservar") ? "text-white font-bold" : "hover:text-zinc-200"
          }`}
          title="Cargar cita manual"
        >
          <CalendarPlus className="size-4" />
          <span>+ Cita</span>
        </Link>

        <Link
          href="/admin/servicios"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition ${
            pathname.startsWith("/admin/servicios") ? "text-white font-bold" : "hover:text-zinc-200"
          }`}
        >
          <Scissors className="size-4" />
          <span>Servicios</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileDrawerOpen((prev) => !prev)}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-white cursor-pointer"
        >
          <Menu className="size-4" />
          <span>Más</span>
        </button>
      </nav>

      {/* 5. METIS FOOTER (#footer) */}
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
