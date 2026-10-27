import type { ReactNode } from 'react';

/** Shown while a screen's data is being fetched. Keeps layout stable via minHeight. */
export function LoadingState({ label = 'Loading...', minHeight = 200 }: { label?: string; minHeight?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 text-stone-400"
      style={{ minHeight }}
    >
      <div className="w-6 h-6 border-2 border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

/** Shown when a fetch fails, with a retry action. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center py-16">
      <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L15 14H1L8 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 6v3.5M8 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm text-stone-500 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all"
          style={{ background: '#1e6b45' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/** Shown when a list is empty (e.g. no batches yet, or none match a filter). */
export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center py-16 px-4">
      <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mb-1">
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-stone-600">{title}</p>
      {subtitle && <p className="text-xs text-stone-400 max-w-xs">{subtitle}</p>}
      {action}
    </div>
  );
}
