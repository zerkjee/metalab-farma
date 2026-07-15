export function normalizeHexColor(value: string | null | undefined) {
  const color = value?.trim()
  if (!color) return null

  const shortHex = /^#([0-9a-f]{3})$/i.exec(color)
  if (shortHex) {
    return `#${shortHex[1].split('').map((char) => char + char).join('')}`
  }

  if (/^#[0-9a-f]{6}$/i.test(color)) return color
  return null
}

export function resolveProductColor(...colors: Array<string | null | undefined>) {
  for (const color of colors) {
    const normalized = normalizeHexColor(color)
    if (normalized) return normalized
  }
  return '#323C64'
}

export function colorWithAlpha(color: string, alpha: string) {
  return `${color}${alpha}`
}

type Rgb = { r: number; g: number; b: number }

function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHexColor(hex) ?? '#323C64'
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  }
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`
}

function mix(color: string, target: string, weight: number) {
  const from = hexToRgb(color)
  const to = hexToRgb(target)
  return rgbToHex({
    r: from.r + (to.r - from.r) * weight,
    g: from.g + (to.g - from.g) * weight,
    b: from.b + (to.b - from.b) * weight,
  })
}

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  const channels = [r, g, b].map((value) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function contrastRatio(a: string, b: string) {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function ensureContrast({
  color,
  against,
  target,
  minimum,
}: {
  color: string
  against: string
  target: string
  minimum: number
}) {
  let current = color
  for (let i = 0; i <= 12; i += 1) {
    if (contrastRatio(current, against) >= minimum) return current
    current = mix(color, target, (i + 1) / 12)
  }
  return current
}

export function createProductColorTheme(...colors: Array<string | null | undefined>) {
  const accent = resolveProductColor(...colors)
  const accentStrong = ensureContrast({
    color: accent,
    against: '#ffffff',
    target: '#121628',
    minimum: 4.5,
  })
  const accentText = ensureContrast({
    color: accent,
    against: '#ffffff',
    target: '#121628',
    minimum: 4.5,
  })
  const accentHover = ensureContrast({
    color: mix(accentStrong, '#121628', 0.12),
    against: '#ffffff',
    target: '#121628',
    minimum: 4.5,
  })

  return {
    accent,
    accentStrong,
    accentText,
    accentHover,
    onAccent: '#ffffff',
    subtle: colorWithAlpha(accent, '08'),
    soft: colorWithAlpha(accent, '14'),
    border: colorWithAlpha(accent, '24'),
    focusRing: colorWithAlpha(accentStrong, '55'),
  }
}
