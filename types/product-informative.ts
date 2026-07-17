export type InformativeStatus = 'pending' | 'ocr-extracted' | 'published'

export interface InformativeCatalogProduct {
  id: string
  nome: string
  slug: string
  marca: string
  imagemUrl: string | null
  corPrincipal: string | null
}

export interface NutritionRow {
  nutrient: string
  amount: string
  dailyValue?: string
}

export interface ProductTechnicalProfile {
  status: Exclude<InformativeStatus, 'pending'>
  sourceFile: string
  sourceLabel: string
  presentation: string
  classification: string
  ingredients: string[]
  serving?: string
  nutrition?: NutritionRow[]
  declarations?: string[]
  warnings?: string[]
  ean?: string
  reviewNotes?: string[]
  visual: {
    palette: string
    elements: string[]
    mood: string
  }
}

export interface InformativeProduct extends InformativeCatalogProduct {
  status: InformativeStatus
  profile?: ProductTechnicalProfile
}
