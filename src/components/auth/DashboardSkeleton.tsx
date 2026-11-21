// Grey placeholder version of the Home dashboard. It sits behind the username modal, blurred.
const bar = "rounded-[10px] bg-[#E1DCF0]";
const card = "rounded-[28px] bg-white p-6";

export default function DashboardSkeleton() {
  return (
    <div aria-hidden className="pointer-events-none flex min-h-screen select-none bg-[#EEEAF8] blur-[7px]">
      <aside className="hidden w-64 shrink-0 flex-col gap-3.5 bg-white px-5 py-6 md:flex">
        <div className={`${bar} h-7 w-36`} />
        <div className="mt-2 h-12 rounded-2xl bg-[#BCD6D9]" />
        <div className="mt-2 h-10 rounded-[10px] bg-[#D3E7E9]" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${bar} h-10`} />
        ))}
      </aside>

      <main className="flex flex-1 flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <div className={`${bar} h-6 w-44`} />
            <div className={`${bar} mt-2.5 h-3.5 w-32`} />
          </div>
          <div className="flex gap-3">
            <div className="size-11 rounded-full bg-white" />
            <div className="h-11 w-24 rounded-full bg-white" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="h-64 rounded-[28px] bg-[#B5D2D6]" />
          <div className={`${card} h-64`}>
            <div className={`${bar} h-[18px] w-20`} />
            <div className={`${bar} mt-5 h-36 rounded-[20px]`} />
          </div>
        </div>

        <div className={`${card} h-36`}>
          <div className={`${bar} h-[18px] w-28`} />
          <div className={`${bar} mt-6 h-10 w-3/5`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className={`${card} h-72`}>
            <div className={`${bar} h-[18px] w-40`} />
            <div className="mt-5 flex gap-5">
              <div className="w-28 space-y-5">
                <div className={`${bar} h-10`} />
                <div className={`${bar} h-10`} />
                <div className={`${bar} h-10`} />
              </div>
              <div className="h-44 flex-1 rounded-[20px] bg-[#D3E7E9]" />
            </div>
          </div>
          <div className={`${card} h-72`}>
            <div className={`${bar} h-[18px] w-32`} />
            {[0, 1, 2].map((i) => (
              <div key={i} className={`${bar} mt-3 h-12 first:mt-5`} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}