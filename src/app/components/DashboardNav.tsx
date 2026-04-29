"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { CalendarDays, CalendarCheck2, User, LogOut } from "lucide-react";

const allNavItems = [
  { href: "/dashboard", label: "Profile", icon: User, exact: true },
  { href: "/dashboard/event-types", label: "Event Types", icon: CalendarDays },
  { href: "/dashboard/booked-events", label: "Booked Events", icon: CalendarCheck2 },
];

export default function DashboardNav({ username }: { username?: string }) {
  const pathname = usePathname();
  const items = username ? allNavItems : allNavItems.slice(0, 1);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-gray-100 bg-white z-40">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
            Calendly
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {items.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive(href, exact)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <Link
            href="/api/logout"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </Link>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 z-40 flex items-center justify-around">
        {items.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-xs font-medium transition-colors",
              isActive(href, exact) ? "text-blue-600" : "text-gray-500"
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
        <Link
          href="/api/logout"
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-xs font-medium text-gray-500"
        >
          <LogOut size={20} />
          Log out
        </Link>
      </nav>
    </>
  );
}
