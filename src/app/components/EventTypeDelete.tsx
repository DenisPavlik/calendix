"use client";

import axios from "axios";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventTypeDelete({ id }: { id: string | undefined }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    await axios.delete("/api/event-types?id=" + id);
    router.push("/dashboard/event-types");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-outline text-red-500 hover:border-red-300 hover:bg-red-50"
        onClick={() => setShowConfirmation(true)}
      >
        <Trash2 size={15} />
        Delete
      </button>

      {showConfirmation && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowConfirmation(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Delete event type?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. All future bookings for this event type will be lost.
            </p>
            <div className="flex gap-3">
              <button
                className="btn btn-outline flex-1 justify-center"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-1 justify-center bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
