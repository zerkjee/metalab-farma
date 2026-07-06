export default function AvaliacoesLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-surface-page">
      <div className="h-16 border-b border-line bg-surface-card" />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 h-10 w-56 rounded-xl bg-surface-sunken" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface-card p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-surface-sunken" />
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-surface-sunken" />
                  <div className="h-3 w-20 rounded bg-surface-sunken" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-surface-sunken" />
                <div className="h-3 w-4/5 rounded bg-surface-sunken" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
