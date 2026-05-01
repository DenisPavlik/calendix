export default function DashboardLoading() {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="shimmer h-5 rounded w-32 mb-6" />
        <div className="flex flex-col gap-4">
          <div>
            <div className="shimmer h-4 rounded w-24 mb-2" />
            <div className="shimmer h-10 rounded-lg w-full" />
          </div>
          <div>
            <div className="shimmer h-4 rounded w-28 mb-2" />
            <div className="shimmer h-10 rounded-lg w-full" />
          </div>
          <div className="shimmer h-10 rounded-lg w-28 mt-2" />
        </div>
      </div>
    </div>
  );
}
