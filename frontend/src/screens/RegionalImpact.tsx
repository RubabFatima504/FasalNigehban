import { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import BatchMap, { DISTRICT_COORDS, type MapMarkerData } from '../components/BatchMap';
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews';
import { useBatches } from '../context/BatchContext';
import { computeRegionalSummary } from '../utils/aggregate';
import { formatPkr } from '../utils/format';

interface Props { onNavigate: (screen: string, batchId?: string) => void; }

const RISK_COLOR: Record<string, string> = { HIGH: '#b91c1c', MEDIUM: '#d97706', LOW: '#1e6b45' };

export default function RegionalImpact({ onNavigate }: Props) {
  const { batches, loading, error, refresh } = useBatches();
  const summary = useMemo(() => computeRegionalSummary(batches), [batches]);

  if (loading) return <LoadingState label="Loading regional data..." minHeight={400} />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const mapMarkers: MapMarkerData[] = summary.districts.map(d => {
    const [lat, lng] = DISTRICT_COORDS[d.district] ?? [27.5, 69.5];
    return { label: d.district, lat, lng, risk: d.risk, detail: `${d.batchCount} batches · ${formatPkr(d.valueSaved)} saved` };
  });

  const metrics = [
    { label: 'Total Batches', value: String(summary.totalBatches), sub: 'This season', accent: 'text-stone-900' },
    { label: 'Total Value at Risk', value: formatPkr(summary.totalValueAtRisk), sub: 'Across all regions', accent: 'text-red-700' },
    { label: 'Total Value Saved', value: formatPkr(summary.totalValueSaved), sub: 'Via HarvestGuard', accent: 'text-emerald-700' },
    { label: 'Avg Loss Reduction', value: `${summary.avgLossReductionPct}%`, sub: 'Per batch', accent: 'text-emerald-700' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Regional Impact</h1>
          <p className="mt-1 text-stone-500 text-sm">Understand how better post-harvest decisions translate into value saved across your region.</p>
        </div>
        <div className="flex gap-2">
          <select className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 bg-white focus:outline-none">
            <option>Sindh + Punjab</option>
            <option>Sindh Only</option>
            <option>Punjab Only</option>
          </select>
          <select className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 bg-white focus:outline-none">
            <option>Current Season</option>
            <option>Full Season</option>
          </select>
        </div>
      </div>

      {batches.length === 0 ? (
        <EmptyState
          title="No regional data yet"
          subtitle="Register at least one batch to see regional impact."
          action={
            <button
              onClick={() => onNavigate('new-batch')}
              className="mt-2 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
              style={{ background: '#1e6b45' }}
            >
              Add New Batch
            </button>
          }
        />
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map(m => (
              <div key={m.label} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
                <div className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">{m.label}</div>
                <div className={`text-3xl font-bold font-mono ${m.accent} leading-none`}>{m.value}</div>
                <div className="text-xs text-stone-400 mt-1.5">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Map + Impact chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Map */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900 text-sm">Batch Distribution — Sindh / Punjab</h2>
                <p className="text-xs text-stone-400 mt-0.5">Active and resolved batches this season</p>
              </div>
              <div className="p-4" style={{ height: 300 }}>
                <BatchMap markers={mapMarkers} height={272} zoom={6} />
              </div>
            </div>

            {/* Before/After chart */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <h2 className="font-semibold text-stone-900 text-sm mb-1">Impact of HarvestGuard</h2>
              <p className="text-xs text-stone-400 mb-4">Value loss % — Without vs. With HarvestGuard (historical trend)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.monthly} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" vertical={false}/>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false}/>
                  <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}/>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 8, fontSize: 12 }} formatter={(v: unknown, n: unknown) => [`${v}%`, `${n}`]}/>
                  <Legend iconType="square" wrapperStyle={{ fontSize: 11, color: '#78716c' }}/>
                  <Bar dataKey="without" name="Without HarvestGuard" fill="#fca5a5" radius={[3, 3, 0, 0]}/>
                  <Bar dataKey="with" name="With HarvestGuard" fill="#1e6b45" radius={[3, 3, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* District table + Projection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900 text-sm">District Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {['District','Batches','Value Saved','Avg Loss Reduction'].map(h => (
                        <th key={h} className="px-5 py-2.5 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.districts.map(d => (
                      <tr key={d.district} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR[d.risk] }}/>
                            <span className="font-medium text-stone-700">{d.district}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-mono text-stone-600">{d.batchCount}</td>
                        <td className="px-5 py-3 font-mono font-semibold text-emerald-700">{formatPkr(d.valueSaved)}</td>
                        <td className="px-5 py-3 font-mono text-stone-600">{d.avgLossReductionPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cooperative projection */}
            <div className="bg-stone-900 rounded-xl p-6 flex flex-col justify-between text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Cooperative Projection</p>
                <p className="text-sm text-stone-300 leading-relaxed mb-4">What if every farmer in this cooperative used HarvestGuard?</p>
                <div className="text-4xl font-bold font-mono text-white leading-none mb-1">{formatPkr(summary.totalValueSaved * 4)}</div>
                <div className="text-sm text-emerald-400 font-medium mb-4">projected seasonal value saved</div>
                <p className="text-xs text-stone-500 leading-relaxed">Based on current batch patterns and regional adoption assumptions across {Array.from(new Set(batches.map(b => b.region))).join(' and ')} cooperatives.</p>
              </div>
              <button
                onClick={() => onNavigate('new-batch')}
                className="mt-6 w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: '#1e6b45' }}
              >
                Add New Batch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
