"use client";
import { shortWeekdays } from "@/libs/shared";
import { BookingTimes, WeekdayName } from "@/types/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addDays,
  addMinutes,
  addMonths,
  endOfDay,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  isFuture,
  isLastDayOfMonth,
  isToday,
  startOfDay,
  subMonths,
} from "date-fns";
import clsx from "clsx";
import Link from "next/link";
import axios from "axios";
import { TimeSlot } from "nylas";
import Preloader from "./Preloader";

export default function TimePicker({
  bookingTimes,
  length,
  username,
  meetingUri,
}: {
  bookingTimes: BookingTimes;
  length: number;
  username: string;
  meetingUri: string;
}) {
  const currentDate = new Date();
  const [activeMonthDate, setActiveMonthDate] = useState(currentDate);
  const [activeYear, setActiveYear] = useState(activeMonthDate.getFullYear());
  const [activeMonthIndex, setActiveMonthIndex] = useState(
    activeMonthDate.getMonth()
  );
  const [selectedDay, setSelectedDay] = useState<null | Date>(null);
  const [busySlots, setBusySlots] = useState<TimeSlot[]>([]);
  const [busySlotsLoaded, setBusySlotsLoaded] = useState(false);
  const [calendarDisconnected, setCalendarDisconnected] = useState(false);

  useEffect(() => {
    if (selectedDay) {
      setBusySlots([]);
      setBusySlotsLoaded(false);
      setCalendarDisconnected(false);
      const params = new URLSearchParams();
      params.set("username", username);
      params.set("from", startOfDay(selectedDay).toISOString());
      params.set("to", endOfDay(selectedDay).toISOString());
      axios.get("/api/busy?" + params.toString())
        .then((response) => {
          setBusySlots(response.data);
          setBusySlotsLoaded(true);
        })
        .catch((err) => {
          if (axios.isAxiosError(err) && err.response?.status === 503) {
            setCalendarDisconnected(true);
          }
          setBusySlotsLoaded(true);
        });
    }
  }, [selectedDay, username]);

  function checkBusySlots(time: Date) {
    const bookingFrom = time;
    const bookingTo = addMinutes(new Date(time), length);
    for (const busySlot of busySlots) {
      const busyFrom = new Date(parseInt(busySlot.startTime) * 1000);
      const busyTo = new Date(parseInt(busySlot.endTime) * 1000);
      if (isAfter(bookingTo, busyFrom) && isBefore(bookingTo, busyTo)) return true;
      if (isAfter(bookingFrom, busyFrom) && isBefore(bookingFrom, busyTo)) return true;
      if (isEqual(bookingFrom, busyFrom)) return true;
      if (isEqual(bookingFrom, busyTo)) return true;
    }
    return false;
  }

  const firstDayOfCurrentMonth = new Date(activeYear, activeMonthIndex, 1);
  const firstDayOfCurrentMonthWeekdayIndex = getDay(firstDayOfCurrentMonth);
  const emptyDaysCount =
    firstDayOfCurrentMonthWeekdayIndex === 0
      ? 6
      : firstDayOfCurrentMonthWeekdayIndex - 1;

  const emptyDaysArr = new Array(emptyDaysCount).fill("", 0, emptyDaysCount);

  const daysNumbers = [firstDayOfCurrentMonth];
  do {
    const lastAddedDay = daysNumbers[daysNumbers.length - 1];
    daysNumbers.push(addDays(lastAddedDay, 1));
  } while (!isLastDayOfMonth(daysNumbers[daysNumbers.length - 1]));

  const bookingHours: Date[] = [];
  let selectedDayConfig = null;
  if (selectedDay) {
    const weekdayNameIndex = format(selectedDay, "EEEE").toLowerCase() as WeekdayName;
    selectedDayConfig = bookingTimes?.[weekdayNameIndex];

    if (selectedDayConfig) {
      const [hoursFrom, minutesFrom] = selectedDayConfig.from.split(":");
      const [hoursTo, minutesTo] = selectedDayConfig.to.split(":");

      const selectedDayFrom = new Date(selectedDay);
      selectedDayFrom.setHours(parseInt(hoursFrom));
      selectedDayFrom.setMinutes(parseInt(minutesFrom));

      const selectedDayTo = new Date(selectedDay);
      selectedDayTo.setHours(parseInt(hoursTo));
      selectedDayTo.setMinutes(parseInt(minutesTo));

      let a = selectedDayFrom;
      do {
        if (!checkBusySlots(a)) bookingHours.push(a);
        a = addMinutes(a, 30);
      } while (isBefore(addMinutes(a, length), selectedDayTo));
    }
  }

  function prevMonth() {
    setActiveMonthDate((prev) => {
      const next = subMonths(prev, 1);
      setActiveYear(next.getFullYear());
      setActiveMonthIndex(next.getMonth());
      return next;
    });
  }

  function nextMonth() {
    setActiveMonthDate((prev) => {
      const next = addMonths(prev, 1);
      setActiveYear(next.getFullYear());
      setActiveMonthIndex(next.getMonth());
      return next;
    });
  }

  return (
    <div className="flex flex-col sm:flex-row">
      {/* Calendar */}
      <div className="p-6 sm:p-8 flex-1">
        <div className="flex items-center mb-4">
          <span className="grow font-semibold text-gray-900">
            {format(new Date(activeYear, activeMonthIndex, 1), "MMMM yyyy")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {shortWeekdays.map((weekday, index) => (
            <div
              key={index}
              className="text-center text-xs uppercase text-gray-400 font-semibold pb-2"
            >
              {weekday}
            </div>
          ))}
          {emptyDaysArr.map((_, index) => (
            <div key={index} />
          ))}
          {daysNumbers.map((n, index) => {
            const weekdayNameIndex = format(n, "EEEE").toLocaleLowerCase() as WeekdayName;
            const weekDayConfig = bookingTimes?.[weekdayNameIndex];
            const isActiveInBookingTimes = weekDayConfig?.active;
            const canBeBooked = isFuture(n) && isActiveInBookingTimes;
            const isSelected = selectedDay && isEqual(n, selectedDay);
            const today = isToday(n);

            return (
              <div key={index} className="flex justify-center py-0.5">
                <button
                  disabled={!canBeBooked}
                  onClick={() => setSelectedDay(n)}
                  className={clsx(
                    "w-9 h-9 rounded-full text-sm font-medium transition-all duration-150",
                    !canBeBooked && "text-gray-300 cursor-not-allowed",
                    canBeBooked && !isSelected && !today &&
                      "text-blue-700 hover:bg-blue-100",
                    today && !isSelected &&
                      "bg-gray-100 text-gray-700 hover:bg-gray-200",
                    isSelected &&
                      "bg-blue-600 text-white shadow-md"
                  )}
                >
                  {format(n, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time slots panel */}
      {selectedDay && (
        <div className="sm:w-52 border-t sm:border-t-0 sm:border-l border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            {format(selectedDay, "EEE, MMM d")}
          </p>
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
            {!busySlotsLoaded && <Preloader />}
            {busySlotsLoaded && calendarDisconnected && (
              <p className="text-sm text-amber-600 text-center py-4">
                Calendar unavailable
              </p>
            )}
            {busySlotsLoaded && !calendarDisconnected && bookingHours.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No slots available
              </p>
            )}
            {busySlotsLoaded && !calendarDisconnected &&
              bookingHours.map((bookingTime, index) => (
                <Link
                  key={index}
                  href={`/${username}/${meetingUri}/${bookingTime.toISOString()}?length=${length}`}
                  className="block text-center px-4 py-2.5 rounded-lg border-2 border-blue-600
                    text-blue-600 text-sm font-semibold
                    hover:bg-blue-600 hover:text-white transition-colors duration-200"
                >
                  {format(bookingTime, "HH:mm")}
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
