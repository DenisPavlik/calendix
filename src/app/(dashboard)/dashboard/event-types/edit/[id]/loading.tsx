export default function EditEventTypeLoading() {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="shimmer h-6 rounded w-44 mb-6" />
        <div className="flex flex-col gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="shimmer h-4 rounded w-24 mb-2" />
              <div className="shimmer h-10 rounded-lg w-full" />
            </div>
          ))}
          <div>
            <div className="shimmer h-4 rounded w-28 mb-2" />
            <div className="shimmer h-24 rounded-lg w-full" />
          </div>
          <div className="flex gap-3 mt-2">
            <div className="shimmer h-10 rounded-lg w-24" />
            <div className="shimmer h-10 rounded-lg w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
