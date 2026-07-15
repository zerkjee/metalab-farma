export type InovitannDesignContent = {
  image: string
  accent: string
  compositionTitle: string
  compositionDescription: string
  quickFacts: string[]
}

export const inovitannDesignBySlug: Record<string, InovitannDesignContent> = {
  'inovitann-biotina-plus-60-capsulas': {
    image: '/products/inovitann/v2/biotina-plus.png',
    accent: '#BF3465',
    compositionTitle: 'Biotina (Vitamina B7) - 150% da IDR',
    compositionDescription:
      'Vitamina essencial do complexo B, desenvolvida para complementar a rotina de cuidados com cabelos, pele e unhas.',
    quickFacts: ['60 cápsulas', '150% IDR', 'Cabelos e unhas'],
  },
  'inovitann-cloreto-de-magnesio-pa-60-capsulas': {
    image: '/products/inovitann/v2/cloreto-magnesio.png',
    accent: '#6C2B7C',
    compositionTitle: 'Cloreto de Magnésio P.A.',
    compositionDescription:
      'Fonte de magnésio com grau de pureza analítica, selecionada para apoiar funções musculares, nervosas e metabólicas.',
    quickFacts: ['60 cápsulas', 'P.A.', 'Magnésio'],
  },
  'inovitann-cloreto-magnesio-60caps-kit-3': {
    image: '/products/inovitann/v2/cloreto-magnesio.png',
    accent: '#6C2B7C',
    compositionTitle: 'Cloreto de Magnésio P.A. - Kit 3',
    compositionDescription:
      'Três frascos para uma rotina contínua de suplementação com magnésio de alta pureza.',
    quickFacts: ['Kit 3 unidades', '180 cápsulas', 'Magnésio'],
  },
  'inovitann-coenzima-q10-plus-60-capsulas': {
    image: '/products/inovitann/v2/coenzima-q10-plus.png',
    accent: '#901C82',
    compositionTitle: 'Coenzima Q10 Plus',
    compositionDescription:
      'Composto formulado para apoiar a produção energética celular e a proteção antioxidante diária.',
    quickFacts: ['60 cápsulas', 'Q10', 'Energia celular'],
  },
  'inovitann-curcuma-plus-60-capsulas': {
    image: '/products/inovitann/v2/curcuma-plus.png',
    accent: '#BA7A0D',
    compositionTitle: 'Cúrcuma Plus',
    compositionDescription:
      'Formulação com cúrcuma em cápsulas, pensada para complementar a rotina com compostos bioativos de origem vegetal.',
    quickFacts: ['60 cápsulas', '1x ao dia', 'Extrato vegetal'],
  },
  'inovitann-luteina-zeaxantina-60-capsulas': {
    image: '/products/inovitann/v2/luteina-zeaxantina.png',
    accent: '#0A6AA1',
    compositionTitle: 'Luteína + Zeaxantina',
    compositionDescription:
      'Carotenoides naturalmente presentes na mácula, usados como suporte nutricional para a rotina de cuidado ocular.',
    quickFacts: ['60 cápsulas', 'Carotenoides', 'Visão'],
  },
  'inovitann-magnesio-l-treonato-60-capsulas': {
    image: '/products/inovitann/v2/magnesio-l-treonina.png',
    accent: '#6A9028',
    compositionTitle: 'Magnésio L-Treonato',
    compositionDescription:
      'Forma especializada de magnésio associada ao suporte do sistema nervoso e à rotina de desempenho cognitivo.',
    quickFacts: ['60 cápsulas', 'L-Treonato', 'Cognição'],
  },
  'inovitann-metilcobalamina-b12-60-capsulas': {
    image: '/products/inovitann/v2/metilcobalamina-b12.png',
    accent: '#7F2727',
    compositionTitle: 'Metilcobalamina (Vitamina B12)',
    compositionDescription:
      'Forma ativa da vitamina B12, escolhida para complementar a rotina de energia, metabolismo e sistema nervoso.',
    quickFacts: ['60 cápsulas', 'B12 ativa', 'Metabolismo'],
  },
  'inovitann-nac-600mg-60-capsulas': {
    image: '/products/inovitann/v2/nac-ultra.png',
    accent: '#2D346F',
    compositionTitle: 'N-Acetil L-Cisteína - 600mg',
    compositionDescription:
      'Aminoácido precursor da glutationa, desenvolvido para suporte antioxidante e defesa celular.',
    quickFacts: ['60 cápsulas', '600mg', 'Antioxidante'],
  },
  'inovitann-penta-magnesio-60-capsulas': {
    image: '/products/inovitann/v2/magnesio-penta.png',
    accent: '#416E70',
    compositionTitle: 'Magnésio Penta',
    compositionDescription:
      'Blend com cinco formas de magnésio para cobertura nutricional ampla em uma única fórmula.',
    quickFacts: ['60 cápsulas', '5 formas', 'Magnésio'],
  },
  'inovitann-trimagnesio-ultra-60-capsulas': {
    image: '/products/inovitann/v2/tri-magnesio-ultra.png',
    accent: '#C6601D',
    compositionTitle: 'Tri Magnésio Ultra',
    compositionDescription:
      'Associação de três formas de magnésio para apoiar rotina muscular, nervosa e metabólica.',
    quickFacts: ['60 cápsulas', '3 formas', 'Alta absorção'],
  },
  'inovitann-vitamina-k-ultra-60-capsulas': {
    image: '/products/inovitann/v2/vitamina-k-ultra.png',
    accent: '#2B7D3D',
    compositionTitle: 'Vitamina K Ultra',
    compositionDescription:
      'Vitamina K em cápsulas para complementar a rotina nutricional ligada ao metabolismo do cálcio.',
    quickFacts: ['60 cápsulas', 'Vitamina K', 'Ossos'],
  },
}

export function getInovitannDesignContent(slug: string) {
  return inovitannDesignBySlug[slug] ?? null
}

export function getInovitannDesignImage(slug: string) {
  return getInovitannDesignContent(slug)?.image ?? null
}
