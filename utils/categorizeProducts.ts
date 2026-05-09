import { Product } from '@/types/product';

export interface CategorizedProducts {
  kits: Product[];
  articulacoes: Product[];
  vitaminas: Product[];
  fibras: Product[];
  compostosNaturais: Product[];
  calcio: Product[];
  melatonina: Product[];
  xaropes: Product[];
  outros: Product[];
}

export function categorizeProducts(products: Product[]): CategorizedProducts {
  const categorized: CategorizedProducts = {
    kits: [],
    articulacoes: [],
    vitaminas: [],
    fibras: [],
    compostosNaturais: [],
    calcio: [],
    melatonina: [],
    xaropes: [],
    outros: [],
  };

  const isCalcio = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('condroless') ||
      lowerNome.includes('calcio') ||
      lowerNome.includes('cálcio') ||
      lowerNome.includes('osteocorp')
    );
  };

  const isMelatonina = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('cogniflex') ||
      lowerNome.includes('melatonina') &&
      !lowerNome.includes('xarope')
    );
  };

  const isXaropes = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('flebogenol') ||
      lowerNome.includes('xarope') ||
      lowerNome.includes('mucolisil') ||
      lowerNome.includes('meltrat')
    );
  };

  const isArticulacoes = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('articulice') ||
      lowerNome.includes('curcuma') ||
      lowerNome.includes('curcumina') ||
      lowerNome.includes('colageno tipo') ||
      lowerNome.includes('colágen') ||
      lowerNome.includes('hialuronico') ||
      lowerNome.includes('glucosamina') ||
      lowerNome.includes('condroitina') ||
      lowerNome.includes('flex-a-mim') ||
      lowerNome.includes('flex a mim')
    );
  };

  const isVitaminas = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('coenzima') ||
      lowerNome.includes('q10') ||
      lowerNome.includes('b12') ||
      lowerNome.includes('metilcobalamina') ||
      lowerNome.includes('folato') ||
      lowerNome.includes('nac') ||
      lowerNome.includes('enzicoba') ||
      lowerNome.includes('visyneral') ||
      lowerNome.includes('vi-syneral')
    );
  };

  const isFibras = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('laxtrine') ||
      lowerNome.includes('fibra') ||
      lowerNome.includes('ameixa') ||
      lowerNome.includes('tamarindo') ||
      lowerNome.includes('inulina') ||
      lowerNome.includes('fos')
    );
  };

  const isCompostosNaturais = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('carvão') ||
      lowerNome.includes('carve') ||
      lowerNome.includes('pinus')
    );
  };

  const isOutros = (nome: string): boolean => {
    const lowerNome = nome.toLowerCase();
    return (
      lowerNome.includes('magnésio') ||
      lowerNome.includes('magnesio') ||
      lowerNome.includes('inovitann penta')
    );
  };

  products.forEach((product) => {
    if (product.nome.toLowerCase().includes('premium mix')) {
      categorized.kits.push(product);
    } else if (isArticulacoes(product.nome)) {
      categorized.articulacoes.push(product);
    } else if (isVitaminas(product.nome)) {
      categorized.vitaminas.push(product);
    } else if (isFibras(product.nome)) {
      categorized.fibras.push(product);
    } else if (isCompostosNaturais(product.nome)) {
      categorized.compostosNaturais.push(product);
    } else if (isCalcio(product.nome)) {
      categorized.calcio.push(product);
    } else if (isMelatonina(product.nome)) {
      categorized.melatonina.push(product);
    } else if (isXaropes(product.nome)) {
      categorized.xaropes.push(product);
    } else if (isOutros(product.nome)) {
      categorized.outros.push(product);
    }
  });

  return categorized;
}
