import { useState, type ReactNode } from 'react';
import Logo from './components/Logo';
import Dashboard from './screens/Dashboard';
import NewBatch from './screens/NewBatch';
import AIAssessment from './screens/AIAssessment';
import ScenarioComparator from './screens/ScenarioComparator';
import Report from './screens/Report';
import RegionalImpact from './screens/RegionalImpact';
import Profile from './screens/Profile';
import Login from './screens/Login';
import Register from './screens/Register';
import { BatchProvider } from './context/BatchContext';
import { AuthProvider, useAuth } from './context/AuthContext';

type Screen = 'dashboard' | 'new-batch' | 'assessment' | 'scenario' | 'report' | 'regional' | 'profile';

const navItems: { id: Screen; label: string; icon: ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" /><rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" /></svg>,
  },
  {
    id: 'new-batch',
    label: 'New Batch',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.4" /><path d="M8 7v4M6 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  },
  {
    id: 'assessment',
    label: 'AI Assessments',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5.5 8.5C5.5 7.1 6.6 6 8 6s2.5 1.1 2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8" cy="10" r="1" fill="currentColor" /></svg>,
  },
  {
    id: 'scenario',
    label: 'Scenario Comparison',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13V8M6 13V5M10 13V7M14 13V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>,
  },
  {
    id: 'report',
    label: 'Reports',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 1h7l3 3v11H3V1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M10 1v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M5 7h6M5 9.5h6M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>,
  },
  {
    id: 'regional',
    label: 'Regional Impact',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M1.5 8h13M8 1.5c-1.8 2-2.8 4-2.8 6.5S6.2 12.5 8 14.5M8 1.5c1.8 2 2.8 4 2.8 6.5S9.8 12.5 8 14.5" stroke="currentColor" strokeWidth="1.2" /></svg>,
  },
];

/** Tailwind's `md` breakpoint (px). Below this, the sidebar behaves as an overlay drawer instead of an inline column. */
const MOBILE_BREAKPOINT_PX = 768;

/** First letters of up to two words, for the avatar circle — e.g. "Ahmad Khan" -> "AK". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function AppShell() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('dashboard');
  // Desktop: whether the inline sidebar is expanded (220px) or collapsed to an icon rail (56px).
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile/tablet: whether the overlay drawer is open. Independent of sidebarOpen so
  // resizing the window doesn't couple the two behaviors together.
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // The batch currently in focus — set whenever the user drills into a batch
  // from the Dashboard table, map, or a "New Batch" submission. Every screen
  // that needs a specific batch (Assessment, Scenario, Report) reads this
  // instead of assuming a fixed id.
  const [activeBatchId, setActiveBatchId] = useState<string | undefined>(undefined);

  const navigate = (s: string, batchId?: string) => {
    if (batchId) setActiveBatchId(batchId);
    setScreen(s as Screen);
    setMobileNavOpen(false);
  };

  /** Hamburger button: collapses the inline sidebar on desktop, opens the overlay drawer on mobile. */
  function toggleNav() {
    if (typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT_PX) {
      setMobileNavOpen(open => !open);
    } else {
      setSidebarOpen(open => !open);
    }
  }

  // Label text is always shown on the mobile overlay drawer (it's full-width there), and
  // shown on the inline desktop sidebar only when it isn't collapsed to an icon rail.
  const labelClass = `truncate ${sidebarOpen ? '' : 'md:hidden'}`;

  return (
    <div className="flex h-full" style={{ background: '#faf8f5' }}>
      {/* Backdrop, mobile only — closes the drawer on tap outside it */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-20 md:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — overlay drawer below md, inline column at md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 flex flex-col border-r border-stone-200 bg-white transition-transform duration-200 flex-shrink-0
          md:static md:z-auto md:translate-x-0 md:transition-[width] md:duration-200
          ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarOpen ? 'md:w-[220px]' : 'md:w-14'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-stone-100">
          <Logo size={28} />
          <div className={`overflow-hidden ${sidebarOpen ? '' : 'md:hidden'}`}>
            <div className="text-sm font-bold text-stone-900 tracking-tight leading-none">HarvestGuard</div>
            <div className="text-xs text-stone-400 mt-0.5">Post-Harvest AI</div>
          </div>
          <button
            onClick={() => setMobileNavOpen(false)}
            className="ml-auto p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors md:hidden"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 px-2">
          {navItems.map(item => {
            const active = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm font-medium ${active ? 'text-white' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}
                style={active ? { background: '#1e6b45' } : {}}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={labelClass}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-stone-100 py-3 px-2 space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" /><path d="M8 11V8M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <span className={labelClass}>Help</span>
          </button>
          <button
            onClick={() => navigate('profile')}
            aria-label="Your profile"
            aria-current={screen === 'profile' ? 'page' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${screen === 'profile' ? 'bg-stone-50' : 'hover:bg-stone-50'}`}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white" style={{ background: '#1e6b45' }}>{initials(user?.name ?? '')}</div>
            <div className={`overflow-hidden ${sidebarOpen ? '' : 'md:hidden'}`}>
              <div className="text-xs font-semibold text-stone-700 truncate">{user?.name}</div>
              <div className="text-xs text-stone-400 truncate">{user?.cooperative_name || user?.role}</div>
            </div>
          </button>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0"><path d="M6 14H3.5A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M10.5 11.5L14 8l-3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            <span className={labelClass}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Content */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
          <button
            onClick={toggleNav}
            className="mb-3 p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            aria-label="Toggle navigation"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
          {screen === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {screen === 'new-batch' && <NewBatch onNavigate={navigate} />}
          {screen === 'assessment' && <AIAssessment onNavigate={navigate} batchId={activeBatchId} />}
          {screen === 'scenario' && <ScenarioComparator onNavigate={navigate} batchId={activeBatchId} />}
          {screen === 'report' && <Report onNavigate={navigate} batchId={activeBatchId} />}
          {screen === 'regional' && <RegionalImpact onNavigate={navigate} />}
          {screen === 'profile' && <Profile onNavigate={navigate} />}
        </main>
      </div>
    </div>
  );
}

type AuthScreen = 'login' | 'register';

/** Decides between the auth screens and the main app based on session state. */
function AuthGate() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: '#faf8f5' }}>
        <div className="w-6 h-6 border-2 border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return authScreen === 'login' ? (
      <Login onSwitchToRegister={() => setAuthScreen('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthScreen('login')} />
    );
  }

  return (
    <BatchProvider>
      <AppShell />
    </BatchProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
