"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { motion, LayoutGroup } from "framer-motion";
import { CalendarDays, CalendarCheck2, User, LogOut, Globe } from "lucide-react";

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
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 tracking-tight">
            <CalendarDays size={22} />
            Calendix
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <LayoutGroup id="desktop-nav">
            {items.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    active ? "text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="desktop-nav-active"
                      className="absolute inset-0 bg-blue-50 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <Icon size={18} />
                    {label}
                  </span>
                </Link>
              );
            })}
          </LayoutGroup>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Globe size={18} />
            Go to site
          </Link>
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-white/20 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-40 flex items-center justify-around" style={{ paddingBottom: "max(0rem, env(safe-area-inset-bottom))" }}>
        <LayoutGroup id="mobile-nav">
          {items.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-xs font-medium transition-colors",
                  active ? "text-blue-600" : "text-gray-500"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-blue-50 rounded-xl"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-1">
                  <Icon size={20} />
                  {label}
                </span>
              </Link>
            );
          })}
        </LayoutGroup>
        <Link
          href="/"
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-xs font-medium text-gray-500"
        >
          <Globe size={20} />
          Site
        </Link>
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
