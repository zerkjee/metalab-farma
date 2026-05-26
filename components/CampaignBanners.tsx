import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function isExternal(url: string) {
  return /^https?:\/\//.test(url)
}

function isLight(hex: string): boolean {
  const c = hex.replace('#', '')
  if (c.length !== 6) return false
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 155
}

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
    <section className="bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => {
            const accent = b.accent ?? '#60a5fa'
            const bg = b.bg ?? 'linear-gradient(135deg, #040d1e, #0f2756, #1a3a72)'
            const ctaTextColor = isLight(accent) ? '#1a0533' : '#ffffff'
            const isClickable = !!b.linkUrl

            const inner = (
              <div
                className={`group relative overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-all duration-300 ${isClickable ? 'hover:shadow-2xl hover:-translate-y-0.5' : ''}`}
                style={{ background: bg, minHeight: 200 }}
              >
                {/* Dot grid */}
                <div className="absolute inset-0 opacity-[0.06]"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                {/* Glow orbs */}
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-25 blur-xl" style={{ backgroundColor: accent }} />
                <div className="absolute -left-8 -bottom-8 h-28 w-28 rounded-full opacity-10 blur-xl" style={{ backgroundColor: accent }} />

                <div className="relative z-10 grid h-full grid-cols-[1fr_auto] gap-4 p-5">
                  <div className="flex min-w-0 flex-col justify-center gap-1.5">
                    {b.campanha && (
                      <span
                        className="mb-0.5 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em]"
                        style={{ backgroundColor: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
                      >
                        {b.campanha}
                      </span>
                    )}
                    <h3 className="text-lg font-black leading-tight text-white">{b.titulo}</h3>
                    {b.subtitulo && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-white/65">{b.subtitulo}</p>
                    )}
                    {b.cta && (
                      <div className="mt-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black shadow-lg transition-all duration-200 group-hover:shadow-xl group-hover:brightness-110"
                          style={{ backgroundColor: accent, color: ctaTextColor }}
                        >
                          {b.cta}
                          {isClickable && (
                            <svg className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  {b.imagemUrl && (
                    <div className="flex items-center justify-center pl-1">
                      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur transition-transform duration-300 group-hover:scale-105">
                        <Image
                          src={b.imagemUrl}
                          alt={b.titulo ?? ''}
                          fill
                          sizes="96px"
                          className="object-contain rounded-xl p-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )

            if (!b.linkUrl) return <div key={b.id}>{inner}</div>
            if (isExternal(b.linkUrl)) {
              return <a key={b.id} href={b.linkUrl} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
            }
            return <Link key={b.id} href={b.linkUrl} className="block">{inner}</Link>
          })}
        </div>
      </div>
    </section>
  )
}
