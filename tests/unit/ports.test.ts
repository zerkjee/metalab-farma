import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock içado antes do import: os adapters delegam para @/lib/qstash (que por sua
// vez cai em @/lib/resend). Interceptamos a fronteira de fila.
vi.mock('@/lib/qstash', () => ({
  enqueueOrderEmail: vi.fn().mockResolvedValue(undefined),
  enqueueJob: vi.fn().mockResolvedValue(undefined),
}))

import {
  getNotificationPort,
  LocalNotificationAdapter,
} from '@/lib/ports'
import { enqueueOrderEmail, enqueueJob } from '@/lib/qstash'
import type {
  OrderPaidV1Payload,
  PixExpiredV1Payload,
  CartAbandonedV1Payload,
} from '@/lib/contracts'

const mEnqueueOrderEmail = enqueueOrderEmail as unknown as ReturnType<typeof vi.fn>
const mEnqueueJob = enqueueJob as unknown as ReturnType<typeof vi.fn>

const orderPayload: OrderPaidV1Payload = {
  pedidoId: 'ped_1',
  numero: '1001',
  compradorNome: 'Ana Silva',
  compradorEmail: 'ana@example.com',
  total: 199.9,
  metodoPagamento: 'PIX',
  itens: [{ nome: 'Creatina', quantidade: 2, precoUnit: 99.95 }],
  pixQrCode: 'PIX-CODE',
}

const pixPayload: PixExpiredV1Payload = {
  pedidoId: 'ped_1',
  numero: '1001',
  compradorEmail: 'ana@example.com',
}

const cartPayload: CartAbandonedV1Payload = {
  cartSessionId: 'cart_1',
  email: 'ana@example.com',
  stage: '24h',
}

describe('getNotificationPort', () => {
  const OLD = { ...process.env }

  beforeEach(() => {
    mEnqueueOrderEmail.mockClear()
    mEnqueueJob.mockClear()
  })

  afterEach(() => {
    process.env = { ...OLD }
  })

  it('retorna o adapter local com os flags default', () => {
    delete process.env.NOTIFICATIONS_SERVICE_ENABLED
    delete process.env.NOTIFICATIONS_FALLBACK_LOCAL
    expect(getNotificationPort()).toBeInstanceOf(LocalNotificationAdapter)
  })

  it('retorna local quando serviço habilitado mas fallback ligado (default)', () => {
    process.env.NOTIFICATIONS_SERVICE_ENABLED = 'true'
    delete process.env.NOTIFICATIONS_FALLBACK_LOCAL
    expect(getNotificationPort()).toBeInstanceOf(LocalNotificationAdapter)
  })

  it('lança quando serviço habilitado E fallback desligado (remoto não implementado)', () => {
    process.env.NOTIFICATIONS_SERVICE_ENABLED = 'true'
    process.env.NOTIFICATIONS_FALLBACK_LOCAL = 'false'
    expect(() => getNotificationPort()).toThrow(/not implemented/i)
  })
})

describe('LocalNotificationAdapter', () => {
  beforeEach(() => {
    mEnqueueOrderEmail.mockClear()
    mEnqueueJob.mockClear()
  })

  it('orderConfirmation delega para enqueueOrderEmail com o DTO mapeado', async () => {
    await new LocalNotificationAdapter().orderConfirmation(orderPayload)
    expect(mEnqueueOrderEmail).toHaveBeenCalledTimes(1)
    expect(mEnqueueOrderEmail).toHaveBeenCalledWith({
      numero: '1001',
      compradorNome: 'Ana Silva',
      compradorEmail: 'ana@example.com',
      total: 199.9,
      metodoPagamento: 'PIX',
      itens: [{ nome: 'Creatina', quantidade: 2, precoUnit: 99.95 }],
      pixQrCode: 'PIX-CODE',
    })
    expect(mEnqueueJob).not.toHaveBeenCalled()
  })

  it('pixExpiry enfileira o job de pix-expiry com o pedidoId', async () => {
    await new LocalNotificationAdapter().pixExpiry(pixPayload)
    expect(mEnqueueJob).toHaveBeenCalledTimes(1)
    expect(mEnqueueJob).toHaveBeenCalledWith('/api/jobs/pix-expiry', {
      pedidoId: 'ped_1',
      stage: 'email',
    })
  })

  it('abandonedCart enfileira o job de abandoned-cart com sessão e stage', async () => {
    await new LocalNotificationAdapter().abandonedCart(cartPayload)
    expect(mEnqueueJob).toHaveBeenCalledTimes(1)
    expect(mEnqueueJob).toHaveBeenCalledWith('/api/jobs/abandoned-cart', {
      cartSessionId: 'cart_1',
      stage: '24h',
    })
  })
})
