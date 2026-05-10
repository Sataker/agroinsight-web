import { supabase } from "./supabase";

class ApiClient {
  private userId: string | null = null;

  // Auth via Supabase Auth
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    this.userId = data.user.id;
    return { user: { email: data.user.email, id: data.user.id } };
  }

  async register(email: string, password: string, nome: string, whatsapp?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, whatsapp } },
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      this.userId = data.user.id;
      // Criar perfil na tabela usuarios
      await supabase.from("usuarios").upsert({
        id: data.user.id,
        email,
        password_hash: "supabase_auth",
        nome,
        whatsapp: whatsapp || null,
        plano: "FREE",
      });
    }
    return { user: { email, nome } };
  }

  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Nao autenticado");
    this.userId = user.id;
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();
    return data || { email: user.email, nome: user.user_metadata?.nome || "", plano: "FREE" };
  }

  async logout() {
    await supabase.auth.signOut();
    this.userId = null;
  }

  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  // Fazendas
  async listarFazendas() {
    const { data, error } = await supabase
      .from("fazendas")
      .select("*, talhoes(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async criarFazenda(fazenda: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("fazendas")
      .insert({ ...fazenda, user_id: user?.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  // Precos Commodities
  async precosCommodities(commodity?: string, dias = 30) {
    let query = supabase
      .from("precos_commodities")
      .select("*")
      .gte("data", new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10))
      .order("data", { ascending: false });
    if (commodity) query = query.eq("cultura", commodity);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Precos Futuros
  async precosFuturos(commodity?: string) {
    let query = supabase
      .from("precos_futuros")
      .select("*")
      .order("data", { ascending: false })
      .limit(50);
    if (commodity) query = query.eq("cultura", commodity);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Relacao de Troca
  async relacaoTroca(commodity = "SOJA", insumo = "UREIA", dias = 365) {
    const { data, error } = await supabase
      .from("relacao_troca")
      .select("*")
      .eq("commodity", commodity)
      .eq("insumo", insumo)
      .gte("data", new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10))
      .order("data", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Clima Historico
  async climaHistorico(lat: number, lon: number, dias = 90) {
    const tolerance = 0.5;
    const { data, error } = await supabase
      .from("dados_clima")
      .select("*")
      .gte("latitude", lat - tolerance)
      .lte("latitude", lat + tolerance)
      .gte("longitude", lon - tolerance)
      .lte("longitude", lon + tolerance)
      .gte("data", new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10))
      .order("data", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Clima Previsao
  async climaPrevisao(lat: number, lon: number) {
    const tolerance = 0.5;
    const { data, error } = await supabase
      .from("previsao_clima")
      .select("*")
      .gte("latitude", lat - tolerance)
      .lte("latitude", lat + tolerance)
      .gte("longitude", lon - tolerance)
      .lte("longitude", lon + tolerance)
      .gte("data", new Date().toISOString().slice(0, 10))
      .order("data", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Insumos
  async precosInsumos(insumo?: string) {
    let query = supabase
      .from("precos_insumos")
      .select("*")
      .order("data", { ascending: false })
      .limit(100);
    if (insumo) query = query.eq("insumo", insumo);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Dados Safra
  async dadosSafra(cultura?: string, estado?: string) {
    let query = supabase
      .from("dados_safra")
      .select("*")
      .order("safra", { ascending: false })
      .limit(20);
    if (cultura) query = query.eq("cultura", cultura);
    if (estado && estado !== "BR") query = query.eq("estado", estado);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Alertas
  async listarAlertas() {
    const { data, error } = await supabase
      .from("alertas")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async criarAlerta(alerta: Record<string, unknown>) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("alertas")
      .insert({ ...alerta, user_id: user?.id })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async deletarAlerta(id: string) {
    const { error } = await supabase.from("alertas").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  // Recomendacoes
  async listarRecomendacoes(tipo?: string) {
    let query = supabase
      .from("recomendacoes")
      .select("*")
      .order("created_at", { ascending: false });
    if (tipo) query = query.eq("tipo", tipo);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Eventos de Mercado
  async eventosMercado() {
    const { data, error } = await supabase
      .from("eventos_mercado")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const api = new ApiClient();
