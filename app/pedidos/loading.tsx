export default function PedidosLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-gray-50">
      <div className="h-16 border-b border-gray-100 bg-white" />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 h-9 w-48 rounded-xl bg-gray-200" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-5 w-32 rounded bg-gray-200" />
                <div className="h-6 w-24 rounded-full bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />
              </div>
              <div className="mt-4 flex justify-between">
                <div className="h-5 w-20 rounded bg-gray-200" />
                <div className="h-5 w-28 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
