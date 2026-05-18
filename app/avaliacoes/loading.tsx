export default function AvaliacoesLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-gray-50">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 h-10 w-56 rounded-xl bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-100" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-4/5 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
