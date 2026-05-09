export interface Ingrediente {
  nome: string;
  descricao: string;
  icone: string;
}

export interface ProdutoDetail {
  id: number;
  subtitulo: string;
  categoria: string;
  composicao: Ingrediente[];
  modo_uso: string;
  diferenciais: string[];
  cor_principal: string;
  cor_secundaria: string;
}

export const productDetailsMap: Record<number, ProdutoDetail> = {
  // Articulações e Mobilidade
  1: {
    id: 1,
    subtitulo: "Suporte completo para articulações e mobilidade",
    categoria: "Articulações e Mobilidade",
    composicao: [
      {
        nome: "Colágeno Tipo II",
        descricao: "Proteína estrutural que complementa a saúde articular",
        icone: "Hexagon",
      },
      {
        nome: "Ácido Hialurônico",
        descricao: "Componente importante para manutenção da cartilagem",
        icone: "Droplet",
      },
      {
        nome: "Cúrcuma",
        descricao: "Ingrediente natural para complementar a rotina",
        icone: "Leaf",
      },
      {
        nome: "Glucosamina",
        descricao: "Aminoácido natural que apoia a estrutura articular",
        icone: "Zap",
      },
    ],
    modo_uso:
      "Conforme recomendação do fabricante ou de um profissional habilitado.",
    diferenciais: [
      "Fórmula completa com 4 componentes essenciais",
      "Produto lacrado e seguro",
      "Desenvolvimento com rigor técnico",
    ],
    cor_principal: "#2563eb",
    cor_secundaria: "#dbeafe",
  },

  5: {
    id: 5,
    subtitulo: "Complexo articular com cúrcuma para rotina completa",
    categoria: "Articulações e Mobilidade",
    composicao: [
      {
        nome: "Cúrcuma",
        descricao: "Ingrediente natural da Índia com propriedades antioxidantes",
        icone: "Leaf",
      },
      {
        nome: "Colágeno Tipo II",
        descricao: "Principal proteína estrutural das articulações",
        icone: "Hexagon",
      },
      {
        nome: "Vitamina C",
        descricao: "Complementa a absorção e síntese de colágeno",
        icone: "Apple",
      },
    ],
    modo_uso:
      "1 comprimido ao dia, conforme orientação do fabricante ou profissional.",
    diferenciais: [
      "Fórmula com cúrcuma potencializada",
      "Sem glúten, sem lactose",
      "Produto 100% lacrado",
    ],
    cor_principal: "#a0a0a0",
    cor_secundaria: "#f3f4f6",
  },

  // Vitaminas e Nutrição
  3: {
    id: 3,
    subtitulo: "Ubiquinona para energia celular e bem-estar",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "Coenzima Q10",
        descricao: "Molécula natural presente nas células, apoia a energia",
        icone: "Zap",
      },
    ],
    modo_uso:
      "60 cápsulas por embalagem. Usar conforme indicação no rótulo.",
    diferenciais: [
      "Suplemento natural de alta qualidade",
      "Sem aditivos prejudiciais",
      "Cápsulas fáceis de consumir",
    ],
    cor_principal: "#861878",
    cor_secundaria: "#fce7f3",
  },

  7: {
    id: 7,
    subtitulo: "5 formas de magnésio para complementar a rotina",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "Magnésio",
        descricao: "Mineral essencial em 5 formas diferentes para melhor absorção",
        icone: "Zap",
      },
    ],
    modo_uso:
      "1 cápsula ao dia, ou conforme orientação de profissional habilitado.",
    diferenciais: [
      "5 formas diferentes de magnésio",
      "Fórmula exclusiva",
      "Complementa a ingestão diária de magnésio",
    ],
    cor_principal: "#676c81",
    cor_secundaria: "#f3f4f6",
  },

  14: {
    id: 14,
    subtitulo: "Vitamina B12 ativa para complementar a nutrição",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "Metilcobalamina",
        descricao: "Forma ativa de B12, absorção eficiente",
        icone: "Pill",
      },
    ],
    modo_uso:
      "Conforme orientação do rótulo ou profissional habilitado. Não exceder a dose recomendada.",
    diferenciais: [
      "Forma ativa de vitamina B12",
      "Sem corantes ou conservantes",
      "Complementa a alimentação vegetariana",
    ],
    cor_principal: "#bd797a",
    cor_secundaria: "#ffe4e6",
  },

  // Fibras
  8: {
    id: 8,
    subtitulo: "Geleia com fibras naturais para rotina alimentar",
    categoria: "Fibras e Rotina Alimentar",
    composicao: [
      {
        nome: "Fibras Naturais",
        descricao: "Fonte de fibra solúvel para complementar a rotina",
        icone: "Wheat",
      },
      {
        nome: "Ameixa",
        descricao: "Fruta natural com fibras, sabor agradável",
        icone: "Apple",
      },
      {
        nome: "Tamarindo",
        descricao: "Ingrediente natural que enriquece a fórmula",
        icone: "Leaf",
      },
      {
        nome: "Inulina",
        descricao: "Fibra prebiótica que complementa a alimentação",
        icone: "Zap",
      },
      {
        nome: "FOS",
        descricao: "Oligossacarídeos que complementam a microbiota",
        icone: "Droplet",
      },
    ],
    modo_uso:
      "Consumir conforme recomendação no rótulo. Acompanhar com ingestão adequada de água.",
    diferenciais: [
      "Geleia com sabor agradável",
      "Fibras de múltiplas fontes",
      "Sem glúten, sem lactose",
    ],
    cor_principal: "#7f7f7f",
    cor_secundaria: "#f3f4f6",
  },

  // Compostos Naturais
  6: {
    id: 6,
    subtitulo: "Extrato vegetal de Pinus para complementar a rotina",
    categoria: "Compostos Naturais",
    composicao: [
      {
        nome: "Pinus pinaster",
        descricao: "Extrato natural do pinheiro marítimo francês",
        icone: "Tree",
      },
    ],
    modo_uso:
      "Conforme orientação do fabricante. Consulte profissional se necessário.",
    diferenciais: [
      "Origem: Pinheiro marítimo francês",
      "Procedência garantida",
      "Complementa hábitos alimentares equilibrados",
    ],
    cor_principal: "#fdd284",
    cor_secundaria: "#fef3c7",
  },

  // Cálcio
  19: {
    id: 19,
    subtitulo: "Cálcio para gestantes e complemento alimentar",
    categoria: "Cálcio e Saúde Óssea",
    composicao: [
      {
        nome: "Carbonato de Cálcio",
        descricao: "Forma de cálcio elementar bem absorvida",
        icone: "Zap",
      },
    ],
    modo_uso: "Conforme recomendação médica ou no rótulo do produto.",
    diferenciais: [
      "Específico para gestantes",
      "500mg de cálcio elementar",
      "Complementa a ingestão diária recomendada",
    ],
    cor_principal: "#575757",
    cor_secundaria: "#f3f4f6",
  },

  // Outros
  2: {
    id: 2,
    subtitulo: "Carvão ativado para complementar a rotina",
    categoria: "Outros Suplementos",
    composicao: [
      {
        nome: "Carvão Vegetal Ativado",
        descricao: "Ingrediente natural para suplementação",
        icone: "Zap",
      },
    ],
    modo_uso:
      "Conforme indicação no rótulo. Manter espaçamento entre a ingestão de medicamentos.",
    diferenciais: [
      "Sem glúten, sem lactose",
      "Vegano",
      "Complementa a rotina de bem-estar",
    ],
    cor_principal: "#333333",
    cor_secundaria: "#f3f4f6",
  },

  4: {
    id: 4,
    subtitulo: "Suplemento multivitamínico para nutrição completa",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "Vitaminas e Minerais",
        descricao: "Fórmula com múltiplos nutrientes essenciais",
        icone: "Pill",
      },
    ],
    modo_uso:
      "1 cápsula ao dia com alimento. Não exceder a dose recomendada.",
    diferenciais: [
      "Fórmula multivitamínica completa",
      "Para complementar a alimentação diária",
      "Produto lacrado e seguro",
    ],
    cor_principal: "#c6e0eb",
    cor_secundaria: "#dbeafe",
  },

  10: {
    id: 10,
    subtitulo: "Melatonina em gotas para complementar o descanso",
    categoria: "Melatonina e Sono",
    composicao: [
      {
        nome: "Melatonina",
        descricao: "Hormônio natural em forma concentrada",
        icone: "Moon",
      },
    ],
    modo_uso:
      "Conforme orientação no rótulo. Usar 15-30 minutos antes de dormir.",
    diferenciais: [
      "Formato em gotas",
      "Absorção rápida",
      "Complementa a qualidade do descanso",
    ],
    cor_principal: "#002659",
    cor_secundaria: "#dbeafe",
  },

  15: {
    id: 15,
    subtitulo: "Folato para gestantes e complemento de vitaminas B",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "Folato",
        descricao: "Vitamina B essencial para gestantes",
        icone: "Pill",
      },
      {
        nome: "Vitamina B12",
        descricao: "Complementa a absorção de nutrientes",
        icone: "Pill",
      },
      {
        nome: "Vitamina B6",
        descricao: "Parte da fórmula de suporte nutricional",
        icone: "Pill",
      },
    ],
    modo_uso: "Conforme orientação médica ou no rótulo do produto.",
    diferenciais: [
      "Específico para gestantes",
      "Sem indicação terapêutica",
      "Complementa a ingestão recomendada",
    ],
    cor_principal: "#3f999f",
    cor_secundaria: "#ccf0f1",
  },

  18: {
    id: 18,
    subtitulo: "N-acetilcisteína para complementar a nutrição",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "N-acetilcisteína (NAC)",
        descricao: "Aminoácido com propriedades antioxidantes",
        icone: "Zap",
      },
    ],
    modo_uso:
      "600mg por cápsula. Conforme recomendação profissional ou rótulo.",
    diferenciais: [
      "Fórmula vegana",
      "Sem glúten, sem lactose",
      "Complementa a nutrição antioxidante",
    ],
    cor_principal: "#232a65",
    cor_secundaria: "#dbeafe",
  },

  23: {
    id: 23,
    subtitulo: "Vitamina B12 sublingual para absorção rápida",
    categoria: "Vitaminas e Nutrição",
    composicao: [
      {
        nome: "Cobalamina Ativa",
        descricao: "Forma ativa de B12 para absorção eficiente",
        icone: "Pill",
      },
    ],
    modo_uso:
      "1 comprimido sublingual ao dia. Deixar dissolver sob a língua.",
    diferenciais: [
      "Formato sublingual",
      "Absorção rápida e eficiente",
      "Complementa a nutrição de vegetarianos",
    ],
    cor_principal: "#333333",
    cor_secundaria: "#f3f4f6",
  },
};

export function getProductDetail(productId: number): ProdutoDetail | null {
  return productDetailsMap[productId] || null;
}
