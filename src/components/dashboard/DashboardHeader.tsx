import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";

export default function DashboardHeader({ name }: { name: string }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold">Hi, {name}</h1>
        <p className="mt-1 text-sm text-[#5F6370]">Here’s what’s coming up.</p>
      </div>
      <div className="flex items-center gap-3">
        <NotificationsMenu />
        <ProfileMenu name={name} />
      </div>
    </header>
  );
}