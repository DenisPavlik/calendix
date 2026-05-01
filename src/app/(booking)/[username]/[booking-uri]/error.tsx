"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={36} className="text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Could not load booking page</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="btn btn-secondary flex items-center gap-2"
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </div>
  );
}
