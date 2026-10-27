// /**
//  * Central domain types for HarvestGuard.
//  *
//  * Every screen and component imports its shapes from here instead of
//  * declaring its own inline type. When the real backend is connected,
//  * these types should match the API/DB response shape (or a thin mapper
//  * in services/api.ts should translate the API response into these shapes).
//  */

// export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

// /** The logged-in user, as returned by /api/auth/register, /login, and /me. */
// export interface User {
//   id: number;
//   name: string;
//   email: string;
//   cooperative_name?: string;
//   role: string;
// }

// export type StorageType =
//   | 'Open Air / Shade'
//   | 'Covered Shed'
//   | 'Cold Storage'
//   | 'Transport Vehicle';

// /**
//  * Synced with backend/data/crop_profiles.json's actual 5 crop_ids.
//  * 'Mango (Langra)' and 'Rice (Irri-6)' were removed - the backend has
//  * no research data or AMIS pricing for them, so a batch of either would
//  * fail at the AI Assessment step. 'Potato' and 'Tomato' were added since
//  * the backend now supports them with real Pakistani research + live
//  * AMIS pricing.
//  */
// export type CropType =
//   | 'Mango (Sindhri)'
//   | 'Mango (Chaunsa)'
//   | 'Rice (Basmati)'
//   | 'Potato'
//   | 'Tomato';

// /**
//  * ============================================================================
//  * REAL BACKEND ASSESSMENT DATA
//  * ============================================================================
//  * These types mirror the actual shape returned by POST /api/batch/{id}/assess
//  * (spoilage curve, market scenarios, LLM-written analysis with RAG citations).
//  * They're kept separate from the display-oriented Scenario/ValueCurvePoint
//  * types below (which the generic client-side riskEngine.ts also produces),
//  * so screens can tell "this is real AI output" apart from "this is a
//  * generic fallback formula" and prefer the real data whenever it's present.
//  * ============================================================================
//  */

// export interface RealCurvePoint {
//   day: number;
//   value_pct: number;
//   status: 'premium' | 'acceptable' | 'distressed' | 'waste';
// }

// export interface RealRiskFactor {
//   risk_pct: number;
//   [key: string]: number | string; // each factor also carries its own raw value (current/ideal/days/hours/type)
// }

// export interface RealScenario {
//   scenario_id: string;
//   title: string;
//   description: string;
//   market_name: string;
//   market_id: string;
//   distance_km: number;
//   price_per_kg: number;
//   spoilage_risk_pct: number;
//   transport_cost: number;
//   storage_cost: number;
//   storage_days: number;
//   effective_quantity_kg: number;
//   gross_revenue: number;
//   net_revenue: number;
//   quality_grade: string;
//   tag: string;
//   is_recommended: boolean;
// }

// export interface RealAdvisoryReport {
//   executive_summary: string;
//   recommended_action: string;
//   financial_impact: string;
//   supporting_evidence: string;
//   regional_context: string;
// }

// /** The full real assessment, attached to a Batch once POST /assess completes. */
// export interface RealAssessment {
//   weather: { temperature: number; humidity: number; apparent_temp: number };
//   decayRateK: number;
//   criticalDay: number;
//   curve: RealCurvePoint[];
//   riskScore: number;
//   riskLevel: RiskLevel;
//   spoilageAnalysisText: string; // LLM markdown, cites RAG sources (e.g. "Malik et al., 2016")
//   riskFactors: {
//     temperature: RealRiskFactor;
//     time_since_harvest: RealRiskFactor;
//     storage_quality: RealRiskFactor;
//     transport_delay: RealRiskFactor;
//   };
//   scenarios: RealScenario[];
//   recommendedScenarioId: string;
//   marketAnalysisText: string; // LLM markdown
//   nearestMarketName: string;
//   advisory: RealAdvisoryReport;
//   savingsPkr: number;
// }

// /**
//  * A single harvest batch. This is the core entity of the app — the
//  * dashboard table, the map, the AI assessment, the scenario comparator
//  * and the report all derive their view from one or more Batch records.
//  */
// export interface Batch {
//   id: string;
//   crop: CropType;
//   district: string;
//   region: 'Sindh' | 'Punjab';
//   quantityKg: number;
//   harvestDate: string; // ISO date
//   storageType: StorageType;
//   temperatureC: number;
//   humidityPct: number;
//   transportAvailable: boolean;
//   travelToMarketMinutes: number;
//   targetMarket?: string;

//   // Derived / assessed fields (computed by the risk engine, not entered by the user)
//   risk: RiskLevel;
//   estimatedPricePerKg: number;
//   hoursToCriticalLoss: number;
//   projectedValueLossPct: number;
//   recommendedAction: string;
//   createdAt: string; // ISO datetime

//   /**
//    * Present once POST /api/batch/{id}/assess has completed against the
//    * real backend. Screens should prefer this over the client-side
//    * riskEngine.ts formulas whenever it's set. Undefined for batches that
//    * only have the generic mock/summary numbers above (e.g. assessment
//    * still in progress, or backend unreachable).
//    */
//   real?: RealAssessment;
// }

// /** Payload the "New Batch" form collects before the risk engine evaluates it. */
// export type NewBatchInput = Pick<
//   Batch,
//   | 'crop'
//   | 'district'
//   | 'region'
//   | 'quantityKg'
//   | 'harvestDate'
//   | 'storageType'
//   | 'temperatureC'
//   | 'humidityPct'
//   | 'transportAvailable'
//   | 'travelToMarketMinutes'
//   | 'targetMarket'
// >;

// /** One point on a value-retention-over-time curve, used by charts. */
// export interface ValueCurvePoint {
//   day: number;
//   value: number;
// }

// /** One AI "agent" activity entry shown on the assessment screen. */
// export interface AgentActivity {
//   name: string;
//   message: string;
//   delay: number;
// }

// /** One risk factor card on the assessment screen. */
// export interface RiskFactor {
//   label: string;
//   level: RiskLevel;
//   value: string;
//   sub: string;
// }

// /** One decision scenario (sell now / store / transport) for a batch. */
// export interface Scenario {
//   id: string;
//   title: string;
//   sub: string;
//   pricePerKg: number;
//   spoilagePct: number;
//   costPerKg: number;
//   costLabel: string;
//   netRevenue: number;
//   confidence: number;
//   recommended: boolean;
// }

// /** Aggregated dashboard-level metrics, always derived from the batch list. */
// export interface DashboardMetrics {
//   totalBatches: number;
//   atRiskBatches: number;
//   atRiskWithin24h: number;
//   estimatedValueAtRisk: number;
//   lossPreventedThisSeason: number;
// }

// /** Aggregated per-district figures for the Regional Impact screen. */
// export interface DistrictImpact {
//   district: string;
//   risk: RiskLevel;
//   batchCount: number;
//   valueSaved: number;
//   avgLossReductionPct: number;
// }

// /** A monthly point comparing outcomes with vs without HarvestGuard. */
// export interface MonthlyImpactPoint {
//   month: string;
//   without: number;
//   with: number;
// }

// export interface RegionalSummary {
//   totalBatches: number;
//   totalValueAtRisk: number;
//   totalValueSaved: number;
//   avgLossReductionPct: number;
//   districts: DistrictImpact[];
//   monthly: MonthlyImpactPoint[];
// }

/**
 * Central domain types for HarvestGuard.
 *
 * Every screen and component imports its shapes from here instead of
 * declaring its own inline type. When the real backend is connected,
 * these types should match the API/DB response shape (or a thin mapper
 * in services/api.ts should translate the API response into these shapes).
 */

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/** The logged-in user, as returned by /api/auth/register, /login, and /me. */
export interface User {
  id: number;
  name: string;
  email: string;
  cooperative_name?: string;
  role: string;
}

export type StorageType =
  | 'Open Air / Shade'
  | 'Covered Shed'
  | 'Cold Storage'
  | 'Transport Vehicle';

/**
 * Synced with backend/data/crop_profiles.json's actual 5 crop_ids.
 * 'Mango (Langra)' and 'Rice (Irri-6)' were removed - the backend has
 * no research data or AMIS pricing for them, so a batch of either would
 * fail at the AI Assessment step. 'Potato' and 'Tomato' were added since
 * the backend now supports them with real Pakistani research + live
 * AMIS pricing.
 */
export type CropType =
  | 'Mango (Sindhri)'
  | 'Mango (Chaunsa)'
  | 'Rice (Basmati)'
  | 'Potato'
  | 'Tomato';

/**
 * ============================================================================
 * REAL BACKEND ASSESSMENT DATA
 * ============================================================================
 * These types mirror the actual shape returned by POST /api/batch/{id}/assess
 * (spoilage curve, market scenarios, LLM-written analysis with RAG citations).
 * They're kept separate from the display-oriented Scenario/ValueCurvePoint
 * types below (which the generic client-side riskEngine.ts also produces),
 * so screens can tell "this is real AI output" apart from "this is a
 * generic fallback formula" and prefer the real data whenever it's present.
 * ============================================================================
 */

export interface RealCurvePoint {
  day: number;
  value_pct: number;
  status: 'premium' | 'acceptable' | 'distressed' | 'waste';
  temp_used?: number; // forecasted temperature used for this day's decay calculation
}

export interface RealRiskFactor {
  risk_pct: number;
  [key: string]: number | string; // each factor also carries its own raw value (current/ideal/days/hours/type)
}

/** One day of 7-day weather forecast from Open-Meteo (daily aggregation) */
export interface ForecastDay {
  date: string;
  avg_temp: number;
  max_temp: number;
  min_temp: number;
  avg_humidity: number;
  precipitation_mm: number;
  weathercode: number;
  wind_kmh: number;
  precip_probability_pct: number;
}

/** A classified weather hazard event within the 7-day forecast window */
export interface ForecastEvent {
  day_offset: number;  // 0 = today, 1 = tomorrow, etc.
  date: string;
  event_type: 'HEAVY_RAIN' | 'EXTREME_HEAT' | 'HIGH_HUMIDITY' | 'STORM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  affects_transport: boolean;
  affects_open_air: boolean;
}

export interface RealScenario {
  scenario_id: string;
  title: string;
  description: string;
  market_name: string;
  market_id: string;
  distance_km: number;
  price_per_kg: number;
  spoilage_risk_pct: number;
  transport_cost: number;
  storage_cost: number;
  storage_days: number;
  effective_quantity_kg: number;
  gross_revenue: number;
  net_revenue: number;
  quality_grade: string;
  tag: string;
  is_recommended: boolean;
  // Forecast fields (always present after v3 backend, may be null/false if no hazard)
  forecast_warning: ForecastEvent | null;
  forecast_adjusted: boolean;
  forecast_penalty_pkr?: number;
}

export interface RealAdvisoryReport {
  executive_summary: string;
  recommended_action: string;
  financial_impact: string;
  supporting_evidence: string;
  regional_context: string;
  weather_warning?: string; // v3: upcoming weather risk summary
}

/** The full real assessment, attached to a Batch once POST /assess completes. */
export interface RealAssessment {
  weather: { temperature: number; humidity: number; apparent_temp: number };
  forecast: ForecastDay[];          // v3: 7-day daily forecast
  forecastEvents: ForecastEvent[];  // v3: classified hazard events
  decayRateK: number;
  criticalDay: number;
  curve: RealCurvePoint[];
  riskScore: number;
  riskLevel: RiskLevel;
  spoilageAnalysisText: string; // LLM markdown, cites RAG sources (e.g. "Malik et al., 2016")
  riskFactors: {
    temperature: RealRiskFactor;
    time_since_harvest: RealRiskFactor;
    storage_quality: RealRiskFactor;
    transport_delay: RealRiskFactor;
  };
  scenarios: RealScenario[];
  recommendedScenarioId: string;
  marketAnalysisText: string; // LLM markdown
  nearestMarketName: string;
  advisory: RealAdvisoryReport;
  savingsPkr: number;
  forecastDriven?: boolean; // v3: true if curve used variable forecast temperatures
}

/**
 * A single harvest batch. This is the core entity of the app — the
 * dashboard table, the map, the AI assessment, the scenario comparator
 * and the report all derive their view from one or more Batch records.
 */
export interface Batch {
  id: string;
  crop: CropType;
  district: string;
  region: 'Sindh' | 'Punjab';
  quantityKg: number;
  harvestDate: string; // ISO date
  storageType: StorageType;
  temperatureC: number;
  humidityPct: number;
  transportAvailable: boolean;
  travelToMarketMinutes: number;
  targetMarket?: string;

  // Derived / assessed fields (computed by the risk engine, not entered by the user)
  risk: RiskLevel;
  estimatedPricePerKg: number;
  hoursToCriticalLoss: number;
  projectedValueLossPct: number;
  /**
   * True when the batch has already passed its critical-quality-loss day
   * (days_since_harvest >= critical_day from the backend curve). When this
   * is true, hoursToCriticalLoss is clamped to 0 as a "no time left" value,
   * NOT a literal "will lose value in the next 0 hours" - screens must
   * branch on this flag rather than displaying "0 hrs" as if it were a
   * live countdown.
   */
  isAlreadyCritical: boolean;
  /** How many days ago the batch crossed the critical threshold (0 if not yet crossed). */
  daysPastCritical: number;
  recommendedAction: string;
  createdAt: string; // ISO datetime

  /**
   * Present once POST /api/batch/{id}/assess has completed against the
   * real backend. Screens should prefer this over the client-side
   * riskEngine.ts formulas whenever it's set. Undefined for batches that
   * only have the generic mock/summary numbers above (e.g. assessment
   * still in progress, or backend unreachable).
   */
  real?: RealAssessment;
}

/** Payload the "New Batch" form collects before the risk engine evaluates it. */
export type NewBatchInput = Pick<
  Batch,
  | 'crop'
  | 'district'
  | 'region'
  | 'quantityKg'
  | 'harvestDate'
  | 'storageType'
  | 'temperatureC'
  | 'humidityPct'
  | 'transportAvailable'
  | 'travelToMarketMinutes'
  | 'targetMarket'
>;

/** One point on a value-retention-over-time curve, used by charts. */
export interface ValueCurvePoint {
  day: number;
  value: number;
}

/** One AI "agent" activity entry shown on the assessment screen. */
export interface AgentActivity {
  name: string;
  message: string;
  delay: number;
}

/** One risk factor card on the assessment screen. */
export interface RiskFactor {
  label: string;
  level: RiskLevel;
  value: string;
  sub: string;
}

/** One decision scenario (sell now / store / transport) for a batch. */
export interface Scenario {
  id: string;
  title: string;
  sub: string;
  pricePerKg: number;
  spoilagePct: number;
  costPerKg: number;
  costLabel: string;
  netRevenue: number;
  confidence: number;
  recommended: boolean;
  // v3: forecast warning fields (present when backend returns real assessment)
  forecastWarning?: ForecastEvent | null;
  forecastAdjusted?: boolean;
  forecastPenaltyPkr?: number;
}

/** Aggregated dashboard-level metrics, always derived from the batch list. */
export interface DashboardMetrics {
  totalBatches: number;
  atRiskBatches: number;
  atRiskWithin24h: number;
  estimatedValueAtRisk: number;
  lossPreventedThisSeason: number;
}

/** Aggregated per-district figures for the Regional Impact screen. */
export interface DistrictImpact {
  district: string;
  risk: RiskLevel;
  batchCount: number;
  valueSaved: number;
  avgLossReductionPct: number;
}

/** A monthly point comparing outcomes with vs without HarvestGuard. */
export interface MonthlyImpactPoint {
  month: string;
  without: number;
  with: number;
}

export interface RegionalSummary {
  totalBatches: number;
  totalValueAtRisk: number;
  totalValueSaved: number;
  avgLossReductionPct: number;
  districts: DistrictImpact[];
  monthly: MonthlyImpactPoint[];
}