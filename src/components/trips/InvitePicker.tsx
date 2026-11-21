"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type InviteUser = { id: string; email:string; name: string; username: string | null };

type Props = {
  value: InviteUser[];
  onChange: (users: InviteUser[]) => void;
  dropUp?: boolean; // open the suggestions above the field (useful at the bottom of a dialog)
};

export default function InvitePicker({ value, onChange, dropUp = false }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<InviteUser[]>([]);
  const [searchedFor, setSearchedFor] = useState<string | null>(null); // which text the results belong to
  const [open, setOpen] = useState(false);

  // Look for GoVenture users 300 ms after she stops typing.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { users: InviteUser[] };
        setResults(data.users);
        setSearchedFor(q);
        setOpen(true);
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setResults([]);
          setSearchedFor(q);
        }
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const q = query.trim();
  const fresh = q.length >= 2 && searchedFor === q;
  const visible = fresh ? results.filter((u) => !value.some((v) => v.id === u.id)) : [];
  const noMatch = fresh && results.length === 0;

  function add(user: InviteUser) {
    onChange([...value, user]);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        role="combobox"
        aria-expanded={open && (visible.length > 0 || noMatch)}
        aria-controls="invite-suggestions"
        aria-label="Search by username or email"
        placeholder="Search by username or email"
        className="min-h-12 w-full rounded-[14px] border border-[#D9D6E6] px-3.5 text-[15px] text-[#2B2D33] outline-none focus:border-[#0F5E66]"
      />

      {open && (visible.length > 0 || noMatch) && (
        <ul
          id="invite-suggestions"
          role="listbox"
          className={`absolute inset-x-0 z-20 max-h-64 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[0_20px_48px_-16px_rgba(43,45,51,0.35)] ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {visible.map((u) => (
            <li key={u.id} role="option" aria-selected={false}>
              <button type="button" onClick={() => add(u)} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-[#EEEAF8]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#FDE8D3] text-xs font-semibold text-[#2B2D33]">
                  {(u.username ?? u.name).charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 text-sm">
                  <span className="block truncate font-medium">{u.username ? `@${u.username}` : u.name}</span>
                  {u.email && <span className="block truncate text-xs text-[#5F6370]">{u.email}</span>}
                </span>
              </button>
            </li>
          ))}
          {noMatch && (
            <li className="px-3 py-3 text-[13px] text-[#5F6370]">
              No one found. They need a GoVenture account before you can invite them.
            </li>
          )}
        </ul>
      )}

      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((u) => (
            <li key={u.id} className="flex items-center gap-1 rounded-full bg-[#D9ECEE] py-1 pl-3 pr-1 text-sm text-[#0F5E66]">
              {u.username ? `@${u.username}` : u.name}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v.id !== u.id))}
                aria-label={`Remove ${u.username ?? u.name}`}
                className="grid size-7 place-items-center rounded-full hover:bg-white/60"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}