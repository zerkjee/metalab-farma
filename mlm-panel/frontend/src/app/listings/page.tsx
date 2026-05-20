"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, ExternalLink } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";
import { api } from "@/lib/api";
import type { ListingListResponse, ListingStatus } from "@/lib/types";

const statusLabel: Record<ListingStatus, string> = {
  active: "Ativo",
  paused: "Pausado",
  closed: "Encerrado",
  under_review: "Em revisão",
};

const statusVariant: Record<ListingStatus, "green" | "yellow" | "gray" | "red"> = {
  active: "green",
  paused: "yellow",
  closed: "gray",
  under_review: "red",
};

export default function ListingsPage() {
  const [data, setData] = useState<ListingListResponse | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    (api.listings.list({ status: statusFilter || undefined }) as Promise<ListingListResponse>)
      .then(setData)
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const items = data?.items.filter((l) =>
    l.title.toLowerCase().includes(filter.toLowerCase()) ||
    l.ml_listing_id.toLowerCase().includes(filter.toLowerCase())
  ) ?? [];

  return (
    <div className="flex flex-col flex-1">
      <Header title="Anúncios" subtitle={`${data?.total ?? 0} anúncios cadastrados`} />

      <div className="p-6 flex-1 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por título ou MLB..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="closed">Encerrado</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3.5 font-medium text-gray-600">Saúde</th>
                <th className="text-left px-4 py-3.5 font-medium text-gray-600">Anúncio</th>
                <th className="text-right px-4 py-3.5 font-medium text-gray-600">Preço</th>
                <th className="text-right px-4 py-3.5 font-medium text-gray-600">Vendas</th>
                <th className="text-right px-4 py-3.5 font-medium text-gray-600">Visitas</th>
                <th className="text-right px-4 py-3.5 font-medium text-gray-600">Conv.</th>
                <th className="text-left px-4 py-3.5 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Carregando...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-gray-400">Nenhum anúncio encontrado</td></tr>
              ) : items.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <ScoreRing score={l.health_score} size={44} />
                  </td>
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="font-medium text-gray-900 truncate">{l.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{l.ml_listing_id}</p>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium">R$ {l.price.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-right text-gray-600">{l.sold_quantity}</td>
                  <td className="px-4 py-3.5 text-right text-gray-600">{l.visits.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3.5 text-right text-gray-600">{l.conversion_rate.toFixed(1)}%</td>
                  <td className="px-4 py-3.5">
                    <Badge label={statusLabel[l.status]} variant={statusVariant[l.status]} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/listings/${l.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium">
                      Ver <ExternalLink size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
