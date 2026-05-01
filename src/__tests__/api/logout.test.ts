import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
}));

import { GET, POST } from "@/app/api/logout/route";
import { getIronSession } from "iron-session";
import { NextRequest } from "next/server";

const mockGetIronSession = vi.mocked(getIronSession);

function makeRequest(url = "http://localhost/api/logout"): NextRequest {
  return new NextRequest(new URL(url), { method: "POST" });
}

describe("GET /api/logout", () => {
  it("returns 405 Method Not Allowed", async () => {
    const res = await GET();
    expect(res.status).toBe(405);
  });
});

describe("POST /api/logout", () => {
  let mockDestroy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDestroy = vi.fn().mockResolvedValue(undefined);
    mockGetIronSession.mockResolvedValue({ destroy: mockDestroy } as any);
  });

  it("calls session.destroy()", async () => {
    await POST(makeRequest());
    expect(mockDestroy).toHaveBeenCalledTimes(1);
  });

  it("redirects to /", async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });

  it("destroys session before issuing redirect", async () => {
    const callOrder: string[] = [];
    mockDestroy.mockImplementation(async () => {
      callOrder.push("destroy");
    });

    const res = await POST(makeRequest());
    callOrder.push("redirect-returned");

    expect(callOrder).toEqual(["destroy", "redirect-returned"]);
    expect(res.status).toBe(307);
  });

  it("preserves the request origin in the redirect URL", async () => {
    const res = await POST(makeRequest("https://calendix.app/api/logout"));
    expect(res.headers.get("location")).toBe("https://calendix.app/");
  });
});
