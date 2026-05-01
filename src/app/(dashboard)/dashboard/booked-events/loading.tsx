function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="shimmer h-5 rounded-full w-16" />
            <div className="shimmer h-4 rounded w-20" />
          </div>
          <div className="shimmer h-5 rounded w-48 mb-2" />
          <div className="shimmer h-4 rounded w-32" />
        </div>
        <div className="text-right flex-shrink-0">
          <div className="shimmer h-4 rounded w-24 mb-1" />
          <div className="shimmer h-7 rounded w-16 mb-1" />
          <div className="shimmer h-3 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export default function BookedEventsLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="shimmer h-7 rounded w-40 mb-1" />
        <div className="shimmer h-4 rounded w-32" />
      </div>
      <div className="flex flex-col gap-8">
        <section>
          <div className="shimmer h-3 rounded w-20 mb-3" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <BookingCardSkeleton key={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
