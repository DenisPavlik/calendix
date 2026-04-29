"use client";

import Card from "@/app/components/Card";
import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    title: "Free",
    subtitle: "For personal use",
    monthlyPrice: "Free",
    yearlyPrice: "Free",
    featuresLabel: "Includes",
    features: [
      "1 event type",
      "Connect 1 calendar",
      "Customize availability",
      "Auto Google Meet link",
      "Public booking page",
      "Basic booked events dashboard",
    ],
    popular: false,
  },
  {
    title: "Standard",
    subtitle: "For professionals",
    monthlyPrice: "$10",
    yearlyPrice: "$8",
    featuresLabel: "Everything in Free, plus",
    features: [
      "Unlimited event types",
      "Connect multiple calendars",
      "Custom booking questions",
      "Automated reminders",
      "Custom event durations",
      "Priority email support",
    ],
    popular: true,
  },
  {
    title: "Teams",
    subtitle: "For growing businesses",
    monthlyPrice: "$16",
    yearlyPrice: "$13",
    featuresLabel: "Everything in Standard, plus",
    features: [
      "Team member management",
      "Round-robin event routing",
      "Admin dashboard",
      "Single Sign-On (SSO)",
      "Advanced analytics",
      "Dedicated account manager",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <>
      {/* Hero */}
      <section className="py-20 text-center">
        <span className="section-badge">Pricing</span>
        <h1 className="section-title mt-4">Simple, transparent pricing</h1>
        <p className="section-subtitle mt-5 max-w-lg mx-auto">
          Start free and upgrade when you need more. No hidden fees, no
          per-booking charges.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-1 mt-8 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billing === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Yearly
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              −20%
            </span>
          </button>
        </div>
      </section>

      {/* Cards */}
      <section className="pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan) => (
            <Card key={plan.title} {...plan} billing={billing} />
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-10">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </section>

      {/* CTA banner */}
      <section className="pb-24 border-t border-gray-100 pt-16">
        <div className="bg-blue-600 rounded-3xl px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Not sure which plan is right?
          </h2>
          <p className="text-blue-100 mb-8 max-w-md mx-auto">
            Start with Free — no credit card needed. Upgrade any time in your
            dashboard.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors"
          >
            Start for free
          </Link>
        </div>
      </section>
    </>
  );
}
