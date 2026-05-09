"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const COMMODITIES = ["SOJA", "MILHO", "CAFE_ARABICA", "ALGODAO", "BOI_GORDO", "ACUCAR", "TRIGO", "ARROZ", "FEIJAO"];

interface PrecoItem {
  commodity: string;
  preco: number;
  data: string;
  variacao_dia: number | null;
  praca: string;
  unidade: string;
}

export default function PrecosPage() {
  const [selected, setSelected] = useState("SOJA");
  const [precos, setPrecos] = useState<PrecoItem[]>([]);
  const [periodo, setPeriodo] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrecos();
  }, [selected, periodo]);

  async function loadPrecos() {
    setLoading(true);
    try {
      const data = await api.precosCommodities(selected, periodo);
      setPrecos(data as PrecoItem[]);
    } catch {
      setPrecos([]);
    }
    setLoading(false);
  }

  const ultimo = precos[0];
  const primeiro = precos[precos.length - 1];
  const variacaoPeriodo = ultimo && primeiro ? ((ultimo.preco - primeiro.preco) / primeiro.preco * 100) : null;
  const maxPreco = precos.length ? Math.max(...precos.map(p => p.preco)) : 0;
  const minPreco = precos.length ? Math.min(...precos.map(p => p.preco)) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Precos de Commodities</h1>

      {/* Selector de commodity */}
      <div className="flex flex-wrap gap-2">
        {COMMODITIES.map(c => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selected === c ? "bg-green-600 text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            {c.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Preco Atual</p>
          <p className="text-2xl font-bold mt-1">
            {ultimo ? `R$ ${ultimo.preco.toFixed(2)}` : "-"}
          </p>
          <p className="text-xs text-gray-400">{ultimo?.praca}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Variacao Dia</p>
          <p className={`text-2xl font-bold mt-1 ${
            ultimo?.variacao_dia && ultimo.variacao_dia > 0 ? "text-green-600" : "text-red-500"
          }`}>
            {ultimo?.variacao_dia != null ? `${ultimo.variacao_dia > 0 ? "+" : ""}${ultimo.variacao_dia.toFixed(2)}%` : "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Variacao {periodo}d</p>
          <p className={`text-2xl font-bold mt-1 ${
            variacaoPeriodo && variacaoPeriodo > 0 ? "text-green-600" : "text-red-500"
          }`}>
            {variacaoPeriodo != null ? `${variacaoPeriodo > 0 ? "+" : ""}${variacaoPeriodo.toFixed(2)}%` : "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Max / Min</p>
          <p className="text-lg font-bold mt-1">
            {maxPreco > 0 ? `${maxPreco.toFixed(2)} / ${minPreco.toFixed(2)}` : "-"}
          </p>
        </div>
      </div>

      {/* Periodo */}
      <div className="flex gap-2">
        {[7, 30, 90, 180, 365].map(d => (
          <button
            key={d}
            onClick={() => setPeriodo(d)}
            className={`px-3 py-1 rounded text-sm ${
              periodo === d ? "bg-green-100 text-green-700 font-medium" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Grafico simples (barras com CSS — sem Recharts por enquanto) */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-4">Historico de Precos — {selected.replace("_", " ")}</h2>
        {loading ? (
          <p className="text-gray-400">Carregando...</p>
        ) : precos.length === 0 ? (
          <p className="text-gray-400">Sem dados. Execute o pipeline CEPEA para popular.</p>
        ) : (
          <div className="space-y-1">
            {precos.slice(0, 30).reverse().map((p, i) => {
              const width = maxPreco > 0 ? ((p.preco - minPreco) / (maxPreco - minPreco)) * 100 : 50;
              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-gray-400">{p.data.slice(5)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.variacao_dia && p.variacao_dia >= 0 ? "bg-green-400" : "bg-red-400"}`}
                      style={{ width: `${Math.max(width, 5)}%` }}
                    />
                  </div>
                  <span className="w-20 text-right font-medium">{p.preco.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabela detalhada */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Preco (R$)</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Variacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {precos.slice(0, 20).map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-700">{p.data}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{p.preco.toFixed(2)}</td>
                  <td className={`px-4 py-2.5 text-right ${
                    p.variacao_dia && p.variacao_dia > 0 ? "text-green-600" : "text-red-500"
                  }`}>
                    {p.variacao_dia != null ? `${p.variacao_dia > 0 ? "+" : ""}${p.variacao_dia.toFixed(2)}%` : "-"}
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
