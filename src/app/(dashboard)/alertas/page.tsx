"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AlertaItem {
  id: string;
  tipo: string;
  item: string;
  condicao: string;
  valor_gatilho: number;
  unidade: string | null;
  ativo: boolean;
  notificar_whatsapp: boolean;
  ultimo_disparo: string | null;
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [tipo, setTipo] = useState("PRECO_COMMODITY");
  const [item, setItem] = useState("SOJA");
  const [condicao, setCondicao] = useState("ABAIXO");
  const [valor, setValor] = useState("");

  useEffect(() => { loadAlertas(); }, []);

  async function loadAlertas() {
    setLoading(true);
    try {
      const data = await api.listarAlertas();
      setAlertas(data as AlertaItem[]);
    } catch { setAlertas([]); }
    setLoading(false);
  }

  async function criarAlerta(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.criarAlerta({ tipo, item, condicao, valor_gatilho: parseFloat(valor) });
      setShowForm(false);
      setValor("");
      loadAlertas();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alertas</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          + Novo Alerta
        </button>
      </div>

      {/* Form novo alerta */}
      {showForm && (
        <form onSubmit={criarAlerta} className="bg-white rounded-xl shadow-sm border p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={tipo} onChange={e => setTipo(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="PRECO_COMMODITY">Preco Commodity</option>
                <option value="PRECO_INSUMO">Preco Insumo</option>
                <option value="RELACAO_TROCA">Relacao de Troca</option>
                <option value="CLIMA">Clima</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
              <select value={item} onChange={e => setItem(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="SOJA">Soja</option>
                <option value="MILHO">Milho</option>
                <option value="CAFE_ARABICA">Cafe</option>
                <option value="BOI_GORDO">Boi Gordo</option>
                <option value="UREIA">Ureia</option>
                <option value="MAP">MAP</option>
                <option value="KCL">KCl</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condicao</label>
              <select value={condicao} onChange={e => setCondicao(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="ABAIXO">Abaixo de</option>
                <option value="ACIMA">Acima de</option>
                <option value="VARIACAO">Variacao acima de %</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="Ex: 130.00"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">Criar</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista de alertas */}
      {loading ? (
        <p className="text-gray-400">Carregando...</p>
      ) : alertas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <p className="text-gray-400">Nenhum alerta configurado</p>
          <p className="text-gray-300 text-sm mt-2">Crie alertas para receber notificacoes quando precos ou condicoes mudarem.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map(a => (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">
                  {a.item.replace("_", " ")} — {a.condicao.toLowerCase()} R$ {a.valor_gatilho.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {a.tipo.replace("_", " ")} | WhatsApp: {a.notificar_whatsapp ? "Sim" : "Nao"}
                  {a.ultimo_disparo && ` | Ultimo disparo: ${new Date(a.ultimo_disparo).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${a.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {a.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
