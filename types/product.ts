export interface Product {
  id: string;
  nome: string;
  slug: string;
  sku?: string;
  marca: string;
  preco: number;
  precoOriginal?: number | null;
  estoque: number;
  descricaoCurta?: string | null;
  descricaoHtml?: string | null;
  imagemUrl?: string | null;
  ativo: boolean;
  destaque?: boolean;
  corPrincipal?: string | null;
  criadoEm?: string;
  categoria?: { id: string; nome: string; slug: string } | null;
}
