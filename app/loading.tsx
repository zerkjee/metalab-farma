export default function HomeLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-surface-page">
      {/* header */}
      <div className="h-16 border-b border-line bg-surface-card" />
      {/* hero banner */}
      <div className="h-[420px] bg-neutral-100" />
      {/* product grid */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 h-8 w-48 rounded-lg bg-neutral-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-line bg-surface-card">
              <div className="aspect-square bg-neutral-100" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-4 w-3/4 rounded bg-neutral-200" />
                <div className="h-5 w-1/2 rounded bg-neutral-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
