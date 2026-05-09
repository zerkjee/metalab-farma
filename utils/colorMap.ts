export interface ColorScheme {
  primary: string;
  secondary: string;
  light: string;
  dark: string;
  text: string;
  border: string;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function generateColorScheme(
  primaryHex: string,
  secondaryHex: string = "#f3f4f6"
): ColorScheme {
  return {
    primary: primaryHex,
    secondary: secondaryHex,
    light: secondaryHex,
    dark: primaryHex,
    text: primaryHex,
    border: secondaryHex,
  };
}

export const safeColorMap: Record<string, string> = {
  "#2563eb": "blue",
  "#dc2626": "red",
  "#65a30d": "green",
  "#d97706": "amber",
  "#6b21a8": "purple",
  "#6366f1": "indigo",
  "#8b5cf6": "violet",
  "#0ea5e9": "sky",
  "#ec4899": "pink",
  "#f59e0b": "yellow",
  "#a0a0a0": "gray",
  "#676c81": "slate",
  "#bd797a": "rose",
  "#3f999f": "cyan",
  "#575757": "zinc",
  "#861878": "fuchsia",
  "#c6e0eb": "blue",
  "#333333": "gray",
  "#002659": "blue",
  "#232a65": "blue",
  "#7f7f7f": "gray",
  "#fdd284": "yellow",
};

export function getColorTailwind(hexColor: string): string {
  return safeColorMap[hexColor] || "purple";
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 155 ? "#000000" : "#ffffff";
}

export const buttonColorClasses = {
  blue: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
  red: "bg-red-500 hover:bg-red-600 text-white border-red-500",
  green: "bg-green-500 hover:bg-green-600 text-white border-green-500",
  amber: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
  purple: "bg-purple-500 hover:bg-purple-600 text-white border-purple-500",
  indigo: "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500",
  violet: "bg-violet-500 hover:bg-violet-600 text-white border-violet-500",
  sky: "bg-sky-500 hover:bg-sky-600 text-white border-sky-500",
  pink: "bg-pink-500 hover:bg-pink-600 text-white border-pink-500",
  yellow: "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
  gray: "bg-gray-500 hover:bg-gray-600 text-white border-gray-500",
  slate: "bg-slate-500 hover:bg-slate-600 text-white border-slate-500",
  rose: "bg-rose-500 hover:bg-rose-600 text-white border-rose-500",
  cyan: "bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-500",
  zinc: "bg-zinc-500 hover:bg-zinc-600 text-white border-zinc-500",
  fuchsia: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white border-fuchsia-500",
};

export function getButtonClasses(hexColor: string): string {
  const tailwindColor = getColorTailwind(hexColor);
  return buttonColorClasses[tailwindColor as keyof typeof buttonColorClasses] || buttonColorClasses.purple;
}
