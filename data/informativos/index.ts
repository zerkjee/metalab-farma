import catalogJson from './catalog.json'
import { technicalProfiles } from './profiles'
import type {
  InformativeCatalogProduct,
  InformativeProduct,
  InformativeStatus,
} from '@/types/product-informative'

interface CatalogFile {
  syncedAt: string
  source: string
  products: InformativeCatalogProduct[]
}

const catalog = catalogJson as CatalogFile

export const informativeCatalogSyncedAt = catalog.syncedAt

export const informativeProducts: InformativeProduct[] = catalog.products.map((product) => {
  const profile = technicalProfiles[product.slug]
  return {
    ...product,
    status: profile?.status ?? 'pending',
    ...(profile ? { profile } : {}),
  }
})

export function getInformativeProduct(slug: string) {
  return informativeProducts.find((product) => product.slug === slug)
}

export function informativeStatusLabel(status: InformativeStatus) {
  if (status === 'published') return 'Revisado e publicado'
  if (status === 'ocr-extracted') return 'OCR extraído - revisão necessária'
  return 'Ficha técnica pendente de conciliação'
}

export function buildHiggsfieldBackgroundPrompt(product: InformativeProduct) {
  const visual = product.profile?.visual
  const ingredients = visual?.elements.join(', ')
  const palette = visual?.palette ?? 'colors and materials sampled from the uploaded product packaging'
  const mood = visual?.mood ?? 'premium, clean, restrained and packaging-led'
  const productSpecificDirection = ingredients
    ? `Build the scene around these verified visual ingredients: ${ingredients}.`
    : 'Do not add literal ingredient props because the technical formula is still under review; use only abstract light, soft material layers and the package color palette.'

  return [
    `Create a premium commercial background for ${product.nome}, designed as a wide 16:9 website hero banner.`,
    'Background only: do not render the product, bottle, box, label, logo, brand name, typography or readable text.',
    `Use ${palette}. The atmosphere should feel ${mood}.`,
    productSpecificDirection,
    'Keep a generous, uncluttered negative-space area in the center-right for the product pack to be composited later, with a stable surface and a realistic soft contact shadow.',
    'Use high-end editorial product photography, controlled studio lighting, subtle depth, realistic materials, refined highlights and crisp 2K detail.',
    'Avoid people, hands, pills, capsules, medical devices, organs, anatomy, pain imagery, before-and-after comparisons, disease references, clinical promises, floating text, watermarks and extra packaging.',
  ].join(' ')
}
