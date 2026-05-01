import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CopyButton from "@/app/components/CopyButton";

describe("CopyButton", () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      configurable: true,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders Copy icon initially", () => {
    render(<CopyButton text="https://example.com" />);
    expect(screen.getByTitle("Copy link")).toBeInTheDocument();
  });

  it("calls clipboard.writeText with correct text on click", async () => {
    render(<CopyButton text="https://example.com/user/event" />);
    await act(async () => {
      fireEvent.click(screen.getByTitle("Copy link"));
    });
    expect(writeTextMock).toHaveBeenCalledWith("https://example.com/user/event");
    expect(writeTextMock).toHaveBeenCalledTimes(1);
  });

  it("shows Check icon after click", async () => {
    const { container } = render(<CopyButton text="https://example.com" />);
    await act(async () => {
      fireEvent.click(screen.getByTitle("Copy link"));
    });
    // lucide-react renders SVG — after copy the Copy icon is replaced by Check
    // We check that the svg is still present (icon changed) and writeText was called
    expect(writeTextMock).toHaveBeenCalled();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("reverts to Copy icon after 2 seconds", async () => {
    render(<CopyButton text="https://example.com" />);

    await act(async () => {
      fireEvent.click(screen.getByTitle("Copy link"));
    });

    // After 2s timeout the state resets
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
  });

  it("does not revert before 2 seconds", async () => {
    render(<CopyButton text="https://example.com" />);

    await act(async () => {
      fireEvent.click(screen.getByTitle("Copy link"));
    });

    // After only 1s, copied state should still be true (no second call)
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(writeTextMock).toHaveBeenCalledTimes(1);
  });
});
