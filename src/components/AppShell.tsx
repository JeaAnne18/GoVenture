"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

type Props = {
  children: ReactNode;
  // bleed = no padding, so a page (like the map) can fill the whole area next to the sidebar
  bleed?: boolean;
};

export default function AppShell({ children, bleed = false }: Props) {
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
      <main className={bleed ? "relative min-w-0 flex-1" : "min-w-0 flex-1 p-4 sm:p-6 lg:p-8"}>
        <div className={bleed ? "" : "mx-auto w-full max-w-[1800px] space-y-6"}>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className={`grid size-11 place-items-center rounded-xl bg-white shadow-sm md:hidden ${
              bleed ? "absolute left-3 top-3 z-30" : ""
            }`}
          >
            <Menu className="size-5" aria-hidden />
          </button>
          {children}
        </div>
      </main>
    </div>
  );
}