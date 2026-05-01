import { ReactNode } from "react";
import { connectToDB } from "@/libs/connectToDB";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";
import { Clock, Info, Video } from "lucide-react";

type LayoutProps = {
  children: ReactNode;
  params: {
    username: string;
    "booking-uri": string;
  };
};

export default async function BookingBoxLayout(props: LayoutProps) {
  await connectToDB();
  const profileDoc = await ProfileModel.findOne({
    username: props.params.username,
  });
  if (!profileDoc) {
    return "404 P";
  }
  const etDoc = await EventTypeModel.findOne({
    email: profileDoc.email,
    uri: props.params["booking-uri"],
  });
  if (!etDoc) {
    return "404 ET";
  }

  const initial = etDoc.title?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{
        background:
          "radial-gradient(ellipse at top left, #f0a8d8 0%, transparent 50%), " +
          "radial-gradient(ellipse at top right, #93c5fd 0%, transparent 50%), " +
          "radial-gradient(ellipse at bottom center, #c4b5fd 0%, transparent 60%), " +
          "#f5f0ff",
      }}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Left info panel */}
          <div className="sm:w-80 shrink-0 bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-200 p-8 flex flex-col gap-5">
            <div>
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md">
                {initial}
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                @{props.params.username}
              </p>
              <h1 className="text-2xl font-bold text-gray-900 leading-snug">
                {etDoc.title}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 shrink-0 text-blue-500" />
              <span className="text-sm font-medium">{etDoc.length} min</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Video className="w-4 h-4 shrink-0 text-blue-500" />
              <span className="text-sm">Google Meet</span>
            </div>

            {etDoc.description && (
              <div className="flex gap-2 text-gray-500">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <p className="text-sm leading-relaxed">{etDoc.description}</p>
              </div>
            )}
          </div>

          {/* Right content panel */}
          <div className="flex-1 min-w-0 overflow-auto">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}
