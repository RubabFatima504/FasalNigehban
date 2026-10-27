// import type { Batch, CropType, NewBatchInput, RealAssessment, StorageType, User } from '../types';
// import { DISTRICT_COORDS } from '../components/BatchMap';

// /**
//  * ============================================================================
//  * AUTH TOKEN
//  * ============================================================================
//  * fetchJson() (used by every call in this file, auth included) needs the
//  * current JWT, but this module has no React context access. AuthContext is
//  * the source of truth for the token and calls setAuthToken() whenever it
//  * changes (on login, on mount from localStorage, on logout) so this module
//  * always has the latest value without needing to be a React component.
//  * ============================================================================
//  */
// let authToken: string | null = localStorage.getItem('hg_token');

// export function setAuthToken(token: string | null) {
//   authToken = token;
//   if (token) localStorage.setItem('hg_token', token);
//   else localStorage.removeItem('hg_token');
// }

// /** Set by AuthContext. Called whenever a request comes back 401 — token is invalid/expired. */
// let onUnauthorized: (() => void) | null = null;
// export function setUnauthorizedHandler(handler: (() => void) | null) {
//   onUnauthorized = handler;
// }

// /**
//  * ============================================================================
//  * REAL API LAYER
//  * ============================================================================
//  * Talks to the actual HarvestGuard FastAPI backend. Screens and BatchContext
//  * still only ever call fetchBatches / fetchBatchById / createBatch — their
//  * signatures and returned Batch shape are unchanged, so nothing outside this
//  * file (except the 3 result screens, which now also read batch.real when
//  * present) needed to change to go from mock to real.
//  *
//  * Design notes:
//  * - The backend splits "register" and "assess" into two separate calls
//  *   (POST /api/batch, then POST /api/batch/{id}/assess) because assess runs
//  *   a multi-agent LLM pipeline and can take 10-30 seconds. createBatch()
//  *   below does both, so callers still see one awaitable call.
//  * - No fake seed batches here (unlike the old mock). The dashboard starts
//  *   empty until a real batch is created - showing fabricated batches next
//  *   to real AI-assessed ones would be misleading.
//  * - batchStore is a session-local cache (the backend itself is in-memory
//  *   and resets on restart, so there's no persistent list to page through
//  *   anyway). fetchBatchById falls back to the real API if a batch isn't in
//  *   the local cache (e.g. after a page refresh).
//  * ============================================================================
//  */

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// /** Maps our display crop names to the backend's crop_id (crop_profiles.json). */
// const CROP_ID_MAP: Record<CropType, string> = {
//   'Mango (Sindhri)': 'mango_sindhri',
//   'Mango (Chaunsa)': 'mango_chaunsa',
//   'Rice (Basmati)': 'rice_basmati',
//   Potato: 'potato',
//   Tomato: 'tomato',
// };

// /**
//  * Maps our display storage types to the backend's storage_type slugs.
//  * 'Transport Vehicle' has no direct backend equivalent (no distinct
//  * "in-transit" storage_profile exists in crop_profiles.json) - it's
//  * mapped to 'open_air' as the closest realistic analog (no active
//  * climate control), which is an approximation worth revisiting if a
//  * refrigerated-transport profile is added to the backend later.
//  */
// const STORAGE_TYPE_MAP: Record<StorageType, string> = {
//   'Open Air / Shade': 'open_air',
//   'Covered Shed': 'covered_shed',
//   'Cold Storage': 'cold_storage',
//   'Transport Vehicle': 'open_air',
// };

// let batchStore: Batch[] = [];

// /**
//  * GET /api/batches — the real per-user list from the backend, each merged
//  * with its assessment (if one has run) so the dashboard can show risk/value
//  * numbers without a second round-trip per batch. Replaces the local cache
//  * entirely on every call so a fresh login/reload reflects the DB, not
//  * whatever happened to be created earlier in this browser session.
//  */
// export async function fetchBatches(): Promise<Batch[]> {
//   const rawBatches: any[] = await fetchJson('/api/batches');

//   const batches = await Promise.all(
//     rawBatches.map(async raw => {
//       const assessment = await fetchJson(`/api/batch/${raw.batch_id}/assessment`).catch(() => null);
//       return buildBatchFromBackend(raw, assessment);
//     }),
//   );

//   batchStore = batches;
//   return [...batchStore];
// }

// /** GET /batches/:id — checks the local cache first, falls back to the API. */
// export async function fetchBatchById(id: string): Promise<Batch | undefined> {
//   const cached = batchStore.find(b => b.id === id);
//   if (cached) return cached;

//   try {
//     const [batchRes, assessmentRes] = await Promise.all([
//       fetchJson(`/api/batch/${id}`),
//       fetchJson(`/api/batch/${id}/assessment`).catch(() => null), // may not exist yet
//     ]);
//     const batch = buildBatchFromBackend(batchRes, assessmentRes);
//     batchStore = [batch, ...batchStore];
//     return batch;
//   } catch {
//     return undefined;
//   }
// }

// /**
//  * POST /api/batch then POST /api/batch/{id}/assess — registers the batch
//  * and runs the real multi-agent assessment (spoilage curve, market
//  * scenarios, LLM advisory with RAG citations), then maps the combined
//  * result into a single Batch object.
//  */
// export async function createBatch(input: NewBatchInput): Promise<Batch> {
//   const cropId = CROP_ID_MAP[input.crop];
//   const [lat, lng] = DISTRICT_COORDS[input.district] ?? DISTRICT_COORDS[`${input.district}, ${input.region}`] ?? [30.3753, 69.3451];

//   const createPayload = {
//     crop_id: cropId,
//     quantity_kg: input.quantityKg,
//     harvest_date: input.harvestDate,
//     location_district: input.district,
//     location_province: input.region,
//     latitude: lat,
//     longitude: lng,
//     storage_type: STORAGE_TYPE_MAP[input.storageType],
//     current_temp_celsius: input.temperatureC,
//     transport_available: input.transportAvailable,
//     hours_to_nearest_market: input.transportAvailable ? input.travelToMarketMinutes / 60 : 0,
//     target_market_id: input.targetMarket || undefined,
//   };

//   const created = await fetchJson('/api/batch', { method: 'POST', body: createPayload });
//   const batchId: string = created.batch_id;

//   // This call runs the real multi-agent LLM pipeline - give it much longer
//   // than a normal request before giving up.
//   const assessment = await fetchJson(`/api/batch/${batchId}/assess`, { method: 'POST', timeoutMs: 90_000 });

//   if (assessment.status === 'error') {
//     throw new Error(assessment.error ?? 'Assessment failed - the backend could not complete this batch.');
//   }

//   const batch = buildBatchFromBackend(
//     { ...created, ...createPayload, batch_id: batchId },
//     assessment,
//     input,
//   );
//   batchStore = [batch, ...batchStore];
//   return batch;
// }

// // ---------------------------------------------------------------------------
// // Internal helpers
// // ---------------------------------------------------------------------------

// async function fetchJson(
//   path: string,
//   opts: { method?: string; body?: unknown; timeoutMs?: number; skipAuth?: boolean } = {},
// ): Promise<any> {
//   const controller = new AbortController();
//   const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120_000);

//   const headers: Record<string, string> = {};
//   if (opts.body) headers['Content-Type'] = 'application/json';
//   if (authToken && !opts.skipAuth) headers['Authorization'] = `Bearer ${authToken}`;

//   try {
//     const res = await fetch(`${API_BASE_URL}${path}`, {
//       method: opts.method ?? 'GET',
//       headers: Object.keys(headers).length ? headers : undefined,
//       body: opts.body ? JSON.stringify(opts.body) : undefined,
//       signal: controller.signal,
//     });
//     if (!res.ok) {
//       // A 401 on an authenticated request means the token is missing/invalid/expired.
//       // Login and Register calls pass skipAuth and handle their own 401s (wrong
//       // password etc.), so they're excluded from triggering the global logout.
//       if (res.status === 401 && !opts.skipAuth) {
//         onUnauthorized?.();
//       }
//       const detail = await res.json().catch(() => null);
//       throw new Error(detail?.detail ?? `Request to ${path} failed (${res.status})`);
//     }
//     return res.json();
//   } finally {
//     clearTimeout(timeout);
//   }
// }

// // ---------------------------------------------------------------------------
// // Auth
// // ---------------------------------------------------------------------------

// export interface AuthResult {
//   access_token: string;
//   token_type: string;
//   user: User;
// }

// export function registerUser(input: {
//   name: string;
//   email: string;
//   password: string;
//   cooperative_name?: string;
// }): Promise<AuthResult> {
//   return fetchJson('/api/auth/register', { method: 'POST', body: input, skipAuth: true });
// }

// export function loginUser(email: string, password: string): Promise<AuthResult> {
//   return fetchJson('/api/auth/login', { method: 'POST', body: { email, password }, skipAuth: true });
// }

// export function fetchMe(): Promise<User> {
//   return fetchJson('/api/auth/me');
// }

// /**
//  * Turns the backend's raw batch record + /assess response into the Batch
//  * shape every screen expects. `input` is only available right after
//  * createBatch() submits the form (it carries the exact NewBatchInput the
//  * user typed); for fetchBatchById()'s cold-cache-miss path we reconstruct
//  * the display fields from the backend record itself instead.
//  */
// function buildBatchFromBackend(backendBatch: any, assessment: any, input?: NewBatchInput): Batch {
//   const spoilage = assessment?.spoilage;
//   const market = assessment?.market;
//   const advisory = assessment?.advisory;
//   const curveData = spoilage?.curve_data;

//   const recommended: any = market?.scenarios?.find((s: any) => s.is_recommended) ?? market?.scenarios?.[0];

//   const daysSinceHarvest: number = curveData?.days_since_harvest ?? 0;
//   const criticalDay: number = curveData?.critical_day ?? 14;
//   const remainingDays = Math.max(0, criticalDay - daysSinceHarvest);

//   const real: RealAssessment | undefined = assessment
//     ? {
//       weather: spoilage.weather,
//       decayRateK: curveData.decay_rate_k,
//       criticalDay,
//       curve: curveData.curve,
//       riskScore: spoilage.risk_score,
//       riskLevel: spoilage.risk_level,
//       spoilageAnalysisText: spoilage.analysis,
//       riskFactors: spoilage.risk_factors,
//       scenarios: market.scenarios,
//       recommendedScenarioId: market.recommended_scenario,
//       marketAnalysisText: market.analysis,
//       nearestMarketName: market.nearest_market?.market_name ?? '',
//       advisory: advisory.report,
//       savingsPkr: advisory.savings_pkr,
//     }
//     : undefined;

//   return {
//     id: backendBatch.batch_id ?? backendBatch.id,
//     crop: input?.crop ?? reverseCropId(backendBatch.crop_id),
//     district: backendBatch.location_district ?? input?.district ?? '',
//     region: (backendBatch.location_province as 'Sindh' | 'Punjab') ?? input?.region ?? 'Punjab',
//     quantityKg: backendBatch.quantity_kg,
//     harvestDate: backendBatch.harvest_date,
//     storageType: input?.storageType ?? reverseStorageType(backendBatch.storage_type),
//     temperatureC: backendBatch.current_temp_celsius ?? input?.temperatureC ?? 0,
//     humidityPct: real?.weather.humidity ?? input?.humidityPct ?? 0,
//     transportAvailable: backendBatch.transport_available ?? true,
//     travelToMarketMinutes: input?.travelToMarketMinutes ?? (backendBatch.hours_to_nearest_market ?? 0) * 60,
//     targetMarket: backendBatch.target_market_id || undefined,

//     risk: real?.riskLevel ?? 'MEDIUM',
//     estimatedPricePerKg: recommended?.price_per_kg ?? 0,
//     hoursToCriticalLoss: remainingDays * 24,
//     projectedValueLossPct: 100 - (curveData?.current_value_pct ?? 100),
//     recommendedAction: advisory?.recommended_action ?? '',
//     createdAt: new Date().toISOString(),

//     real,
//   };
// }

// function reverseCropId(cropId: string): CropType {
//   const entry = Object.entries(CROP_ID_MAP).find(([, id]) => id === cropId);
//   return (entry?.[0] as CropType) ?? 'Mango (Sindhri)';
// }

// function reverseStorageType(storageType: string): StorageType {
//   const entry = Object.entries(STORAGE_TYPE_MAP).find(([, id]) => id === storageType);
//   return (entry?.[0] as StorageType) ?? 'Open Air / Shade';
// }



import type { Batch, CropType, NewBatchInput, RealAssessment, StorageType, User } from '../types';
import { DISTRICT_COORDS } from '../components/BatchMap';

/**
 * ============================================================================
 * AUTH TOKEN
 * ============================================================================
 * fetchJson() (used by every call in this file, auth included) needs the
 * current JWT, but this module has no React context access. AuthContext is
 * the source of truth for the token and calls setAuthToken() whenever it
 * changes (on login, on mount from localStorage, on logout) so this module
 * always has the latest value without needing to be a React component.
 * ============================================================================
 */
let authToken: string | null = localStorage.getItem('hg_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('hg_token', token);
  else localStorage.removeItem('hg_token');
}

/** Set by AuthContext. Called whenever a request comes back 401 — token is invalid/expired. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/**
 * ============================================================================
 * REAL API LAYER
 * ============================================================================
 * Talks to the actual HarvestGuard FastAPI backend. Screens and BatchContext
 * still only ever call fetchBatches / fetchBatchById / createBatch — their
 * signatures and returned Batch shape are unchanged, so nothing outside this
 * file (except the 3 result screens, which now also read batch.real when
 * present) needed to change to go from mock to real.
 *
 * Design notes:
 * - The backend splits "register" and "assess" into two separate calls
 *   (POST /api/batch, then POST /api/batch/{id}/assess) because assess runs
 *   a multi-agent LLM pipeline and can take 10-30 seconds. createBatch()
 *   below does both, so callers still see one awaitable call.
 * - No fake seed batches here (unlike the old mock). The dashboard starts
 *   empty until a real batch is created - showing fabricated batches next
 *   to real AI-assessed ones would be misleading.
 * - batchStore is a session-local cache (the backend itself is in-memory
 *   and resets on restart, so there's no persistent list to page through
 *   anyway). fetchBatchById falls back to the real API if a batch isn't in
 *   the local cache (e.g. after a page refresh).
 * ============================================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

/** Maps our display crop names to the backend's crop_id (crop_profiles.json). */
const CROP_ID_MAP: Record<CropType, string> = {
  'Mango (Sindhri)': 'mango_sindhri',
  'Mango (Chaunsa)': 'mango_chaunsa',
  'Rice (Basmati)': 'rice_basmati',
  Potato: 'potato',
  Tomato: 'tomato',
};

/**
 * Maps our display storage types to the backend's storage_type slugs.
 * 'Transport Vehicle' has no direct backend equivalent (no distinct
 * "in-transit" storage_profile exists in crop_profiles.json) - it's
 * mapped to 'open_air' as the closest realistic analog (no active
 * climate control), which is an approximation worth revisiting if a
 * refrigerated-transport profile is added to the backend later.
 */
const STORAGE_TYPE_MAP: Record<StorageType, string> = {
  'Open Air / Shade': 'open_air',
  'Covered Shed': 'covered_shed',
  'Cold Storage': 'cold_storage',
  'Transport Vehicle': 'open_air',
};

let batchStore: Batch[] = [];

/**
 * GET /api/batches — the real per-user list from the backend, each merged
 * with its assessment (if one has run) so the dashboard can show risk/value
 * numbers without a second round-trip per batch. Replaces the local cache
 * entirely on every call so a fresh login/reload reflects the DB, not
 * whatever happened to be created earlier in this browser session.
 */
export async function fetchBatches(): Promise<Batch[]> {
  const rawBatches: any[] = await fetchJson('/api/batches');

  const batches = await Promise.all(
    rawBatches.map(async raw => {
      const assessment = await fetchJson(`/api/batch/${raw.batch_id}/assessment`).catch(() => null);
      return buildBatchFromBackend(raw, assessment);
    }),
  );

  batchStore = batches;
  return [...batchStore];
}

/** GET /batches/:id — checks the local cache first, falls back to the API. */
export async function fetchBatchById(id: string): Promise<Batch | undefined> {
  const cached = batchStore.find(b => b.id === id);
  if (cached) return cached;

  try {
    const [batchRes, assessmentRes] = await Promise.all([
      fetchJson(`/api/batch/${id}`),
      fetchJson(`/api/batch/${id}/assessment`).catch(() => null), // may not exist yet
    ]);
    const batch = buildBatchFromBackend(batchRes, assessmentRes);
    batchStore = [batch, ...batchStore];
    return batch;
  } catch {
    return undefined;
  }
}

/**
 * POST /api/batch then POST /api/batch/{id}/assess — registers the batch
 * and runs the real multi-agent assessment (spoilage curve, market
 * scenarios, LLM advisory with RAG citations), then maps the combined
 * result into a single Batch object.
 */
export async function createBatch(input: NewBatchInput): Promise<Batch> {
  const cropId = CROP_ID_MAP[input.crop];
  const [lat, lng] = DISTRICT_COORDS[input.district] ?? DISTRICT_COORDS[`${input.district}, ${input.region}`] ?? [30.3753, 69.3451];

  const createPayload = {
    crop_id: cropId,
    quantity_kg: input.quantityKg,
    harvest_date: input.harvestDate,
    location_district: input.district,
    location_province: input.region,
    latitude: lat,
    longitude: lng,
    storage_type: STORAGE_TYPE_MAP[input.storageType],
    current_temp_celsius: input.temperatureC,
    transport_available: input.transportAvailable,
    hours_to_nearest_market: input.transportAvailable ? input.travelToMarketMinutes / 60 : 0,
    target_market_id: input.targetMarket || undefined,
  };

  const created = await fetchJson('/api/batch', { method: 'POST', body: createPayload });
  const batchId: string = created.batch_id;

  // This call runs the real multi-agent LLM pipeline - give it much longer
  // than a normal request before giving up.
  const assessment = await fetchJson(`/api/batch/${batchId}/assess`, { method: 'POST', timeoutMs: 90_000 });

  if (assessment.status === 'error') {
    throw new Error(assessment.error ?? 'Assessment failed - the backend could not complete this batch.');
  }

  const batch = buildBatchFromBackend(
    { ...created, ...createPayload, batch_id: batchId },
    assessment,
    input,
  );
  batchStore = [batch, ...batchStore];
  return batch;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function fetchJson(
  path: string,
  opts: { method?: string; body?: unknown; timeoutMs?: number; skipAuth?: boolean } = {},
): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20_000);

  const headers: Record<string, string> = {};
  if (opts.body) headers['Content-Type'] = 'application/json';
  if (authToken && !opts.skipAuth) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: Object.keys(headers).length ? headers : undefined,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      // A 401 on an authenticated request means the token is missing/invalid/expired.
      // Login and Register calls pass skipAuth and handle their own 401s (wrong
      // password etc.), so they're excluded from triggering the global logout.
      if (res.status === 401 && !opts.skipAuth) {
        onUnauthorized?.();
      }
      const detail = await res.json().catch(() => null);
      throw new Error(detail?.detail ?? `Request to ${path} failed (${res.status})`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface AuthResult {
  access_token: string;
  token_type: string;
  user: User;
}

export function registerUser(input: {
  name: string;
  email: string;
  password: string;
  cooperative_name?: string;
}): Promise<AuthResult> {
  return fetchJson('/api/auth/register', { method: 'POST', body: input, skipAuth: true });
}

export function loginUser(email: string, password: string): Promise<AuthResult> {
  return fetchJson('/api/auth/login', { method: 'POST', body: { email, password }, skipAuth: true });
}

export function fetchMe(): Promise<User> {
  return fetchJson('/api/auth/me');
}

export function updateMe(input: { name?: string; cooperative_name?: string }): Promise<User> {
  return fetchJson('/api/auth/me', { method: 'PATCH', body: input });
}

/**
 * Turns the backend's raw batch record + /assess response into the Batch
 * shape every screen expects. `input` is only available right after
 * createBatch() submits the form (it carries the exact NewBatchInput the
 * user typed); for fetchBatchById()'s cold-cache-miss path we reconstruct
 * the display fields from the backend record itself instead.
 */
function buildBatchFromBackend(backendBatch: any, assessment: any, input?: NewBatchInput): Batch {
  const spoilage = assessment?.spoilage;
  const market = assessment?.market;
  const advisory = assessment?.advisory;
  const curveData = spoilage?.curve_data;

  const recommended: any = market?.scenarios?.find((s: any) => s.is_recommended) ?? market?.scenarios?.[0];

  const daysSinceHarvest: number = curveData?.days_since_harvest ?? 0;
  const criticalDay: number = curveData?.critical_day ?? 14;
  const remainingDays = Math.max(0, criticalDay - daysSinceHarvest);
  // criticalDay - daysSinceHarvest goes negative once the batch has already
  // passed its critical day (clamped to 0 above for hoursToCriticalLoss).
  // That 0 looks identical to "critical loss happens in the next instant"
  // if a screen just prints hoursToCriticalLoss - track the past/future
  // distinction explicitly so screens can render "already exceeded X days
  // ago" instead of a misleading "0h 0m" countdown.
  const isAlreadyCritical = daysSinceHarvest >= criticalDay;
  const daysPastCritical = Math.max(0, daysSinceHarvest - criticalDay);

  const real: RealAssessment | undefined = assessment
    ? {
      weather: spoilage.weather,
      // v3: map forecast data from spoilage agent result
      forecast: spoilage.forecast ?? [],
      forecastEvents: spoilage.forecast_events ?? [],
      forecastDriven: spoilage.curve_data?.forecast_driven ?? false,
      decayRateK: curveData.decay_rate_k,
      criticalDay,
      curve: curveData.curve,
      riskScore: spoilage.risk_score,
      riskLevel: spoilage.risk_level,
      spoilageAnalysisText: spoilage.analysis,
      riskFactors: spoilage.risk_factors,
      scenarios: market.scenarios,
      recommendedScenarioId: market.recommended_scenario,
      marketAnalysisText: market.analysis,
      nearestMarketName: market.nearest_market?.market_name ?? '',
      advisory: advisory.report,
      savingsPkr: advisory.savings_pkr,
    }
    : undefined;

  return {
    id: backendBatch.batch_id ?? backendBatch.id,
    crop: input?.crop ?? reverseCropId(backendBatch.crop_id),
    district: backendBatch.location_district ?? input?.district ?? '',
    region: (backendBatch.location_province as 'Sindh' | 'Punjab') ?? input?.region ?? 'Punjab',
    quantityKg: backendBatch.quantity_kg,
    harvestDate: backendBatch.harvest_date,
    storageType: input?.storageType ?? reverseStorageType(backendBatch.storage_type),
    temperatureC: backendBatch.current_temp_celsius ?? input?.temperatureC ?? 0,
    humidityPct: real?.weather.humidity ?? input?.humidityPct ?? 0,
    transportAvailable: backendBatch.transport_available ?? true,
    travelToMarketMinutes: input?.travelToMarketMinutes ?? (backendBatch.hours_to_nearest_market ?? 0) * 60,
    targetMarket: backendBatch.target_market_id || undefined,

    risk: real?.riskLevel ?? 'MEDIUM',
    estimatedPricePerKg: recommended?.price_per_kg ?? 0,
    hoursToCriticalLoss: remainingDays * 24,
    isAlreadyCritical,
    daysPastCritical,
    projectedValueLossPct: 100 - (curveData?.current_value_pct ?? 100),
    recommendedAction: advisory?.recommended_action ?? '',
    createdAt: new Date().toISOString(),

    real,
  };
}

function reverseCropId(cropId: string): CropType {
  const entry = Object.entries(CROP_ID_MAP).find(([, id]) => id === cropId);
  return (entry?.[0] as CropType) ?? 'Mango (Sindhri)';
}

function reverseStorageType(storageType: string): StorageType {
  const entry = Object.entries(STORAGE_TYPE_MAP).find(([, id]) => id === storageType);
  return (entry?.[0] as StorageType) ?? 'Open Air / Shade';
}
