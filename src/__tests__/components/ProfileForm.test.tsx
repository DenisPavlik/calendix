import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

vi.mock("axios");
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import ProfileForm from "@/app/components/ProfileForm";
import axios from "axios";
import toast from "react-hot-toast";

const mockAxiosPut = vi.mocked(axios.put);
const mockAxiosIsAxiosError = vi.mocked(axios.isAxiosError);

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with initial username prop", () => {
    render(<ProfileForm un="john-doe" tz="UTC" />);
    expect(screen.getByDisplayValue("john-doe")).toBeInTheDocument();
  });

  it("renders with empty username when no prop provided", () => {
    render(<ProfileForm />);
    const input = screen.getByPlaceholderText("your-username");
    expect(input).toHaveValue("");
  });

  it("shows initials avatar from username prop", () => {
    render(<ProfileForm un="alice" tz="UTC" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("converts input to lowercase", () => {
    render(<ProfileForm un="existing" tz="UTC" />);
    const input = screen.getByDisplayValue("existing");
    fireEvent.change(input, { target: { value: "UPPERCASE" } });
    expect(input).toHaveValue("uppercase");
  });

  describe("username validation (debounced 450ms)", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("shows valid check after debounce for correct format", async () => {
      render(<ProfileForm tz="UTC" />);
      const input = screen.getByPlaceholderText("your-username");

      fireEvent.change(input, { target: { value: "valid-user-123" } });

      await act(async () => {
        vi.advanceTimersByTime(450);
      });

      expect(screen.queryByText("a–z, 0–9, hyphens only")).not.toBeInTheDocument();
    });

    it("shows error text after debounce for too-short username", async () => {
      render(<ProfileForm tz="UTC" />);
      const input = screen.getByPlaceholderText("your-username");

      fireEvent.change(input, { target: { value: "ab" } });

      await act(async () => {
        vi.advanceTimersByTime(450);
      });

      expect(screen.getByText("a–z, 0–9, hyphens only")).toBeInTheDocument();
    });

    it("shows error for username with special characters", async () => {
      render(<ProfileForm tz="UTC" />);
      const input = screen.getByPlaceholderText("your-username");

      fireEvent.change(input, { target: { value: "user name!" } });

      await act(async () => {
        vi.advanceTimersByTime(450);
      });

      expect(screen.getByText("a–z, 0–9, hyphens only")).toBeInTheDocument();
    });

    it("does not show error before debounce fires", async () => {
      render(<ProfileForm tz="UTC" />);
      const input = screen.getByPlaceholderText("your-username");

      fireEvent.change(input, { target: { value: "ab" } });

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByText("a–z, 0–9, hyphens only")).not.toBeInTheDocument();
    });

    it("skips debounce when username matches saved prop", async () => {
      render(<ProfileForm un="saved-user" tz="UTC" />);
      const input = screen.getByDisplayValue("saved-user");

      fireEvent.change(input, { target: { value: "saved-user" } });

      expect(screen.queryByText("a–z, 0–9, hyphens only")).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    it("calls axios.put with username and timezone on submit", async () => {
      mockAxiosPut.mockResolvedValue({ status: 200 });
      render(<ProfileForm un="test-user" tz="Europe/Kyiv" />);

      await act(async () => {
        fireEvent.submit(
          screen.getByRole("button", { name: "Save profile" }).closest("form")!
        );
      });

      expect(mockAxiosPut).toHaveBeenCalledWith("/api/profile", {
        username: "test-user",
        timezone: "Europe/Kyiv",
      });
    });

    it("shows success toast on 200 response", async () => {
      mockAxiosPut.mockResolvedValue({ status: 200 });
      render(<ProfileForm un="test-user" tz="UTC" />);

      await act(async () => {
        fireEvent.submit(
          screen.getByRole("button", { name: "Save profile" }).closest("form")!
        );
      });

      expect(toast.success).toHaveBeenCalledWith("Profile saved!");
    });

    it("shows error toast when axios throws AxiosError with string message", async () => {
      const axiosError = { response: { data: "Username taken" }, isAxiosError: true };
      mockAxiosPut.mockRejectedValue(axiosError);
      mockAxiosIsAxiosError.mockReturnValue(true);

      render(<ProfileForm un="test-user" tz="UTC" />);

      await act(async () => {
        fireEvent.submit(
          screen.getByRole("button", { name: "Save profile" }).closest("form")!
        );
      });

      expect(toast.error).toHaveBeenCalledWith("Username taken");
    });

    it("shows generic error toast for unknown errors", async () => {
      mockAxiosPut.mockRejectedValue(new Error("Network"));
      mockAxiosIsAxiosError.mockReturnValue(false);

      render(<ProfileForm un="test-user" tz="UTC" />);

      await act(async () => {
        fireEvent.submit(
          screen.getByRole("button", { name: "Save profile" }).closest("form")!
        );
      });

      expect(toast.error).toHaveBeenCalledWith("An unknown error occurred.");
    });
  });
});
