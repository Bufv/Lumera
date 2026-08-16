import { Icon } from '../../design/Icon';
import './LumeraCourseCard.css';

export interface LumeraCourseCardProps {
  title: string;
  subject?: string;
  phase?: string;
  gradeBand?: string;
  description: string;
  totalLessons?: number;
  totalLevels?: number;
}

export function LumeraCourseCard({
  title = 'Aljabar',
  subject = 'Matematika',
  phase = 'Fase D',
  gradeBand = 'Kelas VII–IX',
  description = 'Memahami pola, simbol, dan hubungan untuk menyelesaikan masalah matematika.',
  totalLessons = 24,
  totalLevels = 6,
}: LumeraCourseCardProps) {
  return (
    <aside className="lumera-course-card" aria-label="Informasi Kursus">
      {/* 3D Isometric Algebra Sculpture */}
      <div className="lumera-card-art-wrap">
        <svg
          viewBox="0 0 160 120"
          width="140"
          height="105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sculptureBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="sculptureXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>

          {/* Pedestal Ambient Shadow */}
          <ellipse cx="80" cy="94" rx="60" ry="18" fill="rgba(15, 23, 42, 0.12)" />
          <ellipse cx="80" cy="90" rx="46" ry="12" fill="rgba(15, 23, 42, 0.16)" />

          {/* 3D Round Pedestal */}
          <path d="M 28 70 v 16 C 28 100, 132 100, 132 86 v -16 Z" fill="url(#sculptureBaseGrad)" />
          <ellipse cx="80" cy="70" rx="52" ry="18" fill="#F8FAFC" stroke="#FFFFFF" strokeWidth="2" />
          <ellipse cx="80" cy="70" rx="38" ry="12" fill="#E2E8F0" />

          {/* Left Decorative Cubes */}
          <polygon points="18,66 28,60 38,66 28,72" fill="#818CF8" />
          <polygon points="18,66 28,72 28,86 18,80" fill="#6366F1" />
          <polygon points="28,72 38,66 38,80 28,86" fill="#4338CA" />

          <polygon points="34,76 40,72 46,76 40,80" fill="#FDE047" />
          <polygon points="34,76 40,80 40,88 34,84" fill="#FBBF24" />
          <polygon points="40,80 46,76 46,84 40,88" fill="#F97316" />

          {/* 3D Standing Letter 'x' */}
          <g transform="translate(62, 12)">
            <path
              d="M 6 12 L 20 32 L 6 52 L 14 52 L 24 38 L 34 52 L 42 52 L 28 32 L 42 12 L 34 12 L 24 26 L 14 12 Z"
              fill="#3730A3"
              transform="translate(2, 4)"
            />
            <path
              d="M 6 12 L 20 32 L 6 52 L 14 52 L 24 38 L 34 52 L 42 52 L 28 32 L 42 12 L 34 12 L 24 26 L 14 12 Z"
              fill="url(#sculptureXGrad)"
            />
            <path
              d="M 6 12 L 14 12 L 24 26 L 34 12 L 42 12"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Floating '2x + 3' Card on right of pedestal */}
          <g transform="translate(86, 58)">
            <rect
              x="0"
              y="0"
              width="60"
              height="30"
              rx="8"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              filter="drop-shadow(0 4px 10px rgba(15, 23, 42, 0.12))"
            />
            <text
              x="30"
              y="20"
              textAnchor="middle"
              fill="#4338CA"
              fontSize="13"
              fontWeight="800"
              fontFamily="inherit"
            >
              2x + 3
            </text>
          </g>
        </svg>
      </div>

      {/* Course Title & Metadata */}
      <h1 className="lumera-card-title">{title}</h1>
      <div className="lumera-card-sub">
        <span>{subject}</span>
        <span className="lumera-card-dot">·</span>
        <span>{phase}</span>
        <span className="lumera-card-dot">·</span>
        <span>{gradeBand}</span>
      </div>

      <p className="lumera-card-desc">{description}</p>

      {/* Metadata Row */}
      <div className="lumera-card-meta">
        <div className="lumera-card-meta-item">
          <Icon name="graduation" width={17} height={17} />
          <span>{totalLessons} Pelajaran</span>
        </div>
        <div className="lumera-card-meta-item">
          <Icon name="grid" width={16} height={16} />
          <span>{totalLevels} Level</span>
        </div>
      </div>
    </aside>
  );
}
