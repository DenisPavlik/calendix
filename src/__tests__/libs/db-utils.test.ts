import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/libs/connectToDB", () => ({
  connectToDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/models/Profile", () => ({
  ProfileModel: {
    findOne: vi.fn(),
  },
}));

import { getUsernameByEmail } from "@/libs/db-utils";
import { ProfileModel } from "@/models/Profile";
import { connectToDB } from "@/libs/connectToDB";

const mockFindOne = vi.mocked(ProfileModel.findOne);
const mockConnectToDB = vi.mocked(connectToDB);

describe("getUsernameByEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the username when profile exists", async () => {
    mockFindOne.mockResolvedValue({ username: "johndoe" } as any);
    const result = await getUsernameByEmail("john@example.com");
    expect(result).toBe("johndoe");
  });

  it("returns null when profile is not found", async () => {
    mockFindOne.mockResolvedValue(null);
    const result = await getUsernameByEmail("nobody@example.com");
    expect(result).toBeNull();
  });

  it("returns null when profile exists but username is undefined", async () => {
    mockFindOne.mockResolvedValue({} as any);
    const result = await getUsernameByEmail("user@example.com");
    expect(result).toBeNull();
  });

  it("queries Profile.findOne with the correct email", async () => {
    mockFindOne.mockResolvedValue({ username: "alice" } as any);
    await getUsernameByEmail("alice@example.com");
    expect(mockFindOne).toHaveBeenCalledWith({ email: "alice@example.com" });
  });

  it("calls connectToDB before querying", async () => {
    mockFindOne.mockResolvedValue({ username: "bob" } as any);
    await getUsernameByEmail("bob@example.com");
    expect(mockConnectToDB).toHaveBeenCalled();
  });
});
