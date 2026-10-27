import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  accent?: 'green' | 'amber' | 'red' | 'neutral';
  trend?: 'up' | 'down';
  selected?: boolean;
  onClick?: () => void;
  actionLabel?: string;
}

const palettes = {
  neutral: {
    icon: 'bg-sky-50 text-sky-700',
    hover: 'hover:border-sky-200 hover:bg-sky-50/50',
    selected: 'border-sky-200 bg-sky-50/70 ring-2 ring-sky-100',
    action: 'text-sky-700',
  },
  red: {
    icon: 'bg-rose-50 text-rose-600',
    hover: 'hover:border-rose-200 hover:bg-rose-50/50',
    selected: 'border-rose-200 bg-rose-50/70 ring-2 ring-rose-100',
    action: 'text-rose-700',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-700',
    hover: 'hover:border-amber-200 hover:bg-amber-50/50',
    selected: 'border-amber-200 bg-amber-50/70 ring-2 ring-amber-100',
    action: 'text-amber-700',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-700',
    hover: 'hover:border-emerald-200 hover:bg-emerald-50/50',
    selected: 'border-emerald-200 bg-emerald-50/70 ring-2 ring-emerald-100',
    action: 'text-emerald-700',
  },
};

export default function MetricCard({ label, value, sub, icon, accent = 'neutral', selected = false, onClick, actionLabel }: MetricCardProps) {
  const palette = palettes[accent];
  const content = (
    <>
      <span className="flex items-start justify-between gap-3">
        <span className="min-h-10 text-[13px] font-semibold leading-5 text-stone-600">{label}</span>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 motion-safe:group-hover:scale-105 ${palette.icon}`} aria-hidden="true">{icon}</span>
      </span>
      <span className="mt-3 block text-[clamp(1.5rem,2.5vw,2rem)] font-bold leading-tight tracking-tight tabular-nums text-stone-900">{value}</span>
      <span className="mt-1.5 mb-4 block text-xs leading-5 text-stone-500">{sub}</span>
      {actionLabel && (
        <span className={`mt-auto flex items-center justify-between gap-2 border-t border-stone-200/50 pt-3 text-[11px] font-semibold ${palette.action}`}>
          <span>{selected ? 'Selected' : actionLabel}</span>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            {selected
              ? <path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              : <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
          </svg>
        </span>
      )}
    </>
  );
  const className = `group flex flex-col h-full w-full min-w-0 rounded-2xl border p-5 text-left shadow-[0_3px_14px_rgba(28,25,23,0.035)] transition-[background-color,border-color,box-shadow,transform] duration-200 motion-reduce:transition-none ${selected ? palette.selected : 'border-stone-200/70 bg-white'} ${onClick ? `cursor-pointer ${palette.hover} hover:shadow-[0_10px_24px_rgba(28,25,23,0.08)] motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2` : ''}`;

  return onClick
    ? <button type="button" className={className} onClick={onClick} aria-pressed={selected}>{content}</button>
    : <div className={className}>{content}</div>;
}
