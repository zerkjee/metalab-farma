"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import { api } from "@/lib/api";
import type { ApprovalQueueListResponse, ApprovalQueueItem, ChangeType } from "@/lib/types";

const changeTypeLabel: Record<ChangeType, string> = {
  title: "Título",
  price: "Preço",
  description: "Descrição",
  stock: "Estoque",
  images: "Imagens",
  attributes: "Atributos",
  ads_budget: "Orçamento Ads",
};

function ValuePreview({ value }: { value: unknown }) {
  if (typeof value === "number") return <span className="font-mono">R$ {(value as number).toFixed(2)}</span>;
  if (typeof value === "string") return <span className="text-gray-700">{value as string}</span>;
  return <span className="text-gray-500 text-xs italic">—</span>;
}

export default function ApprovalsPage() {
  const [data, setData] = useState<ApprovalQueueListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    (api.approvals.list({ status: "pending" }) as Promise<ApprovalQueueListResponse>)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(item: ApprovalQueueItem) {
    setProcessingId(item.id);
    await api.approvals.approve(item.id, "admin");
    load();
    setProcessingId(null);
  }

  async function handleReject(item: ApprovalQueueItem) {
    const reason = window.prompt("Motivo da rejeição:");
    if (!reason) return;
    setProcessingId(item.id);
    await api.approvals.reject(item.id, "admin", reason);
    load();
    setProcessingId(null);
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Fila de Aprovação"
        subtitle={`${data?.pending_count ?? 0} alterações aguardando revisão`}
      />

      <div className="p-6 flex-1 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">Carregando...</div>
        ) : data?.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-gray-400">
            <CheckCircle size={40} className="text-green-400" />
            <p className="font-medium">Nenhuma aprovação pendente!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <AlertTriangle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">{item.listing_title}</p>
                        <Badge label={changeTypeLabel[item.change_type]} variant="orange" />
                        {item.priority >= 3 && <Badge label="Alta prioridade" variant="red" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.listing_ml_id} · Criado por {item.created_by}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={processingId === item.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle size={15} /> Aprovar
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      disabled={processingId === item.id}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                    >
                      <XCircle size={15} /> Rejeitar
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Valor Atual</p>
                    <ValuePreview value={item.current_value} />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-600 mb-1">Valor Proposto</p>
                    <ValuePreview value={item.proposed_value} />
                  </div>
                </div>

                {item.reason && (
                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 rounded-lg p-3">
                    <Clock size={14} className="mt-0.5 text-yellow-500 shrink-0" />
                    <span>{item.reason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
