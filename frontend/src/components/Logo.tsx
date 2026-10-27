export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield base */}
      <path
        d="M16 3L5 7.5V15c0 6.5 4.5 12.5 11 14.5 6.5-2 11-8 11-14.5V7.5L16 3z"
        fill="#1e6b45"
        opacity="0.12"
      />
      <path
        d="M16 3L5 7.5V15c0 6.5 4.5 12.5 11 14.5 6.5-2 11-8 11-14.5V7.5L16 3z"
        stroke="#1e6b45"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Grain/wheat stem */}
      <line x1="16" y1="21" x2="16" y2="11" stroke="#1e6b45" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Grain nodes */}
      <ellipse cx="16" cy="18" rx="2.5" ry="1.5" fill="#1e6b45" opacity="0.7"/>
      <ellipse cx="13.5" cy="15.5" rx="2" ry="1.3" fill="#1e6b45" opacity="0.7" transform="rotate(-20 13.5 15.5)"/>
      <ellipse cx="18.5" cy="15.5" rx="2" ry="1.3" fill="#1e6b45" opacity="0.7" transform="rotate(20 18.5 15.5)"/>
      <ellipse cx="14" cy="13" rx="1.8" ry="1.2" fill="#1e6b45" opacity="0.5" transform="rotate(-15 14 13)"/>
      <ellipse cx="18" cy="13" rx="1.8" ry="1.2" fill="#1e6b45" opacity="0.5" transform="rotate(15 18 13)"/>
      {/* Data dot at top */}
      <circle cx="16" cy="11" r="1.5" fill="#1e6b45"/>
    </svg>
  );
}
