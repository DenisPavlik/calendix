import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

vi.mock("axios");
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import CancelBookingButton from "@/app/components/CancelBookingButton";
import axios from "axios";
import toast from "react-hot-toast";

const mockAxiosDelete = vi.mocked(axios.delete);

describe("CancelBookingButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'Cancel booking' button", () => {
    render(<CancelBookingButton bookingId="abc123" />);
    expect(screen.getByText("Cancel booking")).toBeInTheDocument();
  });

  it("opens modal when 'Cancel booking' is clicked", () => {
    render(<CancelBookingButton bookingId="abc123" />);
    fireEvent.click(screen.getByText("Cancel booking"));
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  it("closes modal when 'Keep it' is clicked", () => {
    render(<CancelBookingButton bookingId="abc123" />);
    fireEvent.click(screen.getByText("Cancel booking"));
    fireEvent.click(screen.getByText("Keep it"));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  it("renders modal content with confirm and cancel buttons", () => {
    render(<CancelBookingButton bookingId="abc123" />);
    expect(screen.getByText("Cancel this booking?")).toBeInTheDocument();
    expect(screen.getByText("Keep it")).toBeInTheDocument();
    expect(screen.getByText("Yes, cancel")).toBeInTheDocument();
  });

  it("calls DELETE /api/bookings/:id on confirm", async () => {
    mockAxiosDelete.mockResolvedValue({});
    render(<CancelBookingButton bookingId="booking-999" />);

    fireEvent.click(screen.getByText("Cancel booking"));
    await act(async () => {
      fireEvent.click(screen.getByText("Yes, cancel"));
    });

    expect(mockAxiosDelete).toHaveBeenCalledWith("/api/bookings/booking-999");
  });

  it("shows success toast on successful cancellation", async () => {
    mockAxiosDelete.mockResolvedValue({});
    render(<CancelBookingButton bookingId="abc123" />);

    fireEvent.click(screen.getByText("Cancel booking"));
    await act(async () => {
      fireEvent.click(screen.getByText("Yes, cancel"));
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Booking cancelled");
    });
  });

  it("shows error toast on failed cancellation", async () => {
    mockAxiosDelete.mockRejectedValue(new Error("Network error"));
    render(<CancelBookingButton bookingId="abc123" />);

    fireEvent.click(screen.getByText("Cancel booking"));
    await act(async () => {
      fireEvent.click(screen.getByText("Yes, cancel"));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to cancel booking");
    });
  });

  it("shows loading state while request is pending", async () => {
    let resolveDelete!: () => void;
    mockAxiosDelete.mockReturnValue(
      new Promise((res) => { resolveDelete = () => res({}); })
    );

    render(<CancelBookingButton bookingId="abc123" />);
    fireEvent.click(screen.getByText("Cancel booking"));

    act(() => {
      fireEvent.click(screen.getByText("Yes, cancel"));
    });

    expect(screen.getByText("Cancelling…")).toBeInTheDocument();

    await act(async () => { resolveDelete(); });
  });

  it("disables buttons while loading", async () => {
    let resolveDelete!: () => void;
    mockAxiosDelete.mockReturnValue(
      new Promise((res) => { resolveDelete = () => res({}); })
    );

    render(<CancelBookingButton bookingId="abc123" />);
    fireEvent.click(screen.getByText("Cancel booking"));

    act(() => {
      fireEvent.click(screen.getByText("Yes, cancel"));
    });

    expect(screen.getByText("Keep it")).toBeDisabled();
    expect(screen.getByText("Cancelling…")).toBeDisabled();

    await act(async () => { resolveDelete(); });
  });
});
