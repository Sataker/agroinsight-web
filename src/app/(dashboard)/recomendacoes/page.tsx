"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Recomendacao {
  id: string;
  tipo: string;
  prioridade: string;
  titulo: string;
  descricao: string;
  acao_sugerida: string | null;
  confianca: number | null;
  lida: boolean;
  created_at: string;
}

const TIPO_COLORS: Record<string, string> = {
  PLANTIO: "bg-green-100 text-green-700",
  COMPRA_INSUMO: "bg-blue-100 text-blue-700",
  VENDA: "bg-purple-100 text-purple-700",
  ALERTA_CLIMA: "bg-amber-100 text-amber-700",
  CULTURA_EMERGENTE: "bg-cyan-100 text-cyan-700",
};

const PRIORIDADE_COLORS: Record<string, string> = {
  URGENTE: "bg-red-500 text-white",
  ALTA: "bg-orange-400 text-white",
  MEDIA: "bg-yellow-400 text-gray-800",
  BAIXA: "bg-gray-200 text-gray-600",
};

export default function RecomendacoesPage() {
  const [recs, setRecs] = useState<Recomendacao[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecs();
  }, [filtroTipo]);

  async function loadRecs() {
    setLoading(true);
    try {
      const data = await api.listarRecomendacoes(filtroTipo || undefined);
      setRecs(data as Recomendacao[]);
    } catch {
      setRecs([]);
    }
    setLoading(false);
  }

  const tipos = ["PLANTIO", "COMPRA_INSUMO", "VENDA", "ALERTA_CLIMA", "CULTURA_EMERGENTE"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recomendacoes da IA</h1>
        <span className="text-sm text-gray-400">{recs.length} recomendacoes</span>
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroTipo(null)}
          className={`px-3 py-1.5 rounded-lg text-sm ${!filtroTipo ? "bg-green-600 text-white" : "bg-white border text-gray-600"}`}
        >
          Todas
        </button>
        {tipos.map(t => (
          <button
            key={t}
            onClick={() => setFiltroTipo(t)}
            className={`px-3 py-1.5 rounded-lg text-sm ${filtroTipo === t ? "bg-green-600 text-white" : "bg-white border text-gray-600"}`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Lista de recomendacoes */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : recs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <p className="text-gray-400 text-lg">Nenhuma recomendacao ainda</p>
          <p className="text-gray-300 text-sm mt-2">As recomendacoes sao geradas semanalmente pela IA com base nos dados coletados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recs.map(r => (
            <div key={r.id} className={`bg-white rounded-xl shadow-sm border p-5 ${!r.lida ? "border-l-4 border-l-green-500" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORIDADE_COLORS[r.prioridade] || ""}`}>
                      {r.prioridade}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${TIPO_COLORS[r.tipo] || "bg-gray-100"}`}>
                      {r.tipo.replace("_", " ")}
                    </span>
                    {r.confianca && (
                      <span className="text-xs text-gray-400">Confianca: {(r.confianca * 100).toFixed(0)}%</span>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-800">{r.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{r.descricao}</p>

                  {r.acao_sugerida && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Acao sugerida:</p>
                      <p className="text-sm text-green-700">{r.acao_sugerida}</p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300 mt-3">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
