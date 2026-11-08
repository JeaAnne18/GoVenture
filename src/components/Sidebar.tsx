"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  CircleHelp,
  Compass,
  Home,
  Luggage,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

const main = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trips", label: "My Trips", icon: Luggage },
  { href: "/explore", label: "Explore Map", icon: Map },
  { href: "/saved", label: "Saved Places", icon: Bookmark },
  { href: "/shared", label: "Shared With Me", icon: Users },
];

const account = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: CircleHelp },
];

type NavLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  collapsed: boolean;
  onNavigate?: () => void;
};

function NavLink({ href, label, icon: Icon, collapsed, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl text-sm transition focus-visible:outline-2 focus-visible:outline-[#0F5E66] ${
        collapsed ? "justify-center" : "px-3"
      } ${active ? "bg-[#D9ECEE] font-medium text-[#0F5E66]" : "text-[#2B2D33] hover:bg-[#EEEAF8]"}`}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span className={collapsed ? "sr-only" : ""}>{label}</span>
    </Link>
  );
}

type ContentProps = { collapsed: boolean; header: ReactNode; onNavigate?: () => void };

function SidebarContent({ collapsed, header, onNavigate }: ContentProps) {
  return (
    <>
      {header}

      <Link
        href="/trips/new"
        onClick={onNavigate}
        title={collapsed ? "New Trip" : undefined}
        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0F5E66] text-sm font-medium text-white transition hover:bg-[#0F5E66]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5E66]"
      >
        <Plus className="size-4 shrink-0" aria-hidden />
        <span className={collapsed ? "sr-only" : ""}>New Trip</span>
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {main.map((l) => (
          <NavLink key={l.href} {...l} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>

      <nav aria-label="Account" className="mt-auto flex flex-col gap-1 border-t border-[#EEEAF8] pt-4">
        {account.map((l) => (
          <NavLink key={l.href} {...l} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  );
}

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: Props) {
  const logo = (
    <Link href="/" aria-label="GoVenture home" className="flex items-center gap-2 text-2xl font-semibold text-[#0F5E66]">
      <Compass className="size-6 shrink-0 text-[#F28C38]" aria-hidden />
      {!collapsed && "GoVenture"}
    </Link>
  );

  return (
    <>
      {/* Desktop: collapses to an icon-only rail */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-6 overflow-y-auto bg-white py-6 transition-[width] duration-200 md:flex ${
          collapsed ? "w-[76px] px-3" : "w-64 px-5"
        }`}
      >
        <SidebarContent
          collapsed={collapsed}
          header={
            <div className={`flex items-center ${collapsed ? "flex-col gap-3" : "justify-between px-2"}`}>
              {logo}
              <button
                type="button"
                onClick={onToggle}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                className="grid size-11 place-items-center rounded-xl text-[#5F6370] hover:bg-[#EEEAF8] focus-visible:outline-2 focus-visible:outline-[#0F5E66]"
              >
                {collapsed ? <PanelLeftOpen className="size-5" aria-hidden /> : <PanelLeftClose className="size-5" aria-hidden />}
              </button>
            </div>
          }
        />
      </aside>

      {/* Mobile: slides over the page from the menu button */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" aria-label="Close menu" onClick={onCloseMobile} className="absolute inset-0 bg-[#2B2D33]/40" />
          <aside className="relative flex h-full w-64 flex-col gap-6 overflow-y-auto bg-white px-5 py-6">
            <SidebarContent
              collapsed={false}
              onNavigate={onCloseMobile}
              header={
                <div className="flex items-center justify-between px-2">
                  <Link href="/" onClick={onCloseMobile} className="flex items-center gap-2 text-2xl font-semibold text-[#0F5E66]">
                    <Compass className="size-6 text-[#F28C38]" aria-hidden />
                    GoVenture
                  </Link>
                  <button type="button" onClick={onCloseMobile} aria-label="Close menu" className="grid size-11 place-items-center rounded-xl hover:bg-[#EEEAF8]">
                    <X className="size-5" aria-hidden />
                  </button>
                </div>
              }
            />
          </aside>
        </div>
      )}
    </>
  );
}