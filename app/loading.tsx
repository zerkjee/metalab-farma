export default function HomeLoading() {
  return (
    <div className="min-h-screen animate-pulse" style={{ background: '#020617' }}>
      {/* header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/60" />
      {/* hero banner */}
      <div className="h-[420px] bg-slate-800/50" />
      {/* product grid */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 h-8 w-48 rounded-lg bg-slate-800" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-slate-800/60 p-4">
              <div className="mb-3 aspect-square rounded-xl bg-slate-700" />
              <div className="mb-2 h-4 w-3/4 rounded bg-slate-700" />
              <div className="h-5 w-1/2 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
