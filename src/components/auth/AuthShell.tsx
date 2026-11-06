import Link from "next/link";
import { Compass } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import AuthErrorToast from "./AuthErrorToast";

type Props = {
  active?: "sign-in" | "sign-up";
  children: ReactNode;
};

const tabBase = "flex min-h-11 flex-1 items-center justify-center rounded-full text-sm font-medium transition";

export default function AuthShell({ active, children }: Props) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <Suspense>
        <AuthErrorToast />
      </Suspense>
      <div className="hidden flex-col justify-between bg-[#0F5E66] p-14 text-white md:flex">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <Compass className="size-6 text-[#F28C38]" aria-hidden />
          GoVenture
        </div>
        <div>
          <h2 className="max-w-md text-5xl font-semibold leading-[1.1] tracking-tight">
            Plan together. Explore freely. Travel organized.
          </h2>
          <p className="mt-4 max-w-sm text-base text-white/80">
            Save places on the map, build your itinerary day by day, and share it with the people you’re traveling with.
          </p>
        </div>
        <div aria-hidden className="size-28 -rotate-6 rounded-full border-2 border-dashed border-[#F28C38] p-1.5">
          <div className="grid size-full place-items-center rounded-full bg-[#F28C38] text-center text-sm font-semibold leading-tight text-[#2B2D33]">
            Your next<br />trip
          </div>
        </div>
      </div>

      <div className="grid place-items-center bg-[#EEEAF8] p-6 sm:p-8">
        <section className="w-full max-w-[400px] rounded-[28px] bg-white p-8 shadow-[0_8px_24px_-12px_rgba(15,94,102,0.18)]">
          {active && (
          <nav aria-label="Account" className="flex rounded-full bg-[#EEEAF8] p-1">
            <Link
              href="/sign-in"
              aria-current={active === "sign-in" ? "page" : undefined}
              className={`${tabBase} ${active === "sign-in" ? "bg-white text-[#0F5E66]" : "text-[#5F6370]"}`}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              aria-current={active === "sign-up" ? "page" : undefined}
              className={`${tabBase} ${active === "sign-up" ? "bg-white text-[#0F5E66]" : "text-[#5F6370]"}`}
            >
              Create account
            </Link>
          </nav>
          )}
          {children}
        </section>
      </div>
    </div>
  );
}