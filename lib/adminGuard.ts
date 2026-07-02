import { auth } from '@/lib/auth'

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN'])

/** True se o valor for exatamente um papel de administrador (comparação exata, não substring). */
export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && ADMIN_ROLES.has(role)
}

/**
 * Verifica se a request vem de uma sessão ADMIN ou SUPER_ADMIN.
 * Retorna a sessão completa ou null se não autorizado.
 * Usado em rotas /api/* que exigem admin.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!isAdminRole(session?.user?.role)) return null
  return session
}
