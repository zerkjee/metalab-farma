// Estes arquivos possuem um fundo branco ou off-white incorporado no próprio
// bitmap. A lista serve somente para escolher o fundo da moldura; nunca deve
// ser usada para recortar, mascarar ou aplicar filtros na imagem do produto.
const embeddedWhiteBackgroundFilenames = [
  'ademoril.png',
  'articulice_curcuma.png',
  'azigov_pote.png',
  'azigov.png',
  'biotina.png',
  'bisglicinato_ferroso_30.png',
  'bisglicinato_ferroso_60.png',
  'camomila_baby.png',
  'cogplene.png',
  'complexo_b_concentrado.png',
  'complexo_b.png',
  'condroless_complex.png',
  'condroless_ultra.png',
  'dissocal.png',
  'epatinon_comprimido_200.png',
  'epatinon_comprimido.png',
  'flebogenol_30.png',
  'flex_a_mim.png',
  'gargotoss.png',
  'lactase_10.png',
  'lactitol_120ml.png',
  'lactitol_200ml.png',
  'lactulose.png',
  'laxmovi_peg.png',
  'laxtrine_fibras.png',
  'laxtrine_geleia.png',
  'meltrat_pastilha_01.png',
  'metilcobalamina.png',
  'mforce.png',
  'movelev.png',
  'movilac_120ml.png',
  'movilac_200ml.png',
  'muricalm_babycolli.png',
  'nac.png',
  'noglute.png',
  'orapronobis.png',
  'osteocorp_500mg.png',
  'pankreoflat.png',
  'paracetamol_200.png',
  'paracetamol_30.png',
  'peadex_300.png',
  'peadex_600.png',
  'protobaby.png',
  'purofer_150mg.png',
  'purofer_300mg.png',
  'q10.png',
  'reporgermina_ped.png',
  'valfresh.png',
  'visyneral_dha.png',
  'visyneral_folato.png',
  'visyneral_pre_natal.png',
  'visyneral_sop.png',
  'vitamina_k.png',
] as const

const embeddedWhiteBackgroundSet = new Set<string>(embeddedWhiteBackgroundFilenames)

function getFilename(imageUrl: string): string | undefined {
  const pathname = imageUrl.split(/[?#]/, 1)[0]
  const rawFilename = pathname.split('/').at(-1)
  if (!rawFilename) return undefined

  try {
    return decodeURIComponent(rawFilename)
  } catch {
    return rawFilename
  }
}

export function hasEmbeddedWhiteProductBackground(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false

  const filename = getFilename(imageUrl)
  return filename ? embeddedWhiteBackgroundSet.has(filename) : false
}

export const productImagesWithEmbeddedWhiteBackground = Object.freeze(
  [...embeddedWhiteBackgroundFilenames].sort((left, right) => left.localeCompare(right, 'pt-BR')),
)
