import CopyButton from "@/app/components/CopyButton";
import { StaggerItem, StaggerList } from "@/app/components/ui/FadeIn";
import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";
import { Clock, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const ACCENT_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

async function EventTypesList() {
  await connectToDB();
  const email = await getSessionEmailFromCookies();
  const eventTypes = await EventTypeModel.find({ email });
  const profileDoc = await ProfileModel.findOne({ email });
  const baseUrl = process.env.NEXT_PUBLIC_URL as string;

  if (eventTypes.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <p className="text-gray-400 text-sm">No event types yet. Create your first one.</p>
      </div>
    );
  }

  return (
    <StaggerList className="flex flex-col gap-3">
      {eventTypes.map((et, index) => {
        const publicUrl = `${baseUrl}/${profileDoc?.username}/${et.uri}`;
        const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
        return (
          <StaggerItem key={et.id}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-stretch overflow-hidden hover:shadow-md transition-shadow">
              <div className={`w-1.5 flex-shrink-0 ${accent}`} />
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{et.title}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      {et.length} min
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/event-types/edit/${et.id}`}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </Link>
                </div>
                <div className="flex items-center gap-1 mt-3 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500 truncate flex-1">{publicUrl}</span>
                  <CopyButton text={publicUrl} />
                </div>
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerList>
  );
}

function EventTypesListSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-stretch overflow-hidden">
          <div className="w-1.5 flex-shrink-0 bg-gray-200" />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="h-5 bg-gray-200 rounded w-36 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
              <div className="h-8 bg-gray-100 rounded-lg w-16" />
            </div>
            <div className="h-8 bg-gray-50 rounded-lg mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventTypesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your bookable event types</p>
        </div>
        {/* Desktop button */}
        <Link href="/dashboard/event-types/new" className="btn btn-primary hidden sm:flex">
          <Plus size={16} />
          New event type
        </Link>
      </div>
      <Suspense fallback={<EventTypesListSkeleton />}>
        <EventTypesList />
      </Suspense>

      {/* Mobile FAB */}
      <Link
        href="/dashboard/event-types/new"
        aria-label="New event type"
        className="sm:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.45)] flex items-center justify-center transition-all"
      >
        <Plus size={24} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
