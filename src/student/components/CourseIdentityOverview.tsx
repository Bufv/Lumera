import { Icon } from '../../design/Icon';
import './CourseIdentityOverview.css';

export interface CourseIdentityOverviewProps {
  title: string;
  subject?: string;
  phase?: string;
  gradeRange?: string;
  description?: string;
  progressPercent?: number;
  totalLevels?: number;
  totalLessons?: number;
}

export function CourseIdentityOverview({
  title = 'Aljabar',
  subject = 'Matematika',
  phase = 'Fase D',
  gradeRange = 'Kelas VII–IX',
  description = 'Memahami bagaimana pola, simbol, persamaan, dan grafik menggambarkan hubungan.',
  progressPercent = 18,
  totalLevels = 6,
  totalLessons = 24,
}: CourseIdentityOverviewProps) {
  return (
    <aside className="course-identity-card" aria-label="Informasi Kursus">
      {/* 3D Course Sculpture Artwork */}
      <div className="course-identity-art-wrap">
        <svg
          className="course-identity-3d-art"
          viewBox="0 0 160 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cardArtBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="cardArtCubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="cardArtAmberCube" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
            <linearGradient id="cardArtVariableX" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>

          {/* Pedestal Ambient Shadow */}
          <ellipse cx="80" cy="96" rx="60" ry="18" fill="rgba(15, 23, 42, 0.12)" />
          <ellipse cx="80" cy="92" rx="46" ry="12" fill="rgba(15, 23, 42, 0.16)" />

          {/* 3D Round Pedestal Extrusion */}
          <path
            d="M 28 72 v 16 C 28 102, 132 102, 132 88 v -16 Z"
            fill="url(#cardArtBaseGrad)"
          />
          <ellipse cx="80" cy="72" rx="52" ry="18" fill="#F8FAFC" stroke="#FFFFFF" strokeWidth="2" />
          <ellipse cx="80" cy="72" rx="38" ry="12" fill="#E2E8F0" />

          {/* Left Decorative Cubes */}
          <polygon points="18,68 28,62 38,68 28,74" fill="#818CF8" />
          <polygon points="18,68 28,74 28,88 18,82" fill="#6366F1" />
          <polygon points="28,74 38,68 38,82 28,88" fill="#4338CA" />

          <polygon points="34,78 40,74 46,78 40,82" fill="#FDE047" />
          <polygon points="34,78 40,82 40,90 34,86" fill="#FBBF24" />
          <polygon points="40,82 46,78 46,86 40,90" fill="#F97316" />

          {/* Prominent 3D Letter 'x' */}
          <g transform="translate(62, 14)">
            <path
              d="M 6 12 L 20 32 L 6 52 L 14 52 L 24 38 L 34 52 L 42 52 L 28 32 L 42 12 L 34 12 L 24 26 L 14 12 Z"
              fill="#3730A3"
              transform="translate(2, 4)"
            />
            <path
              d="M 6 12 L 20 32 L 6 52 L 14 52 L 24 38 L 34 52 L 42 52 L 28 32 L 42 12 L 34 12 L 24 26 L 14 12 Z"
              fill="url(#cardArtVariableX)"
            />
            <path
              d="M 6 12 L 14 12 L 24 26 L 34 12 L 42 12"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>

          {/* Floating '2x + 3' Card on right of pedestal */}
          <g transform="translate(86, 60)">
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
              letterSpacing="-0.02em"
            >
              2x + 3
            </text>
          </g>
        </svg>
      </div>

      {/* Course Title & Metadata */}
      <h1 className="course-identity-title">{title}</h1>
      <div className="course-identity-sub">
        <span>{subject}</span>
        <span className="course-identity-dot">·</span>
        <span>{phase}</span>
      </div>
      <div className="course-identity-grade">{gradeRange}</div>

      <p className="course-identity-desc">{description}</p>

      {/* Progress Bar with Percentage */}
      <div className="course-identity-progress-block">
        <div className="course-identity-progress-bar-wrap">
          <div
            className="course-identity-progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="course-identity-percent">{progressPercent}%</span>
      </div>

      {/* Summary Metadata Pills */}
      <div className="course-identity-meta-row">
        <div className="course-identity-meta-item">
          <Icon name="grid" width={16} height={16} />
          <span>{totalLevels} level</span>
        </div>
        <div className="course-identity-meta-item">
          <Icon name="book" width={16} height={16} />
          <span>{totalLessons} pelajaran</span>
        </div>
      </div>
    </aside>
  );
}
