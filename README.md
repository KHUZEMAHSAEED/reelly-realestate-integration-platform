# Reelly Luxe | Real Estate Engine & Bitrix24 CRM App

[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)

A unified real estate platform integrating the **Reelly API v2.0** with **Bitrix24 CRM**. Provides an ultra-luxury off-plan property portal alongside a dedicated real estate broker workspace for deal matching, timeline syncing, and client proposal dispatching.

---

## ✨ Features

- **🏛️ Dual-Mode Architecture**:
  - **Standalone Luxury Portal**: Curated high-net-worth property discovery with luxury aesthetics, photo galleries, amenities, and floor plans.
  - **Bitrix24 CRM Mode**: Embeds directly into Bitrix24 CRM deals with real-time budget and bedroom matching, one-click unit attachment, and activity timeline logging.
- **🗺️ Interactive Dark Map**:
  - Custom Leaflet integration with CartoDB Dark Matter tiles and interactive gold price markers synchronized with catalog cards.
- **💱 Multi-Currency Converter**:
  - Live price conversions across **AED (د.إ)**, **USD ($)**, **EUR (€)**, and **GBP (£)**.
- **🚀 Reelly API v2.0 BFF Gateway**:
  - Server-side caching (TTL), key masking, and automatic fallback to an offline UAE luxury catalog (Sobha, Emaar, Binghatti, Omniyat, Meraas).
- **📲 Instant Client Proposal Generator**:
  - Formats VIP proposal links and dispatches client packets via WhatsApp and Email directly into Bitrix24 deal timelines.

---

## 🏗️ Project Architecture

```
reelly/
├── client/                     # Vite + React 19 + TypeScript + Leaflet UI
│   ├── src/
│   │   ├── components/         # Navbar, ProjectCard, MapView, Modals, BitrixBar
│   │   ├── services/api.ts     # Frontend API & Currency Formatter
│   │   ├── types.ts            # Shared domain types
│   │   ├── index.css           # Obsidian & Gold Design System
│   │   └── App.tsx             # Root application orchestrator
│   └── vite.config.ts          # Vite proxy to backend API (localhost:3001)
├── server/                     # Node.js + Express + TypeScript BFF
│   └── src/
│       ├── reellyClient.ts     # Reelly v2.0 API client with caching & fallback
│       ├── mockData.ts         # UAE off-plan projects, developers & markers
│       ├── types.ts            # Domain & Bitrix CRM types
│       └── index.ts            # Express REST server & Bitrix endpoints
├── .gitignore                  # Git ignore rules for root, client, and server
├── .env.example                # Sample environment variables
└── package.json                # Monorepo concurrently dev scripts
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 20+
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/reelly-bitrix-luxury-portal.git
cd reelly-bitrix-luxury-portal

# Install root, server, and client dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Environment Setup (Optional)
Copy `.env.example` in `server/`:
```bash
cp server/.env.example server/.env
```
*(If left empty, the application runs in offline high-fidelity mock mode).*

### 4. Running Locally
Run both server (port 3001) and client (port 5173) concurrently:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ▲ Deploy to Vercel (client showcase)

`vercel.json` at the repo root configures everything. The React portal is served from `client/dist`, and the Vercel Function `api/router.ts` reuses the same `ReellyClient` as the Node BFF to serve the **live Reelly catalog**. The API key stays server-side in an environment variable. The Bitrix24 CRM workspace runs in-browser on Vercel (serverless instances share no state), seeded with the sample deals from `server/src/mockData.ts`.

| Configuration | What visitors see |
|---|---|
| `REELLY_API_KEY` set | Live Reelly inventory + in-browser CRM demo |
| No key | Curated sample catalog (5 projects) + in-browser CRM demo |

### Connect the repository
1. [vercel.com/new](https://vercel.com/new) → **Import** this GitHub repository.
2. **Root Directory:** leave as the repository root (`./`). **Framework Preset:** *Other*. Build, install and output settings come from `vercel.json`, so leave those overrides off.
3. **Environment Variables:** add `REELLY_API_KEY` (Production and Preview).
4. **Deploy.** Every push to `main` redeploys production; other branches get preview URLs.

### Check the deployment
- `https://<project>.vercel.app/api/health` → `"Reelly Luxe catalog gateway (Vercel)"`
- `https://<project>.vercel.app/` → "48 Residences" with a green **Reelly v2: Live** badge
- `https://<project>.vercel.app/?mode=bitrix&dealId=101` → Bitrix24 CRM mode

> Bitrix24 embedding: `vercel.json` sends `frame-ancestors` allowing `*.bitrix24.*`, so the portal can be loaded inside Bitrix24 deal tabs.

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Service health status |
| `/api/projects` | `GET` | Search and filter off-plan projects |
| `/api/projects/:id` | `GET` | Single project details, units & floor plans |
| `/api/markers` | `GET` | Map coordinates and price pins |
| `/api/developers` | `GET` | List of luxury real estate developers |
| `/api/settings/reelly-key` | `GET/POST`| Read or update Reelly v2 API key |
| `/api/settings/test-connection` | `POST` | Test live upstream Reelly API connection |
| `/api/bitrix/deals` | `GET` | Retrieve Bitrix24 active deal contexts |
| `/api/bitrix/attach-project` | `POST` | Attach project/unit to a Bitrix deal |
| `/api/bitrix/send-proposal` | `POST` | Dispatch WhatsApp/Email proposal |

---

## 📄 License
MIT
