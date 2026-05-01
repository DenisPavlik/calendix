import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/libs/nylas", () => ({
  nylas: {
    auth: {
      exchangeCodeForToken: vi.fn(),
    },
  },
  nylasConfig: {
    clientId: "client-id",
    clientSecret: "client-secret",
    callbackUri: "http://localhost/api/oauth/exchange",
  },
}));

vi.mock("@/models/Profile", () => ({
  ProfileModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/libs/session", () => ({
  getSession: vi.fn(),
}));

import { GET } from "@/app/api/oauth/exchange/route";
import { nylas } from "@/libs/nylas";
import { ProfileModel } from "@/models/Profile";
import { getSession } from "@/libs/session";

const mockExchange = vi.mocked(nylas.auth.exchangeCodeForToken);
const mockFindOne = vi.mocked(ProfileModel.findOne);
const mockCreate = vi.mocked(ProfileModel.create);
const mockGetSession = vi.mocked(getSession);

function makeRequest(qs: string): Request {
  return new Request(`http://localhost/api/oauth/exchange?${qs}`);
}

describe("GET /api/oauth/exchange", () => {
  let sessionStore: { email?: string; save: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStore = { save: vi.fn().mockResolvedValue(undefined) };
    mockGetSession.mockResolvedValue({
      session: sessionStore,
      res: new Response(),
    } as any);
  });

  it("returns 400 when authorization code is missing", async () => {
    const res = await GET(makeRequest("") as any);
    expect(res.status).toBe(400);
  });

  it("exchanges the code for a token using nylasConfig credentials", async () => {
    mockExchange.mockResolvedValue({
      grantId: "grant-1",
      email: "user@example.com",
    } as any);
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as any);

    await GET(makeRequest("code=auth-code-123") as any);

    expect(mockExchange).toHaveBeenCalledWith({
      clientSecret: "client-secret",
      clientId: "client-id",
      redirectUri: "http://localhost/api/oauth/exchange",
      code: "auth-code-123",
    });
  });

  it("creates a new Profile when none exists for the returned email", async () => {
    mockExchange.mockResolvedValue({
      grantId: "grant-1",
      email: "new@example.com",
    } as any);
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as any);

    await GET(makeRequest("code=abc") as any);

    expect(mockCreate).toHaveBeenCalledWith({
      email: "new@example.com",
      grantId: "grant-1",
    });
  });

  it("updates the grantId of an existing Profile and calls save()", async () => {
    const saveMock = vi.fn().mockResolvedValue(undefined);
    const existing: any = {
      email: "existing@example.com",
      grantId: "old-grant",
      save: saveMock,
    };
    mockExchange.mockResolvedValue({
      grantId: "new-grant",
      email: "existing@example.com",
    } as any);
    mockFindOne.mockResolvedValue(existing);

    await GET(makeRequest("code=abc") as any);

    expect(existing.grantId).toBe("new-grant");
    expect(saveMock).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("stores email in the session and saves it", async () => {
    mockExchange.mockResolvedValue({
      grantId: "grant-1",
      email: "user@example.com",
    } as any);
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as any);

    await GET(makeRequest("code=abc") as any);

    expect(sessionStore.email).toBe("user@example.com");
    expect(sessionStore.save).toHaveBeenCalled();
  });

  it("redirects to / after successful exchange", async () => {
    mockExchange.mockResolvedValue({
      grantId: "grant-1",
      email: "user@example.com",
    } as any);
    mockFindOne.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as any);

    const res = await GET(makeRequest("code=abc") as any);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/");
  });
});
