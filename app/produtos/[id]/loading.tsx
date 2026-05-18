export default function ProdutoLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-white">
      {/* header */}
      <div className="h-16 border-b border-gray-100 bg-white" />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* image */}
          <div className="aspect-square rounded-3xl bg-gray-100" />
          {/* info */}
          <div className="space-y-4">
            <div className="h-5 w-24 rounded-full bg-gray-200" />
            <div className="h-10 w-3/4 rounded-xl bg-gray-200" />
            <div className="h-6 w-32 rounded-lg bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-100" />
            <div className="h-4 w-5/6 rounded bg-gray-100" />
            <div className="h-4 w-4/6 rounded bg-gray-100" />
            <div className="mt-6 h-14 w-full rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}
