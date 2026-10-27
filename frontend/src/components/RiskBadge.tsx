type Risk = 'HIGH' | 'MEDIUM' | 'LOW';

const config: Record<Risk, { label: string; bg: string; text: string; dot: string }> = {
  HIGH: { label: 'HIGH', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  MEDIUM: { label: 'MEDIUM', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { label: 'LOW', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
};

export default function RiskBadge({ risk, size = 'sm' }: { risk: Risk; size?: 'sm' | 'md' | 'lg' }) {
  const c = config[risk];
  const px = size === 'lg' ? 'px-3 py-1.5 text-sm' : size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${px} ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
