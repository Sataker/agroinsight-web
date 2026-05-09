"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface FazendaItem {
  id: string;
  nome: string;
  estado: string;
  municipio: string;
  latitude: number | null;
  longitude: number | null;
  area_total_ha: number | null;
  irrigada: boolean;
  talhoes: { id: string; nome: string; area_ha: number; tipo_solo: string | null }[];
}

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [fazendas, setFazendas] = useState<FazendaItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [estado, setEstado] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [area, setArea] = useState("");
  const [irrigada, setIrrigada] = useState(false);

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
    api.listarFazendas().then(f => setFazendas(f as FazendaItem[])).catch(() => {});
  }, []);

  async function criarFazenda(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.criarFazenda({
        nome, estado, municipio,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lon ? parseFloat(lon) : null,
        area_total_ha: area ? parseFloat(area) : null,
        irrigada,
      });
      setShowForm(false);
      const f = await api.listarFazendas();
      setFazendas(f as FazendaItem[]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      {/* Perfil */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-lg font-semibold mb-3">Perfil</h2>
        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{user.nome}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user.email}</span></div>
            <div><span className="text-gray-500">WhatsApp:</span> <span className="font-medium">{user.whatsapp || "-"}</span></div>
            <div><span className="text-gray-500">Plano:</span> <span className="font-medium">{user.plano}</span></div>
          </div>
        )}
      </div>

      {/* Fazendas */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Fazendas</h2>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
            + Nova Fazenda
          </button>
        </div>

        {showForm && (
          <form onSubmit={criarFazenda} className="border rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Nome da fazenda" value={nome} onChange={e => setNome(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Estado (UF)" value={estado} onChange={e => setEstado(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" maxLength={2} required />
              <input placeholder="Municipio" value={municipio} onChange={e => setMunicipio(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" required />
              <input placeholder="Area total (ha)" type="number" value={area} onChange={e => setArea(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Latitude" type="number" step="0.0001" value={lat} onChange={e => setLat(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
              <input placeholder="Longitude" type="number" step="0.0001" value={lon} onChange={e => setLon(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={irrigada} onChange={e => setIrrigada(e.target.checked)} />
              Area irrigada
            </label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancelar</button>
            </div>
          </form>
        )}

        {fazendas.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhuma fazenda cadastrada. Adicione sua primeira fazenda.</p>
        ) : (
          <div className="space-y-3">
            {fazendas.map(f => (
              <div key={f.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{f.nome}</h3>
                  <span className="text-sm text-gray-400">{f.area_total_ha ? `${f.area_total_ha} ha` : ""}</span>
                </div>
                <p className="text-sm text-gray-500">{f.municipio}/{f.estado} {f.irrigada ? "| Irrigada" : ""}</p>
                {f.talhoes.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">{f.talhoes.length} talhoes</p>
                    {f.talhoes.map(t => (
                      <span key={t.id} className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs mr-1 mb-1">
                        {t.nome} ({t.area_ha} ha)
                      </span>
                    ))}
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
