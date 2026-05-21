export interface Product {
  id: string
  nome: string
  slug: string
  sku?: string
  ean?: string | null
  marca: string
  subtitulo?: string | null
  categoriaId?: string | null
  categoria?: { id: string; nome: string; slug: string } | null
  tipo: "SIMPLES" | "KIT"
  // Preço
  preco: number
  precoOriginal?: number | null
  // Estoque
  estoque: number
  estoqueMin?: number
  // Conteúdo
  descricaoCurta?: string | null
  descricaoHtml?: string | null
  composicao?: string | null
  modoDeUso?: string | null
  // Logística
  pesoGramas?: number | null
  alturaCm?: number | null
  larguraCm?: number | null
  comprimentoCm?: number | null
  // Descoberta
  tags: string[]
  // Visual
  imagemUrl?: string | null
  corPrincipal?: string | null
  corSecundaria?: string | null
  imagens?: { id: string; url: string; alt?: string | null; ordem: number }[]
  // SEO
  metaTitulo?: string | null
  metaDescricao?: string | null
  palavrasChave?: string | null
  // Flags
  ativo: boolean
  destaque?: boolean
  // Kit
  kitItens?: {
    id: string
    quantidade: number
    ordem: number
    produtoId: string
    produto: { id: string; nome: string; slug: string; preco: number; imagemUrl?: string | null }
  }[]
  kitsDisponiveis?: {
    id: string
    nome: string
    slug: string
    preco: number
    precoOriginal?: number | null
    estoque: number
    quantidade: number
  }[]
  // Meta
  criadoEm?: string
  atualizadoEm?: string
}
