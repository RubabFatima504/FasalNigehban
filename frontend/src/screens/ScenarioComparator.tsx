import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { LoadingState, EmptyState } from '../components/StateViews';
import MarkdownLite from '../components/MarkdownLite';
import { useBatches } from '../context/BatchContext';
import { buildScenarios } from '../utils/riskEngine';
import { mapRealScenarios } from '../utils/realDataAdapters';
import { formatPkrFull, formatPct } from '../utils/format';
import type { Scenario } from '../types';

interface Props { onNavigate: (screen: string, batchId?: string) => void; batchId?: string; }

const TAG_STYLE: Record<string, string> = {
  SAFEST: 'bg-stone-100 text-stone-600',
  RECOMMENDED: 'text-white',
  UPSIDE: 'bg-amber-50 text-amber-700',
};

const BORDER_STYLE: Record<string, string> = {
  SAFEST: 'border-stone-200',
  RECOMMENDED: 'border-emerald-500',
  UPSIDE: 'border-amber-200',
};

const ACCENT: Record<string, string> = { A: '#78716c', B: '#1e6b45', C: '#d97706' };

function tagFor(s: Scenario): 'SAFEST' | 'RECOMMENDED' | 'UPSIDE' {
  if (s.recommended) return 'RECOMMENDED';
  return s.id === 'C' ? 'UPSIDE' : 'SAFEST';
}

/** Builds a simple decay curve per scenario for the comparison chart, using each scenario's spoilage rate. */
function buildComparisonCurve(scenarios: Scenario[]) {
  const points: Record<string, number>[] = [];
  for (let day = 0; day <= 3; day += 0.5) {
    const point: Record<string, number> = { day };
    scenarios.forEach(s => {
      const decayRate = s.spoilagePct / 100;
      point[s.id] = Math.round(100 * Math.exp(-decayRate * day * 1.3));
    });
    points.push(point);
  }
  return points;
}

export default function ScenarioComparator({ onNavigate, batchId }: Props) {
  const { batches, loading } = useBatches();
  const batch = useMemo(() => batches.find(b => b.id === batchId) ?? batches[0], [batches, batchId]);
  const scenarios = useMemo(
    () => (batch ? (batch.real ? mapRealScenarios(batch.real) : buildScenarios(batch)) : []),
    [batch],
  );
  const curveData = useMemo(() => buildComparisonCurve(scenarios), [scenarios]);
  const [expanded, setExpanded] = useState(false);

  if (loading) return <LoadingState label="Loading scenarios..." minHeight={400} />;

  if (!batch) {
    return (
      <EmptyState
        title="No batch selected"
        subtitle="Pick a batch from the dashboard to compare its decision scenarios."
        action={
          <button
            onClick={() => onNavigate('dashboard')}
            className="mt-2 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
            style={{ background: '#1e6b45' }}
          >
            Go to Dashboard
          </button>
        }
      />
    );
  }

  const recommended = scenarios.find(s => s.recommended);
  const runnerUp = scenarios.find(s => !s.recommended);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
          <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
          <span>›</span>
          <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('assessment', batch.id)}>Assessment</span>
          <span>›</span>
          <span className="text-stone-600">Scenario Comparison · {batch.id}</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Compare Your Options</h1>
        <p className="mt-1 text-stone-500 text-sm">See how timing, spoilage and market conditions affect your final return.</p>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map(s => {
          const tag = tagFor(s);
          return (
            <div
              key={s.id}
              className={`bg-white rounded-xl border-2 shadow-sm flex flex-col overflow-hidden transition-all ${BORDER_STYLE[tag]} ${s.recommended ? 'shadow-emerald-100 shadow-lg lg:scale-[1.02]' : 'hover:shadow-md'}`}
            >
              {/* Tag */}
              <div className={`px-4 py-2 text-xs font-bold tracking-widest text-center ${s.recommended ? 'text-white' : TAG_STYLE[tag]}`} style={s.recommended ? { background: '#1e6b45' } : {}}>
                {tag === 'SAFEST' ? 'SAFEST OPTION' : tag === 'RECOMMENDED' ? 'RECOMMENDED' : 'HIGHEST UPSIDE / RISK'}
              </div>

              <div className="p-5 flex flex-col gap-4 flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-lg font-bold text-stone-900">{s.title}</span>
                    {s.recommended && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" fill="#1e6b45" fillOpacity="0.8"/></svg>}
                  </div>
                  <p className="text-xs text-stone-400">{s.sub}</p>
                </div>

                {/* Forecast warning banner (v3) */}
                {s.forecastWarning && (
                  <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs ${
                    s.forecastWarning.severity === 'HIGH'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <span className="text-sm leading-none mt-0.5 flex-shrink-0">
                      {s.forecastWarning.event_type === 'STORM' ? '⛈️'
                        : s.forecastWarning.event_type === 'HEAVY_RAIN' ? '🌧️'
                        : s.forecastWarning.event_type === 'EXTREME_HEAT' ? '🌡️'
                        : '💧'}
                    </span>
                    <div>
                      <span className="font-semibold">
                        {s.forecastWarning.event_type.replace(/_/g, ' ')} — {s.forecastWarning.date}
                      </span>
                      <span className="block mt-0.5 font-normal opacity-90">{s.forecastWarning.description}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    { label: 'Est. Price', value: `₨${s.pricePerKg}/kg` },
                    { label: 'Spoilage Risk', value: formatPct(s.spoilagePct) },
                    { label: `${s.costLabel} Cost`, value: `₨${s.costPerKg}/kg` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-stone-500">{row.label}</span>
                      <span className="font-mono font-medium text-stone-700">{row.value}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone-100 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-stone-700">Net Revenue</span>
                      {s.forecastAdjusted && (
                        <span className="block text-xs text-amber-600 mt-0.5">adjusted for forecast ↓</span>
                      )}
                    </div>
                    <span className={`text-xl font-bold font-mono ${s.recommended ? 'text-emerald-700' : 'text-stone-900'}`}>{formatPkrFull(s.netRevenue)}</span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-400">AI Confidence</span>
                    <span className="font-mono font-semibold text-stone-600">{s.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-stone-100 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.confidence}%`, background: ACCENT[s.id] }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison chart */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <h2 className="font-semibold text-stone-900 mb-1">Scenario Value Retention Over Time</h2>
        <p className="text-xs text-stone-400 mb-4">How each scenario affects batch quality across the decision window</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={curveData} margin={{ top: 5, right: 20, left: 0, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false}/>
            <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]}/>
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 8, fontSize: 12 }} formatter={(v: unknown, n: unknown) => [`${v}%`, `Scenario ${n}`]}/>
            <Legend iconType="line" wrapperStyle={{ fontSize: 11, color: '#78716c', paddingTop: 8 }}/>
            <ReferenceLine x={1} stroke="#1c1917" strokeDasharray="3 3" strokeOpacity={0.3}/>
            {scenarios.map(s => (
              <Line key={s.id} type="monotone" dataKey={s.id} stroke={ACCENT[s.id]} strokeWidth={s.recommended ? 2.5 : 2} dot={false} name={`${s.id} – ${s.title}`}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="text-center text-xs text-stone-400 mt-1">Days after decision point</p>
      </div>

      {/* Why recommended + actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setExpanded(!expanded)}
          >
            <h3 className="font-semibold text-stone-900 text-sm">Why is Scenario {recommended?.id} recommended?</h3>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={`transition-transform ${expanded ? 'rotate-180' : ''}`}><path d="M4 6l4 4 4-4" stroke="#78716c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[32rem] mt-3' : 'max-h-0'}`}>
            {batch.real ? (
              <MarkdownLite text={batch.real.marketAnalysisText} className="text-sm text-stone-600" />
            ) : (
              <>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Scenario {recommended?.id} provides the strongest balance between expected market price and projected spoilage.
                  {runnerUp && recommended && (
                    <> The additional cost of ₨{recommended.costPerKg}/kg is outweighed by the ₨{recommended.pricePerKg - runnerUp.pricePerKg}/kg difference in market value.</>
                  )}
                </p>
                <div className="mt-3 space-y-1">
                  {[`${batch.crop} shelf-life data`, `${batch.district} wholesale market conditions`, 'Regional cold storage cost benchmarks'].map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs text-stone-400">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNavigate('report', batch.id)}
            className="flex-1 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
            style={{ background: '#1e6b45' }}
          >
            Use Recommended Scenario
          </button>
          <button
            onClick={() => onNavigate('report', batch.id)}
            className="flex-1 py-3 rounded-lg text-sm font-medium text-stone-600 border border-stone-200 flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
          >
            Generate Loss-Prevention Report
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
