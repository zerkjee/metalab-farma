// Acompanhamento de pedidos de CONVIDADO no próprio navegador.
// Guarda só referências (id/numero) — os dados completos vêm do endpoint /status.
const KEY = "metalab:meus-pedidos"
const MAX = 15

export interface PedidoLocalRef {
  id: string
  numero: string
  criadoEm: string
}

export function lerPedidosLocais(): PedidoLocalRef[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as PedidoLocalRef[]) : []
  } catch {
    return []
  }
}

export function salvarPedidoLocal(ref: { id: string; numero: string }): void {
  if (typeof window === "undefined" || !ref?.id) return
  try {
    const atuais = lerPedidosLocais().filter((p) => p.id !== ref.id)
    const novo: PedidoLocalRef = { id: ref.id, numero: ref.numero, criadoEm: new Date().toISOString() }
    const lista = [novo, ...atuais].slice(0, MAX)
    window.localStorage.setItem(KEY, JSON.stringify(lista))
  } catch {
    // localStorage indisponível (modo privado etc.) — acompanhamento local apenas não persiste.
  }
}
