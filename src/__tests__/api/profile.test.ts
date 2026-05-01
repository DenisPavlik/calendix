import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/libs/getSessionEmail", () => ({
  getSessionEmailFromRequest: vi.fn(),
}));

vi.mock("@/models/Profile", () => ({
  ProfileModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

import { PUT } from "@/app/api/profile/route";
import { getSessionEmailFromRequest } from "@/libs/getSessionEmail";
import { ProfileModel } from "@/models/Profile";

const mockGetSession = vi.mocked(getSessionEmailFromRequest);
const mockFindOne = vi.mocked(ProfileModel.findOne);
const mockCreate = vi.mocked(ProfileModel.create);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/profile — auth", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when no session email", async () => {
    mockGetSession.mockResolvedValue(undefined);
    const res = await PUT(makeRequest({ username: "valid-name" }) as any);
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/profile — payload validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
  });

  it("returns 400 when username is missing", async () => {
    const res = await PUT(makeRequest({}) as any);
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is empty string", async () => {
    const res = await PUT(makeRequest({ username: "" }) as any);
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/profile — username regex validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as any);
  });

  it("rejects username shorter than 3 chars", async () => {
    const res = await PUT(makeRequest({ username: "ab" }) as any);
    expect(res.status).toBe(400);
  });

  it("accepts 3-character username", async () => {
    const res = await PUT(makeRequest({ username: "abc" }) as any);
    expect(res.status).toBe(200);
  });

  it("rejects uppercase letters", async () => {
    const res = await PUT(makeRequest({ username: "ABC" }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects mixed case", async () => {
    const res = await PUT(makeRequest({ username: "AbcDef" }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects special characters", async () => {
    const res = await PUT(makeRequest({ username: "a!b" }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects spaces", async () => {
    const res = await PUT(makeRequest({ username: "abc def" }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects underscores", async () => {
    const res = await PUT(makeRequest({ username: "abc_def" }) as any);
    expect(res.status).toBe(400);
  });

  it("rejects username longer than 30 chars (31)", async () => {
    const res = await PUT(makeRequest({ username: "a".repeat(31) }) as any);
    expect(res.status).toBe(400);
  });

  it("accepts 30-character username", async () => {
    const res = await PUT(makeRequest({ username: "a".repeat(30) }) as any);
    expect(res.status).toBe(200);
  });

  it("accepts hyphens and numbers", async () => {
    const res = await PUT(makeRequest({ username: "user-123" }) as any);
    expect(res.status).toBe(200);
  });
});

describe("PUT /api/profile — upsert behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
  });

  it("creates a new profile when none exists for the session email", async () => {
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as any);

    const res = await PUT(
      makeRequest({ username: "newuser", timezone: "Europe/Kyiv" }) as any
    );

    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith({
      email: "user@example.com",
      username: "newuser",
      timezone: "Europe/Kyiv",
    });
  });

  it("updates the existing profile and saves it", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const existing: any = {
      email: "user@example.com",
      username: "olduser",
      save: saveMock,
    };
    mockFindOne.mockResolvedValue(existing);

    const res = await PUT(
      makeRequest({ username: "newuser", timezone: "Europe/Kyiv" }) as any
    );

    expect(res.status).toBe(200);
    expect(existing.username).toBe("newuser");
    expect(existing.timezone).toBe("Europe/Kyiv");
    expect(saveMock).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("does not overwrite timezone when not provided in payload", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const existing: any = {
      email: "user@example.com",
      username: "olduser",
      timezone: "America/New_York",
      save: saveMock,
    };
    mockFindOne.mockResolvedValue(existing);

    await PUT(makeRequest({ username: "newuser" }) as any);

    expect(existing.timezone).toBe("America/New_York");
    expect(existing.username).toBe("newuser");
  });

  it("returns 500 on unexpected DB error", async () => {
    mockFindOne.mockRejectedValue(new Error("DB connection lost"));
    const res = await PUT(makeRequest({ username: "validname" }) as any);
    expect(res.status).toBe(500);
  });
});
