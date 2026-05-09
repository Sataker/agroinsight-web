"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SafraItem {
  cultura: string;
  estado: string;
  safra: string;
  area_plantada_ha: number | null;
  producao_ton: number | null;
  produtividade_kg_ha: number | null;
  fonte: string;
}

interface CustoItem {
  cultura: string;
  estado: string;
  safra: string;
  custo_total_ha: number | null;
  semente_ha: number | null;
  fertilizante_ha: number | null;
  defensivo_ha: number | null;
  operacional_ha: number | null;
}

export default function SafraPage() {
  const [dados, setDados] = useState<SafraItem[]>([]);
  const [cultura, setCultura] = useState("SOJA");
  const [estado, setEstado] = useState("BR");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSafra(); }, [cultura, estado]);

  async function loadSafra() {
    setLoading(true);
    try {
      const data = await api.dadosSafra(cultura, estado);
      setDados(data as SafraItem[]);
    } catch { setDados([]); }
    setLoading(false);
  }

  const estados = [
    "BR", "MT", "PR", "RS", "GO", "MS", "MG", "BA", "SP", "SC", "MA", "PI", "TO", "PA", "RO",
  ];

  const culturas = [
    { value: "SOJA", label: "Soja" },
    { value: "MILHO", label: "Milho" },
    { value: "ALGODAO", label: "Algodao" },
    { value: "CAFE_ARABICA", label: "Cafe" },
    { value: "ARROZ", label: "Arroz" },
    { value: "TRIGO", label: "Trigo" },
    { value: "FEIJAO", label: "Feijao" },
    { value: "CANA_DE_ACUCAR", label: "Cana" },
  ];

  const latest = dados[0];
  const previous = dados[1];
  const variacao = latest && previous && previous.producao_ton
    ? ((latest.producao_ton || 0) - previous.producao_ton) / previous.producao_ton * 100
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dados de Safra</h1>

      {/* Seletores */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Cultura</label>
          <select value={cultura} onChange={e => setCultura(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {culturas.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select value={estado} onChange={e => setEstado(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            {estados.map(uf => (
              <option key={uf} value={uf}>{uf === "BR" ? "Brasil (total)" : uf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards resumo */}
      {latest && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Producao</p>
            <p className="text-2xl font-bold mt-1">
              {latest.producao_ton ? (latest.producao_ton / 1_000_000).toFixed(1) : "-"} M ton
            </p>
            {variacao !== null && (
              <p className={`text-xs mt-1 ${variacao >= 0 ? "text-green-600" : "text-red-600"}`}>
                {variacao >= 0 ? "+" : ""}{variacao.toFixed(1)}% vs safra anterior
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Area Plantada</p>
            <p className="text-2xl font-bold mt-1">
              {latest.area_plantada_ha ? (latest.area_plantada_ha / 1_000_000).toFixed(1) : "-"} M ha
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Produtividade</p>
            <p className="text-2xl font-bold mt-1">
              {latest.produtividade_kg_ha ? latest.produtividade_kg_ha.toFixed(0) : "-"} kg/ha
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Safra</p>
            <p className="text-lg font-bold mt-1">{latest.safra}</p>
            <p className="text-xs text-gray-400">Fonte: {latest.fonte}</p>
          </div>
        </div>
      )}

      {/* Tabela historico */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-4">Historico por Safra</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Carregando...</p>
        ) : dados.length === 0 ? (
          <p className="text-gray-400 text-sm">Sem dados. Execute os pipelines CONAB ou IBGE.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 pr-4">Safra</th>
                  <th className="pb-2 pr-4 text-right">Area (mil ha)</th>
                  <th className="pb-2 pr-4 text-right">Producao (mil ton)</th>
                  <th className="pb-2 pr-4 text-right">Produtividade (kg/ha)</th>
                  <th className="pb-2 text-right">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((d, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium">{d.safra}</td>
                    <td className="py-2 pr-4 text-right">
                      {d.area_plantada_ha ? (d.area_plantada_ha / 1_000).toFixed(0) : "-"}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {d.producao_ton ? (d.producao_ton / 1_000).toFixed(0) : "-"}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {d.produtividade_kg_ha?.toFixed(0) || "-"}
                    </td>
                    <td className="py-2 text-right text-gray-400">{d.fonte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grafico de producao */}
      {dados.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-lg font-semibold mb-4">Evolucao da Producao</h2>
          <div className="flex items-end gap-2 h-40">
            {dados.slice(0, 10).reverse().map((d, i) => {
              const maxProd = Math.max(...dados.slice(0, 10).map(x => x.producao_ton || 0), 1);
              const height = ((d.producao_ton || 0) / maxProd) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${d.safra}: ${d.producao_ton ? (d.producao_ton / 1_000_000).toFixed(1) : 0}M ton`}>
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                  <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">{d.safra.slice(-5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
