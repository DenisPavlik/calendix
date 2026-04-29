"use client";

import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TIMES = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:30 PM"];

export default function Hero() {
  const [showLine, setShowLine] = useState(false);
  const [selected, setSelected] = useState("10:00 AM");

  useEffect(() => {
    setShowLine(true);
  }, []);

  return (
    <section className="text-center pt-16 pb-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-1.5 rounded-full mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
        Open-source scheduling platform
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-gray-900">
        Scheduling{" "}
        <span
          className={clsx(
            "text-blue-600 cool-underline",
            showLine && "show-underline"
          )}
        >
          made simple
        </span>
        <br />
        for people like you
      </h1>

      {/* Subheading */}
      <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
        Share a link, let others pick a time. Calendix syncs with your Google
        Calendar and creates meetings automatically — zero back-and-forth.
      </p>

      {/* CTAs */}
      <div className="flex gap-3 justify-center flex-wrap mb-16">
        <Link href="/dashboard" className="btn btn-primary">
          Get started for free
        </Link>
        <Link href="/features" className="btn btn-outline">
          See how it works
        </Link>
      </div>

      {/* Mock booking UI */}
      <div className="relative mx-auto max-w-lg">
        {/* Glow behind card */}
        <div className="absolute -z-10 inset-x-8 bottom-0 h-24 bg-blue-400/30 blur-3xl rounded-full" />

        <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white text-left">
          {/* Browser chrome */}
          <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-400 block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 block" />
              <span className="w-3 h-3 rounded-full bg-green-400 block" />
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 text-center truncate">
              calendix.app/john/coffee-chat
            </div>
          </div>

          {/* Booking widget */}
          <div className="flex divide-x divide-gray-100">
            {/* Left: event info */}
            <div className="w-44 shrink-0 p-5">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <CalendarDays className="text-white" size={16} />
              </div>
              <p className="text-xs text-gray-400 mb-0.5">John Smith</p>
              <p className="font-semibold text-gray-900 text-sm mb-4">
                Coffee Chat
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <span>⏱</span>
                <span>30 min</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span>📹</span>
                <span>Google Meet</span>
              </div>
            </div>

            {/* Right: time slots */}
            <div className="flex-1 p-5">
              <p className="text-xs font-medium text-gray-700 mb-4">
                Select a time · Mon, Apr 28
              </p>
              <div className="flex flex-col gap-2">
                {TIMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelected(t)}
                    className={clsx(
                      "text-xs text-center py-2 rounded-lg border transition-colors cursor-pointer",
                      selected === t
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
