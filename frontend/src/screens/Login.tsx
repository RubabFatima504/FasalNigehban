// import { useState, type FormEvent } from 'react';
// import Logo from '../components/Logo';
// import { useAuth } from '../context/AuthContext';

// const inputClass =
//   'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all';
// const labelClass = 'block text-xs font-semibold text-stone-600 mb-1.5';

// interface Props {
//   onSwitchToRegister: () => void;
// }

// export default function Login({ onSwitchToRegister }: Props) {
//   const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     clearSessionExpiredMessage();
//     setSubmitting(true);
//     try {
//       await login(email, password);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Could not log in. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="min-h-full flex items-center justify-center px-4 py-12" style={{ background: '#faf8f5' }}>
//       <div className="w-full max-w-sm animate-fade-in">
//         <div className="flex flex-col items-center mb-8">
//           <Logo size={40} />
//           <div className="mt-3 text-lg font-bold text-stone-900 tracking-tight">HarvestGuard</div>
//           <div className="text-xs text-stone-400">Post-Harvest AI</div>
//         </div>

//         <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
//           <h1 className="text-lg font-bold text-stone-900 mb-1">Log in</h1>
//           <p className="text-sm text-stone-500 mb-5">Welcome back. Enter your details to continue.</p>

//           {sessionExpiredMessage && (
//             <div className="mb-4 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
//               {sessionExpiredMessage}
//             </div>
//           )}
//           {error && (
//             <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className={labelClass}>Email</label>
//               <input
//                 type="email"
//                 required
//                 autoComplete="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 className={inputClass}
//                 placeholder="you@example.com"
//               />
//             </div>
//             <div>
//               <label className={labelClass}>Password</label>
//               <input
//                 type="password"
//                 required
//                 autoComplete="current-password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 className={inputClass}
//                 placeholder="••••••••"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
//               style={{ background: '#1e6b45' }}
//             >
//               {submitting ? 'Logging in…' : 'Log in'}
//             </button>
//           </form>

//           <p className="mt-5 text-center text-xs text-stone-500">
//             Don't have an account?{' '}
//             <button onClick={onSwitchToRegister} className="font-semibold text-emerald-700 hover:underline">
//               Register
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, type FormEvent } from 'react';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full border border-stone-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-stone-400';

interface Props {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: Props) {
  const { login, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    clearSessionExpiredMessage();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex items-start justify-between gap-2 mb-7">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-stone-900">Welcome Back</h1>
          <p className="text-sm text-stone-500 mt-1 whitespace-nowrap">Sign in to continue to HarvestGuard</p>
        </div>
        <p className="text-xs text-stone-500 text-right leading-relaxed shrink-0 pl-2">
          <span className="block whitespace-nowrap">New here?</span>
          <button
            onClick={onSwitchToRegister}
            className="block whitespace-nowrap font-semibold hover:underline"
            style={{ color: '#1e6b45' }}
          >
            Create an account →
          </button>
        </p>
      </div>

      {sessionExpiredMessage && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {sessionExpiredMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={inputClass}
            placeholder="Email address"
          />
        </div>
        <div className="relative">
          <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={inputClass + ' pr-9'}
            placeholder="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-stone-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-stone-300 accent-emerald-700"
            />
            Remember me
          </label>
          <button type="button" className="font-medium hover:underline" style={{ color: '#1e6b45' }}>
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1e6b45, #163f2a)' }}
        >
          {submitting ? 'Signing in…' : 'Sign In'}
          {!submitting && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-[11px] text-stone-400">or continue with</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 border border-stone-200 rounded-lg py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <GoogleIcon /> Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 border border-stone-200 rounded-lg py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <MicrosoftIcon /> Microsoft
        </button>
      </div>
    </AuthLayout>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 4l6 5 6-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="2.5" y="7" width="11" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7V5a3.5 3.5 0 017 0v2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M1.5 8S4 3 8 3s6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M6.5 3.4A6.9 6.9 0 018 3.2c4 0 6.5 4.8 6.5 4.8a12 12 0 01-2.2 2.8M4.3 4.6C2.6 5.8 1.5 8 1.5 8s2.5 4.8 6.5 4.8c.9 0 1.8-.2 2.5-.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.05-1.2-.15-1.75H9v3.3h4.8a4.1 4.1 0 01-1.78 2.7v2.2h2.9c1.7-1.55 2.68-3.85 2.68-6.45z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.42-.8 5.9-2.15l-2.9-2.2c-.8.55-1.83.85-3 .85-2.3 0-4.25-1.55-4.95-3.65H1.05v2.3A9 9 0 009 18z" />
      <path fill="#FBBC05" d="M4.05 10.85a5.4 5.4 0 010-3.7v-2.3H1.05a9 9 0 000 8.3l3-2.3z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.47.45 3.4 1.32l2.55-2.55A8.5 8.5 0 009 0 9 9 0 001.05 4.85l3 2.3C4.75 5.05 6.7 3.6 9 3.6z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16">
      <rect x="0.5" y="0.5" width="7" height="7" fill="#F35325" />
      <rect x="8.5" y="0.5" width="7" height="7" fill="#81BC06" />
      <rect x="0.5" y="8.5" width="7" height="7" fill="#05A6F0" />
      <rect x="8.5" y="8.5" width="7" height="7" fill="#FFBA08" />
    </svg>
  );
}