import './LumeraPlatformNode.css';

export type LumeraPlatformStatus = 'completed' | 'current' | 'available' | 'locked' | 'special';

export interface LumeraPlatformNodeProps {
  status: LumeraPlatformStatus;
  number?: number;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function LumeraPlatformNode({
  status,
  number,
  title,
  subtitle,
  onClick,
  disabled = false,
}: LumeraPlatformNodeProps) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';
  const isSpecial = status === 'special';

  const defaultSub = isCompleted
    ? 'Selesai'
    : isCurrent
      ? 'Sedang dipelajari'
      : isSpecial
        ? 'Tantangan'
        : isLocked
          ? 'Terkunci'
          : 'Berikutnya';

  const displaySubtitle = subtitle ?? defaultSub;

  return (
    <div className="lumera-platform-item" data-status={status}>
      <button
        type="button"
        className="lumera-platform-btn"
        onClick={onClick}
        disabled={disabled || isLocked}
        aria-label={`${number ? `Pelajaran ${number}: ` : ''}${title}, ${status}`}
      >
        <div className="lumera-platform-svg-wrap">
          <svg
            viewBox="0 0 160 120"
            width="140"
            height="105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Violet Lumera Platform Gradients */}
              <linearGradient id="lumeraVioletBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6D5CE7" />
                <stop offset="100%" stopColor="#4338CA" />
              </linearGradient>
              <linearGradient id="lumeraVioletDisc" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>

              {/* Silver / Grey Stepping Platform Gradients */}
              <linearGradient id="lumeraSilverBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#64748B" />
              </linearGradient>
              <linearGradient id="lumeraSilverDisc" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Amber / Gold Star Token Gradient */}
              <linearGradient id="lumeraAmberStar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="60%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>

            {/* -------------------------------- 1. COMPLETED (Violet Platform + Checkmark) */}
            {isCompleted && (
              <g className="platform-completed-group">
                {/* Ambient Shadow */}
                <ellipse cx="80" cy="82" rx="56" ry="19" fill="rgba(109, 92, 231, 0.24)" filter="blur(3.5px)" />
                <ellipse cx="80" cy="78" rx="46" ry="14" fill="rgba(15, 23, 42, 0.28)" />

                {/* 3D Violet Platform Cylinder Side */}
                <path d="M 28 58 v 16 C 28 88, 132 88, 132 74 v -16 Z" fill="url(#lumeraVioletBase)" />

                {/* Outer Ring Top Surface */}
                <ellipse cx="80" cy="58" rx="52" ry="21" fill="url(#lumeraVioletDisc)" stroke="#A5B4FC" strokeWidth="1.5" />

                {/* Recessed Concentric Ring Track */}
                <ellipse cx="80" cy="58" rx="40" ry="15" fill="#3730A3" />

                {/* Center Raised Plateau */}
                <ellipse cx="80" cy="56" rx="30" ry="11" fill="#6366F1" stroke="#C7D2FE" strokeWidth="1.2" />

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

            {/* -------------------------------- 2. CURRENT / ACTIVE (Violet Glowing Platform + Floating 2x ? Token) */}
            {isCurrent && (
              <g className="platform-current-group">
                {/* Ambient Glow & Shadow */}
                <ellipse cx="80" cy="82" rx="58" ry="20" fill="rgba(109, 92, 231, 0.35)" filter="blur(5px)" />
                <ellipse cx="80" cy="78" rx="46" ry="14" fill="rgba(15, 23, 42, 0.3)" />

                {/* 3D Violet Platform Cylinder Side */}
                <path d="M 28 60 v 16 C 28 90, 132 90, 132 76 v -16 Z" fill="url(#lumeraVioletBase)" />

                {/* Outer Ring Top Surface */}
                <ellipse cx="80" cy="60" rx="52" ry="21" fill="url(#lumeraVioletDisc)" stroke="#C7D2FE" strokeWidth="1.5" />

                {/* Recessed Concentric Ring Track */}
                <ellipse cx="80" cy="60" rx="40" ry="15" fill="#3730A3" />

                {/* Center Glowing Disc */}
                <ellipse cx="80" cy="58" rx="30" ry="11" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="1.5" />

                {/* Floating 3D Concept Token with 2x ? Formula */}
                <g className="floating-concept-token" transform="translate(0, -6)">
                  <ellipse cx="80" cy="46" rx="16" ry="6" fill="rgba(67, 56, 202, 0.3)" filter="blur(2px)" />

                  {/* 3D Raised White Token Box */}
                  <rect
                    x="56"
                    y="10"
                    width="48"
                    height="32"
                    rx="10"
                    fill="#FFFFFF"
                    stroke="#818CF8"
                    strokeWidth="1.8"
                    filter="drop-shadow(0 4px 10px rgba(109, 92, 231, 0.25))"
                  />
                  <text
                    x="80"
                    y="31"
                    textAnchor="middle"
                    fill="#4338CA"
                    fontSize="13"
                    fontWeight="800"
                    fontFamily="inherit"
                  >
                    2x <tspan fill="#F97316">?</tspan>
                  </text>
                </g>
              </g>
            )}

            {/* -------------------------------- 3. LOCKED / INACTIVE (Silver Concentric Disc) */}
            {isLocked && (
              <g className="platform-locked-group">
                {/* Ambient Shadow */}
                <ellipse cx="80" cy="80" rx="52" ry="18" fill="rgba(15, 23, 42, 0.14)" />
                <ellipse cx="80" cy="76" rx="42" ry="13" fill="rgba(15, 23, 42, 0.18)" />

                {/* 3D Cylinder Depth */}
                <path d="M 30 58 v 14 C 30 86, 130 86, 130 72 v -14 Z" fill="url(#lumeraSilverBase)" />

                {/* Outer Ring Top Surface */}
                <ellipse cx="80" cy="58" rx="50" ry="20" fill="url(#lumeraSilverDisc)" stroke="#F8FAFC" strokeWidth="1.5" />

                {/* Recessed Concentric Track */}
                <ellipse cx="80" cy="58" rx="38" ry="14.5" fill="#CBD5E1" />

                {/* Center Plateau */}
                <ellipse cx="80" cy="57" rx="28" ry="10.5" fill="#E2E8F0" stroke="#F1F5F9" strokeWidth="1.2" />
              </g>
            )}

            {/* -------------------------------- 4. SPECIAL NODE (Silver Disc + Side Star Pedestal) */}
            {isSpecial && (
              <g className="platform-special-group">
                {/* Main Silver Platform Shadow & Body */}
                <ellipse cx="64" cy="82" rx="48" ry="17" fill="rgba(15, 23, 42, 0.14)" />
                <path d="M 18 60 v 14 C 18 88, 110 88, 110 74 v -14 Z" fill="url(#lumeraSilverBase)" />
                <ellipse cx="64" cy="60" rx="46" ry="19" fill="url(#lumeraSilverDisc)" stroke="#F8FAFC" strokeWidth="1.5" />
                <ellipse cx="64" cy="60" rx="34" ry="13.5" fill="#CBD5E1" />
                <ellipse cx="64" cy="59" rx="24" ry="9.5" fill="#E2E8F0" stroke="#F1F5F9" strokeWidth="1.2" />

                {/* Side Pedestal with 3D Glowing Star Token */}
                <g className="side-pedestal-group" transform="translate(112, 50)">
                  {/* Side Pedestal Shadow */}
                  <ellipse cx="18" cy="30" rx="22" ry="9" fill="rgba(249, 115, 22, 0.35)" filter="blur(3.5px)" />
                  <ellipse cx="18" cy="26" rx="16" ry="6.5" fill="rgba(15, 23, 42, 0.35)" />

                  {/* Mini Pedestal Base */}
                  <path d="M 6 16 v 8 C 6 28, 30 28, 30 24 v -8 Z" fill="#1E293B" />
                  <ellipse cx="18" cy="16" rx="12" ry="5.5" fill="#334155" stroke="#475569" strokeWidth="1" />

                  {/* 3D Glowing Golden Star */}
                  <g transform="translate(6, -4)">
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      fill="url(#lumeraAmberStar)"
                      filter="drop-shadow(0 2px 6px rgba(249, 115, 22, 0.4))"
                    />
                  </g>
                </g>
              </g>
            )}
          </svg>
        </div>
      </button>

      {/* Label on the Right */}
      <div className="lumera-platform-label">
        <div className="lumera-platform-headline">
          {number && <span className="lumera-platform-num">{number}</span>}
          <strong className="lumera-platform-title">{title}</strong>
        </div>
        <span className="lumera-platform-sub">{displaySubtitle}</span>
      </div>
    </div>
  );
}
