// import { useState } from 'react';
// import BatchMap, { DISTRICT_COORDS, type MapMarkerData } from '../components/BatchMap';
// import { useBatches } from '../context/BatchContext';
// import type { CropType, NewBatchInput, StorageType } from '../types';

// interface Props { onNavigate: (screen: string, batchId?: string) => void; }

// const DISTRICTS: { name: string; region: 'Sindh' | 'Punjab' }[] = [
//   { name: 'Mirpurkhas', region: 'Sindh' },
//   { name: 'Tando Allahyar', region: 'Sindh' },
//   { name: 'Hyderabad', region: 'Sindh' },
//   { name: 'Matiari', region: 'Sindh' },
//   { name: 'Larkana', region: 'Sindh' },
//   { name: 'Sukkur', region: 'Sindh' },
//   { name: 'Jacobabad', region: 'Sindh' },
//   { name: 'Nawabshah', region: 'Sindh' },
//   { name: 'Badin', region: 'Sindh' },
//   { name: 'Thatta', region: 'Sindh' },
//   { name: 'Lahore', region: 'Punjab' },
//   { name: 'Multan', region: 'Punjab' },
//   { name: 'Faisalabad', region: 'Punjab' },
//   { name: 'Sargodha', region: 'Punjab' },
// ];

// const CROPS: CropType[] = ['Mango (Sindhri)', 'Mango (Chaunsa)', 'Rice (Basmati)', 'Potato', 'Tomato'];
// const STORAGE_TYPES: StorageType[] = ['Open Air / Shade', 'Covered Shed', 'Cold Storage', 'Transport Vehicle'];

// const todayIso = new Date().toISOString().slice(0, 10);

// function emptyForm(): NewBatchInput {
//   return {
//     crop: CROPS[0],
//     district: DISTRICTS[0].name,
//     region: DISTRICTS[0].region,
//     quantityKg: 1000,
//     harvestDate: todayIso,
//     storageType: STORAGE_TYPES[0],
//     temperatureC: 38,
//     humidityPct: 64,
//     transportAvailable: true,
//     travelToMarketMinutes: 135,
//     targetMarket: '',
//   };
// }

// export default function NewBatch({ onNavigate }: Props) {
//   const { addBatch } = useBatches();
//   const [form, setForm] = useState<NewBatchInput>(emptyForm());
//   const [submitting, setSubmitting] = useState(false);
//   const [formError, setFormError] = useState<string | null>(null);

//   const [lat, lng] = DISTRICT_COORDS[form.district] ?? [27.5, 69.5];
//   const marker: MapMarkerData = { label: form.district, lat, lng, risk: 'MEDIUM' };

//   function update<K extends keyof NewBatchInput>(key: K, value: NewBatchInput[K]) {
//     setForm(prev => ({ ...prev, [key]: value }));
//   }

//   function handleDistrictChange(name: string) {
//     const found = DISTRICTS.find(d => d.name === name);
//     setForm(prev => ({ ...prev, district: name, region: found?.region ?? prev.region }));
//   }

//   function validate(): string | null {
//     if (!form.quantityKg || form.quantityKg <= 0) {
//       return 'Enter a quantity greater than zero.';
//     }
//     if (!Number.isFinite(form.temperatureC) || form.temperatureC < -10 || form.temperatureC > 60) {
//       return 'Enter a realistic temperature between -10°C and 60°C.';
//     }
//     if (!Number.isFinite(form.humidityPct) || form.humidityPct < 0 || form.humidityPct > 100) {
//       return 'Humidity must be between 0% and 100%.';
//     }
//     if (form.transportAvailable && (!Number.isFinite(form.travelToMarketMinutes) || form.travelToMarketMinutes < 0)) {
//       return 'Travel time to market cannot be negative.';
//     }
//     if (!form.harvestDate) {
//       return 'Select a harvest date.';
//     }
//     if (form.harvestDate > todayIso) {
//       return 'Harvest date cannot be in the future.';
//     }
//     return null;
//   }

//   async function handleSubmit() {
//     const validationError = validate();
//     if (validationError) {
//       setFormError(validationError);
//       return;
//     }
//     setFormError(null);
//     setSubmitting(true);
//     try {
//       const created = await addBatch(form);
//       onNavigate('assessment', created.id);
//     } catch {
//       setFormError('Could not submit this batch. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="w-full max-w-5xl animate-fade-in">
//       <div className="mb-6">
//         <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
//           <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
//           <span>›</span>
//           <span className="text-stone-600">Register New Batch</span>
//         </div>
//         <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Register New Harvest Batch</h1>
//         <p className="mt-1 text-stone-500 text-sm">Provide basic batch information so HarvestGuard can assess spoilage and market risk.</p>
//       </div>

//       <div className="space-y-6">
//         {/* Section 1 */}
//         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-5">
//             <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1e6b45' }}>1</span>
//             <h2 className="font-semibold text-stone-900">Crop Information</h2>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             <div>
//               <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Crop Type</label>
//               <select
//                 value={form.crop}
//                 onChange={e => update('crop', e.target.value as CropType)}
//                 className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//               >
//                 {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Harvest Date</label>
//               <input
//                 type="date"
//                 value={form.harvestDate}
//                 max={todayIso}
//                 onChange={e => update('harvestDate', e.target.value)}
//                 className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//               />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Quantity</label>
//               <div className="flex">
//                 <input
//                   type="number"
//                   min={1}
//                   value={form.quantityKg}
//                   onChange={e => update('quantityKg', Number(e.target.value))}
//                   placeholder="1000"
//                   className="flex-1 min-w-0 border border-stone-200 rounded-l-lg px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//                 />
//                 <span className="border border-l-0 border-stone-200 rounded-r-lg px-3 py-2.5 bg-stone-50 text-sm text-stone-500 font-medium flex-shrink-0">kg</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Section 2 */}
//         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-5">
//             <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1e6b45' }}>2</span>
//             <h2 className="font-semibold text-stone-900">Location</h2>
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             <div>
//               <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">District</label>
//               <select
//                 value={form.district}
//                 onChange={e => handleDistrictChange(e.target.value)}
//                 className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//               >
//                 {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name} ({d.region})</option>)}
//               </select>
//               <div className="mt-3 flex items-center gap-2 text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
//                 <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0"><path d="M7 1C4.8 1 3 2.8 3 5c0 3.3 4 7.5 4 7.5S11 8.3 11 5c0-2.2-1.8-4-4-4z" stroke="#1e6b45" strokeWidth="1.3" fill="#dcf0e5"/><circle cx="7" cy="5" r="1.2" fill="#1e6b45"/></svg>
//                 <span className="text-xs font-medium text-stone-700">{form.district}, {form.region}</span>
//               </div>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Map Pin</label>
//               <div className="border border-stone-200 rounded-lg overflow-hidden">
//                 <BatchMap markers={[marker]} center={[lat, lng]} zoom={9} height={140} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Section 3 */}
//         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-5">
//             <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1e6b45' }}>3</span>
//             <h2 className="font-semibold text-stone-900">Storage & Conditions</h2>
//           </div>
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             <div>
//               <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Storage Type</label>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {STORAGE_TYPES.map(s => (
//                   <label
//                     key={s}
//                     className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 cursor-pointer transition-all text-sm ${form.storageType === s ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-stone-300'}`}
//                   >
//                     <input
//                       type="radio"
//                       name="storage"
//                       checked={form.storageType === s}
//                       onChange={() => update('storageType', s)}
//                       className="accent-emerald-600"
//                     />
//                     <span className={`font-medium ${form.storageType === s ? 'text-emerald-700' : 'text-stone-600'}`}>{s}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Temperature (°C)</label>
//                   <input
//                     type="number"
//                     min={-10}
//                     max={60}
//                     value={form.temperatureC}
//                     onChange={e => update('temperatureC', Number(e.target.value))}
//                     className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Humidity (%)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     max={100}
//                     value={form.humidityPct}
//                     onChange={e => update('humidityPct', Number(e.target.value))}
//                     className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//                   />
//                 </div>
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Transport Available</label>
//                   <div className="flex gap-2">
//                     <label className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm font-medium ${form.transportAvailable ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600'}`}>
//                       <input type="radio" name="transport" checked={form.transportAvailable} onChange={() => update('transportAvailable', true)} className="accent-emerald-600" />Yes
//                     </label>
//                     <label className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm font-medium ${!form.transportAvailable ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-stone-200 text-stone-600'}`}>
//                       <input type="radio" name="transport" checked={!form.transportAvailable} onChange={() => update('transportAvailable', false)} className="accent-emerald-600" />No
//                     </label>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Travel to Market (minutes)</label>
//                   <input
//                     type="number"
//                     min={0}
//                     value={form.travelToMarketMinutes}
//                     onChange={e => update('travelToMarketMinutes', Number(e.target.value))}
//                     className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Section 4 */}
//         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
//           <div className="flex items-center gap-3 mb-5">
//             <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1e6b45' }}>4</span>
//             <h2 className="font-semibold text-stone-900">Market Preference</h2>
//             <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Optional</span>
//           </div>
//           <div className="w-full sm:max-w-sm">
//             <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase tracking-wide">Target Market</label>
//             <input
//               type="text"
//               value={form.targetMarket}
//               onChange={e => update('targetMarket', e.target.value)}
//               placeholder="e.g. Karachi Sabzi Mandi"
//               className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
//             />
//           </div>
//         </div>

//         {formError && (
//           <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{formError}</div>
//         )}

//         {/* Actions */}
//         <div className="flex items-center justify-between pt-2 pb-6">
//           <button onClick={() => onNavigate('dashboard')} className="px-5 py-2.5 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={submitting}
//             className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg flex items-center gap-2 shadow-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//             style={{ background: '#1e6b45' }}
//           >
//             {submitting ? (
//               <>
//                 <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
//                 Assessing...
//               </>
//             ) : (
//               <>
//                 Assess This Batch
//                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useRef, useState } from 'react';
import { DISTRICT_COORDS } from '../components/BatchMap';
import BatchLocationMap from '../components/BatchLocationMap';
import CropIllustration, { HarvestBannerArt, PhotoCredits, type CropArt } from '../components/CropIllustration';
import { useBatches } from '../context/BatchContext';
import type { CropType, NewBatchInput, StorageType } from '../types';

interface Props { onNavigate: (screen: string, batchId?: string) => void; }

const DISTRICTS: { name: string; region: 'Sindh' | 'Punjab' }[] = [
  { name: 'Mirpurkhas', region: 'Sindh' },
  { name: 'Tando Allahyar', region: 'Sindh' },
  { name: 'Hyderabad', region: 'Sindh' },
  { name: 'Matiari', region: 'Sindh' },
  { name: 'Larkana', region: 'Sindh' },
  { name: 'Sukkur', region: 'Sindh' },
  { name: 'Jacobabad', region: 'Sindh' },
  { name: 'Nawabshah', region: 'Sindh' },
  { name: 'Badin', region: 'Sindh' },
  { name: 'Thatta', region: 'Sindh' },
  { name: 'Lahore', region: 'Punjab' },
  { name: 'Multan', region: 'Punjab' },
  { name: 'Faisalabad', region: 'Punjab' },
  { name: 'Sargodha', region: 'Punjab' },
];

const CROPS: CropType[] = ['Mango (Sindhri)', 'Mango (Chaunsa)', 'Rice (Basmati)', 'Potato', 'Tomato'];
const STORAGE_TYPES: StorageType[] = ['Open Air / Shade', 'Covered Shed', 'Cold Storage', 'Transport Vehicle'];

const todayIso = new Date().toISOString().slice(0, 10);

function emptyForm(): NewBatchInput {
  return {
    crop: CROPS[0],
    district: DISTRICTS[0].name,
    region: DISTRICTS[0].region,
    quantityKg: 1000,
    harvestDate: todayIso,
    storageType: STORAGE_TYPES[0],
    temperatureC: 38,
    humidityPct: 64,
    transportAvailable: true,
    travelToMarketMinutes: 135,
    targetMarket: '',
  };
}

const CROP_TILES: { label: string; value?: CropType; art: CropArt }[] = [
  { label: 'Mango (Sindhri)', value: 'Mango (Sindhri)', art: 'sindhri' },
  { label: 'Mango (Chaunsa)', value: 'Mango (Chaunsa)', art: 'chaunsa' },
  { label: 'Rice (Basmati)', value: 'Rice (Basmati)', art: 'rice' },
  { label: 'Tomato', value: 'Tomato', art: 'tomato' },
  { label: 'Potato', value: 'Potato', art: 'potato' },
  { label: 'Onion', art: 'onion' },
  { label: 'Citrus / Kinnow', art: 'citrus' },
  { label: 'Banana', art: 'banana' },
  { label: 'Apple', art: 'apple' },
  { label: 'Chilli', art: 'chilli' },
];
const LOCATIONS = DISTRICTS.map(district => {
  const [lat, lng] = DISTRICT_COORDS[district.name];
  return { ...district, lat, lng };
});
const STEPS = ['Select Crop', 'Location & Storage', 'Batch & Market Details', 'Review & Submit'];
const STEP_HINTS = [
  "Choose the crop you've harvested.",
  'Tell us where your harvest is and how it is being stored.',
  'Add your harvest details and plans for reaching the market.',
  'Check your batch details before requesting an assessment.',
];
const inputClass = 'w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10';
const labelClass = 'mb-2 block text-xs font-semibold text-[#365849]';
const panelClass = 'rounded-2xl border border-[#e3eae1] bg-white p-4 sm:p-5';
const secondaryClass = 'rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-[#365849] transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50';

function LeafIcon() {
  return <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M12 25V9M12 20C3 19 2 13 2 9C9 10 13 13 12 20ZM12 15C11 7 16 3 22 2C22 10 18 14 12 15Z" fill="#367747" stroke="#275b37" strokeWidth="1.3" strokeLinecap="round" /><path d="M5 13L12 20M18 7L12 15" stroke="#c0d69e" strokeWidth="1.2" /></svg>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-stone-100 py-3 last:border-0"><dt className="text-sm text-stone-500">{label}</dt><dd className="max-w-full break-words text-sm font-medium text-[#254b3c]">{value}</dd></div>;
}

export default function NewBatch({ onNavigate }: Props) {
  const { addBatch } = useBatches();
  const [form, setForm] = useState<NewBatchInput>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [lat, lng] = DISTRICT_COORDS[form.district] ?? [27.5, 69.5];
  const [step, setStep] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedCrop = CROP_TILES.find(crop => crop.value === form.crop)!;
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step]);

  // Auto-fetch weather whenever district changes
  useEffect(() => {
    const [distLat, distLng] = DISTRICT_COORDS[form.district] ?? [27.5, 69.5];
    let cancelled = false;
    setWeatherLoading(true);

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${distLat}&longitude=${distLng}` +
      `&current=temperature_2m,relative_humidity_2m&timezone=Asia/Karachi`,
    )
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const temp = data?.current?.temperature_2m;
        const hum  = data?.current?.relative_humidity_2m;
        if (typeof temp === 'number' && typeof hum === 'number') {
          setForm(prev => ({
            ...prev,
            temperatureC: Math.round(temp * 10) / 10,
            humidityPct: Math.round(hum),
          }));
        }
      })
      .catch(() => { /* silently ignore — user can still type manually */ })
      .finally(() => { if (!cancelled) setWeatherLoading(false); });

    return () => { cancelled = true; };
  }, [form.district]);

  function goToStep(next: number) {
    if (submitting) return;
    setFormError(null);
    setStep(next);
  }

  function update<K extends keyof NewBatchInput>(key: K, value: NewBatchInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleDistrictChange(name: string) {
    const found = DISTRICTS.find(d => d.name === name);
    setForm(prev => ({ ...prev, district: name, region: found?.region ?? prev.region }));
  }

  function validate(): string | null {
    if (!form.quantityKg || form.quantityKg <= 0) {
      return 'Enter a quantity greater than zero.';
    }
    if (!Number.isFinite(form.temperatureC) || form.temperatureC < -10 || form.temperatureC > 60) {
      return 'Enter a realistic temperature between -10°C and 60°C.';
    }
    if (!Number.isFinite(form.humidityPct) || form.humidityPct < 0 || form.humidityPct > 100) {
      return 'Humidity must be between 0% and 100%.';
    }
    if (form.transportAvailable && (!Number.isFinite(form.travelToMarketMinutes) || form.travelToMarketMinutes < 0)) {
      return 'Travel time to market cannot be negative.';
    }
    if (!form.harvestDate) {
      return 'Select a harvest date.';
    }
    if (form.harvestDate > todayIso) {
      return 'Harvest date cannot be in the future.';
    }
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const created = await addBatch(form);
      onNavigate('assessment', created.id);
    } catch {
      setFormError('Could not submit this batch. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl animate-fade-in pb-6">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-stone-400">
        <button type="button" onClick={() => onNavigate('dashboard')} disabled={submitting} className="rounded hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-700">Dashboard</button>
        <span aria-hidden="true">/</span><span className="text-stone-600">Register Batch</span>
      </nav>
      <div className="overflow-hidden rounded-3xl border border-[#e2e8dc] bg-[#fdfefb] shadow-[0_12px_48px_-24px_rgba(41,76,45,0.22)]">
        <header className="relative isolate overflow-hidden border-b border-[#e6ebdf] bg-[#f3f6e9] px-5 py-8 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[48%] overflow-hidden opacity-90 sm:block"><HarvestBannerArt /></div>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#fafcf5] via-[#fafcf5]/90 to-transparent" />
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#e1ecd1] ring-4 ring-white/60"><LeafIcon /></span>
            <div className="max-w-lg sm:max-w-[65%]">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6c8864]">From your farm to the right market</p>
              <h1 className="text-xl font-bold tracking-tight text-[#174d3b] sm:text-2xl">Register New Harvest Batch</h1>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#658071] sm:text-sm">Tell us about your harvest. Get an assessment to help you decide what comes next.</p>
            </div>
          </div>
        </header>

        <nav aria-label="Registration progress" className="border-b border-[#e8ede4] bg-white/60 px-4 py-5 sm:px-8">
          <ol className="grid grid-cols-4 gap-2 sm:gap-4">
            {STEPS.map((label, index) => <li key={label} className="min-w-0">
              <button type="button" disabled={submitting || index > step} onClick={() => goToStep(index)} aria-current={step === index ? 'step' : undefined} className={`group flex w-full flex-col items-start gap-2 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 sm:flex-row sm:items-center ${index <= step ? 'text-[#266a45]' : 'text-stone-400'}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition ${index <= step ? 'bg-[#34774e] text-white shadow-sm group-hover:bg-[#245d3b]' : 'bg-[#edf0eb]'}`}>{index < step ? <span aria-label="Completed">✓</span> : index + 1}</span>
                <span className="text-[10px] font-semibold leading-snug sm:text-xs">{label}</span>
                {index < 3 && <span aria-hidden="true" className={`ml-1 hidden h-px min-w-2 flex-1 lg:block ${index < step ? 'bg-[#9ac3a4]' : 'bg-[#e3e9de]'}`} />}
              </button>
            </li>)}
          </ol>
        </nav>

        <form noValidate onSubmit={event => { event.preventDefault(); if (submitting) return; if (step < 3) goToStep(step + 1); else void handleSubmit(); }}>
          <fieldset disabled={submitting} className="min-w-0 px-4 pt-6 sm:px-8 sm:pt-7">
            <legend className="sr-only">Register harvest batch</legend>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2e2] text-sm font-bold text-[#34774e]">{step + 1}</span>
              <div><h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold tracking-tight text-[#244e3c] outline-none">{STEPS[step]}</h2><p className="mt-1 text-xs leading-relaxed text-[#7b8b7f]">{STEP_HINTS[step]}</p></div>
            </div>

            {step === 0 && <div>
              <div role="radiogroup" aria-label="Crop type" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                {CROP_TILES.map(crop => <label key={crop.art} className={`relative block ${crop.value ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <input type="radio" name="crop" value={crop.label} disabled={!crop.value} checked={crop.value === form.crop} onChange={() => { if (crop.value) update('crop', crop.value); }} className="peer sr-only" />
                  <div className={`flex h-full min-h-[158px] flex-col items-center rounded-2xl border px-3 pb-4 pt-3 transition duration-200 motion-reduce:transition-none peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-700 peer-focus-visible:ring-offset-2 sm:min-h-[180px] ${crop.value === form.crop ? 'border-[#4e9b68] bg-[#f0f7ec] shadow-[0_3px_14px_-7px_rgba(35,107,64,0.3)]' : crop.value ? 'border-[#e3e9df] bg-white hover:-translate-y-0.5 hover:border-[#a5c7a5] hover:bg-[#f8fbf4] hover:shadow-md motion-reduce:hover:translate-y-0' : 'border-[#e9ece5] bg-[#f7f8f4]'}`}>
                    <span aria-hidden="true" className={`absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${crop.value === form.crop ? 'border-[#32774c] bg-[#32774c] text-white' : 'border-[#ccd6ca] text-transparent'}`}>✓</span>
                    <CropIllustration crop={crop.art} className="mb-3 mt-3 w-full max-w-[145px]" />
                    <span className="mt-auto text-center text-xs font-semibold text-[#31533e]">{crop.label}</span>
                  </div>
                </label>)}
              </div>
            </div>}

            {step === 1 && <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
              <section className={panelClass} aria-label="Batch location">
                <label htmlFor="batch-district" className={labelClass}>Farm district</label>
                <select id="batch-district" value={form.district} onChange={event => handleDistrictChange(event.target.value)} className={`${inputClass} mb-3`}>
                  {DISTRICTS.map(district => <option key={district.name} value={district.name}>{district.name} ({district.region})</option>)}
                </select>
                <div className="overflow-hidden rounded-xl border border-[#e5ebdf]"><BatchLocationMap districts={LOCATIONS} selectedDistrict={form.district} onSelectDistrict={handleDistrictChange} /></div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#eef5e9] px-4 py-3">
                  <div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a9075]">Selected district</p><p className="mt-1 text-sm font-semibold text-[#326645]">{form.district}, {form.region}</p><p className="mt-1 text-[10px] text-[#7b8d77]">{lat.toFixed(4)}° N · {lng.toFixed(4)}° E</p></div>
                  <a href="#batch-district" className="text-xs font-medium text-[#32734b] underline decoration-[#b1c6a9] underline-offset-4 hover:text-emerald-900">Change</a>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-500">Choose your district above or select a district pin on the map. The pin shows the district location.</p>
              </section>
              <section className={panelClass} aria-labelledby="storage-heading">
                <h3 id="storage-heading" className="mb-5 text-sm font-semibold text-[#31583f]">Storage details</h3>
                <fieldset className="mb-6"><legend className={labelClass}>Storage type</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {STORAGE_TYPES.map(storage => <label key={storage} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-3 text-xs font-medium transition focus-within:ring-2 focus-within:ring-emerald-600 ${form.storageType === storage ? 'border-[#8aba91] bg-[#eff7ea] text-[#316645]' : 'border-[#e3e9df] text-stone-500 hover:border-[#b5ccb0] hover:bg-[#f8fbf4]'}`}><input type="radio" name="storage" value={storage} checked={form.storageType === storage} onChange={() => update('storageType', storage)} className="accent-[#34774e]" />{storage}</label>)}
                </div></fieldset>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="batch-temperature" className={labelClass} style={{ marginBottom: 0 }}>Current temperature (°C)</label>
                      {weatherLoading
                        ? <span className="text-[10px] text-amber-600 flex items-center gap-1"><span className="w-2.5 h-2.5 border border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />Fetching…</span>
                        : <span className="text-[10px] text-emerald-700 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />Live weather</span>
                      }
                    </div>
                    <input id="batch-temperature" type="number" min={-10} max={60} value={form.temperatureC} onChange={event => update('temperatureC', Number(event.target.value))} className={inputClass} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="batch-humidity" className={labelClass} style={{ marginBottom: 0 }}>Current humidity (%)</label>
                      {weatherLoading
                        ? <span className="text-[10px] text-amber-600 flex items-center gap-1"><span className="w-2.5 h-2.5 border border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />Fetching…</span>
                        : <span className="text-[10px] text-emerald-700 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />Live weather</span>
                      }
                    </div>
                    <input id="batch-humidity" type="number" min={0} max={100} value={form.humidityPct} onChange={event => update('humidityPct', Number(event.target.value))} className={inputClass} />
                  </div>
                  <div className="rounded-xl bg-[#f5f7ef] p-4 text-xs leading-relaxed text-[#7c8b70]">Temperature and humidity are auto-filled from live weather at the selected district. You can adjust them if needed.</div>
                </div>
              </section>
            </div>}

            {step === 2 && <div className="grid gap-5 lg:grid-cols-2">
              <section className={panelClass} aria-labelledby="harvest-heading">
                <h3 id="harvest-heading" className="mb-5 text-sm font-semibold text-[#31583f]">Your harvest</h3>
                <div className="mb-6 flex items-center gap-4 rounded-xl bg-[#f3f7ec] px-4 py-2"><CropIllustration crop={selectedCrop.art} className="w-20 shrink-0" /><div><p className="text-[10px] uppercase tracking-wider text-[#819477]">Selected crop</p><p className="mt-1 text-sm font-semibold text-[#31583f]">{form.crop}</p></div><button type="button" onClick={() => goToStep(0)} className="ml-auto rounded text-xs font-semibold text-emerald-700 underline underline-offset-4">Edit</button></div>
                <div className="space-y-5">
                  <div><label htmlFor="batch-quantity" className={labelClass}>Quantity (kg)</label><input id="batch-quantity" type="number" min={1} value={form.quantityKg} onChange={event => update('quantityKg', Number(event.target.value))} className={inputClass} /></div>
                  <div><label htmlFor="batch-harvest-date" className={labelClass}>Harvest date</label><input id="batch-harvest-date" type="date" max={todayIso} value={form.harvestDate} onChange={event => update('harvestDate', event.target.value)} className={inputClass} /></div>
                </div>
              </section>
              <section className={panelClass} aria-labelledby="market-heading">
                <h3 id="market-heading" className="mb-5 text-sm font-semibold text-[#31583f]">Getting to market</h3>
                <fieldset className="mb-5"><legend className={labelClass}>Is transport available?</legend><div className="grid grid-cols-2 gap-3">{[true, false].map(available => <label key={String(available)} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition focus-within:ring-2 focus-within:ring-emerald-600 ${form.transportAvailable === available ? 'border-[#8aba91] bg-[#eff7ea] text-[#316645]' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}><input type="radio" name="transport" value={String(available)} checked={form.transportAvailable === available} onChange={() => update('transportAvailable', available)} className="accent-[#34774e]" />{available ? 'Yes, available' : 'No transport'}</label>)}</div></fieldset>
                <div className="space-y-5">
                  {form.transportAvailable && <div><label htmlFor="batch-travel-time" className={labelClass}>Travel time to market (minutes)</label><input id="batch-travel-time" type="number" min={0} value={form.travelToMarketMinutes} onChange={event => update('travelToMarketMinutes', Number(event.target.value))} className={inputClass} /></div>}
                  <div><label htmlFor="batch-target-market" className={labelClass}>Target market <span className="font-normal text-stone-400">(optional)</span></label><input id="batch-target-market" type="text" value={form.targetMarket} onChange={event => update('targetMarket', event.target.value)} placeholder="e.g. Multan Fruit Mandi" className={inputClass} /><p className="mt-2 text-xs leading-relaxed text-stone-500">Have a market in mind? Enter its name here.</p></div>
                </div>
              </section>
            </div>}

            {step === 3 && <div>
              <div className="mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-[#dae7d2] bg-[#f1f7e9] px-5 py-3"><CropIllustration crop={selectedCrop.art} className="w-24 shrink-0" /><div><p className="text-xs text-[#78916c]">Your harvest batch</p><h3 className="mt-1 text-xl font-semibold text-[#2f5b3e]">{form.crop}</h3><p className="mt-1 text-sm text-[#718269]">{form.quantityKg.toLocaleString()} kg · {form.district}, {form.region}</p></div></div>
              <div className="grid gap-5 lg:grid-cols-2">
                <section className={panelClass}><div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#31583f]">Location & storage</h3><button type="button" onClick={() => goToStep(1)} className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50" aria-label="Edit location and storage">Edit</button></div><dl><ReviewRow label="District" value={`${form.district}, ${form.region}`} /><ReviewRow label="Storage" value={form.storageType} /><ReviewRow label="Temperature" value={`${form.temperatureC} °C`} /><ReviewRow label="Humidity" value={`${form.humidityPct}%`} /></dl></section>
                <section className={panelClass}><div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#31583f]">Batch & market</h3><button type="button" onClick={() => goToStep(2)} className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50" aria-label="Edit batch and market details">Edit</button></div><dl><ReviewRow label="Quantity" value={`${form.quantityKg.toLocaleString()} kg`} /><ReviewRow label="Harvest date" value={form.harvestDate || 'Not selected'} /><ReviewRow label="Transport" value={form.transportAvailable ? 'Available' : 'Not available'} />{form.transportAvailable && <ReviewRow label="Travel time" value={`${form.travelToMarketMinutes} minutes`} />}<ReviewRow label="Target market" value={form.targetMarket || 'Not specified'} /></dl></section>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-stone-500">Everything look right? Submit your batch to start the assessment.</p>
            </div>}
          </fieldset>

          {formError && <div role="alert" className="mx-4 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-8">{formError} <span className="block pt-1 text-xs">Use Edit to update your details, then submit again.</span></div>}
          <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8ede4] bg-white/70 px-4 py-5 sm:px-8">
            <div className="flex items-center gap-2">{step > 0 && <button type="button" disabled={submitting} onClick={() => goToStep(step - 1)} className={secondaryClass}>← Back</button>}<button type="button" disabled={submitting} onClick={() => onNavigate('dashboard')} className={step === 0 ? secondaryClass : 'rounded-lg px-3 py-2.5 text-sm text-stone-500 transition hover:bg-stone-100 disabled:opacity-50'}>Cancel</button></div>
            <button type="submit" disabled={submitting} className="flex min-w-32 items-center justify-center gap-3 rounded-xl bg-[#34774e] px-5 py-3 text-sm font-semibold text-white shadow-[0_3px_10px_-4px_rgba(37,97,56,0.6)] transition hover:-translate-y-0.5 hover:bg-[#28613e] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-65 motion-reduce:transform-none sm:px-7">
              {submitting ? 'Assessing…' : step === 3 ? 'Assess This Batch' : <><span>Next<span className="hidden sm:inline">: {STEPS[step + 1]}</span></span><span aria-hidden="true">→</span></>}
            </button>
          </footer>
        </form>
        <PhotoCredits />
      </div>
    </div>
  );
}
