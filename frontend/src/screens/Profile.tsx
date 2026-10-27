import { useMemo, useState } from 'react';
import { useBatches } from '../context/BatchContext';
import { useAuth } from '../context/AuthContext';
import { computeDashboardMetrics } from '../utils/aggregate';
import { formatPkr } from '../utils/format';

interface Props { onNavigate: (screen: string, batchId?: string) => void; }

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4">
            <div className="text-xs font-medium text-stone-400 mb-1">{label}</div>
            <div className="text-xl font-bold font-mono text-stone-900">{value}</div>
            {sub && <div className="text-xs text-stone-400 mt-0.5">{sub}</div>}
        </div>
    );
}

const inputClass = 'w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all';

export default function Profile({ onNavigate }: Props) {
    const { batches } = useBatches();
    const { user, logout, updateProfile } = useAuth();
    const metrics = useMemo(() => computeDashboardMetrics(batches), [batches]);

    const [editing, setEditing] = useState(false);
    const [nameInput, setNameInput] = useState(user?.name ?? '');
    const [cooperativeInput, setCooperativeInput] = useState(user?.cooperative_name ?? '');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    if (!user) return null; // AuthGate guarantees this screen only mounts once logged in

    const initials = user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

    function startEditing() {
        setNameInput(user!.name);
        setCooperativeInput(user!.cooperative_name ?? '');
        setSaveError(null);
        setEditing(true);
    }

    async function handleSave() {
        setSaving(true);
        setSaveError(null);
        try {
            await updateProfile({ name: nameInput.trim(), cooperative_name: cooperativeInput.trim() || undefined });
            setEditing(false);
        } catch {
            setSaveError('Could not save your changes. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-3xl flex flex-col gap-5 animate-fade-in">
            <div>
                <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
                    <span className="cursor-pointer hover:text-stone-600" onClick={() => onNavigate('dashboard')}>Dashboard</span>
                    <span>›</span>
                    <span className="text-stone-600">Profile</span>
                </div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Your Profile</h1>
                <p className="mt-1 text-stone-500 text-sm">Account details and your activity on HarvestGuard.</p>
            </div>

            {/* Profile card */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 flex items-start gap-5 flex-wrap">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-white"
                    style={{ background: '#1e6b45' }}
                >
                    {initials}
                </div>
                <div className="flex-1 min-w-[200px]">
                    {editing ? (
                        <div className="space-y-3 max-w-sm">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Full name</label>
                                <input className={inputClass} value={nameInput} onChange={e => setNameInput(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1">Cooperative name</label>
                                <input className={inputClass} value={cooperativeInput} onChange={e => setCooperativeInput(e.target.value)} placeholder="e.g. Sindh Agri Co-op" />
                            </div>
                            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !nameInput.trim()}
                                    className="px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-60"
                                    style={{ background: '#1e6b45' }}
                                >
                                    {saving ? 'Saving...' : 'Save changes'}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    disabled={saving}
                                    className="px-4 py-2 text-xs font-semibold text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-bold text-stone-900">{user.name}</h2>
                                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-sm text-stone-500 mt-0.5">{user.cooperative_name ?? 'No cooperative set'}</p>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <div className="text-xs text-stone-400 uppercase tracking-wider">Email</div>
                                    <div className="text-stone-700 mt-0.5">{user.email}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-stone-400 uppercase tracking-wider">Cooperative</div>
                                    <div className="text-stone-700 mt-0.5">{user.cooperative_name ?? '—'}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                {!editing && (
                    <button
                        onClick={startEditing}
                        className="px-4 py-2 text-xs font-semibold text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors flex-shrink-0"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Activity stats */}
            <div>
                <h2 className="font-semibold text-stone-900 text-sm mb-3">Your Activity</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Batches Registered" value={String(metrics.totalBatches)} />
                    <StatCard label="Currently At Risk" value={String(metrics.atRiskBatches)} sub="HIGH or MEDIUM risk" />
                    <StatCard label="Critical Within 24h" value={String(metrics.atRiskWithin24h)} />
                    <StatCard label="Value Saved (Season)" value={formatPkr(metrics.lossPreventedThisSeason)} />
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
                <h2 className="font-semibold text-stone-900 text-sm mb-4">Preferences</h2>
                <div className="space-y-3">
                    {[
                        { label: 'Email alerts for HIGH risk batches', enabled: true },
                        { label: 'WhatsApp report sharing', enabled: true },
                        { label: 'Weekly regional impact summary', enabled: false },
                    ].map(pref => (
                        <div key={pref.label} className="flex items-center justify-between text-sm py-1">
                            <span className="text-stone-600">{pref.label}</span>
                            <div
                                className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${pref.enabled ? '' : 'bg-stone-200'}`}
                                style={pref.enabled ? { background: '#1e6b45' } : {}}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.enabled ? 'translate-x-4' : ''}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <button onClick={logout} className="text-sm font-semibold text-red-600 hover:underline">
                    Log out
                </button>
            </div>
        </div>
    );
}
