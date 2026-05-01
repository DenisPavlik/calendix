import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/libs/nylas", () => ({
  nylas: {
    events: {
      create: vi.fn(),
    },
  },
  nylasConfig: {},
}));

vi.mock("@/models/Profile", () => ({
  ProfileModel: { findOne: vi.fn() },
}));

vi.mock("@/models/EventType", () => ({
  EventTypeModel: { findOne: vi.fn() },
}));

vi.mock("@/models/Booking", () => ({
  BookingModel: { create: vi.fn() },
}));

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({}),
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { POST } from "@/app/api/bookings/route";
import { nylas } from "@/libs/nylas";
import { ProfileModel } from "@/models/Profile";
import { EventTypeModel } from "@/models/EventType";
import { BookingModel } from "@/models/Booking";

const mockProfileFindOne = vi.mocked(ProfileModel.findOne);
const mockEventTypeFindOne = vi.mocked(EventTypeModel.findOne);
const mockBookingCreate = vi.mocked(BookingModel.create);
const mockNylasCreate = vi.mocked(nylas.events.create);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  guestName: "John Doe",
  guestEmail: "john@example.com",
  guestNotes: "Looking forward to it",
  username: "alice",
  bookingUri: "intro-call",
  bookingTime: "2026-05-15T10:00:00.000Z",
};

const profileDoc = {
  email: "alice@example.com",
  username: "alice",
  grantId: "grant-abc",
};

const etDoc = {
  _id: "et-1",
  email: "alice@example.com",
  uri: "intro-call",
  title: "Intro Call",
  description: "Quick intro",
  length: 30,
};

describe("POST /api/bookings — payload validation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when guestName is missing", async () => {
    const res = await POST(
      makeRequest({ ...validPayload, guestName: "" }) as any
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when guestEmail is missing", async () => {
    const res = await POST(
      makeRequest({ ...validPayload, guestEmail: "" }) as any
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when bookingTime is missing", async () => {
    const res = await POST(
      makeRequest({ ...validPayload, bookingTime: "" }) as any
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is missing", async () => {
    const res = await POST(
      makeRequest({ ...validPayload, username: "" }) as any
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when bookingUri is missing", async () => {
    const res = await POST(
      makeRequest({ ...validPayload, bookingUri: "" }) as any
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/bookings — entity lookup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 404 when profile by username is not found", async () => {
    mockProfileFindOne.mockResolvedValue(null);
    const res = await POST(makeRequest(validPayload) as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Invalid profile URL");
  });

  it("returns 404 when event type is not found for that profile/uri", async () => {
    mockProfileFindOne.mockResolvedValue(profileDoc as any);
    mockEventTypeFindOne.mockResolvedValue(null);
    const res = await POST(makeRequest(validPayload) as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Invalid booking URL");
  });

  it("scopes EventType lookup by profile email and bookingUri", async () => {
    mockProfileFindOne.mockResolvedValue(profileDoc as any);
    mockEventTypeFindOne.mockResolvedValue(etDoc as any);
    mockNylasCreate.mockResolvedValue({ data: { id: "nylas-evt-1" } } as any);
    mockBookingCreate.mockResolvedValue({} as any);

    await POST(makeRequest(validPayload) as any);

    expect(mockEventTypeFindOne).toHaveBeenCalledWith({
      email: "alice@example.com",
      uri: "intro-call",
    });
  });
});

describe("POST /api/bookings — successful flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileFindOne.mockResolvedValue(profileDoc as any);
    mockEventTypeFindOne.mockResolvedValue(etDoc as any);
    mockNylasCreate.mockResolvedValue({ data: { id: "nylas-evt-1" } } as any);
    mockBookingCreate.mockResolvedValue({} as any);
  });

  it("returns 201 with success message", async () => {
    const res = await POST(makeRequest(validPayload) as any);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.message).toBe("Booking created successfully");
  });

  it("creates Nylas event with Google Meet conferencing and correct duration", async () => {
    await POST(makeRequest(validPayload) as any);

    const call = mockNylasCreate.mock.calls[0][0];
    expect(call.identifier).toBe("grant-abc");
    expect(call.requestBody.title).toBe("Intro Call");
    expect(call.requestBody.conferencing).toEqual({
      autocreate: {},
      provider: "Google Meet",
    });
    expect(call.requestBody.participants).toEqual([
      { name: "John Doe", email: "john@example.com", status: "yes" },
    ]);

    const startUnix = Math.round(
      new Date(validPayload.bookingTime).getTime() / 1000
    );
    expect(call.requestBody.when.startTime).toBe(startUnix);
    expect(call.requestBody.when.endTime).toBe(startUnix + 30 * 60);
  });

  it("persists Booking with nylasEventId from Nylas response", async () => {
    await POST(makeRequest(validPayload) as any);

    expect(mockBookingCreate).toHaveBeenCalledWith({
      guestName: "John Doe",
      guestEmail: "john@example.com",
      guestNotes: "Looking forward to it",
      when: validPayload.bookingTime,
      eventTypeId: "et-1",
      nylasEventId: "nylas-evt-1",
    });
  });

  it("sends a confirmation email to the host", async () => {
    await POST(makeRequest(validPayload) as any);

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@example.com",
        subject: "New booking: Intro Call",
      })
    );
  });
});

describe("POST /api/bookings — error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProfileFindOne.mockResolvedValue(profileDoc as any);
    mockEventTypeFindOne.mockResolvedValue(etDoc as any);
  });

  it("returns 503 calendar_disconnected when Nylas throws 401", async () => {
    mockNylasCreate.mockRejectedValue({ statusCode: 401 });
    const res = await POST(makeRequest(validPayload) as any);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: "calendar_disconnected" });
  });

  it("returns 500 on other Nylas errors", async () => {
    mockNylasCreate.mockRejectedValue({ statusCode: 500 });
    const res = await POST(makeRequest(validPayload) as any);
    expect(res.status).toBe(500);
  });

  it("returns 500 on unknown errors without statusCode", async () => {
    mockNylasCreate.mockRejectedValue(new Error("Network down"));
    const res = await POST(makeRequest(validPayload) as any);
    expect(res.status).toBe(500);
  });
});
