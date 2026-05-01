import { EventType, FromTo, WeekdayName } from "@/types/types";
import mongoose, { model, Schema } from "mongoose";

const FromToSchema = new Schema<FromTo>({
  from: String,
  to: String,
  active: Boolean,
});

const BookingSchema = new Schema<Record<WeekdayName, FromTo>>({
  monday: FromToSchema,
  tuesday: FromToSchema,
  wednesday: FromToSchema,
  thursday: FromToSchema,
  friday: FromToSchema,
  saturday: FromToSchema,
  sunday: FromToSchema,
});

const EventTypeSchema = new Schema(
  {
    email: String,
    uri: String,
    title: String,
    description: String,
    length: Number,
    bookingTimes: BookingSchema,
  },
  {
    timestamps: true,
  }
);

EventTypeSchema.index({ email: 1, uri: 1 }, { unique: true });

export const EventTypeModel =
  mongoose.models?.EventType || model<EventType>("EventType", EventTypeSchema);
