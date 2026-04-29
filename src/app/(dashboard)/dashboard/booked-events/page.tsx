"use server";

import CancelBookingButton from "@/app/components/CancelBookingButton";
import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
import { BookingModel } from "@/models/Booking";
import { EventTypeModel } from "@/models/EventType";
import { format, isPast } from "date-fns";
import { CalendarDays, Clock, MessageSquare, User } from "lucide-react";

export default async function BookedEventsPage() {
  await connectToDB();
  const email = await getSessionEmailFromCookies();
  const etDocs = await EventTypeModel.find({ email });
  const bookings = await BookingModel.find(
    { eventTypeId: etDocs.map((doc) => doc._id) },
    {},
    { sort: { when: 1 } }
  );

  const upcoming = bookings.filter((b) => !isPast(b.when));
  const past = bookings.filter((b) => isPast(b.when)).reverse();

  function BookingCard({ booking }: { booking: (typeof bookings)[0] }) {
    const etDoc = etDocs.find(
      (etd) => (etd._id as string).toString() === booking.eventTypeId
    );
    const isUpcoming = !isPast(booking.when);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isUpcoming
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isUpcoming ? "Upcoming" : "Past"}
              </span>
              {etDoc && (
                <span className="text-xs text-gray-400">{etDoc.title}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-gray-900 font-semibold text-base">
              <User size={15} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{booking.guestName}</span>
              <span className="text-gray-400 font-normal text-sm truncate">
                · {booking.guestEmail}
              </span>
            </div>

            {booking.guestNotes && (
              <p className="flex items-start gap-1.5 mt-2 text-sm text-gray-500">
                <MessageSquare size={14} className="flex-shrink-0 mt-0.5 text-gray-400" />
                {booking.guestNotes}
              </p>
            )}
          </div>

          <div className="flex-shrink-0 text-right">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <CalendarDays size={14} className="text-gray-400" />
              {format(booking.when, "EEE, MMM d")}
            </div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">
              {format(booking.when, "HH:mm")}
            </div>
            {etDoc && (
              <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
                <Clock size={11} />
                {etDoc.length} min
              </div>
            )}
            {isUpcoming && (
              <div className="flex justify-end">
                <CancelBookingButton bookingId={(booking._id as string).toString()} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booked Events</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {bookings.length} total · {upcoming.length} upcoming
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No bookings yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Upcoming
              </h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((b, i) => (
                  <BookingCard key={i} booking={b} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Past
              </h2>
              <div className="flex flex-col gap-3">
                {past.map((b, i) => (
                  <BookingCard key={i} booking={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
