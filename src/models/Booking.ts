import { Booking } from "@/types/types";
import { model, models, Schema } from "mongoose";

const BookingSchema = new Schema<Booking>({
  guestName: String,
  guestEmail: String,
  guestNotes: String,
  when: Date,
  eventTypeId: String,
  nylasEventId: String,
});

export const BookingModel =
  models?.Booking || model<Booking>("Booking", BookingSchema);
