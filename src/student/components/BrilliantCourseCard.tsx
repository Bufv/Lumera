import { Icon } from '../../design/Icon';
import './BrilliantCourseCard.css';

export interface BrilliantCourseCardProps {
  title: string;
  description: string;
  totalLessons?: number;
  totalExercises?: number;
}

export function BrilliantCourseCard({
  title = 'Aljabar',
  description = 'Memahami pola, simbol, dan hubungan untuk menyelesaikan masalah matematika.',
  totalLessons = 24,
  totalExercises = 142,
}: BrilliantCourseCardProps) {
  return (
    <aside className="brilliant-course-card" aria-label="Informasi Kursus">
      {/* Course Artwork (Easel Canvas Artwork matching screenshot) */}
      <div className="brilliant-card-art-wrap">
        <svg
          viewBox="0 0 100 100"
          width="80"
          height="80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wooden Easel Legs */}
          <path d="M 30 20 L 15 90" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <path d="M 70 20 L 85 90" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <path d="M 50 15 L 50 90" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 12 70 L 88 70" stroke="#B45309" strokeWidth="5" strokeLinecap="round" />

          {/* Blue Canvas Board */}
          <rect x="20" y="24" width="60" height="46" rx="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="1.5" />

          {/* Geometric Canvas Patterns */}
          <rect x="26" y="30" width="14" height="14" fill="#FFFFFF" rx="2" />
          <rect x="26" y="48" width="14" height="14" fill="#60A5FA" rx="2" />
          <polygon points="46,30 60,44 46,44" fill="#FBBF24" />
          <rect x="52" y="48" width="20" height="14" fill="#F59E0B" rx="2" />
          <circle cx="62" cy="55" r="3.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Course Title & Description */}
      <h1 className="brilliant-card-title">{title}</h1>
      <p className="brilliant-card-desc">{description}</p>

      {/* Metadata Row */}
      <div className="brilliant-card-meta">
        <div className="brilliant-card-meta-item">
          <Icon name="graduation" width={17} height={17} />
          <span>{totalLessons} Pelajaran</span>
        </div>
        <div className="brilliant-card-meta-item">
          <Icon name="sparkles" width={16} height={16} />
          <span>{totalExercises} Latihan</span>
        </div>
      </div>
    </aside>
  );
}
