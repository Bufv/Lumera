import { Icon } from '../../design/Icon';
import './CourseIdentityOverview.css';

export interface CourseIdentityOverviewProps {
  title: string;
  slug?: string;
  subject?: string;
  phase?: string;
  gradeRange?: string;
  description?: string;
  progressPercent?: number;
  totalLevels?: number;
  totalLessons?: number;
  badge?: string;
  imageSrc?: string;
}

const COURSE_3D_ASSETS: Record<string, string> = {
  'bilangan-bulat': '/assets/course_bilangan_trans.png',
  'bilangan': '/assets/course_bilangan_trans.png',
  'aljabar': '/assets/course_aljabar_trans.png',
  'relasi-dan-fungsi': '/assets/course_relasi_trans.png',
  'geometri': '/assets/course_geometri_trans.png',
  'data-dan-peluang': '/assets/course_data_trans.png',
  'kalkulus': '/assets/course_kalkulus_trans.png',
  'aljabar-lanjut': '/assets/course_aljabar_lanjut_trans.png',
  'geometri-analitik': '/assets/course_geometri_analitik_trans.png',
};

export function CourseIdentityOverview({
  title = 'Aljabar',
  slug = 'aljabar',
  subject = 'Matematika',
  phase = 'Fase D',
  gradeRange = 'Kelas VII–IX',
  description = 'Memahami bagaimana pola, simbol, persamaan, dan grafik menggambarkan hubungan.',
  progressPercent = 0,
  totalLevels = 6,
  totalLessons = 24,
  badge = 'BARU',
  imageSrc,
}: CourseIdentityOverviewProps) {
  const assetSrc = imageSrc ?? COURSE_3D_ASSETS[slug] ?? '/assets/course_aljabar_trans.png';

  return (
    <aside className="course-identity-card" aria-label="Informasi Kursus">
      {/* Top Row: 3D Artwork and 'BARU' Status Badge */}
      <div className="course-identity-card-header">
        <div className="course-identity-art-wrap">
          <img
            src={assetSrc}
            alt={title}
            className="course-identity-3d-img"
            loading="lazy"
          />
          <div className="course-identity-art-shadow" />
        </div>
        {badge && <span className="course-identity-badge-new">{badge}</span>}
      </div>

      {/* Course Title & Category */}
      <h1 className="course-identity-title">{title}</h1>
      <div className="course-identity-tags">
        <span className="course-identity-tag course-identity-tag--subject">{subject}</span>
        <span className="course-identity-dot">·</span>
        <span className="course-identity-tag">{phase}</span>
        <span className="course-identity-dot">·</span>
        <span className="course-identity-tag">{gradeRange}</span>
      </div>

      <p className="course-identity-desc">{description}</p>

      {/* Progress Bar with Percentage */}
      <div className="course-identity-progress-block">
        <div className="course-identity-progress-bar-wrap">
          <div
            className="course-identity-progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-label={`${progressPercent}% kursus ${title} selesai`}
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="course-identity-percent">{progressPercent}%</span>
      </div>

      {/* Summary Metadata Pill */}
      <div className="course-identity-meta-row">
        <div className="course-identity-meta-item">
          <Icon name="grid" width={16} height={16} />
          <span>{totalLevels} level · {totalLessons} pelajaran</span>
        </div>
      </div>
    </aside>
  );
}
