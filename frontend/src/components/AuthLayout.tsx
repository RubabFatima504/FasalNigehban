import type { ReactNode } from 'react';
import Logo from './Logo';

const features = [
  {
    label: 'Real-time\nInsights',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path d="M2 13V8M6 13V5M10 13V7M14 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Weather\nData',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2v1.4M3.5 4.5l1 1M12.5 4.5l-1 1M2 9h1.4M12.6 9H14"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M4.5 13h6a2.3 2.3 0 000-4.6 3.2 3.2 0 00-6-1.3"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Market\nPrices',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 4.5v7M5.8 10a2.2 2.2 0 002.2 1.5c1.4 0 2.4-.8 2.4-1.9 0-2.3-4.4-1.4-4.4-3.5 0-1 .9-1.7 2.2-1.7 1 0 1.8.4 2.2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Smarter\nRecommendations',
    icon: (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1.5c.4 1.6 1.5 2.7 3 3-1.5.3-2.6 1.4-3 3-.4-1.6-1.5-2.7-3-3 1.5-.3 2.6-1.4 3-3z"
          fill="currentColor"
        />
        <path
          d="M13 9.5c.25.9.85 1.5 1.7 1.7-.85.2-1.45.8-1.7 1.7-.25-.9-.85-1.5-1.7-1.7.85-.2 1.45-.8 1.7-1.7z"
          fill="currentColor"
        />
        <path
          d="M3.3 9c.3 1.1 1 1.8 2.1 2.1-1.1.3-1.8 1-2.1 2.1-.3-1.1-1-1.8-2.1-2.1 1.1-.3 1.8-1 2.1-2.1z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

interface Props {
  /** Right-hand panel content: the heading, subcopy, form, and footer link. */
  children: ReactNode;
}

/**
 * Shared two-panel shell for the Login and Register screens: a tea-field hero
 * panel with the HarvestGuard pitch on the left, and a white form card on the
 * right. Matches the uploaded design reference.
 */
export default function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Background photo fills the entire page */}
      <img
        src="/assets/hero-field.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(100deg, rgba(5,18,12,0.9) 0%, rgba(7,25,17,0.62) 38%, rgba(8,26,18,0.3) 60%, rgba(8,26,18,0.16) 100%)',
        }}
      />

      {/* vivid leaf sprig, bottom-left of the page */}
      <img
        src="/assets/leaf-vivid.png"
        alt=""
        className="hidden lg:block absolute -left-10 -bottom-10 w-96 opacity-90 pointer-events-none"
        style={{ transform: 'scaleY(-1)' }}
      />

      {/* Pakistan data-network graphic, vertically centered, left-mid of the hero area — kept clear of the floating card */}
      <img
        src="/assets/map.png"
        alt="Pakistan agricultural network"
        className="hidden lg:block absolute top-1/2 left-[30%] -translate-y-1/2 w-[26rem] xl:w-[30rem] drop-shadow-[0_0_24px_rgba(52,211,153,0.3)] pointer-events-none"
      />

      {/* leaf sprigs pinned at the screen corners */}
      <img
        src="/assets/leaf-top.png"
        alt=""
        className="hidden lg:block absolute -top-4 -right-4 w-64 opacity-90 pointer-events-none select-none z-20"
      />
      <img
        src="/assets/leaf-corner.png"
        alt=""
        className="hidden lg:block absolute -bottom-6 -right-6 w-60 opacity-85 pointer-events-none select-none z-20"
      />

      <div className="relative z-10 min-h-full flex flex-col lg:flex-row items-center lg:items-stretch">
        {/* Hero content */}
        <div className="hidden lg:flex flex-col flex-1 px-10 py-8 xl:px-14 xl:py-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="text-white font-bold text-2xl tracking-tight">
                Harvest<span className="text-emerald-400">Guard</span>
              </span>
            </div>
            <p className="text-right text-xs leading-snug text-white/75 pt-1">
              Smarter Decisions.
              <br />
              Less Post-Harvest Loss.
            </p>
          </div>

          <div className="mt-auto pb-2">
            <h1 className="text-white text-[2.6rem] xl:text-[3rem] font-bold leading-[1.12] tracking-tight max-w-lg">
              Data-driven post-harvest solutions for a{' '}
              <span className="text-emerald-400">stronger agri future.</span>
            </h1>

            <div className="mt-9 flex gap-6 xl:gap-8">
              {features.map(f => (
                <div key={f.label} className="flex flex-col gap-2.5 w-20">
                  <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 backdrop-blur-sm">
                    {f.icon}
                  </div>
                  <span className="text-sm leading-tight text-white/85 whitespace-pre-line">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating white card with the form */}
        <div className="relative w-full lg:w-[32%] lg:max-w-[480px] my-3 mr-3 ml-3 lg:my-8 lg:mr-20 xl:mr-24 lg:ml-0 rounded-2xl bg-white shadow-2xl shadow-stone-900/25 flex flex-col justify-center px-8 py-10 sm:px-12 lg:px-10 xl:px-12 overflow-y-auto overflow-x-hidden animate-fade-in">
          {/* Mobile-only logo, since the hero content is hidden below lg */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Logo size={26} />
            <span className="font-bold text-stone-900 tracking-tight">
              Harvest<span style={{ color: '#1e6b45' }}>Guard</span>
            </span>
          </div>

          <div className="relative w-full mx-auto lg:mx-0">{children}</div>
        </div>
      </div>
    </div>
  );
}