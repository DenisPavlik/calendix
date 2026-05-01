import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/Profile", () => ({
  ProfileModel: {
    findOne: vi.fn(),
  },
}));

vi.mock("@/libs/nylas", () => ({
  nylas: {
    calendars: {
      getFreeBusy: vi.fn(),
    },
  },
  nylasConfig: {},
}));

import { GET } from "@/app/api/busy/route";
import { ProfileModel } from "@/models/Profile";
import { nylas } from "@/libs/nylas";

const mockFindOne = vi.mocked(ProfileModel.findOne);
const mockGetFreeBusy = vi.mocked(nylas.calendars.getFreeBusy);

function makeRequest(qs: string): Request {
  return new Request(`http://localhost/api/busy?${qs}`);
}

describe("GET /api/busy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when profile is not found by username", async () => {
    mockFindOne.mockResolvedValue(null);
    const res = await GET(
      makeRequest("username=nobody&from=2026-05-01&to=2026-05-02") as any
    );
    expect(res.status).toBe(404);
  });

  it("queries Profile.findOne with the provided username", async () => {
    mockFindOne.mockResolvedValue(null);
    await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    expect(mockFindOne).toHaveBeenCalledWith({ username: "alice" });
  });

  it("calls Nylas.getFreeBusy with grantId, email, and unix timestamps", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
      username: "alice",
    } as any);
    mockGetFreeBusy.mockResolvedValue({ data: [] } as any);

    const from = "2026-05-01T00:00:00.000Z";
    const to = "2026-05-02T00:00:00.000Z";
    await GET(makeRequest(`username=alice&from=${from}&to=${to}`) as any);

    expect(mockGetFreeBusy).toHaveBeenCalledWith({
      identifier: "grant-abc",
      requestBody: {
        emails: ["alice@example.com"],
        startTime: Math.round(new Date(from).getTime() / 1000),
        endTime: Math.round(new Date(to).getTime() / 1000),
      },
    });
  });

  it("returns only timeslots with status 'busy' (filters out 'tentative' and 'free')", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
    } as any);
    mockGetFreeBusy.mockResolvedValue({
      data: [
        {
          email: "alice@example.com",
          timeSlots: [
            { startTime: 1, endTime: 2, status: "busy" },
            { startTime: 3, endTime: 4, status: "tentative" },
            { startTime: 5, endTime: 6, status: "busy" },
            { startTime: 7, endTime: 8, status: "free" },
          ],
        },
      ],
    } as any);

    const res = await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    const body = await res.json();

    expect(body).toEqual([
      { startTime: 1, endTime: 2, status: "busy" },
      { startTime: 5, endTime: 6, status: "busy" },
    ]);
  });

  it("returns empty array when Nylas returns no data", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
    } as any);
    mockGetFreeBusy.mockResolvedValue({ data: [] } as any);

    const res = await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns empty array when freeBusyData has no timeSlots field (e.g. ErrorObject)", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
    } as any);
    mockGetFreeBusy.mockResolvedValue({
      data: [{ email: "alice@example.com", error: "some error" }],
    } as any);

    const res = await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns 503 with calendar_disconnected when Nylas throws 401", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
    } as any);
    mockGetFreeBusy.mockRejectedValue({ statusCode: 401 });

    const res = await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: "calendar_disconnected" });
  });

  it("returns 500 on other Nylas errors", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
    } as any);
    mockGetFreeBusy.mockRejectedValue({ statusCode: 500 });

    const res = await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 on unknown errors without statusCode", async () => {
    mockFindOne.mockResolvedValue({
      email: "alice@example.com",
      grantId: "grant-abc",
    } as any);
    mockGetFreeBusy.mockRejectedValue(new Error("Network down"));

    const res = await GET(
      makeRequest("username=alice&from=2026-05-01&to=2026-05-02") as any
    );
    expect(res.status).toBe(500);
  });
});
