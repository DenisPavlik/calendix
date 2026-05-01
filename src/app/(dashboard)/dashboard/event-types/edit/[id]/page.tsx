import { connectToDB } from "@/libs/connectToDB";
import dynamic from "next/dynamic";

const EventTypeForm = dynamic(() => import("@/app/components/EventTypeForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="h-6 bg-gray-200 rounded w-44 mb-6" />
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
        ))}
        <div className="flex gap-3 mt-2">
          <div className="h-10 bg-gray-200 rounded-lg w-24" />
          <div className="h-10 bg-red-100 rounded-lg w-24" />
        </div>
      </div>
    </div>
  ),
});
import { getSessionEmailFromCookies } from "@/libs/getSessionEmail";
// import { session } from "@/libs/session";
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function EditEventTypePage({ params }: PageProps) {
  await connectToDB();
  const email = await getSessionEmailFromCookies();
  const eventtypeDoc = await EventTypeModel.findById(params.id);
  const profileDoc = await ProfileModel.findOne({ email });
  if (eventtypeDoc) {
    return (
      <div>
        <EventTypeForm
          username={profileDoc?.username || ""}
          doc={JSON.parse(JSON.stringify(eventtypeDoc))}
        />
      </div>
    );
  } else {
    return <div>Event by id:{params.id} not found</div>;
  }
}
