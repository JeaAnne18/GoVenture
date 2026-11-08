"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, List, Plus } from "lucide-react";
import { notes } from "@/lib/mock-data";
import { card } from "./styles";

export default function NotesWidget() {
  const [index, setIndex] = useState(0);
  const note = notes[index];

  // Wraps around: after the last note comes the first one.
  const go = (step: number) => setIndex((i) => (i + step + notes.length) % notes.length);

  return (
    <section className={`${card} flex flex-col`}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Notes</h2>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="See all notes as a list" className="grid size-11 place-items-center rounded-xl hover:bg-[#EEEAF8]">
            <List className="size-[18px] text-[#0F5E66]" aria-hidden />
          </button>
          <button type="button" aria-label="See all notes as cards" className="grid size-11 place-items-center rounded-xl hover:bg-[#EEEAF8]">
            <LayoutGrid className="size-[18px] text-[#0F5E66]" aria-hidden />
          </button>
          <button type="button" aria-label="New note" className="grid size-11 place-items-center rounded-full bg-[#0F5E66] text-white hover:bg-[#0F5E66]/90">
            <Plus className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <article aria-live="polite" className="mt-2 flex-1 rounded-[20px] bg-[#F6F4FC] px-[18px] py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">{note.title}</h3>
          <span className="rounded-full bg-[#D9ECEE] px-2.5 py-0.5 text-xs font-medium text-[#0F5E66]">{note.tag}</span>
        </div>
        <ul className="mt-2.5 list-disc space-y-0.5 pl-[18px] text-sm leading-normal">
          {note.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </article>

      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={() => go(-1)} aria-label="Previous note" className="grid size-11 place-items-center rounded-full border border-[#D9D6E6] bg-white hover:bg-[#F6F4FC]">
          <ChevronLeft className="size-[18px]" aria-hidden />
        </button>
        <div className="text-center text-[13px] text-[#5F6370]">
          <div className="mb-1 flex justify-center gap-1.5" aria-hidden>
            {notes.map((n, i) => (
              <span key={n.id} className={i === index ? "h-1.5 w-[18px] rounded-full bg-[#0F5E66]" : "size-1.5 rounded-full bg-[#D9D6E6]"} />
            ))}
          </div>
          Note {index + 1} of {notes.length}
        </div>
        <button type="button" onClick={() => go(1)} aria-label="Next note" className="grid size-11 place-items-center rounded-full border border-[#D9D6E6] bg-white hover:bg-[#F6F4FC]">
          <ChevronRight className="size-[18px]" aria-hidden />
        </button>
      </div>
    </section>
  );
}