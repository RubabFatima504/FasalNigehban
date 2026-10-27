// // import { useMemo } from 'react';
// // import {
// //   ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
// // } from 'recharts';
// // import Logo from '../components/Logo';
// // import MarkdownLite from '../components/MarkdownLite';
// // import { LoadingState, EmptyState } from '../components/StateViews';
// // import { useBatches } from '../context/BatchContext';
// // import { buildScenarios, buildValueCurve } from '../utils/riskEngine';
// // import { mapRealCurve, mapRealScenarios } from '../utils/realDataAdapters';
// // import { formatKg, formatPkrFull, formatPct } from '../utils/format';

// // interface Props { onNavigate: (screen: string, batchId?: string) => void; batchId?: string; }

// // const SOURCES_BY_CROP: Record<string, { source: string; desc: string }[]> = {
// //   Mango: [
// //     { source: 'FAOSTAT', desc: 'Post-harvest mango loss rates, South Asia 2024' },
// //     { source: 'PARC Research', desc: 'Mango shelf-life temperature correlation study' },
// //   ],
// //   Rice: [
// //     { source: 'FAOSTAT', desc: 'Post-harvest grain loss rates, South Asia 2024' },
// //     { source: 'PARC Research', desc: 'Rice moisture and storage correlation study' },
// //   ],
// // };

// // export default function Report({ onNavigate, batchId }: Props) {
// //   const { batches, loading } = useBatches();
// //   const batch = useMemo(() => batches.find(b => b.id === batchId) ?? batches[0], [batches, batchId]);
// //   const curveData = useMemo(
// //     () => (batch ? (batch.real ? mapRealCurve(batch.real) : buildValueCurve(batch)).slice(0, 9) : []),
// //     [batch],
// //   );
// //   const scenarios = useMemo(
// //     () => (batch ? (batch.real ? mapRealScenarios(batch.real) : buildScenarios(batch)) : []),
// //     [batch],
// //   );

// //   if (loading) return <LoadingState label="Generating report..." minHeight={400} />;

// //   if (!batch) {
// //     return (
// //       <EmptyState
// //         title="No batch selected"
// //         subtitle="Pick a batch from the dashboard to generate a loss-prevention report."
// //         action={
// //           <button
// //             onClick={() => onNavigate('dashboard')}
// //             className="mt-2 px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
// //             style={{ background: '#1e6b45' }}
// //           >
// //             Go to Dashboard
// //           </button>
// //         }
// //       />
// //     );
// //   }

// //   const recommended = scenarios.find(s => s.recommended) ?? scenarios[0];
// //   const sellToday = scenarios.find(s => s.id === 'A') ?? scenarios[0];
// //   const valueAtRisk = sellToday.pricePerKg * batch.quantityKg * (batch.projectedValueLossPct / 100);
// //   const lossReductionPct = recommended
// //     ? Math.round(((recommended.netRevenue - sellToday.netRevenue) / Math.max(1, sellToday.netRevenue)) * 100)
// //     : 0;
// //   const cropFamily = batch.crop.startsWith('Rice') ? 'Rice' : 'Mango';
// //   const sources = [
// //     ...SOURCES_BY_CROP[cropFamily],
// //     { source: `${batch.district} Wholesale Market`, desc: `Local market price index, ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}` },
// //     { source: 'PMD Weather', desc: `${batch.district} ambient temperature data, current` },
// //   ];

// //   return (
// //     <div className="max-w-3xl animate-fade-in">
// //       <div className="flex items-center gap-2 text-xs text-stone-400 mb-4">
// //         <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
// //         <span>›</span>
// //         <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('scenario', batch.id)}>Scenarios</span>
// //         <span>›</span>
// //         <span className="text-stone-600">Report · {batch.id}</span>
// //       </div>

// //       <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
// //         {/* Report header */}
// //         <div className="px-8 py-6 border-b border-stone-100" style={{ background: '#faf8f5' }}>
// //           <div className="flex items-start justify-between flex-wrap gap-3">
// //             <div className="flex items-center gap-3">
// //               <Logo size={36} />
// //               <div>
// //                 <div className="text-xs font-bold tracking-[0.15em] text-stone-400 uppercase">HarvestGuard</div>
// //                 <div className="text-xs text-stone-300 tracking-wide">AI Post-Harvest Intelligence</div>
// //               </div>
// //             </div>
// //             <div className="text-right">
// //               <div className="text-xs font-bold tracking-[0.12em] text-stone-500 uppercase">Loss-Prevention Report</div>
// //               <div className="text-xs text-stone-400 mt-0.5">Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
// //             </div>
// //           </div>

// //           <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
// //             {[
// //               { label: 'Batch ID', value: batch.id },
// //               { label: 'Crop', value: batch.crop },
// //               { label: 'Quantity', value: formatKg(batch.quantityKg) },
// //               { label: 'Location', value: `${batch.district}, ${batch.region}` },
// //             ].map(f => (
// //               <div key={f.label}>
// //                 <div className="text-xs text-stone-400 uppercase tracking-wider">{f.label}</div>
// //                 <div className="font-semibold text-stone-800 text-sm mt-0.5 font-mono">{f.value}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         <div className="px-8 py-6 space-y-7">
// //           {/* Executive Summary */}
// //           <section>
// //             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Executive Summary</h2>
// //             {batch.real ? (
// //               <MarkdownLite text={batch.real.advisory.executive_summary} className="text-stone-700 text-sm" />
// //             ) : (
// //               <p className="text-stone-700 leading-relaxed text-sm">
// //                 This batch of <strong>{formatKg(batch.quantityKg)} {batch.crop}</strong> harvested in {batch.district}, {batch.region} is currently at{' '}
// //                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${batch.risk === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' : batch.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{batch.risk} RISK</span>{' '}
// //                 of value loss due to {batch.temperatureC >= 30 ? 'elevated temperature' : 'current conditions'} ({batch.temperatureC}°C) and {batch.storageType.toLowerCase()} storage conditions.
// //                 Without intervention, approximately <strong>{formatPct(batch.projectedValueLossPct)} of batch value may be lost within {batch.hoursToCriticalLoss < 48 ? `${batch.hoursToCriticalLoss} hours` : `${Math.round(batch.hoursToCriticalLoss / 24)} days`}</strong>.
// //               </p>
// //             )}
// //             <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
// //               {[
// //                 { label: 'Current Risk Level', value: batch.risk, style: 'text-red-700 bg-red-50 border-red-100' },
// //                 { label: 'Value at Risk', value: formatPkrFull(valueAtRisk), style: 'text-amber-700 bg-amber-50 border-amber-100' },
// //                 { label: 'Optimal Recovery', value: formatPkrFull(recommended.netRevenue), style: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
// //               ].map(s => (
// //                 <div key={s.label} className={`rounded-lg border px-3 py-2.5 ${s.style}`}>
// //                   <div className="text-xs opacity-70 mb-0.5">{s.label}</div>
// //                   <div className="font-bold font-mono text-lg">{s.value}</div>
// //                 </div>
// //               ))}
// //             </div>
// //           </section>

// //           {/* Recommended Action */}
// //           <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
// //             <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Recommended Action</div>
// //             <h3 className="text-base font-bold text-stone-900 mb-3">{recommended.title} — {recommended.sub}.</h3>
// //             <div className="flex gap-6 text-sm flex-wrap">
// //               <div>
// //                 <div className="text-xs text-stone-400 mb-0.5">Expected Net Revenue</div>
// //                 <div className="text-xl font-bold font-mono text-emerald-700">{formatPkrFull(recommended.netRevenue)}</div>
// //               </div>
// //               <div>
// //                 <div className="text-xs text-stone-400 mb-0.5">Estimated Loss Reduction</div>
// //                 <div className="text-xl font-bold font-mono text-emerald-700">{formatPct(Math.max(0, lossReductionPct))}</div>
// //               </div>
// //             </div>
// //           </section>

// //           {/* Spoilage chart */}
// //           <section>
// //             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Projected Value Curve</h2>
// //             <div className="border border-stone-100 rounded-lg p-4">
// //               <ResponsiveContainer width="100%" height={140}>
// //                 <AreaChart data={curveData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
// //                   <defs>
// //                     <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
// //                       <stop offset="0%" stopColor="#1e6b45" stopOpacity={0.2}/>
// //                       <stop offset="100%" stopColor="#1e6b45" stopOpacity={0}/>
// //                     </linearGradient>
// //                   </defs>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8"/>
// //                   <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} label={{ value: 'Days', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#a8a29e' }}/>
// //                   <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]}/>
// //                   <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 6, fontSize: 11 }} formatter={(v: unknown) => [`${v}%`, 'Value']}/>
// //                   <Area type="monotone" dataKey="value" stroke="#1e6b45" strokeWidth={2} fill="url(#rptGrad)"/>
// //                 </AreaChart>
// //               </ResponsiveContainer>
// //             </div>
// //           </section>

// //           {/* Scenario table */}
// //           <section>
// //             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Scenario Comparison</h2>
// //             <div className="border border-stone-200 rounded-lg overflow-x-auto">
// //               <table className="w-full text-sm">
// //                 <thead>
// //                   <tr className="bg-stone-50 border-b border-stone-200">
// //                     {['Scenario','Price','Spoilage Risk','Costs','Net Revenue',''].map(h => (
// //                       <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">{h}</th>
// //                     ))}
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {scenarios.map(row => (
// //                     <tr key={row.id} className={`border-b border-stone-100 ${row.recommended ? 'bg-emerald-50/50' : ''}`}>
// //                       <td className="px-4 py-3 font-medium text-stone-800">{row.title}</td>
// //                       <td className="px-4 py-3 font-mono text-stone-600">₨{row.pricePerKg}/kg</td>
// //                       <td className="px-4 py-3 font-mono text-stone-600">{formatPct(row.spoilagePct)}</td>
// //                       <td className="px-4 py-3 font-mono text-stone-600">{formatPkrFull(row.costPerKg * batch.quantityKg)}</td>
// //                       <td className="px-4 py-3 font-mono font-semibold text-stone-800">{formatPkrFull(row.netRevenue)}</td>
// //                       <td className="px-4 py-3">
// //                         {row.recommended && <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Recommended</span>}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>
// //           </section>

// //           {/* Supporting evidence */}
// //           <section>
// //             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Supporting Evidence</h2>
// //             {batch.real ? (
// //               <MarkdownLite text={batch.real.advisory.supporting_evidence} className="text-sm text-stone-600" />
// //             ) : (
// //               <div className="space-y-2">
// //                 {sources.map((s, i) => (
// //                   <div key={i} className="flex items-start gap-3 text-sm">
// //                     <span className="text-xs font-mono text-stone-400 mt-0.5 w-5 flex-shrink-0">[{i + 1}]</span>
// //                     <div>
// //                       <span className="font-semibold text-stone-700">{s.source}</span>
// //                       <span className="text-stone-400"> — {s.desc}</span>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </section>

// //           {/* Regional context */}
// //           <section className="bg-stone-50 rounded-lg border border-stone-200 p-4">
// //             <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Regional Context</h2>
// //             {batch.real ? (
// //               <MarkdownLite text={batch.real.advisory.regional_context} className="text-sm text-stone-600" />
// //             ) : (
// //               <p className="text-sm text-stone-600 leading-relaxed">
// //                 In {batch.district} district, post-harvest {cropFamily.toLowerCase()} losses remain a significant value risk. Following the recommended {recommended.title.toLowerCase()} intervention could substantially reduce expected loss and represents a model transferable to other cooperative batches in {batch.region}.
// //               </p>
// //             )}
// //           </section>
// //         </div>

// //         {/* Actions */}
// //         <div className="px-8 py-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3 bg-stone-50">
// //           <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm" style={{ background: '#1e6b45' }}>
// //             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 7l4 4 4-4M1 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
// //             Download PDF
// //           </button>
// //           <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all" style={{ background: '#25D366' }}>
// //             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2"/><path d="M4.5 7c0-1.4 1.1-2.5 2.5-2.5 1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5-.5 0-.9-.1-1.3-.4L3.5 10l.4-1.7A2.4 2.4 0 014.5 7z" stroke="white" strokeWidth="1.2"/></svg>
// //             Share via WhatsApp
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// import { useMemo } from 'react';
// import {
//   ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
// } from 'recharts';
// import Logo from '../components/Logo';
// import MarkdownLite from '../components/MarkdownLite';
// import { LoadingState, EmptyState } from '../components/StateViews';
// import { useBatches } from '../context/BatchContext';
// import { buildScenarios, buildValueCurve } from '../utils/riskEngine';
// import { mapRealCurve, mapRealScenarios } from '../utils/realDataAdapters';
// import { formatKg, formatPkrFull, formatPct } from '../utils/format';

// interface Props { onNavigate: (screen: string, batchId?: string) => void; batchId?: string; }

// const SOURCES_BY_CROP: Record<string, { source: string; desc: string }[]> = {
//   Mango: [
//     { source: 'FAOSTAT', desc: 'Post-harvest mango loss rates, South Asia 2024' },
//     { source: 'PARC Research', desc: 'Mango shelf-life temperature correlation study' },
//   ],
//   Rice: [
//     { source: 'FAOSTAT', desc: 'Post-harvest grain loss rates, South Asia 2024' },
//     { source: 'PARC Research', desc: 'Rice moisture and storage correlation study' },
//   ],
// };

// export default function Report({ onNavigate, batchId }: Props) {
//   const { batches, loading } = useBatches();
//   const batch = useMemo(() => batches.find(b => b.id === batchId) ?? batches[0], [batches, batchId]);
//   const curveData = useMemo(
//     () => (batch ? (batch.real ? mapRealCurve(batch.real) : buildValueCurve(batch)).slice(0, 9) : []),
//     [batch],
//   );
//   const scenarios = useMemo(
//     () => (batch ? (batch.real ? mapRealScenarios(batch.real) : buildScenarios(batch)) : []),
//     [batch],
//   );

//   if (loading) return <LoadingState label="Generating report..." minHeight={400} />;

//   if (!batch) {
//     return (
//       <EmptyState
//         title="No batch selected"
//         subtitle="Pick a batch from the dashboard to generate a loss-prevention report."
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

//   const recommended = scenarios.find(s => s.recommended) ?? scenarios[0];
//   const sellToday = scenarios.find(s => s.id === 'A') ?? scenarios[0];
//   const valueAtRisk = sellToday.pricePerKg * batch.quantityKg * (batch.projectedValueLossPct / 100);
//   const lossReductionPct = recommended
//     ? Math.round(((recommended.netRevenue - sellToday.netRevenue) / Math.max(1, sellToday.netRevenue)) * 100)
//     : 0;
//   const cropFamily = batch.crop.startsWith('Rice') ? 'Rice' : 'Mango';
//   const sources = [
//     ...SOURCES_BY_CROP[cropFamily],
//     { source: `${batch.district} Wholesale Market`, desc: `Local market price index, ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}` },
//     { source: 'PMD Weather', desc: `${batch.district} ambient temperature data, current` },
//   ];

//   return (
//     <div className="max-w-3xl animate-fade-in">
//       <div className="flex items-center gap-2 text-xs text-stone-400 mb-4">
//         <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
//         <span>›</span>
//         <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('scenario', batch.id)}>Scenarios</span>
//         <span>›</span>
//         <span className="text-stone-600">Report · {batch.id}</span>
//       </div>

//       <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
//         {/* Report header */}
//         <div className="px-8 py-6 border-b border-stone-100" style={{ background: '#faf8f5' }}>
//           <div className="flex items-start justify-between flex-wrap gap-3">
//             <div className="flex items-center gap-3">
//               <Logo size={36} />
//               <div>
//                 <div className="text-xs font-bold tracking-[0.15em] text-stone-400 uppercase">HarvestGuard</div>
//                 <div className="text-xs text-stone-300 tracking-wide">AI Post-Harvest Intelligence</div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-xs font-bold tracking-[0.12em] text-stone-500 uppercase">Loss-Prevention Report</div>
//               <div className="text-xs text-stone-400 mt-0.5">Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
//             </div>
//           </div>

//           <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
//             {[
//               { label: 'Batch ID', value: batch.id },
//               { label: 'Crop', value: batch.crop },
//               { label: 'Quantity', value: formatKg(batch.quantityKg) },
//               { label: 'Location', value: `${batch.district}, ${batch.region}` },
//             ].map(f => (
//               <div key={f.label}>
//                 <div className="text-xs text-stone-400 uppercase tracking-wider">{f.label}</div>
//                 <div className="font-semibold text-stone-800 text-sm mt-0.5 font-mono">{f.value}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="px-8 py-6 space-y-7">
//           {/* Executive Summary */}
//           <section>
//             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Executive Summary</h2>
//             {batch.real ? (
//               <MarkdownLite text={batch.real.advisory.executive_summary} className="text-stone-700 text-sm" />
//             ) : (
//               <p className="text-stone-700 leading-relaxed text-sm">
//                 This batch of <strong>{formatKg(batch.quantityKg)} {batch.crop}</strong> harvested in {batch.district}, {batch.region} is currently at{' '}
//                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${batch.risk === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' : batch.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{batch.risk} RISK</span>{' '}
//                 of value loss due to {batch.temperatureC >= 30 ? 'elevated temperature' : 'current conditions'} ({batch.temperatureC}°C) and {batch.storageType.toLowerCase()} storage conditions.
//                 {batch.isAlreadyCritical ? (
//                   <>Without intervention, this batch has already lost approximately <strong>{formatPct(batch.projectedValueLossPct)} of its value</strong> and remains at risk of further loss.</>
//                 ) : (
//                   <>Without intervention, approximately <strong>{formatPct(batch.projectedValueLossPct)} of batch value may be lost within {batch.hoursToCriticalLoss < 48 ? `${batch.hoursToCriticalLoss} hours` : `${Math.round(batch.hoursToCriticalLoss / 24)} days`}</strong>.</>
//                 )}
//               </p>
//             )}
//             <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
//               {[
//                 { label: 'Current Risk Level', value: batch.risk, style: 'text-red-700 bg-red-50 border-red-100' },
//                 { label: 'Value at Risk', value: formatPkrFull(valueAtRisk), style: 'text-amber-700 bg-amber-50 border-amber-100' },
//                 { label: 'Optimal Recovery', value: formatPkrFull(recommended.netRevenue), style: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
//               ].map(s => (
//                 <div key={s.label} className={`rounded-lg border px-3 py-2.5 ${s.style}`}>
//                   <div className="text-xs opacity-70 mb-0.5">{s.label}</div>
//                   <div className="font-bold font-mono text-lg">{s.value}</div>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* Recommended Action */}
//           <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
//             <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Recommended Action</div>
//             <h3 className="text-base font-bold text-stone-900 mb-3">{recommended.title} — {recommended.sub}.</h3>
//             <div className="flex gap-6 text-sm flex-wrap">
//               <div>
//                 <div className="text-xs text-stone-400 mb-0.5">Expected Net Revenue</div>
//                 <div className="text-xl font-bold font-mono text-emerald-700">{formatPkrFull(recommended.netRevenue)}</div>
//               </div>
//               <div>
//                 <div className="text-xs text-stone-400 mb-0.5">Estimated Loss Reduction</div>
//                 <div className="text-xl font-bold font-mono text-emerald-700">{formatPct(Math.max(0, lossReductionPct))}</div>
//               </div>
//             </div>
//           </section>

//           {/* Spoilage chart */}
//           <section>
//             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Projected Value Curve</h2>
//             <div className="border border-stone-100 rounded-lg p-4">
//               <ResponsiveContainer width="100%" height={140}>
//                 <AreaChart data={curveData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
//                   <defs>
//                     <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%" stopColor="#1e6b45" stopOpacity={0.2} />
//                       <stop offset="100%" stopColor="#1e6b45" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
//                   <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} label={{ value: 'Days', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#a8a29e' }} />
//                   <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
//                   <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 6, fontSize: 11 }} formatter={(v: unknown) => [`${v}%`, 'Value']} />
//                   <Area type="monotone" dataKey="value" stroke="#1e6b45" strokeWidth={2} fill="url(#rptGrad)" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </section>

//           {/* Scenario table */}
//           <section>
//             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Scenario Comparison</h2>
//             <div className="border border-stone-200 rounded-lg overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead>
//                   <tr className="bg-stone-50 border-b border-stone-200">
//                     {['Scenario', 'Price', 'Spoilage Risk', 'Costs', 'Net Revenue', ''].map(h => (
//                       <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scenarios.map(row => (
//                     <tr key={row.id} className={`border-b border-stone-100 ${row.recommended ? 'bg-emerald-50/50' : ''}`}>
//                       <td className="px-4 py-3 font-medium text-stone-800">{row.title}</td>
//                       <td className="px-4 py-3 font-mono text-stone-600">₨{row.pricePerKg}/kg</td>
//                       <td className="px-4 py-3 font-mono text-stone-600">{formatPct(row.spoilagePct)}</td>
//                       <td className="px-4 py-3 font-mono text-stone-600">{formatPkrFull(row.costPerKg * batch.quantityKg)}</td>
//                       <td className="px-4 py-3 font-mono font-semibold text-stone-800">{formatPkrFull(row.netRevenue)}</td>
//                       <td className="px-4 py-3">
//                         {row.recommended && <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Recommended</span>}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </section>

//           {/* Supporting evidence */}
//           <section>
//             <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Supporting Evidence</h2>
//             {batch.real ? (
//               <MarkdownLite text={batch.real.advisory.supporting_evidence} className="text-sm text-stone-600" />
//             ) : (
//               <div className="space-y-2">
//                 {sources.map((s, i) => (
//                   <div key={i} className="flex items-start gap-3 text-sm">
//                     <span className="text-xs font-mono text-stone-400 mt-0.5 w-5 flex-shrink-0">[{i + 1}]</span>
//                     <div>
//                       <span className="font-semibold text-stone-700">{s.source}</span>
//                       <span className="text-stone-400"> — {s.desc}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </section>

//           {/* Regional context */}
//           <section className="bg-stone-50 rounded-lg border border-stone-200 p-4">
//             <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Regional Context</h2>
//             {batch.real ? (
//               <MarkdownLite text={batch.real.advisory.regional_context} className="text-sm text-stone-600" />
//             ) : (
//               <p className="text-sm text-stone-600 leading-relaxed">
//                 In {batch.district} district, post-harvest {cropFamily.toLowerCase()} losses remain a significant value risk. Following the recommended {recommended.title.toLowerCase()} intervention could substantially reduce expected loss and represents a model transferable to other cooperative batches in {batch.region}.
//               </p>
//             )}
//           </section>
//         </div>

//         {/* Actions */}
//         <div className="px-8 py-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3 bg-stone-50">
//           <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm" style={{ background: '#1e6b45' }}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 7l4 4 4-4M1 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
//             Download PDF
//           </button>
//           <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all" style={{ background: '#25D366' }}>
//             <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.2" /><path d="M4.5 7c0-1.4 1.1-2.5 2.5-2.5 1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5-.5 0-.9-.1-1.3-.4L3.5 10l.4-1.7A2.4 2.4 0 014.5 7z" stroke="white" strokeWidth="1.2" /></svg>
//             Share via WhatsApp
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useMemo, useRef, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import Logo from '../components/Logo';
import MarkdownLite from '../components/MarkdownLite';
import { LoadingState, EmptyState } from '../components/StateViews';
import { useBatches } from '../context/BatchContext';
import { buildScenarios, buildValueCurve } from '../utils/riskEngine';
import { mapRealCurve, mapRealScenarios } from '../utils/realDataAdapters';
import { formatKg, formatPkrFull, formatPct } from '../utils/format';

interface Props { onNavigate: (screen: string, batchId?: string) => void; batchId?: string; }

const SOURCES_BY_CROP: Record<string, { source: string; desc: string }[]> = {
  Mango: [
    { source: 'FAOSTAT', desc: 'Post-harvest mango loss rates, South Asia 2024' },
    { source: 'PARC Research', desc: 'Mango shelf-life temperature correlation study' },
  ],
  Rice: [
    { source: 'FAOSTAT', desc: 'Post-harvest grain loss rates, South Asia 2024' },
    { source: 'PARC Research', desc: 'Rice moisture and storage correlation study' },
  ],
};

interface PdfKeepRange { top: number; bottom: number; }

/** Break before a fitting block, or between text lines in an oversized block. */
function buildPdfPageSlices(totalHeight: number, pageHeight: number, ranges: PdfKeepRange[]) {
  const protectedRanges = ranges.filter(r => r.bottom > r.top && r.bottom - r.top <= pageHeight);
  const pages: { top: number; height: number }[] = [];
  let top = 0;
  while (top < totalHeight) {
    let bottom = Math.min(top + pageHeight, totalHeight);
    if (bottom < totalHeight) {
      // Moving a paragraph can expose its heading at the old page bottom;
      // repeat until all overlapping keep-together ranges are respected.
      let previous: number;
      do {
        previous = bottom;
        for (const range of protectedRanges) {
          if (range.top > top && range.top < bottom && range.bottom > bottom) {
            bottom = range.top;
          }
        }
      } while (bottom < previous);
    }
    pages.push({ top, height: bottom - top });
    top = bottom;
  }
  return pages;
}

/** Measure the cloned DOM used for capture, so text and image coordinates agree. */
function collectPdfKeepRanges(root: HTMLElement): PdfKeepRange[] {
  const origin = root.getBoundingClientRect().top;
  const ranges: PdfKeepRange[] = [];
  const add = (top: number, bottom: number) => {
    if (bottom > top) ranges.push({ top: Math.max(0, top - origin - 2), bottom: bottom - origin + 2 });
  };
  root.querySelectorAll<HTMLElement>('[data-pdf-keep], section, p, tr, svg, img').forEach(element => {
    const rect = element.getBoundingClientRect();
    add(rect.top, rect.bottom);
  });

  // A long paragraph may exceed a page. Protect each rendered line as well,
  // including lines containing inline bold text, instead of cutting at a pixel count.
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    const range = root.ownerDocument.createRange();
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) add(rect.top, rect.bottom);
  }

  // Keep headings with at least the first line of the content that follows.
  root.querySelectorAll('h2, h3, thead').forEach(heading => {
    const following = heading.nextElementSibling;
    if (!following) return;
    const headingRect = heading.getBoundingClientRect();
    const contentWalker = root.ownerDocument.createTreeWalker(following, NodeFilter.SHOW_TEXT);
    let text: Node | null;
    while ((text = contentWalker.nextNode())) {
      if (!text.textContent?.trim()) continue;
      const range = root.ownerDocument.createRange();
      range.selectNodeContents(text);
      const firstLine = range.getClientRects()[0];
      if (firstLine) { add(headingRect.top, firstLine.bottom); break; }
    }
  });
  return ranges;
}

export default function Report({ onNavigate, batchId }: Props) {
  const { batches, loading } = useBatches();
  const batch = useMemo(() => batches.find(b => b.id === batchId) ?? batches[0], [batches, batchId]);
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const curveData = useMemo(
    () => (batch ? (batch.real ? mapRealCurve(batch.real) : buildValueCurve(batch)).slice(0, 9) : []),
    [batch],
  );
  const scenarios = useMemo(
    () => (batch ? (batch.real ? mapRealScenarios(batch.real) : buildScenarios(batch)) : []),
    [batch],
  );

  if (loading) return <LoadingState label="Generating report..." minHeight={400} />;

  if (!batch) {
    return (
      <EmptyState
        title="No batch selected"
        subtitle="Pick a batch from the dashboard to generate a loss-prevention report."
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

  const recommended = scenarios.find(s => s.recommended) ?? scenarios[0];
  const sellToday = scenarios.find(s => s.id === 'A') ?? scenarios[0];
  const valueAtRisk = sellToday.pricePerKg * batch.quantityKg * (batch.projectedValueLossPct / 100);
  const lossReductionPct = recommended
    ? Math.round(((recommended.netRevenue - sellToday.netRevenue) / Math.max(1, sellToday.netRevenue)) * 100)
    : 0;
  const cropFamily = batch.crop.startsWith('Rice') ? 'Rice' : 'Mango';
  const sources = [
    ...SOURCES_BY_CROP[cropFamily],
    { source: `${batch.district} Wholesale Market`, desc: `Local market price index, ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}` },
    { source: 'PMD Weather', desc: `${batch.district} ambient temperature data, current` },
  ];

  async function handleDownloadPdf() {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas-pro'),
        import('jspdf'),
      ]);

      await document.fonts.ready;
      let keepRanges: PdfKeepRange[] = [];
      let captureWidth = 0;
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        onclone: (_document, element) => {
          captureWidth = element.getBoundingClientRect().width;
          keepRanges = collectPdfKeepRanges(element);
        },
      });
      if (!canvas.width || !canvas.height || !captureWidth) throw new Error('The report is empty.');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const margin = 12;
      const contentWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const contentHeight = pdf.internal.pageSize.getHeight() - margin - 16;
      const scale = canvas.width / captureWidth;
      const pageHeight = Math.floor(canvas.width * contentHeight / contentWidth);
      const pages = buildPdfPageSlices(canvas.height, pageHeight, keepRanges.map(range => ({
        top: Math.max(0, Math.floor(range.top * scale)),
        bottom: Math.min(canvas.height, Math.ceil(range.bottom * scale)),
      })));

      pages.forEach((page, index) => {
        if (index > 0) pdf.addPage('a4', 'portrait');
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = page.height;
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) throw new Error('Canvas rendering is unavailable.');
        ctx.drawImage(canvas, 0, page.top, canvas.width, page.height, 0, 0, canvas.width, page.height);
        pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', margin, margin,
          contentWidth, page.height * contentWidth / canvas.width);
        pdf.setFontSize(8);
        pdf.setTextColor(120, 113, 108);
        pdf.text(`Page ${index + 1} of ${pages.length}`, pdf.internal.pageSize.getWidth() - margin,
          pdf.internal.pageSize.getHeight() - 7, { align: 'right' });
        // Release each temporary page bitmap once jsPDF has copied it.
        pageCanvas.width = 0;
        pageCanvas.height = 0;
      });
      pdf.save(`HarvestGuard-Report-${batch.id}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
      setDownloadError('Could not generate the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-stone-400 mb-4">
        <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
        <span>›</span>
        <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('scenario', batch.id)}>Scenarios</span>
        <span>›</span>
        <span className="text-stone-600">Report · {batch.id}</span>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Capture only report content; the download controls stay outside the PDF. */}
        <div ref={reportRef} className="bg-white">
          {/* Report header */}
          <div data-pdf-keep className="px-8 py-6 border-b border-stone-100" style={{ background: '#faf8f5' }}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <Logo size={36} />
                <div>
                  <div className="text-xs font-bold tracking-[0.15em] text-stone-400 uppercase">HarvestGuard</div>
                  <div className="text-xs text-stone-300 tracking-wide">AI Post-Harvest Intelligence</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold tracking-[0.12em] text-stone-500 uppercase">Loss-Prevention Report</div>
                <div className="text-xs text-stone-400 mt-0.5">Generated {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Batch ID', value: batch.id },
                { label: 'Crop', value: batch.crop },
                { label: 'Quantity', value: formatKg(batch.quantityKg) },
                { label: 'Location', value: `${batch.district}, ${batch.region}` },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-xs text-stone-400 uppercase tracking-wider">{f.label}</div>
                  <div className="font-semibold text-stone-800 text-sm mt-0.5 font-mono">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-6 space-y-7">
            {/* ── Weather Risk Alert (v3, shown when backend provides weather_warning) ── */}
            {batch.real?.advisory?.weather_warning &&
              !['none', 'n/a', 'none.', 'n/a.'].includes(batch.real.advisory.weather_warning.trim().toLowerCase()) && (
              <section
                data-pdf-keep
                className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3"
              >
                <span className="text-xl leading-none flex-shrink-0 mt-0.5">⛅</span>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                    Weather Risk Alert
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    {batch.real.advisory.weather_warning}
                  </p>
                </div>
              </section>
            )}

            {/* Executive Summary */}
            <section>
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Executive Summary</h2>
              {batch.real ? (
                <MarkdownLite text={batch.real.advisory.executive_summary} className="text-stone-700 text-sm" />
              ) : (
                <p className="text-stone-700 leading-relaxed text-sm">
                  This batch of <strong>{formatKg(batch.quantityKg)} {batch.crop}</strong> harvested in {batch.district}, {batch.region} is currently at{' '}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${batch.risk === 'HIGH' ? 'bg-red-50 text-red-700 border-red-100' : batch.risk === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>{batch.risk} RISK</span>{' '}
                  of value loss due to {batch.temperatureC >= 30 ? 'elevated temperature' : 'current conditions'} ({batch.temperatureC}°C) and {batch.storageType.toLowerCase()} storage conditions.
                  {batch.isAlreadyCritical ? (
                    <>Without intervention, this batch has already lost approximately <strong>{formatPct(batch.projectedValueLossPct)} of its value</strong> and remains at risk of further loss.</>
                  ) : (
                    <>Without intervention, approximately <strong>{formatPct(batch.projectedValueLossPct)} of batch value may be lost within {batch.hoursToCriticalLoss < 48 ? `${batch.hoursToCriticalLoss} hours` : `${Math.round(batch.hoursToCriticalLoss / 24)} days`}</strong>.</>
                  )}
                </p>
              )}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Current Risk Level', value: batch.risk, style: 'text-red-700 bg-red-50 border-red-100' },
                  { label: 'Value at Risk', value: formatPkrFull(valueAtRisk), style: 'text-amber-700 bg-amber-50 border-amber-100' },
                  { label: 'Optimal Recovery', value: formatPkrFull(recommended.netRevenue), style: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
                ].map(s => (
                  <div key={s.label} className={`rounded-lg border px-3 py-2.5 ${s.style}`}>
                    <div className="text-xs opacity-70 mb-0.5">{s.label}</div>
                    <div className="font-bold font-mono text-lg">{s.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Action */}
            <section className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Recommended Action</div>
              <h3 className="text-base font-bold text-stone-900 mb-3">{recommended.title} — {recommended.sub}.</h3>
              <div className="flex gap-6 text-sm flex-wrap">
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">Expected Net Revenue</div>
                  <div className="text-xl font-bold font-mono text-emerald-700">{formatPkrFull(recommended.netRevenue)}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">Estimated Loss Reduction</div>
                  <div className="text-xl font-bold font-mono text-emerald-700">{formatPct(Math.max(0, lossReductionPct))}</div>
                </div>
              </div>
            </section>

            {/* Spoilage chart */}
            <section>
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Projected Value Curve</h2>
              <div className="border border-stone-100 rounded-lg p-4">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={curveData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e6b45" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#1e6b45" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} height={28} minTickGap={16} />
                    <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e0d9', borderRadius: 6, fontSize: 11 }} formatter={(v: unknown) => [`${v}%`, 'Value']} />
                    <Area isAnimationActive={false} type="monotone" dataKey="value" stroke="#1e6b45" strokeWidth={2} fill="url(#rptGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-center text-xs text-stone-500">Days After Harvest</p>
              </div>
            </section>

            {/* Scenario table */}
            <section>
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Scenario Comparison</h2>
              <div className="border border-stone-200 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      {['Scenario', 'Price', 'Spoilage Risk', 'Costs', 'Net Revenue', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map(row => (
                      <tr key={row.id} className={`border-b border-stone-100 ${row.recommended ? 'bg-emerald-50/50' : ''}`}>
                        <td className="px-4 py-3 font-medium text-stone-800">{row.title}</td>
                        <td className="px-4 py-3 font-mono text-stone-600">₨{row.pricePerKg}/kg</td>
                        <td className="px-4 py-3 font-mono text-stone-600">{formatPct(row.spoilagePct)}</td>
                        <td className="px-4 py-3 font-mono text-stone-600">{formatPkrFull(row.costPerKg * batch.quantityKg)}</td>
                        <td className="px-4 py-3 font-mono font-semibold text-stone-800">{formatPkrFull(row.netRevenue)}</td>
                        <td className="px-4 py-3">
                          {row.recommended && <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Recommended</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Supporting evidence */}
            <section>
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-3">Supporting Evidence</h2>
              {batch.real ? (
                <MarkdownLite text={batch.real.advisory.supporting_evidence} className="text-sm text-stone-600" />
              ) : (
                <div className="space-y-2">
                  {sources.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-xs font-mono text-stone-400 mt-0.5 w-5 flex-shrink-0">[{i + 1}]</span>
                      <div>
                        <span className="font-semibold text-stone-700">{s.source}</span>
                        <span className="text-stone-400"> — {s.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Regional context */}
            <section className="bg-stone-50 rounded-lg border border-stone-200 p-4">
              <h2 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Regional Context</h2>
              {batch.real ? (
                <MarkdownLite text={batch.real.advisory.regional_context} className="text-sm text-stone-600" />
              ) : (
                <p className="text-sm text-stone-600 leading-relaxed">
                  In {batch.district} district, post-harvest {cropFamily.toLowerCase()} losses remain a significant value risk. Following the recommended {recommended.title.toLowerCase()} intervention could substantially reduce expected loss and represents a model transferable to other cooperative batches in {batch.region}.
                </p>
              )}
            </section>
          </div>

        </div>

        {/* Actions */}
        <div className="px-8 py-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-3 bg-stone-50">
          <div>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg flex items-center gap-2 hover:opacity-90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: '#1e6b45' }}
            >
              {downloading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="animate-spin"><circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" /><path d="M12.5 7A5.5 5.5 0 007 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M3 7l4 4 4-4M1 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Download PDF
                </>
              )}
            </button>
            {downloadError && <p className="text-xs text-red-600 mt-1.5">{downloadError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
