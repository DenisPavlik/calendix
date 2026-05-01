import { CalendarDays } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-8 bg-slate-50 border-t border-gray-200">
      <div className="py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-gray-900 mb-3 hover:opacity-75 transition-opacity"
          >
            <CalendarDays className="text-blue-600" size={20} />
            Calendix
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
            Simple, open-source scheduling. Share a link, get booked — it&apos;s
            that easy.
          </p>
        </div>

        {/* Product */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Product</p>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
            <li>
              <Link href="/features" className="hover:text-gray-900 transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-gray-900 transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-4">Resources</p>
          <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
            <li>
              <a
                href="https://github.com/DenisPavlik/calendly"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://nylas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                Nylas API
              </a>
            </li>
            <li>
              <Link href="/about" className="hover:text-gray-900 transition-colors">
                Documentation
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
        <span>© {new Date().getFullYear()} Calendix. Open-source scheduling platform.</span>
        <span>Built with Next.js &amp; Nylas</span>
      </div>
    </footer>
  );
}
