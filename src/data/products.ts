export interface KeyIngredient {
  name: string
  amount: string
  benefit: string
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  shortDesc: string
  price: number
  originalPrice: number
  rating: number
  reviewCount: number
  badge?: "bestseller" | "new" | "sale" | "popular"
  inStock: boolean
  capsules?: string
  weight?: string
  color: string
  benefits?: string[]
  keyIngredients?: KeyIngredient[]
  usage?: string
  highlights?: string[]
}

export const products: Product[] = [
  {
    id: "vitamina-c-1000",
    name: "Vitamina C 1000mg",
    category: "Vitaminas",
    description: "Ácido ascórbico de alta pureza com bioflavonoides cítricos para melhor absorção.",
    shortDesc: "60 cápsulas · Ácido Ascórbico + Bioflavonoides",
    price: 39.90,
    originalPrice: 49.90,
    rating: 4.9,
    reviewCount: 312,
    badge: "bestseller",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#6b5bf0",
    benefits: [
      "Reforça o sistema imunológico e a defesa celular",
      "Potente antioxidante contra radicais livres",
      "Estimula a síntese natural de colágeno",
      "Aumenta a absorção de ferro não-heme",
    ],
    keyIngredients: [
      {
        name: "Ácido Ascórbico",
        amount: "1000mg",
        benefit: "Vitamina C de alta pureza — forma biologicamente ativa e estável.",
      },
      {
        name: "Bioflavonoides Cítricos",
        amount: "50mg",
        benefit: "Potencializam a absorção e prolongam a ação antioxidante da vitamina C.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia, preferencialmente com as refeições. Pode ser tomada em jejum.",
    highlights: [
      "Bioflavonoides para maior absorção",
      "Alta biodisponibilidade",
      "Sem glúten e sem lactose",
    ],
  },
  {
    id: "omega-3-1000",
    name: "Ômega 3 1000mg",
    category: "Ômegas",
    description: "Óleo de peixe concentrado com alto teor de EPA e DHA, livre de mercúrio.",
    shortDesc: "60 cápsulas · EPA 360mg + DHA 240mg",
    price: 54.90,
    originalPrice: 69.90,
    rating: 4.8,
    reviewCount: 248,
    inStock: true,
    capsules: "60 cápsulas",
    color: "#2563eb",
    benefits: [
      "Saúde cardiovascular — reduz triglicerídeos",
      "Função cognitiva, memória e foco",
      "Reduz inflamação sistêmica crônica",
      "Saúde ocular e proteção da retina",
    ],
    keyIngredients: [
      {
        name: "EPA",
        amount: "360mg",
        benefit: "Ácido eicosapentaenoico — anti-inflamatório e protetor cardiovascular.",
      },
      {
        name: "DHA",
        amount: "240mg",
        benefit: "Ácido docosahexaenoico — componente essencial das membranas neuronais.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia com alimentos. Preferencialmente durante o almoço ou jantar.",
    highlights: [
      "Óleo de peixe ultra-purificado por destilação molecular",
      "Livre de metais pesados e PCBs",
      "Sem gosto residual de peixe",
    ],
  },
  {
    id: "magnesio-quelato",
    name: "Magnésio Quelato",
    category: "Minerais",
    description: "Bisglicinato de magnésio com alta biodisponibilidade e absorção superior.",
    shortDesc: "60 cápsulas · Bisglicinato 500mg",
    price: 62.90,
    originalPrice: 79.90,
    rating: 4.9,
    reviewCount: 187,
    badge: "new",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#0d9488",
    benefits: [
      "Relaxamento muscular e alívio de tensão",
      "Melhora a qualidade e a profundidade do sono",
      "Saúde óssea e cardiovascular",
      "Reduz cãibras, espasmos e câimbras",
    ],
    keyIngredients: [
      {
        name: "Bisglicinato de Magnésio",
        amount: "500mg",
        benefit: "Forma quelada ligada à glicina — absorção 3× superior ao óxido de magnésio.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia, preferencialmente à noite antes de dormir para potencializar o relaxamento.",
    highlights: [
      "Forma bisglicinato de máxima biodisponibilidade",
      "Sem efeito laxativo",
      "Não irrita o trato gastrointestinal",
    ],
  },
  {
    id: "colageno-hidrolisado",
    name: "Colágeno Hidrolisado",
    category: "Proteínas",
    description: "Peptídeos de colágeno tipo I e II com vitamina C para máxima síntese.",
    shortDesc: "300g · Tipo I e II · Sabor Neutro",
    price: 71.90,
    originalPrice: 89.90,
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    weight: "300g",
    color: "#92400e",
    benefits: [
      "Firmeza, elasticidade e luminosidade da pele",
      "Saúde das articulações e cartilagens",
      "Fortalece unhas, cabelos e ossos",
      "Recuperação muscular pós-exercício",
    ],
    keyIngredients: [
      {
        name: "Colágeno Tipo I",
        amount: "150g",
        benefit: "Principal proteína estrutural da pele, tendões e ligamentos.",
      },
      {
        name: "Colágeno Tipo II",
        amount: "150g",
        benefit: "Componente essencial da cartilagem articular e fluido sinovial.",
      },
      {
        name: "Vitamina C",
        amount: "500mg",
        benefit: "Cofator enzimático indispensável para a síntese endógena de colágeno.",
      },
    ],
    usage: "Misturar 10g (1 colher de sopa rasa) em água, suco ou smoothie 1 vez ao dia. Consumir preferencialmente com vitamina C.",
    highlights: [
      "Peptídeos de baixo peso molecular — absorção intestinal otimizada",
      "Absorção até 3× superior ao colágeno nativo intacto",
      "Sabor neutro — mistura em qualquer bebida sem alterar o sabor",
    ],
  },
  {
    id: "vitamina-d3-k2",
    name: "Vitamina D3 + K2",
    category: "Vitaminas",
    description: "Combinação sinérgica de D3 (colecalciferol) e K2 (MK-7) para saúde óssea.",
    shortDesc: "60 cápsulas · 2000UI + MK-7 100mcg",
    price: 47.90,
    originalPrice: 59.90,
    rating: 4.8,
    reviewCount: 203,
    badge: "popular",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#d97706",
    benefits: [
      "Absorção de cálcio e formação óssea",
      "Fortalecimento do sistema imunológico",
      "Saúde cardiovascular — previne calcificação arterial",
      "Equilíbrio hormonal e bem-estar geral",
    ],
    keyIngredients: [
      {
        name: "Colecalciferol (D3)",
        amount: "2000 UI",
        benefit: "Forma mais biodisponível da vitamina D — produzida naturalmente pela pele.",
      },
      {
        name: "Menaquinona-7 (K2 MK-7)",
        amount: "100mcg",
        benefit: "Forma de vitamina K2 com maior meia-vida — direciona o cálcio para os ossos e não para as artérias.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia com uma refeição que contenha gordura, pois D3 e K2 são vitaminas lipossolúveis.",
    highlights: [
      "Sinergia D3 + K2 para saúde óssea completa",
      "K2 MK-7 com meia-vida de 72 horas",
      "Base oleosa para máxima absorção das vitaminas lipossolúveis",
    ],
  },
  {
    id: "complexo-b",
    name: "Complexo B",
    category: "Complexos",
    description: "Fórmula completa com todas as vitaminas do complexo B em formas ativas.",
    shortDesc: "60 cápsulas · B1 B2 B3 B5 B6 B7 B9 B12",
    price: 34.90,
    originalPrice: 44.90,
    rating: 4.7,
    reviewCount: 134,
    inStock: true,
    capsules: "60 cápsulas",
    color: "#7c3aed",
    benefits: [
      "Energia e metabolismo celular eficiente",
      "Saúde do sistema nervoso central",
      "Produção de glóbulos vermelhos e prevenção de anemia",
      "Redução de cansaço, fadiga e névoa mental",
    ],
    keyIngredients: [
      {
        name: "B6 (Piridoxal-5-Fosfato)",
        amount: "1,4mg",
        benefit: "Forma ativa biologicamente disponível — metabolismo de proteínas e neurotransmissores.",
      },
      {
        name: "B9 (Metilfolato)",
        amount: "400mcg",
        benefit: "Forma ativa do folato — essencial para o ciclo da metilação e síntese de DNA.",
      },
      {
        name: "B12 (Metilcobalamina)",
        amount: "2,4mcg",
        benefit: "Forma neurologicamente ativa — saúde do sistema nervoso e formação de eritrócitos.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia com alimentos. Ideal pela manhã para aproveitar o efeito energizante ao longo do dia.",
    highlights: [
      "Todas as vitaminas B nas formas metiladas e ativas",
      "Absorção superior às formas sintéticas convencionais",
      "Indicado para quem tem polimorfismo MTHFR",
    ],
  },
  {
    id: "zinco-quelato",
    name: "Zinco Quelato 30mg",
    category: "Minerais",
    description: "Bisglicinato de zinco com absorção otimizada e sem irritação gástrica.",
    shortDesc: "60 cápsulas · Bisglicinato de Zinco",
    price: 29.90,
    originalPrice: 39.90,
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    capsules: "60 cápsulas",
    color: "#475569",
    benefits: [
      "Imunidade robusta e defesa antioxidante",
      "Saúde da pele, cicatrização e renovação celular",
      "Fertilidade masculina e feminina — síntese de testosterona",
      "Manutenção dos sentidos do olfato e paladar",
    ],
    keyIngredients: [
      {
        name: "Bisglicinato de Zinco",
        amount: "30mg",
        benefit: "Forma quelada ligada à glicina — biodisponibilidade 3× superior ao sulfato ou óxido de zinco.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia, longe de refeições ricas em fibras ou cálcio para maximizar a absorção do zinco.",
    highlights: [
      "Forma bisglicinato — máxima absorção intestinal",
      "Dose terapêutica de 30mg por cápsula",
      "Zero irritação gástrica — tolerância total",
    ],
  },
  {
    id: "ashwagandha-ks66",
    name: "Ashwagandha KS-66",
    category: "Adaptógenos",
    description: "Extrato padronizado KSM-66® com 5% de witanolídeos, o mais estudado do mercado.",
    shortDesc: "60 cápsulas · KSM-66® 600mg",
    price: 89.90,
    originalPrice: 109.90,
    rating: 4.9,
    reviewCount: 276,
    badge: "bestseller",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#15803d",
    benefits: [
      "Reduz cortisol e alivia estresse crônico",
      "Melhora a qualidade e a restauração do sono",
      "Aumenta energia, vitalidade e resistência física",
      "Equilíbrio hormonal — cortisol, testosterona e tireoide",
    ],
    keyIngredients: [
      {
        name: "KSM-66® Ashwagandha",
        amount: "600mg",
        benefit: "Extrato de raiz patenteado, padronizado em 5% de witanolídeos — respaldado por 22 estudos clínicos.",
      },
    ],
    usage: "Tomar 1 cápsula ao dia, preferencialmente à noite antes de dormir para potencializar os efeitos adaptogênicos e restauradores.",
    highlights: [
      "KSM-66® com 22 estudos clínicos publicados",
      "5% de witanolídeos — máxima concentração dos princípios ativos",
      "Cultivado e processado organicamente na Índia",
    ],
  },
]
