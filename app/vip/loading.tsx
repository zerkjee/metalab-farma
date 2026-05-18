export default function VipLoading() {
  return (
    <div className="min-h-screen animate-pulse" style={{ background: '#020617' }}>
      <div className="h-16 border-b border-slate-800 bg-slate-900/60" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* level card */}
        <div className="mb-6 h-48 rounded-3xl bg-slate-800/70" />
        {/* stats grid */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-800/70" />
          ))}
        </div>
        {/* benefits */}
        <div className="h-40 rounded-3xl bg-slate-800/70" />
      </div>
    </div>
  )
}
