"use client";

import { CalendarDays, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export default function Header({ email }: { email?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/60">
      <div className="flex items-center justify-between py-4">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg text-gray-900 hover:opacity-75 transition-opacity"
        >
          <CalendarDays className="text-blue-600" size={22} />
          Calendix
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "hover:text-gray-900 transition-colors",
                pathname === href && "text-gray-900 font-medium"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {email ? (
            <>
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
              <a
                href="/api/logout"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Log out
              </a>
            </>
          ) : (
            <>
              <a
                href="/api/auth"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign in
              </a>
              <a href="/api/auth" className="btn btn-primary">
                Get started
              </a>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 py-5 flex flex-col gap-4 px-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                "text-sm transition-colors",
                pathname === href
                  ? "text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              {label}
            </Link>
          ))}

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
            {email ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary justify-center"
                >
                  Dashboard
                </Link>
                <a
                  href="/api/logout"
                  className="text-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Log out
                </a>
              </>
            ) : (
              <>
                <a href="/api/auth" className="btn btn-primary justify-center">
                  Get started
                </a>
                <a
                  href="/api/auth"
                  className="text-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
