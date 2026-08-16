import type { RiveNodeStatus } from './RiveGameboardNode.types';
import './RiveGameboardNode.css';

export function RiveGameboardNode({
  status,
  selected = false,
}: {
  status: RiveNodeStatus;
  selected?: boolean;
}) {
  const active = status === 'berjalan';
  const completed = status === 'selesai';
  const locked = status === 'terkunci' || status === 'rencana';

  return (
    <span
      className="course-node__vector-node"
      data-status={status}
      data-selected={selected}
      aria-hidden="true"
    >
      <svg
        className="course-node__vector-svg"
        viewBox="0 0 140 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Shackle Gradient */}
          <linearGradient id="padlockShackle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C7D2FE" />
            <stop offset="30%" stopColor="#818CF8" />
            <stop offset="75%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          {/* Faceted Padlock - Top Left (Gold to Orange) */}
          <linearGradient id="padlockFacetTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="45%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          {/* Faceted Padlock - Bottom Left (Coral to Magenta) */}
          <linearGradient id="padlockFacetBottomLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="60%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#C026D3" />
          </linearGradient>

          {/* Faceted Padlock - Top Right (Pink to Purple) */}
          <linearGradient id="padlockFacetTopRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="50%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Faceted Padlock - Bottom Right (Purple to Deep Indigo) */}
          <linearGradient id="padlockFacetBottomRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3730A3" />
          </linearGradient>

          {/* 3D Gear Stone Extrusion Gradient */}
          <linearGradient id="stoneExtrudeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* 3D Ring Cylinder Extrusion Gradient */}
          <linearGradient id="ringExtrudeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
        </defs>

        {/* ------------------------------------------------ 1. ACTIVE 12-TOOTHED BEVELED STONE GEAR */}
        {active && (
          <g className="pedestal-active">
            {/* Soft Ambient Cast Shadow */}
            <ellipse
              cx="70"
              cy="84"
              rx="54"
              ry="18"
              fill="rgba(15, 23, 42, 0.16)"
            />
            <ellipse
              cx="70"
              cy="80"
              rx="42"
              ry="12"
              fill="rgba(15, 23, 42, 0.22)"
            />

            {/* 3D Side Depth Extrusion */}
            <path
              d="M 22 60
                 L 20 72
                 C 20 84, 120 84, 120 72
                 L 118 60
                 Z"
              fill="url(#stoneExtrudeGrad)"
            />

            {/* 12-Tooth Gear Chamfer Facet Border */}
            <path
              d="M 20 58
                 L 32 46 L 48 43 L 70 42 L 92 43 L 108 46 L 120 58
                 L 108 70 L 92 73 L 70 74 L 48 73 L 32 70 Z"
              fill="#94A3B8"
            />

            {/* Top Gear Surface Plate */}
            <path
              d="M 24 56
                 L 35 47 L 50 45 L 70 44 L 90 45 L 105 47 L 116 56
                 L 105 65 L 90 67 L 70 68 L 50 67 L 35 65 Z"
              fill="#E2E8F0"
              stroke="#F8FAFC"
              strokeWidth="1.5"
            />

            {/* Raised Plateau Step */}
            <ellipse
              cx="70"
              cy="56"
              rx="38"
              ry="15"
              fill="#F1F5F9"
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />

            {/* Concentric Recessed Ring */}
            <ellipse
              cx="70"
              cy="56"
              rx="26"
              ry="10"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2.2"
            />

            {/* Center Disc */}
            <ellipse
              cx="70"
              cy="56"
              rx="13"
              ry="5.5"
              fill="#E2E8F0"
              stroke="#CBD5E1"
              strokeWidth="1"
            />

            {/* Top Specular Arc */}
            <ellipse
              cx="70"
              cy="54"
              rx="34"
              ry="12"
              fill="none"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="1.2"
            />
          </g>
        )}

        {/* ------------------------------------------------ 2. LOCKED SILVER RING + FACETED PADLOCK */}
        {locked && (
          <g className="pedestal-locked">
            {/* Ambient Platform Shadow */}
            <ellipse
              cx="70"
              cy="84"
              rx="52"
              ry="18"
              fill="rgba(15, 23, 42, 0.15)"
            />
            <ellipse
              cx="70"
              cy="80"
              rx="40"
              ry="11"
              fill="rgba(15, 23, 42, 0.2)"
            />

            {/* 3D Ring Cylinder Depth */}
            <path
              d="M 24 62
                 v 14
                 C 24 86, 116 86, 116 76
                 v -14
                 Z"
              fill="url(#ringExtrudeGrad)"
            />

            {/* 3D Ring Outer Face */}
            <ellipse
              cx="70"
              cy="62"
              rx="46"
              ry="18.5"
              fill="#E2E8F0"
              stroke="#F8FAFC"
              strokeWidth="1.5"
            />

            {/* Recessed Concentric Track */}
            <ellipse
              cx="70"
              cy="62"
              rx="34"
              ry="13.5"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="2.5"
            />

            {/* Center Inner Plateau */}
            <ellipse
              cx="70"
              cy="62"
              rx="24"
              ry="9.5"
              fill="#F8FAFC"
              stroke="#E2E8F0"
              strokeWidth="1"
            />

            {/* Lock Contact Shadow */}
            <ellipse
              cx="70"
              cy="59"
              rx="22"
              ry="7.5"
              fill="rgba(15, 23, 42, 0.28)"
            />

            {/* ----------------- 3D COLORFUL FACETED PRISM PADLOCK ----------------- */}
            {/* Metallic Purple Shackle */}
            <path
              d="M 58 37
                 C 58 17, 82 17, 82 37"
              fill="none"
              stroke="url(#padlockShackle)"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            {/* Shackle Highlight */}
            <path
              d="M 61 33
                 C 61 21, 79 21, 79 33"
              fill="none"
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            {/* Faceted Prism Body (Golden-Amber -> Coral -> Magenta -> Violet-Indigo) */}
            {/* 1. Top-Left Facet */}
            <polygon
              points="51,37 70,29 70,47 46,47"
              fill="url(#padlockFacetTopLeft)"
            />

            {/* 2. Bottom-Left Facet */}
            <polygon
              points="46,47 70,47 70,62 55,62"
              fill="url(#padlockFacetBottomLeft)"
            />

            {/* 3. Top-Right Facet */}
            <polygon
              points="70,29 89,37 94,47 70,47"
              fill="url(#padlockFacetTopRight)"
            />

            {/* 4. Bottom-Right Facet */}
            <polygon
              points="70,47 94,47 85,62 70,62"
              fill="url(#padlockFacetBottomRight)"
            />

            {/* Crisp Top Specular Ridge */}
            <polyline
              points="51,37 70,29 89,37"
              fill="none"
              stroke="rgba(255, 255, 255, 0.95)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Vertical Center Specular Ridge */}
            <line
              x1="70"
              y1="29"
              x2="70"
              y2="62"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.2"
            />

            {/* Obsidian Keyhole */}
            <circle cx="70" cy="48" r="3.5" fill="#0F0E26" />
            <polygon points="68,48 72,48 73,55 67,55" fill="#0F0E26" />
          </g>
        )}

        {/* ------------------------------------------------ 3. COMPLETED CHECKMARK PEDESTAL */}
        {completed && (
          <g className="pedestal-completed">
            {/* Ambient Platform Shadow */}
            <ellipse
              cx="70"
              cy="84"
              rx="52"
              ry="18"
              fill="rgba(15, 23, 42, 0.16)"
            />

            {/* 3D Depth */}
            <path
              d="M 24 62
                 v 14
                 C 24 86, 116 86, 116 76
                 v -14
                 Z"
              fill="#16A34A"
            />

            {/* 3D Emerald Top Face */}
            <ellipse
              cx="70"
              cy="62"
              rx="46"
              ry="18.5"
              fill="#22C55E"
              stroke="#4ADE80"
              strokeWidth="1.5"
            />

            {/* Inner Concentric Ring */}
            <ellipse
              cx="70"
              cy="61"
              rx="34"
              ry="13"
              fill="none"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
            />

            {/* 3D Checkmark */}
            <path
              d="M 57 59 l 9 9 l 19 -19"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>
    </span>
  );
}
