import Link from "next/link";
import { FadeIn, ScrollFadeIn, StaggerItem, StaggerList } from "@/app/components/ui/FadeIn";
import { Github, CalendarDays, Database, Shield, Zap, Code2 } from "lucide-react";

const stack = [
  {
    icon: Code2,
    name: "Next.js 14",
    description: "App Router with server components, route groups, and streaming",
  },
  {
    icon: CalendarDays,
    name: "Nylas API",
    description: "OAuth (Google & Microsoft), calendar read/write, Google Meet creation",
  },
  {
    icon: Database,
    name: "MongoDB + Mongoose",
    description: "Stores profiles, event types, and bookings with strict schemas",
  },
  {
    icon: Shield,
    name: "iron-session",
    description: "Encrypted cookie-based sessions — no JWT, no Redis needed",
  },
  {
    icon: Zap,
    name: "Tailwind CSS",
    description: "Utility-first styling with a custom design token layer",
  },
  {
    icon: Code2,
    name: "TypeScript",
    description: "End-to-end type safety across API routes, models, and components",
  },
];

const highlights = [
  {
    number: "3",
    label: "Route groups",
    detail: "(site), (booking), dashboard",
  },
  {
    number: "8",
    label: "API routes",
    detail: "auth, bookings, event types, profile, busy",
  },
  {
    number: "0",
    label: "Third-party UI libs",
    detail: "All components built from scratch",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 text-center">
        <FadeIn delay={0}>
          <span className="section-badge">Open source</span>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h1 className="section-title mt-4 max-w-2xl mx-auto">
            Scheduling, rebuilt from the ground up
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="section-subtitle mt-5 max-w-xl mx-auto">
            Calendix is an open-source scheduling platform built to demonstrate
            what a modern, production-quality booking app looks like — from OAuth
            flow to real-time calendar sync.
          </p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/dashboard" className="btn btn-primary">
              Try it free
            </Link>
            <a
              href="https://github.com/DenisPavlik/calendly"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline flex items-center gap-2"
            >
              <Github size={16} />
              View source
            </a>
          </div>
        </FadeIn>
      </section>

      {/* What it is */}
      <section className="py-16 border-t border-gray-100">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollFadeIn>
            <span className="section-badge">What is Calendix</span>
            <h2 className="section-title mt-4">
              Calendix — a fully working Calendly alternative
            </h2>
            <p className="text-gray-500 mt-5 leading-relaxed">
              Calendix lets anyone share a booking link, set their availability,
              and have meetings booked automatically — including a generated
              Google Meet room. No back-and-forth emails, no double-bookings.
            </p>
            <p className="text-gray-500 mt-4 leading-relaxed">
              The entire auth flow runs through Nylas, which proxies Google and
              Microsoft OAuth and gives the app access to the user&apos;s live
              calendar. Booking slots are calculated in real time against actual
              calendar events — not just a stored availability template.
            </p>
          </ScrollFadeIn>
          {/* Stats */}
          <StaggerList className="grid grid-cols-1 gap-4">
            {highlights.map(({ number, label, detail }) => (
              <StaggerItem key={label}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-6">
                  <span className="text-4xl font-bold text-blue-600 shrink-0">
                    {number}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{detail}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Tech stack */}
      <section className="-mx-8 px-8 py-24 bg-slate-50 border-t border-gray-100">
        <ScrollFadeIn className="text-center mb-14">
          <span className="section-badge">Tech stack</span>
          <h2 className="section-title mt-4">Built with modern tools</h2>
          <p className="section-subtitle mt-4 max-w-lg mx-auto">
            Every technology was chosen for a reason — not just because it was
            popular.
          </p>
        </ScrollFadeIn>
        <StaggerList className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stack.map(({ icon: Icon, name, description }) => (
            <StaggerItem key={name}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group h-full">
                <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Icon className="text-blue-600" size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      </section>

      {/* CTA banner */}
      <section className="py-24 border-t border-gray-100">
        <ScrollFadeIn>
          <div className="bg-blue-600 rounded-3xl px-8 py-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Want to see it in action?
            </h2>
            <p className="text-blue-100 mb-8 max-w-md mx-auto">
              Sign in with Google, set your username, and share your first booking
              link in under two minutes.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
              >
                Get started free
              </Link>
              <a
                href="https://github.com/DenisPavlik/calendly"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-400 transition-colors"
              >
                <Github size={16} />
                GitHub
              </a>
            </div>
          </div>
        </ScrollFadeIn>
      </section>
    </>
  );
}
