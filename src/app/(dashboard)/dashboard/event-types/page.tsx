"use server";

import CopyButton from "@/app/components/CopyButton";
import { connectToDB } from "@/libs/connectToDB";
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";
import { Clock, Pencil, Plus } from "lucide-react";
import Link from "next/link";

const ACCENT_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

export default async function EventTypesPage() {
  await connectToDB();
  const email = await getSessionEmailFromCookies();
  const eventTypes = await EventTypeModel.find({ email });
  const profileDoc = await ProfileModel.findOne({ email });
  const baseUrl = process.env.NEXT_PUBLIC_URL as string;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Types</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your bookable event types</p>
        </div>
        <Link
          href="/dashboard/event-types/new"
          className="btn btn-primary"
        >
          <Plus size={16} />
          New event type
        </Link>
      </div>

      {eventTypes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400 text-sm">No event types yet. Create your first one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {eventTypes.map((et, index) => {
            const publicUrl = `${baseUrl}/${profileDoc?.username}/${et.uri}`;
            const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
            return (
              <div
                key={et.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-stretch overflow-hidden hover:shadow-md transition-shadow"
              >
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
            );
          })}
        </div>
      )}
    </div>
  );
}
