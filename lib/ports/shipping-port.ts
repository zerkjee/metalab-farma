import { cotarFrete, selecionarOpcaoFrete } from '@/lib/frete'
import type { CotarFreteResult, FreteItem, FreteOpcao } from '@/lib/frete'

/**
 * Strangler-Fig FOUNDATION — Shipping port (Melhor Envio).
 *
 * ADDITIVE ONLY. Interface + adapter LOCAL delegando para @/lib/frete. Não é
 * chamado por nenhuma rota ainda. THIN — nenhuma regra nova. As dimensões/peso
 * continuam vindo do banco dentro de `cotarFrete` (nunca do cliente). Zero
 * mudança de comportamento hoje.
 */
export interface ShippingPort {
  /** Cota opções de frete para um CEP e uma lista de itens. */
  quote(args: { cep: string; itens: FreteItem[] }): Promise<CotarFreteResult>
  /** Seleciona uma opção pelo id de serviço ('standard' | 'express'). */
  select(opcoes: FreteOpcao[], servicoId: string): FreteOpcao | null
}

export class LocalShippingAdapter implements ShippingPort {
  quote(args: { cep: string; itens: FreteItem[] }): Promise<CotarFreteResult> {
    return cotarFrete(args)
  }

  select(opcoes: FreteOpcao[], servicoId: string): FreteOpcao | null {
    return selecionarOpcaoFrete(opcoes, servicoId)
  }
}

/** Factory do port. Hoje sempre o adapter local. */
export function getShippingPort(): ShippingPort {
  return new LocalShippingAdapter()
}
