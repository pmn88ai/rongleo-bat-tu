# Menh Ly AI — RongLeo

> An Eastern metaphysics platform by **Pham Minh Nhat (RongLeo)**: BaZi, Tu Vi, I Ching divination and a temple space.

*[Vietnamese version](README.md)*

---

## Introduction

Menh Ly AI is a web app for building and reading destiny charts based on Eastern metaphysics. The interface uses React 19 + Vite, the server uses Express.js, the calculation engine is plain JavaScript, and the AI consultation uses a language model through Groq. Production runs on Vercel at **rongleo-menhly.vercel.app**.

---

## Key features

- **BaZi (Four Pillars)**: build the chart for Year, Month, Day and Hour with Heavenly Stems, Earthly Branches, hidden stems, Ten Gods, Nayin and Empty Void; Five Elements chart.
- **Luck cycles**: major 10-year cycles, annual, monthly and minor fortune.
- **Interpretation**: stem and branch relationship matrix (combinations, clashes, punishments, harms, destructions), Ten Gods, Five Elements, symbolic stars, chart structure, and classic texts (Zi Ping Zhen Quan, Di Tian Sui, Disease & Remedy, Sympathetic Element, Golden Irreplaceable).
- **Tu Vi**: build and read a Tu Vi chart from birth date and time.
- **I Ching divination**: cast a hexagram by time and destiny profile, browse all 64 hexagrams with changing lines, nuclear and transformed hexagrams.
- **Temple**: Main Hall and Pure Mind Garden scenes with ambient visuals and meditation music.
- **Today's Fortune**: daily fortune reading with a shareable image.
- **AI consultant**: ask questions about a chart, suggested questions by topic, saved consultation history.
- **Compatibility**: compare two charts and score their match.
- **Date selection**: evaluate good and bad days for a personal chart, pick auspicious dates.
- **Western astrology**: Sun sign, Moon sign and personality traits.
- **Articles**: metaphysics articles with Markdown and SEO-friendly slugs.
- **Accounts and admin**: JWT register/login, personal profile, consultation history, admin panel (articles, suggested questions, users, access logs).
- **Export**: export a chart as PNG or PDF.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router 7, react-markdown, html2canvas, jsPDF |
| Backend | Express 4, SQLite (sql.js/sqlite3), lunar-javascript, JWT, helmet, express-rate-limit, lru-cache |
| AI | Groq API (language models), OpenRouter fallback layer |
| Tooling & deploy | npm workspaces, concurrently, nodemon, Vercel |

---

## Project structure

```
rongleo-bat-tu/
├── package.json          # Monorepo (npm workspaces)
├── frontend/             # React 19 + Vite, dev port 3005
│   ├── src/
│   │   ├── features/     # BaziChart, LuckCycles, Interpretation, Consultant,
│   │   │                 # Matching, DateSelection, Que, tu_vi, van_hom_nay, chua, Admin...
│   │   ├── components/   # Mobile/desktop shells, AuthModal, export buttons...
│   │   ├── services/     # apiClient, imageExport, pdfExport
│   │   ├── context/      # AuthContext
│   │   ├── hooks/        # useBaziApi, useWindowSize
│   │   └── config/       # route and temple room config
│   ├── api/              # Vercel serverless API (core, consultant, misc, que...)
│   ├── lib/              # BaZi engine shared by the Vercel build
│   ├── public/           # images, audio, static assets
│   └── vercel.json       # /api rewrites and deploy config
├── backendjs/            # Express API, port 8888
│   ├── server.js
│   ├── src/
│   │   ├── bazi/         # BaZi calculation engine
│   │   ├── routes/       # bazi, consultant, auth, admin, articles, que, tu_vi, van_hom_nay
│   │   ├── services/     # bazi, database, cache, que, groq, openrouter
│   │   ├── middleware/
│   │   ├── western/      # Western astrology
│   │   └── utils/
│   └── tests/            # engine and API tests via node --test
└── docs/                 # architecture, interpretation and security docs
```

---

## Run locally

Requirements: Node.js >= 18 and npm >= 8.

```bash
npm install
```

Create the env files:

```bash
cp backendjs/.env.example backendjs/.env
cp frontend/.env.example frontend/.env
```

In `backendjs/.env`, set `PORT=8888`. To use AI consultation, fill in `GROQ_API_KEY`; chart, luck cycle, interpretation, divination and date features work without an AI key.

Run both sides:

```bash
npm run dev
```

- Frontend: http://localhost:3005
- Backend: http://localhost:8888
- Vite proxies `/api` to the backend on port 8888.

Run each side separately:

```bash
npm run dev:frontend
npm run dev:backend
```

Build the frontend:

```bash
npm run build
```

---

## Tests

The backend uses the Node.js built-in test runner (`node --test`):

```bash
# From the repo root
npm test -w backendjs

# Or inside backendjs
cd backendjs
npm test

# Run one group
npm run test:core -w backendjs
npm run test:api -w backendjs
npm run test:western -w backendjs
```

---

## Deploy

Production runs on Vercel:

- Website: https://rongleo-menhly.vercel.app
- Deploy directory: `frontend/`
- `frontend/vercel.json` configures the Vite build and rewrites `/api` routes to the serverless functions in `frontend/api/`.
- Frontend env vars: `VITE_SITE_URL`, `VITE_GA_ID`, `VITE_GOOGLE_SITE_VERIFICATION`, `VITE_CLARITY_ID`.

---

## Docs

| Document | Content |
|---|---|
| [ENGINE_ARCHITECTURE.md](docs/ENGINE_ARCHITECTURE.md) | BaZi engine architecture |
| [PROJECT_MAP.md](docs/PROJECT_MAP.md) | System map, security and SEO checks |
| [INTERPRETATION_SYSTEM.md](docs/INTERPRETATION_SYSTEM.md) | Interpretation system |
| [WESTERN_ASTROLOGY.md](docs/WESTERN_ASTROLOGY.md) | Western astrology |
| [SECURITY_REPORT.md](docs/SECURITY_REPORT.md) | Security report |

---

## License

Copyright © 2026 Pham Minh Nhat (RongLeo). All rights reserved. See [LICENSE](LICENSE) for the terms of use.

---

<p align="center">
  <b>Menh Ly AI</b> — Pham Minh Nhat (RongLeo)<br/>
  <i>rongleo-menhly.vercel.app</i>
</p>
