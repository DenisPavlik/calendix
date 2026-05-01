import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromRequest } from "@/libs/getSessionEmail";
import { nylas } from "@/libs/nylas";
import { BookingModel } from "@/models/Booking";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const email = await getSessionEmailFromRequest(req);
    if (!email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const booking = await BookingModel.findById(params.id);
    if (!booking) {
      return new Response("Booking not found", { status: 404 });
    }

    const etDoc = await EventTypeModel.findById(booking.eventTypeId);
    if (!etDoc || etDoc.email !== email) {
      return new Response("Forbidden", { status: 403 });
    }

    const profileDoc = await ProfileModel.findOne({ email });

    if (profileDoc?.grantId) {
      try {
        if (booking.nylasEventId) {
          await nylas.events.destroy({
            identifier: profileDoc.grantId,
            eventId: booking.nylasEventId,
            queryParams: { calendarId: email },
          });
        } else {
          const startSec = Math.round(new Date(booking.when).getTime() / 1000);
          const events = await nylas.events.list({
            identifier: profileDoc.grantId,
            queryParams: {
              calendarId: email,
              start: String(startSec),
              end: String(startSec + 300),
            },
          });
          const match = events.data.find((e) => e.title === etDoc.title);
          if (match) {
            await nylas.events.destroy({
              identifier: profileDoc.grantId,
              eventId: match.id,
              queryParams: { calendarId: email },
            });
          }
        }
      } catch (nylasErr: unknown) {
        const statusCode = (nylasErr as { statusCode?: number })?.statusCode;
        if (statusCode !== 404) {
          console.error("Nylas event deletion failed:", nylasErr);
        }
      }
    }

    await BookingModel.deleteOne({ _id: params.id });

    return new Response("Booking cancelled", { status: 200 });
  } catch (err) {
    console.error("Error in DELETE /api/bookings/[id]:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
