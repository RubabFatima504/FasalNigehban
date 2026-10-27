# HarvestGuard

AI-powered post-harvest intelligence platform for Pakistani agricultural
cooperatives — monitors harvested crop batches, predicts spoilage risk, and
compares decisions (sell now / store / transport) to protect market value.

## Stack

React 19 + TypeScript + Vite + Tailwind CSS v4, with Leaflet/OpenStreetMap
for the batch map and Recharts for value-curve visualizations.

## Getting started

```bash
npm install
npm run dev      # starts the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build locally
```

## Project structure

- `src/main.tsx` — React entrypoint; mounts `App` and imports global CSS.
- `src/App.tsx` — App shell: responsive sidebar/top bar and screen routing.
- `src/screens/` — One component per screen (Dashboard, New Batch, AI
  Assessment, Scenario Comparator, Report, Regional Impact).
- `src/components/` — Shared UI: `Logo`, `MetricCard`, `RiskBadge`,
  `BatchMap` (Leaflet), `StateViews` (loading/error/empty states).
- `src/context/BatchContext.tsx` — App-wide batch state; every screen reads
  batches through this context instead of managing its own fetch.
- `src/services/api.ts` — **The only file that talks to the backend.**
  Currently returns mock/seeded data behind the same async function
  signatures a real API would have (`fetchBatches`, `createBatch`, etc.).
  Screens and context never touch raw data — only these functions.
- `src/utils/riskEngine.ts` — Deterministic placeholder formulas for
  spoilage risk, pricing, and recommended actions.
- `src/types/index.ts` — Central domain types (`Batch`, `NewBatchInput`,
  `Scenario`, etc.) shared across the whole app.

## Connecting a real backend

Replace the bodies of the functions in `src/services/api.ts` with real
`fetch('/api/...')` calls that return the same shapes defined in
`src/types/index.ts`. Nothing outside that file needs to change — screens,
the batch context, and the risk-display components all consume the typed
`Batch`/`Scenario`/etc. objects, not raw API responses.

## Responsive behavior

- **≥768px (`md`):** sidebar is an inline column, collapsible to an icon
  rail; full search bar in the top bar.
- **<768px:** sidebar becomes an overlay drawer (hamburger toggle, tap
  outside or the × to close); search collapses to an icon button; user
  details and secondary labels hide progressively to keep the top bar
  usable on a phone-width screen.
