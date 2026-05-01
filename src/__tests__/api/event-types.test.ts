import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/libs/getSessionEmail", () => ({
  getSessionEmailFromRequest: vi.fn(),
}));

vi.mock("@/models/EventType", () => ({
  EventTypeModel: {
    findOne: vi.fn(),
    create: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

import { GET, POST, PUT, DELETE } from "@/app/api/event-types/route";
import { getSessionEmailFromRequest } from "@/libs/getSessionEmail";
import { EventTypeModel } from "@/models/EventType";

const mockGetSession = vi.mocked(getSessionEmailFromRequest);
const mockFindOne = vi.mocked(EventTypeModel.findOne);
const mockCreate = vi.mocked(EventTypeModel.create);
const mockUpdateOne = vi.mocked(EventTypeModel.updateOne);
const mockDeleteOne = vi.mocked(EventTypeModel.deleteOne);

function makeRequest(method: string, url: string, body?: unknown): Request {
  return new Request(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/event-types — URI availability check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
  });

  it("returns 401 without session", async () => {
    mockGetSession.mockResolvedValue(undefined);
    const req = makeRequest("GET", "http://localhost/api/event-types?checkTitle=Foo");
    const res = await GET(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 when checkTitle param is missing", async () => {
    const req = makeRequest("GET", "http://localhost/api/event-types");
    const res = await GET(req as any);
    expect(res.status).toBe(400);
  });

  it("normalizes title to URI: lowercase + non-alphanumerics → hyphens", async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest(
      "GET",
      "http://localhost/api/event-types?checkTitle=My+Event+Type!"
    );
    await GET(req as any);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.objectContaining({ uri: "my-event-type-" })
    );
  });

  it("scopes the query to the session email", async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest("GET", "http://localhost/api/event-types?checkTitle=intro");
    await GET(req as any);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.objectContaining({ email: "user@example.com" })
    );
  });

  it("returns { available: true } when no duplicate exists", async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest("GET", "http://localhost/api/event-types?checkTitle=Intro");
    const res = await GET(req as any);
    const body = await res.json();
    expect(body).toEqual({ available: true });
  });

  it("returns { available: false } when a duplicate exists", async () => {
    mockFindOne.mockResolvedValue({ uri: "intro" } as any);
    const req = makeRequest("GET", "http://localhost/api/event-types?checkTitle=Intro");
    const res = await GET(req as any);
    const body = await res.json();
    expect(body).toEqual({ available: false });
  });

  it("excludes the current document when excludeId is provided", async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest(
      "GET",
      "http://localhost/api/event-types?checkTitle=Existing&excludeId=abc123"
    );
    await GET(req as any);
    expect(mockFindOne).toHaveBeenCalledWith(
      expect.objectContaining({ _id: { $ne: "abc123" } })
    );
  });

  it("does not add _id filter when excludeId is absent", async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest("GET", "http://localhost/api/event-types?checkTitle=foo");
    await GET(req as any);
    const passedQuery = mockFindOne.mock.calls[0][0] as Record<string, unknown>;
    expect(passedQuery).not.toHaveProperty("_id");
  });
});

describe("POST /api/event-types — create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
  });

  it("returns 401 without session", async () => {
    mockGetSession.mockResolvedValue(undefined);
    const req = makeRequest("POST", "http://localhost/api/event-types", { title: "X" });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it("creates the event type with uri derived from title and email from session", async () => {
    const created = { _id: "1", title: "Intro Call", uri: "intro-call" };
    mockCreate.mockResolvedValue(created as any);

    const req = makeRequest("POST", "http://localhost/api/event-types", {
      title: "Intro Call",
      length: 30,
    });
    const res = await POST(req as any);

    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        title: "Intro Call",
        uri: "intro-call",
        length: 30,
      })
    );
  });

  it("returns the created document as JSON", async () => {
    const created = { _id: "1", title: "Intro", uri: "intro" };
    mockCreate.mockResolvedValue(created as any);
    const req = makeRequest("POST", "http://localhost/api/event-types", {
      title: "Intro",
    });
    const res = await POST(req as any);
    const body = await res.json();
    expect(body).toMatchObject(created);
  });

  it("returns 409 on duplicate key error (Mongo code 11000)", async () => {
    mockCreate.mockRejectedValue({ code: 11000 });
    const req = makeRequest("POST", "http://localhost/api/event-types", {
      title: "Duplicate",
    });
    const res = await POST(req as any);
    expect(res.status).toBe(409);
  });

  it("returns 500 on other errors", async () => {
    mockCreate.mockRejectedValue(new Error("Network down"));
    const req = makeRequest("POST", "http://localhost/api/event-types", { title: "X" });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/event-types — update", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
  });

  it("returns 401 without session", async () => {
    mockGetSession.mockResolvedValue(undefined);
    const req = makeRequest("PUT", "http://localhost/api/event-types", {
      id: "abc",
      title: "X",
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing from payload", async () => {
    const req = makeRequest("PUT", "http://localhost/api/event-types", { title: "X" });
    const res = await PUT(req as any);
    expect(res.status).toBe(400);
  });

  it("calls updateOne scoped by both email (ownership) and _id", async () => {
    mockUpdateOne.mockResolvedValue({ matchedCount: 1 } as any);
    const req = makeRequest("PUT", "http://localhost/api/event-types", {
      id: "abc",
      title: "Updated Title",
    });
    const res = await PUT(req as any);

    expect(res.status).toBe(200);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { email: "user@example.com", _id: "abc" },
      expect.objectContaining({ title: "Updated Title", uri: "updated-title" })
    );
  });

  it("returns 409 on duplicate key error", async () => {
    mockUpdateOne.mockRejectedValue({ code: 11000 });
    const req = makeRequest("PUT", "http://localhost/api/event-types", {
      id: "abc",
      title: "Dup",
    });
    const res = await PUT(req as any);
    expect(res.status).toBe(409);
  });
});

describe("DELETE /api/event-types — delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue("user@example.com");
  });

  it("returns 401 without session", async () => {
    mockGetSession.mockResolvedValue(undefined);
    const req = makeRequest("DELETE", "http://localhost/api/event-types?id=xyz");
    const res = await DELETE(req as any);
    expect(res.status).toBe(401);
  });

  it("returns 400 when id query param is missing", async () => {
    const req = makeRequest("DELETE", "http://localhost/api/event-types");
    const res = await DELETE(req as any);
    expect(res.status).toBe(400);
  });

  it("enforces ownership: deleteOne is called with both _id and session email", async () => {
    mockDeleteOne.mockResolvedValue({ deletedCount: 1 } as any);
    const req = makeRequest("DELETE", "http://localhost/api/event-types?id=xyz789");
    const res = await DELETE(req as any);

    expect(mockDeleteOne).toHaveBeenCalledWith({
      _id: "xyz789",
      email: "user@example.com",
    });
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    mockDeleteOne.mockRejectedValue(new Error("DB error"));
    const req = makeRequest("DELETE", "http://localhost/api/event-types?id=xyz");
    const res = await DELETE(req as any);
    expect(res.status).toBe(500);
  });
});
