// import type {
//   AgentActivity,
//   Batch,
//   NewBatchInput,
//   RiskFactor,
//   RiskLevel,
//   Scenario,
//   ValueCurvePoint,
// } from '../types';

// /**
//  * This file is the ONLY place that turns raw batch inputs into risk /
//  * price / recommendation numbers. Today it's a deterministic formula
//  * standing in for a real model. When the backend AI service is ready,
//  * replace the body of `assessBatch` with a call to that service and
//  * every screen that consumes a `Batch` keeps working unchanged, because
//  * they only ever read the resulting fields off the `Batch` object.
//  */

// const BASE_PRICE_PER_KG: Record<Batch['crop'], number> = {
//   'Mango (Sindhri)': 45,
//   'Mango (Chaunsa)': 40,
//   'Mango (Langra)': 42,
//   'Rice (Basmati)': 12,
//   'Rice (Irri-6)': 8,
// };

// /** Crops with a short shelf life spoil far faster than grains under heat. */
// const PERISHABILITY: Record<Batch['crop'], number> = {
//   'Mango (Sindhri)': 1,
//   'Mango (Chaunsa)': 1,
//   'Mango (Langra)': 1,
//   'Rice (Basmati)': 0.05,
//   'Rice (Irri-6)': 0.05,
// };

// const STORAGE_PROTECTION: Record<Batch['storageType'], number> = {
//   'Cold Storage': 0.85,
//   'Covered Shed': 0.4,
//   'Transport Vehicle': 0.25,
//   'Open Air / Shade': 0,
// };

// function clamp(value: number, min: number, max: number) {
//   return Math.min(max, Math.max(min, value));
// }

// /** Risk score 0–100 from temperature, storage protection and perishability. */
// function computeRiskScore(input: NewBatchInput): number {
//   const perishability = PERISHABILITY[input.crop];
//   const protection = STORAGE_PROTECTION[input.storageType];
//   const heatFactor = clamp((input.temperatureC - 20) / 20, 0, 1.5); // >20°C starts to matter
//   const humidityFactor = clamp((input.humidityPct - 50) / 100, 0, 0.5);

//   const rawScore =
//     (heatFactor * 55 + humidityFactor * 15) * perishability * (1 - protection) +
//     (perishability > 0.5 ? 10 : 2); // perishable crops carry a baseline risk

//   return clamp(Math.round(rawScore), 2, 98);
// }

// function riskLevelFromScore(score: number): RiskLevel {
//   if (score >= 55) return 'HIGH';
//   if (score >= 25) return 'MEDIUM';
//   return 'LOW';
// }

// function hoursToCriticalLoss(score: number, perishability: number): number {
//   if (perishability < 0.5) {
//     // Grains: expressed in "days" elsewhere, but we still return hours here for consistency.
//     return clamp(Math.round(2000 - score * 15), 480, 3000);
//   }
//   // Perishable crops: higher score -> fewer hours until critical loss.
//   return clamp(Math.round(96 - score * 0.9), 4, 96);
// }

// function recommendedActionFor(risk: RiskLevel, storageType: Batch['storageType']): string {
//   if (risk === 'HIGH') {
//     return storageType === 'Cold Storage' ? 'Sell Immediately' : 'Cold Storage Urgent';
//   }
//   if (risk === 'MEDIUM') {
//     return storageType === 'Cold Storage' ? 'Continue Storage' : 'Move to Cold Storage';
//   }
//   return 'Continue Storage';
// }

// /** Formats an hour count into either "Xh" or "X days" depending on scale, for table display. */
// export function formatTimeWindow(hours: number): string {
//   if (hours < 48) return `${hours} hrs`;
//   const days = hours / 24;
//   return `${days % 1 === 0 ? days.toFixed(0) : days.toFixed(1)} days`;
// }

// /**
//  * Turns a raw NewBatchInput into a fully assessed Batch, the same way a
//  * backend endpoint like `POST /batches` would return the created record
//  * with server-computed fields filled in.
//  */
// export function assessBatch(input: NewBatchInput, id: string): Batch {
//   const score = computeRiskScore(input);
//   const risk = riskLevelFromScore(score);
//   const perishability = PERISHABILITY[input.crop];
//   const basePrice = BASE_PRICE_PER_KG[input.crop];

//   return {
//     ...input,
//     id,
//     risk,
//     estimatedPricePerKg: basePrice,
//     hoursToCriticalLoss: hoursToCriticalLoss(score, perishability),
//     projectedValueLossPct: clamp(Math.round(score * 0.7), 2, 65),
//     recommendedAction: recommendedActionFor(risk, input.storageType),
//     createdAt: new Date().toISOString(),
//   };
// }

// /** Builds the value-retention curve shown on the Assessment and Report screens for a given batch. */
// export function buildValueCurve(batch: Batch): ValueCurvePoint[] {
//   const perishability = PERISHABILITY[batch.crop];
//   const decayRate = perishability > 0.5 ? 0.45 + batch.projectedValueLossPct / 200 : 0.02;
//   const points: ValueCurvePoint[] = [];
//   const step = perishability > 0.5 ? 0.5 : 20;
//   const span = perishability > 0.5 ? 5 : 120;

//   for (let day = 0; day <= span; day += step) {
//     const value = 100 * Math.exp(-decayRate * day);
//     points.push({ day, value: Math.max(0, Math.round(value)) });
//   }
//   return points;
// }

// /** Builds the risk-factor cards on the Assessment screen from the batch's own fields. */
// export function buildRiskFactors(batch: Batch): RiskFactor[] {
//   const heatRisk: RiskLevel = batch.temperatureC >= 33 ? 'HIGH' : batch.temperatureC >= 27 ? 'MEDIUM' : 'LOW';
//   const storageRisk: RiskLevel =
//     batch.storageType === 'Open Air / Shade' ? 'HIGH' : batch.storageType === 'Cold Storage' ? 'LOW' : 'MEDIUM';
//   const transportRisk: RiskLevel = !batch.transportAvailable
//     ? 'HIGH'
//     : batch.travelToMarketMinutes > 240
//       ? 'MEDIUM'
//       : 'LOW';
//   const daysSinceHarvest = Math.max(
//     0,
//     Math.round((Date.now() - new Date(batch.harvestDate).getTime()) / 86400000),
//   );
//   const harvestRisk: RiskLevel = daysSinceHarvest >= 3 ? 'HIGH' : daysSinceHarvest >= 1 ? 'MEDIUM' : 'LOW';

//   return [
//     {
//       label: 'Temperature Risk',
//       level: heatRisk,
//       value: `${batch.temperatureC}°C`,
//       sub: heatRisk === 'HIGH' ? 'Above recommended handling temp' : 'Within tolerable range',
//     },
//     {
//       label: 'Time Since Harvest',
//       level: harvestRisk,
//       value: daysSinceHarvest <= 0 ? 'Today' : `${daysSinceHarvest} day${daysSinceHarvest > 1 ? 's' : ''}`,
//       sub: harvestRisk === 'HIGH' ? 'Well past the initial window' : 'Within initial window',
//     },
//     {
//       label: 'Storage Quality',
//       level: storageRisk,
//       value: batch.storageType,
//       sub: storageRisk === 'LOW' ? 'Temperature controlled' : 'No temperature control',
//     },
//     {
//       label: 'Transport Delay',
//       level: transportRisk,
//       value: batch.transportAvailable ? `${Math.round(batch.travelToMarketMinutes / 60)}h ${batch.travelToMarketMinutes % 60}m` : 'Unavailable',
//       sub: batch.transportAvailable ? 'Market access available' : 'No transport arranged',
//     },
//   ];
// }

// /** Builds the "AI agent" narrative shown while an assessment is generated. */
// export function buildAgentActivity(batch: Batch): AgentActivity[] {
//   return [
//     {
//       name: 'Spoilage Analyst',
//       message: `Analyzed heat exposure and retrieved shelf-life data for ${batch.crop}.`,
//       delay: 400,
//     },
//     {
//       name: 'Market Intelligence',
//       message: `Compared ${batch.district} and nearby wholesale market conditions.`,
//       delay: 900,
//     },
//     {
//       name: 'Advisory Agent',
//       message: 'Combined spoilage and market findings to generate the recommended action.',
//       delay: 1400,
//     },
//   ];
// }

// /** Builds the three decision scenarios (sell now / store / transport) for a batch. */
// export function buildScenarios(batch: Batch): Scenario[] {
//   const base = batch.estimatedPricePerKg;
//   const qty = batch.quantityKg;

//   const sellToday: Scenario = {
//     id: 'A',
//     title: 'Sell Today',
//     sub: 'Nearest market',
//     pricePerKg: base,
//     spoilagePct: 5,
//     costPerKg: 0,
//     costLabel: 'Transport',
//     netRevenue: Math.round(base * qty * 0.95),
//     confidence: 94,
//     recommended: false,
//   };

//   const storeCost = base * 0.07;
//   const storePrice = base * 1.38;
//   const store: Scenario = {
//     id: 'B',
//     title: 'Store 2 Days',
//     sub: 'Cold storage → city market',
//     pricePerKg: Math.round(storePrice),
//     spoilagePct: 15,
//     costPerKg: Math.round(storeCost),
//     costLabel: 'Storage',
//     netRevenue: Math.round((storePrice - storeCost) * qty * 0.85),
//     confidence: 89,
//     recommended: false,
//   };

//   const transportCost = base * 0.18;
//   const transportPrice = base * 1.56;
//   const transport: Scenario = {
//     id: 'C',
//     title: 'Transport Immediately',
//     sub: 'Distant premium market',
//     pricePerKg: Math.round(transportPrice),
//     spoilagePct: 25,
//     costPerKg: Math.round(transportCost),
//     costLabel: 'Transport',
//     netRevenue: Math.round((transportPrice - transportCost) * qty * 0.75),
//     confidence: 81,
//     recommended: false,
//   };

//   const scenarios = [sellToday, store, transport];
//   const best = scenarios.reduce((a, b) => (b.netRevenue > a.netRevenue ? b : a));
//   best.recommended = true;
//   return scenarios;
// }


import type {
  AgentActivity,
  Batch,
  NewBatchInput,
  RiskFactor,
  RiskLevel,
  Scenario,
  ValueCurvePoint,
} from '../types';

/**
 * This file is the ONLY place that turns raw batch inputs into risk /
 * price / recommendation numbers. Today it's a deterministic formula
 * standing in for a real model. When the backend AI service is ready,
 * replace the body of `assessBatch` with a call to that service and
 * every screen that consumes a `Batch` keeps working unchanged, because
 * they only ever read the resulting fields off the `Batch` object.
 */

const BASE_PRICE_PER_KG: Record<Batch['crop'], number> = {
  'Mango (Sindhri)': 45,
  'Mango (Chaunsa)': 40,
  'Rice (Basmati)': 12,
  // Rough offline fallback only - real prices always come from
  // batch.real (live AMIS data) once the backend assessment completes.
  // Potato/tomato spot-checked against data/market_prices.json samples;
  // tomato in particular swings wildly by season (~20-150+/kg), so this
  // is deliberately a mid-range placeholder, not something to trust for
  // an actual sell decision.
  Potato: 30,
  Tomato: 80,
};

/** Crops with a short shelf life spoil far faster than grains under heat. */
const PERISHABILITY: Record<Batch['crop'], number> = {
  'Mango (Sindhri)': 1,
  'Mango (Chaunsa)': 1,
  'Rice (Basmati)': 0.05,
  // Scaled roughly proportional to each crop's real decay_constant_k in
  // backend/data/crop_profiles.json, using mango's k (~0.1-0.13) as the
  // perishability=1 baseline: tomato's k (0.11) sits right with mango,
  // potato's k (0.012) sits close to rice's (0.006) - potato stores far
  // better than mango/tomato despite being a fresh crop, not a grain.
  Potato: 0.15,
  Tomato: 1,
};

const STORAGE_PROTECTION: Record<Batch['storageType'], number> = {
  'Cold Storage': 0.85,
  'Covered Shed': 0.4,
  'Transport Vehicle': 0.25,
  'Open Air / Shade': 0,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Risk score 0–100 from temperature, storage protection and perishability. */
function computeRiskScore(input: NewBatchInput): number {
  const perishability = PERISHABILITY[input.crop];
  const protection = STORAGE_PROTECTION[input.storageType];
  const heatFactor = clamp((input.temperatureC - 20) / 20, 0, 1.5); // >20°C starts to matter
  const humidityFactor = clamp((input.humidityPct - 50) / 100, 0, 0.5);

  const rawScore =
    (heatFactor * 55 + humidityFactor * 15) * perishability * (1 - protection) +
    (perishability > 0.5 ? 10 : 2); // perishable crops carry a baseline risk

  return clamp(Math.round(rawScore), 2, 98);
}

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 55) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function hoursToCriticalLoss(score: number, perishability: number): number {
  if (perishability < 0.5) {
    // Grains: expressed in "days" elsewhere, but we still return hours here for consistency.
    return clamp(Math.round(2000 - score * 15), 480, 3000);
  }
  // Perishable crops: higher score -> fewer hours until critical loss.
  return clamp(Math.round(96 - score * 0.9), 4, 96);
}

function recommendedActionFor(risk: RiskLevel, storageType: Batch['storageType']): string {
  if (risk === 'HIGH') {
    return storageType === 'Cold Storage' ? 'Sell Immediately' : 'Cold Storage Urgent';
  }
  if (risk === 'MEDIUM') {
    return storageType === 'Cold Storage' ? 'Continue Storage' : 'Move to Cold Storage';
  }
  return 'Continue Storage';
}

/** Formats an hour count into either "Xh" or "X days" depending on scale, for table display. */
export function formatTimeWindow(hours: number): string {
  if (hours < 48) return `${hours} hrs`;
  const days = hours / 24;
  return `${days % 1 === 0 ? days.toFixed(0) : days.toFixed(1)} days`;
}

/**
 * Turns a raw NewBatchInput into a fully assessed Batch, the same way a
 * backend endpoint like `POST /batches` would return the created record
 * with server-computed fields filled in.
 */
export function assessBatch(input: NewBatchInput, id: string): Batch {
  const score = computeRiskScore(input);
  const risk = riskLevelFromScore(score);
  const perishability = PERISHABILITY[input.crop];
  const basePrice = BASE_PRICE_PER_KG[input.crop];

  return {
    ...input,
    id,
    risk,
    estimatedPricePerKg: basePrice,
    hoursToCriticalLoss: hoursToCriticalLoss(score, perishability),
    // This generic client-side estimator only ever projects forward from
    // "now" - it has no concept of a batch that's already past its
    // critical day (that only happens with the real backend curve, which
    // tracks actual days-since-harvest vs a computed critical day).
    isAlreadyCritical: false,
    daysPastCritical: 0,
    projectedValueLossPct: clamp(Math.round(score * 0.7), 2, 65),
    recommendedAction: recommendedActionFor(risk, input.storageType),
    createdAt: new Date().toISOString(),
  };
}

/** Builds the value-retention curve shown on the Assessment and Report screens for a given batch. */
export function buildValueCurve(batch: Batch): ValueCurvePoint[] {
  const perishability = PERISHABILITY[batch.crop];
  const decayRate = perishability > 0.5 ? 0.45 + batch.projectedValueLossPct / 200 : 0.02;
  const points: ValueCurvePoint[] = [];
  const step = perishability > 0.5 ? 0.5 : 20;
  const span = perishability > 0.5 ? 5 : 120;

  for (let day = 0; day <= span; day += step) {
    const value = 100 * Math.exp(-decayRate * day);
    points.push({ day, value: Math.max(0, Math.round(value)) });
  }
  return points;
}

/** Builds the risk-factor cards on the Assessment screen from the batch's own fields. */
export function buildRiskFactors(batch: Batch): RiskFactor[] {
  const heatRisk: RiskLevel = batch.temperatureC >= 33 ? 'HIGH' : batch.temperatureC >= 27 ? 'MEDIUM' : 'LOW';
  const storageRisk: RiskLevel =
    batch.storageType === 'Open Air / Shade' ? 'HIGH' : batch.storageType === 'Cold Storage' ? 'LOW' : 'MEDIUM';
  const transportRisk: RiskLevel = !batch.transportAvailable
    ? 'HIGH'
    : batch.travelToMarketMinutes > 240
      ? 'MEDIUM'
      : 'LOW';
  const daysSinceHarvest = Math.max(
    0,
    Math.round((Date.now() - new Date(batch.harvestDate).getTime()) / 86400000),
  );
  const harvestRisk: RiskLevel = daysSinceHarvest >= 3 ? 'HIGH' : daysSinceHarvest >= 1 ? 'MEDIUM' : 'LOW';

  return [
    {
      label: 'Temperature Risk',
      level: heatRisk,
      value: `${batch.temperatureC}°C`,
      sub: heatRisk === 'HIGH' ? 'Above recommended handling temp' : 'Within tolerable range',
    },
    {
      label: 'Time Since Harvest',
      level: harvestRisk,
      value: daysSinceHarvest <= 0 ? 'Today' : `${daysSinceHarvest} day${daysSinceHarvest > 1 ? 's' : ''}`,
      sub: harvestRisk === 'HIGH' ? 'Well past the initial window' : 'Within initial window',
    },
    {
      label: 'Storage Quality',
      level: storageRisk,
      value: batch.storageType,
      sub: storageRisk === 'LOW' ? 'Temperature controlled' : 'No temperature control',
    },
    {
      label: 'Transport Delay',
      level: transportRisk,
      value: batch.transportAvailable ? `${Math.round(batch.travelToMarketMinutes / 60)}h ${batch.travelToMarketMinutes % 60}m` : 'Unavailable',
      sub: batch.transportAvailable ? 'Market access available' : 'No transport arranged',
    },
  ];
}

/** Builds the "AI agent" narrative shown while an assessment is generated. */
export function buildAgentActivity(batch: Batch): AgentActivity[] {
  return [
    {
      name: 'Spoilage Analyst',
      message: `Analyzed heat exposure and retrieved shelf-life data for ${batch.crop}.`,
      delay: 400,
    },
    {
      name: 'Market Intelligence',
      message: `Compared ${batch.district} and nearby wholesale market conditions.`,
      delay: 900,
    },
    {
      name: 'Advisory Agent',
      message: 'Combined spoilage and market findings to generate the recommended action.',
      delay: 1400,
    },
  ];
}

/** Builds the three decision scenarios (sell now / store / transport) for a batch. */
export function buildScenarios(batch: Batch): Scenario[] {
  const base = batch.estimatedPricePerKg;
  const qty = batch.quantityKg;

  const sellToday: Scenario = {
    id: 'A',
    title: 'Sell Today',
    sub: 'Nearest market',
    pricePerKg: base,
    spoilagePct: 5,
    costPerKg: 0,
    costLabel: 'Transport',
    netRevenue: Math.round(base * qty * 0.95),
    confidence: 94,
    recommended: false,
  };

  const storeCost = base * 0.07;
  const storePrice = base * 1.38;
  const store: Scenario = {
    id: 'B',
    title: 'Store 2 Days',
    sub: 'Cold storage → city market',
    pricePerKg: Math.round(storePrice),
    spoilagePct: 15,
    costPerKg: Math.round(storeCost),
    costLabel: 'Storage',
    netRevenue: Math.round((storePrice - storeCost) * qty * 0.85),
    confidence: 89,
    recommended: false,
  };

  const transportCost = base * 0.18;
  const transportPrice = base * 1.56;
  const transport: Scenario = {
    id: 'C',
    title: 'Transport Immediately',
    sub: 'Distant premium market',
    pricePerKg: Math.round(transportPrice),
    spoilagePct: 25,
    costPerKg: Math.round(transportCost),
    costLabel: 'Transport',
    netRevenue: Math.round((transportPrice - transportCost) * qty * 0.75),
    confidence: 81,
    recommended: false,
  };

  const scenarios = [sellToday, store, transport];
  const best = scenarios.reduce((a, b) => (b.netRevenue > a.netRevenue ? b : a));
  best.recommended = true;
  return scenarios;
}