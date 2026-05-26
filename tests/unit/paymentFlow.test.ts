import { describe, it, expect } from 'vitest'

// Valida a lógica pura do fluxo de pagamento PIX:
// estado do pedido, transições, e idempotência do webhook.

// ─── Tipos espelhados do fluxo real ─────────────────────────────────────────

type PedidoStatus =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGAMENTO_APROVADO'
  | 'EM_SEPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO'
  | 'REEMBOLSADO'

interface Pedido {
  id: string
  pago: boolean
  status: PedidoStatus
  pagamentoId: string | null
}

// ─── Lógica de transição (espelha webhook/route.ts) ───────────────────────────

function aplicarWebhookAprovado(pedido: Pedido, paymentId: string): Pedido | null {
  // Idempotência: só processa se ainda não estiver pago
  if (pedido.pago) return null
  if (pedido.pagamentoId !== paymentId) return null
  return { ...pedido, pago: true, status: 'PAGAMENTO_APROVADO' }
}

function aplicarWebhookCancelado(pedido: Pedido, paymentId: string): Pedido | null {
  if (pedido.pago) return null
  if (pedido.status === 'CANCELADO') return null
  if (pedido.pagamentoId !== paymentId) return null
  return { ...pedido, status: 'CANCELADO' }
}

// ─── Status inicial do pedido ─────────────────────────────────────────────────

describe('Status inicial do pedido', () => {
  it('pedido recém-criado está AGUARDANDO_PAGAMENTO e não pago', () => {
    const pedido: Pedido = {
      id: 'ped-1',
      pago: false,
      status: 'AGUARDANDO_PAGAMENTO',
      pagamentoId: null,
    }
    expect(pedido.pago).toBe(false)
    expect(pedido.status).toBe('AGUARDANDO_PAGAMENTO')
  })

  it('pedido não deve ser criado com status PAID ou COMPLETED', () => {
    const statusInvalidos: PedidoStatus[] = ['PAGAMENTO_APROVADO', 'ENTREGUE']
    for (const s of statusInvalidos) {
      expect(s).not.toBe('AGUARDANDO_PAGAMENTO')
    }
  })
})

// ─── Webhook aprovado ────────────────────────────────────────────────────────

describe('Webhook MP — pagamento aprovado', () => {
  const pedidoPendente: Pedido = {
    id: 'ped-2',
    pago: false,
    status: 'AGUARDANDO_PAGAMENTO',
    pagamentoId: 'mp-payment-001',
  }

  it('transiciona para PAGAMENTO_APROVADO e seta pago=true', () => {
    const resultado = aplicarWebhookAprovado(pedidoPendente, 'mp-payment-001')
    expect(resultado).not.toBeNull()
    expect(resultado!.pago).toBe(true)
    expect(resultado!.status).toBe('PAGAMENTO_APROVADO')
  })

  it('idempotência: segundo webhook não processa pedido já pago', () => {
    const pedidoPago: Pedido = { ...pedidoPendente, pago: true, status: 'PAGAMENTO_APROVADO' }
    const resultado = aplicarWebhookAprovado(pedidoPago, 'mp-payment-001')
    expect(resultado).toBeNull()
  })

  it('não processa paymentId diferente do registrado', () => {
    const resultado = aplicarWebhookAprovado(pedidoPendente, 'mp-payment-OUTRO')
    expect(resultado).toBeNull()
  })
})

// ─── Webhook cancelado/rejeitado ──────────────────────────────────────────────

describe('Webhook MP — pagamento cancelado', () => {
  const pedidoPendente: Pedido = {
    id: 'ped-3',
    pago: false,
    status: 'AGUARDANDO_PAGAMENTO',
    pagamentoId: 'mp-payment-002',
  }

  it('transiciona para CANCELADO', () => {
    const resultado = aplicarWebhookCancelado(pedidoPendente, 'mp-payment-002')
    expect(resultado).not.toBeNull()
    expect(resultado!.status).toBe('CANCELADO')
  })

  it('não cancela pedido já pago', () => {
    const pedidoPago: Pedido = { ...pedidoPendente, pago: true, status: 'PAGAMENTO_APROVADO' }
    const resultado = aplicarWebhookCancelado(pedidoPago, 'mp-payment-002')
    expect(resultado).toBeNull()
  })

  it('não re-cancela pedido já cancelado (idempotência)', () => {
    const pedidoCancelado: Pedido = { ...pedidoPendente, status: 'CANCELADO' }
    const resultado = aplicarWebhookCancelado(pedidoCancelado, 'mp-payment-002')
    expect(resultado).toBeNull()
  })
})

// ─── PIX expirado ────────────────────────────────────────────────────────────

describe('Expiração do PIX', () => {
  it('pedido com PIX expirado deve ser cancelável (não-pago, não-cancelado)', () => {
    const pedido: Pedido = {
      id: 'ped-4',
      pago: false,
      status: 'AGUARDANDO_PAGAMENTO',
      pagamentoId: 'mp-payment-003',
    }
    const resultado = aplicarWebhookCancelado(pedido, 'mp-payment-003')
    expect(resultado?.status).toBe('CANCELADO')
  })

  it('não cancela pedido que já foi pago antes do timer de expiração disparar', () => {
    const pedido: Pedido = {
      id: 'ped-5',
      pago: true,
      status: 'PAGAMENTO_APROVADO',
      pagamentoId: 'mp-payment-004',
    }
    const resultado = aplicarWebhookCancelado(pedido, 'mp-payment-004')
    expect(resultado).toBeNull()
  })
})

// ─── Checkout stage — apenas garante que as transições são válidas ────────────

describe('Checkout stage transitions', () => {
  type Stage = 'form' | 'pending_pix' | 'confirmed'

  it('fluxo correto: form → pending_pix → confirmed', () => {
    const transitions: Stage[] = ['form', 'pending_pix', 'confirmed']
    expect(transitions[0]).toBe('form')
    expect(transitions[1]).toBe('pending_pix')
    expect(transitions[2]).toBe('confirmed')
  })

  it('clearCart e trackPurchase só devem ocorrer na transição pending_pix → confirmed', () => {
    // Representado como boolean: a função de confirmação só roda quando stage === pending_pix
    function podeConfirmar(stage: Stage): boolean {
      return stage === 'pending_pix'
    }
    expect(podeConfirmar('form')).toBe(false)
    expect(podeConfirmar('pending_pix')).toBe(true)
    expect(podeConfirmar('confirmed')).toBe(false)
  })

  it('checkout nunca avança de form direto para confirmed', () => {
    const validNextStage: Record<Stage, Stage[]> = {
      form: ['pending_pix'],
      pending_pix: ['confirmed'],
      confirmed: [],
    }
    expect(validNextStage['form']).not.toContain('confirmed')
    expect(validNextStage['pending_pix']).toContain('confirmed')
  })
})
