"use client";
import axios from "axios";
import { addMinutes, format } from "date-fns";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { CalendarCheck, CalendarPlus, Download } from "lucide-react";

type PageProps = {
  params: {
    username: string;
    "booking-uri": string;
    "booking-time": string;
  };
};

function formatICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildICS(start: Date, end: Date, title: string): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calendly Clone//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatICS(start)}`,
    `DTEND:${formatICS(end)}`,
    `SUMMARY:${title}`,
    "DESCRIPTION:Booking confirmed via Calendly Clone",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function buildGoogleCalendarUrl(start: Date, end: Date, title: string): string {
  const fmt = (d: Date) => formatICS(d);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: "Booking confirmed via Calendly Clone",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function BookingFormPage(props: PageProps) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const length = parseInt(searchParams.get("length") ?? "30");

  const username = props.params.username;
  const bookingUri = props.params["booking-uri"];
  const bookingTime = new Date(decodeURIComponent(props.params["booking-time"]));
  const bookingEnd = addMinutes(bookingTime, length);
  const meetingTitle = `Meeting with ${username}`;

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post("/api/bookings", {
        guestEmail,
        guestName,
        guestNotes,
        username,
        bookingUri,
        bookingTime,
      });
      if (response.status === 201) {
        setConfirmed(true);
      }
    } catch (e: any) {
      console.error("Booking error:", e);
      toast.error(e.response?.data?.error || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function downloadICS() {
    const content = buildICS(bookingTime, bookingEnd, meetingTitle);
    const blob = new Blob([content], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center h-full min-h-[24rem]">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5 shadow-sm">
          <CalendarCheck className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Meeting confirmed!
        </h1>
        <p className="text-gray-500 mb-1">
          {format(bookingTime, "EEEE, MMMM d")}
        </p>
        <p className="text-gray-500 mb-6">
          {format(bookingTime, "HH:mm")} &ndash; {format(bookingEnd, "HH:mm")} &middot; {length} min
        </p>
        <p className="text-sm text-gray-400 mb-8">
          A Google Meet link has been added to the calendar invite.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <a
            href={buildGoogleCalendarUrl(bookingTime, bookingEnd, meetingTitle)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary flex-1 justify-center"
          >
            <CalendarPlus className="w-4 h-4" />
            Google Calendar
          </a>
          <button
            onClick={downloadICS}
            className="btn btn-outline flex-1 justify-center"
          >
            <Download className="w-4 h-4" />
            Download .ics
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        {format(bookingTime, "EEEE, MMMM d")}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {format(bookingTime, "HH:mm")} &ndash; {format(bookingEnd, "HH:mm")} &middot; {length} min
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          <span>Your name</span>
          <input
            required
            type="text"
            placeholder="John Doe"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </label>
        <label>
          <span>Your email</span>
          <input
            required
            type="email"
            placeholder="you@example.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
        </label>
        <label>
          <span>Notes (optional)</span>
          <textarea
            placeholder="Anything you'd like to share..."
            value={guestNotes}
            onChange={(e) => setGuestNotes(e.target.value)}
            rows={3}
          />
        </label>
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full justify-center disabled:opacity-60"
          >
            {submitting ? "Confirming…" : "Confirm booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
