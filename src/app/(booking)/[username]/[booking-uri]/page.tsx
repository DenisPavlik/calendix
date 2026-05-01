import { connectToDB } from "@/libs/connectToDB";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const TimePicker = dynamic(() => import("@/app/components/TimePicker"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse flex flex-col gap-3 p-4">
      <div className="h-8 bg-gray-200 rounded w-40" />
      <div className="grid grid-cols-3 gap-2 mt-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg" />
        ))}
      </div>
    </div>
  ),
});
import { EventTypeModel } from "@/models/EventType";
import { ProfileModel } from "@/models/Profile";

type PageProps = {
  params: {
    username: string;
    "booking-uri": string;
  };
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  await connectToDB();
  const profileDoc = await ProfileModel.findOne({ username: props.params.username });
  const etDoc = profileDoc
    ? await EventTypeModel.findOne({ email: profileDoc.email, uri: props.params["booking-uri"] })
    : null;

  const title = etDoc
    ? `${etDoc.title} with @${props.params.username} — Calendix`
    : "Book a meeting — Calendix";
  const description = etDoc?.description || "Pick a time that works for you.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Calendix" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BookingPage(props: PageProps) {
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
  return (
    <TimePicker
      bookingTimes={JSON.parse(JSON.stringify(etDoc?.bookingTimes))}
      length={etDoc.length}
      username={props.params.username}
      meetingUri={etDoc.uri}
      hostTimezone={profileDoc.timezone || "UTC"}
    />
  );
}
