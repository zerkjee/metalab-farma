"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, Eye, TrendingUp, ClipboardCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";
import { api } from "@/lib/api";
import type { ListingListResponse, ApprovalQueueListResponse } from "@/lib/types";
import Link from "next/link";

export default function Dashboard() {
  const [listings, setListings] = useState<ListingListResponse | null>(null);
  const [approvals, setApprovals] = useState<ApprovalQueueListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listings.list({ page_size: 5 }) as Promise<ListingListResponse>,
      api.approvals.list({ status: "pending" }) as Promise<ApprovalQueueListResponse>,
    ])
      .then(([l, a]) => {
        setListings(l);
        setApprovals(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = listings?.items.filter((l) => l.status === "active").length ?? 0;
  const totalVisits = listings?.items.reduce((s, l) => s + l.visits, 0) ?? 0;
  const avgConversion = listings?.items.length
    ? (listings.items.reduce((s, l) => s + l.conversion_rate, 0) / listings.items.length).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" subtitle="Visão geral da loja MTL Nutrition no Mercado Livre" />

      <div className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Carregando...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Anúncios Ativos" value={activeCount} icon={ShoppingBag} color="blue" />
              <StatsCard title="Visitas (anúncios)" value={totalVisits.toLocaleString("pt-BR")} icon={Eye} color="green" />
              <StatsCard title="Conversão Média" value={`${avgConversion}%`} icon={TrendingUp} color="yellow" />
              <StatsCard
                title="Aprovações Pendentes"
                value={approvals?.pending_count ?? 0}
                icon={ClipboardCheck}
                color={approvals?.pending_count ? "red" : "green"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Anúncios Recentes</h2>
                  <Link href="/listings" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {listings?.items.map((l) => (
                    <Link key={l.id} href={`/listings/${l.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                      <ScoreRing score={l.health_score} size={44} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{l.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          R$ {l.price.toFixed(2)} · {l.sold_quantity} vendas · {l.visits} visitas
                        </p>
                      </div>
                      <Badge
                        label={l.status === "active" ? "Ativo" : l.status === "paused" ? "Pausado" : l.status}
                        variant={l.status === "active" ? "green" : l.status === "paused" ? "yellow" : "gray"}
                      />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">Fila de Aprovação</h2>
                  <Link href="/approvals" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
                </div>
                {approvals?.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                    <CheckCircle2 size={32} />
                    <p className="text-sm">Nenhuma aprovação pendente</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {approvals?.items.slice(0, 5).map((a) => (
                      <div key={a.id} className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{a.listing_title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.reason}</p>
                          </div>
                          <Badge
                            label={a.change_type === "title" ? "Título" : a.change_type === "price" ? "Preço" : a.change_type}
                            variant="orange"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
