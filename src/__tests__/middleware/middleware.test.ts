import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
}));

import { middleware, config } from "@/middleware";
import { getIronSession } from "iron-session";
import { NextRequest } from "next/server";

const mockGetIronSession = vi.mocked(getIronSession);

function makeRequest(pathname: string): NextRequest {
  return new NextRequest(new URL(pathname, "http://localhost"));
}

describe("middleware — auth guard for /dashboard/*", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to / when session has no email", async () => {
    mockGetIronSession.mockResolvedValue({ email: undefined } as any);
    const req = makeRequest("/dashboard/event-types");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("redirects to / when session is empty", async () => {
    mockGetIronSession.mockResolvedValue({} as any);
    const req = makeRequest("/dashboard");
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("passes through (no redirect) when session has email", async () => {
    mockGetIronSession.mockResolvedValue({ email: "user@example.com" } as any);
    const req = makeRequest("/dashboard/booked-events");
    const res = await middleware(req);

    expect(res.headers.get("location")).toBeNull();
    expect(res.status).toBe(200);
  });

  it("passes through for nested dashboard routes when authenticated", async () => {
    mockGetIronSession.mockResolvedValue({ email: "user@example.com" } as any);
    const req = makeRequest("/dashboard/event-types/edit/abc123");
    const res = await middleware(req);

    expect(res.headers.get("location")).toBeNull();
  });

  it("calls getIronSession with the correct cookieName", async () => {
    mockGetIronSession.mockResolvedValue({ email: "user@example.com" } as any);
    const req = makeRequest("/dashboard");
    await middleware(req);

    const callArgs = mockGetIronSession.mock.calls[0];
    const sessionOpts = callArgs[2] as any;
    expect(sessionOpts.cookieName).toBe("calendix_session");
  });
});

describe("middleware config", () => {
  it("matcher targets only /dashboard/:path*", () => {
    expect(config.matcher).toEqual(["/dashboard/:path*"]);
  });
});
