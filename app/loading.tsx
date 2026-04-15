export default function HomeLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-24">
      <div className="py-6 flex items-center justify-between">
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-orange-200 rounded-full animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-3" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-28 h-36 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </main>
  )
}
