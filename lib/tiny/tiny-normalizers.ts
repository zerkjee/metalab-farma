export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function normalizeCpfCnpj(value: string): string {
  return onlyDigits(value)
}

export function normalizePhone(value?: string | null): string | undefined {
  const normalized = onlyDigits(String(value ?? ''))
  return normalized || undefined
}

export function normalizeCep(value: string): string {
  return onlyDigits(value)
}

export function normalizeUf(value: string): string {
  return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
}

export function normalizeMoney(value: unknown): number {
  if (value == null) return 0
  const numberValue = typeof value === 'number' ? value : Number(String(value).replace(',', '.'))
  if (!Number.isFinite(numberValue)) return 0
  return Math.round((numberValue + Number.EPSILON) * 100) / 100
}

export function normalizeDateToTiny(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}
