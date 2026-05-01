import dynamic from "next/dynamic";

const EventTypeForm = dynamic(() => import("@/app/components/EventTypeForm"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="h-6 bg-gray-200 rounded w-40 mb-6" />
      <div className="flex flex-col gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
        ))}
        <div className="h-10 bg-gray-200 rounded-lg w-28 mt-2" />
      </div>
    </div>
  ),
});

export default function NewEventTypePage() {
  return (
    <div>
      <EventTypeForm />
    </div>
  );
}