import { useMemo, useState } from 'react';
import { Icon } from '../design/Icon';
import {
  LEARNING_PATHS,
  type LearningCourse,
  type LearningPath,
} from './learningCatalog';
import './LearningPathsScreen.css';

export interface LearningPathsScreenProps {
  onOpenCourse: (courseSlug: string) => void;
  progressByCourse?: Readonly<Record<string, number>>;
  demo?: boolean;
}

type StageFilter = 'all' | 'smp' | 'sma';
type SubjectFilter = 'matematika' | 'ipa' | 'informatika';

const SUBJECT_LABELS: Record<SubjectFilter, { label: string; icon: string }> = {
  matematika: { label: 'Matematika', icon: 'calculator' },
  ipa: { label: 'IPA (Sains)', icon: 'science' },
  informatika: { label: 'Informatika', icon: 'computer' },
};

function normalizeQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .trim();
}

function searchablePathText(path: LearningPath): string {
  return normalizeQuery(
    [path.title, path.shortTitle, path.description, path.phase, path.gradeBand].join(' '),
  );
}

function searchableCourseText(course: LearningCourse): string {
  return normalizeQuery(
    [course.title, course.description, course.slug, course.phase, course.gradeBand].join(' '),
  );
}

function clampProgress(value: number | undefined): number {
  return Math.round(Math.max(0, Math.min(100, Number.isFinite(value) ? (value ?? 0) : 0)));
}

function courseProgress(
  course: LearningCourse,
  progressByCourse: Readonly<Record<string, number>>,
): number {
  return clampProgress(progressByCourse[course.slug] ?? progressByCourse[course.id]);
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

function CourseIllustration({ slug, title }: { slug: string; title: string }) {
  const assetSrc = COURSE_3D_ASSETS[slug];

  if (assetSrc) {
    return (
      <img
        src={assetSrc}
        alt={title}
        className="course-node__artwork-img"
        loading="lazy"
      />
    );
  }

  return (
    <svg className="course-node__artwork-svg" viewBox="0 0 100 80" fill="none" aria-hidden="true">
      <circle cx="50" cy="40" r="24" stroke="#dfd7c2" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="38" cy="40" r="4.5" fill="#a4a8b5" />
      <circle cx="50" cy="40" r="4.5" fill="#a4a8b5" />
      <circle cx="62" cy="40" r="4.5" fill="#a4a8b5" />
    </svg>
  );
}

function CourseRoadmapNode({
  course,
  progress,
  onOpen,
}: {
  course: LearningCourse;
  progress: number;
  onOpen: () => void;
}) {
  const available = course.status === 'available';
  const isNew = course.slug === 'aljabar' || course.slug === 'aljabar-lanjut';
  const isCompleted = available && progress >= 100;

  const nodeContent = (
    <div className="course-node__inner">
      <div className="course-node__badge-wrap">
        {isCompleted ? (
          <span className="course-node__badge course-node__badge--check" title="Pelajaran selesai">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        ) : isNew ? (
          <span className="course-node__badge course-node__badge--new">BARU</span>
        ) : !available ? (
          <span className="course-node__badge course-node__badge--lock" title="Segera hadir">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
        ) : null}
      </div>

      <div className="course-node__artwork">
        <CourseIllustration slug={course.slug} title={course.title} />
      </div>

      <div className="course-node__copy">
        <strong className="course-node__title">{course.title}</strong>
        <span className="course-node__sub">
          {available ? `${course.levels.length || 6} level · 24 pelajaran` : 'Segera hadir'}
        </span>
      </div>

      <div className="course-node__track">
        <div
          className="course-node__track-fill"
          style={{ width: `${available ? (isCompleted ? 100 : progress > 0 ? progress : 45) : 0}%` }}
        />
      </div>
    </div>
  );

  return (
    <li className="course-node" data-available={available}>
      {available ? (
        <button
          type="button"
          className="course-node__action"
          onClick={onOpen}
          aria-label={`Buka jalur kursus ${course.title}`}
        >
          {nodeContent}
        </button>
      ) : (
        <article className="course-node__disabled" aria-label={`${course.title}, segera hadir`}>
          {nodeContent}
        </article>
      )}
    </li>
  );
}

function PathRoadmapCard({
  path,
  courses,
  progressByCourse,
  onOpenCourse,
}: {
  path: LearningPath;
  courses: readonly LearningCourse[];
  progressByCourse: Readonly<Record<string, number>>;
  onOpenCourse: (courseSlug: string) => void;
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const isSMP = path.phase === 'D';
  const titleId = `learning-path-${path.slug}`;
  const displayTitle = isSMP ? 'Matematika SMP' : 'Matematika SMA';
  const displayGradeBand = isSMP ? 'Kelas VII–IX' : 'Kelas X–XII';

  const availableCourses = courses.filter((course) => course.status === 'available');
  const averageProgress =
    availableCourses.length === 0
      ? 0
      : Math.round(
          availableCourses.reduce(
            (sum, course) => sum + courseProgress(course, progressByCourse),
            0,
          ) / availableCourses.length,
        );

  const displayProgress = isSMP ? (averageProgress > 0 ? averageProgress : 18) : averageProgress;

  return (
    <section className="path-roadmap-card" aria-labelledby={titleId} data-phase={path.phase}>
      <header className="path-roadmap-card__header">
        <div className="path-roadmap-card__identity">
          <div className="path-roadmap-card__emblem">
            <img
              src={isSMP ? '/assets/emblem_smp_trans.png' : '/assets/emblem_sma_trans.png'}
              alt={`Emblem ${path.title}`}
              className="path-roadmap-card__emblem-img"
            />
          </div>
          <div className="path-roadmap-card__titles">
            <span className="path-roadmap-card__eyebrow">
              MATEMATIKA · FASE {isSMP ? 'D' : 'E–F'}
            </span>
            <div className="path-roadmap-card__headline-row">
              <h2 id={titleId} aria-label={path.title}>
                <span>{displayTitle}</span>
              </h2>
              <span className="path-roadmap-card__grade-badge">{displayGradeBand}</span>
            </div>
            <p className="path-roadmap-card__desc">{path.description}</p>
          </div>
        </div>

        <div className="path-roadmap-card__actions">
          <div className="path-roadmap-card__progress-pill">
            <span
              className="path-roadmap-card__progress-ring"
              style={{
                background:
                  displayProgress > 0
                    ? `conic-gradient(${isSMP ? '#6d5ce7' : '#f59e0b'} ${displayProgress * 3.6}deg, #e4e6ee 0deg)`
                    : '#e4e6ee',
              }}
            >
              <span className="path-roadmap-card__progress-inner" />
            </span>
            <strong>{displayProgress > 0 ? `${displayProgress}% selesai` : 'Belum dimulai'}</strong>
          </div>

          <button
            type="button"
            className="path-roadmap-card__fav-btn"
            data-favorite={isFavorite}
            aria-label={isFavorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
            onClick={() => setIsFavorite((f) => !f)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isFavorite ? '#f59e0b' : 'none'}
              stroke={isFavorite ? '#f59e0b' : '#94a3b8'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
      </header>

      {/* Connected Horizontal Track with Milestone Line & Connector Beads */}
      <div
        className="path-roadmap-card__track-container"
        role="region"
        aria-label={`Urutan kursus ${path.title}`}
        tabIndex={0}
      >
        <div className="path-roadmap-card__track-line-wrapper">
          <div
            className={`path-roadmap-card__track-line path-roadmap-card__track-line--${isSMP ? 'violet' : 'amber'}`}
          />
        </div>

        <ol className="path-roadmap-card__nodes-list">
          {courses.map((course) => (
            <CourseRoadmapNode
              key={course.id}
              course={course}
              progress={courseProgress(course, progressByCourse)}
              onOpen={() => onOpenCourse(course.slug)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

export function LearningPathsScreen({
  onOpenCourse,
  progressByCourse = {},
  demo = false,
}: LearningPathsScreenProps) {
  const [query, setQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('matematika');
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);

  const normalizedQuery = normalizeQuery(query);

  const visiblePaths = useMemo(() => {
    if (subjectFilter !== 'matematika') return [];

    let paths = LEARNING_PATHS;
    if (stageFilter === 'smp') paths = paths.filter((p) => p.phase === 'D');
    if (stageFilter === 'sma') paths = paths.filter((p) => p.phase === 'F');

    if (normalizedQuery === '') {
      return paths.map((path) => ({ path, courses: path.courses }));
    }

    return paths.flatMap((path) => {
      const pathMatches = searchablePathText(path).includes(normalizedQuery);
      const matchedCourses = pathMatches
        ? path.courses
        : path.courses.filter((course) => searchableCourseText(course).includes(normalizedQuery));
      return matchedCourses.length > 0 ? [{ path, courses: matchedCourses }] : [];
    });
  }, [stageFilter, subjectFilter, normalizedQuery]);

  const resultCount = visiblePaths.reduce((sum, item) => sum + item.courses.length, 0);

  return (
    <main className="learning-library">
      <div className="learning-library__container">
        {/* Hero Header */}
        <header className="learning-library__hero">
          <div className="learning-library__hero-left">
            <div className="learning-library__title-row">
              <h1 className="learning-library__title">
                <span className="visually-hidden">Temukan ide. Mainkan sampai masuk akal.</span>
                <span aria-hidden="true">Belajar</span>
              </h1>
              <span className="learning-library__status-count" aria-live="polite">
                {normalizedQuery === ''
                  ? `${visiblePaths.length} jalur belajar${demo ? ' · progres demo' : ''}`
                  : `${resultCount} kursus ditemukan`}
              </span>
            </div>
            <p className="learning-library__subtitle">
              Jalur terstruktur untuk memahami konsep, bukan sekadar menghafalnya.
            </p>

            {/* Single Integrated Toolbar (Filter Pills Left + Search Right) */}
            <div className="learning-library__toolbar">
              <div className="learning-library__filter-bar">
                <button
                  type="button"
                  className="learning-library__filter-pill"
                  data-active={stageFilter === 'all'}
                  onClick={() => setStageFilter('all')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Semua
                </button>

                <button
                  type="button"
                  className="learning-library__filter-pill"
                  data-active={stageFilter === 'smp'}
                  onClick={() => setStageFilter('smp')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                  </svg>
                  SMP
                </button>

                <button
                  type="button"
                  className="learning-library__filter-pill"
                  data-active={stageFilter === 'sma'}
                  onClick={() => setStageFilter('sma')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                  </svg>
                  SMA
                </button>

                <div className="learning-library__subject-dropdown-wrap">
                  <button
                    type="button"
                    className="learning-library__filter-pill learning-library__filter-pill--dropdown"
                    data-active={subjectDropdownOpen || subjectFilter !== 'matematika'}
                    onClick={() => setSubjectDropdownOpen((open) => !open)}
                    aria-expanded={subjectDropdownOpen}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <line x1="8" y1="6" x2="16" y2="6" />
                      <line x1="16" y1="14" x2="16" y2="18" />
                      <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
                    </svg>
                    {SUBJECT_LABELS[subjectFilter].label}
                    <svg
                      className="learning-library__dropdown-chevron"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      data-open={subjectDropdownOpen}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {subjectDropdownOpen && (
                    <div className="learning-library__subject-menu" role="menu">
                      {(Object.keys(SUBJECT_LABELS) as SubjectFilter[]).map((key) => (
                        <button
                          type="button"
                          key={key}
                          className="learning-library__subject-option"
                          data-active={subjectFilter === key}
                          onClick={() => {
                            setSubjectFilter(key);
                            setSubjectDropdownOpen(false);
                          }}
                        >
                          {SUBJECT_LABELS[key].label}
                          {key !== 'matematika' && <small>Segera hadir</small>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Toolbar Right: Sleek Expandable Search */}
              <div className="learning-library__toolbar-right">
                <div className={`learning-library__search${query ? ' learning-library__search--filled' : ''}`}>
                  <Icon name="search" width={16} height={16} className="learning-library__search-icon" />
                  <input
                    id="learning-library-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari Aljabar, Kalkulus, atau Geometri"
                    aria-label="Cari jalur atau kursus"
                  />
                  {query !== '' && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      aria-label="Hapus pencarian"
                      className="learning-library__search-clear"
                    >
                      <Icon name="close" width={14} height={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Hero 3D Illustration */}
          <div className="learning-library__hero-art-wrap">
            <img
              src="/assets/belajar_hero_art_trans.png"
              alt="Ilustrasi Matematika Belajar Lumera"
              className="learning-library__hero-art"
            />
          </div>
        </header>

        {/* Roadmap Path Cards */}
        <div className="learning-library__paths-stack">
          {visiblePaths.length > 0 ? (
            visiblePaths.map(({ path, courses: pathCourses }) => (
              <PathRoadmapCard
                key={path.id}
                path={path}
                courses={pathCourses}
                progressByCourse={progressByCourse}
                onOpenCourse={onOpenCourse}
              />
            ))
          ) : (
            <section className="learning-library__empty" aria-live="polite">
              <span className="learning-library__empty-icon" aria-hidden="true">
                <Icon name="search" width={24} height={24} />
              </span>
              <h2>Belum ada yang cocok</h2>
              <p>Coba nama konsep yang lebih singkat, seperti “grafik” atau “fungsi”.</p>
              <button
                type="button"
                className="learning-library__back-math-btn"
                onClick={() => {
                  setQuery('');
                  setSubjectFilter('matematika');
                }}
              >
                Lihat semua jalur
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
