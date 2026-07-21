"use client";
import { BarChart2, TrendingUp, DollarSign, MousePointerClick } from "lucide-react";
import Header from "@/components/layout/Header";
import StatsCard from "@/components/dashboard/StatsCard";

export default function AdsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Ads" subtitle="Campanhas e recomendações de publicidade" />

      <div className="p-6 flex-1 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Campanhas Ativas" value="2" icon={BarChart2} color="blue" />
          <StatsCard title="Gasto Total" value="R$ 1.860" subtitle="últimos 30 dias" icon={DollarSign} color="red" />
          <StatsCard title="Cliques" value="2.858" icon={MousePointerClick} color="yellow" />
          <StatsCard title="ROAS Médio" value="6.7x" icon={TrendingUp} color="green" trend={{ value: "+1.2x vs mês anterior", up: true }} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center gap-3">
          <BarChart2 size={48} className="text-blue-200" />
          <h3 className="font-semibold text-gray-700">Módulo de Ads em desenvolvimento</h3>
          <p className="text-sm text-gray-400 max-w-md">
            O painel de campanhas Mercado Livre Ads será integrado aqui. Inclui gestão de budget, análise de ROAS por anúncio e recomendações automáticas com aprovação manual.
          </p>
        </div>
      </div>
    </div>
  );
}
