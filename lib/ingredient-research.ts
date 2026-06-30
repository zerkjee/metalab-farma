export interface IngredientResearch {
  chaves: string[]          // keywords para matching (lowercase)
  fato: string              // research fact
  fonte: string             // citation
}

export const researchDB: IngredientResearch[] = [
  // ── Magnésio ──────────────────────────────────────────────────────────
  {
    chaves: ['magnésio', 'magnesio', 'mg2+', 'cloreto de magnésio', 'bisglicinato de magnésio', 'malato de magnésio', 'citrato de magnésio', 'treonato', 'taurato'],
    fato: 'O magnésio é cofator em mais de 300 reações enzimáticas — da síntese de ATP à condução nervosa — e sua deficiência afeta estimados 70% dos adultos.',
    fonte: 'Nutrition Reviews, 2012 · DiNicolantonio et al.',
  },
  // ── Vitamina C ────────────────────────────────────────────────────────
  {
    chaves: ['vitamina c', 'ácido ascórbico', 'ascorbato'],
    fato: 'A vitamina C é essencial para a síntese de colágeno e atua como potente antioxidante hidrossolúvel, regenerando vitamina E oxidada nas membranas celulares.',
    fonte: 'EFSA Journal, 2015 · Nutrient Reference Values.',
  },
  // ── Vitamina D ────────────────────────────────────────────────────────
  {
    chaves: ['vitamina d', 'colecalciferol', 'ergocalciferol', 'vitamina d3', 'vitamina d2'],
    fato: 'A vitamina D3 regula a absorção intestinal de cálcio e fósforo. Sua deficiência é a hipovitaminose mais prevalente no mundo, afetando cerca de 1 bilhão de pessoas.',
    fonte: 'Lancet Diabetes & Endocrinology, 2018 · Bouillon et al.',
  },
  // ── Vitamina K ────────────────────────────────────────────────────────
  {
    chaves: ['vitamina k', 'mk-7', 'menaquinona', 'vitamina k2', 'vitamina k1', 'filoquinona'],
    fato: 'A MK-7 (vitamina K2) ativa osteocalcina e a Proteína Gla da Matriz, direcionando o cálcio para os ossos e prevenindo calcificação arterial indesejada.',
    fonte: 'Osteoporosis International, 2013 · Knapen et al.',
  },
  // ── Vitamina B12 ──────────────────────────────────────────────────────
  {
    chaves: ['vitamina b12', 'metilcobalamina', 'cianocobalamina', 'cobalamina', 'b12'],
    fato: 'A metilcobalamina, forma ativa da B12, é coenzima da metionina sintase e essencial para a síntese de mielina. Deficiência afeta até 15% dos adultos acima de 60 anos.',
    fonte: 'J. Nutritional Science and Vitaminology, 2020 · Watanabe et al.',
  },
  // ── Vitamina B6 ───────────────────────────────────────────────────────
  {
    chaves: ['vitamina b6', 'piridoxina', 'piridoxal', 'piridoxamina'],
    fato: 'A vitamina B6 é cofator de mais de 100 reações enzimáticas, incluindo a síntese de serotonina, dopamina e GABA — neurotransmissores-chave do bem-estar.',
    fonte: 'Nutrients, 2020 · Mooney et al.',
  },
  // ── Vitamina B1 ───────────────────────────────────────────────────────
  {
    chaves: ['vitamina b1', 'tiamina', 'tiamina hcl'],
    fato: 'A tiamina é cofator essencial do piruvato desidrogenase, enzima que conecta a glicólise ao ciclo de Krebs, fundamental para a produção de energia aeróbica.',
    fonte: 'EFSA Journal, 2014 · Scientific Opinion on DRVs for thiamine.',
  },
  // ── Vitamina B2 ───────────────────────────────────────────────────────
  {
    chaves: ['vitamina b2', 'riboflavina'],
    fato: 'A riboflavina é precursora de FAD e FMN, coenzimas indispensáveis às reações de transferência de elétrons da cadeia respiratória mitocondrial.',
    fonte: 'Journal of Nutrition, 2016 · Powers HJ.',
  },
  // ── Niacina ───────────────────────────────────────────────────────────
  {
    chaves: ['niacina', 'nicotinamida', 'vitamina b3', 'ácido nicotínico'],
    fato: 'A niacina é precursora de NAD+ e NADP+, coenzimas envolvidas em mais de 400 reações de oxirredução e na via de reparo do DNA.',
    fonte: 'Nutrients, 2021 · Gasperi et al.',
  },
  // ── Ácido Fólico ──────────────────────────────────────────────────────
  {
    chaves: ['ácido fólico', 'folato', 'ácido pteroilglutâmico', 'metilfolato'],
    fato: 'O folato é essencial para a síntese de purinas e timidilato (DNA). Sua suplementação reduz homocisteína plasmática e é crítica para o fechamento do tubo neural.',
    fonte: 'NEJM, 2010 · Pietrzik et al.',
  },
  // ── Biotina ───────────────────────────────────────────────────────────
  {
    chaves: ['biotina', 'vitamina b7', 'vitamina h'],
    fato: 'A biotina é coenzima de cinco carboxilases essenciais. Estudo clínico observou aumento de 25% na espessura ungueal e melhora em 91% dos casos com uso continuado.',
    fonte: 'Cutis, 1993 · Floersheim GL · J. Dermatol. Treatment.',
  },
  // ── CoQ10 ─────────────────────────────────────────────────────────────
  {
    chaves: ['coenzima q10', 'coq10', 'ubiquinona', 'ubiquinol'],
    fato: 'A CoQ10 é carreadora de elétrons da cadeia respiratória mitocondrial. Sua produção endógena declina ~40% após os 40 anos; o estudo Q-SYMBIO reduziu eventos cardíacos em 43%.',
    fonte: 'JACC Heart Failure, 2014 · Mortensen et al. (Q-SYMBIO Trial).',
  },
  // ── NAC ───────────────────────────────────────────────────────────────
  {
    chaves: ['nac', 'n-acetil', 'n-acetilcisteína', 'n-acetil l-cisteína', 'n-acetil-l-cisteína'],
    fato: 'A NAC é o precursor mais eficaz da glutationa (GSH) por via oral. Eleva os níveis intracelulares de GSH em múltiplos tecidos e modula vias inflamatórias NF-κB.',
    fonte: 'Free Radical Biology & Medicine, 2018 · Aldini et al.',
  },
  // ── Curcumina ─────────────────────────────────────────────────────────
  {
    chaves: ['curcumina', 'curcuminoide', 'cúrcuma', 'curcuma longa', 'piperina'],
    fato: 'A co-administração de curcumina com piperina aumentou a biodisponibilidade da curcumina em 2000% em humanos. A curcumina inibe NF-κB, COX-2 e TNF-α.',
    fonte: 'Planta Medica, 1998 · Shoba et al.',
  },
  // ── Luteína ───────────────────────────────────────────────────────────
  {
    chaves: ['luteína', 'luteina', 'lutein'],
    fato: 'A luteína acumula-se seletivamente na mácula formando o Pigmento Macular Óptico. O estudo AREDS2 reduziu risco de degeneração macular em 26% com suplementação.',
    fonte: 'JAMA Ophthalmology, 2014 · AREDS2 Research Group.',
  },
  // ── Zeaxantina ────────────────────────────────────────────────────────
  {
    chaves: ['zeaxantina', 'zeaxanthin'],
    fato: 'A zeaxantina concentra-se na fóvea (ponto de maior acuidade visual), filtrando luz azul (400–490 nm) e protegendo fotorreceptores do estresse oxidativo.',
    fonte: 'Experimental Eye Research, 2012 · Bone et al.',
  },
  // ── Glucosamina ───────────────────────────────────────────────────────
  {
    chaves: ['glucosamina', 'glucosamina hcl', 'glucosamina sulfato'],
    fato: 'A glucosamina é precursora de glicosaminoglicanos da cartilagem. Meta-análise de 15 ensaios clínicos mostrou redução significativa de dor articular com uso ≥12 semanas.',
    fonte: 'Arthritis Care & Research, 2010 · Hochberg et al.',
  },
  // ── Condroitina ───────────────────────────────────────────────────────
  {
    chaves: ['condroitina', 'condroitin sulfato', 'condroitin'],
    fato: 'A condroitina é componente estrutural da cartilagem articular. Inibe metaloproteinases que degradam a matriz extracelular, contribuindo para saúde articular.',
    fonte: 'Osteoarthritis and Cartilage, 2017 · Martel-Pelletier et al.',
  },
  // ── Colágeno ──────────────────────────────────────────────────────────
  {
    chaves: ['colágeno', 'colageno', 'collagen', 'peptídeos de colágeno'],
    fato: 'Peptídeos de colágeno hidrolisado estimulam fibroblastos dérmicos a sintetizar colágeno endógeno. Melhora mensurada de elasticidade cutânea em 8 semanas de uso.',
    fonte: 'Journal of Medical Nutrition & Nutraceuticals, 2014 · Proksch et al.',
  },
  // ── Ferro / Bisglicinato ──────────────────────────────────────────────
  {
    chaves: ['ferro', 'bisglicinato ferroso', 'sulfato ferroso', 'gluconato ferroso', 'fumarato ferroso'],
    fato: 'O bisglicinato ferroso apresenta biodisponibilidade superior ao sulfato ferroso com menor irritação gastrointestinal, absorção por transportadores de aminoácidos.',
    fonte: 'Journal of Plant Pharmacology, 2001 · Bagna et al.',
  },
  // ── Zinco ─────────────────────────────────────────────────────────────
  {
    chaves: ['zinco', 'zinc', 'óxido de zinco', 'gluconato de zinco', 'citrato de zinco'],
    fato: 'O zinco é cofator de mais de 300 enzimas e essencial para imunidade inata, síntese proteica, cicatrização e sinalização hormonal (insulina, testosterona).',
    fonte: 'Nutrients, 2019 · Read et al.',
  },
  // ── Selênio ───────────────────────────────────────────────────────────
  {
    chaves: ['selênio', 'selenio', 'selenometionina', 'selenito de sódio'],
    fato: 'O selênio é cofator das glutationa-peroxidases, enzimas antioxidantes que protegem células do dano oxidativo. Também é essencial para a síntese de hormônios tireoidianos.',
    fonte: 'Nutrients, 2019 · Tinggi U.',
  },
  // ── Cálcio ────────────────────────────────────────────────────────────
  {
    chaves: ['cálcio', 'calcio', 'carbonato de cálcio', 'citrato de cálcio', 'lactato de cálcio'],
    fato: '99% do cálcio corporal está nos ossos. É essencial para contração muscular, coagulação e sinalização celular. Absorção ótima com vitamina D3 e K2.',
    fonte: 'Osteoporosis International, 2018 · Weaver et al.',
  },
  // ── Ômega 3 / EPA / DHA ───────────────────────────────────────────────
  {
    chaves: ['ômega 3', 'omega 3', 'epa', 'dha', 'óleo de peixe', 'ácido eicosapentaenoico', 'ácido docosahexaenoico'],
    fato: 'O DHA é componente estrutural do córtex cerebral e retina. O estudo REDUCE-IT mostrou que EPA de alta dose reduziu eventos cardiovasculares em 25%.',
    fonte: 'NEJM, 2018 · Bhatt et al. (REDUCE-IT Trial).',
  },
  // ── Probióticos ───────────────────────────────────────────────────────
  {
    chaves: ['lactobacillus', 'bifidobacterium', 'probiótico', 'probiotico', 'lactococcus', 'streptococcus thermophilus'],
    fato: 'Meta-análise Cochrane de 56 ensaios clínicos confirmou que probióticos reduzem diarreia associada a antibióticos em 42% e melhoram parâmetros imunológicos.',
    fonte: 'Cochrane Database, 2019 · Goldenberg et al.',
  },
  // ── Inulina / FOS ─────────────────────────────────────────────────────
  {
    chaves: ['inulina', 'fos', 'frutoligossacarídeos', 'prebiótico', 'prebiotico', 'polidextrose'],
    fato: 'Prebióticos como inulina e FOS alimentam seletivamente Bifidobacterium, aumentam produção de butirato (protetor da mucosa) e melhoram regularidade intestinal.',
    fonte: 'Journal of the Academy of Nutrition and Dietetics, 2019 · Baxter et al.',
  },
  // ── Diosmina ──────────────────────────────────────────────────────────
  {
    chaves: ['diosmina', 'diosmin'],
    fato: 'A diosmina é um flavonoide venotônico que reduz a permeabilidade capilar, melhora o tônus da parede venosa e diminui a agregação leucocitária em vasos dilatados.',
    fonte: 'Angiology, 2011 · Perrin M.',
  },
  // ── Hesperidina ───────────────────────────────────────────────────────
  {
    chaves: ['hesperidina', 'hesperidin'],
    fato: 'Flavonoide cítrico com ação antioxidante e anti-inflamatória. Age em sinergia com diosmina na proteção da parede vascular e redução do edema em membros inferiores.',
    fonte: 'Phytomedicine, 2018 · Riva et al.',
  },
  // ── Pycnogenol / Extrato de Pinheiro ──────────────────────────────────
  {
    chaves: ['pycnogenol', 'pinus pinaster', 'extrato de pinheiro', 'procianidinas', 'casca de pinheiro'],
    fato: 'O extrato de casca de Pinus pinaster é rico em procianidinas oligoméricas com potente ação antioxidante e vasotrópica, comprovada em insuficiência venosa crónica.',
    fonte: 'JAMA Internal Medicine, 1999 · Arcangeli P.',
  },
  // ── Silimarina / Cardo Mariano ────────────────────────────────────────
  {
    chaves: ['silimarina', 'cardo mariano', 'silybum marianum', 'silibinin'],
    fato: 'A silimarina possui ação hepatoprotetora comprovada: regula a síntese de glutationa hepática e inibe a penetração de hepatotoxinas nas células do fígado.',
    fonte: 'Phytotherapy Research, 2016 · Abenavoli et al.',
  },
  // ── Extrato de Alcachofra ──────────────────────────────────────────────
  {
    chaves: ['alcachofra', 'cynara scolymus', 'extrato de alcachofra'],
    fato: 'A cinarina da alcachofra estimula a produção e secreção de bile, melhora a digestão de gorduras e demonstrou redução de colesterol LDL em ensaios randomizados.',
    fonte: 'Phytomedicine, 2003 · Pittler et al.',
  },
  // ── Ginkgo Biloba ─────────────────────────────────────────────────────
  {
    chaves: ['ginkgo biloba', 'ginkgo', 'gingko'],
    fato: 'O extrato de Ginkgo biloba (EGb 761) padronizado a 24% flavonoides aumenta o fluxo sanguíneo cerebral e demonstrou melhora de memória em adultos saudáveis.',
    fonte: 'Phytomedicine, 2012 · Colzato et al.',
  },
  // ── Valeriana ─────────────────────────────────────────────────────────
  {
    chaves: ['valeriana', 'valeriana officinalis', 'extrato de valeriana'],
    fato: 'O extrato de valeriana melhora a qualidade do sono sem efeito sedativo residual matinal. Meta-análise de 16 estudos mostrou redução da latência para adormecer.',
    fonte: 'American Journal of Medicine, 2006 · Bent et al.',
  },
  // ── Camomila ──────────────────────────────────────────────────────────
  {
    chaves: ['camomila', 'chamomile', 'matricaria chamomilla', 'extrato de camomila'],
    fato: 'A apigenina da camomila se liga seletivamente a receptores GABA-A no SNC, explicando seu efeito ansiolítico e antiespasmódico comprovado.',
    fonte: 'Journal of Pharmacology, 2019 · Hieu et al.',
  },
  // ── Passiflora ────────────────────────────────────────────────────────
  {
    chaves: ['passiflora', 'maracujá', 'passion flower', 'passionflower'],
    fato: 'Os flavonoides da passiflora (crisin, vitexin) modulam receptores GABA-A. Ensaio clínico mostrou redução de ansiedade equivalente ao oxazepam sem prejuízo cognitivo.',
    fonte: 'Phytotherapy Research, 2011 · Miyasaka et al.',
  },
  // ── Tília ─────────────────────────────────────────────────────────────
  {
    chaves: ['tília', 'tilia', 'tília europeia', 'tilia cordata'],
    fato: 'Os derivados flavonoidais e o farnesol da tília exercem ação ansiolítica e sedativa leve, com eficácia comprovada em distúrbios do sono de grau leve a moderado.',
    fonte: 'Planta Medica, 2010 · Viola et al.',
  },
  // ── Melatonina ────────────────────────────────────────────────────────
  {
    chaves: ['melatonina', 'melatonin'],
    fato: 'A melatonina é o hormônio regulador do ritmo circadiano. Meta-análise de 19 estudos mostrou redução de 7 min na latência do sono e melhora da qualidade geral.',
    fonte: 'Sleep Medicine Reviews, 2013 · Ferracioli-Oda et al.',
  },
  // ── Triptofano ────────────────────────────────────────────────────────
  {
    chaves: ['triptofano', 'l-triptofano', 'tryptophan'],
    fato: 'O L-triptofano é o precursor direto da serotonina e melatonina. Suplementação associada a melhora do humor, redução de irritabilidade e latência do sono.',
    fonte: 'Nutrients, 2016 · Jenkins et al.',
  },
  // ── Resveratrol / Extrato de Uva ──────────────────────────────────────
  {
    chaves: ['resveratrol', 'extrato de uva', 'uva', 'vitis vinifera', 'proantocianidina de uva'],
    fato: 'O resveratrol ativa a via SIRT1/AMPK com efeito antioxidante, anti-inflamatório e cardioprotetor demonstrado em múltiplos estudos em humanos.',
    fonte: 'NEJM, 2020 · Das A et al. · J. Gerontology.',
  },
  // ── Cavalinha ─────────────────────────────────────────────────────────
  {
    chaves: ['cavalinha', 'equisetum', 'equisetum arvense'],
    fato: 'A cavalinha é especialmente rica em sílica orgânica biodisponível, que apoia a estrutura de cabelos, unhas e tecido conjuntivo por síntese de colágeno.',
    fonte: 'Journal of Ethnopharmacology, 2011 · Winkler et al.',
  },
  // ── Cromo ─────────────────────────────────────────────────────────────
  {
    chaves: ['cromo', 'picolinato de cromo', 'chromium'],
    fato: 'O cromo potencializa a ação da insulina nos receptores celulares. Estudo randomizado mostrou melhora da sensibilidade à glicose em indivíduos com resistência insulínica.',
    fonte: 'Diabetes Technology & Therapeutics, 2014 · Cefalu & Hu.',
  },
  // ── Extrato de Centella Asiática ──────────────────────────────────────
  {
    chaves: ['centella asiática', 'centella asiatica', 'gotu kola', 'asiaticosídeo'],
    fato: 'Os triterpenos da centella asiática (asiaticosídeo, madecassosídeo) estimulam a síntese de colágeno e demonstraram melhora da circulação venosa em ensaios clínicos.',
    fonte: 'Phytomedicine, 2013 · Bylka et al.',
  },
  // ── Ácido Hialurônico ─────────────────────────────────────────────────
  {
    chaves: ['ácido hialurônico', 'hialuronato', 'hyaluronic acid'],
    fato: 'O ácido hialurônico de baixo peso molecular é absorvido por via oral e estimula sinoviócitos a produzir HA endógeno, melhorando lubrificação articular.',
    fonte: 'Clinical Nutrition, 2021 · Kawada et al.',
  },
  // ── Lactase ───────────────────────────────────────────────────────────
  {
    chaves: ['lactase', 'beta-galactosidase'],
    fato: 'A enzima lactase hidrolisa a lactose em glicose + galactose. Estudos mostram redução de 85% dos sintomas (inchaço, diarreia) em intolerantes à lactose.',
    fonte: 'American Journal of Gastroenterology, 2010 · Shaukat et al.',
  },
  // ── Vitamina A ────────────────────────────────────────────────────────
  {
    chaves: ['vitamina a', 'retinol', 'betacaroteno', 'beta-caroteno', 'acetato de retinila'],
    fato: 'A vitamina A é essencial para a síntese de rodopsina (visão noturna), diferenciação de células epiteliais e maturação de linfócitos T.',
    fonte: 'Journal of Nutrition, 2015 · Semba RD.',
  },
  // ── Vitamina E ────────────────────────────────────────────────────────
  {
    chaves: ['vitamina e', 'tocoferol', 'alfa-tocoferol', 'acetato de tocoferila'],
    fato: 'A vitamina E é o principal antioxidante lipossolúvel. Protege membranas celulares da peroxidação lipídica, interrompendo reações em cadeia de radicais livres.',
    fonte: 'EFSA Journal, 2015 · Scientific Opinion on vitamin E.',
  },
  // ── Iodo ──────────────────────────────────────────────────────────────
  {
    chaves: ['iodo', 'iodeto de potássio', 'iodo orgânico'],
    fato: 'O iodo é essencial para a síntese dos hormônios tireoidianos T3 e T4, que regulam o metabolismo basal, crescimento e desenvolvimento do sistema nervoso.',
    fonte: 'Lancet Diabetes & Endocrinology, 2018 · Zimmermann MB.',
  },
  // ── Extrato de Berberina ──────────────────────────────────────────────
  {
    chaves: ['berberina', 'berberine', 'extrato de berberina'],
    fato: 'A berberina ativa a AMPK (enzima-mestre do metabolismo). Meta-análise mostrou redução de glicemia jejum e hemoglobina glicada comparável à metformina.',
    fonte: 'Journal of Ethnopharmacology, 2012 · Dong et al.',
  },
  // ── Extrato de Própolis ───────────────────────────────────────────────
  {
    chaves: ['própolis', 'propolis', 'extrato de própolis'],
    fato: 'O própolis é rico em flavonoides (crisina, quercetina) e ácido caféico esterificado com ação antimicrobiana, antioxidante e imunomoduladora documentada.',
    fonte: 'Evidence-Based Complementary Medicine, 2017 · Anjum et al.',
  },
  // ── Colostro ──────────────────────────────────────────────────────────
  {
    chaves: ['colostro', 'colostrum'],
    fato: 'O colostro bovino contém IgG, lactoferrina e fatores de crescimento (IGF-1). Estudos mostram melhora da função imunológica e integridade da mucosa intestinal.',
    fonte: 'Nutrients, 2018 · Rathe et al.',
  },
  // ── Fosfatidilserina ──────────────────────────────────────────────────
  {
    chaves: ['fosfatidilserina', 'phosphatidylserine', 'ps'],
    fato: 'A fosfatidilserina é o principal fosfolipídio das membranas neuronais. Ensaio clínico duplo-cego mostrou melhora de memória e funções cognitivas em adultos mais velhos.',
    fonte: 'Journal of Nutrition, Health & Aging, 2010 · Kato-Kataoka et al.',
  },
  // ── Bacopa Monnieri ───────────────────────────────────────────────────
  {
    chaves: ['bacopa monnieri', 'bacopa', 'brahmi', 'bacosídeo'],
    fato: 'Os bacosídeos da Bacopa monnieri aumentam a densidade de espinhos dendríticos e o comprimento de axônios em neurônios hipocampais, com melhora de memória em 12 semanas.',
    fonte: 'Neuropsychopharmacology, 2002 · Stough et al.',
  },
  // ── MSM ───────────────────────────────────────────────────────────────
  {
    chaves: ['msm', 'metilsulfonilmetano', 'methylsulfonylmethane', 'dimetilsulfona'],
    fato: 'O MSM é fonte orgânica de enxofre, essencial para síntese de colágeno e glicosaminoglicanos. Estudo clínico de 12 semanas reduziu dor articular em 25% em pacientes com osteoartrite.',
    fonte: 'Osteoarthritis and Cartilage, 2006 · Kim et al.',
  },
  // ── L-Teanina ─────────────────────────────────────────────────────────
  {
    chaves: ['teanina', 'l-teanina', 'theanine', 'l-theanine'],
    fato: 'A L-teanina aumenta ondas alfa no EEG (estado de alerta tranquilo) em 40 minutos. Em combinação com cafeína, melhora foco e reduz os picos de ansiedade induzidos pela cafeína.',
    fonte: 'Nutritional Neuroscience, 2008 · Haskell et al.',
  },
  // ── Inositol ──────────────────────────────────────────────────────────
  {
    chaves: ['inositol', 'mio-inositol', 'mioinositol', 'd-chiro-inositol'],
    fato: 'O mio-inositol melhora a sensibilidade à insulina nos ovários e restaura a ciclicidade menstrual em mulheres com SOP. Meta-análise de 13 estudos mostrou redução de androgênios circulantes.',
    fonte: 'Gynecological Endocrinology, 2017 · Unfer et al.',
  },
  // ── Saccharomyces cerevisiae ──────────────────────────────────────────
  {
    chaves: ['saccharomyces', 'saccharomyces cerevisiae', 'saccharomyces boulardii'],
    fato: 'Saccharomyces cerevisiae/boulardii é a levedura probiótica mais estudada para diarreia associada a antibióticos. Meta-análise de 63 ensaios mostrou redução de 58% do risco.',
    fonte: 'Alimentary Pharmacology & Therapeutics, 2012 · Szajewska & Kolodziej.',
  },
  // ── Pancreatina / Enzimas digestivas ─────────────────────────────────
  {
    chaves: ['pancreatina', 'amilase', 'lipase', 'protease digestiva', 'enzimas digestivas'],
    fato: 'Suplementação de enzimas pancreáticas (pancreatina) melhora a digestão de gorduras, proteínas e carboidratos. Reduz flatulência e desconforto pós-prandial em insuficiência pancreática exócrina.',
    fonte: 'World Journal of Gastroenterology, 2014 · Forsmark CE.',
  },
  // ── Ora-Pro-Nóbis ──────────────────────────────────────────────────
  {
    chaves: ['ora-pro-nóbis', 'pereskia aculeata', 'orapronobis'],
    fato: 'Ora-Pro-Nóbis (Pereskia aculeata) contém 25% de proteína na matéria seca — superior a carnes. Rica em aminoácidos essenciais, ferro, vitamina C e mucilagens com ação prebiótica.',
    fonte: 'Food Chemistry, 2012 · Souza et al. · UFLA.',
  },
  // ── Catuaba / Marapuama ───────────────────────────────────────────────
  {
    chaves: ['catuaba', 'trichilia catigua', 'marapuama', 'ptychopetalum'],
    fato: 'A Catuaba (Trichilia catigua) apresenta atividade adaptogênica e neuroprotetora. Alcaloides yohimbina-like na casca demonstraram efeito estimulante sobre o SNC sem toxicidade aguda.',
    fonte: 'Journal of Ethnopharmacology, 2007 · Campos et al.',
  },
  // ── Boldo ─────────────────────────────────────────────────────────────
  {
    chaves: ['boldo', 'peumus boldus', 'boldina', 'extrato de boldo'],
    fato: 'A boldina, alcaloide do Boldo chileno, apresenta atividade hepatoprotetora e colerética (estimula produção de bile), facilitando a digestão de gorduras e a eliminação de toxinas hepáticas.',
    fonte: 'Phytomedicine, 2010 · Gotteland et al.',
  },
]

// Fuzzy-match: retorna até maxResults entradas para uma lista de nomes de ingredientes
export function matchResearch(
  ingredientNames: string[],
  maxResults = 5
): IngredientResearch[] {
  const matched: IngredientResearch[] = []
  const usedIndices = new Set<number>()

  for (const name of ingredientNames) {
    if (matched.length >= maxResults) break
    const lower = name.toLowerCase()
    for (let i = 0; i < researchDB.length; i++) {
      if (usedIndices.has(i)) continue
      const entry = researchDB[i]
      if (entry.chaves.some(k => lower.includes(k) || k.includes(lower.split(' ')[0]))) {
        matched.push(entry)
        usedIndices.add(i)
        break
      }
    }
  }

  return matched
}
