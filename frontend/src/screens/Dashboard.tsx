// import RiskBadge from '../components/RiskBadge';
// import MetricCard from '../components/MetricCard';
// import BatchMap, { DISTRICT_COORDS, type MapMarkerData } from '../components/BatchMap';
// import { LoadingState, ErrorState, EmptyState } from '../components/StateViews';
// import { useBatches } from '../context/BatchContext';
// import { computeDashboardMetrics } from '../utils/aggregate';
// import { formatPkr, formatKg } from '../utils/format';
// import { formatTimeWindow } from '../utils/riskEngine';

// interface Props { onNavigate: (screen: string, batchId?: string) => void; }

// export default function Dashboard({ onNavigate }: Props) {
//   const { batches, loading, error, refresh } = useBatches();

//   if (loading) return <LoadingState label="Loading harvest batches..." minHeight={400} />;
//   if (error) return <ErrorState message={error} onRetry={refresh} />;

//   const metrics = computeDashboardMetrics(batches);
//   const sortedBatches = [...batches].sort((a, b) => {
//     const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
//     return rank[a.risk] - rank[b.risk];
//   });

//   const mapMarkers: MapMarkerData[] = batches.map(b => {
//     const [lat, lng] = DISTRICT_COORDS[b.district] ?? [27.5, 69.5];
//     return { label: b.district, lat, lng, risk: b.risk, detail: `${b.crop} · ${formatKg(b.quantityKg)}` };
//   });

//   return (
//     <div className="flex flex-col gap-6 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Harvest Intelligence Dashboard</h1>
//           <p className="mt-1 text-stone-500 text-sm">Monitor harvest batches, identify risk early, and protect market value.</p>
//         </div>
//         <div className="flex gap-3">
//           <button
//             onClick={() => onNavigate('regional')}
//             className="px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
//           >
//             View Regional Impact
//           </button>
//           <button
//             onClick={() => onNavigate('new-batch')}
//             className="px-4 py-2 text-sm font-semibold text-white rounded-lg flex items-center gap-2 transition-all hover:opacity-90 shadow-sm"
//             style={{ background: '#1e6b45' }}
//           >
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
//             Add New Batch
//           </button>
//         </div>
//       </div>

//       {/* Metrics — all derived from the live batch list, not fixed strings */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <MetricCard
//           label="Total Batches"
//           value={String(metrics.totalBatches)}
//           sub={`${batches.filter(b => b.risk !== 'LOW').length} active today`}
//           accent="neutral"
//           icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" /><path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
//         />
//         <MetricCard
//           label="At-Risk Batches"
//           value={String(metrics.atRiskBatches)}
//           sub={`${metrics.atRiskWithin24h} require action within 24h`}
//           accent="red"
//           trend={metrics.atRiskBatches > 0 ? 'up' : undefined}
//           icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 14H1L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
//         />
//         <MetricCard
//           label="Estimated Value at Risk"
//           value={formatPkr(metrics.estimatedValueAtRisk)}
//           sub="Across current batches"
//           accent="amber"
//           icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.5v1.2M8 10.3v1.2M5.5 7c0-.8.7-1.5 2.5-1.5s2.5.8 2.5 1.5-.8 1-2.5 1.2c-1.7.2-2.5.8-2.5 1.6 0 .8.7 1.5 2.5 1.5s2.5-.7 2.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
//         />
//         <MetricCard
//           label="Loss Prevented"
//           value={formatPkr(metrics.lossPreventedThisSeason)}
//           sub="This season"
//           accent="green"
//           trend="down"
//           icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 11L6 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 5h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
//         />
//       </div>

//       {/* Main content: table + map */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* Batches Table */}
//         <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
//           <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
//             <div>
//               <h2 className="font-semibold text-stone-900 text-sm">Active Harvest Batches</h2>
//               <p className="text-xs text-stone-400 mt-0.5">Sorted by urgency</p>
//             </div>
//             <span className="text-xs text-stone-400 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200">{batches.length} batches</span>
//           </div>

//           {batches.length === 0 ? (
//             <EmptyState
//               title="No batches yet"
//               subtitle="Register your first harvest batch to get an AI risk assessment."
//               action={
//                 <button
//                   onClick={() => onNavigate('new-batch')}
//                   className="mt-2 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
//                   style={{ background: '#1e6b45' }}
//                 >
//                   Add New Batch
//                 </button>
//               }
//             />
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="border-b border-stone-100">
//                     {['Batch', 'Crop', 'Location', 'Qty', 'Risk', 'Temp', 'Time', 'Action'].map(h => (
//                       <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {sortedBatches.map((b, i) => (
//                     <tr
//                       key={b.id}
//                       onClick={() => onNavigate('assessment', b.id)}
//                       className={`border-b border-stone-50 cursor-pointer transition-colors hover:bg-stone-50 ${b.risk === 'HIGH' ? 'bg-red-50/40' : ''}`}
//                       style={{ animationDelay: `${i * 60}ms` }}
//                     >
//                       <td className="px-4 py-3">
//                         <span className="font-mono text-xs font-medium text-stone-700">{b.id}</span>
//                       </td>
//                       <td className="px-4 py-3 text-stone-700 font-medium text-xs">{b.crop}</td>
//                       <td className="px-4 py-3 text-stone-500 text-xs">{b.district}, {b.region}</td>
//                       <td className="px-4 py-3 font-mono text-xs text-stone-600">{formatKg(b.quantityKg)}</td>
//                       <td className="px-4 py-3"><RiskBadge risk={b.risk} /></td>
//                       <td className="px-4 py-3 font-mono text-xs font-medium text-stone-700">{b.temperatureC}°C</td>
//                       <td className="px-4 py-3 font-mono text-xs text-stone-600">{formatTimeWindow(b.hoursToCriticalLoss)}</td>
//                       <td className="px-4 py-3">
//                         <span className={`text-xs font-medium ${b.risk === 'HIGH' ? 'text-red-700' : b.risk === 'MEDIUM' ? 'text-amber-700' : 'text-emerald-700'}`}>{b.recommendedAction}</span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Map + Regional snapshot */}
//         <div className="flex flex-col gap-4">
//           {/* Map */}
//           <div className="bg-white rounded-xl border border-stone-200 shadow-sm flex-1 overflow-hidden">
//             <div className="px-4 py-3 border-b border-stone-100">
//               <h2 className="font-semibold text-stone-900 text-sm">Batch Locations</h2>
//               <p className="text-xs text-stone-400 mt-0.5">{Array.from(new Set(batches.map(b => b.region))).join(' · ') || 'No active regions'}</p>
//             </div>
//             <div className="p-3">
//               {mapMarkers.length > 0 ? (
//                 <BatchMap markers={mapMarkers} height={260} zoom={6} />
//               ) : (
//                 <LoadingState label="No locations to show" minHeight={200} />
//               )}
//             </div>
//           </div>

//           {/* Snapshot */}
//           <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
//             <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Post-Harvest Snapshot</h3>
//             <div className="space-y-3">
//               {batches.some(b => b.crop.startsWith('Mango')) && (
//                 <RiskBar label="Mango loss risk" batches={batches.filter(b => b.crop.startsWith('Mango'))} />
//               )}
//               {batches.some(b => b.crop.startsWith('Rice')) && (
//                 <RiskBar label="Rice storage risk" batches={batches.filter(b => b.crop.startsWith('Rice'))} />
//               )}
//               <div className="pt-2 border-t border-stone-100">
//                 <div className="text-xs text-stone-400 mb-0.5">Est. economic impact this season</div>
//                 <div className="text-base font-bold font-mono text-stone-900">{formatPkr(metrics.estimatedValueAtRisk + metrics.lossPreventedThisSeason)}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /** Small helper that computes an average risk percentage for a subset of batches and renders a progress bar. */
// function RiskBar({ label, batches }: { label: string; batches: { projectedValueLossPct: number }[] }) {
//   if (batches.length === 0) return null;
//   const avg = Math.round(batches.reduce((sum, b) => sum + b.projectedValueLossPct, 0) / batches.length);
//   const color = avg >= 55 ? 'bg-red-400' : avg >= 25 ? 'bg-amber-400' : 'bg-emerald-400';
//   const textColor = avg >= 55 ? 'text-red-600' : avg >= 25 ? 'text-amber-600' : 'text-emerald-600';
//   return (
//     <div>
//       <div className="flex justify-between text-xs mb-1">
//         <span className="text-stone-600 font-medium">{label}</span>
//         <span className={`font-mono font-semibold ${textColor}`}>{avg}%</span>
//       </div>
//       <div className="h-1.5 bg-stone-100 rounded-full"><div className={`h-full rounded-full ${color}`} style={{ width: `${avg}%` }} /></div>
//     </div>
//   );
// }



import { useState } from 'react';
import RiskBadge from '../components/RiskBadge';
import MetricCard from '../components/MetricCard';
import BatchMap, { DISTRICT_COORDS, type MapMarkerData } from '../components/BatchMap';
import { LoadingState, ErrorState, EmptyState } from '../components/StateViews';
import { useBatches } from '../context/BatchContext';
import { computeDashboardMetrics } from '../utils/aggregate';
import { formatPkr, formatKg } from '../utils/format';
import { formatTimeWindow } from '../utils/riskEngine';

type MetricView = 'all' | 'at-risk' | 'value-at-risk' | 'season';

interface Props { onNavigate: (screen: string, batchId?: string) => void; }

export default function Dashboard({ onNavigate }: Props) {
  const { batches, loading, error, refresh } = useBatches();
  const [selectedMetric, setSelectedMetric] = useState<MetricView>('all');

  if (loading) return <LoadingState label="Loading harvest batches..." minHeight={400} />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const metrics = computeDashboardMetrics(batches);
  const riskValue = (batch: typeof batches[number]) => batch.estimatedPricePerKg * batch.quantityKg * batch.projectedValueLossPct / 100;
  const visibleBatches = batches
    .filter(batch => selectedMetric === 'at-risk' || selectedMetric === 'value-at-risk' ? batch.risk !== 'LOW' : true)
    .sort((a, b) => {
      if (selectedMetric === 'value-at-risk') return riskValue(b) - riskValue(a);
      const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return rank[a.risk] - rank[b.risk];
    });
  const viewLabels: Record<MetricView, { title: string; detail: string }> = {
    all: { title: 'Active Harvest Batches', detail: 'Most urgent first. Select a batch to view its assessment.' },
    'at-risk': { title: 'At-Risk Harvest Batches', detail: 'High and medium risk batches, sorted by urgency.' },
    'value-at-risk': { title: 'Batches by Value at Risk', detail: 'Highest estimated financial exposure first.' },
    season: { title: 'Season Overview', detail: 'All registered batches, sorted by urgency.' },
  };

  const mapMarkers: MapMarkerData[] = visibleBatches.map(b => {
    const [lat, lng] = DISTRICT_COORDS[b.district] ?? [27.5, 69.5];
    return { label: b.district, lat, lng, risk: b.risk, detail: `${b.crop} · ${formatKg(b.quantityKg)}` };
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in motion-reduce:animate-none">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold leading-tight text-stone-900 tracking-tight">Harvest Intelligence Dashboard</h1>
          <p className="mt-1 text-stone-500 text-sm">Monitor harvest batches, identify risk early, and protect market value.</p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('regional')}
            className="px-4 py-2.5 text-sm font-semibold text-stone-600 border border-stone-200/80 bg-white rounded-xl hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-800 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            View Regional Impact
          </button>
          <button
            onClick={() => onNavigate('new-batch')}
            className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center gap-2 transition-all hover:brightness-110 hover:shadow-md shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            style={{ background: '#1e6b45' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            Add New Batch
          </button>
        </div>
      </div>

      {/* Metrics — all derived from the live batch list, not fixed strings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Total Batches"
          selected={selectedMetric === 'all'}
          onClick={() => setSelectedMetric('all')}
          actionLabel="View all batches"
          value={String(metrics.totalBatches)}
          sub="Across your registered harvest batches"
          accent="neutral"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" /><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" /><path d="M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
        />
        <MetricCard
          label="At-Risk Batches"
          selected={selectedMetric === 'at-risk'}
          onClick={() => setSelectedMetric('at-risk')}
          actionLabel="Show at-risk batches"
          value={String(metrics.atRiskBatches)}
          sub={`${metrics.atRiskWithin24h} require action within 24h`}
          accent="red"
          trend={metrics.atRiskBatches > 0 ? 'up' : undefined}
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 14H1L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
        />
        <MetricCard
          label="Estimated Value at Risk"
          selected={selectedMetric === 'value-at-risk'}
          onClick={() => setSelectedMetric('value-at-risk')}
          actionLabel="Sort by value at risk"
          value={formatPkr(metrics.estimatedValueAtRisk)}
          sub="Across current batches"
          accent="amber"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 4.5v1.2M8 10.3v1.2M5.5 7c0-.8.7-1.5 2.5-1.5s2.5.8 2.5 1.5-.8 1-2.5 1.2c-1.7.2-2.5.8-2.5 1.6 0 .8.7 1.5 2.5 1.5s2.5-.7 2.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>}
        />
        <MetricCard
          label="Loss Prevented"
          selected={selectedMetric === 'season'}
          onClick={() => setSelectedMetric('season')}
          actionLabel="Explore season overview"
          value={formatPkr(metrics.lossPreventedThisSeason)}
          sub="Estimated savings this season"
          accent="green"
          trend="down"
          icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 11L6 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 5h3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        />
      </div>

      {/* Batch cards + map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xl:gap-6 items-start">
        <section className="lg:col-span-2 min-w-0" aria-labelledby="batch-list-heading">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div aria-live="polite" aria-atomic="true">
              <h2 id="batch-list-heading" className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">{viewLabels[selectedMetric].title}</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">{viewLabels[selectedMetric].detail}</p>
            </div>
            <span className="shrink-0 rounded-full border border-stone-200/70 bg-white px-3 py-1.5 text-xs font-medium tabular-nums text-stone-600">{visibleBatches.length} {visibleBatches.length === 1 ? 'batch' : 'batches'}</span>
          </div>

          {selectedMetric === 'season' && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <div>
                <p className="text-xs font-semibold text-emerald-800">Estimated loss prevented this season</p>
                <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-emerald-950">{formatPkr(metrics.lossPreventedThisSeason)}</p>
                <p className="mt-1 text-xs leading-5 text-emerald-800/80">Estimate based on registered at-risk batch quantities.</p>
              </div>
              <button type="button" onClick={() => onNavigate('regional')} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">View Regional Impact →</button>
            </div>
          )}

          {visibleBatches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 bg-white/70 p-5">
              <EmptyState
                title={batches.length === 0 ? 'No batches yet' : 'No at-risk batches'}
                subtitle={batches.length === 0 ? 'Register your first harvest batch to get an AI risk assessment.' : 'Your current batches are low risk. View all batches to continue monitoring.'}
                action={
                  <button type="button" onClick={() => batches.length === 0 ? onNavigate('new-batch') : setSelectedMetric('all')} className="mt-2 rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                    {batches.length === 0 ? 'Add New Batch' : 'View all batches'}
                  </button>
                }
              />
            </div>
          ) : (
            <ul className="space-y-3" aria-label="Harvest batches">
              {visibleBatches.map(b => {
                const tone = batchTones[b.risk];
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => onNavigate('assessment', b.id)}
                      aria-label={`View assessment for ${b.crop}, batch ${b.id}, ${b.district}`}
                      className={`group block w-full min-w-0 rounded-2xl border bg-gradient-to-br p-4 sm:p-5 text-left shadow-[0_2px_10px_rgba(28,25,23,0.025)] transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transition-none hover:shadow-[0_8px_24px_rgba(28,25,23,0.07)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${tone.card}`}
                    >
                      <span className="flex flex-wrap items-start justify-between gap-3">
                        <span className="flex min-w-0 flex-1 items-start gap-3">
                          <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/80 ${tone.icon}`} aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 21v-9M12 15C5 15 4 10 4 6c5 0 8 2 8 7M12 11c0-5 3-8 8-8 0 5-2 9-8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[15px] font-semibold leading-5 tracking-tight text-stone-900">{b.crop}</span>
                            <span className="mt-1 block text-xs leading-5 text-stone-500">{b.district}, {b.region}</span>
                            <span className="mt-0.5 block break-all font-mono text-[10px] leading-4 text-stone-500">{b.id}</span>
                          </span>
                        </span>
                        <RiskBadge risk={b.risk} />
                      </span>

                      <span className="my-4 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
                        <BatchDetail label="Quantity" value={formatKg(b.quantityKg)} />
                        <BatchDetail label="Temperature" value={`${b.temperatureC}°C`} />
                        <BatchDetail label="Time to critical loss" value={b.isAlreadyCritical ? 'Already critical' : formatTimeWindow(b.hoursToCriticalLoss)} urgent={b.risk === 'HIGH'} />
                      </span>

                      <span className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-stone-200/50 pt-3">
                        <span className="min-w-0 flex-1 text-xs font-medium leading-5 text-stone-600">{b.recommendedAction || 'Open assessment for recommendations'}{selectedMetric === 'value-at-risk' && <span className="mt-1 block font-semibold tabular-nums text-amber-800">{formatPkr(riskValue(b))} estimated value at risk</span>}</span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-emerald-800">View assessment <span className="transition-transform motion-safe:group-hover:translate-x-1" aria-hidden="true">→</span></span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {selectedMetric !== 'all' && batches.length > 0 && (
            <button type="button" onClick={() => setSelectedMetric('all')} className="mt-4 rounded-lg px-2 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-white hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">← Back to all batches</button>
          )}
        </section>

        {/* Map + Regional snapshot */}
        <div className="flex flex-col gap-4 min-w-0 self-start">
          {/* Map */}
          <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_3px_16px_rgba(28,25,23,0.035)] overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900 text-sm">Batch Locations</h2>
              <p className="text-xs text-stone-400 mt-0.5">{Array.from(new Set(visibleBatches.map(b => b.region))).join(' · ') || 'No active regions'}</p>
            </div>
            <div className="p-2">
              {mapMarkers.length > 0 ? (
                <BatchMap markers={mapMarkers} height={260} zoom={6} />
              ) : (
                <div className="flex h-[260px] items-center justify-center rounded-lg bg-stone-50 px-6 text-center text-sm text-stone-500">No batch locations in this view.</div>
              )}
            </div>
          </div>

          {/* Snapshot */}
          <div className="bg-white rounded-2xl border border-stone-200/70 shadow-[0_3px_16px_rgba(28,25,23,0.035)] p-5">
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Post-Harvest Snapshot</h3>
            <div className="space-y-3">
              {batches.some(b => b.crop.startsWith('Mango')) && (
                <RiskBar label="Mango loss risk" batches={batches.filter(b => b.crop.startsWith('Mango'))} />
              )}
              {batches.some(b => b.crop.startsWith('Rice')) && (
                <RiskBar label="Rice storage risk" batches={batches.filter(b => b.crop.startsWith('Rice'))} />
              )}
              <div className="pt-2 border-t border-stone-100">
                <div className="text-xs text-stone-400 mb-0.5">Est. economic impact this season</div>
                <div className="text-base font-bold font-mono text-stone-900">{formatPkr(metrics.estimatedValueAtRisk + metrics.lossPreventedThisSeason)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const batchTones = {
  HIGH: { card: 'from-white to-rose-50/60 border-rose-100 hover:border-rose-200', icon: 'bg-rose-50 text-rose-600' },
  MEDIUM: { card: 'from-white to-amber-50/60 border-amber-100 hover:border-amber-200', icon: 'bg-amber-50 text-amber-700' },
  LOW: { card: 'from-white to-emerald-50/60 border-emerald-100 hover:border-emerald-200', icon: 'bg-emerald-50 text-emerald-700' },
};

function BatchDetail({ label, value, urgent = false }: { label: string; value: string; urgent?: boolean }) {
  return (
    <span className="min-w-0">
      <span className="block text-[11px] leading-4 text-stone-500">{label}</span>
      <span className={`mt-1 block break-words text-sm font-semibold leading-5 tabular-nums ${urgent ? 'text-rose-700' : 'text-stone-800'}`}>{value}</span>
    </span>
  );
}

/** Small helper that computes an average risk percentage for a subset of batches and renders a progress bar. */
function RiskBar({ label, batches }: { label: string; batches: { projectedValueLossPct: number }[] }) {
  if (batches.length === 0) return null;
  const avg = Math.round(batches.reduce((sum, b) => sum + b.projectedValueLossPct, 0) / batches.length);
  const color = avg >= 55 ? 'bg-red-400' : avg >= 25 ? 'bg-amber-400' : 'bg-emerald-400';
  const textColor = avg >= 55 ? 'text-red-600' : avg >= 25 ? 'text-amber-600' : 'text-emerald-600';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-stone-600 font-medium">{label}</span>
        <span className={`font-mono font-semibold ${textColor}`}>{avg}%</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full"><div className={`h-full rounded-full ${color}`} style={{ width: `${avg}%` }} /></div>
    </div>
  );
}
