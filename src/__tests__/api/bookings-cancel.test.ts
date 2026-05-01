import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/libs/getSessionEmail", () => ({
  getSessionEmailFromRequest: vi.fn(),
}));

vi.mock("@/libs/nylas", () => ({
  nylas: {
    events: {
      destroy: vi.fn(),
      list: vi.fn(),
    },
  },
  nylasConfig: {},
}));

vi.mock("@/models/Booking", () => ({
  BookingModel: {
    findById: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock("@/models/EventType", () => ({
  EventTypeModel: {
    findById: vi.fn(),
  },
}));

vi.mock("@/models/Profile", () => ({
  ProfileModel: {
    findOne: vi.fn(),
  },
}));

import { DELETE } from "@/app/api/bookings/[id]/route";
import { getSessionEmailFromRequest } from "@/libs/getSessionEmail";
import { nylas } from "@/libs/nylas";
import { BookingModel } from "@/models/Booking";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";

const mockGetSession = vi.mocked(getSessionEmailFromRequest);
const mockBookingFindById = vi.mocked(BookingModel.findById);
const mockBookingDeleteOne = vi.mocked(BookingModel.deleteOne);
const mockEventTypeFindById = vi.mocked(EventTypeModel.findById);
const mockProfileFindOne = vi.mocked(ProfileModel.findOne);
const mockNylasDestroy = vi.mocked(nylas.events.destroy);
const mockNylasList = vi.mocked(nylas.events.list);

function makeRequest(): Request {
  return new Request("http://localhost/api/bookings/booking-1", {
    method: "DELETE",
  });
}

const params = { params: { id: "booking-1" } };

const ownerEmail = "alice@example.com";
const otherEmail = "bob@example.com";

const etDoc = {
  _id: "et-1",
  email: ownerEmail,
  title: "Intro Call",
};

const profileDoc = {
  email: ownerEmail,
  grantId: "grant-abc",
};

describe("DELETE /api/bookings/[id] — auth & ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without session", async () => {
    mockGetSession.mockResolvedValue(undefined);
    const res = await DELETE(makeRequest() as any, params);
    expect(res.status).toBe(401);
  });

  it("returns 404 when booking is not found", async () => {
    mockGetSession.mockResolvedValue(ownerEmail);
    mockBookingFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest() as any, params);
    expect(res.status).toBe(404);
  });

  it("returns 403 when EventType is missing", async () => {
    mockGetSession.mockResolvedValue(ownerEmail);
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
    } as any);
    mockEventTypeFindById.mockResolvedValue(null);
    const res = await DELETE(makeRequest() as any, params);
    expect(res.status).toBe(403);
  });

  it("returns 403 when EventType is owned by a different user", async () => {
    mockGetSession.mockResolvedValue(otherEmail);
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
    } as any);
    mockEventTypeFindById.mockResolvedValue(etDoc as any);
    const res = await DELETE(makeRequest() as any, params);
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/bookings/[id] — Nylas event removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue(ownerEmail);
    mockEventTypeFindById.mockResolvedValue(etDoc as any);
    mockProfileFindOne.mockResolvedValue(profileDoc as any);
    mockBookingDeleteOne.mockResolvedValue({ deletedCount: 1 } as any);
  });

  it("deletes Nylas event directly when booking.nylasEventId is present", async () => {
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
      nylasEventId: "nylas-evt-1",
    } as any);
    mockNylasDestroy.mockResolvedValue({} as any);

    const res = await DELETE(makeRequest() as any, params);

    expect(res.status).toBe(200);
    expect(mockNylasDestroy).toHaveBeenCalledWith({
      identifier: "grant-abc",
      eventId: "nylas-evt-1",
      queryParams: { calendarId: ownerEmail },
    });
    expect(mockNylasList).not.toHaveBeenCalled();
  });

  it("falls back to listing events by time window when nylasEventId is missing", async () => {
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
    } as any);
    mockNylasList.mockResolvedValue({
      data: [
        { id: "other-evt", title: "Other Meeting" },
        { id: "match-evt", title: "Intro Call" },
      ],
    } as any);
    mockNylasDestroy.mockResolvedValue({} as any);

    const res = await DELETE(makeRequest() as any, params);

    expect(res.status).toBe(200);
    const startSec = Math.round(
      new Date("2026-05-15T10:00:00.000Z").getTime() / 1000
    );
    expect(mockNylasList).toHaveBeenCalledWith({
      identifier: "grant-abc",
      queryParams: {
        calendarId: ownerEmail,
        start: String(startSec),
        end: String(startSec + 300),
      },
    });
    expect(mockNylasDestroy).toHaveBeenCalledWith({
      identifier: "grant-abc",
      eventId: "match-evt",
      queryParams: { calendarId: ownerEmail },
    });
  });

  it("does not call destroy when fallback list finds no matching title", async () => {
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
    } as any);
    mockNylasList.mockResolvedValue({
      data: [{ id: "other-evt", title: "Different Meeting" }],
    } as any);

    const res = await DELETE(makeRequest() as any, params);

    expect(res.status).toBe(200);
    expect(mockNylasDestroy).not.toHaveBeenCalled();
  });

  it("ignores Nylas 404 (event already deleted) and still removes the Booking", async () => {
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
      nylasEventId: "nylas-evt-1",
    } as any);
    mockNylasDestroy.mockRejectedValue({ statusCode: 404 });

    const res = await DELETE(makeRequest() as any, params);

    expect(res.status).toBe(200);
    expect(mockBookingDeleteOne).toHaveBeenCalledWith({ _id: "booking-1" });
  });

  it("swallows other Nylas errors and still removes the Booking", async () => {
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
      nylasEventId: "nylas-evt-1",
    } as any);
    mockNylasDestroy.mockRejectedValue({ statusCode: 500 });

    const res = await DELETE(makeRequest() as any, params);

    expect(res.status).toBe(200);
    expect(mockBookingDeleteOne).toHaveBeenCalledWith({ _id: "booking-1" });
  });

  it("skips Nylas calls when host has no grantId (calendar not connected)", async () => {
    mockProfileFindOne.mockResolvedValue({ email: ownerEmail } as any);
    mockBookingFindById.mockResolvedValue({
      _id: "booking-1",
      eventTypeId: "et-1",
      when: "2026-05-15T10:00:00.000Z",
      nylasEventId: "nylas-evt-1",
    } as any);

    const res = await DELETE(makeRequest() as any, params);

    expect(mockNylasDestroy).not.toHaveBeenCalled();
    expect(mockNylasList).not.toHaveBeenCalled();
    expect(mockBookingDeleteOne).toHaveBeenCalledWith({ _id: "booking-1" });
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected errors (e.g., DB failure)", async () => {
    mockBookingFindById.mockRejectedValue(new Error("DB down"));
    const res = await DELETE(makeRequest() as any, params);
    expect(res.status).toBe(500);
  });
});
