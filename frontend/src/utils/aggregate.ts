import type { Batch, DashboardMetrics, DistrictImpact, RegionalSummary } from '../types';

/** Rough baseline "loss prevented" per HIGH/MEDIUM risk batch that was caught early, used only
 *  until the backend can report the real figure from resolved batch outcomes. */
const ASSUMED_LOSS_PREVENTED_PER_KG_HIGH = 18;
const ASSUMED_LOSS_PREVENTED_PER_KG_MEDIUM = 6;

export function computeDashboardMetrics(batches: Batch[]): DashboardMetrics {
  const atRisk = batches.filter(b => b.risk === 'HIGH' || b.risk === 'MEDIUM');
  const atRiskWithin24h = batches.filter(b => b.risk === 'HIGH' && b.hoursToCriticalLoss <= 24);

  const estimatedValueAtRisk = atRisk.reduce(
    (sum, b) => sum + b.estimatedPricePerKg * b.quantityKg * (b.projectedValueLossPct / 100),
    0,
  );

  const lossPreventedThisSeason = batches
    .filter(b => b.risk !== 'LOW')
    .reduce((sum, b) => {
      const perKg = b.risk === 'HIGH' ? ASSUMED_LOSS_PREVENTED_PER_KG_HIGH : ASSUMED_LOSS_PREVENTED_PER_KG_MEDIUM;
      return sum + perKg * b.quantityKg;
    }, 0);

  return {
    totalBatches: batches.length,
    atRiskBatches: atRisk.length,
    atRiskWithin24h: atRiskWithin24h.length,
    estimatedValueAtRisk,
    lossPreventedThisSeason,
  };
}

export function computeRegionalSummary(batches: Batch[]): RegionalSummary {
  const byDistrict = new Map<string, Batch[]>();
  for (const b of batches) {
    const list = byDistrict.get(b.district) ?? [];
    list.push(b);
    byDistrict.set(b.district, list);
  }

  const districts: DistrictImpact[] = Array.from(byDistrict.entries()).map(([district, list]) => {
    const highestRisk = list.some(b => b.risk === 'HIGH')
      ? 'HIGH'
      : list.some(b => b.risk === 'MEDIUM')
        ? 'MEDIUM'
        : 'LOW';
    const valueSaved = list.reduce((sum, b) => {
      const perKg = b.risk === 'HIGH' ? ASSUMED_LOSS_PREVENTED_PER_KG_HIGH : b.risk === 'MEDIUM' ? ASSUMED_LOSS_PREVENTED_PER_KG_MEDIUM : 2;
      return sum + perKg * b.quantityKg;
    }, 0);
    const avgLossReductionPct = Math.round(
      list.reduce((sum, b) => sum + (100 - b.projectedValueLossPct) / 4, 0) / list.length,
    );

    return {
      district,
      risk: highestRisk,
      batchCount: list.length,
      valueSaved,
      avgLossReductionPct,
    };
  });

  districts.sort((a, b) => b.valueSaved - a.valueSaved);

  const totalValueAtRisk = batches.reduce(
    (sum, b) => sum + b.estimatedPricePerKg * b.quantityKg * (b.projectedValueLossPct / 100),
    0,
  );
  const totalValueSaved = districts.reduce((sum, d) => sum + d.valueSaved, 0);
  const avgLossReductionPct = districts.length
    ? Math.round(districts.reduce((sum, d) => sum + d.avgLossReductionPct, 0) / districts.length)
    : 0;

  return {
    totalBatches: batches.length,
    totalValueAtRisk,
    totalValueSaved,
    avgLossReductionPct,
    districts,
    // Monthly trend data isn't derivable from a point-in-time batch list — this stays as
    // seasonal placeholder data until the backend exposes a historical time-series endpoint.
    monthly: [
      { month: 'Apr', without: 62, with: 41 },
      { month: 'May', without: 74, with: 48 },
      { month: 'Jun', without: 78, with: 50 },
      { month: 'Jul', without: 85, with: 52 },
      { month: 'Aug', without: 80, with: 49 },
      { month: 'Sep', without: 60, with: 38 },
    ],
  };
}
