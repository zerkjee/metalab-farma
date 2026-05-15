export interface Product {
  id: number;
  nome: string;
  marca: string;
  preco: string | number;
  estoque: number;
  descricao: string | null;
  imagemUrl: string | null;
  ativo: boolean;
  criado_em: string;
}
