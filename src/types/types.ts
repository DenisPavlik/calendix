export type WeekdayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type FromTo = {
  from: string;
  to: string;
  active: boolean;
};

export type BookingTimes = Record<WeekdayName, FromTo>;

export type EventType = {
  _id?: string;
  email: string;
  uri: string;
  title: string;
  description: string;
  length: number;
  bookingTimes: BookingTimes;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Profile = {
  email: string;
  username: string;
  grantId: string;
  timezone?: string;
}

export type Booking = {
  _id?: string;
  guestName: string;
  guestEmail: string;
  guestNotes: string;
  when: Date;
  eventTypeId: string;
  nylasEventId: string;
}