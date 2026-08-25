const COLUMN_CARD_COUNTS = [3, 2, 4, 1];

export function BoardDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-10 py-6">
      <div className="mx-auto flex flex-col gap-5">
        <div className="bg-panel rounded-[38px] border border-black/5 shadow-sm p-6 min-w-0">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="skeleton h-7 w-48 rounded-lg" />
              <div className="skeleton h-8 w-40 rounded-full" />
            </div>
            <div className="skeleton h-10 w-10 rounded-full" />
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="skeleton h-4 w-14 rounded" />
            <div className="skeleton h-5 w-40 rounded-lg" />
          </div>

          <div className="flex gap-3 overflow-x-hidden pb-3 items-start">
            {COLUMN_CARD_COUNTS.map((count, colIndex) => (
              <div key={colIndex} className="w-72 shrink-0 rounded-2xl bg-black/[0.025] border border-black/5 p-2">
                <div className="flex justify-center pt-1.5 pb-0.5">
                  <div className="skeleton h-1 w-9 rounded-full" />
                </div>
                <div className="px-1 pt-1 pb-2">
                  <div className="skeleton h-4 w-24 rounded" />
                </div>
                <div className="flex flex-col gap-2">
                  {Array.from({ length: count }).map((_, cardIndex) => (
                    <div key={cardIndex} className="skeleton rounded-xl h-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
