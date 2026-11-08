"use client";

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { notifications } from "@/lib/mock-data";
import { useDismiss } from "@/lib/use-dismiss";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(open, ref, () => setOpen(false));

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications, ${unread} unread`}
        aria-expanded={open}
        className="relative grid size-11 place-items-center rounded-full bg-white shadow-[0_4px_12px_-6px_rgba(15,94,102,0.3)] focus-visible:outline-2 focus-visible:outline-[#0F5E66]"
      >
        <Bell className="size-5 text-[#0F5E66]" aria-hidden />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[18px] place-items-center rounded-full border-2 border-[#EEEAF8] bg-[#F28C38] px-1 text-[11px] font-semibold leading-4 text-[#2B2D33]">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-20 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[22px] bg-white shadow-[0_20px_48px_-16px_rgba(43,45,51,0.35)]"
        >
          <div className="flex items-center justify-between px-5 py-3">
            <h2 className="text-base font-semibold">Notifications</h2>
            <button type="button" className="min-h-11 text-[13px] font-medium text-[#0F5E66]">
              Mark all as read
            </button>
          </div>
          <ul className="text-[13px] leading-snug">
            {notifications.map((n) => (
              <li key={n.id} className={`flex gap-3 px-5 py-3 ${n.unread ? "bg-[#F6F4FC]" : ""}`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FDE8D3] font-semibold">
                  {n.initials}
                </span>
                <div className="flex-1">
                  <b className="font-semibold">{n.who}</b> {n.text}
                  <div className="mt-0.5 text-[#5F6370]">{n.time}</div>
                </div>
                {n.unread && <span aria-label="Unread" className="mt-1.5 size-2 rounded-full bg-[#F28C38]" />}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-[#EEEAF8] px-5">
            <button type="button" className="min-h-11 text-[13px] font-medium text-[#0F5E66]">
              View all
            </button>
            <button type="button" className="min-h-11 text-[13px] font-medium text-[#0F5E66]">
              Notification settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}