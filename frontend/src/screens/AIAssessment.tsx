// import { useState, useEffect, useMemo } from 'react';
// import {
//   ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot,
// } from 'recharts';
// import RiskBadge from '../components/RiskBadge';
// import MarkdownLite from '../components/MarkdownLite';
// import { LoadingState, EmptyState } from '../components/StateViews';
// import { useBatches } from '../context/BatchContext';
// import { buildAgentActivity, buildRiskFactors, buildValueCurve, formatTimeWindow } from '../utils/riskEngine';
// import { mapRealCurve, mapRealRiskFactors } from '../utils/realDataAdapters';
// import { formatKg, formatPct } from '../utils/format';

// interface Props { onNavigate: (screen: string, batchId?: string) => void; batchId?: string; }

// export default function AIAssessment({ onNavigate, batchId }: Props) {
//   const { batches, loading } = useBatches();
//   const batch = useMemo(() => batches.find(b => b.id === batchId) ?? batches[0], [batches, batchId]);

//   const agents = useMemo(() => (batch ? buildAgentActivity(batch) : []), [batch]);
//   // Prefer the real backend's crop-specific curve/risk factors whenever this
//   // batch has completed a real assessment - only fall back to the generic
//   // client-side formulas (riskEngine.ts) if `real` isn't present, e.g. the
//   // assessment call hasn't resolved yet or the backend was unreachable.
//   const riskCards = useMemo(
//     () => (batch ? (batch.real ? mapRealRiskFactors(batch.real) : buildRiskFactors(batch)) : []),
//     [batch],
//   );
//   const curveData = useMemo(
//     () => (batch ? (batch.real ? mapRealCurve(batch.real) : buildValueCurve(batch)) : []),
//     [batch],
//   );

//   const [agentsVisible, setAgentsVisible] = useState<boolean[]>([]);

//   useEffect(() => {
//     if (agents.length === 0) return;
//     setAgentsVisible(agents.map(() => false));
//     const timers = agents.map((a, i) =>
//       setTimeout(() => {
//         setAgentsVisible(prev => { const n = [...prev]; n[i] = true; return n; });
//       }, a.delay),
//     );
//     return () => timers.forEach(clearTimeout);
//   }, [agents]);

//   if (loading) return <LoadingState label="Loading assessment..." minHeight={400} />;

//   if (!batch) {
//     return (
//       <EmptyState
//         title="No batch selected"
//         subtitle="Pick a batch from the dashboard, or register a new one, to see its AI assessment."
//         action={
//           <button
//             onClick={() => onNavigate('dashboard')}
//             className="mt-2 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
//             style={{ background: '#1e6b45' }}
//           >
//             Go to Dashboard
//           </button>
//         }
//       />
//     );
//   }

//   const critHours = batch.hoursToCriticalLoss;
//   const critH = Math.floor(critHours);
//   const critM = Math.round((critHours - critH) * 60);
//   const dashProgress = Math.min(1, critHours / 96); // fraction of the "danger ring" that's still safe

//   return (
//     <div className="flex flex-col gap-5 animate-fade-in">
//       {/* Header */}
//       <div className="flex items-start justify-between flex-wrap gap-4">
//         <div>
//           <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
//             <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
//             <span>›</span>
//             <span className="text-stone-600">AI Assessment · {batch.id}</span>
//           </div>
//           <div className="flex items-center gap-3 flex-wrap">
//             <h1 className="text-2xl font-bold text-stone-900 tracking-tight">AI Batch Assessment</h1>
//             <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
//               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Analysis Complete
//             </span>
//             {batch.real ? (
//               <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
//                 Live AI Analysis
//               </span>
//             ) : (
//               <span className="text-xs font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
//                 Estimated (backend pending)
//               </span>
//             )}
//             <RiskBadge risk={batch.risk} size="md" />
//           </div>
//           <p className="mt-2 text-stone-700 text-base font-medium max-w-2xl">
//             This batch may lose approximately{' '}
//             <span className="text-red-600 font-bold">{formatPct(batch.projectedValueLossPct)} of its value</span>{' '}
//             within {formatTimeWindow(critHours)} if current conditions continue.
//           </p>
//         </div>
//         <div className="text-right text-xs text-stone-400">
//           <div className="font-mono font-semibold text-stone-600">{batch.id}</div>
//           <div>{batch.crop} · {formatKg(batch.quantityKg)}</div>
//           <div>{batch.district}, {batch.region}</div>
//         </div>
//       </div>

//       {/* Top row: countdown + agents */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* Countdown hero */}
//         <div className="lg:col-span-1 bg-white rounded-xl border border-red-100 shadow-sm p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
//           <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-4">Estimated Time to Critical Quality Loss</p>
//           <div className="relative flex items-center justify-center mb-4">
//             <svg width="120" height="120" viewBox="0 0 120 120">
//               <circle cx="60" cy="60" r="52" fill="none" stroke="#fee2e2" strokeWidth="6"/>
//               <circle
//                 cx="60" cy="60" r="52" fill="none" stroke="#b91c1c" strokeWidth="6"
//                 strokeDasharray={`${2 * Math.PI * 52 * dashProgress} ${2 * Math.PI * 52}`}
//                 strokeLinecap="round"
//                 transform="rotate(-90 60 60)"
//                 style={{ transition: 'stroke-dasharray 1s ease' }}
//               />
//             </svg>
//             <div className="absolute flex flex-col items-center">
//               <span className="text-3xl font-bold font-mono text-stone-900 leading-none pulse-red inline-block rounded-lg">{critH}h</span>
//               <span className="text-lg font-semibold font-mono text-red-600">{critM}m</span>
//             </div>
//           </div>
//           <p className="text-xs text-stone-400 leading-relaxed">at current temperature and storage conditions</p>
//         </div>

//         {/* Agent activity */}
//         <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
//           <div className="flex items-center gap-2 mb-4">
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#1e6b45" strokeWidth="1.3"/><circle cx="5" cy="8" r="1.5" fill="#1e6b45"/><path d="M8 8h4" stroke="#1e6b45" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 6h4M8 10h2" stroke="#1e6b45" strokeWidth="1" strokeLinecap="round" opacity="0.4"/></svg>
//             <h2 className="font-semibold text-stone-900 text-sm">AI Analysis Activity</h2>
//           </div>
//           <div className="space-y-3">
//             {agents.map((a, i) => (
//               <div
//                 key={a.name}
//                 className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all duration-500 ${agentsVisible[i] ? 'border-emerald-100 bg-emerald-50/50 agent-item opacity-100' : 'border-stone-100 bg-stone-50 opacity-30'}`}
//                 style={{ animationDelay: `${a.delay}ms` }}
//               >
//                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${agentsVisible[i] ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}>
//                   <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M8 4v4.5l3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center justify-between mb-0.5">
//                     <span className="text-sm font-semibold text-stone-800">{a.name} Agent</span>
//                     {agentsVisible[i] && (
//                       <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
//                         <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                         Completed
//                       </span>
//                     )}
//                   </div>
//                   <p className="text-xs text-stone-500 leading-relaxed">{a.message}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
//         <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
//           <div>
//             <h2 className="font-semibold text-stone-900">Projected Value Retention</h2>
//             <p className="text-xs text-stone-400 mt-0.5">{batch.crop} · {batch.district} conditions</p>
//           </div>
//           <div className="flex gap-4 text-xs">
//             <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-400 rounded" /><span className="text-stone-500">Premium Quality</span></div>
//             <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-amber-400 rounded" /><span className="text-stone-500">Acceptable</span></div>
//             <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-400 rounded" /><span className="text-stone-500">Loss Zone</span></div>
//           </div>
//         </div>
//         <ResponsiveContainer width="100%" height={220}>
//           <AreaChart data={curveData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
//             <defs>
//               <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor="#1e6b45" stopOpacity={0.2}/>
//                 <stop offset="60%" stopColor="#d97706" stopOpacity={0.1}/>
//                 <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.05}/>
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
//             <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} label={{ value: 'Days After Harvest', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#a8a29e' }}/>
//             <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]}/>
//             <Tooltip
//               contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 8, fontSize: 12 }}
//               formatter={(v: unknown) => [`${v}%`, 'Value Retained']}
//               labelFormatter={(l: unknown) => `Day ${l}`}
//             />
//             <ReferenceLine y={60} stroke="#d97706" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'Acceptable', position: 'right', fontSize: 10, fill: '#d97706' }}/>
//             <ReferenceLine y={30} stroke="#b91c1c" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'Critical', position: 'right', fontSize: 10, fill: '#b91c1c' }}/>
//             <Area type="monotone" dataKey="value" stroke="#1e6b45" strokeWidth={2} fill="url(#valueGrad)"/>
//             {curveData[1] && <ReferenceDot x={curveData[1].day} y={curveData[1].value} r={5} fill="#b91c1c" stroke="white" strokeWidth={2} className="pulse-red"/>}
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Full AI analysis text (real backend only - this is the LLM's actual reasoning, citing research) */}
//       {batch.real && (
//         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
//           <div className="flex items-center gap-2 mb-3">
//             <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" stroke="#1e6b45" strokeWidth="1.3" fill="#1e6b45" fillOpacity="0.15" strokeLinejoin="round"/></svg>
//             <h2 className="font-semibold text-stone-900 text-sm">Spoilage Analyst — Full Reasoning</h2>
//           </div>
//           <MarkdownLite text={batch.real.spoilageAnalysisText} className="text-sm text-stone-700" />
//         </div>
//       )}

//       {/* Risk breakdown + Recommendation */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         <div className="lg:col-span-2">
//           <h2 className="font-semibold text-stone-900 text-sm mb-3">Risk Breakdown</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {riskCards.map(r => (
//               <div key={r.label} className={`bg-white rounded-xl border shadow-sm p-4 ${r.level === 'HIGH' ? 'border-red-100' : r.level === 'MEDIUM' ? 'border-amber-100' : 'border-emerald-100'}`}>
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-xs font-medium text-stone-500">{r.label}</span>
//                   <RiskBadge risk={r.level} />
//                 </div>
//                 <div className="text-xl font-bold font-mono text-stone-900">{r.value}</div>
//                 <div className="text-xs text-stone-400 mt-0.5">{r.sub}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Recommendation */}
//         <div className="bg-stone-900 rounded-xl p-5 flex flex-col justify-between text-white">
//           <div>
//             <div className="flex items-center gap-2 mb-3">
//               <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" stroke="#1e6b45" strokeWidth="1.3" fill="#1e6b45" fillOpacity="0.3" strokeLinejoin="round"/></svg>
//               <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">AI Recommendation</span>
//             </div>
//             <p className="text-base font-bold text-white leading-snug mb-3">{batch.recommendedAction}.</p>
//             <p className="text-xs text-stone-400 leading-relaxed">
//               {batch.risk === 'HIGH'
//                 ? 'Current heat exposure is accelerating value loss faster than the potential price increase from delayed selling.'
//                 : batch.risk === 'MEDIUM'
//                   ? 'Conditions are manageable for now, but moving to better storage would reduce risk further.'
//                   : 'Conditions are favorable — continue monitoring and no urgent action is required.'}
//             </p>
//           </div>
//           <button
//             onClick={() => onNavigate('scenario', batch.id)}
//             className="mt-5 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
//             style={{ background: '#1e6b45' }}
//           >
//             Compare Scenarios
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceDot,
} from 'recharts';
import RiskBadge from '../components/RiskBadge';
import MarkdownLite from '../components/MarkdownLite';
import { LoadingState, EmptyState } from '../components/StateViews';
import { useBatches } from '../context/BatchContext';
import { buildAgentActivity, buildRiskFactors, buildValueCurve, formatTimeWindow } from '../utils/riskEngine';
import { mapRealCurve, mapRealRiskFactors } from '../utils/realDataAdapters';
import { formatKg, formatPct } from '../utils/format';

interface Props { onNavigate: (screen: string, batchId?: string) => void; batchId?: string; }

export default function AIAssessment({ onNavigate, batchId }: Props) {
  const { batches, loading } = useBatches();
  const batch = useMemo(() => batches.find(b => b.id === batchId) ?? batches[0], [batches, batchId]);

  const agents = useMemo(() => (batch ? buildAgentActivity(batch) : []), [batch]);
  // Prefer the real backend's crop-specific curve/risk factors whenever this
  // batch has completed a real assessment - only fall back to the generic
  // client-side formulas (riskEngine.ts) if `real` isn't present, e.g. the
  // assessment call hasn't resolved yet or the backend was unreachable.
  const riskCards = useMemo(
    () => (batch ? (batch.real ? mapRealRiskFactors(batch.real) : buildRiskFactors(batch)) : []),
    [batch],
  );
  const curveData = useMemo(
    () => (batch ? (batch.real ? mapRealCurve(batch.real) : buildValueCurve(batch)) : []),
    [batch],
  );

  const [agentsVisible, setAgentsVisible] = useState<boolean[]>([]);

  useEffect(() => {
    if (agents.length === 0) return;
    setAgentsVisible(agents.map(() => false));
    const timers = agents.map((a, i) =>
      setTimeout(() => {
        setAgentsVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, a.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, [agents]);

  if (loading) return <LoadingState label="Loading assessment..." minHeight={400} />;

  if (!batch) {
    return (
      <EmptyState
        title="No batch selected"
        subtitle="Pick a batch from the dashboard, or register a new one, to see its AI assessment."
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

  const critHours = batch.hoursToCriticalLoss;
  const critH = Math.floor(critHours);
  const critM = Math.round((critHours - critH) * 60);
  const dashProgress = Math.min(1, critHours / 96); // fraction of the "danger ring" that's still safe

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
            <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
            <span>›</span>
            <span className="text-stone-600">AI Assessment · {batch.id}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">AI Batch Assessment</h1>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Analysis Complete
            </span>
            {batch.real ? (
              <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                Live AI Analysis
              </span>
            ) : (
              <span className="text-xs font-medium text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full">
                Estimated (backend pending)
              </span>
            )}
            <RiskBadge risk={batch.risk} size="md" />
          </div>
          <p className="mt-2 text-stone-700 text-base font-medium max-w-2xl">
            {batch.isAlreadyCritical ? (
              <>
                This batch already crossed its critical quality threshold{' '}
                <span className="text-red-600 font-bold">
                  {batch.daysPastCritical > 0 ? `${batch.daysPastCritical} day${batch.daysPastCritical === 1 ? '' : 's'} ago` : 'today'}
                </span>{' '}
                and has lost approximately{' '}
                <span className="text-red-600 font-bold">{formatPct(batch.projectedValueLossPct)} of its value</span>.
                Immediate action is needed to limit further loss.
              </>
            ) : (
              <>
                This batch may lose approximately{' '}
                <span className="text-red-600 font-bold">{formatPct(batch.projectedValueLossPct)} of its value</span>{' '}
                within {formatTimeWindow(critHours)} if current conditions continue.
              </>
            )}
          </p>
        </div>
        <div className="text-right text-xs text-stone-400">
          <div className="font-mono font-semibold text-stone-600">{batch.id}</div>
          <div>{batch.crop} · {formatKg(batch.quantityKg)}</div>
          <div>{batch.district}, {batch.region}</div>
        </div>
      </div>

      {/* Top row: countdown + agents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Countdown hero */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-red-100 shadow-sm p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-4">
            {batch.isAlreadyCritical ? 'Critical Quality Loss' : 'Estimated Time to Critical Quality Loss'}
          </p>
          <div className="relative flex items-center justify-center mb-4">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#fee2e2" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="#b91c1c" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 52 * dashProgress} ${2 * Math.PI * 52}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              {batch.isAlreadyCritical ? (
                <span className="text-xl font-bold font-mono text-red-600 leading-tight pulse-red inline-block rounded-lg px-1 text-center">
                  Already<br />Exceeded
                </span>
              ) : (
                <>
                  <span className="text-3xl font-bold font-mono text-stone-900 leading-none pulse-red inline-block rounded-lg">{critH}h</span>
                  <span className="text-lg font-semibold font-mono text-red-600">{critM}m</span>
                </>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            {batch.isAlreadyCritical
              ? `crossed the acceptable-quality threshold ${batch.daysPastCritical > 0 ? `${batch.daysPastCritical} day${batch.daysPastCritical === 1 ? '' : 's'} ago` : 'today'}`
              : 'at current temperature and storage conditions'}
          </p>
        </div>

        {/* Agent activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="2" stroke="#1e6b45" strokeWidth="1.3" /><circle cx="5" cy="8" r="1.5" fill="#1e6b45" /><path d="M8 8h4" stroke="#1e6b45" strokeWidth="1.2" strokeLinecap="round" /><path d="M8 6h4M8 10h2" stroke="#1e6b45" strokeWidth="1" strokeLinecap="round" opacity="0.4" /></svg>
            <h2 className="font-semibold text-stone-900 text-sm">AI Analysis Activity</h2>
          </div>
          <div className="space-y-3">
            {agents.map((a, i) => (
              <div
                key={a.name}
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all duration-500 ${agentsVisible[i] ? 'border-emerald-100 bg-emerald-50/50 agent-item opacity-100' : 'border-stone-100 bg-stone-50 opacity-30'}`}
                style={{ animationDelay: `${a.delay}ms` }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${agentsVisible[i] ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-400'}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" /><path d="M8 4v4.5l3 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-stone-800">{a.name} Agent</span>
                    {agentsVisible[i] && (
                      <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-5 min-w-0">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-semibold text-stone-900">Projected Value Retention</h2>
            <p className="text-xs text-stone-400 mt-0.5">{batch.crop} · {batch.district} conditions</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-3 h-0.5 bg-emerald-400 rounded" /><span className="text-stone-500">Premium Quality</span></div>
            <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-3 h-0.5 bg-amber-400 rounded" /><span className="text-stone-500">Acceptable</span></div>
            <div className="flex items-center gap-1.5 whitespace-nowrap"><div className="w-3 h-0.5 bg-red-400 rounded" /><span className="text-stone-500">Loss Zone</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240} minWidth={0}>
          <AreaChart data={curveData} margin={{ top: 12, right: 80, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e6b45" stopOpacity={0.2} />
                <stop offset="60%" stopColor="#d97706" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} height={30} tickMargin={8} minTickGap={20} />
            <YAxis width={42} tick={{ fontSize: 11, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 8, fontSize: 12 }}
              formatter={(v: unknown) => [`${v}%`, 'Value Retained']}
              labelFormatter={(l: unknown) => `Day ${l}`}
            />
            <ReferenceLine y={60} stroke="#d97706" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'Acceptable', position: 'right', fontSize: 10, fill: '#d97706' }} />
            <ReferenceLine y={30} stroke="#b91c1c" strokeDasharray="4 3" strokeOpacity={0.5} label={{ value: 'Critical', position: 'right', fontSize: 10, fill: '#b91c1c' }} />
            <Area type="monotone" dataKey="value" stroke="#1e6b45" strokeWidth={2} fill="url(#valueGrad)" />
            {curveData[1] && <ReferenceDot x={curveData[1].day} y={curveData[1].value} r={5} fill="#b91c1c" stroke="white" strokeWidth={2} className="pulse-red" />}
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-1 text-center text-xs leading-5 text-stone-500">Days After Harvest</p>
      </div>

      {/* ── Weather Forecast Panel (real backend only) ─────────────────── */}
      {batch.real && batch.real.forecast.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2a4 4 0 0 1 4 4c0 1.5-.7 2.8-1.7 3.7L8 14l-2.3-4.3A4 4 0 0 1 4 6a4 4 0 0 1 4-4z" stroke="#d97706" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
              <circle cx="8" cy="6" r="1.2" fill="#d97706" />
            </svg>
            <h2 className="font-semibold text-stone-900 text-sm">7-Day Weather Forecast</h2>
            {batch.real.forecastDriven && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Spoilage curve uses forecast temperatures
              </span>
            )}
          </div>

          {/* Day cards — horizontal scrollable row */}
          <div className="overflow-x-auto pb-1">
            <div className="flex gap-2.5 min-w-max">
              {batch.real.forecast.map((day, i) => {
                const dateObj = new Date(day.date + 'T00:00:00');
                const dayName = dateObj.toLocaleDateString('en-PK', { weekday: 'short' });
                const dateLabel = dateObj.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });

                // Temperature color
                const tempColor = day.max_temp >= 42
                  ? 'text-red-600 bg-red-50'
                  : day.max_temp >= 38
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-emerald-700 bg-emerald-50';

                // WMO weathercode → emoji
                const code = day.weathercode;
                const weatherEmoji = code >= 95 ? '⛈️'
                  : code >= 80 ? '🌧️'
                  : code >= 71 ? '❄️'
                  : code >= 61 ? '🌦️'
                  : code >= 51 ? '🌂'
                  : code >= 3 ? '⛅'
                  : '☀️';

                // Check if this day has a forecast event
                const dayEvent = batch.real!.forecastEvents.find(e => e.day_offset === i);
                const hasBorder = dayEvent
                  ? dayEvent.severity === 'HIGH' ? 'border-red-300' : 'border-amber-300'
                  : 'border-stone-200';

                return (
                  <div
                    key={day.date}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-stone-50 min-w-[80px] ${hasBorder}`}
                  >
                    <span className="text-xs font-semibold text-stone-500">{i === 0 ? 'Today' : dayName}</span>
                    <span className="text-xs text-stone-400">{dateLabel}</span>
                    <span className="text-lg leading-none">{weatherEmoji}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${tempColor}`}>
                      {day.max_temp}°C
                    </span>
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M5 1v5M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <path d="M2 8h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
                      </svg>
                      <span>{day.precipitation_mm}mm</span>
                    </div>
                    <span className="text-xs text-stone-400">{day.avg_humidity}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event alert list */}
          <div className="mt-4">
            {batch.real.forecastEvents.length === 0 ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="#1e6b45" strokeWidth="1.2" />
                  <path d="M4.5 7l2 2 3-3" stroke="#1e6b45" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                No weather hazards forecast in the next 7 days
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">Forecast Hazards</p>
                {batch.real.forecastEvents.map((event, idx) => {
                  const severityStyle = event.severity === 'HIGH'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : event.severity === 'MEDIUM'
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-blue-50 border-blue-200 text-blue-700';
                  const dayLabel = event.day_offset === 0 ? 'Today' : event.day_offset === 1 ? 'Tomorrow' : `Day ${event.day_offset}`;
                  const eventIcons: Record<string, string> = {
                    HEAVY_RAIN: '🌧️',
                    STORM: '⛈️',
                    EXTREME_HEAT: '🌡️',
                    HIGH_HUMIDITY: '💧',
                  };
                  return (
                    <div key={idx} className={`flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-xs ${severityStyle}`}>
                      <span className="text-base leading-none mt-0.5">{eventIcons[event.event_type] ?? '⚠️'}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold">
                          [{event.severity}] {dayLabel} ({event.date}): {event.event_type.replace(/_/g, ' ')}
                        </span>
                        <span className="mx-1">—</span>
                        <span className="font-normal">{event.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full AI analysis text (real backend only - this is the LLM's actual reasoning, citing research) */}
      {batch.real && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" stroke="#1e6b45" strokeWidth="1.3" fill="#1e6b45" fillOpacity="0.15" strokeLinejoin="round" /></svg>
            <h2 className="font-semibold text-stone-900 text-sm">Spoilage Analyst — Full Reasoning</h2>
          </div>
          <MarkdownLite text={batch.real.spoilageAnalysisText} className="text-sm text-stone-700" />
        </div>
      )}

      {/* Risk breakdown + Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-stone-900 text-sm mb-3">Risk Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riskCards.map(r => (
              <div key={r.label} className={`bg-white rounded-xl border shadow-sm p-4 ${r.level === 'HIGH' ? 'border-red-100' : r.level === 'MEDIUM' ? 'border-amber-100' : 'border-emerald-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-stone-500">{r.label}</span>
                  <RiskBadge risk={r.level} />
                </div>
                <div className="text-xl font-bold font-mono text-stone-900">{r.value}</div>
                <div className="text-xs text-stone-400 mt-0.5">{r.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-stone-900 rounded-xl p-5 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" stroke="#1e6b45" strokeWidth="1.3" fill="#1e6b45" fillOpacity="0.3" strokeLinejoin="round" /></svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">AI Recommendation</span>
            </div>
            <p className="text-base font-bold text-white leading-snug mb-3">{batch.recommendedAction}.</p>
            <p className="text-xs text-stone-400 leading-relaxed">
              {batch.risk === 'HIGH'
                ? 'Current heat exposure is accelerating value loss faster than the potential price increase from delayed selling.'
                : batch.risk === 'MEDIUM'
                  ? 'Conditions are manageable for now, but moving to better storage would reduce risk further.'
                  : 'Conditions are favorable — continue monitoring and no urgent action is required.'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('scenario', batch.id)}
            className="mt-5 w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: '#1e6b45' }}
          >
            Compare Scenarios
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M7.5 3.5l3.5 3.5-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

