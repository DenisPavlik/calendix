import { connectToDB } from "@/libs/connectToDB";
import { nylas } from "@/libs/nylas";
import { EventType } from "@/types/types";
import { BookingModel } from "@/models/Booking";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";
import { addMinutes, format } from "date-fns";
import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type JsonData = {
  guestEmail: string;
  guestName: string;
  guestNotes: string;
  username: string;
  bookingUri: string;
  bookingTime: string;
};

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const data: JsonData = await req.json();
    const { guestName, guestEmail, guestNotes, bookingTime } = data;

    if (
      !guestName ||
      !guestEmail ||
      !bookingTime ||
      !data.username ||
      !data.bookingUri
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const profileDoc = await ProfileModel.findOne({
      username: data.username,
    });
    if (!profileDoc) {
      return Response.json({ error: "Invalid profile URL" }, { status: 404 });
    }

    const etDoc = await EventTypeModel.findOne({
      email: profileDoc.email,
      uri: data.bookingUri,
    }) as EventType;
    if (!etDoc) {
      return Response.json({ error: "Invalid booking URL" }, { status: 404 });
    }

    const startTime = new Date(bookingTime);

    const nylasEvent = await nylas.events.create({
      identifier: profileDoc.grantId,
      requestBody: {
        title: etDoc.title,
        when: {
          startTime: Math.round(startTime.getTime() / 1000),
          endTime: Math.round(addMinutes(startTime, etDoc.length).getTime() / 1000),
        },
        description: etDoc.description,
        conferencing: {
          autocreate: {},
          provider: "Google Meet",
        },
        participants: [
          {
            name: guestName,
            email: guestEmail,
            status: "yes",
          },
        ],
      },
      queryParams: {
        calendarId: etDoc.email,
      },
    });

    await BookingModel.create({
      guestName,
      guestEmail,
      guestNotes,
      when: bookingTime,
      eventTypeId: etDoc._id,
      nylasEventId: nylasEvent.data.id,
    });

    const meetingStart = format(startTime, "EEEE, MMMM d 'at' HH:mm");

    await resend.emails.send({
      from: "Calendix <onboarding@resend.dev>",
      to: profileDoc.email,
      subject: `New booking: ${etDoc.title}`,
      html: [
        `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">`,
        `<h2 style="margin:0 0 24px;font-size:20px;color:#111827">You have a new booking!</h2>`,
        `<table style="width:100%;border-collapse:collapse;font-size:14px">`,
        `<tr><td style="padding:8px 0;color:#6b7280;width:80px">Event</td><td style="padding:8px 0;font-weight:600;color:#111827">${etDoc.title}</td></tr>`,
        `<tr><td style="padding:8px 0;color:#6b7280">When</td><td style="padding:8px 0;font-weight:600;color:#111827">${meetingStart} &middot; ${etDoc.length} min</td></tr>`,
        `<tr><td style="padding:8px 0;color:#6b7280">Guest</td><td style="padding:8px 0;color:#111827">${guestName}</td></tr>`,
        `<tr><td style="padding:8px 0;color:#6b7280">Email</td><td style="padding:8px 0"><a href="mailto:${guestEmail}" style="color:#2563eb">${guestEmail}</a></td></tr>`,
        guestNotes
          ? `<tr><td style="padding:8px 0;color:#6b7280">Notes</td><td style="padding:8px 0;color:#111827">${guestNotes}</td></tr>`
          : "",
        `</table>`,
        `<p style="margin:8px 0 0;font-size:12px;color:#9ca3af">Sent by Calendix</p>`,
        `</div>`,
      ].join(""),
    });

    return Response.json(
      { message: "Booking created successfully" },
      { status: 201 }
    );
  } catch (err: unknown) {
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 401) {
      return Response.json({ error: "calendar_disconnected" }, { status: 503 });
    }
    console.error("Error in POST /api/bookings:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
