import Companies from "../components/Companies";
import Hero from "../components/Hero";
import {
  CalendarDays,
  UserCircle,
  Link2,
  Video,
  Shield,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: UserCircle,
    title: "Sign in & set username",
    description:
      "Sign in with Google or Microsoft. Pick a unique username — it becomes your personal booking URL on Calendix.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Create event types",
    description:
      "Define meeting names, durations, and your available days and times. Create as many event types as you need.",
  },
  {
    number: "03",
    icon: Link2,
    title: "Share & get booked",
    description:
      "Send calendix.app/you/meeting to anyone. They pick a slot, a Google Meet is created automatically.",
  },
];

const features = [
  {
    icon: UserCircle,
    title: "Google & Microsoft sign-in",
    description:
      "OAuth via Nylas — sign in with your existing account. No passwords to manage.",
  },
  {
    icon: CalendarDays,
    title: "Flexible availability",
    description:
      "Set available hours per day of the week. Different schedules for different event types.",
  },
  {
    icon: Video,
    title: "Auto Google Meet",
    description:
      "Every confirmed booking automatically generates a Google Meet link for both parties.",
  },
  {
    icon: Link2,
    title: "Shareable booking page",
    description:
      "Each event type gets a clean public URL at calendix.app/username/event.",
  },
  {
    icon: Shield,
    title: "No double-bookings",
    description:
      "Calendix checks your real calendar and only shows genuinely free slots to guests.",
  },
  {
    icon: CheckCircle2,
    title: "Booked events dashboard",
    description:
      "See every upcoming meeting in one place — guest name, email, notes, and time.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* Social proof */}
      <Companies />

      {/* How it works — lifecycle diagram */}
      <section className="-mx-8 px-8 py-24 bg-slate-50">
        <div className="text-center mb-16">
          <span className="section-badge">How it works</span>
          <h2 className="section-title mt-4">Up and running in minutes</h2>
          <p className="section-subtitle mt-4 max-w-lg mx-auto">
            Three steps from zero to fully automated scheduling.
          </p>
        </div>

        {/* Desktop: horizontal flow with arrows */}
        <div className="hidden md:grid grid-cols-[1fr_40px_1fr_40px_1fr] gap-x-2">
          {steps.flatMap(({ number, icon: Icon, title, description }, i) => {
            const card = (
              <div
                key={number}
                className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 flex flex-col"
              >
                {/* Numbered circle */}
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-5 ring-4 ring-blue-50">
                  {number}
                </div>
                {/* Icon */}
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                  <Icon className="text-blue-600" size={22} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-3 text-base">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            );

            if (i < steps.length - 1) {
              return [
                card,
                <div
                  key={`arrow-${i}`}
                  className="flex items-center justify-center"
                >
                  <ArrowRight className="text-blue-300" size={22} />
                </div>,
              ];
            }
            return [card];
          })}
        </div>

        {/* Mobile: vertical stack with connector */}
        <div className="md:hidden flex flex-col">
          {steps.map(({ number, icon: Icon, title, description }, i) => (
            <div key={number} className="flex gap-5">
              {/* Left: line + circle */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-4 ring-blue-50 z-10">
                  {number}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-blue-200 my-2" />
                )}
              </div>
              {/* Right: content */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 mb-4 flex-1">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 border-t border-gray-100">
        <div className="text-center mb-14">
          <span className="section-badge">Features</span>
          <h2 className="section-title mt-4">
            Everything you need to get booked
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <Icon className="text-blue-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="pb-16 border-t border-gray-100 pt-24">
        <div className="bg-blue-600 rounded-3xl px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to simplify your scheduling?
          </h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">
            Sign in, set your username, and share your first booking link in
            under two minutes.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </section>
    </>
  );
}
