"use client";

import { CalendarDays, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring" as const, stiffness: 320, damping: 34 } },
  exit: { x: "100%", transition: { duration: 0.22 } },
};

const navItemVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07 + 0.1, duration: 0.32 },
  }),
};

export default function Header({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
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
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Log out
                </button>
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

          {/* Mobile: hamburger / X */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Mobile full-screen drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[59] bg-black/40 backdrop-blur-sm md:hidden"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              className="fixed top-0 right-0 bottom-0 z-[60] w-[min(320px,100vw)] bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col md:hidden"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 font-semibold text-lg text-gray-900"
                >
                  <CalendarDays className="text-blue-600" size={22} />
                  Calendix
                </Link>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                {navLinks.map(({ href, label }, i) => (
                  <motion.div
                    key={href}
                    custom={i}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={clsx(
                        "flex items-center justify-between py-4 px-4 rounded-2xl text-lg font-medium transition-colors",
                        pathname === href
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {label}
                      <ArrowRight size={18} className="opacity-40" />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Auth actions */}
              <motion.div
                className="px-4 py-6 border-t border-gray-100 flex flex-col gap-3"
                custom={navLinks.length}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
              >
                {email ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="btn btn-primary justify-center text-base py-3"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-center text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <a href="/api/auth" className="btn btn-primary justify-center text-base py-3">
                      Get started
                    </a>
                    <a
                      href="/api/auth"
                      className="text-center text-sm text-gray-500 hover:text-gray-900 transition-colors py-2"
                    >
                      Sign in
                    </a>
                  </>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
