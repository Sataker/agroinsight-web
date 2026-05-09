"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface TrocaItem {
  data: string;
  sacas_por_ton: number;
  preco_commodity: number | null;
  preco_insumo: number | null;
  favorabilidade: string;
}

export default function InsumosPage() {
  const [commodity, setCommodity] = useState("SOJA");
  const [insumo, setInsumo] = useState("UREIA");
  const [troca, setTroca] = useState<TrocaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTroca(); }, [commodity, insumo]);

  async function loadTroca() {
    setLoading(true);
    try {
      const data = await api.relacaoTroca(commodity, insumo, 365);
      setTroca(data as TrocaItem[]);
    } catch { setTroca([]); }
    setLoading(false);
  }

  const atual = troca[0];
  const media = troca.length > 0
    ? troca.reduce((sum, t) => sum + t.sacas_por_ton, 0) / troca.length
    : null;

  const favorColor: Record<string, string> = {
    BOM: "text-green-600 bg-green-50",
    NEUTRO: "text-yellow-600 bg-yellow-50",
    RUIM: "text-red-600 bg-red-50",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Insumos e Relacao de Troca</h1>

      {/* Seletores */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Commodity</label>
          <select value={commodity} onChange={e => setCommodity(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="SOJA">Soja</option>
            <option value="MILHO">Milho</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Insumo</label>
          <select value={insumo} onChange={e => setInsumo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="UREIA">Ureia</option>
            <option value="MAP">MAP</option>
            <option value="KCL">KCl</option>
          </select>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold mb-2">
          Quantas sacas de {commodity.toLowerCase()} compram 1 ton de {insumo.toLowerCase()}?
        </h2>

        {atual ? (
          <div className="flex flex-wrap items-end gap-6 mt-4">
            <div>
              <p className="text-4xl font-bold">{atual.sacas_por_ton.toFixed(1)}</p>
              <p className="text-sm text-gray-500">sacas/ton hoje</p>
            </div>
            {media && (
              <div>
                <p className="text-2xl font-semibold text-gray-400">{media.toFixed(1)}</p>
                <p className="text-sm text-gray-400">media 12 meses</p>
              </div>
            )}
            <div className={`px-4 py-2 rounded-lg text-lg font-bold ${favorColor[atual.favorabilidade] || ""}`}>
              {atual.favorabilidade === "BOM" && "Bom momento para comprar"}
              {atual.favorabilidade === "NEUTRO" && "Momento neutro"}
              {atual.favorabilidade === "RUIM" && "Momento ruim para comprar"}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mt-4">Sem dados. Execute os pipelines de precos e insumos.</p>
        )}
      </div>

      {/* Historico */}
      {troca.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold mb-3">Historico</h3>
          <div className="space-y-1">
            {troca.slice(0, 30).map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50">
                <span className="text-gray-500">{t.data}</span>
                <span className="font-medium">{t.sacas_por_ton.toFixed(1)} sacas/ton</span>
                <span className={`px-2 py-0.5 rounded text-xs ${favorColor[t.favorabilidade] || ""}`}>
                  {t.favorabilidade}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
