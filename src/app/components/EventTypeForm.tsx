"use client";

import CopyButton from "@/app/components/CopyButton";
import TimeSelect from "@/app/components/TimeSelect";
import { WeekdaysNames } from "@/libs/shared";
import { BookingTimes, EventType, WeekdayName } from "@/types/types";
import axios from "axios";
import clsx from "clsx";
import { Link2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import EventTypeDelete from "./EventTypeDelete";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type Tab = "details" | "availability";

export default function EventTypeForm({
  doc,
  username = "",
}: {
  doc?: EventType;
  username?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("details");
  const [title, setTitle] = useState(doc?.title || "");
  const [description, setDescription] = useState(doc?.description || "");
  const [length, setLength] = useState(doc?.length || 30);
  const [bookingTimes, setBookingTimes] = useState<BookingTimes>(
    doc?.bookingTimes || ({} as BookingTimes)
  );

  const publicUrl = doc
    ? `${process.env.NEXT_PUBLIC_URL}/${username}/${doc.uri}`
    : null;

  function handleBookingTimeChange(
    weekday: WeekdayName,
    val: string | boolean,
    prop: "from" | "to" | "active"
  ) {
    setBookingTimes((prev) => {
      const next: BookingTimes = { ...prev };
      if (!next[weekday]) next[weekday] = { from: "09:00", to: "17:00", active: false };
      if (prop === "active" && typeof val === "boolean") next[weekday].active = val;
      else if ((prop === "from" || prop === "to") && typeof val === "string") next[weekday][prop] = val;
      return next;
    });
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    try {
      const id = doc?._id;
      const request = id ? axios.put : axios.post;
      const response = await request("/api/event-types", { title, description, length, bookingTimes, id });
      if (response.data) {
        router.push("/dashboard/event-types");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to save event type", err);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {doc ? "Edit event type" : "New event type"}
        </h1>
        {doc && <EventTypeDelete id={doc._id} />}
      </div>

      {publicUrl && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-white rounded-xl border border-gray-100">
          <Link2 size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-500 truncate flex-1">{publicUrl}</span>
          <CopyButton text={publicUrl} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(["details", "availability"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={clsx(
                "flex-1 py-3 text-sm font-medium transition-colors",
                tab === t
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {capitalize(t)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Details tab */}
          <div className={tab === "details" ? "space-y-5" : "hidden"}>
            <label>
              <span>Title</span>
              <input
                required
                type="text"
                placeholder="e.g. 30 min coffee chat"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                required
                placeholder="What is this meeting about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </label>
            <label>
              <span>Duration (minutes)</span>
              <input
                type="number"
                min={5}
                step={5}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
              />
            </label>
          </div>

          {/* Availability tab */}
          <div className={tab === "availability" ? "space-y-2" : "hidden"}>
            {WeekdaysNames.map((weekday) => {
              const slot = bookingTimes?.[weekday];
              const active = slot?.active ?? false;
              return (
                <div
                  key={weekday}
                  className={clsx(
                    "flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors",
                    active ? "bg-blue-50" : "bg-gray-50"
                  )}
                >
                  {/* Toggle */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    onClick={() => handleBookingTimeChange(weekday, !active, "active")}
                    className={clsx(
                      "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                      active ? "bg-blue-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200",
                        active ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>

                  <span className={clsx("w-24 text-sm font-medium", active ? "text-gray-900" : "text-gray-400")}>
                    {capitalize(weekday)}
                  </span>

                  <div className={clsx("flex items-center gap-2 text-sm", active ? "opacity-100" : "opacity-30 pointer-events-none")}>
                    <TimeSelect
                      value={slot?.from || "09:00"}
                      onChange={(val) => handleBookingTimeChange(weekday, val, "from")}
                      step={30}
                    />
                    <span className="text-gray-400">–</span>
                    <TimeSelect
                      value={slot?.to || "17:00"}
                      onChange={(val) => handleBookingTimeChange(weekday, val, "to")}
                      step={30}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button type="submit" className="btn btn-primary w-full justify-center">
            <Save size={15} />
            Save event type
          </button>
        </div>
      </form>
    </div>
  );
}
