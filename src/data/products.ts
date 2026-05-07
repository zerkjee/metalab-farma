export interface Product {
  id: string
  name: string
  category: string
  description: string
  shortDesc: string
  price: number
  originalPrice: number
  rating: number
  reviewCount: number
  badge?: "bestseller" | "new" | "sale" | "popular"
  inStock: boolean
  capsules?: string
  weight?: string
  color: string
}

export const products: Product[] = [
  {
    id: "vitamina-c-1000",
    name: "Vitamina C 1000mg",
    category: "Vitaminas",
    description: "Ácido ascórbico de alta pureza com bioflavonoides cítricos para melhor absorção.",
    shortDesc: "60 cápsulas · Ácido Ascórbico + Bioflavonoides",
    price: 39.90,
    originalPrice: 49.90,
    rating: 4.9,
    reviewCount: 312,
    badge: "bestseller",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#6b5bf0",
  },
  {
    id: "omega-3-1000",
    name: "Ômega 3 1000mg",
    category: "Ômegas",
    description: "Óleo de peixe concentrado com alto teor de EPA e DHA, livre de mercúrio.",
    shortDesc: "60 cápsulas · EPA 360mg + DHA 240mg",
    price: 54.90,
    originalPrice: 69.90,
    rating: 4.8,
    reviewCount: 248,
    inStock: true,
    capsules: "60 cápsulas",
    color: "#2563eb",
  },
  {
    id: "magnesio-quelato",
    name: "Magnésio Quelato",
    category: "Minerais",
    description: "Bisglicinato de magnésio com alta biodisponibilidade e absorção superior.",
    shortDesc: "60 cápsulas · Bisglicinato 500mg",
    price: 62.90,
    originalPrice: 79.90,
    rating: 4.9,
    reviewCount: 187,
    badge: "new",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#0d9488",
  },
  {
    id: "colageno-hidrolisado",
    name: "Colágeno Hidrolisado",
    category: "Proteínas",
    description: "Peptídeos de colágeno tipo I e II com vitamina C para máxima síntese.",
    shortDesc: "300g · Tipo I e II · Sabor Neutro",
    price: 71.90,
    originalPrice: 89.90,
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    weight: "300g",
    color: "#92400e",
  },
  {
    id: "vitamina-d3-k2",
    name: "Vitamina D3 + K2",
    category: "Vitaminas",
    description: "Combinação sinérgica de D3 (colecalciferol) e K2 (MK-7) para saúde óssea.",
    shortDesc: "60 cápsulas · 2000UI + MK-7 100mcg",
    price: 47.90,
    originalPrice: 59.90,
    rating: 4.8,
    reviewCount: 203,
    badge: "popular",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#d97706",
  },
  {
    id: "complexo-b",
    name: "Complexo B",
    category: "Complexos",
    description: "Fórmula completa com todas as vitaminas do complexo B em formas ativas.",
    shortDesc: "60 cápsulas · B1 B2 B3 B5 B6 B7 B9 B12",
    price: 34.90,
    originalPrice: 44.90,
    rating: 4.7,
    reviewCount: 134,
    inStock: true,
    capsules: "60 cápsulas",
    color: "#7c3aed",
  },
  {
    id: "zinco-quelato",
    name: "Zinco Quelato 30mg",
    category: "Minerais",
    description: "Bisglicinato de zinco com absorção otimizada e sem irritação gástrica.",
    shortDesc: "60 cápsulas · Bisglicinato de Zinco",
    price: 29.90,
    originalPrice: 39.90,
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    capsules: "60 cápsulas",
    color: "#475569",
  },
  {
    id: "ashwagandha-ks66",
    name: "Ashwagandha KS-66",
    category: "Adaptógenos",
    description: "Extrato padronizado KSM-66® com 5% de witanolídeos, o mais estudado do mercado.",
    shortDesc: "60 cápsulas · KSM-66® 600mg",
    price: 89.90,
    originalPrice: 109.90,
    rating: 4.9,
    reviewCount: 276,
    badge: "bestseller",
    inStock: true,
    capsules: "60 cápsulas",
    color: "#15803d",
  },
]
