"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface StatCard {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { label: "Soja (saca 60kg)", value: "Carregando...", change: undefined },
    { label: "Milho (saca 60kg)", value: "Carregando...", change: undefined },
    { label: "Relacao Soja/Ureia", value: "Carregando...", change: undefined },
    { label: "Recomendacoes", value: "Carregando...", change: undefined },
  ]);
  const [eventos, setEventos] = useState<Record<string, unknown>[]>([]);
  const [recomendacoes, setRecomendacoes] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [soja, milho, troca, recs, evts] = await Promise.all([
        api.precosCommodities("SOJA", 7).catch(() => []),
        api.precosCommodities("MILHO", 7).catch(() => []),
        api.relacaoTroca("SOJA", "UREIA", 30).catch(() => []),
        api.listarRecomendacoes().catch(() => []),
        api.eventosMercado().catch(() => []),
      ]);

      const sojaHoje = soja[0];
      const milhoHoje = milho[0];
      const trocaHoje = troca[0];

      setStats([
        {
          label: "Soja (saca 60kg)",
          value: sojaHoje ? `R$ ${Number(sojaHoje.preco).toFixed(2)}` : "Sem dados",
          change: sojaHoje?.variacao_dia ? `${Number(sojaHoje.variacao_dia) > 0 ? "+" : ""}${Number(sojaHoje.variacao_dia).toFixed(2)}%` : undefined,
          positive: sojaHoje?.variacao_dia ? Number(sojaHoje.variacao_dia) > 0 : undefined,
        },
        {
          label: "Milho (saca 60kg)",
          value: milhoHoje ? `R$ ${Number(milhoHoje.preco).toFixed(2)}` : "Sem dados",
          change: milhoHoje?.variacao_dia ? `${Number(milhoHoje.variacao_dia) > 0 ? "+" : ""}${Number(milhoHoje.variacao_dia).toFixed(2)}%` : undefined,
          positive: milhoHoje?.variacao_dia ? Number(milhoHoje.variacao_dia) > 0 : undefined,
        },
        {
          label: "Relacao Soja/Ureia",
          value: trocaHoje ? `${Number(trocaHoje.sacas_por_ton).toFixed(1)} sacas/ton` : "Sem dados",
          change: trocaHoje?.favorabilidade as string,
          positive: trocaHoje?.favorabilidade === "BOM",
        },
        {
          label: "Recomendacoes IA",
          value: `${recs.filter((r: Record<string, unknown>) => !r.lida).length} novas`,
        },
      ]);

      setRecomendacoes(recs.slice(0, 5));
      setEventos(evts.slice(0, 5));
    } catch {
      // API not available yet
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
            <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            <p className="text-lg sm:text-2xl font-bold mt-1">{stat.value}</p>
            {stat.change && (
              <p className={`text-xs sm:text-sm mt-1 ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                {stat.change}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recomendacoes da IA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold mb-4">Recomendacoes da IA</h2>
          {recomendacoes.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma recomendacao ainda. Os dados serao processados em breve.</p>
          ) : (
            <div className="space-y-3">
              {recomendacoes.map((r) => (
                <div key={r.id as string} className="border-l-4 border-green-500 pl-3 py-2">
                  <p className="font-medium text-sm">{r.titulo as string}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.tipo as string} | {r.prioridade as string}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eventos de Mercado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-semibold mb-4">Eventos de Mercado</h2>
          {eventos.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum evento recente. O monitoramento de noticias sera ativado em breve.</p>
          ) : (
            <div className="space-y-3">
              {eventos.map((e) => (
                <div key={e.id as number} className="border-l-4 border-amber-500 pl-3 py-2">
                  <p className="font-medium text-sm">{e.titulo as string}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {e.direcao_impacto as string} | Impacto: {e.magnitude_impacto as number}/10
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
