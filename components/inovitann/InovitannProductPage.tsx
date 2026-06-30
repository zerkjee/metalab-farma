import Image from 'next/image'
import {
  Activity, Award, Brain, Droplets, Eye, Flame, FlaskConical,
  Heart, Layers, Leaf, Moon, Package, Shield, Sparkles,
  Star, Sun, TrendingUp, Wind, Zap,
  type LucideIcon,
} from 'lucide-react'
import type { InovitannTheme } from '@/lib/inovitann-themes'
import AnimatedReveal from './AnimatedReveal'
import ThematicBackground from './ThematicBackground'

// Map icon name strings to Lucide components
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

function BeneficioIcon({ nome, cor }: { nome: string; cor: string }) {
  const Icon = ICON_MAP[nome] ?? Sparkles
  return (
    <span
      className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
      style={{ backgroundColor: `${cor}18` }}
    >
      <Icon size={20} className="shrink-0" style={{ color: cor }} />
    </span>
  )
}

interface InovitannProductPageProps {
  theme: InovitannTheme
  productName: string
  imagemUrl: string | null | undefined
}

export default function InovitannProductPage({
  theme,
  productName,
  imagemUrl,
}: InovitannProductPageProps) {
  const imgSrc = imagemUrl ?? theme.imagemLocal

  return (
    <>
      {/* ── HERO PREMIUM — split: produto escuro | copy branco ────────── */}
      <section className="overflow-hidden grid grid-cols-1 lg:grid-cols-2">

        {/* Lado esquerdo — fundo escuro APENAS atrás do produto */}
        <div
          className="relative flex flex-col items-center justify-center py-10 px-6 sm:px-10 min-h-[500px] sm:min-h-[580px] lg:min-h-[620px]"
          style={{
            background: `linear-gradient(150deg, ${theme.cor} 0%, ${theme.cor}cc 55%, #080c1a 100%)`,
          }}
        >
          <ThematicBackground tema={theme.temaVisual} cor={theme.corSecundaria} />

          {/* Badge */}
          <div className="relative z-10 mb-6 self-start lg:self-auto">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ backgroundColor: `${theme.corSecundaria}25`, color: theme.corSecundaria, border: `1px solid ${theme.corSecundaria}50` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.corSecundaria }} />
              Linha Premium · Inovitann Clinical
            </span>
          </div>

          {/* Produto */}
          <div className="relative z-10">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-50 scale-90"
              style={{ backgroundColor: theme.corSecundaria }}
            />
            <div className="relative w-80 h-80 sm:w-[26rem] sm:h-[26rem] lg:w-[30rem] lg:h-[30rem]">
              <Image
                src={imgSrc}
                alt={productName}
                fill
                sizes="(max-width: 640px) 320px, (max-width: 1024px) 416px, 480px"
                className="object-contain"
                priority
                style={{ filter: `drop-shadow(0 16px 48px ${theme.cor}a0)` }}
              />
            </div>
          </div>
        </div>

        {/* Lado direito — fundo branco para o copy */}
        <div className="flex flex-col justify-center py-14 px-8 sm:px-12 lg:px-16 bg-white border-l border-gray-100">
          <p
            className="text-xs font-black uppercase tracking-[0.2em] mb-3"
            style={{ color: theme.cor }}
          >
            {theme.nome}
          </p>
          <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black leading-tight text-gray-900 mb-5">
            {theme.tagline}
          </h2>
          <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8">
            {theme.copyAbertura}
          </p>

          {/* Sistemas do corpo */}
          <div className="flex flex-wrap gap-2">
            {theme.sistemas.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  backgroundColor: `${theme.cor}0d`,
                  color: theme.cor,
                  borderColor: `${theme.cor}35`,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── MECANISMO ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fadeUp">
            <div className="text-center mb-10">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
                style={{ backgroundColor: `${theme.cor}12`, color: theme.cor }}
              >
                Como funciona
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                O que é e como age no organismo
              </h2>
            </div>
          </AnimatedReveal>

          <AnimatedReveal animation="fadeUp" delay={100}>
            <div
              className="rounded-2xl p-8 border"
              style={{ backgroundColor: `${theme.cor}06`, borderColor: `${theme.cor}20` }}
            >
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                {theme.mecanismo}
              </p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal animation="fadeUp" delay={200}>
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {theme.sistemas.map((s) => (
                <span
                  key={s}
                  className="px-4 py-2 rounded-full text-sm font-medium border"
                  style={{ borderColor: `${theme.cor}30`, color: theme.cor, backgroundColor: `${theme.cor}08` }}
                >
                  {s}
                </span>
              ))}
            </div>
          </AnimatedReveal>
        </div>
      </section>

      {/* ── BENEFÍCIOS ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fadeUp">
            <div className="text-center mb-12">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
                style={{ backgroundColor: `${theme.cor}12`, color: theme.cor }}
              >
                Benefícios
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Por que incluir na sua rotina
              </h2>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {theme.beneficios.map((b, i) => (
              <AnimatedReveal key={b.titulo} animation="fadeUp" delay={i * 100}>
                <div
                  className="h-full p-6 bg-white rounded-2xl border hover:shadow-lg transition-shadow duration-300"
                  style={{ borderColor: `${theme.cor}20` }}
                >
                  <BeneficioIcon nome={b.icone} cor={theme.cor} />
                  <h3 className="font-bold text-gray-900 mb-2 text-sm sm:text-base">
                    {b.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {b.descricao}
                  </p>
                </div>
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUE INOVITANN ────────────────────────────────────────────── */}
      <section
        className="py-16 border-b border-gray-100"
        style={{ backgroundColor: `${theme.cor}07` }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedReveal animation="fadeUp">
            <div className="text-center mb-12">
              <span
                className="inline-block text-xs font-semibold tracking-widest uppercase mb-3 px-3 py-1 rounded-full"
                style={{ backgroundColor: `${theme.cor}12`, color: theme.cor }}
              >
                Inovitann Clinical
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                Por que Inovitann?
              </h2>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icone: <Zap size={24} style={{ color: theme.cor }} />,
                titulo: 'Alta Biodisponibilidade',
                descricao:
                  'Formas e concentrações selecionadas para maximizar a absorção e o aproveitamento pelo organismo.',
                delay: 0,
              },
              {
                icone: <FlaskConical size={24} style={{ color: theme.cor }} />,
                titulo: 'Formulação Exclusiva',
                descricao:
                  'Desenvolvimento técnico rigoroso com matérias-primas de alta qualidade e pureza documentada.',
                delay: 100,
              },
              {
                icone: <Award size={24} style={{ color: theme.cor }} />,
                titulo: 'BPF Certificado',
                descricao:
                  'Produzido em laboratório com certificação de Boas Práticas de Fabricação conforme normas vigentes.',
                delay: 200,
              },
            ].map((item) => (
              <AnimatedReveal key={item.titulo} animation="fadeUp" delay={item.delay}>
                <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm h-full">
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                    style={{ backgroundColor: `${theme.cor}15` }}
                  >
                    {item.icone}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.titulo}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.descricao}</p>
                  </div>
                </div>
              </AnimatedReveal>
            ))}
          </div>

          <AnimatedReveal animation="fadeUp" delay={300}>
            <p className="text-center text-xs text-gray-400 mt-10">
              Suplemento alimentar. Este produto não é medicamento. Sem indicação terapêutica. Leia o rótulo antes de consumir.
            </p>
          </AnimatedReveal>
        </div>
      </section>
    </>
  )
}
