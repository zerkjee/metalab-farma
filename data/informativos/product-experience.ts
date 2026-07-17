import type { InformativeProduct } from '@/types/product-informative'
import type { ProductTechnicalOverview } from './technical-explanations'

export type ProductVisualKind =
  | 'pine-bark'
  | 'botanical'
  | 'mineral'
  | 'micronutrients'
  | 'structural'
  | 'digestive'
  | 'sleep'
  | 'vision'
  | 'skincare'
  | 'technical'

export interface ProductVisualStory {
  kind: ProductVisualKind
  eyebrow: string
  title: string
  description: string
  tags: string[]
  source?: {
    label: string
    url: string
  }
}

export interface ProductFaqItem {
  question: string
  answer: string
}

const technologicalIngredient = /(?:\bins\s*\d|celulose|estearato|di[óo]xido de sil[íi]cio|talco|polietilenoglicol|maltodextrina|sorbitol|sacarina|sucralose|ciclamato|aroma|corante|benzoato|sorbato|edta|[áa]gua|goma xantana|carboximetilcelulose|hidroxipropilmetilcelulose|triacetina|croscarmelose|propilenoglicol|metilparabeno|ceteareth|[áa]lcool cet|estearato de glicerila|poliquaternium)/i

function formatCompactList(values: string[]) {
  if (values.length === 0) return 'os componentes declarados na ficha técnica'
  if (values.length === 1) return values[0]
  if (values.length === 2) return `${values[0]} e ${values[1]}`
  return `${values.slice(0, -1).join(', ')} e ${values.at(-1)}`
}

function activeLabels(product: InformativeProduct, overview: ProductTechnicalOverview | null) {
  if (overview?.status === 'available' && overview.components.length > 0) {
    return overview.components.slice(0, 3).map((component) => component.label)
  }

  return (product.profile?.ingredients ?? [])
    .filter((ingredient) => !technologicalIngredient.test(ingredient))
    .slice(0, 3)
}

function visualTags(product: InformativeProduct, overview: ProductTechnicalOverview | null) {
  const labels = activeLabels(product, overview)
  if (labels.length > 0) return labels
  return [product.profile?.classification, product.profile?.presentation].filter((value): value is string => Boolean(value))
}

export function buildProductVisualStory(
  product: InformativeProduct,
  overview: ProductTechnicalOverview | null,
): ProductVisualStory {
  const profile = product.profile
  const haystack = `${product.nome} ${(profile?.ingredients ?? []).join(' ')} ${(profile?.nutrition ?? []).map((row) => row.nutrient).join(' ')}`
  const tags = visualTags(product, overview)

  if (/pinus pinaster|flebogenol/i.test(haystack)) {
    const procyanidin = profile?.nutrition?.find((row) => /procianidina/i.test(row.nutrient))
    return {
      kind: 'pine-bark',
      eyebrow: 'Origem da matéria-prima',
      title: 'Da casca do pinheiro-marítimo',
      description: 'O extrato seco de Pinus pinaster Aiton declarado na ficha é obtido da casca do pinheiro-marítimo. A pinha ajuda a reconhecer a espécie no visual, mas não é a fonte do extrato.',
      tags: ['Casca de Pinus pinaster', ...(procyanidin ? [`${procyanidin.amount} de procianidinas por porção`] : []), 'Origem botânica'],
      source: {
        label: 'Revisão científica sobre o extrato da casca de Pinus pinaster',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11096517/',
      },
    }
  }

  if (/c[úu]rcuma|curcumina|guaco|agri[ãa]o|camomila|mel\b|levedura|extrato fluido|extrato seco/i.test(haystack)) {
    return {
      kind: 'botanical',
      eyebrow: 'Leitura da origem',
      title: /c[úu]rcuma|curcumina/i.test(haystack) ? 'Do rizoma de cúrcuma à fórmula' : 'Ingredientes de origem botânica',
      description: 'O visual destaca somente matérias-primas vegetais declaradas na ficha, sem transformar a origem botânica em promessa terapêutica.',
      tags,
    }
  }

  if (/melatonina|triptofano/i.test(haystack)) {
    return {
      kind: 'sleep',
      eyebrow: 'Contexto fisiológico',
      title: 'Componentes ligados ao ciclo sono-vigília',
      description: 'A leitura visual usa luz e ritmo circadiano como contexto técnico. Não representa sedação, tratamento de insônia ou resultado garantido.',
      tags,
    }
  }

  if (/lute[íi]na|zeaxantina|retinol|vitamina a/i.test(haystack)) {
    return {
      kind: 'vision',
      eyebrow: 'Contexto da fórmula',
      title: 'Carotenoides e micronutrientes declarados',
      description: 'Camadas de luz e pigmentos representam os componentes da fórmula, sem sugerir correção visual ou tratamento ocular.',
      tags,
    }
  }

  if (/lactase|inulina|frutooligossacar|polidextrose|fibra|laxtrine|reporgermina|protobaby|noglute/i.test(haystack)) {
    return {
      kind: 'digestive',
      eyebrow: 'Como ler a composição',
      title: 'Enzimas, fibras e componentes da fórmula',
      description: 'O gráfico organiza os componentes pelo papel técnico declarado, sem usar imagens de órgãos ou prometer efeito clínico.',
      tags,
    }
  }

  if (/col[áa]geno|glucosamina|condroitina|glicosaminoglicano|[áa]cido hialur[ôo]nico|membrana da casca/i.test(haystack)) {
    return {
      kind: 'structural',
      eyebrow: 'Arquitetura da fórmula',
      title: 'Componentes estruturais em camadas',
      description: 'Formas sobrepostas representam matriz, organização e hidratação de tecidos apenas como contexto fisiológico, sem alegar regeneração ou tratamento.',
      tags,
    }
  }

  if (/creme|lo[çc][ãa]o|gel|t[óo]pico|pele|acquaphil|fleboderm/i.test(haystack)) {
    return {
      kind: 'skincare',
      eyebrow: 'Experiência de uso',
      title: 'Textura e componentes da fórmula tópica',
      description: 'Gotas, camadas e superfícies suaves remetem à apresentação cosmética sem usar comparações de antes e depois.',
      tags,
    }
  }

  if (/magn[ée]sio|c[áa]lcio|ferro|zinco|sel[êe]nio|iodo|cloreto|carbonato|bisglicinato|sulfato/i.test(haystack)) {
    return {
      kind: 'mineral',
      eyebrow: 'Estrutura mineral',
      title: 'Minerais nas formas declaradas',
      description: 'Cristais e geometria representam a origem mineral e as diferentes formas químicas identificadas na ficha.',
      tags,
    }
  }

  if (/vitamina|biotina|folato|complexo b|cobalamina|tiamina|riboflavina|niacina/i.test(haystack)) {
    return {
      kind: 'micronutrients',
      eyebrow: 'Mapa de micronutrientes',
      title: 'Vitaminas que atuam em etapas complementares',
      description: 'Pontos conectados ajudam a visualizar uma fórmula combinada; cada função continua condicionada à quantidade e às regras do rótulo.',
      tags,
    }
  }

  return {
    kind: 'technical',
    eyebrow: 'Leitura técnica',
    title: 'Da composição ao propósito da fórmula',
    description: overview?.purpose ?? 'O gráfico organiza apresentação, composição e fonte documental sem acrescentar benefícios não confirmados.',
    tags: tags.length > 0 ? tags : ['Ficha técnica em validação', 'Sem composição inferida'],
  }
}

export function buildProductFaq(
  product: InformativeProduct,
  overview: ProductTechnicalOverview | null,
): ProductFaqItem[] {
  const profile = product.profile
  const actives = activeLabels(product, overview)
  const faqs: ProductFaqItem[] = [
    {
      question: `O que é ${product.nome}?`,
      answer: profile
        ? `${profile.classification}, apresentado em ${profile.presentation}. A identificação vem da ficha técnica associada a este SKU.`
        : 'O cadastro comercial existe, mas a ficha técnica ainda não foi conciliada. Por isso, composição e finalidade não são inferidas automaticamente.',
    },
    {
      question: 'O que a pessoa está consumindo?',
      answer: !profile
        ? 'Ainda não é possível resumir a composição deste SKU. A ficha técnica precisa ser conciliada com a embalagem vigente antes de apresentar ingredientes ou finalidade.'
        : overview?.status === 'blocked'
        ? 'Há uma divergência documental relevante. A composição precisa ser conciliada com o rótulo vigente antes de resumirmos o conteúdo.'
        : `A ficha reúne ${formatCompactList(actives)}. O resumo descreve funções conhecidas dos componentes, sem equivaler a indicação de tratamento.`,
    },
  ]

  if (/^flebogenol-/i.test(product.slug)) {
    faqs.push({
      question: 'De onde vem o ativo do Flebogenol?',
      answer: 'Do extrato seco da casca de Pinus pinaster Aiton, o pinheiro-marítimo. A pinha é apenas um elemento visual da árvore; o extrato declarado não vem do fruto.',
    })
  }

  if (profile?.serving) {
    faqs.push({
      question: 'A porção nutricional é o modo de uso?',
      answer: `Não necessariamente. A ficha informa a porção de referência ${profile.serving}, mas o modo de uso deve ser confirmado no rótulo físico vigente.`,
    })
  }

  faqs.push(
    {
      question: 'Este informativo substitui o rótulo ou orientação profissional?',
      answer: 'Não. Ele organiza os dados técnicos localizados. Em caso de diferença, prevalecem o rótulo físico vigente, o lote comercial e a validação regulatória.',
    },
    {
      question: 'Quando a loja estará disponível?',
      answer: 'A loja ainda está em preparação. O botão de compra abre apenas o aviso “Loja em breve” e não direciona para nenhuma página de compra.',
    },
  )

  return faqs
}
