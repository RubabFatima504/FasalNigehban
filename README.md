# 🌾🛡️ HarvestGuard

**AI-powered post-harvest loss prevention for Pakistan's agricultural supply chain.**

🔗 **Live demo:** [https://harvestguard-ai.netlify.app/](https://harvestguard-ai.netlify.app/)

Pakistan loses an estimated 35–40% of its fruit and vegetable harvest between farm and market — the Asian Development Bank put the annual cost at $2 billion in an August 2026 report. It isn't a production problem. It's an information problem: the science, the weather, and the market prices needed to make a good decision all exist — nobody puts them together in real time for the field worker who needs the answer today.

HarvestGuard is that decision layer. An extension officer or cooperative field worker logs a harvest batch in under a minute; three AI agents calculate exactly how fast it's losing value, compare real market options, and generate a plain-language report the officer can forward to the farmer over WhatsApp — with every number traceable to a real research paper, a live weather reading, or a live market price.

## Why This Is Different

- **Numbers you can defend, not numbers an LLM made up.** The risk score, the spoilage curve, and every rupee figure are computed by a deterministic model grounded in published crop-science research. The LLM's only job is to explain that number in plain language — it never invents one. A financial-consistency check even verifies the LLM's own written rupee figure against the calculated one before it's shown to anyone.
- **Built on real research, not generic AI knowledge.** Every decay parameter traces to a cited paper (Ali et al. 2019, Malik et al. 2016, IRRI's Rice Knowledge Bank, and others — see [§9](#9-data-sources--citations)). The AI's written analysis cites these sources by name instead of producing generic, unverifiable advice.
- **Live, not static.** Market prices are scraped daily from Pakistan's own AMIS system and merged into a growing, self-expanding market database (13 → 48+ tracked mandis with zero manual entry). Weather is fetched live per batch, per location.
- **Designed for how the last mile actually works.** The user is the extension officer or NGO field worker already talking to farmers every day — not an app aimed at a smallholder who may not have a smartphone. The output is a report built to be forwarded, not a dashboard that has to be interpreted.
- **Engineered for real deployment constraints, not just a demo.** The retrieval layer runs on TF-IDF instead of a hosted embedding model — a deliberate call to keep the whole system free to run and light enough to deploy on a resource-constrained free-tier host, without sacrificing grounding quality at this knowledge base's scale.

## Table of Contents

1. [What HarvestGuard Does](#1-what-harvestguard-does)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [The Spoilage Model](#4-the-spoilage-model)
5. [Multi-Agent AI Pipeline](#5-multi-agent-ai-pipeline)
6. [Scenario Simulator](#6-scenario-simulator)
7. [Live Market Data](#7-live-market-data)
8. [Research Data & RAG Knowledge Base](#8-research-data--rag-knowledge-base)
9. [Data Sources & Citations](#9-data-sources--citations)
10. [API Reference](#10-api-reference)
11. [Running Locally](#11-running-locally)
12. [Deployment](#12-deployment)
13. [Roadmap](#13-roadmap)
14. [Use of Kiro](#14-use-of-kiro)
15. [Team Contributions](#15-team-contributions)
16. [License](#16-license)
17. [Acknowledgements](#17-acknowledgements)

## 1. What HarvestGuard Does

1. A field officer registers a harvest batch — crop, quantity, harvest date, location, current storage conditions. Takes under a minute.
2. The **Spoilage Analyst** agent calculates exactly how much value the batch has already lost and how much more it will lose, using a crop-specific decay model grounded in published research — not a generic one-size-fits-all curve.
3. The **Market Intelligence** agent compares three concrete options — sell today at the nearest market, hold in cold storage for a better price, or transport immediately — using live wholesale prices, and recommends the one with the highest net revenue.
4. The **Advisory** agent combines both into a single report: what to do, why, and how much it saves versus doing nothing.
5. The officer shares the report with the farmer however they normally communicate — WhatsApp, SMS, or in person.

## 2. System Architecture

```
┌─────────────────────────────┐
│   Netlify (React frontend)  │
└──────────────┬───────────────┘
               │ HTTPS + JWT
               ▼
┌─────────────────────────────┐        ┌──────────────────────────────┐
│  Render (FastAPI backend)   │──────▶│  Groq — openai/gpt-oss-120b  │
│  - Multi-agent orchestrator │        │  (OpenAI-compatible)         │
│  - Spoilage curve model     │        └──────────────────────────────┘
│  - Scenario simulator       │
│  - RAG pipeline (TF-IDF)    │        ┌──────────────────────────────┐
│  - AMIS scraper (scheduled) │──────▶│  Open-Meteo (weather)        │
└──────────────┬───────────────┘        └──────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Neon Postgres               │
│  - Users (JWT auth)         │
│  - Batches (persisted)      │
└─────────────────────────────┘
```

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, Vite, Recharts, Tailwind |
| Backend | FastAPI (Python), Uvicorn |
| AI orchestration | LangGraph / LangChain, 3-agent pipeline |
| LLM | Groq — `openai/gpt-oss-120b`, OpenAI-compatible API |
| RAG retrieval | TF-IDF + cosine similarity (scikit-learn) |
| Database | PostgreSQL (Neon) via SQLModel |
| Auth | JWT (python-jose) + bcrypt |
| Scheduling | APScheduler — daily market-price scrape |
| Weather | Open-Meteo (live, per batch) |
| Market prices | AMIS Punjab, scraped daily |
| Hosting | Render (backend) · Netlify (frontend) |

## 4. The Spoilage Model

A deterministic exponential decay model, not a black box:

```
value(t) = 100 × e^(−k×t)
k = base_k × 2^(temp_diff / temp_halving_celsius)
```

`base_k` and `temp_halving_celsius` are derived per crop from published research (e.g. IRRI's stated "shelf life halves every 5°C" rule for rice; a Lady Rosetta potato study's two-temperature data points). The risk score and days-until-critical-loss shown to the user come straight out of this formula — the AI layer explains the result, it doesn't calculate it.

## 5. Multi-Agent AI Pipeline

`agents/orchestrator.py` runs three agents per assessment, each grounded in retrieved research context ([§8](#8-research-data--rag-knowledge-base)):

1. **Spoilage Analyst** — risk score, critical day, key risk factors, written explanation.
2. **Market Intelligence** — three financially-modeled scenarios ([§6](#6-scenario-simulator)) with a reasoned recommendation.
3. **Advisory** — synthesizes both into one farmer-facing report, with a financial-consistency check that verifies the LLM's stated savings figure against the actual computed number before it's shown to anyone.

## 6. Scenario Simulator

`models/scenario_simulator.py` builds three concrete options per batch — **Sell Today**, **Store & Sell** (2 days cold storage, then sell), and **Transport Now** — each with real transport cost, storage cost, spoilage-adjusted sellable quantity, and net revenue. If no market has real price data for a crop, the simulator raises an error rather than silently substituting a placeholder price — a farmer should never see a confident-looking number built on invented data.

## 7. Live Market Data

`scraper/amis_scraper.py` pulls daily wholesale prices from AMIS Punjab for all 5 tracked crops. New markets AMIS reports on are automatically geocoded and added — the tracked market list grew from ~13 to 48+ with zero manual entry. Runs on a background thread so a scrape never blocks the API.

## 8. Research Data & RAG Knowledge Base

Five crops, each with a decay model grounded in a specific cited study — Chaunsa & Sindhri mango, Basmati rice, potato, and tomato. `backend/data/crop_profiles.json` carries the decay constants and their source citations directly; `backend/rag/knowledge_base/` holds 9 documents summarizing the same research in original wording, retrieved via TF-IDF and used as grounding context so the AI's written analysis cites real sources — "Malik et al., 2016," "Saeed et al., 2010" — instead of generic claims.

## 9. Data Sources & Citations

- Ali, Z., Malik, A.U., Khan, A.S., Amin, M., Rehman, A. (2019). *Effect of modified atmosphere packaging on the postharvest life and quality of mango cv. Samar Bahisht Chaunsa stored at chilling temperature.* Pakistan Journal of Agricultural Sciences, 56(4).
- Malik, O.H., Malik, A.U., Khalid, M.S., Amin, M., Khalid, S., Umar, M. (2016). *Effect of Modified Atmosphere Packaging on Postharvest Quality of Mango cvs. Sindhri and Sufaid Chaunsa During Storage.* Turkish Journal of Agriculture - Food Science and Technology, 4(12).
- Abbasi, K.S., Masud, T., et al. *Storage stability of potato variety Lady Rosetta under comparative temperature regimes.*
- Saeed, A.F.U.H., Khan, S.N., Sarwar, A., Tahira, J.J. (2010). *Effect of packing materials on storage of tomato.* Mycopath, 8(2).
- Firdous, N. (2021). *Post-harvest losses in different fresh produces and vegetables in Pakistan with particular focus on tomatoes.* Journal of Horticulture and Postharvest Research, 4(1).
- International Rice Research Institute (IRRI), Rice Knowledge Bank — *Postproduction: Storage & Drying.*
- Trade Development Authority of Pakistan (TDAP). *Report on Post Harvest Losses of Rice* (2010).
- WWF-Pakistan. *Post-Harvest Food Losses in Rice and Tomato Supply Chains* Policy Brief (2019 field survey).
- Pakistan National Commission on Agriculture, cited in FAO, *Post-harvest handling losses.*
- Pakistan Business Council. *The Missing Link: Building Pakistan's Cold Chain.*
- Asian Development Bank (2026). Report on cold-chain gaps and post-harvest loss cost in Pakistan agribusiness.
- AMIS Punjab ([amis.pk](https://amis.pk)) — live wholesale market price data.
- [Open-Meteo](https://open-meteo.com) — live weather data.

## 10. API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Create a user account, returns JWT |
| `/api/auth/login` | POST | Authenticate, returns JWT |
| `/api/me` | GET | Current user's profile |
| `/api/batch` | POST | Register a new harvest batch |
| `/api/batches` | GET | List the current user's batches |
| `/api/batch/{id}/assess` | POST | Main endpoint — runs the full multi-agent assessment |
| `/api/batch/{id}/assessment` | GET | Retrieve a completed assessment |
| `/api/batch/{id}/scenarios` | GET | Just the 3 scenarios from a completed assessment |
| `/api/batch/{id}/report` | GET | Just the farmer-facing report |
| `/api/markets` | GET | All tracked markets, including auto-discovered ones |

## 11. Running Locally

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env  (then fill in your keys)
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev
```

Backend env vars go in `backend/.env` (`DASHSCOPE_API_KEY`, `QWEN_EMBED_MODEL`, `GROQ_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`, `DATABASE_URL`, `JWT_SECRET`); the frontend needs `VITE_API_BASE_URL` pointing at the backend (`http://localhost:8000` locally). If `DATABASE_URL` is unset, the backend falls back to local SQLite.

## 12. Deployment

| Component | Host | Link |
|---|---|---|
| Frontend | Netlify | [https://harvestguard-ai.netlify.app/](https://harvestguard-ai.netlify.app/) |
| Backend | Render | — |
| Database | Neon Postgres | — |

## 13. Roadmap

- Extend beyond the current 5 crops (onion, citrus/Kinnow, banana) using the same research-collection process behind the current dataset.
- Use each crop's own storage-condition research (already collected, not yet fully wired into the decay model) for more precise storage-type comparisons.
- Surface each figure's underlying data-confidence level in the UI, since the dataset already distinguishes directly-sourced values from derived estimates internally.
- Push notifications for scrape failures and assessment completion, beyond the current health-check endpoint.

## 14. Use of Kiro

[Kiro](https://kiro.dev) was used throughout development of HarvestGuard:

- **Development:** building out parts of the backend and frontend.
- **Adding features:** implementing new functionality on top of the existing codebase.
- **Debugging:** tracking down and fixing issues during development.

## 15. Team Contributions

| Member | Contributions |
|---|---|
| Rubab Fatima | `<what you built, e.g. backend, agents, frontend>` |
| Eman Abbasi | `<what she built>` |

## 16. License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 17. Acknowledgements

Built with [FastAPI](https://fastapi.tiangolo.com), [React](https://react.dev), [Vite](https://vitejs.dev), [Tailwind CSS](https://tailwindcss.com), [Recharts](https://recharts.org), [LangChain / LangGraph](https://www.langchain.com), [scikit-learn](https://scikit-learn.org), [SQLModel](https://sqlmodel.tiangolo.com), and [APScheduler](https://apscheduler.readthedocs.io). LLM inference by [Groq](https://groq.com) (`openai/gpt-oss-120b`), hosting by Render, Netlify, and Neon. Market data from AMIS Punjab and weather data from Open-Meteo. Research sources are listed in [§9](#9-data-sources--citations).
