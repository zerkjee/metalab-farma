export interface Category {
  id: string
  name: string
  description: string
  productCount: number
  color: string
  bgColor: string
}

export const categories: Category[] = [
  {
    id: "vitaminas",
    name: "Vitaminas",
    description: "Suplementação essencial para o dia a dia",
    productCount: 14,
    color: "#2d7a4f",
    bgColor: "#f0faf4",
  },
  {
    id: "minerais",
    name: "Minerais",
    description: "Quelatos de alta biodisponibilidade",
    productCount: 9,
    color: "#0d9488",
    bgColor: "#f0fdfa",
  },
  {
    id: "omegas",
    name: "Ômegas",
    description: "Ácidos graxos essenciais purificados",
    productCount: 6,
    color: "#2563eb",
    bgColor: "#eff6ff",
  },
  {
    id: "proteinas",
    name: "Proteínas",
    description: "Colágeno, whey e proteínas vegetais",
    productCount: 8,
    color: "#92400e",
    bgColor: "#fffbeb",
  },
  {
    id: "adaptogenos",
    name: "Adaptógenos",
    description: "Extratos botânicos padronizados",
    productCount: 7,
    color: "#7c3aed",
    bgColor: "#f5f3ff",
  },
]
