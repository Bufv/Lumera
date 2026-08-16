import './BrilliantPlatformNode.css';

export type PlatformStatus = 'completed' | 'current' | 'locked' | 'special';

export interface BrilliantPlatformNodeProps {
  status: PlatformStatus;
  number?: number;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function BrilliantPlatformNode({
  status,
  title,
  subtitle,
  onClick,
  disabled = false,
}: BrilliantPlatformNodeProps) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';
  const isSpecial = status === 'special';

  return (
    <div className="brilliant-platform-item" data-status={status}>
      <button
        type="button"
        className="brilliant-platform-btn"
        onClick={onClick}
        disabled={disabled || isLocked}
        aria-label={`${title}, ${status}`}
      >
        <div className="brilliant-platform-svg-wrap">
          <svg
            viewBox="0 0 160 120"
            width="140"
            height="105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Blue Active / Completed Platform Gradients */}
              <linearGradient id="blueBaseDepth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1E40AF" />
              </linearGradient>
              <linearGradient id="blueDiscTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>

              {/* Silver / Grey Inactive Platform Gradients */}
              <linearGradient id="silverBaseDepth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="silverDiscTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Floating Emerald Gem Gradient */}
              <linearGradient id="emeraldGemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="60%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>

              {/* Iridescent Dumbbell / Token Gradient */}
              <linearGradient id="iridescentDumbbell" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="40%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* -------------------------------- 1. COMPLETED (Blue Disc + Checkmark) */}
            {isCompleted && (
              <g className="platform-completed-group">
                {/* Ambient Shadow */}
                <ellipse cx="80" cy="80" rx="56" ry="19" fill="rgba(30, 64, 175, 0.22)" filter="blur(3px)" />
                <ellipse cx="80" cy="76" rx="46" ry="14" fill="rgba(15, 23, 42, 0.28)" />

                {/* 3D Blue Platform Cylinder Side */}
                <path d="M 28 58 v 16 C 28 88, 132 88, 132 74 v -16 Z" fill="url(#blueBaseDepth)" />

                {/* Outer Ring Top Surface */}
                <ellipse cx="80" cy="58" rx="52" ry="21" fill="url(#blueDiscTop)" stroke="#93C5FD" strokeWidth="1.5" />

                {/* Recessed Concentric Track */}
                <ellipse cx="80" cy="58" rx="40" ry="15" fill="#1D4ED8" />

                {/* Center Raised Plateau */}
                <ellipse cx="80" cy="56" rx="30" ry="11" fill="#3B82F6" stroke="#BFDBFE" strokeWidth="1.2" />

                {/* Glowing White Checkmark */}
                <path
                  d="M 70 56 L 77 62 L 91 50"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}

            {/* -------------------------------- 2. CURRENT / ACTIVE (Blue Disc + Floating Emerald Gem) */}
            {isCurrent && (
              <g className="platform-current-group">
                {/* Ambient Shadow */}
                <ellipse cx="80" cy="82" rx="56" ry="19" fill="rgba(37, 99, 235, 0.28)" filter="blur(4px)" />
                <ellipse cx="80" cy="78" rx="46" ry="14" fill="rgba(15, 23, 42, 0.3)" />

                {/* 3D Blue Platform Cylinder Side */}
                <path d="M 28 60 v 16 C 28 90, 132 90, 132 76 v -16 Z" fill="url(#blueBaseDepth)" />

                {/* Outer Ring Top Surface */}
                <ellipse cx="80" cy="60" rx="52" ry="21" fill="url(#blueDiscTop)" stroke="#93C5FD" strokeWidth="1.5" />

                {/* Recessed Concentric Track */}
                <ellipse cx="80" cy="60" rx="40" ry="15" fill="#1E40AF" />

                {/* Center Glowing White Disc */}
                <ellipse cx="80" cy="58" rx="30" ry="11" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1.5" />

                {/* Floating 3D Emerald Mascot/Gem Token */}
                <g className="floating-gem-token" transform="translate(0, -6)">
                  {/* Gem Base Shadow onto platform */}
                  <ellipse cx="80" cy="46" rx="14" ry="5" fill="rgba(22, 163, 74, 0.35)" filter="blur(2px)" />

                  {/* 3D Emerald Rounded Diamond Body */}
                  <path
                    d="M 80 8
                       C 94 8, 100 18, 100 24
                       C 100 32, 88 42, 80 44
                       C 72 42, 60 32, 60 24
                       C 60 18, 66 8, 80 8 Z"
                    fill="url(#emeraldGemGrad)"
                    stroke="#86EFAC"
                    strokeWidth="1.5"
                  />

                  {/* Gem Inner Facet / Smile Curve */}
                  <path
                    d="M 72 24 C 76 28, 84 28, 88 24"
                    stroke="#14532D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Specular Highlight on Gem */}
                  <ellipse cx="74" cy="16" rx="4" ry="2" fill="rgba(255, 255, 255, 0.75)" transform="rotate(-30 74 16)" />
                </g>
              </g>
            )}

            {/* -------------------------------- 3. LOCKED / INACTIVE (Silver / Grey Concentric Disc) */}
            {isLocked && (
              <g className="platform-locked-group">
                {/* Ambient Shadow */}
                <ellipse cx="80" cy="80" rx="52" ry="18" fill="rgba(15, 23, 42, 0.14)" />
                <ellipse cx="80" cy="76" rx="42" ry="13" fill="rgba(15, 23, 42, 0.18)" />

                {/* 3D Cylinder Depth */}
                <path d="M 30 58 v 14 C 30 86, 130 86, 130 72 v -14 Z" fill="url(#silverBaseDepth)" />

                {/* Outer Ring Top Surface */}
                <ellipse cx="80" cy="58" rx="50" ry="20" fill="url(#silverDiscTop)" stroke="#F8FAFC" strokeWidth="1.5" />

                {/* Recessed Concentric Track */}
                <ellipse cx="80" cy="58" rx="38" ry="14.5" fill="#CBD5E1" />

                {/* Center Plateau */}
                <ellipse cx="80" cy="57" rx="28" ry="10.5" fill="#E2E8F0" stroke="#F1F5F9" strokeWidth="1.2" />
              </g>
            )}

            {/* -------------------------------- 4. SPECIAL NODE (Silver Disc + Right Side Glowing Pedestal) */}
            {isSpecial && (
              <g className="platform-special-group">
                {/* Main Silver Platform Shadow & Body */}
                <ellipse cx="64" cy="82" rx="48" ry="17" fill="rgba(15, 23, 42, 0.14)" />
                <path d="M 18 60 v 14 C 18 88, 110 88, 110 74 v -14 Z" fill="url(#silverBaseDepth)" />
                <ellipse cx="64" cy="60" rx="46" ry="19" fill="url(#silverDiscTop)" stroke="#F8FAFC" strokeWidth="1.5" />
                <ellipse cx="64" cy="60" rx="34" ry="13.5" fill="#CBD5E1" />
                <ellipse cx="64" cy="59" rx="24" ry="9.5" fill="#E2E8F0" stroke="#F1F5F9" strokeWidth="1.2" />

                {/* Side Pedestal with Iridescent Dumbbell / Challenge Token */}
                <g className="side-pedestal-group" transform="translate(112, 52)">
                  {/* Side Pedestal Ambient Shadow */}
                  <ellipse cx="18" cy="30" rx="24" ry="10" fill="rgba(244, 114, 182, 0.35)" filter="blur(4px)" />
                  <ellipse cx="18" cy="26" rx="18" ry="7" fill="rgba(15, 23, 42, 0.4)" />

                  {/* Dark Charcoal Mini Pedestal */}
                  <path d="M 4 16 v 8 C 4 30, 32 30, 32 24 v -8 Z" fill="#1E293B" />
                  <ellipse cx="18" cy="16" rx="14" ry="6" fill="#334155" stroke="#475569" strokeWidth="1" />

                  {/* 3D Iridescent Dumbbell / Practice Token */}
                  <g transform="translate(0, -18)">
                    {/* Left Bell */}
                    <ellipse cx="10" cy="18" rx="6" ry="10" fill="url(#iridescentDumbbell)" />
                    {/* Center Handle Bar */}
                    <path d="M 10 18 L 26 10" stroke="url(#iridescentDumbbell)" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Right Bell */}
                    <ellipse cx="26" cy="10" rx="6" ry="10" fill="url(#iridescentDumbbell)" />
                  </g>
                </g>
              </g>
            )}
          </svg>
        </div>
      </button>

      {/* Label on the Right */}
      <div className="brilliant-platform-label">
        <strong className="brilliant-platform-title">{title}</strong>
        {subtitle && <span className="brilliant-platform-sub">{subtitle}</span>}
      </div>
    </div>
  );
}
