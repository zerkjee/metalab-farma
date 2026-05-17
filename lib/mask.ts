// Helpers para mascarar PII antes de gravar em logs.
// Princípio: manter o suficiente para rastreabilidade humana (suporte) sem
// expor o dado completo em logs que podem ir para Logtail/Datadog/Vercel logs.

export function maskEmail(email: string | null | undefined): string {
  if (!email) return ''
  const at = email.indexOf('@')
  if (at < 1) return '***'
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(1, local.length - visible.length))}@${domain}`
}

export function maskCpf(cpf: string | null | undefined): string {
  if (!cpf) return ''
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return '***'
  return `***.***.***-${digits.slice(9, 11)}`
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return '***'
  const ddd = digits.slice(0, 2)
  const last = digits.slice(-4)
  return `(${ddd}) ****-${last}`
}

export function maskCep(cep: string | null | undefined): string {
  if (!cep) return ''
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return '***'
  return `${digits.slice(0, 5)}-***`
}

export function maskName(name: string | null | undefined): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}
