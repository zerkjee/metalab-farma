'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  Activity,
  Award,
  Brain,
  CheckCircle2,
  Clock,
  Droplets,
  Eye,
  Flame,
  FlaskConical,
  Heart,
  Layers,
  Leaf,
  Lock,
  Moon,
  Package,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Truck,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Product } from '@/types/product'
import type { InovitannTheme } from '@/lib/inovitann-themes'
import { getInovitannDesignContent } from '@/lib/inovitann-design'
import { colorWithAlpha, createProductColorTheme } from '@/lib/product-color'
import { calculateVolumePrice } from '@/lib/volume-pricing'
import { useCart } from '@/context/CartContext'
import { fmtCurrency } from '@/utils/formatters'
import AnimatedReveal from './AnimatedReveal'
import ThematicBackground from './ThematicBackground'

const ICON_MAP: Record<string, LucideIcon> = {
  Activity,
  Award,
  Brain,
  Droplets,
  Eye,
  Flame,
  FlaskConical,
  Heart,
  Layers,
  Leaf,
  Moon,
  Package,
  Shield,
  Sparkles,
  Star,
  Sun,
  TrendingUp,
  Wind,
  Zap,
}

const TRUST_SEALS: Array<{ icon: LucideIcon; label: string; color: string }> = [
  { icon: Shield, label: 'Lacrado de fábrica', color: 'text-success' },
  { icon: Lock, label: 'Compra segura', color: 'text-brand' },
  { icon: Truck, label: 'Entrega garantida', color: 'text-navy' },
]

const QUALITY_CARDS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Zap,
    title: 'Alta biodisponibilidade',
    text: 'Formas e concentrações selecionadas para favorecer absorção e aproveitamento nutricional.',
  },
  {
    icon: FlaskConical,
    title: 'Formulação criteriosa',
    text: 'Composição alinhada ao papel do ativo principal e à rotina real de suplementação.',
  },
  {
    icon: Award,
    title: 'Procedência e segurança',
    text: 'Produto lacrado, rastreável e apresentado com informações claras para decisão de compra.',
  },
]

function BenefitIcon({ nome, cor }: { nome: string; cor: string }) {
  const Icon = ICON_MAP[nome] ?? Sparkles
  return (
    <span
      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
      style={{ backgroundColor: `${cor}14` }}
    >
      <Icon size={24} className="shrink-0" style={{ color: cor }} />
    </span>
  )
}

function cleanSubtitle(product: Product, theme: InovitannTheme) {
  const raw = product.descricaoCurta?.trim() ?? ''
  const looksLikeTable = /tabela nutricional|vd não|porção \d|mg =|ins \d/i.test(raw)
  if (raw.length > 20 && !looksLikeTable) return raw
  return theme.copyAbertura
}

interface InovitannProductPageProps {
  theme: InovitannTheme
  product: Product
}

export default function InovitannProductPage({ theme, product }: InovitannProductPageProps) {
  const design = getInovitannDesignContent(theme.slug)
  const colorTheme = createProductColorTheme(product.corPrincipal, design?.accent, theme.cor)
  const { accent, accentStrong, accentText, onAccent, focusRing } = colorTheme
  const accentA = (alpha: string) => colorWithAlpha(accent, alpha)
  const imageSrc = design?.image ?? product.imagemUrl ?? theme.imagemLocal
  const subtitle = cleanSubtitle(product, theme)
  const { addItem } = useCart()

  const [selectedQty, setSelectedQty] = useState<1 | 2 | 3>(1)
  const [stickyCta, setStickyCta] = useState(false)
  const purchaseRef = useRef<HTMLDivElement>(null)

  const preco = Number(product.preco)
  const precoOriginal = product.precoOriginal ? Number(product.precoOriginal) : null
  const descontoBase = precoOriginal ? Math.round((1 - preco / precoOriginal) * 100) : 0
  const selectedPrice = calculateVolumePrice(preco, selectedQty)
  const descPct = selectedPrice.discountPercent
  const precoAtual = selectedPrice.unitPrice
  const precoOriginalAtual = descPct > 0 ? preco : precoOriginal
  const temEstoque = product.estoque > 0

  function handleAddToCart() {
    addItem(product, selectedQty)
  }

  function scrollToComposition() {
    document.getElementById('descricao')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const el = purchaseRef.current
    if (!el || typeof window === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => setStickyCta(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { rootMargin: '0px 0px -60px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <section className="relative overflow-hidden bg-surface-card border-b border-line">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute inset-x-0 top-0 h-48 opacity-20"
            style={{ background: `linear-gradient(180deg, ${accentA('22')}, transparent)` }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-14 sm:pb-20">
          <nav className="mb-8 text-xs font-semibold text-ink-muted" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>Metalab</li>
              <li aria-hidden>/</li>
              <li>Inovitann Clinical</li>
              <li aria-hidden>/</li>
              <li className="text-navy">{theme.nome}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
            <div
              className="relative min-h-[360px] sm:min-h-[520px] flex items-center justify-center overflow-hidden rounded-[2rem]"
              style={{ background: `linear-gradient(145deg, ${accentA('14')} 0%, #ffffff 48%, ${accentA('0f')} 100%)` }}
            >
              <ThematicBackground tema={theme.temaVisual} cor={accent} />
              <div
                className="absolute h-56 w-56 sm:h-80 sm:w-80 rounded-full blur-3xl opacity-35"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
              <div className="relative h-[310px] w-[310px] sm:h-[500px] sm:w-[500px] lg:h-[560px] lg:w-[560px]">
                <Image
                  src={imageSrc}
                  alt={product.nome}
                  fill
                  priority
                  sizes="(max-width: 640px) 310px, (max-width: 1024px) 500px, 560px"
                  className="object-contain"
                  style={{ filter: `drop-shadow(0 26px 48px ${accentA('42')})` }}
                />
              </div>

              {descontoBase > 0 && descPct === 0 && (
                <div
                  className="absolute right-5 top-5 rounded-2xl px-3 py-2 text-center shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${accentStrong}, ${colorWithAlpha(accentStrong, 'c9')})`,
                    color: onAccent,
                  }}
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wide">Poupe</span>
                  <span className="block text-2xl font-black leading-none">-{descontoBase}%</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em]"
                  style={{ backgroundColor: accentStrong, color: onAccent }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                  Inovitann Clinical
                </span>
                <span className="text-xs font-semibold text-ink-muted">Suplemento alimentar</span>
              </div>

              <div>
                <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl font-black leading-[0.98] text-navy">
                  {product.nome}
                </h1>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-ink-secondary">
                  {subtitle}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(design?.quickFacts ?? ['60 cápsulas', theme.estatisticas[0]?.valor ?? 'Premium', 'Suplemento']).map((fact) => (
                  <div
                    key={fact}
                    className="min-h-[76px] rounded-2xl border px-3 py-3 text-center flex items-center justify-center"
                    style={{ backgroundColor: accentA('08'), borderColor: accentA('24') }}
                  >
                    <span className="text-xs sm:text-sm font-black leading-tight" style={{ color: accentText }}>
                      {fact}
                    </span>
                  </div>
                ))}
              </div>

              <div
                ref={purchaseRef}
                className="rounded-[1.75rem] border bg-white p-5 sm:p-6 shadow-sm"
                style={{ borderColor: accentA('22') }}
              >
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-ink-muted">Preço</p>
                    <div
                      data-testid="product-current-price"
                      className="font-display text-4xl sm:text-5xl font-black leading-none mt-1"
                      style={{ color: accentText }}
                    >
                      {fmtCurrency(precoAtual)}
                    </div>
                    {precoOriginalAtual && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-ink-muted line-through">{fmtCurrency(precoOriginalAtual)}</span>
                        <span className="rounded-full bg-success px-2 py-0.5 text-xs font-black text-white">
                          -{descPct > 0 ? descPct : descontoBase}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-1.5 text-sm font-semibold ${temEstoque ? 'text-success' : 'text-danger'}`}>
                    <span className={`h-2 w-2 rounded-full ${temEstoque ? 'bg-success' : 'bg-danger'}`} />
                    {temEstoque ? 'Em estoque' : 'Fora de estoque'}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-secondary">Quantidade</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map((qty) => {
                      const price = calculateVolumePrice(preco, qty)
                      const pct = price.discountPercent
                      const isSelected = selectedQty === qty
                      return (
                        <button
                          key={qty}
                          type="button"
                          onClick={() => setSelectedQty(qty)}
                          className="relative min-h-[86px] rounded-2xl border-2 px-2 py-3 text-center transition-all duration-200"
                          style={
                            isSelected
                              ? { borderColor: accentStrong, color: accentText, backgroundColor: accentA('08') }
                              : { borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }
                          }
                        >
                          {pct > 0 && (
                            <span className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-1.5 py-0.5 text-[9px] font-black text-white">
                              -{pct}% OFF
                            </span>
                          )}
                          <span className="block text-xs font-bold leading-tight">
                            {qty === 1 ? '1 unidade' : `${qty} unidades`}
                          </span>
                          <span className="mt-1 block text-sm font-black">{fmtCurrency(price.unitPrice)}</span>
                          <span className="block text-[10px] text-ink-muted leading-none">/un</span>
                        </button>
                      )
                    })}
                  </div>
                  {descPct > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Você economiza {fmtCurrency(selectedPrice.discountTotal)} levando {selectedQty} unidades
                    </p>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {TRUST_SEALS.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="rounded-2xl border border-line bg-surface-sunken p-2.5 text-center">
                        <Icon className={`mx-auto mb-1 h-4 w-4 ${item.color}`} strokeWidth={2} />
                        <span className="block text-[10px] font-bold leading-tight text-ink-secondary">{item.label}</span>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!temEstoque}
                    className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-black transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-[2]"
                    style={{
                      background: temEstoque ? accentStrong : 'var(--neutral-400)',
                      color: onAccent,
                      boxShadow: temEstoque ? `0 14px 30px ${colorWithAlpha(accentStrong, '30')}` : undefined,
                      outlineColor: focusRing,
                    }}
                  >
                    <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
                    {temEstoque ? 'Adicionar à sacola' : 'Indisponível'}
                  </button>
                  <button
                    type="button"
                    onClick={scrollToComposition}
                    className="w-full rounded-full border-2 px-5 py-4 text-sm font-black transition-all duration-200 hover:bg-surface-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-1"
                    style={{ borderColor: accentStrong, color: accentText, outlineColor: focusRing }}
                  >
                    Ver composição
                  </button>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-ink-muted">
                Suplemento alimentar. Este produto não é medicamento. Sem indicação terapêutica. Leia o rótulo antes de consumir.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="descricao" className="bg-surface-card py-14 sm:py-16 border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fadeUp">
            <div
              className="grid grid-cols-1 gap-8 overflow-hidden rounded-[2rem] border lg:grid-cols-[0.9fr_1.1fr]"
              style={{ borderColor: accentA('22'), backgroundColor: accentA('06') }}
            >
              <div
                className="flex min-h-[240px] items-center justify-center p-8"
                style={{ background: `linear-gradient(145deg, ${accentA('18')}, ${accentA('05')})` }}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
                  <FlaskConical size={38} style={{ color: accentText }} />
                </div>
              </div>
              <div className="p-7 sm:p-10">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accentText }}>
                  Composição
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-black text-navy">
                  {design?.compositionTitle ?? theme.nome}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-secondary">
                  {design?.compositionDescription ?? theme.mecanismo}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {theme.sistemas.map((system) => (
                    <span
                      key={system}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                      style={{ backgroundColor: accentA('08'), borderColor: accentA('28'), color: accentText }}
                    >
                      {system}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </section>

      <section className="relative overflow-hidden py-14 sm:py-16 border-b border-line" style={{ backgroundColor: accentA('08') }}>
        <svg className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden>
          <polygon points="0,80 260,0 520,120 780,20 1200,140 1200,420 0,420" fill={accent} />
        </svg>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fadeUp">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accentText }}>
                Benefícios
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-navy">
                Por que incluir na sua rotina
              </h2>
              <p className="mt-3 text-ink-secondary">
                Fórmula orientada para complementar hábitos de saúde com qualidade, procedência e clareza de uso.
              </p>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {theme.beneficios.map((benefit, index) => (
              <AnimatedReveal key={benefit.titulo} animation="fadeUp" delay={index * 80}>
                <div className="h-full rounded-[1.5rem] border border-white/70 bg-white/90 p-6 text-center shadow-sm backdrop-blur-sm">
                  <BenefitIcon nome={benefit.icone} cor={accentText} />
                  <h3 className="font-display text-base font-black leading-tight text-navy">{benefit.titulo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{benefit.descricao}</p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-card py-14 sm:py-16 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-1 gap-8 overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]"
            style={{ background: `linear-gradient(135deg, ${accentStrong}, #151a2f)` }}
          >
            <AnimatedReveal animation="slideRight">
              <div className="text-white">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-white/70">Modo de uso</p>
                <h2 className="font-display text-3xl sm:text-4xl font-black">
                  Como consumir {theme.nome}
                </h2>
              </div>
            </AnimatedReveal>
            <AnimatedReveal animation="slideLeft" delay={100}>
              <div className="rounded-[1.5rem] bg-white/10 p-6 text-white backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Clock size={22} />
                  </span>
                  <div>
                    <p className="text-base leading-relaxed text-white/90">{product.modoDeUso ?? theme.modoDeUso}</p>
                    <p className="mt-4 text-xs leading-relaxed text-white/70">
                      Consulte um profissional de saúde em caso de gestação, lactação, uso de medicamentos ou condições clínicas específicas.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>

      <section className="bg-surface-card py-14 sm:py-16 border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fadeUp">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em]" style={{ color: accentText }}>
                Inovitann Clinical
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-navy">Qualidade técnica em cada fórmula</h2>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {QUALITY_CARDS.map((item) => {
              const Icon = item.icon
              return (
                <AnimatedReveal key={item.title} animation="fadeUp">
                  <div className="flex h-full gap-4 rounded-[1.5rem] border border-line bg-surface-sunken p-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: accentA('14') }}>
                      <Icon size={22} style={{ color: accentText }} />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-black text-navy">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{item.text}</p>
                    </div>
                  </div>
                </AnimatedReveal>
              )
            })}
          </div>
        </div>
      </section>

      <div
        aria-hidden={!stickyCta}
        className={`fixed bottom-0 left-0 right-0 z-[30] flex items-center gap-3 border-t border-line bg-surface-card/95 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:hidden ${stickyCta ? 'translate-y-0' : 'translate-y-full'}`}
        style={{
          boxShadow: 'var(--shadow-lg)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-ink-muted">
            {selectedQty === 1 ? '1 unidade' : `${selectedQty} unidades`} · Inovitann Clinical
          </p>
          <p className="truncate text-sm font-black leading-tight text-navy">{product.nome}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="text-right">
            <p className="text-[10px] leading-none text-ink-muted">por</p>
            <p className="text-base font-black leading-tight" style={{ color: accentText }}>
              {fmtCurrency(precoAtual)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!temEstoque}
            className="flex items-center gap-1.5 rounded-full px-5 py-3 text-sm font-black transition-all hover:brightness-95 active:scale-95 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ background: accentStrong, color: onAccent, outlineColor: focusRing }}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={2.5} />
            {temEstoque ? 'Comprar' : 'Indisponível'}
          </button>
        </div>
      </div>
    </>
  )
}
