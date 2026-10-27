// import { useState, type FormEvent } from 'react';
// import Logo from '../components/Logo';
// import { useAuth } from '../context/AuthContext';

// const inputClass =
//   'w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all';
// const labelClass = 'block text-xs font-semibold text-stone-600 mb-1.5';

// interface Props {
//   onSwitchToLogin: () => void;
// }

// export default function Register({ onSwitchToLogin }: Props) {
//   const { register } = useAuth();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [cooperativeName, setCooperativeName] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   async function handleSubmit(e: FormEvent) {
//     e.preventDefault();
//     setError(null);
//     if (password.length < 8) {
//       setError('Password must be at least 8 characters.');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       await register({ name, email, password, cooperative_name: cooperativeName || undefined });
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Could not create an account. Please try again.');
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
//           <h1 className="text-lg font-bold text-stone-900 mb-1">Create an account</h1>
//           <p className="text-sm text-stone-500 mb-5">Set up access for your cooperative.</p>

//           {error && (
//             <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className={labelClass}>Full name</label>
//               <input
//                 type="text"
//                 required
//                 autoComplete="name"
//                 value={name}
//                 onChange={e => setName(e.target.value)}
//                 className={inputClass}
//                 placeholder="Ahmad Khan"
//               />
//             </div>
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
//                 minLength={8}
//                 autoComplete="new-password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 className={inputClass}
//                 placeholder="At least 8 characters"
//               />
//             </div>
//             <div>
//               <label className={labelClass}>Cooperative name (optional)</label>
//               <input
//                 type="text"
//                 autoComplete="organization"
//                 value={cooperativeName}
//                 onChange={e => setCooperativeName(e.target.value)}
//                 className={inputClass}
//                 placeholder="Sindh Agri Co-op"
//               />
//             </div>
//             <button
//               type="submit"
//               disabled={submitting}
//               className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
//               style={{ background: '#1e6b45' }}
//             >
//               {submitting ? 'Creating account…' : 'Create account'}
//             </button>
//           </form>

//           <p className="mt-5 text-center text-xs text-stone-500">
//             Already have an account?{' '}
//             <button onClick={onSwitchToLogin} className="font-semibold text-emerald-700 hover:underline">
//               Log in
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
const labelClass = 'block text-xs font-semibold text-stone-600 mb-1.5';

interface Props {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cooperativeName, setCooperativeName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register({ name, email, password, cooperative_name: cooperativeName || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create an account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-stone-900">Create Your Account</h1>
      <p className="text-sm text-stone-500 mt-1 mb-6">
        Join HarvestGuard and make smarter decisions for your harvest.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Full Name</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Email Address</label>
          <div className="relative">
            <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputClass}
              placeholder="Enter your email address"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={inputClass + ' pr-9'}
              placeholder="Create a password"
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
        </div>

        <div>
          <label className={labelClass}>Cooperative Name (optional)</label>
          <div className="relative">
            <BuildingIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              autoComplete="organization"
              value={cooperativeName}
              onChange={e => setCooperativeName(e.target.value)}
              className={inputClass}
              placeholder="Enter your cooperative name"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1e6b45, #163f2a)' }}
        >
          {submitting ? 'Creating account…' : 'Create Account'}
          {!submitting && (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-stone-500">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold hover:underline" style={{ color: '#1e6b45' }}>
          Sign in
        </button>
      </p>
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="5.2" r="2.4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 14c.7-2.8 3-4.2 5.5-4.2S13.3 11.2 14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className={className}>
      <rect x="2.5" y="2" width="7" height="12" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9.5" y="6" width="4" height="8" rx="0.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 4.5h1M4.5 7h1M4.5 9.5h1M6.8 4.5h1M6.8 7h1M6.8 9.5h1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 8S4 3 8 3s6.5 5 6.5 5-2.5 5-6.5 5-6.5-5-6.5-5z" stroke="currentColor" strokeWidth="1.3" />
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