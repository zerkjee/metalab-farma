export interface InovitannBeneficio {
  icone: string
  titulo: string
  descricao: string
}

export interface InovitannEstatistica {
  valor: string
  rotulo: string
}

export interface InovitannTheme {
  slug: string
  cor: string
  corSecundaria: string
  nome: string
  tagline: string
  copyAbertura: string
  mecanismo: string
  beneficios: InovitannBeneficio[]
  sistemas: string[]
  estatisticas: InovitannEstatistica[]
  pesquisa: { destaque: string; fonte: string }
  modoDeUso: string
  temaVisual:
    | 'neural'
    | 'ocular'
    | 'muscular'
    | 'mitocondrial'
    | 'molecular'
    | 'osseo'
    | 'antioxidante'
    | 'capilar'
    | 'inflamatorio'
  elementos: string[]
  imagemLocal: string
}

export const inovitannThemes: Record<string, InovitannTheme> = {
  'inovitann-cloreto-de-magnesio-pa-60-capsulas': {
    slug: 'inovitann-cloreto-de-magnesio-pa-60-capsulas',
    cor: '#7c3aed',
    corSecundaria: '#a78bfa',
    nome: 'Cloreto de Magnésio PA',
    tagline: 'O magnésio que seu corpo reconhece e absorve',
    copyAbertura:
      'Pureza analítica em cada cápsula. O Cloreto de Magnésio P.A. oferece o íon Mg²⁺ em forma de alta solubilidade, favorecendo a absorção intestinal e cobrindo mais de 300 funções essenciais do organismo.',
    mecanismo:
      'O íon Mg²⁺ atua como cofator em mais de 300 reações enzimáticas do organismo, incluindo a síntese de ATP, a contração e o relaxamento muscular e a condução de impulsos nervosos. A forma de cloreto de alta pureza (P.A.) apresenta excelente solubilidade aquosa, favorecendo a ionização no trato digestivo e a absorção intestinal eficiente. O magnésio também participa da regulação dos canais iônicos de cálcio e sódio nas membranas celulares.',
    beneficios: [
      {
        icone: 'Activity',
        titulo: 'Função muscular e recuperação',
        descricao:
          'Fornece magnésio para apoiar o relaxamento das fibras musculares após esforço físico, contribuindo para o conforto e a recuperação da musculatura.',
      },
      {
        icone: 'Brain',
        titulo: 'Equilíbrio do sistema nervoso',
        descricao:
          'Complementa a dieta com magnésio, mineral essencial para a transmissão de sinais nervosos e para a manutenção do estado de calma e bem-estar.',
      },
      {
        icone: 'Zap',
        titulo: 'Metabolismo energético',
        descricao:
          'Participa das reações de síntese de ATP, apoiando os processos bioquímicos que fornecem energia às células do organismo.',
      },
      {
        icone: 'Shield',
        titulo: 'Saúde óssea',
        descricao:
          'Contribui com o aporte de magnésio para a estrutura mineral dos ossos, em conjunto com cálcio e vitamina D na manutenção da densidade óssea.',
      },
    ],
    sistemas: ['Sistema Muscular', 'Sistema Nervoso', 'Ossos', 'Metabolismo'],
    estatisticas: [
      { valor: '300+', rotulo: 'reações enzimáticas' },
      { valor: '70%', rotulo: 'adultos com baixo aporte' },
      { valor: 'P.A.', rotulo: 'grau de pureza analítica' },
    ],
    pesquisa: {
      destaque:
        'O magnésio é cofator em mais de 300 reações enzimáticas e sua deficiência está associada à fadiga muscular, irritabilidade e prejuízo no sono.',
      fonte: 'Nutrition Reviews, 2012 · DiNicolantonio et al.',
    },
    modoDeUso: '1 a 2 cápsulas ao dia, preferencialmente com refeições.',
    temaVisual: 'muscular',
    elementos: ['cristal iônico Mg²⁺/Cl⁻', 'ondas de campo elétrico', 'fibras musculares', 'molécula de ATP'],
    imagemLocal: '/products/inovitann/1.png',
  },

  'inovitann-cloreto-magnesio-60caps-kit-3': {
    slug: 'inovitann-cloreto-magnesio-60caps-kit-3',
    cor: '#7c3aed',
    corSecundaria: '#a78bfa',
    nome: 'Cloreto de Magnésio PA · Kit 3',
    tagline: 'O magnésio que seu corpo reconhece e absorve',
    copyAbertura:
      'Três meses de suplementação contínua com o melhor custo-benefício. O Magnésio P.A. em dose diária constante é a forma mais eficaz de manter os níveis adequados do mineral no organismo.',
    mecanismo:
      'O íon Mg²⁺ atua como cofator em mais de 300 reações enzimáticas do organismo, incluindo a síntese de ATP, a contração e o relaxamento muscular e a condução de impulsos nervosos. A forma de cloreto de alta pureza (P.A.) apresenta excelente solubilidade aquosa, favorecendo a ionização no trato digestivo e a absorção intestinal eficiente. O magnésio também participa da regulação dos canais iônicos de cálcio e sódio nas membranas celulares.',
    beneficios: [
      {
        icone: 'Activity',
        titulo: 'Função muscular e recuperação',
        descricao:
          'Fornece magnésio para apoiar o relaxamento das fibras musculares após esforço físico, contribuindo para o conforto e a recuperação da musculatura.',
      },
      {
        icone: 'Brain',
        titulo: 'Equilíbrio do sistema nervoso',
        descricao:
          'Complementa a dieta com magnésio, mineral essencial para a transmissão de sinais nervosos e para a manutenção do estado de calma e bem-estar.',
      },
      {
        icone: 'Zap',
        titulo: 'Metabolismo energético',
        descricao:
          'Participa das reações de síntese de ATP, apoiando os processos bioquímicos que fornecem energia às células do organismo.',
      },
      {
        icone: 'Package',
        titulo: 'Kit Econômico',
        descricao:
          'Três meses de suplementação contínua num único pedido — melhor custo-benefício e sem interrupções na sua rotina.',
      },
    ],
    sistemas: ['Sistema Muscular', 'Sistema Nervoso', 'Metabolismo'],
    estatisticas: [
      { valor: '3×', rotulo: 'meses de suplementação' },
      { valor: '300+', rotulo: 'reações enzimáticas' },
      { valor: 'P.A.', rotulo: 'grau de pureza analítica' },
    ],
    pesquisa: {
      destaque:
        'Suplementação contínua por 12 semanas foi associada a melhora significativa nos níveis séricos de magnésio em adultos com baixa ingestão dietética.',
      fonte: 'Magnesium Research, 2019 · Kass et al.',
    },
    modoDeUso: '1 a 2 cápsulas ao dia, preferencialmente com refeições.',
    temaVisual: 'muscular',
    elementos: ['cristal iônico Mg²⁺/Cl⁻', 'fibras musculares', 'mineral'],
    imagemLocal: '/products/inovitann/1.png',
  },

  'inovitann-nac-600mg-60-capsulas': {
    slug: 'inovitann-nac-600mg-60-capsulas',
    cor: '#1e3a8a',
    corSecundaria: '#3b82f6',
    nome: 'NAC 600mg Ultra',
    tagline: 'O precursor que ativa o escudo antioxidante do seu organismo',
    copyAbertura:
      'A N-Acetil L-Cisteína eleva os níveis intracelulares de glutationa — o antioxidante mestre — em praticamente todos os tecidos, reforçando as defesas naturais do organismo contra o estresse oxidativo.',
    mecanismo:
      'A N-Acetil L-Cisteína (NAC) é um derivado acetilado da L-cisteína com superior biodisponibilidade oral. No organismo, é desacetilada a L-cisteína, o aminoácido limitante na síntese de glutationa (GSH) — o principal antioxidante endógeno. A NAC eleva intracelularmente os níveis de GSH em praticamente todos os tecidos, potencializando a via da glutationa-peroxidase. Adicionalmente, age diretamente como antioxidante por meio da sulfidrila livre (-SH) e modula vias inflamatórias dependentes de NF-κB.',
    beneficios: [
      {
        icone: 'Shield',
        titulo: 'Apoio à síntese de glutationa',
        descricao:
          'Fornece L-cisteína biodisponível, o aminoácido limitante da produção de glutationa — o antioxidante mestre do organismo.',
      },
      {
        icone: 'Leaf',
        titulo: 'Defesa antioxidante ampla',
        descricao:
          'Contribui para neutralizar radicais livres diretamente e de forma indireta via glutationa, apoiando a integridade celular.',
      },
      {
        icone: 'Heart',
        titulo: 'Suporte hepatoprotetor',
        descricao:
          'O fígado é o principal órgão de síntese de glutationa; a suplementação de NAC complementa o suporte antioxidante hepático.',
      },
      {
        icone: 'Wind',
        titulo: 'Saúde respiratória',
        descricao:
          'A NAC tem propriedades mucolíticas, contribuindo para a fluidez das secreções respiratórias e conforto das vias aéreas.',
      },
    ],
    sistemas: ['Sistema Imunológico', 'Fígado', 'Sistema Respiratório', 'Células'],
    estatisticas: [
      { valor: '600mg', rotulo: 'por cápsula' },
      { valor: 'GSH', rotulo: 'precursor direto' },
      { valor: 'NF-κB', rotulo: 'via inflamatória modulada' },
    ],
    pesquisa: {
      destaque:
        'A NAC é o precursor mais eficaz da glutationa por via oral, elevando seus níveis intracelulares em múltiplos tecidos, incluindo pulmão, fígado e células imunes.',
      fonte: 'Free Radical Biology & Medicine, 2018 · Aldini et al.',
    },
    modoDeUso: '1 a 2 cápsulas ao dia, em jejum ou com refeições leves.',
    temaVisual: 'antioxidante',
    elementos: ['escudo hexagonal de glutationa', 'radicais livres interceptados', 'ciclo NAC → GSH'],
    imagemLocal: '/products/inovitann/7.png',
  },

  'inovitann-penta-magnesio-60-capsulas': {
    slug: 'inovitann-penta-magnesio-60-capsulas',
    cor: '#2d7d6a',
    corSecundaria: '#34d399',
    nome: 'Penta Magnésio',
    tagline: 'Cinco formas. Um mineral. Cobertura total para o seu organismo',
    copyAbertura:
      'Cada forma de magnésio chega a um tecido diferente. O Penta Magnésio combina bisglicinato, malato, citrato, taurato e treonato para uma cobertura completa: músculo, coração, cérebro e ossos em um único suplemento.',
    mecanismo:
      'O Magnésio Penta combina cinco formas quimicamente distintas de magnésio — bisglicinato, malato, citrato, taurato e treonato — cada uma com perfil de absorção e afinidade tecidual diferenciados. O bisglicinato tem alta tolerância GI e absorção por transporte ativo de aminoácidos. O malato apoia o ciclo de Krebs. O citrato oferece alta solubilidade aquosa. O taurato tem afinidade especial pelo tecido cardiovascular. O treonato cruza a barreira hematoencefálica. A sinergia das cinco formas garante saturação abrangente nos tecidos-alvo.',
    beneficios: [
      {
        icone: 'Layers',
        titulo: 'Cobertura completa de tecidos',
        descricao:
          'As cinco formas complementares chegam a diferentes tecidos — músculo, coração, sistema nervoso e ossos — maximizando o aporte total de magnésio.',
      },
      {
        icone: 'Zap',
        titulo: 'Alta biodisponibilidade combinada',
        descricao:
          'A variedade de ligantes orgânicos garante múltiplas rotas de absorção intestinal, reduzindo perdas e aumentando o aproveitamento pelo organismo.',
      },
      {
        icone: 'Activity',
        titulo: 'Suporte muscular e cardiovascular',
        descricao:
          'Uma única formulação cobre as principais necessidades de magnésio do organismo adulto ativo, simplificando a rotina de suplementação.',
      },
      {
        icone: 'Moon',
        titulo: 'Tolerância gastrointestinal superior',
        descricao:
          'A predominância de formas queladas e orgânicas reduz o desconforto digestivo comum às formas inorgânicas de magnésio.',
      },
    ],
    sistemas: ['Sistema Muscular', 'Sistema Nervoso', 'Sistema Cardiovascular', 'Ossos', 'Metabolismo'],
    estatisticas: [
      { valor: '5', rotulo: 'formas de magnésio' },
      { valor: '300+', rotulo: 'funções no organismo' },
      { valor: 'BHE', rotulo: 'treonato atravessa o cérebro' },
    ],
    pesquisa: {
      destaque:
        'Formas orgânicas de magnésio como bisglicinato e malato apresentam biodisponibilidade superior às formas inorgânicas, com menor efeito laxativo e maior tolerância digestiva.',
      fonte: 'Magnesium Research, 2021 · Schuchardt & Hahn.',
    },
    modoDeUso: '2 cápsulas ao dia com água, preferencialmente com refeições.',
    temaVisual: 'molecular',
    elementos: ['pentágono luminoso', 'cinco formas moleculares', 'padrão hexagonal', 'Mg²⁺ em cinco tonalidades'],
    imagemLocal: '/products/inovitann/6.png',
  },

  'inovitann-trimagnesio-ultra-60-capsulas': {
    slug: 'inovitann-trimagnesio-ultra-60-capsulas',
    cor: '#c2540a',
    corSecundaria: '#fb923c',
    nome: 'Trimagnésio Ultra',
    tagline: 'Três formas, um propósito: o magnésio completo que você precisa',
    copyAbertura:
      'Bisglicinato para relaxamento e sono, malato para energia e citrato para absorção rápida. A combinação ternária cobre diferentes janelas de absorção e afinidades teciduais num único suplemento prático.',
    mecanismo:
      'O Tri Magnésio Ultra combina três formas orgânicas de magnésio selecionadas por propriedades complementares: o bisglicinato (alta tolerância GI, relaxamento muscular e nervoso), o malato (cofator do ciclo de Krebs e produção de ATP) e o citrato (alta solubilidade e biodisponibilidade, ação rápida). A combinação ternária cobre diferentes janelas de absorção e afinidades teciduais, ampliando a efetividade global da suplementação.',
    beneficios: [
      {
        icone: 'Activity',
        titulo: 'Recuperação muscular',
        descricao:
          'As formas malato e bisglicinato fornecem magnésio para apoiar o relaxamento das fibras musculares e reduzir o desconforto após atividade física.',
      },
      {
        icone: 'Moon',
        titulo: 'Qualidade do sono e relaxamento',
        descricao:
          'O bisglicinato de magnésio é especialmente reconhecido por seu efeito calmante no sistema nervoso, contribuindo para noites mais tranquilas.',
      },
      {
        icone: 'Zap',
        titulo: 'Energia e metabolismo celular',
        descricao:
          'O malato de magnésio apoia o ciclo de Krebs, fornecendo o cofator necessário para a produção eficiente de energia aeróbica.',
      },
      {
        icone: 'Shield',
        titulo: 'Fácil tolerância digestiva',
        descricao:
          'A combinação de formas orgânicas minimiza o efeito laxativo e a irritação gastrointestinal típicos das formas inorgânicas de magnésio.',
      },
    ],
    sistemas: ['Sistema Muscular', 'Sistema Nervoso', 'Metabolismo Energético', 'Qualidade do Sono'],
    estatisticas: [
      { valor: '3', rotulo: 'formas orgânicas combinadas' },
      { valor: 'ATP', rotulo: 'produção via ciclo de Krebs' },
      { valor: 'Sono', rotulo: 'bisglicinato calmante' },
    ],
    pesquisa: {
      destaque:
        'O bisglicinato de magnésio demonstrou redução significativa de insônia e melhora na qualidade do sono em adultos com deficiência do mineral, num estudo duplo-cego de 8 semanas.',
      fonte: 'Journal of Research in Medical Sciences, 2012 · Abbasi et al.',
    },
    modoDeUso: '1 a 2 cápsulas ao dia, preferencialmente à noite com refeições.',
    temaVisual: 'muscular',
    elementos: ['tripla hélice molecular', 'fibras musculares low-poly', 'partículas de luz quente', 'três formas'],
    imagemLocal: '/products/inovitann/8.png',
  },

  'inovitann-biotina-plus-60-capsulas': {
    slug: 'inovitann-biotina-plus-60-capsulas',
    cor: '#db2777',
    corSecundaria: '#f472b6',
    nome: 'Biotina Plus',
    tagline: 'A vitamina que nutre cada fio, cada unha, cada célula da sua pele',
    copyAbertura:
      'Biotina na dose clínica estudada: coenzima de cinco carboxilases essenciais, atua diretamente na síntese de queratina que compõe cabelos, unhas e pele. Resultados visíveis com uso contínuo.',
    mecanismo:
      'A biotina (vitamina B7) é uma vitamina hidrossolúvel que atua como coenzima de cinco carboxilases essenciais no metabolismo de carboidratos, gorduras e aminoácidos. No tecido integumentar, é fundamental para a síntese de queratina — a proteína estrutural que compõe cabelos, unhas e camadas externas da pele — influenciando diretamente a resistência, o brilho e o crescimento dessas estruturas.',
    beneficios: [
      {
        icone: 'Sparkles',
        titulo: 'Crescimento e resistência capilar',
        descricao:
          'Contribui com biotina para a síntese de queratina, proteína estrutural do fio capilar, apoiando o crescimento e a resistência dos cabelos.',
      },
      {
        icone: 'Star',
        titulo: 'Unhas mais resistentes',
        descricao:
          'Fornece o cofator essencial para a produção de queratina ungual, apoiando a dureza e a integridade das unhas.',
      },
      {
        icone: 'Heart',
        titulo: 'Saúde da pele',
        descricao:
          'Participa do metabolismo de ácidos graxos que mantêm a barreira lipídica cutânea, contribuindo para a hidratação e o aspecto saudável da pele.',
      },
      {
        icone: 'Zap',
        titulo: 'Metabolismo de macronutrientes',
        descricao:
          'Atua como coenzima em vias metabólicas de carboidratos, gorduras e proteínas, apoiando a transformação de nutrientes em energia disponível.',
      },
    ],
    sistemas: ['Cabelos', 'Unhas', 'Pele', 'Metabolismo'],
    estatisticas: [
      { valor: '5', rotulo: 'carboxilases ativadas' },
      { valor: 'Queratina', rotulo: 'proteína estrutural do fio' },
      { valor: 'B7', rotulo: 'vitamina hidrossolúvel' },
    ],
    pesquisa: {
      destaque:
        'Suplementação com biotina em pacientes com unhas frágeis resultou em aumento de 25% na espessura ungual e melhora clínica em 91% dos casos após 6 meses de uso.',
      fonte: 'Cutis, 1993 · Floersheim GL · Journal of Dermatological Treatment.',
    },
    modoDeUso: '1 cápsula ao dia, de preferência com refeições.',
    temaVisual: 'capilar',
    elementos: ['fio capilar com escamas de queratina', 'molécula de biotina', 'silhuetas de unhas', 'células epiteliais'],
    imagemLocal: '/products/inovitann/9.png',
  },

  'inovitann-curcuma-plus-60-capsulas': {
    slug: 'inovitann-curcuma-plus-60-capsulas',
    cor: '#d97706',
    corSecundaria: '#fbbf24',
    nome: 'Cúrcuma Plus',
    tagline: 'O ouro da natureza, concentrado em 95% de pura eficiência',
    copyAbertura:
      'Padronizado a 95% de curcuminoides totais e potencializado com piperina para até 20× mais absorção. Modula múltiplas vias inflamatórias e antioxidantes simultâneamente.',
    mecanismo:
      'A Cúrcuma Plus é padronizada a 95% de curcuminoides totais. A curcumina é um polifenol com potente atividade modulatória em múltiplas vias de sinalização celular: inibe o fator NF-κB, modula COX-2, TNF-α, IL-1β e IL-6, e ativa as vias antioxidantes Nrf2/ARE, elevando as defesas endógenas. A biodisponibilidade é potencializada pela piperina da pimenta preta, que aumenta a absorção em até 20x.',
    beneficios: [
      {
        icone: 'Flame',
        titulo: 'Suporte à resposta inflamatória',
        descricao:
          'Os curcuminoides modulam vias de sinalização inflamatória, contribuindo para o equilíbrio da resposta do organismo a estímulos diários.',
      },
      {
        icone: 'Shield',
        titulo: 'Defesa antioxidante de amplo espectro',
        descricao:
          'Ativa a via Nrf2, estimulando a produção das próprias defesas antioxidantes do organismo, além de neutralizar radicais livres diretamente.',
      },
      {
        icone: 'Activity',
        titulo: 'Saúde articular',
        descricao:
          'Contribui para o conforto das articulações e a flexibilidade dos movimentos, especialmente relevante para pessoas ativas.',
      },
      {
        icone: 'Leaf',
        titulo: 'Suporte digestivo e hepático',
        descricao:
          'Os curcuminoides estimulam a produção de bile e exercem efeito antioxidante no tecido hepático, apoiando a digestão saudável.',
      },
    ],
    sistemas: ['Sistema Imunológico', 'Articulações', 'Fígado', 'Digestão'],
    estatisticas: [
      { valor: '95%', rotulo: 'curcuminoides totais' },
      { valor: '20×', rotulo: 'absorção com piperina' },
      { valor: 'NF-κB', rotulo: 'via inflamatória inibida' },
    ],
    pesquisa: {
      destaque:
        'A co-administração de piperina com curcumina aumentou a biodisponibilidade da curcumina em 2000% em humanos, sem efeitos adversos significativos.',
      fonte: 'Planta Medica, 1998 · Shoba et al.',
    },
    modoDeUso: '1 a 2 cápsulas ao dia com refeições contendo alguma gordura.',
    temaVisual: 'inflamatorio',
    elementos: ['rizoma de cúrcuma em macro', 'moléculas de curcumina em órbita', 'partículas âmbar', 'aura dourada'],
    imagemLocal: '/products/inovitann/11.png',
  },

  'inovitann-luteina-zeaxantina-60-capsulas': {
    slug: 'inovitann-luteina-zeaxantina-60-capsulas',
    cor: '#1d6fa8',
    corSecundaria: '#38bdf8',
    nome: 'Luteína + Zeaxantina',
    tagline: 'Seus olhos merecem o melhor filtro da natureza',
    copyAbertura:
      'Luteína e zeaxantina se acumulam seletivamente na mácula formando o Pigmento Macular Óptico — filtro natural para a luz azul de telas e antioxidante lipofílico que protege a retina de dentro para fora.',
    mecanismo:
      'Luteína e zeaxantina são carotenoides xantofílicos que se acumulam seletivamente na mácula e no cristalino do olho, formando o Pigmento Macular Óptico (PMO). Esse pigmento age como filtro natural para luz azul de alta energia (400–490 nm) e como antioxidante lipofílico que neutraliza radicais livres gerados pela exposição à luz. A concentração de zeaxantina é especialmente elevada na fóvea — ponto de maior acuidade visual.',
    beneficios: [
      {
        icone: 'Eye',
        titulo: 'Proteção da mácula',
        descricao:
          'Contribui para a manutenção do Pigmento Macular Óptico, apoiando a nitidez e o conforto visual em atividades que exigem precisão.',
      },
      {
        icone: 'Sun',
        titulo: 'Filtro de luz azul',
        descricao:
          'Fornece carotenoides que atuam como filtro natural para a luz azul emitida por telas digitais, favorecendo o conforto ocular diário.',
      },
      {
        icone: 'Shield',
        titulo: 'Antioxidante na retina',
        descricao:
          'Complementa a defesa antioxidante dos tecidos oculares, neutralizando o estresse oxidativo causado pela exposição à luz intensa.',
      },
      {
        icone: 'Sparkles',
        titulo: 'Sensibilidade ao contraste',
        descricao:
          'Auxilia na manutenção da sensibilidade ao contraste, importante para enxergar bem em ambientes com pouca iluminação.',
      },
    ],
    sistemas: ['Olhos', 'Retina', 'Visão'],
    estatisticas: [
      { valor: 'PMO', rotulo: 'pigmento macular formado' },
      { valor: '400–490nm', rotulo: 'luz azul filtrada' },
      { valor: 'Fóvea', rotulo: 'maior concentração retinal' },
    ],
    pesquisa: {
      destaque:
        'O estudo AREDS2 demonstrou que suplementação com luteína e zeaxantina reduziu o risco de progressão da degeneração macular relacionada à idade em 26% em comparação com placebo.',
      fonte: 'JAMA Ophthalmology, 2014 · AREDS2 Research Group.',
    },
    modoDeUso: '1 cápsula ao dia com refeições contendo gordura para melhor absorção.',
    temaVisual: 'ocular',
    elementos: ['íris humana em close', 'feixe de luz azul filtrado', 'hexágonos moleculares', 'partículas douradas'],
    imagemLocal: '/products/inovitann/2.png',
  },

  'inovitann-magnesio-l-treonato-60-capsulas': {
    slug: 'inovitann-magnesio-l-treonato-60-capsulas',
    cor: '#3d7a38',
    corSecundaria: '#4ade80',
    nome: 'Magnésio L-Treonato',
    tagline: 'O magnésio que chega onde o cérebro mais precisa',
    copyAbertura:
      'Desenvolvido por pesquisadores do MIT, o L-treonato é a única forma de magnésio que atravessa a barreira hematoencefálica de forma mensurável, elevando o Mg²⁺ sináptico e apoiando plasticidade, memória e foco.',
    mecanismo:
      'O L-treonato de magnésio é uma forma exclusiva desenvolvida por pesquisadores do MIT. O ânion L-treonato atua como veículo que atravessa a barreira hematoencefálica (BHE) por meio dos transportadores de sódio presentes no epitélio dos capilares cerebrais. Uma vez no SNC, o magnésio eleva a concentração sináptica do mineral, que modula os receptores NMDA e favorece a plasticidade sináptica (potenciação de longa duração). É a única forma de magnésio com evidências de elevar os níveis de Mg²⁺ no líquor de forma mensurável.',
    beneficios: [
      {
        icone: 'Brain',
        titulo: 'Suporte à função cognitiva',
        descricao:
          'Fornece magnésio biodisponível para o cérebro, apoiando processos como concentração, raciocínio e clareza mental no dia a dia.',
      },
      {
        icone: 'Sparkles',
        titulo: 'Apoio à memória e aprendizado',
        descricao:
          'Contribui com Mg²⁺ para a plasticidade sináptica, estrutura bioquímica associada à formação e consolidação de memórias.',
      },
      {
        icone: 'Moon',
        titulo: 'Qualidade do sono',
        descricao:
          'Complementa a dieta com magnésio, mineral reconhecido por favorecer o relaxamento do sistema nervoso e um sono mais restaurador.',
      },
      {
        icone: 'Shield',
        titulo: 'Bem-estar neurológico',
        descricao:
          'Apoia o equilíbrio dos neurotransmissores por meio da modulação dos receptores NMDA, contribuindo para o estado de calma e resiliência mental.',
      },
    ],
    sistemas: ['Cérebro', 'Sistema Nervoso Central', 'Cognição', 'Sono'],
    estatisticas: [
      { valor: 'MIT', rotulo: 'origem da pesquisa' },
      { valor: 'BHE', rotulo: 'única forma que cruza' },
      { valor: 'NMDA', rotulo: 'receptores modulados' },
    ],
    pesquisa: {
      destaque:
        'Pesquisadores do MIT demonstraram que o L-treonato de magnésio é a única forma que eleva os níveis de Mg²⁺ no líquor de forma mensurável, melhorando plasticidade sináptica e desempenho cognitivo em modelos animais.',
      fonte: 'Neuron, 2010 · Slutsky et al. — MIT (Guosong Liu Lab).',
    },
    modoDeUso: '1 a 2 cápsulas ao dia, preferencialmente à noite antes de dormir.',
    temaVisual: 'neural',
    elementos: ['neurônios e sinapses', 'barreira hematoencefálica', 'axônios pulsantes', 'partículas de Mg²⁺'],
    imagemLocal: '/products/inovitann/3.png',
  },

  'inovitann-metilcobalamina-b12-60-capsulas': {
    slug: 'inovitann-metilcobalamina-b12-60-capsulas',
    cor: '#8c1f2e',
    corSecundaria: '#f87171',
    nome: 'Metilcobalamina B12',
    tagline: 'A vitamina B12 na forma que seu neurônio entende',
    copyAbertura:
      'Forma coenzimática ativa da B12 — sem conversão hepática necessária. Atua diretamente na síntese de mielina, na maturação de hemácias e na regulação da homocisteína para saúde neurológica e cardiovascular.',
    mecanismo:
      'A metilcobalamina é a forma coenzimática ativa da vitamina B12 diretamente utilizável pelas células, sem necessidade de conversão hepática prévia. Ela atua como doadora de grupos metila na reação da metionina sintase — convertendo homocisteína em metionina e gerando S-adenosilmetionina (SAMe). Também é coenzima essencial para a síntese de mielina, para a maturação de eritrócitos e para a replicação do DNA.',
    beneficios: [
      {
        icone: 'Brain',
        titulo: 'Suporte ao sistema nervoso',
        descricao:
          'Fornece B12 na forma ativa para apoiar a síntese de mielina e a condução eficiente dos impulsos nervosos ao longo do organismo.',
      },
      {
        icone: 'Zap',
        titulo: 'Vitalidade e metabolismo energético',
        descricao:
          'Participa da conversão de nutrientes em energia celular, contribuindo para a disposição e o vigor no cotidiano.',
      },
      {
        icone: 'Droplets',
        titulo: 'Formação normal de glóbulos vermelhos',
        descricao:
          'Contribui com a vitamina B12 necessária para a maturação das hemácias, apoiando o transporte de oxigênio no sangue.',
      },
      {
        icone: 'Shield',
        titulo: 'Regulação da homocisteína',
        descricao:
          'Auxilia na conversão metabólica da homocisteína em metionina, importante para o equilíbrio bioquímico cardiovascular e neurológico.',
      },
    ],
    sistemas: ['Sistema Nervoso', 'Sangue', 'Metabolismo Energético', 'Sistema Cardiovascular'],
    estatisticas: [
      { valor: '100%', rotulo: 'forma ativa, sem conversão' },
      { valor: 'SAMe', rotulo: 'doador de grupos metila' },
      { valor: 'Mielina', rotulo: 'síntese neuroprotetora' },
    ],
    pesquisa: {
      destaque:
        'A deficiência de B12 afeta até 15% dos adultos acima de 60 anos; a metilcobalamina, por ser a forma ativa, demonstrou maior eficácia na remielinização nervosa e na redução de homocisteína versus cianocobalamina.',
      fonte: 'Journal of Nutritional Science and Vitaminology, 2020 · Watanabe et al.',
    },
    modoDeUso: '1 cápsula ao dia, sublingual ou com refeições.',
    temaVisual: 'neural',
    elementos: ['bainhas de mielina', 'molécula de cobalamina', 'faíscas elétricas sinápticas', 'hemácias'],
    imagemLocal: '/products/inovitann/4.png',
  },

  'inovitann-coenzima-q10-plus-60-capsulas': {
    slug: 'inovitann-coenzima-q10-plus-60-capsulas',
    cor: '#9c2779',
    corSecundaria: '#e879f9',
    nome: 'Coenzima Q10 Plus',
    tagline: 'A centelha que mantém cada célula em movimento',
    copyAbertura:
      'A CoQ10 é o carreador de elétrons que alimenta a cadeia respiratória mitocondrial. Sua produção endógena cai até 40% após os 40 anos — a suplementação repõe o que o organismo perde com o tempo.',
    mecanismo:
      'A Coenzima Q10 (ubiquinona) é uma molécula lipossolúvel endógena localizada predominantemente nas membranas mitocondriais internas. Na cadeia transportadora de elétrons (CTE), funciona como carreador de elétrons entre os complexos I/II e o complexo III, sendo indispensável para a síntese oxidativa de ATP. Na forma reduzida (ubiquinol), exerce potente ação antioxidante lipofílica, regenerando vitamina E e protegendo fosfolipídios de membrana. A síntese endógena de CoQ10 declina progressivamente com a idade.',
    beneficios: [
      {
        icone: 'Zap',
        titulo: 'Energia celular mitocondrial',
        descricao:
          'Fornece CoQ10 para apoiar a cadeia respiratória mitocondrial, contribuindo para a produção eficiente de ATP nas células do organismo.',
      },
      {
        icone: 'Shield',
        titulo: 'Proteção antioxidante lipofílica',
        descricao:
          'Atua na defesa das membranas celulares contra a oxidação, complementando o sistema antioxidante do organismo.',
      },
      {
        icone: 'Heart',
        titulo: 'Suporte cardiovascular',
        descricao:
          'O coração, por ser um músculo de alta demanda energética, é um dos tecidos com maior concentração de CoQ10.',
      },
      {
        icone: 'Activity',
        titulo: 'Vitalidade e disposição',
        descricao:
          'Contribui para o metabolismo energético celular, apoiando os níveis de disposição em indivíduos ativos.',
      },
    ],
    sistemas: ['Mitocôndrias', 'Sistema Cardiovascular', 'Células', 'Metabolismo Energético'],
    estatisticas: [
      { valor: '40%', rotulo: 'queda após os 40 anos' },
      { valor: 'ATP', rotulo: 'síntese via CTE' },
      { valor: 'CoQ10', rotulo: 'antioxidante lipofílico' },
    ],
    pesquisa: {
      destaque:
        'A suplementação com CoQ10 em pacientes com insuficiência cardíaca reduziu eventos cardiovasculares maiores em 43% e melhorou significativamente a qualidade de vida no estudo Q-SYMBIO.',
      fonte: 'JACC Heart Failure, 2014 · Mortensen et al. (Q-SYMBIO Trial).',
    },
    modoDeUso: '1 cápsula ao dia com refeições contendo gordura para melhor absorção.',
    temaVisual: 'mitocondrial',
    elementos: ['mitocôndria em corte', 'molécula de CoQ10', 'setas de fluxo de elétrons', 'esferas de ATP'],
    imagemLocal: '/products/inovitann/5.png',
  },

  'inovitann-vitamina-k-ultra-60-capsulas': {
    slug: 'inovitann-vitamina-k-ultra-60-capsulas',
    cor: '#16a34a',
    corSecundaria: '#4ade80',
    nome: 'Vitamina K Ultra',
    tagline: 'O cálcio no lugar certo: ossos fortes, artérias livres',
    copyAbertura:
      'A MK-7, forma mais biodisponível de vitamina K2, permanece ativa por 72 horas. Direciona o cálcio para ossos e para longe das artérias — sinergia essencial com vitamina D3 para saúde óssea e cardiovascular.',
    mecanismo:
      'A Menaquinona-7 (MK-7) é a forma de vitamina K2 com maior meia-vida plasmática (72 horas) e maior biodistribuição extraepática, alcançando ossos e artérias em concentrações funcionalmente relevantes. A vitamina K2 é cofator essencial da gama-glutamil carboxilase, que ativa a osteocalcina (direciona cálcio para a matriz óssea) e a Proteína Gla da Matriz (MGP), que inibe a calcificação vascular. Em conjunto com vitamina D, regula o metabolismo do cálcio de forma sinérgica.',
    beneficios: [
      {
        icone: 'Shield',
        titulo: 'Saúde óssea e mineralização',
        descricao:
          'Ativa a osteocalcina, proteína responsável por ancorar o cálcio na matriz óssea, contribuindo para a densidade e resistência dos ossos.',
      },
      {
        icone: 'Heart',
        titulo: 'Suporte cardiovascular',
        descricao:
          'Ativa a MGP, que inibe o depósito de cálcio nas paredes arteriais, contribuindo para a flexibilidade vascular.',
      },
      {
        icone: 'Zap',
        titulo: 'Sinergia com Vitamina D3',
        descricao:
          'Funciona em par com a vitamina D — enquanto D3 aumenta a absorção de cálcio, a K2-MK7 garante que ele chegue aos tecidos certos.',
      },
      {
        icone: 'TrendingUp',
        titulo: 'Longa meia-vida e ação sustentada',
        descricao:
          'A forma MK-7 permanece ativa no organismo por até 72 horas, garantindo cobertura prolongada com uma única dose diária.',
      },
    ],
    sistemas: ['Ossos', 'Sistema Cardiovascular', 'Coagulação'],
    estatisticas: [
      { valor: '72h', rotulo: 'meia-vida da MK-7' },
      { valor: 'MGP', rotulo: 'calcificação vascular inibida' },
      { valor: 'K2-MK7', rotulo: 'forma mais biodisponível' },
    ],
    pesquisa: {
      destaque:
        'A MK-7 demonstrou aumentar a ativação da osteocalcina em 14% e reduzir marcadores de calcificação arterial após 3 anos de suplementação em mulheres pós-menopausa saudáveis.',
      fonte: 'Osteoporosis International, 2013 · Knapen et al.',
    },
    modoDeUso: '1 cápsula ao dia com refeições contendo alguma gordura.',
    temaVisual: 'osseo',
    elementos: ['cristal de hidroxiapatita', 'esferas de cálcio em bifurcação', 'MK-7 como controlador', 'osso trabecular'],
    imagemLocal: '/products/inovitann/10.png',
  },
}

export function getInovitannTheme(slug: string): InovitannTheme | null {
  return inovitannThemes[slug] ?? null
}
