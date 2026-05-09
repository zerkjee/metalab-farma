import { Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/produtos`);
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

export async function getProduct(id: number): Promise<Product> {
  try {
    const response = await fetch(`${API_URL}/produtos/${id}`);
    if (!response.ok) {
      throw new Error('Produto não encontrado');
    }
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}
