import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CampaignBanners() {
  let banners: Awaited<ReturnType<typeof prisma.banner.findMany>> = []
  try {
    banners = await prisma.banner.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
      take: 6,
    })
  } catch {
    return null
  }

  if (banners.length === 0) return null

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => {
            const accent = b.accent ?? '#c084fc'
            const bg = b.bg ?? 'linear-gradient(135deg, #1a0533, #2d1654, #1e3a5f)'
            const inner = (
              <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-transform hover:scale-[1.02]" style={{ background: bg, minHeight: 200 }}>
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-sm" style={{ backgroundColor: accent }} />
                <div className="relative z-10 grid h-full grid-cols-[1fr_96px] gap-4 p-5">
                  <div className="flex min-w-0 flex-col justify-center">
                    {b.campanha && (
                      <span className="mb-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white" style={{ backgroundColor: `${accent}33` }}>
                        {b.campanha}
                      </span>
                    )}
                    <h3 className="text-lg font-black leading-tight text-white">{b.titulo}</h3>
                    {b.subtitulo && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/70">{b.subtitulo}</p>}
                    {b.cta && (
                      <div className="mt-3">
                        <span className="inline-flex rounded-xl px-3 py-1.5 text-xs font-bold text-slate-950 shadow-md" style={{ backgroundColor: accent }}>
                          {b.cta}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur">
                      <div className="h-full w-full rounded-xl bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${b.imagemUrl})` }} />
                    </div>
                  </div>
                </div>
              </div>
            )
            return b.linkUrl ? (
              <a key={b.id} href={b.linkUrl} className="block">{inner}</a>
            ) : (
              <div key={b.id}>{inner}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
