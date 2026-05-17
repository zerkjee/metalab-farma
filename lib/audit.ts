import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface AuditParams {
  adminId: string
  adminEmail: string
  acao: string      // ex: 'cupom.criado', 'cupom.deletado', 'admin.criado'
  recurso: string   // ex: 'Cupom', 'Produto', 'Admin'
  recursoId?: string
  detalhe?: Record<string, unknown>
  ip?: string | null
}

// Fire-and-forget — não bloqueia a response e nunca lança exceção.
export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        adminEmail: params.adminEmail,
        acao: params.acao,
        recurso: params.recurso,
        recursoId: params.recursoId ?? null,
        detalhe: params.detalhe ? JSON.stringify(params.detalhe) : null,
        ip: params.ip ?? null,
      },
    })
  } catch (err) {
    logger.error('Falha ao gravar audit log', err)
  }
}

export function getClientIp(req: Request): string | null {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null
  )
}
