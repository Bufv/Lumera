import { type ReactNode } from 'react';
import './KnowledgeNodeTile.css';

export type KnowledgeNodeType = 'completed' | 'current' | 'available' | 'locked' | 'challenge';

export interface KnowledgeNodeTileProps {
  type: KnowledgeNodeType;
  number?: number | string;
  title: string;
  subtitle?: string;
  selected?: boolean;
  conceptSymbol?: ReactNode;
  popup?: ReactNode;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
  disabled?: boolean;
}

export function KnowledgeNodeTile({
  type,
  number,
  title,
  subtitle,
  selected = false,
  conceptSymbol,
  popup,
  onClick,
  onKeyDown,
  buttonRef,
  disabled = false,
}: KnowledgeNodeTileProps) {
  const isCompleted = type === 'completed';
  const isCurrent = type === 'current';
  const isAvailable = type === 'available';
  const isLocked = type === 'locked';
  const isChallenge = type === 'challenge';

  const defaultSubtitle = isCurrent
    ? 'Sedang dipelajari'
    : isAvailable
      ? 'Berikutnya'
      : isLocked
        ? 'Terkunci'
        : isChallenge
          ? 'Coba pola lain'
          : undefined;

  const displaySubtitle = subtitle ?? defaultSubtitle;
  const ariaLabelText = `${number ? `${number} ` : ''}${title}${displaySubtitle ? `, ${displaySubtitle}` : ''}`;

  return (
    <div
      className="knowledge-node-item"
      data-type={type}
      data-selected={selected}
    >
      <button
        ref={buttonRef}
        type="button"
        className="knowledge-node-button"
        onClick={onClick}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-expanded={selected}
        aria-label={ariaLabelText}
      >
        {/* 3D Isometric Raised Knowledge Token */}
        <div className="knowledge-tile-3d">
          {/* Multi-Color Ambient Glow radiating from behind with smooth enter/exit */}
          <span className="knowledge-tile-ambient-glow" aria-hidden="true" />

          {/* Subtle Ambient Shadow */}
          <div className="knowledge-tile-shadow" />

          {/* 3D Extrusion Side Depth */}
          <div className="knowledge-tile-side" />

          {/* Top Surface Plateau */}
          <div className="knowledge-tile-top">
            {/* Active Aura / Sparkle for Current Node */}
            {isCurrent && !selected && (
              <>
                <span className="knowledge-tile-aura" />
                <span className="knowledge-tile-sparkle" aria-hidden="true">✦</span>
              </>
            )}

            {/* Custom or Default Concept Glyphs */}
            {conceptSymbol ? (
              <span className="knowledge-concept-glyph">{conceptSymbol}</span>
            ) : isCompleted ? (
              <span className="knowledge-concept-glyph glyph-completed">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path
                    d="M 5 12.5 L 9.5 17 L 19 7"
                    stroke="#FFFFFF"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ) : isCurrent ? (
              <span className="knowledge-concept-glyph glyph-current">
                <span className="glyph-math-formula">
                  <em>2x</em> <strong>?</strong>
                </span>
              </span>
            ) : isAvailable ? (
              <span className="knowledge-concept-glyph glyph-pattern">
                <svg viewBox="0 0 28 20" width="26" height="18" fill="none">
                  <circle cx="5" cy="10" r="3.5" fill="#8B7DEC" />
                  <circle cx="23" cy="5" r="3" fill="#6D5CE7" />
                  <circle cx="23" cy="15" r="3" fill="#6D5CE7" />
                  <path d="M 8 10 L 20 6" stroke="#8B7DEC" strokeWidth="2" />
                  <path d="M 8 10 L 20 14" stroke="#8B7DEC" strokeWidth="2" />
                </svg>
              </span>
            ) : isChallenge ? (
              <span className="knowledge-concept-glyph glyph-challenge">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="url(#challengeStarGrad)"
                  />
                  <defs>
                    <linearGradient id="challengeStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FBBF24" />
                      <stop offset="60%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#EA580C" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            ) : (
              <span className="knowledge-concept-glyph glyph-locked">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    rx="2.5"
                    fill="#94A3B8"
                  />
                  <path
                    d="M 8 10 V 6.5 C 8 4.3 9.8 2.5 12 2.5 C 14.2 2.5 16 4.3 16 6.5 V 10"
                    stroke="#94A3B8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="15" r="1.5" fill="#FFFFFF" />
                </svg>
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Label on the Right */}
      <div className="knowledge-node-label">
        <div className="knowledge-node-headline">
          {number && <span className="knowledge-node-num">{number}</span>}
          <strong className="knowledge-node-title">{title}</strong>
        </div>
        {displaySubtitle && (
          <span className="knowledge-node-sub">{displaySubtitle}</span>
        )}
      </div>

      {/* Popout CTA only when selected/clicked */}
      {selected && popup && (
        <div className="knowledge-node-popout-wrap">
          {popup}
        </div>
      )}
    </div>
  );
}
