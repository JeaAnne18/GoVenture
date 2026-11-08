"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#EEEAF8] text-[#2B2D33]">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {/* No narrow max-width: the dashboard stretches with the screen, up to ultrawide sizes. */}
        <div className="mx-auto w-full max-w-[1800px] space-y-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="grid size-11 place-items-center rounded-xl bg-white shadow-sm md:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          {children}
        </div>
      </main>
    </div>
  );
}