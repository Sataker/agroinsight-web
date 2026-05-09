const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("agroinsight_token", token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("agroinsight_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("agroinsight_token");
    }
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: Record<string, string> }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string, nome: string, whatsapp?: string) {
    const data = await this.request<{ access_token: string; user: Record<string, string> }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nome, whatsapp }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async me() {
    return this.request<Record<string, string>>("/api/v1/auth/me");
  }

  // Fazendas
  async listarFazendas() {
    return this.request<Record<string, unknown>[]>("/api/v1/fazendas/");
  }

  async criarFazenda(data: Record<string, unknown>) {
    return this.request("/api/v1/fazendas/", { method: "POST", body: JSON.stringify(data) });
  }

  // Precos
  async precosCommodities(commodity?: string, dias = 30) {
    const params = new URLSearchParams({ dias: String(dias) });
    if (commodity) params.set("commodity", commodity);
    return this.request<Record<string, unknown>[]>(`/api/v1/precos/commodities?${params}`);
  }

  async precosFuturos(commodity?: string) {
    const params = new URLSearchParams();
    if (commodity) params.set("commodity", commodity);
    return this.request<Record<string, unknown>[]>(`/api/v1/precos/futuros?${params}`);
  }

  async relacaoTroca(commodity = "SOJA", insumo = "UREIA", dias = 365) {
    return this.request<Record<string, unknown>[]>(
      `/api/v1/precos/relacao-troca?commodity=${commodity}&insumo=${insumo}&dias=${dias}`
    );
  }

  // Clima
  async climaHistorico(lat: number, lon: number, dias = 90) {
    return this.request<Record<string, unknown>[]>(
      `/api/v1/clima/historico?latitude=${lat}&longitude=${lon}&dias=${dias}`
    );
  }

  async climaPrevisao(lat: number, lon: number) {
    return this.request<Record<string, unknown>[]>(
      `/api/v1/clima/previsao?latitude=${lat}&longitude=${lon}`
    );
  }

  // Insumos
  async precosInsumos(categoria?: string, produto?: string) {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (produto) params.set("produto", produto);
    return this.request<Record<string, unknown>[]>(`/api/v1/insumos/precos?${params}`);
  }

  // Alertas
  async listarAlertas() {
    return this.request<Record<string, unknown>[]>("/api/v1/alertas/");
  }

  async criarAlerta(data: Record<string, unknown>) {
    return this.request("/api/v1/alertas/", { method: "POST", body: JSON.stringify(data) });
  }

  // Recomendacoes
  async listarRecomendacoes(tipo?: string) {
    const params = new URLSearchParams();
    if (tipo) params.set("tipo", tipo);
    return this.request<Record<string, unknown>[]>(`/api/v1/recomendacoes/?${params}`);
  }

  async eventosMercado() {
    return this.request<Record<string, unknown>[]>("/api/v1/recomendacoes/eventos");
  }
}

export const api = new ApiClient();
