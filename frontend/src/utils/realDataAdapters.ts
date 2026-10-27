import type { RealAssessment, RiskFactor, RiskLevel, Scenario, ValueCurvePoint } from '../types';

/**
 * ============================================================================
 * REAL DATA ADAPTERS
 * ============================================================================
 * Converts the real backend's assessment shape (RealAssessment, attached to
 * a Batch as `batch.real` once POST /assess completes) into the same
 * display types the generic riskEngine.ts functions produce
 * (ValueCurvePoint[], RiskFactor[], Scenario[]) - so the 3 result screens
 * can call these instead of the generic formulas whenever real data is
 * available, without needing different JSX for "real" vs "generic".
 * ============================================================================
 */

function levelFromRiskPct(pct: number): RiskLevel {
  return pct >= 65 ? 'HIGH' : pct >= 35 ? 'MEDIUM' : 'LOW';
}

/** batch.real.curve (day/value_pct/status from the real exponential decay model) -> chart points. */
export function mapRealCurve(real: RealAssessment): ValueCurvePoint[] {
  return real.curve.map(p => ({ day: p.day, value: p.value_pct }));
}

/** batch.real.riskFactors (4 real, crop-specific risk components) -> the 4 risk cards. */
export function mapRealRiskFactors(real: RealAssessment): RiskFactor[] {
  const rf = real.riskFactors;

  const tempLevel = levelFromRiskPct(rf.temperature.risk_pct as number);
  const timeLevel = levelFromRiskPct(rf.time_since_harvest.risk_pct as number);
  const storageLevel = levelFromRiskPct(rf.storage_quality.risk_pct as number);
  const transportLevel = levelFromRiskPct(rf.transport_delay.risk_pct as number);

  const days = rf.time_since_harvest.days as number;
  const hours = rf.transport_delay.hours as number;

  return [
    {
      label: 'Temperature Risk',
      level: tempLevel,
      value: `${rf.temperature.current}°C`,
      sub: `Ideal for this crop: ${rf.temperature.ideal}°C`,
    },
    {
      label: 'Time Since Harvest',
      level: timeLevel,
      value: `${days} day${days === 1 ? '' : 's'}`,
      sub: `Critical quality loss by day ${real.criticalDay}`,
    },
    {
      label: 'Storage Quality',
      level: storageLevel,
      value: String(rf.storage_quality.type).replace(/_/g, ' '),
      sub: storageLevel === 'LOW' ? 'Temperature controlled' : 'Limited/no temperature control',
    },
    {
      label: 'Transport Delay',
      level: transportLevel,
      value: `${hours}h`,
      sub: 'Time to reach target market',
    },
  ];
}

/** batch.real.scenarios (real markets, real AMIS prices, real distances) -> the 3 scenario cards. */
export function mapRealScenarios(real: RealAssessment): Scenario[] {
  return real.scenarios.map(s => ({
    id: s.scenario_id,
    title: s.title,
    sub: s.description,
    pricePerKg: Math.round(s.price_per_kg),
    spoilagePct: Math.round(s.spoilage_risk_pct),
    costPerKg: Math.round((s.transport_cost + s.storage_cost) / Math.max(1, s.effective_quantity_kg)),
    costLabel: s.storage_days > 0 ? 'Storage + Transport' : 'Transport',
    netRevenue: Math.round(s.net_revenue),
    // Backend doesn't return a literal "confidence" score - this is a
    // simple, clearly-derived display heuristic (lower spoilage risk on a
    // scenario reads as a more confident recommendation), not a real model
    // output. Clamped so it never claims near-100% or below-60% certainty.
    confidence: Math.max(60, Math.min(98, Math.round(100 - s.spoilage_risk_pct))),
    recommended: s.is_recommended,
    // v3: forecast warning fields pass through directly
    forecastWarning: s.forecast_warning ?? null,
    forecastAdjusted: s.forecast_adjusted ?? false,
    forecastPenaltyPkr: s.forecast_penalty_pkr,
  }));
}
