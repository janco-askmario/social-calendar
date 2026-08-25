export function CalendarSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 py-6">
      <div className="mx-auto flex flex-col lg:flex-row gap-5">
        <aside className="w-full lg:w-72 shrink-0 bg-panel rounded-[38px] border border-black/5 shadow-sm p-6 flex flex-col gap-8 h-fit">
          <div className="skeleton h-7 w-28 rounded-lg" />
          <div className="flex flex-col gap-3">
            <div className="skeleton h-4 w-20 rounded-md" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-14 rounded-2xl" />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="skeleton h-4 w-16 rounded-md" />
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-7 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="skeleton h-4 w-24 rounded-md" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-panel rounded-[38px] border border-black/5 shadow-sm p-6 min-w-0">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="skeleton h-7 w-48 rounded-lg" />
              <div className="skeleton h-8 w-40 rounded-full" />
            </div>
            <div className="skeleton h-10 w-32 rounded-full" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="skeleton h-8 w-28 rounded-full" />
            <div className="skeleton h-6 w-32 rounded-lg" />
            <div className="skeleton h-10 w-24 rounded-full" />
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="skeleton h-4 rounded mx-auto w-8" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl min-h-[100px]" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
