function EventTypeCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-stretch overflow-hidden">
      <div className="w-1.5 flex-shrink-0 shimmer" />
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="shimmer h-5 rounded w-36 mb-2" />
            <div className="shimmer h-4 rounded w-16" />
          </div>
          <div className="shimmer h-8 rounded-lg w-16" />
        </div>
        <div className="shimmer h-8 rounded-lg mt-3" />
      </div>
    </div>
  );
}

export default function EventTypesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="shimmer h-7 rounded w-32 mb-1" />
          <div className="shimmer h-4 rounded w-48" />
        </div>
        <div className="shimmer h-9 rounded-lg w-36" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => <EventTypeCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
