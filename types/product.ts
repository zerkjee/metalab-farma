export interface Product {
  id: number;
  nome: string;
  marca: string;
  preco: string | number;
  estoque: number;
  descricao: string | null;
  imagem_url: string | null;
  ativo: boolean;
  criado_em: string;
  cor_principal?: string;
  cor_secundaria?: string;
}
