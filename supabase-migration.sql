-- ============================================
-- AgroInsight - Migration Supabase
-- Cole este SQL inteiro no SQL Editor do Supabase
-- ============================================

-- Extensoes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dropar tabela usuarios existente (tipo id incompativel)
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================
-- 1. USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  plano TEXT DEFAULT 'FREE' CHECK (plano IN ('FREE', 'BASICO', 'PROFISSIONAL')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. MICRO REGIOES (558 IBGE)
-- ============================================
CREATE TABLE IF NOT EXISTS micro_regioes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_ibge INTEGER UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  estado TEXT NOT NULL,
  mesorregiao TEXT,
  clima TEXT,
  tipo_solo TEXT,
  altitude_media REAL,
  risco_geada REAL DEFAULT 0,
  culturas_principais TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS micro_regioes_similares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  micro_regiao_id UUID REFERENCES micro_regioes(id) ON DELETE CASCADE,
  similar_id UUID REFERENCES micro_regioes(id) ON DELETE CASCADE,
  score_similaridade REAL NOT NULL,
  fatores_comuns TEXT[] DEFAULT '{}',
  UNIQUE(micro_regiao_id, similar_id)
);

-- ============================================
-- 3. FAZENDAS E TALHOES
-- ============================================
CREATE TABLE IF NOT EXISTS fazendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  micro_regiao_id UUID REFERENCES micro_regioes(id),
  nome TEXT NOT NULL,
  estado TEXT NOT NULL,
  municipio TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  area_total_ha REAL,
  irrigada BOOLEAN DEFAULT FALSE,
  safras_por_ano REAL DEFAULT 2.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fazendas_user ON fazendas(user_id);

CREATE TABLE IF NOT EXISTS talhoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fazenda_id UUID REFERENCES fazendas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  area_ha REAL NOT NULL,
  tipo_solo TEXT,
  cultura_atual TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PRECOS COMMODITIES
-- ============================================
CREATE TABLE IF NOT EXISTS precos_commodities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cultura TEXT NOT NULL,
  data DATE NOT NULL,
  preco_rs REAL NOT NULL,
  unidade TEXT DEFAULT 'saca_60kg',
  fonte TEXT DEFAULT 'CEPEA',
  variacao_dia REAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cultura, data, fonte)
);

CREATE INDEX idx_precos_cultura_data ON precos_commodities(cultura, data DESC);

-- ============================================
-- 5. PRECOS FUTUROS (B3)
-- ============================================
CREATE TABLE IF NOT EXISTS precos_futuros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cultura TEXT NOT NULL,
  vencimento TEXT NOT NULL,
  data DATE NOT NULL,
  preco_rs REAL NOT NULL,
  volume INTEGER,
  fonte TEXT DEFAULT 'B3',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cultura, vencimento, data)
);

CREATE INDEX idx_futuros_cultura_data ON precos_futuros(cultura, data DESC);

-- ============================================
-- 6. PRECOS INSUMOS
-- ============================================
CREATE TABLE IF NOT EXISTS precos_insumos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  insumo TEXT NOT NULL,
  data DATE NOT NULL,
  preco_ton_rs REAL,
  preco_ton_usd REAL,
  fonte TEXT NOT NULL,
  regiao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(insumo, data, fonte)
);

CREATE INDEX idx_insumos_data ON precos_insumos(insumo, data DESC);

-- ============================================
-- 7. IMPORTACOES FERTILIZANTES
-- ============================================
CREATE TABLE IF NOT EXISTS importacoes_fertilizantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto TEXT NOT NULL,
  ncm TEXT,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  pais_origem TEXT,
  peso_kg REAL,
  valor_fob_usd REAL,
  fonte TEXT DEFAULT 'COMEX_STAT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(produto, ano, mes, pais_origem)
);

-- ============================================
-- 8. RELACAO DE TROCA
-- ============================================
CREATE TABLE IF NOT EXISTS relacao_troca (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commodity TEXT NOT NULL,
  insumo TEXT NOT NULL,
  data DATE NOT NULL,
  sacas_por_ton REAL NOT NULL,
  preco_commodity REAL,
  preco_insumo REAL,
  favorabilidade TEXT CHECK (favorabilidade IN ('BOM', 'NEUTRO', 'RUIM')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(commodity, insumo, data)
);

CREATE INDEX idx_relacao_troca_data ON relacao_troca(commodity, insumo, data DESC);

-- ============================================
-- 9. DADOS SAFRA
-- ============================================
CREATE TABLE IF NOT EXISTS dados_safra (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cultura TEXT NOT NULL,
  estado TEXT NOT NULL,
  safra TEXT NOT NULL,
  area_plantada_ha REAL,
  producao_ton REAL,
  produtividade_kg_ha REAL,
  fonte TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cultura, estado, safra, fonte)
);

CREATE INDEX idx_safra_cultura ON dados_safra(cultura, estado);

-- ============================================
-- 10. CUSTOS DE PRODUCAO
-- ============================================
CREATE TABLE IF NOT EXISTS custos_producao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cultura TEXT NOT NULL,
  estado TEXT NOT NULL,
  safra TEXT NOT NULL,
  custo_total_ha REAL,
  semente_ha REAL,
  fertilizante_ha REAL,
  defensivo_ha REAL,
  operacional_ha REAL,
  fonte TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cultura, estado, safra)
);

-- ============================================
-- 11. HISTORICO SAFRAS (do produtor)
-- ============================================
CREATE TABLE IF NOT EXISTS historico_safras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fazenda_id UUID REFERENCES fazendas(id) ON DELETE CASCADE,
  talhao_id UUID REFERENCES talhoes(id),
  cultura TEXT NOT NULL,
  safra TEXT NOT NULL,
  area_ha REAL,
  producao_ton REAL,
  produtividade_kg_ha REAL,
  custo_total REAL,
  receita REAL,
  problemas TEXT[] DEFAULT '{}',
  perda_pct REAL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 12. DADOS CLIMA
-- ============================================
CREATE TABLE IF NOT EXISTS dados_clima (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  data DATE NOT NULL,
  temp_max REAL,
  temp_min REAL,
  temp_media REAL,
  precipitacao REAL,
  umidade_media REAL,
  vento_medio REAL,
  radiacao_solar REAL,
  fonte TEXT NOT NULL,
  estacao_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(latitude, longitude, data, fonte)
);

CREATE INDEX idx_clima_coords_data ON dados_clima(latitude, longitude, data DESC);

-- ============================================
-- 13. PREVISAO CLIMA
-- ============================================
CREATE TABLE IF NOT EXISTS previsao_clima (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  data DATE NOT NULL,
  temp_max REAL,
  temp_min REAL,
  precipitacao REAL,
  prob_chuva REAL,
  fonte TEXT DEFAULT 'OPEN_METEO',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(latitude, longitude, data, fonte)
);

-- ============================================
-- 14. ALERTAS
-- ============================================
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('PRECO_COMMODITY', 'PRECO_INSUMO', 'RELACAO_TROCA', 'CLIMA')),
  item TEXT NOT NULL,
  condicao TEXT NOT NULL CHECK (condicao IN ('ABAIXO', 'ACIMA', 'VARIACAO')),
  valor_gatilho REAL NOT NULL,
  unidade TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  notificar_whatsapp BOOLEAN DEFAULT FALSE,
  ultimo_disparo TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alertas_user ON alertas(user_id, ativo);

CREATE TABLE IF NOT EXISTS alertas_historico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alerta_id UUID REFERENCES alertas(id) ON DELETE CASCADE,
  valor_atual REAL NOT NULL,
  mensagem TEXT,
  notificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 15. RECOMENDACOES (IA)
-- ============================================
CREATE TABLE IF NOT EXISTS recomendacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fazenda_id UUID REFERENCES fazendas(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('PLANTIO', 'COMPRA_INSUMO', 'VENDA', 'ALERTA_CLIMA', 'CULTURA_EMERGENTE')),
  prioridade TEXT DEFAULT 'MEDIA' CHECK (prioridade IN ('URGENTE', 'ALTA', 'MEDIA', 'BAIXA')),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  acao_sugerida TEXT,
  confianca REAL,
  lida BOOLEAN DEFAULT FALSE,
  aceita BOOLEAN,
  feedback_usuario TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recs_user ON recomendacoes(user_id, created_at DESC);

-- ============================================
-- 16. EVENTOS DE MERCADO
-- ============================================
CREATE TABLE IF NOT EXISTS eventos_mercado (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fonte TEXT,
  url TEXT,
  data_evento DATE,
  commodities_afetadas TEXT[] DEFAULT '{}',
  impacto_estimado TEXT CHECK (impacto_estimado IN ('POSITIVO', 'NEGATIVO', 'NEUTRO')),
  analise_ia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 17. CULTURAS EMERGENTES
-- ============================================
CREATE TABLE IF NOT EXISTS culturas_emergentes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cultura TEXT NOT NULL,
  micro_regiao_id UUID REFERENCES micro_regioes(id),
  tendencia TEXT CHECK (tendencia IN ('CRESCENTE', 'ESTAVEL', 'DECRESCENTE')),
  variacao_area_pct REAL,
  motivo TEXT,
  safras_analisadas INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 18. COMPRADORES REGIONAIS
-- ============================================
CREATE TABLE IF NOT EXISTS compradores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  tipo TEXT,
  commodities TEXT[] DEFAULT '{}',
  micro_regiao_id UUID REFERENCES micro_regioes(id),
  contato TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 19. CROWDSOURCE PRECOS
-- ============================================
CREATE TABLE IF NOT EXISTS precos_informados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES usuarios(id),
  insumo TEXT NOT NULL,
  preco_ton REAL NOT NULL,
  municipio TEXT NOT NULL,
  estado TEXT NOT NULL,
  loja TEXT,
  data_compra DATE DEFAULT CURRENT_DATE,
  verificado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas com dados de usuario
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE talhoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_safras ENABLE ROW LEVEL SECURITY;
ALTER TABLE precos_informados ENABLE ROW LEVEL SECURITY;

-- Tabelas publicas (leitura livre, escrita via service_role)
ALTER TABLE precos_commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE precos_futuros ENABLE ROW LEVEL SECURITY;
ALTER TABLE precos_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_safra ENABLE ROW LEVEL SECURITY;
ALTER TABLE dados_clima ENABLE ROW LEVEL SECURITY;
ALTER TABLE previsao_clima ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_mercado ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_regioes ENABLE ROW LEVEL SECURITY;

-- Policies: tabelas publicas - leitura livre
CREATE POLICY "public_read" ON precos_commodities FOR SELECT USING (true);
CREATE POLICY "public_read" ON precos_futuros FOR SELECT USING (true);
CREATE POLICY "public_read" ON precos_insumos FOR SELECT USING (true);
CREATE POLICY "public_read" ON dados_safra FOR SELECT USING (true);
CREATE POLICY "public_read" ON dados_clima FOR SELECT USING (true);
CREATE POLICY "public_read" ON previsao_clima FOR SELECT USING (true);
CREATE POLICY "public_read" ON eventos_mercado FOR SELECT USING (true);
CREATE POLICY "public_read" ON micro_regioes FOR SELECT USING (true);
CREATE POLICY "public_read" ON relacao_troca FOR SELECT USING (true);
CREATE POLICY "public_read" ON custos_producao FOR SELECT USING (true);
CREATE POLICY "public_read" ON importacoes_fertilizantes FOR SELECT USING (true);
CREATE POLICY "public_read" ON culturas_emergentes FOR SELECT USING (true);
CREATE POLICY "public_read" ON compradores FOR SELECT USING (true);

-- Policies: dados do usuario - acesso apenas ao proprio
CREATE POLICY "user_own" ON usuarios FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "user_own" ON fazendas FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "user_own" ON alertas FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "user_own" ON recomendacoes FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "user_own" ON historico_safras FOR ALL USING (
  fazenda_id IN (SELECT id FROM fazendas WHERE user_id::text = auth.uid()::text)
);
CREATE POLICY "user_own" ON precos_informados FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "user_own" ON talhoes FOR ALL USING (
  fazenda_id IN (SELECT id FROM fazendas WHERE user_id::text = auth.uid()::text)
);
CREATE POLICY "user_own" ON alertas_historico FOR ALL USING (
  alerta_id IN (SELECT id FROM alertas WHERE user_id::text = auth.uid()::text)
);

-- ============================================
-- DONE!
-- ============================================
