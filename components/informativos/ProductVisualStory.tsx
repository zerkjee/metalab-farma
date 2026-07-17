import {
  Droplets,
  Eye,
  ExternalLink,
  FlaskConical,
  Gem,
  Layers,
  Leaf,
  Moon,
  Sparkles,
  TreePine,
  Waves,
} from 'lucide-react'
import type { ProductVisualStory as ProductVisualStoryData, ProductVisualKind } from '@/data/informativos/product-experience'

const visualConfig: Record<ProductVisualKind, {
  icon: typeof FlaskConical
  stage: string
  iconColor: string
  accent: string
}> = {
  'pine-bark': {
    icon: TreePine,
    stage: 'from-[#102b24] via-[#174535] to-[#8b5a32]',
    iconColor: 'text-[#d9f2df]',
    accent: 'bg-[#d89a5b]',
  },
  botanical: {
    icon: Leaf,
    stage: 'from-[#15382d] via-[#27684c] to-[#c49a4d]',
    iconColor: 'text-[#e2f6df]',
    accent: 'bg-[#d5b66f]',
  },
  mineral: {
    icon: Gem,
    stage: 'from-[#172a46] via-[#315f7d] to-[#83c6df]',
    iconColor: 'text-[#e7f7fd]',
    accent: 'bg-[#b7dff3]',
  },
  micronutrients: {
    icon: Sparkles,
    stage: 'from-[#2b2855] via-[#4d5c93] to-[#79bde3]',
    iconColor: 'text-[#f7f0cf]',
    accent: 'bg-[#ebc786]',
  },
  structural: {
    icon: Layers,
    stage: 'from-[#18243d] via-[#3d5680] to-[#77abc3]',
    iconColor: 'text-[#e8f2fa]',
    accent: 'bg-[#93ceec]',
  },
  digestive: {
    icon: Waves,
    stage: 'from-[#153b3a] via-[#28706b] to-[#7cc3ad]',
    iconColor: 'text-[#e1faf2]',
    accent: 'bg-[#8dd9c1]',
  },
  sleep: {
    icon: Moon,
    stage: 'from-[#11182f] via-[#303d72] to-[#756da6]',
    iconColor: 'text-[#fff3bd]',
    accent: 'bg-[#ebc786]',
  },
  vision: {
    icon: Eye,
    stage: 'from-[#2f274a] via-[#755567] to-[#d29b58]',
    iconColor: 'text-[#fff1cb]',
    accent: 'bg-[#f0bf65]',
  },
  skincare: {
    icon: Droplets,
    stage: 'from-[#27385b] via-[#6c83a4] to-[#c5dbe5]',
    iconColor: 'text-white',
    accent: 'bg-[#dceffa]',
  },
  technical: {
    icon: FlaskConical,
    stage: 'from-[#19243e] via-[#323c64] to-[#5ca8d1]',
    iconColor: 'text-white',
    accent: 'bg-[#93ceec]',
  },
}

export default function ProductVisualStory({ story }: { story: ProductVisualStoryData }) {
  const config = visualConfig[story.kind]
  const Icon = config.icon

  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-line bg-surface-sunken">
      <div className="grid md:grid-cols-[1fr_280px]">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-700">{story.eyebrow}</p>
          <h3 className="mt-2 font-display text-2xl font-black text-ink">{story.title}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">{story.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {story.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-line bg-surface-card px-3 py-1 text-xs font-bold text-ink-secondary">
                {tag}
              </span>
            ))}
          </div>
          {story.source && (
            <a
              href={story.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800"
            >
              {story.source.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className={`relative min-h-56 overflow-hidden bg-gradient-to-br ${config.stage}`} aria-hidden="true">
          <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full border border-white/15 bg-white/5" />
          <div className="absolute -bottom-20 -left-10 h-52 w-52 rounded-full border-[24px] border-white/10" />
          <div className={`absolute right-10 top-8 h-3 w-3 rounded-full ${config.accent} shadow-[0_0_28px_currentColor]`} />
          <Icon className={`absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 ${config.iconColor}`} strokeWidth={1.15} />
          {story.kind === 'pine-bark' && (
            <>
              <div className="absolute bottom-5 right-5 h-16 w-16 rounded-full border-8 border-[#b77a46]/70 bg-[#6b3f25]/60 shadow-inner" />
              <Leaf className="absolute left-7 top-7 h-10 w-10 rotate-[-25deg] text-[#9dccaa]" strokeWidth={1.3} />
            </>
          )}
          <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 280 224" fill="none">
            <path d="M20 178C62 118 82 159 118 96C150 42 181 120 260 34" stroke="white" strokeWidth="1.5" strokeDasharray="4 7" />
            <circle cx="118" cy="96" r="5" fill="white" />
            <circle cx="260" cy="34" r="4" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  )
}
