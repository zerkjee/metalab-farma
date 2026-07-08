import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

// Mocks içados antes do import do handler.
vi.mock('@/lib/prisma', () => ({
  prisma: {
    pedido: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('@/lib/tiny', () => ({
  tinyConfigurado: vi.fn(),
  criarOuLocalizarPedidoTiny: vi.fn(),
  TINY_DISABLED: 'TINY_DISABLED',
}))
vi.mock('@/lib/audit', () => ({ logAudit: vi.fn() }))
vi.mock('@/lib/qstashAuth', () => ({ verifyQStashRequest: vi.fn().mockResolvedValue({ valid: true }) }))

import { POST } from '@/app/api/jobs/tiny-sync-pedido/route'
import { prisma } from '@/lib/prisma'
import { tinyConfigurado, criarOuLocalizarPedidoTiny } from '@/lib/tiny'
import { logAudit } from '@/lib/audit'

const mUpdateMany = prisma.pedido.updateMany as unknown as ReturnType<typeof vi.fn>
const mFindUnique = prisma.pedido.findUnique as unknown as ReturnType<typeof vi.fn>
const mUpdate = prisma.pedido.update as unknown as ReturnType<typeof vi.fn>
const mTinyConfig = tinyConfigurado as unknown as ReturnType<typeof vi.fn>
const mCriarTiny = criarOuLocalizarPedidoTiny as unknown as ReturnType<typeof vi.fn>
const mAudit = logAudit as unknown as ReturnType<typeof vi.fn>

function makeReq(body: unknown): NextRequest {
  return new Request('http://localhost/api/jobs/tiny-sync-pedido', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest
}

const PEDIDO_FAKE = {
  id: 'ped_1',
  numero: 'MTL-2026-XYZ',
  compradorNome: 'Maria Teste',
  compradorCpf: '86993478008',
  compradorEmail: 'maria@example.com',
  compradorTelefone: '11999998888',
  enderecoSnap: '{"cep":"01310100"}',
  subtotal: 100,
  desconto: 10,
  frete: 15,
  total: 105,
  itens: [{ produtoSku: 'MTL-ART', produtoNome: 'Articulice', quantidade: 1, precoUnit: 100 }],
}

describe('POST /api/jobs/tiny-sync-pedido', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // receiver é null nos testes (sem QSTASH_CURRENT_SIGNING_KEY) → pula verificação de assinatura.
    delete process.env.QSTASH_CURRENT_SIGNING_KEY
  })

  it('sucesso: cria no Tiny, marca ENVIADO e registra audit', async () => {
    mTinyConfig.mockReturnValue(true)
    mUpdateMany.mockResolvedValue({ count: 1 })
    mFindUnique.mockResolvedValue(PEDIDO_FAKE)
    mCriarTiny.mockResolvedValue({ ok: true, tinyPedidoId: '999', jaExistia: false, raw: '{"retorno":{}}' })

    const res = await POST(makeReq({ pedidoId: 'ped_1' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.tinyPedidoId).toBe('999')
    expect(mUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tinySyncStatus: 'ENVIADO', tinyPedidoId: '999' }),
      }),
    )
    expect(mAudit).toHaveBeenCalledWith(expect.objectContaining({ acao: 'tiny.pedido.sincronizado' }))
  })

  it('erro Tiny: marca ERRO, registra audit e responde 500 (para QStash retentar)', async () => {
    mTinyConfig.mockReturnValue(true)
    mUpdateMany.mockResolvedValue({ count: 1 })
    mFindUnique.mockResolvedValue(PEDIDO_FAKE)
    mCriarTiny.mockResolvedValue({ ok: false, erro: 'CPF inválido', codigoErro: '31', raw: '{"retorno":{"status":"Erro"}}' })

    const res = await POST(makeReq({ pedidoId: 'ped_1' }))

    expect(res.status).toBe(500)
    expect(mUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tinySyncStatus: 'ERRO', tinyErro: 'CPF inválido' }),
      }),
    )
    expect(mAudit).toHaveBeenCalledWith(expect.objectContaining({ acao: 'tiny.pedido.erro' }))
  })

  it('pedido já sincronizado: lock count 0 → skip sem chamar o Tiny', async () => {
    mTinyConfig.mockReturnValue(true)
    mUpdateMany.mockResolvedValue({ count: 0 })

    const res = await POST(makeReq({ pedidoId: 'ped_1' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.skipped).toBe('not_eligible')
    expect(mFindUnique).not.toHaveBeenCalled()
    expect(mCriarTiny).not.toHaveBeenCalled()
  })

  it('tiny desabilitado: não toca no banco nem no Tiny, responde 200', async () => {
    mTinyConfig.mockReturnValue(false)

    const res = await POST(makeReq({ pedidoId: 'ped_1' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.skipped).toBe('tiny_disabled')
    expect(mUpdateMany).not.toHaveBeenCalled()
    expect(mCriarTiny).not.toHaveBeenCalled()
  })

  it('retry: o lock atômico é elegível para PENDENTE e ERRO (permite reprocessar após falha)', async () => {
    mTinyConfig.mockReturnValue(true)
    mUpdateMany.mockResolvedValue({ count: 1 })
    mFindUnique.mockResolvedValue(PEDIDO_FAKE)
    mCriarTiny.mockResolvedValue({ ok: true, tinyPedidoId: '999', jaExistia: true, raw: '' })

    await POST(makeReq({ pedidoId: 'ped_1' }))

    const whereArg = mUpdateMany.mock.calls[0][0].where
    expect(whereArg.tinySyncStatus.in).toEqual(expect.arrayContaining(['PENDENTE', 'ERRO']))
    expect(whereArg.tinySyncStatus.in).not.toContain('ENVIADO')
    expect(whereArg.tinySyncStatus.in).not.toContain('PROCESSANDO')
  })

  it('payload inválido (sem pedidoId): responde 400 sem tocar no banco', async () => {
    const res = await POST(makeReq({ foo: 'bar' }))

    expect(res.status).toBe(400)
    expect(mUpdateMany).not.toHaveBeenCalled()
  })
})
