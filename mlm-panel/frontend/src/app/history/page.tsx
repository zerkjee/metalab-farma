"use client";
import { useEffect, useState } from "react";
import { History, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { ChangeHistoryListResponse, ChangeType } from "@/lib/types";

const changeTypeLabel: Record<ChangeType, string> = {
  title: "Título",
  price: "Preço",
  description: "Descrição",
  stock: "Estoque",
  images: "Imagens",
  attributes: "Atributos",
  ads_budget: "Orçamento Ads",
};

function fmt(value: unknown): string {
  if (typeof value === "number") return `R$ ${(value as number).toFixed(2)}`;
  if (typeof value === "string") {
    const s = value as string;
    return s.length > 60 ? s.slice(0, 60) + "..." : s;
  }
  return JSON.stringify(value);
}

export default function HistoryPage() {
  const [data, setData] = useState<ChangeHistoryListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (api.approvals.history() as Promise<ChangeHistoryListResponse>)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Histórico de Alterações" subtitle={`${data?.total ?? 0} alterações aplicadas`} />

      <div className="p-6 flex-1 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Carregando...</div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <History size={40} />
            <p>Nenhuma alteração registrada ainda</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-600">Anúncio</th>
                  <th className="text-left px-4 py-3.5 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3.5 font-medium text-gray-600">De</th>
                  <th className="text-left px-4 py-3.5 font-medium text-gray-600">Para</th>
                  <th className="text-left px-4 py-3.5 font-medium text-gray-600">Por</th>
                  <th className="text-left px-4 py-3.5 font-medium text-gray-600">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 max-w-xs truncate">{item.listing_title}</td>
                    <td className="px-4 py-3.5">
                      <Badge label={changeTypeLabel[item.change_type]} variant="blue" />
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">{fmt(item.old_value)}</td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1.5">
                        <ChevronRight size={13} className="text-green-500" />
                        <span className="font-medium text-gray-900 max-w-xs truncate block">{fmt(item.new_value)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500">{item.applied_by}</td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(item.applied_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
