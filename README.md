# AgroInsight Web

Frontend Next.js do AgroInsight — dashboard do consultor agricola com IA.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Recharts** — graficos de precos e series temporais
- **Leaflet** — mapa interativo de safra e clima
- **Lucide React** — icones

## Setup

```bash
npm install
cp .env.example .env
# Editar NEXT_PUBLIC_API_URL para apontar pro backend Python
npm run dev
```

Acesse: http://localhost:3200

## Estrutura

```
src/
├── app/
│   ├── (auth)/login/        # Login/cadastro
│   ├── (dashboard)/         # Dashboard protegido
│   │   ├── page.tsx         # Home — KPIs, recomendacoes, eventos
│   │   ├── precos/          # Precos de commodities + graficos
│   │   ├── insumos/         # Monitor de insumos + relacao de troca
│   │   ├── clima/           # Clima da micro-regiao
│   │   ├── safra/           # Dados de safra CONAB/IBGE
│   │   ├── recomendacoes/   # Recomendacoes da IA
│   │   ├── alertas/         # Alertas configurados
│   │   └── configuracoes/   # Perfil, fazendas, talhoes
│   └── api/                 # Proxy routes (opcional)
├── components/
│   ├── ui/                  # Componentes base (botoes, inputs, cards)
│   ├── dashboard/           # Shell, sidebar, topbar
│   ├── precos/              # Graficos de precos
│   └── clima/               # Visualizacao climatica
└── lib/
    └── api.ts               # Client HTTP para o backend Python
```

## Backend

API Python (FastAPI): [agroinsight-api](https://github.com/Sataker/agroinsight-api)
