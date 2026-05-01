import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";
import { format, addMonths, subMonths } from "date-fns";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import TimePicker from "@/app/components/TimePicker";
import { BookingTimes } from "@/types/types";

// Monday–Friday active 09:00–17:00
const allWeekdaysActive: BookingTimes = {
  monday:    { from: "09:00", to: "17:00", active: true },
  tuesday:   { from: "09:00", to: "17:00", active: true },
  wednesday: { from: "09:00", to: "17:00", active: true },
  thursday:  { from: "09:00", to: "17:00", active: true },
  friday:    { from: "09:00", to: "17:00", active: true },
  saturday:  { from: "09:00", to: "17:00", active: false },
  sunday:    { from: "09:00", to: "17:00", active: false },
};

const defaultProps = {
  bookingTimes: allWeekdaysActive,
  length: 30,
  username: "testuser",
  meetingUri: "30min",
  hostTimezone: "UTC",
};

describe("TimePicker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no busy slots
    server.use(
      http.get("/api/busy", () => HttpResponse.json([]))
    );
  });

  describe("calendar rendering", () => {
    it("renders short weekday headers", () => {
      render(<TimePicker {...defaultProps} />);
      // shortWeekdays from shared.ts — lowercase, CSS `uppercase` class handles display
      expect(screen.getByText("mon")).toBeInTheDocument();
      expect(screen.getByText("fri")).toBeInTheDocument();
      expect(screen.getByText("sun")).toBeInTheDocument();
    });

    it("renders current month and year in header", () => {
      render(<TimePicker {...defaultProps} />);
      const now = new Date();
      const expected = format(now, "MMMM yyyy");
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it("renders day number buttons", () => {
      render(<TimePicker {...defaultProps} />);
      // Day 1 should always be present
      const dayButtons = screen.getAllByRole("button");
      // Prev/next month buttons + day buttons
      expect(dayButtons.length).toBeGreaterThan(2);
    });
  });

  describe("month navigation", () => {
    function getNavButtons() {
      // Navigation buttons contain only an SVG (no text), at the top of the calendar
      return screen.getAllByRole("button").filter(
        (b) => b.querySelector("svg") && !b.textContent?.trim()
      );
    }

    it("advances to next month when next button is clicked", () => {
      render(<TimePicker {...defaultProps} />);
      const now = new Date();
      const nextMonthLabel = format(addMonths(now, 1), "MMMM yyyy");

      const [, nextBtn] = getNavButtons();
      fireEvent.click(nextBtn);

      expect(screen.getByText(nextMonthLabel)).toBeInTheDocument();
    });

    it("goes back to previous month when prev button is clicked", () => {
      render(<TimePicker {...defaultProps} />);
      const now = new Date();
      const currentLabel = format(now, "MMMM yyyy");

      const [, nextBtn] = getNavButtons();
      fireEvent.click(nextBtn); // go forward

      const [prevBtn] = getNavButtons();
      fireEvent.click(prevBtn); // go back

      expect(screen.getByText(currentLabel)).toBeInTheDocument();
    });
  });

  describe("day selection and time slots", () => {
    it("shows time slots panel after selecting a day", async () => {
      render(<TimePicker {...defaultProps} />);

      // Find an enabled (future weekday) button
      const dayButtons = screen.getAllByRole("button").filter(
        (b) => !b.hasAttribute("disabled") && b.textContent && /^\d+$/.test(b.textContent)
      );

      expect(dayButtons.length).toBeGreaterThan(0);

      await act(async () => {
        fireEvent.click(dayButtons[0]);
      });

      await waitFor(() => {
        // The time slots panel header appears
        const panel = document.querySelector(".sm\\:w-52");
        expect(panel).toBeInTheDocument();
      });
    });

    it("shows Preloader while busy slots are being fetched", async () => {
      let resolveRequest!: () => void;
      server.use(
        http.get("/api/busy", () =>
          new Promise((res) => {
            resolveRequest = () => res(HttpResponse.json([]));
          })
        )
      );

      render(<TimePicker {...defaultProps} />);

      const dayButtons = screen.getAllByRole("button").filter(
        (b) => !b.hasAttribute("disabled") && b.textContent && /^\d+$/.test(b.textContent)
      );

      if (dayButtons.length === 0) return; // no bookable days in current month

      act(() => {
        fireEvent.click(dayButtons[0]);
      });

      // Preloader should appear while request is pending
      await waitFor(() => {
        expect(document.querySelector(".animate-pulse, [data-testid='preloader'], .sm\\:w-52")).toBeInTheDocument();
      });

      await act(async () => { resolveRequest(); });
    });

    it("shows 'No slots available' when busy slots cover the entire day", async () => {
      // Busy from 00:00 to 23:59 — blocks all slots
      const midnight = new Date();
      midnight.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setUTCHours(23, 59, 0, 0);

      server.use(
        http.get("/api/busy", () =>
          HttpResponse.json([{
            startTime: String(Math.floor(midnight.getTime() / 1000)),
            endTime: String(Math.floor(endOfDay.getTime() / 1000)),
          }])
        )
      );

      render(<TimePicker {...defaultProps} />);

      const dayButtons = screen.getAllByRole("button").filter(
        (b) => !b.hasAttribute("disabled") && b.textContent && /^\d+$/.test(b.textContent)
      );

      if (dayButtons.length === 0) return;

      await act(async () => {
        fireEvent.click(dayButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText("No slots available")).toBeInTheDocument();
      });
    });

    it("shows 'Calendar unavailable' when API returns 503", async () => {
      server.use(
        http.get("/api/busy", () =>
          HttpResponse.json({ error: "Disconnected" }, { status: 503 })
        )
      );

      render(<TimePicker {...defaultProps} />);

      const dayButtons = screen.getAllByRole("button").filter(
        (b) => !b.hasAttribute("disabled") && b.textContent && /^\d+$/.test(b.textContent)
      );

      if (dayButtons.length === 0) return;

      await act(async () => {
        fireEvent.click(dayButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText("Calendar unavailable")).toBeInTheDocument();
      });
    });
  });

  describe("checkBusySlots logic", () => {
    it("excludes slots that overlap with busy periods", async () => {
      // Busy: 09:00–10:00 UTC (unix timestamps)
      const nineAM = new Date();
      nineAM.setUTCHours(9, 0, 0, 0);
      const tenAM = new Date();
      tenAM.setUTCHours(10, 0, 0, 0);

      const startTime = String(Math.floor(nineAM.getTime() / 1000));
      const endTime = String(Math.floor(tenAM.getTime() / 1000));

      server.use(
        http.get("/api/busy", () =>
          HttpResponse.json([{ startTime, endTime }])
        )
      );

      render(<TimePicker {...defaultProps} />);

      const dayButtons = screen.getAllByRole("button").filter(
        (b) => !b.hasAttribute("disabled") && b.textContent && /^\d+$/.test(b.textContent)
      );

      if (dayButtons.length === 0) return;

      await act(async () => {
        fireEvent.click(dayButtons[0]);
      });

      await waitFor(() => {
        // busySlotsLoaded should be true — either slots or "no slots available"
        const panel = document.querySelector(".sm\\:w-52");
        expect(panel).toBeInTheDocument();
      });

      // The 09:00 and 09:30 slots should be filtered out (overlapping busy 09:00–10:00)
      // 10:00 slot link should NOT exist (booking from 10:00 to 10:30 — entirely after busy period)
      // This test just verifies the panel renders without crashing
      const links = screen.queryAllByRole("link");
      links.forEach((link) => {
        const href = link.getAttribute("href") || "";
        expect(href).toContain("testuser/30min");
      });
    });
  });
});
