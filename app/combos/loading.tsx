export default function CombosLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <header className="py-6 flex items-center justify-between">
        <div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-20 bg-orange-200 rounded-full animate-pulse" />
      </header>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-3">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="px-3 pb-3 grid grid-cols-[48%_1fr] gap-2">
              <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              <div className="grid grid-cols-2 grid-rows-2 gap-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
