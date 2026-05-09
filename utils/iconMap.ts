export const ingredienteIconMap: Record<string, string> = {
  "Colágeno Tipo II": "Hexagon",
  "Ácido Hialurônico": "Droplets",
  Cúrcuma: "Leaf",
  Glucosamina: "Zap",
  "Coenzima Q10": "Zap",
  Magnésio: "Zap",
  Metilcobalamina: "Pill",
  "Vitamina B12": "Pill",
  Folato: "Pill",
  "Vitamina C": "Apple",
  "Fibras Naturais": "Wheat",
  Ameixa: "Apple",
  Tamarindo: "Leaf",
  Inulina: "Zap",
  FOS: "Droplets",
  "Pinus pinaster": "Pine",
  Melatonina: "Moon",
  "Carbonato de Cálcio": "Zap",
  "Carvão Vegetal Ativado": "Shield",
  "Vitaminas e Minerais": "Sparkles",
  "N-acetilcisteína (NAC)": "Zap",
  "Cobalamina Ativa": "Pill",
  "Vitamina B6": "Pill",
};

export function getIconNameForIngrediente(ingrediente: string): string {
  return ingredienteIconMap[ingrediente] || "Sparkles";
}

export const iconColors: Record<string, string> = {
  Hexagon: "text-blue-500",
  Droplets: "text-cyan-500",
  Leaf: "text-green-500",
  Zap: "text-yellow-500",
  Apple: "text-red-500",
  Pill: "text-purple-500",
  Wheat: "text-amber-600",
  Pine: "text-emerald-600",
  Moon: "text-indigo-500",
  Heart: "text-pink-500",
  Shield: "text-slate-500",
  Sparkles: "text-violet-500",
};

export function getColorForIconName(iconName: string): string {
  return iconColors[iconName] || "text-gray-500";
}
