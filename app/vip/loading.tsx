export default function VipLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-surface-page">
      <div className="h-16 border-b border-line bg-surface-card" />
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* level card */}
        <div className="mb-6 h-48 rounded-3xl bg-surface-sunken" />
        {/* stats grid */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-surface-sunken" />
          ))}
        </div>
        {/* benefits */}
        <div className="h-40 rounded-3xl bg-surface-sunken" />
      </div>
    </div>
  )
}
