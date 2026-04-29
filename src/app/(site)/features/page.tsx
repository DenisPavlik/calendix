import Companies from "@/app/components/Companies";
import {
  CalendarDays,
  UserCircle,
  Link2,
  Video,
  Shield,
  CheckCircle2,
  Clock,
  Mail,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: UserCircle,
    title: "Google & Microsoft sign-in",
    description:
      "OAuth via Nylas — sign in with your existing Google or Microsoft account in one click. No passwords, no extra accounts to manage.",
    highlight: "Zero friction onboarding",
  },
  {
    icon: CalendarDays,
    title: "Flexible availability",
    description:
      "Set your available hours per day of the week. Different schedules for different event types — office hours on Monday, deep-work blocks on Friday.",
    highlight: "Full schedule control",
  },
  {
    icon: Video,
    title: "Auto Google Meet links",
    description:
      "Every confirmed booking automatically generates a unique Google Meet link and adds it to both your calendar and the guest's confirmation.",
    highlight: "No manual setup needed",
  },
  {
    icon: Link2,
    title: "Clean shareable URLs",
    description:
      "Each event type gets a public URL at calendix.app/you/event. Drop it in your email signature, LinkedIn, or anywhere else.",
    highlight: "One link, always ready",
  },
  {
    icon: Shield,
    title: "Real-time conflict prevention",
    description:
      "Calendix queries your live calendar before showing any slot. Double-bookings are impossible — guests only see slots that are genuinely free.",
    highlight: "Live calendar sync",
  },
  {
    icon: CheckCircle2,
    title: "Booked events dashboard",
    description:
      "All upcoming meetings in one place — guest name, email, optional notes, and time. No more hunting through calendar apps.",
    highlight: "Clear meeting overview",
  },
  {
    icon: Clock,
    title: "Custom meeting durations",
    description:
      "Create 15-minute quick calls, 30-minute demos, 60-minute strategy sessions — or any length you need. Each event type has its own duration.",
    highlight: "Any length you need",
  },
  {
    icon: Mail,
    title: "Instant confirmation",
    description:
      "Guests receive an instant booking confirmation with all the details — time, meeting link, and any notes — so nothing falls through the cracks.",
    highlight: "Guests always informed",
  },
];

const comparisonRows = [
  { feature: "Calendar conflict detection", calendix: true, manual: false },
  { feature: "Auto-generated meeting links", calendix: true, manual: false },
  { feature: "Self-serve booking page", calendix: true, manual: false },
  { feature: "Multiple event types", calendix: true, manual: false },
  { feature: "Instant guest confirmation", calendix: true, manual: false },
  { feature: "No back-and-forth emails", calendix: true, manual: false },
  { feature: "Works 24/7", calendix: true, manual: false },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 text-center">
        <span className="section-badge">Features</span>
        <h1 className="section-title mt-4 max-w-2xl mx-auto">
          Everything you need to get booked
        </h1>
        <p className="section-subtitle mt-5 max-w-xl mx-auto">
          Calendix handles the entire scheduling loop — from sharing a link to
          generating a meeting room — so you can focus on the meeting itself.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link href="/dashboard" className="btn btn-primary">
            Get started free
          </Link>
          <Link href="/pricing" className="btn btn-outline">
            View pricing
          </Link>
        </div>
      </section>

      {/* Social proof */}
      <Companies />

      {/* Feature cards */}
      <section className="py-24 border-t border-gray-100">
        <div className="text-center mb-14">
          <span className="section-badge">What you get</span>
          <h2 className="section-title mt-4">Built for real scheduling</h2>
          <p className="section-subtitle mt-4 max-w-lg mx-auto">
            Every feature is designed around one goal: fewer emails, more
            meetings.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map(({ icon: Icon, title, description, highlight }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Icon className="text-blue-600" size={22} />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {highlight}
                </span>
                <h3 className="font-semibold text-gray-900 mt-1 mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="-mx-8 px-8 py-24 bg-slate-50 border-t border-gray-100">
        <div className="text-center mb-14">
          <span className="section-badge">Why Calendix</span>
          <h2 className="section-title mt-4">Calendix vs manual scheduling</h2>
          <p className="section-subtitle mt-4 max-w-md mx-auto">
            See what you stop doing the moment you share your first Calendix
            link.
          </p>
        </div>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_120px] border-b border-gray-100">
            <div className="p-5 text-sm font-semibold text-gray-500">
              Capability
            </div>
            <div className="p-5 text-sm font-semibold text-blue-600 text-center bg-blue-50">
              Calendix
            </div>
            <div className="p-5 text-sm font-semibold text-gray-400 text-center">
              Manual
            </div>
          </div>
          {/* Rows */}
          {comparisonRows.map(({ feature, calendix, manual }, i) => (
            <div
              key={feature}
              className={`grid grid-cols-[1fr_120px_120px] border-b border-gray-50 last:border-0 ${
                i % 2 === 1 ? "bg-gray-50/50" : ""
              }`}
            >
              <div className="p-5 text-sm text-gray-700">{feature}</div>
              <div className="p-5 flex items-center justify-center bg-blue-50/40">
                {calendix ? (
                  <Check className="text-blue-600" size={18} />
                ) : (
                  <X className="text-gray-300" size={18} />
                )}
              </div>
              <div className="p-5 flex items-center justify-center">
                {manual ? (
                  <Check className="text-blue-600" size={18} />
                ) : (
                  <X className="text-gray-300" size={18} />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-24 border-t border-gray-100">
        <div className="bg-blue-600 rounded-3xl px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to stop scheduling manually?
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
