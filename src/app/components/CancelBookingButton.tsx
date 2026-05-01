"use client";

import axios from "axios";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CalendarX2 } from "lucide-react";

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openModal() {
    dialogRef.current?.showModal();
  }

  function closeModal() {
    if (loading) return;
    dialogRef.current?.close();
  }

  async function handleCancel() {
    setLoading(true);
    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      dialogRef.current?.close();
      toast.success("Booking cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="mt-3 text-xs font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
      >
        Cancel booking
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        className="rounded-2xl p-0 shadow-2xl backdrop:bg-black/50 w-[calc(100%-2rem)] max-w-sm"
      >
        <div className="p-7 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <CalendarX2 size={26} className="text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">Cancel this booking?</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-7">
            The guest will receive a cancellation notice from Google Calendar.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={closeModal}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Keep it
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Cancelling…" : "Yes, cancel"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
