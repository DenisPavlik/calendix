"use client";

import CopyButton from "@/app/components/CopyButton";
import TimeSelect from "@/app/components/TimeSelect";
import { WeekdaysNames } from "@/libs/shared";
import { BookingTimes, EventType, WeekdayName } from "@/types/types";
import axios from "axios";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Link2, Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
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

  const [titleChecking, setTitleChecking] = useState(false);
  const [titleAvailable, setTitleAvailable] = useState<boolean | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const publicUrl = doc
    ? `${process.env.NEXT_PUBLIC_URL}/${username}/${doc.uri}`
    : null;

  useEffect(() => {
    if (!title) { setTitleAvailable(null); return; }
    if (title === doc?.title) { setTitleAvailable(true); return; }

    setTitleAvailable(null);
    setTitleChecking(true);
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ checkTitle: title });
        if (doc?._id) params.set("excludeId", doc._id);
        const res = await axios.get(`/api/event-types?${params}`);
        setTitleAvailable(res.data.available);
      } catch {
        setTitleAvailable(null);
      } finally {
        setTitleChecking(false);
      }
    }, 450);
    return () => { if (titleTimerRef.current) clearTimeout(titleTimerRef.current); };
  }, [title, doc?.title, doc?._id]);

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
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data || "Failed to save event type";
        toast.error(typeof msg === "string" ? msg : "Failed to save event type");
      } else {
        toast.error("Failed to save event type");
      }
    }
  }

  const canSubmit = titleAvailable !== false && !titleChecking;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/event-types"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Back to event types"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {doc ? "Edit event type" : "New event type"}
          </h1>
        </div>
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

        <div className="p-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {tab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="space-y-5"
              >
                <label>
                  <span>Title</span>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      placeholder="e.g. 30 min coffee chat"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={clsx(
                        "pr-9",
                        titleAvailable === false && "border-red-300 focus:ring-red-200"
                      )}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {titleChecking && <Loader2 size={15} className="animate-spin text-gray-400" />}
                      {!titleChecking && titleAvailable === true && <Check size={15} className="text-emerald-500" />}
                      {!titleChecking && titleAvailable === false && <X size={15} className="text-red-400" />}
                    </div>
                  </div>
                  {titleAvailable === false && (
                    <p className="text-xs text-red-400 mt-1.5">This name is already taken.</p>
                  )}
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
              </motion.div>
            )}

            {tab === "availability" && (
              <motion.div
                key="availability"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="space-y-2"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 pb-6">
          <button
            type="submit"
            disabled={!canSubmit}
            className="btn btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save size={15} />
            Save event type
          </button>
        </div>
      </form>
    </div>
  );
}
