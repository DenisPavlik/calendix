import { describe, it, expect } from "vitest";
import { WeekdaysNames, shortWeekdays } from "@/libs/shared";

describe("WeekdaysNames", () => {
  it("contains exactly 7 days", () => {
    expect(WeekdaysNames).toHaveLength(7);
  });

  it("starts with Monday and ends with Sunday (ISO week order)", () => {
    expect(WeekdaysNames[0]).toBe("monday");
    expect(WeekdaysNames[6]).toBe("sunday");
  });

  it("contains all weekdays in lowercase", () => {
    const expected = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    expect(WeekdaysNames).toEqual(expected);
  });
});

describe("shortWeekdays", () => {
  it("contains exactly 7 entries", () => {
    expect(shortWeekdays).toHaveLength(7);
  });

  it("each entry is exactly 3 characters", () => {
    for (const abbr of shortWeekdays) {
      expect(abbr).toHaveLength(3);
    }
  });

  it("aligns positionally with WeekdaysNames", () => {
    expect(shortWeekdays[0]).toBe("mon");
    expect(shortWeekdays[6]).toBe("sun");
    for (let i = 0; i < 7; i++) {
      expect(WeekdaysNames[i].startsWith(shortWeekdays[i])).toBe(true);
    }
  });
});
