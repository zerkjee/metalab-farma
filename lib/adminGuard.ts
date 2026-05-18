import { auth } from '@/lib/auth'

/**
 * Verifica se a request vem de uma sessão ADMIN ou SUPER_ADMIN.
 * Retorna a sessão completa ou null se não autorizado.
 * Usado em rotas /api/admin/* como substituto das funções requireAdmin() locais.
 */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.role?.includes('ADMIN')) return null
  return session
}
