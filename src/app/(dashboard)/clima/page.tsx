"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ClimaItem {
  data: string;
  temp_max: number | null;
  temp_min: number | null;
  temp_media: number | null;
  precipitacao: number | null;
  umidade_media: number | null;
}

interface PrevisaoItem {
  data: string;
  temp_max: number | null;
  temp_min: number | null;
  precipitacao: number | null;
  prob_chuva: number | null;
}

export default function ClimaPage() {
  const [historico, setHistorico] = useState<ClimaItem[]>([]);
  const [previsao, setPrevisao] = useState<PrevisaoItem[]>([]);
  const [lat, setLat] = useState(-23.55);
  const [lon, setLon] = useState(-46.63);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadClima(); }, []);

  async function loadClima() {
    setLoading(true);
    try {
      // Tentar pegar coordenadas da primeira fazenda
      const fazendas = await api.listarFazendas().catch(() => []);
      if (fazendas.length > 0 && fazendas[0].latitude && fazendas[0].longitude) {
        setLat(fazendas[0].latitude as number);
        setLon(fazendas[0].longitude as number);
      }

      const [hist, prev] = await Promise.all([
        api.climaHistorico(lat, lon, 30).catch(() => []),
        api.climaPrevisao(lat, lon).catch(() => []),
      ]);
      setHistorico(hist as ClimaItem[]);
      setPrevisao(prev as PrevisaoItem[]);
    } catch {}
    setLoading(false);
  }

  const chuvaTotal30d = historico.reduce((sum, h) => sum + (h.precipitacao || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clima da Fazenda</h1>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Chuva 30 dias</p>
          <p className="text-2xl font-bold mt-1">{chuvaTotal30d.toFixed(0)} mm</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Temp Max (hoje)</p>
          <p className="text-2xl font-bold mt-1">{historico[0]?.temp_max?.toFixed(1) || "-"} C</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Temp Min (hoje)</p>
          <p className="text-2xl font-bold mt-1">{historico[0]?.temp_min?.toFixed(1) || "-"} C</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <p className="text-xs text-gray-500">Coordenadas</p>
          <p className="text-sm font-medium mt-1">{lat.toFixed(2)}, {lon.toFixed(2)}</p>
        </div>
      </div>

      {/* Previsao 14 dias */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-4">Previsao 14 dias</h2>
        {previsao.length === 0 ? (
          <p className="text-gray-400 text-sm">Sem dados de previsao. Execute o pipeline de clima.</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {previsao.map((p, i) => (
              <div key={i} className="text-center p-2 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-400">{p.data.slice(5)}</p>
                <p className="text-sm font-bold mt-1">
                  {p.precipitacao && p.precipitacao > 0 ? "🌧" : "☀"}
                </p>
                <p className="text-xs mt-1">
                  <span className="text-red-400">{p.temp_max?.toFixed(0)}</span>
                  /
                  <span className="text-blue-400">{p.temp_min?.toFixed(0)}</span>
                </p>
                {p.precipitacao != null && p.precipitacao > 0 && (
                  <p className="text-xs text-blue-500">{p.precipitacao.toFixed(0)}mm</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historico de chuva */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-4">Precipitacao ultimos 30 dias</h2>
        {historico.length === 0 ? (
          <p className="text-gray-400 text-sm">Sem dados. Execute os pipelines INMET ou NASA POWER.</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {historico.slice(0, 30).reverse().map((h, i) => {
              const maxPrecip = Math.max(...historico.map(x => x.precipitacao || 0), 1);
              const height = ((h.precipitacao || 0) / maxPrecip) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${h.data}: ${h.precipitacao?.toFixed(1) || 0}mm`}>
                  <div
                    className="w-full bg-blue-400 rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
