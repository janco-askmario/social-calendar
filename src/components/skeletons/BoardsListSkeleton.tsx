export function BoardsListSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 py-6">
      <div className="mx-auto bg-panel rounded-[38px] border border-black/5 shadow-sm p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="skeleton h-7 w-48 rounded-lg" />
            <div className="skeleton h-8 w-40 rounded-full" />
          </div>
          <div className="skeleton h-10 w-10 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="skeleton h-6 w-20 rounded-lg" />
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-[26px] border border-black/5 bg-white p-5">
              <div className="skeleton h-20 rounded-2xl mb-4" />
              <div className="skeleton h-4 w-2/3 rounded mb-2" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
