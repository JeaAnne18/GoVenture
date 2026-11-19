"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import NewTripDialog from "./NewTripDialog";

type NewTripContextValue = { openNewTrip: () => void };

const NewTripContext = createContext<NewTripContextValue | null>(null);

// Call this from any button in the app to open the New Trip dialog.
export function useNewTrip(): NewTripContextValue {
  const value = useContext(NewTripContext);
  if (!value) throw new Error("useNewTrip must be used inside <NewTripProvider>");
  return value;
}

// Wrap the app shell with this once. It owns the dialog, so the sidebar and the My Trips page can both open it.
export function NewTripProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openNewTrip = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openNewTrip }), [openNewTrip]);

  return (
    <NewTripContext.Provider value={value}>
      {children}
      <NewTripDialog open={open} onClose={() => setOpen(false)} />
    </NewTripContext.Provider>
  );
}