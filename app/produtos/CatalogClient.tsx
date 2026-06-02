"use client"

import { useState, useMemo, useCallback } from "react"
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp, Package } from "lucide-react"
import ProductCard from "@/components/ProductCard"
import { Product } from "@/types/product"

interface Categoria {
  id: string
  nome: string
  slug: string
  ordem: number
}

interface Props {
  produtos: Product[]
  categorias: Categoria[]
}

type Ordem = "destaque" | "preco_asc" | "preco_desc" | "lancamentos"
type FaixaPreco = "" | "0-50" | "50-100" | "100-200" | "200+"

const FAIXAS: { label: string; value: FaixaPreco }[] = [
  { label: "Qualquer preço", value: "" },
  { label: "Até R$50", value: "0-50" },
  { label: "R$50 – R$100", value: "50-100" },
  { label: "R$100 – R$200", value: "100-200" },
  { label: "Acima de R$200", value: "200+" },
]

const ORDENS: { label: string; value: Ordem }[] = [
  { label: "Mais relevantes", value: "destaque" },
  { label: "Menor preço", value: "preco_asc" },
  { label: "Maior preço", value: "preco_desc" },
  { label: "Lançamentos", value: "lancamentos" },
]

const POR_PAGINA = 12

function matchesFaixa(preco: number, faixa: FaixaPreco): boolean {
  if (!faixa) return true
  if (faixa === "0-50") return preco <= 50
  if (faixa === "50-100") return preco > 50 && preco <= 100
  if (faixa === "100-200") return preco > 100 && preco <= 200
  return preco > 200
}

export function CatalogClient({ produtos, categorias }: Props) {
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState("")
  const [tipo, setTipo] = useState<"" | "SIMPLES" | "KIT">("")
  const [faixaPreco, setFaixaPreco] = useState<FaixaPreco>("")
  const [ordem, setOrdem] = useState<Ordem>("destaque")
  const [pagina, setPagina] = useState(1)
  const [filtrosMobileAbertos, setFiltrosMobileAbertos] = useState(false)

  const categoriasComProdutos = useMemo(() => {
    const slugsAtivos = new Set(
      produtos.map((p) => p.categoria?.slug).filter(Boolean)
    )
    return categorias.filter((c) => slugsAtivos.has(c.slug))
  }, [produtos, categorias])

  const todasTags = useMemo(() => {
    const tags = new Set(produtos.flatMap((p) => p.tags ?? []))
    return [...tags].sort()
  }, [produtos])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    let result = produtos.filter((p) => {
      if (
        q &&
        !p.nome.toLowerCase().includes(q) &&
        !p.marca.toLowerCase().includes(q) &&
        !(p.descricaoCurta ?? "").toLowerCase().includes(q) &&
        !p.tags?.some((t) => t.toLowerCase().includes(q))
      )
        return false
      if (categoria && p.categoria?.slug !== categoria) return false
      if (tipo && p.tipo !== tipo) return false
      if (!matchesFaixa(Number(p.preco), faixaPreco)) return false
      return true
    })

    result = [...result].sort((a, b) => {
      if (ordem === "preco_asc") return Number(a.preco) - Number(b.preco)
      if (ordem === "preco_desc") return Number(b.preco) - Number(a.preco)
      if (ordem === "lancamentos")
        return (
          new Date(b.criadoEm ?? 0).getTime() -
          new Date(a.criadoEm ?? 0).getTime()
        )
      // destaque: destaques primeiro, depois ordem original
      if (a.destaque && !b.destaque) return -1
      if (!a.destaque && b.destaque) return 1
      return 0
    })

    return result
  }, [produtos, busca, categoria, tipo, faixaPreco, ordem])

  const total = filtrados.length
  const visiveis = filtrados.slice(0, pagina * POR_PAGINA)
  const temMais = visiveis.length < total

  const filtrosAtivos =
    !!busca || !!categoria || !!tipo || !!faixaPreco || ordem !== "destaque"
  const numFiltrosAtivos = [busca, categoria, tipo, faixaPreco].filter(Boolean)
    .length

  const resetPagina = useCallback(() => setPagina(1), [])

  const handleBusca = (v: string) => {
    setBusca(v)
    resetPagina()
  }
  const handleCategoria = (v: string) => {
    setCategoria(v)
    resetPagina()
  }
  const handleTipo = (v: string) => {
    setTipo(v as "" | "SIMPLES" | "KIT")
    resetPagina()
  }
  const handleFaixa = (v: FaixaPreco) => {
    setFaixaPreco(v)
    resetPagina()
  }
  const handleOrdem = (v: Ordem) => {
    setOrdem(v)
    resetPagina()
  }
  const limparFiltros = () => {
    setBusca("")
    setCategoria("")
    setTipo("")
    setFaixaPreco("")
    setOrdem("destaque")
    setPagina(1)
  }

  const FilterPanel = (
    <div className="space-y-6">
      {/* Busca */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Buscar
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
            placeholder="Nome, ingrediente..."
            autoComplete="off"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2756]/20 focus:border-[#0f2756] bg-white transition-colors"
            data-testid="catalog-search"
          />
          {busca && (
            <button
              onClick={() => handleBusca("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categoria */}
      {categoriasComProdutos.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Categoria
          </p>
          <div className="flex flex-col gap-0.5">
            <FilterBtn
              active={categoria === ""}
              onClick={() => handleCategoria("")}
            >
              Todas as categorias
            </FilterBtn>
            {categoriasComProdutos.map((c) => (
              <FilterBtn
                key={c.id}
                active={categoria === c.slug}
                onClick={() => handleCategoria(c.slug)}
                testId={`filter-category-${c.slug}`}
              >
                {c.nome}
              </FilterBtn>
            ))}
          </div>
        </div>
      )}

      {/* Tipo */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Tipo
        </p>
        <div className="flex flex-col gap-0.5">
          <FilterBtn active={tipo === ""} onClick={() => handleTipo("")}>
            Todos
          </FilterBtn>
          <FilterBtn
            active={tipo === "SIMPLES"}
            onClick={() => handleTipo("SIMPLES")}
            testId="filter-tipo-simples"
          >
            Produto individual
          </FilterBtn>
          <FilterBtn
            active={tipo === "KIT"}
            onClick={() => handleTipo("KIT")}
            testId="filter-tipo-kit"
          >
            Kit / Combo
          </FilterBtn>
        </div>
      </div>

      {/* Faixa de preço */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          Faixa de preço
        </p>
        <div className="flex flex-col gap-0.5">
          {FAIXAS.map((f) => (
            <FilterBtn
              key={f.value}
              active={faixaPreco === f.value}
              onClick={() => handleFaixa(f.value)}
              testId={`filter-preco-${f.value || "todos"}`}
            >
              {f.label}
            </FilterBtn>
          ))}
        </div>
      </div>

      {/* Tags */}
      {todasTags.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {todasTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleBusca(busca === tag ? "" : tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  busca === tag
                    ? "bg-[#0f2756] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtrosAtivos && (
        <button
          onClick={limparFiltros}
          className="w-full py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition-colors flex items-center justify-center gap-2"
          data-testid="clear-filters"
        >
          <X className="w-4 h-4" />
          Limpar filtros
        </button>
      )}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barra mobile: filtros + ordenação */}
      <div className="flex items-center gap-3 mb-4 lg:hidden">
        <button
          onClick={() => setFiltrosMobileAbertos(!filtrosMobileAbertos)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          data-testid="toggle-filters-mobile"
          aria-expanded={filtrosMobileAbertos}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {numFiltrosAtivos > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#0f2756] text-white text-[10px] font-black flex items-center justify-center">
              {numFiltrosAtivos}
            </span>
          )}
          {filtrosMobileAbertos ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>

        <select
          value={ordem}
          onChange={(e) => handleOrdem(e.target.value as Ordem)}
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2756]/20"
          aria-label="Ordenar produtos"
          data-testid="sort-select"
        >
          {ORDENS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Painel de filtros mobile colapsável */}
      {filtrosMobileAbertos && (
        <div className="lg:hidden mb-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
          {FilterPanel}
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <div className="sticky top-6 p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                Filtros
              </span>
              {filtrosAtivos && (
                <button
                  onClick={limparFiltros}
                  className="text-[11px] text-red-500 hover:underline font-semibold flex items-center gap-1"
                  data-testid="clear-filters-desktop"
                >
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
            {FilterPanel}
          </div>
        </aside>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {/* Cabeçalho dos resultados — desktop */}
          <div className="hidden lg:flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-900">{total}</span>{" "}
              {total === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
            <select
              value={ordem}
              onChange={(e) => handleOrdem(e.target.value as Ordem)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0f2756]/20"
              aria-label="Ordenar produtos"
              data-testid="sort-select"
            >
              {ORDENS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Contagem mobile */}
          <p className="text-sm text-gray-500 mb-4 lg:hidden">
            <span className="font-bold text-gray-900">{total}</span>{" "}
            {total === 1 ? "produto" : "produtos"}
          </p>

          {/* Grid de produtos */}
          {visiveis.length > 0 ? (
            <>
              <div
                className="grid gap-4 sm:gap-5"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                }}
                data-testid="catalog-grid"
              >
                {visiveis.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {temMais && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setPagina((n) => n + 1)}
                    className="px-8 py-3 rounded-xl border-2 border-[#0f2756] text-[#0f2756] font-bold text-sm hover:bg-[#0f2756] hover:text-white transition-all duration-200"
                    data-testid="load-more"
                  >
                    Carregar mais ({total - visiveis.length} restantes)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="empty-state">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500 text-sm max-w-xs mb-5">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
              {filtrosAtivos && (
                <button
                  onClick={limparFiltros}
                  className="px-5 py-2.5 rounded-xl bg-[#0f2756] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface FilterBtnProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  testId?: string
}

function FilterBtn({ active, onClick, children, testId }: FilterBtnProps) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`text-left text-sm px-3 py-2 rounded-lg transition-colors w-full ${
        active
          ? "bg-[#0f2756] text-white font-semibold"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  )
}
