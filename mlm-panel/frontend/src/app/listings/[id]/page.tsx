"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, TrendingDown, TrendingUp, Zap, ExternalLink, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import Badge from "@/components/ui/Badge";
import ScoreRing from "@/components/ui/ScoreRing";
import { api } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    (api.listings.get(Number(id)) as Promise<ListingDetail>)
      .then(setListing)
      .finally(() => setLoading(false));
  }, [id]);

  async function runAnalysis() {
    setAnalyzing(true);
    await api.listings.analyze(Number(id));
    const updated = await api.listings.get(Number(id)) as ListingDetail;
    setListing(updated);
    setAnalyzing(false);
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-400">Carregando...</div>;
  if (!listing) return <div className="flex-1 flex items-center justify-center text-red-500">Anúncio não encontrado</div>;

  const seo = listing.latest_seo;

  return (
    <div className="flex flex-col flex-1">
      <Header
        title={listing.title}
        subtitle={`${listing.ml_listing_id} · R$ ${listing.price.toFixed(2)}`}
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
              <ArrowLeft size={15} /> Voltar
            </button>
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              <RefreshCw size={15} className={analyzing ? "animate-spin" : ""} />
              {analyzing ? "Analisando..." : "Analisar SEO"}
            </button>
          </div>
        }
      />

      <div className="p-6 flex-1 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Health Score", value: <ScoreRing score={listing.health_score} size={52} /> },
            { label: "Vendas", value: listing.sold_quantity },
            { label: "Visitas", value: listing.visits.toLocaleString("pt-BR") },
            { label: "Conversão", value: `${listing.conversion_rate.toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
              <div className="flex items-center justify-center">
                {typeof value === "string" || typeof value === "number" ? (
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                ) : value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {seo && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Search size={16} /> Análise SEO
                </h3>
                <ScoreRing score={seo.score} size={44} />
              </div>
              {seo.issues.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-red-600 mb-1.5">Problemas</p>
                  <ul className="space-y-1">
                    {seo.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-400 mt-0.5">✕</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {seo.opportunities.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-600 mb-1.5">Oportunidades</p>
                  <ul className="space-y-1">
                    {seo.opportunities.map((opp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">→</span> {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {listing.competitors.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingDown size={16} /> Concorrentes
              </h3>
              <div className="space-y-3">
                {listing.competitors.map((c) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.title}</p>
                      <p className="text-xs text-gray-400">{c.seller_name} · {c.sales_count} vendas</p>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <p className="font-semibold text-sm">R$ {c.price.toFixed(2)}</p>
                      {c.price < listing.price ? (
                        <span className="text-xs text-red-500 flex items-center gap-0.5 justify-end">
                          <TrendingDown size={10} /> mais barato
                        </span>
                      ) : (
                        <span className="text-xs text-green-500 flex items-center gap-0.5 justify-end">
                          <TrendingUp size={10} /> mais caro
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {listing.ads_campaigns.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={16} /> Campanhas de Ads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.ads_campaigns.map((c) => (
                <div key={c.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-gray-900">{c.campaign_name}</p>
                    <Badge
                      label={c.status === "active" ? "Ativo" : c.status === "paused" ? "Pausado" : c.status === "draft" ? "Rascunho" : c.status}
                      variant={c.status === "active" ? "green" : c.status === "paused" ? "yellow" : "gray"}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div><p className="text-gray-400">Orçamento/dia</p><p className="font-semibold">R$ {c.daily_budget}</p></div>
                    <div><p className="text-gray-400">CTR</p><p className="font-semibold">{c.ctr.toFixed(1)}%</p></div>
                    <div><p className="text-gray-400">ROAS</p><p className="font-semibold">{c.roas.toFixed(1)}x</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {listing.permalink && (
          <a
            href={listing.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            Ver no Mercado Livre <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
