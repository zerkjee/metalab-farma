import type { ProductTechnicalProfile } from '@/types/product-informative'

export type TechnicalEvidence =
  | 'funcao-nutricional'
  | 'papel-fisiologico'
  | 'contexto-tecnico'
  | 'evidencia-limitada'

export interface TechnicalSource {
  id: string
  label: string
  url: string
}

export interface TechnicalComponentExplanation {
  id: string
  label: string
  explanation: string
  evidence: TechnicalEvidence
  evidenceLabel: string
  focus: string[]
  sourceIds: string[]
}

interface TechnicalDefinition extends TechnicalComponentExplanation {
  matches: RegExp[]
}

export interface ProductTechnicalOverview {
  status: 'available' | 'blocked'
  purpose: string
  components: TechnicalComponentExplanation[]
  focuses: string[]
  sources: TechnicalSource[]
  note: string
}

export const technicalSources: Record<string, TechnicalSource> = {
  anvisa: {
    id: 'anvisa',
    label: 'Anvisa — constituintes, alegações e condições de uso',
    url: 'https://www.gov.br/anvisa/pt-br/assuntos/alimentos/ingredientes',
  },
  anvisaRotulo: {
    id: 'anvisaRotulo',
    label: 'Anvisa — como ler o rótulo de suplementos',
    url: 'https://www.gov.br/anvisa/pt-br/assuntos/alimentos/suplementos-alimentares/lembre-se-de-ler-o-rotulo-com-atencao',
  },
  nihNutrients: {
    id: 'nihNutrients',
    label: 'NIH ODS — fichas técnicas de vitaminas, minerais e suplementos',
    url: 'https://ods.od.nih.gov/factsheets/list-all/',
  },
  nihMagnesium: {
    id: 'nihMagnesium',
    label: 'NIH ODS — magnésio',
    url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
  },
  nihVitaminC: {
    id: 'nihVitaminC',
    label: 'NIH ODS — vitamina C',
    url: 'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/',
  },
  nihVitaminD: {
    id: 'nihVitaminD',
    label: 'NIH ODS — vitamina D',
    url: 'https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/',
  },
  nihB12: {
    id: 'nihB12',
    label: 'NIH ODS — vitamina B12',
    url: 'https://ods.od.nih.gov/factsheets/VitaminB12-HealthProfessional/',
  },
  nihFolate: {
    id: 'nihFolate',
    label: 'NIH ODS — folato',
    url: 'https://ods.od.nih.gov/factsheets/Folate-HealthProfessional/',
  },
  nihCholine: {
    id: 'nihCholine',
    label: 'NIH ODS — colina',
    url: 'https://ods.od.nih.gov/factsheets/Choline-HealthProfessional/',
  },
  nihIron: {
    id: 'nihIron',
    label: 'NIH ODS — ferro',
    url: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/',
  },
  nihZinc: {
    id: 'nihZinc',
    label: 'NIH ODS — zinco',
    url: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/',
  },
  nihCalcium: {
    id: 'nihCalcium',
    label: 'NIH ODS — cálcio',
    url: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/',
  },
  nccihMelatonin: {
    id: 'nccihMelatonin',
    label: 'NCCIH/NIH — melatonina',
    url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know',
  },
  nccihJoint: {
    id: 'nccihJoint',
    label: 'NCCIH/NIH — glucosamina e condroitina',
    url: 'https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis-what-you-need-to-know',
  },
  neiCarotenoids: {
    id: 'neiCarotenoids',
    label: 'NEI/NIH — luteína e zeaxantina em estudos oculares',
    url: 'https://www.nei.nih.gov/eye-health-information/clinical-trials/age-related-eye-disease-studies-aredsareds2/about-areds-and-areds2',
  },
  pinusBark: {
    id: 'pinusBark',
    label: 'PubMed Central — origem e composição do extrato da casca de Pinus pinaster',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11096517/',
  },
}

const EVIDENCE_LABELS: Record<TechnicalEvidence, string> = {
  'funcao-nutricional': 'Função nutricional reconhecida',
  'papel-fisiologico': 'Papel fisiológico',
  'contexto-tecnico': 'Contexto técnico',
  'evidencia-limitada': 'Sem promessa clínica',
}

function define(
  definition: Omit<TechnicalDefinition, 'evidenceLabel'>,
): TechnicalDefinition {
  return { ...definition, evidenceLabel: EVIDENCE_LABELS[definition.evidence] }
}

const definitions: TechnicalDefinition[] = [
  define({
    id: 'magnesio', label: 'Magnésio',
    matches: [/magn[ée]sio/i, /dimalato de magn[ée]sio/i],
    explanation: 'Cofator de centenas de enzimas; participa do metabolismo energético, da função neuromuscular e da formação óssea.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético', 'função neuromuscular', 'manutenção óssea'], sourceIds: ['anvisa', 'nihMagnesium'],
  }),
  define({
    id: 'calcio', label: 'Cálcio', matches: [/c[áa]lcio/i],
    explanation: 'Mineral estrutural dos ossos e dentes; também participa da contração muscular e da sinalização celular.',
    evidence: 'funcao-nutricional', focus: ['manutenção óssea', 'função neuromuscular'], sourceIds: ['anvisa', 'nihCalcium'],
  }),
  define({
    id: 'zinco', label: 'Zinco', matches: [/zinco/i],
    explanation: 'Participa da síntese de proteínas e DNA, da função imune e da proteção das células contra danos oxidativos.',
    evidence: 'funcao-nutricional', focus: ['função imune', 'proteção antioxidante'], sourceIds: ['anvisa', 'nihZinc'],
  }),
  define({
    id: 'selenio', label: 'Selênio', matches: [/sel[êe]nio/i],
    explanation: 'Integra enzimas antioxidantes e participa do metabolismo dos hormônios da tireoide e da função imune.',
    evidence: 'funcao-nutricional', focus: ['proteção antioxidante', 'função tireoidiana'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'ferro', label: 'Ferro', matches: [/ferro/i, /ferroso/i],
    explanation: 'É necessário para hemoglobina e transporte de oxigênio, além de participar do metabolismo energético.',
    evidence: 'funcao-nutricional', focus: ['formação sanguínea', 'transporte de oxigênio'], sourceIds: ['anvisa', 'nihIron'],
  }),
  define({
    id: 'iodo', label: 'Iodo', matches: [/iodo/i, /iodeto/i],
    explanation: 'É matéria-prima dos hormônios tireoidianos, que regulam o metabolismo e participam do desenvolvimento.',
    evidence: 'funcao-nutricional', focus: ['função tireoidiana', 'metabolismo energético'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-a', label: 'Vitamina A', matches: [/vitamina a\b/i, /retinol/i],
    explanation: 'Participa da visão, da função imune e da manutenção dos tecidos epiteliais.',
    evidence: 'funcao-nutricional', focus: ['visão', 'função imune'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-c', label: 'Vitamina C', matches: [/vitamina c\b/i, /[áa]cido asc[óo]rbico/i],
    explanation: 'Atua como antioxidante, participa da síntese de colágeno, da função imune e aumenta a absorção do ferro não heme.',
    evidence: 'funcao-nutricional', focus: ['proteção antioxidante', 'síntese de colágeno', 'função imune'], sourceIds: ['anvisa', 'nihVitaminC'],
  }),
  define({
    id: 'vitamina-d', label: 'Vitamina D', matches: [/vitamina d(?:3)?\b/i, /colecalciferol/i],
    explanation: 'Auxilia a absorção de cálcio e fósforo e participa da manutenção de ossos, músculos e função imune.',
    evidence: 'funcao-nutricional', focus: ['manutenção óssea', 'função neuromuscular', 'função imune'], sourceIds: ['anvisa', 'nihVitaminD'],
  }),
  define({
    id: 'vitamina-e', label: 'Vitamina E', matches: [/vitamina e\b/i, /tocoferol/i],
    explanation: 'Antioxidante lipossolúvel que ajuda a proteger as membranas celulares dos danos oxidativos.',
    evidence: 'funcao-nutricional', focus: ['proteção antioxidante'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-k', label: 'Vitamina K', matches: [/vitamina k(?:2)?\b/i, /menaquinona/i],
    explanation: 'Participa da coagulação normal e da ativação de proteínas envolvidas na manutenção óssea.',
    evidence: 'funcao-nutricional', focus: ['manutenção óssea', 'coagulação'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-b1', label: 'Vitamina B1', matches: [/vitamina b1\b/i, /tiamina/i],
    explanation: 'Atua como coenzima na conversão de carboidratos em energia e na função do sistema nervoso.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético', 'sistema nervoso'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-b2', label: 'Vitamina B2', matches: [/vitamina b2\b/i, /riboflavina/i],
    explanation: 'Forma coenzimas usadas na produção de energia e em reações de proteção antioxidante.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético', 'proteção antioxidante'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-b3', label: 'Vitamina B3', matches: [/vitamina b3\b/i, /niacina/i, /nicotinamida/i],
    explanation: 'Origina coenzimas NAD e NADP, essenciais ao metabolismo energético e a numerosas reações celulares.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-b5', label: 'Vitamina B5', matches: [/vitamina b5\b/i, /pantotenato/i],
    explanation: 'Integra a coenzima A, central no uso de carboidratos, gorduras e proteínas para obtenção de energia.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'vitamina-b6', label: 'Vitamina B6', matches: [/vitamina b6\b/i, /piridox/i, /fosfato de piridoxal/i],
    explanation: 'Participa do metabolismo de proteínas, da formação de células sanguíneas e da síntese de neurotransmissores.',
    evidence: 'funcao-nutricional', focus: ['sistema nervoso', 'formação sanguínea', 'metabolismo energético'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'folato', label: 'Folato / vitamina B9', matches: [/vitamina b9\b/i, /folato/i, /[áa]cido f[óo]lico/i],
    explanation: 'Participa da síntese de DNA, da divisão celular e da formação de células sanguíneas.',
    evidence: 'funcao-nutricional', focus: ['divisão celular', 'formação sanguínea'], sourceIds: ['anvisa', 'nihFolate'],
  }),
  define({
    id: 'vitamina-b12', label: 'Vitamina B12', matches: [/vitamina b12\b/i, /cobalamina/i],
    explanation: 'Participa da formação de células sanguíneas, da função neurológica e da síntese de DNA.',
    evidence: 'funcao-nutricional', focus: ['formação sanguínea', 'sistema nervoso'], sourceIds: ['anvisa', 'nihB12'],
  }),
  define({
    id: 'biotina', label: 'Biotina / vitamina B7', matches: [/biotina/i, /vitamina b7/i],
    explanation: 'É coenzima de reações que metabolizam gorduras, carboidratos e aminoácidos.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'complexo-b', label: 'Vitaminas do complexo B', matches: [/vitaminas do complexo b/i, /complexo b/i],
    explanation: 'Grupo de vitaminas com funções complementares no metabolismo energético, no sistema nervoso e na formação celular.',
    evidence: 'funcao-nutricional', focus: ['metabolismo energético', 'sistema nervoso'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'colina', label: 'Colina', matches: [/colina/i],
    explanation: 'Compõe fosfolipídios de membrana e acetilcolina; também participa do transporte de lipídios e de reações de metilação.',
    evidence: 'papel-fisiologico', focus: ['membranas celulares', 'sistema nervoso'], sourceIds: ['nihCholine'],
  }),
  define({
    id: 'metionina', label: 'Metionina', matches: [/metionina/i],
    explanation: 'Aminoácido essencial usado na síntese de proteínas e como doador de grupos metil; também pode originar cisteína.',
    evidence: 'papel-fisiologico', focus: ['síntese proteica', 'metabolismo celular'], sourceIds: ['nihNutrients'],
  }),
  define({
    id: 'nac', label: 'N-acetilcisteína / cisteína', matches: [/acetilciste[íi]na/i, /l-ciste[íi]na/i, /^ciste[íi]na/i],
    explanation: 'Fornece cisteína, aminoácido usado na síntese proteica e na produção intracelular de glutationa.',
    evidence: 'papel-fisiologico', focus: ['síntese proteica', 'proteção antioxidante'], sourceIds: ['nihNutrients'],
  }),
  define({
    id: 'triptofano', label: 'L-triptofano', matches: [/triptofano/i],
    explanation: 'Aminoácido essencial e precursor bioquímico de serotonina, melatonina e niacina.',
    evidence: 'papel-fisiologico', focus: ['ritmo sono-vigília', 'sistema nervoso'], sourceIds: ['nihNutrients', 'nccihMelatonin'],
  }),
  define({
    id: 'treonina', label: 'L-treonina', matches: [/l-treonina/i, /^treonina/i],
    explanation: 'Aminoácido essencial incorporado às proteínas e a glicoproteínas produzidas pelo organismo.',
    evidence: 'papel-fisiologico', focus: ['síntese proteica'], sourceIds: ['nihNutrients'],
  }),
  define({
    id: 'coq10', label: 'Coenzima Q10', matches: [/coenzima q10/i, /ubiquinona/i],
    explanation: 'Transporta elétrons na cadeia mitocondrial de produção de ATP e também atua em sistemas antioxidantes celulares.',
    evidence: 'papel-fisiologico', focus: ['energia celular', 'proteção antioxidante'], sourceIds: ['nihNutrients'],
  }),
  define({
    id: 'melatonina', label: 'Melatonina', matches: [/melatonina/i],
    explanation: 'É um sinal biológico de escuridão que ajuda a sincronizar o relógio circadiano e o ciclo sono-vigília.',
    evidence: 'papel-fisiologico', focus: ['ritmo sono-vigília'], sourceIds: ['anvisa', 'nccihMelatonin'],
  }),
  define({
    id: 'lactase', label: 'Lactase', matches: [/lactase/i],
    explanation: 'Enzima que quebra a lactose em glicose e galactose durante a digestão; o efeito depende da atividade FCC e do uso correto.',
    evidence: 'funcao-nutricional', focus: ['digestão da lactose'], sourceIds: ['anvisa'],
  }),
  define({
    id: 'fibras-prebioticas', label: 'Fibras: FOS, inulina e polidextrose', matches: [/frutooligossacar/i, /\bfos\b/i, /inulina/i, /polidextrose/i, /fibra alimentar/i],
    explanation: 'Aumentam o teor de fibra; parte é fermentada pela microbiota e pode contribuir para o funcionamento intestinal.',
    evidence: 'funcao-nutricional', focus: ['função intestinal'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'colageno-ii', label: 'Colágeno tipo II', matches: [/col[áa]geno.*tipo ii/i],
    explanation: 'Proteína estrutural predominante na cartilagem; a presença no produto não permite, isoladamente, prometer resultado clínico.',
    evidence: 'contexto-tecnico', focus: ['matriz articular'], sourceIds: ['anvisa', 'nccihJoint'],
  }),
  define({
    id: 'membrana-ovo', label: 'Membrana da casca do ovo', matches: [/membrana da casca do ovo/i],
    explanation: 'Matriz natural que reúne colágeno e glicosaminoglicanos; o efeito depende da padronização e da dose declarada.',
    evidence: 'contexto-tecnico', focus: ['matriz articular'], sourceIds: ['anvisa'],
  }),
  define({
    id: 'acido-hialuronico', label: 'Ácido hialurônico', matches: [/[áa]cido hialur[ôo]nico/i],
    explanation: 'Glicosaminoglicano que retém água na matriz extracelular e integra tecidos conjuntivos e fluido sinovial.',
    evidence: 'papel-fisiologico', focus: ['matriz articular', 'hidratação tecidual'], sourceIds: ['nihNutrients'],
  }),
  define({
    id: 'glicosaminoglicanos', label: 'Glicosaminoglicanos', matches: [/glicosaminoglicano/i],
    explanation: 'Moléculas da matriz extracelular que ajudam a organizar água e componentes estruturais dos tecidos.',
    evidence: 'papel-fisiologico', focus: ['matriz articular', 'hidratação tecidual'], sourceIds: ['nihNutrients'],
  }),
  define({
    id: 'glucosamina', label: 'Glucosamina', matches: [/glucosamina/i],
    explanation: 'Açúcar aminado usado como unidade estrutural de glicosaminoglicanos; estudos de suplementação têm resultados inconsistentes.',
    evidence: 'evidencia-limitada', focus: ['matriz articular'], sourceIds: ['nccihJoint'],
  }),
  define({
    id: 'condroitina', label: 'Condroitina', matches: [/condroitina/i],
    explanation: 'Glicosaminoglicano sulfatado presente na matriz da cartilagem; estudos de suplementação têm resultados inconsistentes.',
    evidence: 'evidencia-limitada', focus: ['matriz articular'], sourceIds: ['nccihJoint'],
  }),
  define({
    id: 'curcumina', label: 'Curcumina', matches: [/curcumina/i, /curcuma longa/i],
    explanation: 'Polifenol da cúrcuma estudado por interagir com vias antioxidantes; isso não equivale a efeito terapêutico do produto.',
    evidence: 'evidencia-limitada', focus: ['proteção antioxidante'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'luteina', label: 'Luteína', matches: [/lute[íi]na/i],
    explanation: 'Carotenoide que se concentra na mácula e integra o pigmento responsável por filtrar parte da luz de alta energia.',
    evidence: 'papel-fisiologico', focus: ['pigmentos maculares'], sourceIds: ['anvisa', 'neiCarotenoids'],
  }),
  define({
    id: 'zeaxantina', label: 'Zeaxantina', matches: [/zeaxantina/i],
    explanation: 'Carotenoide do pigmento macular, concentrado especialmente na região central da retina.',
    evidence: 'papel-fisiologico', focus: ['pigmentos maculares'], sourceIds: ['anvisa', 'neiCarotenoids'],
  }),
  define({
    id: 'beta-glucana', label: 'Beta-glucana de levedura', matches: [/beta-glucana/i],
    explanation: 'Polissacarídeo de levedura reconhecido por receptores da imunidade inata; estrutura, pureza e dose determinam a resposta.',
    evidence: 'contexto-tecnico', focus: ['função imune'], sourceIds: ['anvisa', 'nihNutrients'],
  }),
  define({
    id: 'pinus', label: 'Pinus pinaster / procianidinas', matches: [/pinus pinaster/i, /procianidina/i],
    explanation: 'O extrato é obtido da casca do pinheiro-marítimo e fornece polifenóis chamados procianidinas; isso não equivale a promessa vascular ou terapêutica.',
    evidence: 'evidencia-limitada', focus: ['polifenóis da casca'], sourceIds: ['anvisa', 'pinusBark'],
  }),
  define({
    id: 'carvao', label: 'Carvão vegetal ativado', matches: [/carv[ãa]o vegetal ativado/i],
    explanation: 'Material poroso que adsorve moléculas no trato gastrointestinal; pode também reduzir a absorção de medicamentos.',
    evidence: 'contexto-tecnico', focus: ['adsorção gastrointestinal'], sourceIds: ['anvisaRotulo'],
  }),
  define({
    id: 'levedo', label: 'Levedo de cerveja', matches: [/levedo de cerveja/i, /saccharomyces cerevisiae/i],
    explanation: 'Ingrediente de levedura; sua contribuição nutricional depende dos nutrientes efetivamente quantificados na tabela.',
    evidence: 'contexto-tecnico', focus: ['composição nutricional'], sourceIds: ['anvisaRotulo'],
  }),
  define({
    id: 'botanicos-xarope', label: 'Guaco e agrião', matches: [/extrato fluido de guaco/i, /extrato fluido de agri[ãa]o/i],
    explanation: 'Extratos botânicos tradicionais; sem padronização e alegação aprovada, não se atribui efeito respiratório ao produto.',
    evidence: 'evidencia-limitada', focus: ['extratos botânicos'], sourceIds: ['anvisa'],
  }),
  define({
    id: 'mel', label: 'Mel', matches: [/^mel$/i],
    explanation: 'Ingrediente alimentar que fornece açúcares e características de sabor e textura; não é apresentado aqui como ativo terapêutico.',
    evidence: 'contexto-tecnico', focus: ['base alimentar'], sourceIds: ['anvisaRotulo'],
  }),
  define({
    id: 'botanicos-topicos', label: 'Extratos botânicos tópicos', matches: [/centelha asi[áa]tica/i, /cal[êe]ndula/i, /castanha-da-[íi]ndia/i],
    explanation: 'Integram a fase botânica da fórmula; o efeito cutâneo específico depende do extrato, concentração e validação do cosmético.',
    evidence: 'evidencia-limitada', focus: ['cuidado tópico'], sourceIds: ['anvisaRotulo'],
  }),
  define({
    id: 'sensorial-topico', label: 'Mentol e cânfora', matches: [/mentol/i, /c[âa]nfora/i],
    explanation: 'Ativam receptores sensoriais da pele e produzem sensação local de frescor ou aquecimento, sem ação sistêmica presumida.',
    evidence: 'contexto-tecnico', focus: ['sensação tópica'], sourceIds: ['anvisaRotulo'],
  }),
  define({
    id: 'base-topica', label: 'Base hidratante e emoliente', matches: [/glicerina/i, /[óo]leo mineral/i, /[óo]leo de am[êe]ndoas/i, /dimeticona/i, /ciclopentasiloxano/i],
    explanation: 'Combina umectantes, emolientes e agentes de barreira para melhorar espalhabilidade e reduzir perda de água da pele.',
    evidence: 'contexto-tecnico', focus: ['barreira cutânea'], sourceIds: ['anvisaRotulo'],
  }),
]

const blockedProducts: Record<string, string> = {
  'sulfato-ferroso-60-comprimidos': 'A tabela declara ferro, mas a composição OCR lista vitaminas do complexo B. A função combinada fica bloqueada até conciliar a arte final.',
  'inovitann-magnesio-l-treonato-60-capsulas': 'O nome menciona L-treonato, enquanto a ficha OCR lista L-treonina e bisglicinato de magnésio. A função combinada fica bloqueada até conciliar o SKU.',
  'osteocorp-500mg-vitamina-d-60-comprimidos': 'A tabela declara vitamina D3, mas ela não aparece na composição reconhecida pelo OCR. A função combinada fica bloqueada até conciliar a arte final.',
}

const technologicalIngredient = /(?:\bins\s*\d|celulose|estearato|di[óo]xido de sil[íi]cio|talco|polietilenoglicol|maltodextrina|sorbitol|sacarina|sucralose|ciclamato|aroma|corante|caramelo|benzoato|sorbato|edta|[áa]gua|goma xantana|carboximetilcelulose|hidroxipropilmetilcelulose|triacetina|croscarmelose|propilenoglicol|metilparabeno|ceteareth|[áa]lcool cet|estearato de glicerila|poliquaternium|[áa]cido c[íi]trico|[áa]cido clor[íi]drico|bicarbonato|sacarose|vermelho 40|di[óo]xido de tit[âa]nio)/i

function matchDefinition(value: string) {
  if (/estearato de magn[ée]sio/i.test(value)) return undefined
  return definitions.find((definition) => definition.matches.some((pattern) => pattern.test(value)))
}

function formatList(values: string[]) {
  if (values.length < 2) return values[0] ?? 'a finalidade declarada'
  if (values.length === 2) return `${values[0]} e ${values[1]}`
  return `${values.slice(0, -1).join(', ')} e ${values.at(-1)}`
}

export function buildProductTechnicalOverview(
  slug: string,
  profile: ProductTechnicalProfile,
): ProductTechnicalOverview {
  const blockedReason = blockedProducts[slug]
  if (blockedReason) {
    return {
      status: 'blocked',
      purpose: blockedReason,
      components: [],
      focuses: [],
      sources: [technicalSources.anvisaRotulo],
      note: 'Nenhuma função foi inferida enquanto a fonte documental estiver contraditória.',
    }
  }

  const candidates = [
    ...profile.ingredients.filter((ingredient) => !technologicalIngredient.test(ingredient)),
    ...(profile.nutrition ?? []).map((row) => row.nutrient),
  ]
  const matched = new Map<string, TechnicalDefinition>()

  for (const candidate of candidates) {
    const definition = matchDefinition(candidate)
    if (definition) matched.set(definition.id, definition)
  }

  if ([...matched.keys()].some((id) => /^vitamina-b\d|^folato$|^biotina$/.test(id))) {
    matched.delete('complexo-b')
  }

  const components = [...matched.values()].map((definition) => ({
    id: definition.id,
    label: definition.label,
    explanation: definition.explanation,
    evidence: definition.evidence,
    evidenceLabel: definition.evidenceLabel,
    focus: definition.focus,
    sourceIds: definition.sourceIds,
  }))
  const focuses = [...new Set(components.flatMap((component) => component.focus))].slice(0, 3)
  const sourceIds = [...new Set(components.flatMap((component) => component.sourceIds))]
  const sources = sourceIds.map((sourceId) => technicalSources[sourceId]).filter(Boolean)
  const purpose = components.length
    ? `Em conjunto, a fórmula reúne componentes com foco técnico em ${formatList(focuses)}. Eles têm papéis complementares, sem equivaler a tratamento ou garantir resultado individual.`
    : 'A ficha descreve a composição, mas não traz ativos com função que possa ser resumida com segurança nesta etapa.'

  return {
    status: 'available',
    purpose,
    components,
    focuses,
    sources,
    note: 'Alegações no rótulo dependem da quantidade por porção, do público e das condições de uso aprovadas pela Anvisa.',
  }
}
