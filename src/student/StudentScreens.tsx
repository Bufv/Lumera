import { useEffect, useRef, useState } from 'react';
import { ArtworkFrame } from '../design/ArtworkFrame';
import { Icon, type IconName } from '../design/Icon';
import { FloatingLumo } from '../design/FloatingLumo';
import { Tactile } from '../design/Tactile';
import type { LearnerProfile, LearningGoal, StudyDay } from '../profile';
import { unduhBerkasEkspor } from '../backup/export';
import { terapkanImpor, validasiBerkasImpor } from '../backup/import';
import type { ExportedProgressFile } from '../backup/schema';
import type { Siswa } from '../progress/store';
import { MATHEMATICS_GRADE_7_PATH, STUDENT_SUBJECTS } from './catalog';
import type { ArdiDemoFixture, DemoSavedConcept } from './demo';
import type { RouteName } from './routes';
import type { StudentSubjectId } from './types';
import './StudentScreens.css';
import './LearnScreen.css';

const SUBJECT_ICONS: Record<StudentSubjectId, IconName> = {
  matematika: 'math',
  ipa: 'science',
  'bahasa-indonesia': 'book',
  'bahasa-inggris': 'globe',
  ips: 'globe',
  informatika: 'pages',
  'koding-ai': 'code',
  'literasi-finansial': 'bar-chart',
};

const SUBJECT_TONES: Record<StudentSubjectId, 'violet' | 'amber' | 'blue' | 'green'> = {
  matematika: 'violet',
  ipa: 'green',
  'bahasa-indonesia': 'amber',
  'bahasa-inggris': 'blue',
  ips: 'amber',
  informatika: 'blue',
  'koding-ai': 'violet',
  'literasi-finansial': 'green',
};

const COURSE_VISUALS: Record<
  string,
  { icon: IconName; variant: 'violet' | 'amber'; tone: 'violet' | 'amber' | 'blue' }
> = {
  'bilangan-bulat': { icon: 'math', variant: 'violet', tone: 'violet' },
  'pecahan-dan-desimal': { icon: 'pages', variant: 'amber', tone: 'amber' },
  'perbandingan-dan-skala': { icon: 'bar-chart', variant: 'violet', tone: 'blue' },
  'bentuk-aljabar': { icon: 'sparkles', variant: 'amber', tone: 'violet' },
};

const GOAL_LABELS: Record<LearningGoal, string> = {
  'strengthen-foundations': 'Menguatkan dasar',
  'support-school': 'Mengikuti pelajaran sekolah',
  'build-routine': 'Membangun kebiasaan',
};

const DAY_LABELS: Record<StudyDay, string> = {
  monday: 'Sen',
  tuesday: 'Sel',
  wednesday: 'Rab',
  thursday: 'Kam',
  friday: 'Jum',
  saturday: 'Sab',
  sunday: 'Min',
};

export function Breadcrumbs({ items }: { items: { label: string; onClick?: () => void }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Jejak halaman">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 && <Icon name="chevron" width={14} height={14} />}
          {item.onClick ? (
            <button type="button" onClick={item.onClick}>
              {item.label}
            </button>
          ) : (
            <strong>{item.label}</strong>
          )}
        </span>
      ))}
    </nav>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-heading">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="student-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safe}
    >
      <i style={{ width: `${safe}%` }} />
    </div>
  );
}

export function HomeScreen({
  profile,
  demoData,
  onNavigate,
}: {
  profile: LearnerProfile;
  demoData: ArdiDemoFixture | null;
  onNavigate: (route: RouteName) => void;
}) {
  const isDemo = demoData !== null;
  const displayName = demoData?.profile.displayName ?? (profile.displayName || 'Pelajar');
  const percent = demoData?.courseProgress.percent ?? 0;
  const minutes = demoData?.profile.dailyMinutes ?? profile.dailyMinutes;
  const activityCount = isDemo ? 3 : 0;
  const streakDays = demoData?.streakDays ?? 0;
  const savedCount = demoData?.savedConcepts.length ?? 0;
  const savedTimeLabels = ['2 jam lalu', 'Kemarin', '2 hari lalu'];
  const refreshItems: {
    title: string;
    icon: IconName;
    tone: 'blue' | 'orange' | 'violet' | 'amber';
    strength: number;
    status: string;
  }[] = [
    {
      title: 'Positif, Negatif, dan Nol',
      icon: 'pages',
      tone: 'blue',
      strength: isDemo ? 4 : 0,
      status: isDemo ? 'Kuat' : 'Belum mulai',
    },
    {
      title: 'Garis Bilangan',
      icon: 'target',
      tone: 'orange',
      strength: isDemo ? 3 : 0,
      status: isDemo ? 'Stabil' : 'Belum mulai',
    },
    {
      title: 'Nilai Mutlak',
      icon: 'bar-chart',
      tone: 'violet',
      strength: isDemo ? 2 : 0,
      status: isDemo ? 'Mulai pudar' : 'Belum mulai',
    },
    {
      title: 'Penjumlahan Bilangan Bulat',
      icon: 'sparkles',
      tone: 'amber',
      strength: isDemo ? 2 : 0,
      status: isDemo ? 'Perlu diulangi' : 'Belum mulai',
    },
  ];

  return (
    <main className="student-page home-page home-page--dashboard">
      <div className="student-container">
        <header className="home-intro">
          <h1>
            Selamat malam, {displayName} <span aria-hidden="true">👋</span>
          </h1>
          <p>Mau lanjut belajar atau menyegarkan ingatanmu?</p>
        </header>

        <div className="home-dashboard">
          <div className="home-main-column">
            {/* 1. Lanjutkan Belajar (Classic Wide Hero Frame: Flush 3D Art on Left | Body with Title & Bottom-Right Button) */}
            <section className="continue-section" aria-label="Lanjutkan belajar">
              <div className="continue-card">
                <div className="continue-card__art">
                  <ArtworkFrame
                    assetKey="course-integers"
                    placeholderIcon="math"
                    alt="Ilustrasi Matematika Bilangan Bulat"
                    ratio="wide"
                    variant="violet"
                  />
                </div>
                <div className="continue-card__body">
                  <div className="continue-card__header">
                    <span className="continue-card__eyebrow">LANJUTKAN BELAJAR</span>
                    <strong className="continue-card__title">Menjelajahi Bilangan Negatif</strong>
                    <span className="continue-card__module">Membandingkan Bilangan Negatif</span>
                  </div>

                  <div className="continue-card__footer">
                    <div className="continue-card__meta">
                      <div className="continue-card__progress-copy">
                        <b>{percent > 0 ? percent : 45}% selesai</b>
                        <i>•</i>
                        <span>sekitar 4 menit lagi</span>
                      </div>
                      <div className="continue-card__progress-row">
                        <ProgressBar percent={percent > 0 ? percent : 45} label={(percent > 0 ? percent : 45) + '% kursus selesai'} />
                      </div>
                    </div>

                    <div className="continue-card__action-wrap">
                      <div className="continue-card__rainbow-halo" aria-hidden="true" />
                      <Tactile className="continue-card__action" onClick={() => onNavigate('integers')}>
                        Lanjutkan
                        <Icon name="arrow" width={18} height={18} />
                      </Tactile>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Daily Refresh (4 compact cards in 1 single horizontal row) */}
            <section className="refresh-panel">
              <div className="home-panel-heading">
                <div>
                  <h2>
                    Daily Refresh <Icon name="info" width={14} height={14} />
                  </h2>
                  <p>Segarkan kembali konsep sebelum mulai terlupakan.</p>
                </div>
                <Tactile className="refresh-panel__action" onClick={() => onNavigate('review')}>
                  <Icon name="play" width={14} height={14} />
                  {isDemo ? 'Mulai Refresh' : 'Lihat Ulangi'}
                </Tactile>
              </div>
              <div className="refresh-grid refresh-grid--single-row">
                {refreshItems.map((item) => (
                  <Tactile
                    key={item.title}
                    variant="card"
                    className="refresh-card"
                    onClick={() => onNavigate('review')}
                  >
                    <span className={'refresh-card__icon refresh-card__icon--' + item.tone}>
                      <Icon name={item.icon} width={18} height={18} />
                    </span>
                    <strong>{item.title}</strong>
                    <span className="refresh-card__mastery">
                      <small>{item.status}</small>
                      <span
                        className={'mastery-dots mastery-dots--' + item.tone}
                        aria-label={item.strength + ' dari 5 tingkat penguasaan'}
                      >
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <i key={dot} data-filled={dot <= item.strength} />
                        ))}
                      </span>
                    </span>
                  </Tactile>
                ))}
              </div>
            </section>

            {/* 3. Jalur Belajarmu (3 course cards in 1 single horizontal row) */}
            <section className="learning-paths-panel">
              <div className="home-panel-heading">
                <h2>Jalur belajarmu</h2>
                <button
                  type="button"
                  className="home-flat-link"
                  onClick={() => onNavigate('learn')}
                >
                  Lihat semua <Icon name="chevron" width={14} height={14} />
                </button>
              </div>
              <div className="learning-paths-grid">
                <Tactile
                  variant="card"
                  className="path-card path-card--active"
                  onClick={() => onNavigate('math')}
                >
                  <span className="path-card__icon">
                    <Icon name="math" width={24} height={24} />
                  </span>
                  <span className="path-card__copy">
                    <strong>Matematika</strong>
                    <small>SMP Kelas VII</small>
                  </span>
                  <Icon name="chevron" width={15} height={15} />
                  {percent > 0 ? (
                    <span className="path-card__progress">
                      <b>{percent}%</b>
                      <ProgressBar percent={percent} label={percent + '% Matematika selesai'} />
                    </span>
                  ) : (
                    <span className="path-card__status">Siap dimulai</span>
                  )}
                </Tactile>

                <article className="path-card path-card--passive path-card--disabled" aria-label="IPA, segera hadir">
                  <span className="path-card__icon path-card__icon--science">
                    <Icon name="science" width={24} height={24} />
                  </span>
                  <span className="path-card__copy">
                    <strong>IPA</strong>
                    <small>SMP Kelas VII</small>
                  </span>
                  <Icon name="chevron" width={15} height={15} />
                  <span className="path-card__status">Segera hadir</span>
                </article>

                <article
                  className="path-card path-card--passive path-card--disabled"
                  aria-label="Informatika, dalam pengembangan"
                >
                  <span className="path-card__icon path-card__icon--computer">
                    <Icon name="pages" width={24} height={24} />
                  </span>
                  <span className="path-card__copy">
                    <strong>Informatika</strong>
                    <small>SMP Kelas VII</small>
                  </span>
                  <Icon name="chevron" width={15} height={15} />
                  <span className="path-card__status path-card__status--developing">
                    Dalam pengembangan
                  </span>
                </article>
              </div>
            </section>
          </div>

          <aside className="home-side-column">
            {/* 1. Target Hari Ini */}
            <section className="today-panel">
              <h2>Target hari ini</h2>
              <div className="today-panel__metrics">
                <div>
                  <span className="today-metric__icon today-metric__icon--time">
                    <Icon name="clock" width={25} height={25} />
                  </span>
                  <span>
                    <strong>{minutes} menit</strong>
                    <small>Target belajar</small>
                  </span>
                </div>
                <div>
                  <span className="today-metric__icon today-metric__icon--activity">
                    <Icon name="check" width={23} height={23} />
                  </span>
                  <span>
                    <strong>{activityCount} / 5</strong>
                    <small>Aktivitas selesai</small>
                  </span>
                </div>
              </div>

              <div className="week-streak">
                <span className="week-streak__flame">
                  <Icon name="flame" width={24} height={24} />
                </span>
                <span className="week-streak__copy">
                  <strong>{streakDays > 0 ? streakDays + ' hari' : 'Mulai'}</strong>
                  <small>{streakDays > 0 ? 'konsisten!' : 'streak belajar'}</small>
                </span>
                <div className="week-streak__days">
                  {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, index) => {
                    const filled = isDemo && index < 6;
                    return (
                      <span key={day + '-' + index}>
                        <small>{day}</small>
                        <i data-active={filled}>{filled ? '✓' : ''}</i>
                      </span>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 2. Baru Disimpan */}
            <section className="recent-saved-panel">
              <div className="home-panel-heading">
                <h2>Baru disimpan</h2>
                <button
                  type="button"
                  className="home-flat-link"
                  onClick={() => onNavigate('saved')}
                >
                  Lihat semua <Icon name="chevron" width={14} height={14} />
                </button>
              </div>
              {savedCount > 0 ? (
                <div className="recent-saved-list">
                  {demoData?.savedConcepts.map((concept, index) => (
                    <button type="button" key={concept.id} onClick={() => onNavigate('saved')}>
                      <span
                        className={
                          'recent-saved-list__icon recent-saved-list__icon--' + (index + 1)
                        }
                      >
                        <Icon
                          name={index === 0 ? 'math' : index === 1 ? 'chevron' : 'science'}
                          width={17}
                          height={17}
                        />
                      </span>
                      <span>
                        <strong>{concept.title}</strong>
                        <small>Bilangan Bulat</small>
                      </span>
                      <time>{savedTimeLabels[index]}</time>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="recent-saved-empty">
                  <Icon name="bookmark" width={22} height={22} />
                  <p>Konsep yang kamu simpan akan muncul di sini.</p>
                  <button type="button" onClick={() => onNavigate('saved')}>
                    Buka Simpanan
                  </button>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>

      <FloatingLumo
        message={
          isDemo
            ? 'Kamu masih sedikit ragu saat membandingkan −8 dan −3. Coba latihan singkat selama 3 menit.'
            : 'Kenali dulu urutan modul Bilangan Bulat. Kamu bisa mulai saat kontennya siap.'
        }
        actionLabel={isDemo ? 'Coba sekarang' : 'Lihat rencana'}
        onAction={() => onNavigate(isDemo ? 'review' : 'integers')}
      />
    </main>
  );
}

function normalizeLearningQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .trim();
}

export function LearnScreen({
  onNavigate,
  progressPercent = 0,
}: {
  onNavigate: (route: RouteName) => void;
  progressPercent?: number;
}) {
  const [query, setQuery] = useState('');
  const path = MATHEMATICS_GRADE_7_PATH;
  const safeProgress = Math.max(0, Math.min(100, progressPercent));
  const normalizedQuery = normalizeLearningQuery(query);
  const pathMatches = normalizeLearningQuery(
    ['Matematika', path.title, path.description, 'SMP Kelas VII'].join(' '),
  ).includes(normalizedQuery);
  const visibleCourses =
    normalizedQuery === '' || pathMatches
      ? path.courses
      : path.courses.filter((course) =>
          normalizeLearningQuery(
            [course.title, course.description, course.gradeLabel].join(' '),
          ).includes(normalizedQuery),
        );
  const visibleSubjects =
    normalizedQuery === ''
      ? STUDENT_SUBJECTS
      : STUDENT_SUBJECTS.filter((subject) =>
          normalizeLearningQuery([subject.title, subject.description].join(' ')).includes(
            normalizedQuery,
          ),
        );
  const showPath = visibleCourses.length > 0;
  const resultCount = visibleCourses.length + visibleSubjects.length;

  return (
    <main className="student-page learn-page">
      <div className="student-container learn-catalog">
        <header className="learn-catalog__hero">
          <div className="learn-catalog__intro">
            <span className="page-kicker">Belajar</span>
            <h1>
              Satu jalur, <span>langkah demi langkah.</span>
            </h1>
            <p>Pilih urutan yang jelas, mulai dari fondasi, lalu maju saat kamu sudah siap.</p>
          </div>

          <div className="learn-search-card">
            <span className="learn-search-card__icon" aria-hidden="true">
              <Icon name="route" width={22} height={22} />
            </span>
            <label className="learn-search-card__copy" htmlFor="learn-catalog-search">
              <strong>Apa yang ingin kamu pelajari?</strong>
              <span>Cari jalur, kursus, atau mata pelajaran.</span>
            </label>
            <div className="learn-search">
              <Icon name="search" width={19} height={19} />
              <input
                id="learn-catalog-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Contoh: Bilangan Bulat"
                aria-label="Cari jalur, kursus, atau mata pelajaran"
              />
              {query !== '' && (
                <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian">
                  <Icon name="close" width={16} height={16} />
                </button>
              )}
            </div>
            <span className="learn-search-card__status" aria-live="polite">
              {normalizedQuery === ''
                ? 'Mulai dengan satu topik yang membuatmu penasaran.'
                : `${resultCount} hasil ditemukan`}
            </span>
          </div>
        </header>

        {showPath && (
          <section className="learn-paths" aria-labelledby="your-paths-title">
            <div className="learn-section-heading">
              <div>
                <span>Jalur belajarmu</span>
                <h2 id="your-paths-title">Mulai dari yang paling relevan</h2>
              </div>
              <p>Setiap kursus tersusun berurutan agar fondasinya tidak terlewat.</p>
            </div>

            <article
              className="learn-path"
              id="jalur-matematika"
              aria-labelledby="active-path-title"
            >
              <header className="learn-path__header">
                <span className="learn-path__mark" aria-hidden="true">
                  <Icon name="math" width={34} height={34} />
                </span>

                <div className="learn-path__copy">
                  <span className="learn-path__grade">SMP Kelas VII</span>
                  <h3 id="active-path-title">{path.title}</h3>
                  <p>{path.description}</p>
                </div>

                <div className="learn-path__progress">
                  <span>{safeProgress > 0 ? 'Progres kursus aktif' : 'Status jalur'}</span>
                  <strong>{safeProgress > 0 ? `${safeProgress}% selesai` : 'Siap dimulai'}</strong>
                  {safeProgress > 0 ? (
                    <ProgressBar
                      percent={safeProgress}
                      label={`${safeProgress}% kursus aktif selesai`}
                    />
                  ) : (
                    <small>Mulai dari Bilangan Bulat</small>
                  )}
                </div>
              </header>

              <div className="learn-path__rail-shell">
                <div className="learn-path__rail-heading">
                  <span>
                    <Icon name="route" width={18} height={18} />
                    Urutan kursus
                  </span>
                  <small>{path.courses.length} langkah dalam jalur ini</small>
                </div>

                <div
                  className="learn-path__scroller"
                  role="region"
                  aria-label={`Urutan kursus ${path.title}`}
                  tabIndex={0}
                >
                  <ol className="learn-course-sequence">
                    {visibleCourses.map((course) => {
                      const stepIndex = path.courses.findIndex((item) => item.id === course.id);
                      const visual = COURSE_VISUALS[course.id] ?? {
                        icon: 'math' as IconName,
                        variant: 'violet' as const,
                        tone: 'violet' as const,
                      };
                      const courseDescriptionId = `learn-course-description-${course.id}`;
                      const courseState =
                        safeProgress > 0 ? `${safeProgress}% selesai` : 'mulai di sini';
                      const content = (
                        <>
                          <span className="learn-course__visual" data-tone={visual.tone}>
                            <span className="learn-course__step">
                              {String(stepIndex + 1).padStart(2, '0')}
                            </span>
                            <ArtworkFrame
                              assetKey={course.artworkKey}
                              placeholderIcon={visual.icon}
                              decorative
                              ratio="square"
                              variant={visual.variant}
                            />
                          </span>
                          <span className="learn-course__copy">
                            <small>{course.gradeLabel}</small>
                            <strong>{course.title}</strong>
                            <p id={courseDescriptionId}>{course.description}</p>
                            {course.status === 'available' && (
                              <span className="learn-course__meta">
                                {course.modules.length} modul
                                <Icon name="arrow" width={17} height={17} />
                              </span>
                            )}
                          </span>
                        </>
                      );

                      return (
                        <li
                          key={course.id}
                          className="learn-course-sequence__item"
                          data-last={stepIndex === path.courses.length - 1}
                        >
                          {course.status === 'available' ? (
                            <Tactile
                              variant="card"
                              className="learn-course learn-course--active"
                              onClick={() => onNavigate('integers')}
                              aria-label={`Lihat jalur kursus ${course.title}, ${courseState}, ${course.modules.length} modul`}
                              aria-describedby={courseDescriptionId}
                            >
                              <span className="learn-course__status learn-course__status--active">
                                {safeProgress > 0 ? `${safeProgress}% selesai` : 'Mulai di sini'}
                              </span>
                              {content}
                            </Tactile>
                          ) : (
                            <article
                              className="learn-course learn-course--passive"
                              aria-label={course.title + ', segera hadir'}
                              aria-describedby={courseDescriptionId}
                            >
                              <span className="learn-course__status">Segera hadir</span>
                              {content}
                            </article>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            </article>
          </section>
        )}

        {visibleSubjects.length > 0 && (
          <section className="learn-subjects" aria-labelledby="subject-directory-title">
            <div className="learn-section-heading">
              <div>
                <span>Jelajahi bidang</span>
                <h2 id="subject-directory-title">Mata pelajaran Lumera</h2>
              </div>
              <p>Ketersediaan ditampilkan apa adanya, tanpa kelas atau materi semu.</p>
            </div>

            <div className="learn-subjects__grid">
              {visibleSubjects.map((subject) => {
                const subjectDescriptionId = `learn-subject-description-${subject.id}`;
                const inner = (
                  <>
                    <span className="learn-subject__icon" aria-hidden="true">
                      <Icon name={SUBJECT_ICONS[subject.id]} width={23} height={23} />
                    </span>
                    <span className="learn-subject__copy">
                      <strong>{subject.title}</strong>
                      <small id={subjectDescriptionId}>{subject.description}</small>
                    </span>
                    <span
                      className={`learn-subject__status${
                        subject.status === 'available' ? ' learn-subject__status--available' : ''
                      }`}
                    >
                      {subject.status === 'available' ? 'Tersedia' : 'Segera hadir'}
                    </span>
                  </>
                );

                return subject.status === 'available' ? (
                  <Tactile
                    key={subject.id}
                    variant="card"
                    className="learn-subject learn-subject--active"
                    data-tone={SUBJECT_TONES[subject.id]}
                    onClick={() => onNavigate('math')}
                    aria-label={`Buka mata pelajaran ${subject.title}, tersedia`}
                    aria-describedby={subjectDescriptionId}
                  >
                    {inner}
                  </Tactile>
                ) : (
                  <article
                    key={subject.id}
                    className="learn-subject"
                    data-tone={SUBJECT_TONES[subject.id]}
                    aria-label={`${subject.title}, segera hadir`}
                    aria-describedby={subjectDescriptionId}
                  >
                    {inner}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!showPath && visibleSubjects.length === 0 && (
          <section className="learn-empty">
            <span aria-hidden="true">
              <Icon name="search" width={25} height={25} />
            </span>
            <div>
              <h2>Belum ada yang cocok</h2>
              <p>Coba istilah yang lebih singkat, misalnya “Matematika” atau “IPA”.</p>
            </div>
            <button type="button" onClick={() => setQuery('')}>
              Hapus pencarian
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

export function MathScreen({
  onNavigate,
  progressPercent = 0,
}: {
  onNavigate: (route: RouteName) => void;
  progressPercent?: number;
}) {
  return <LearnScreen onNavigate={onNavigate} progressPercent={progressPercent} />;
}

export function ReviewScreen({
  demoData,
  onNavigate,
}: {
  demoData: ArdiDemoFixture | null;
  onNavigate: (route: RouteName) => void;
}) {
  const concepts = demoData?.reviewConcepts ?? [];
  return (
    <main className="student-page">
      <div className="student-container student-container--reading">
        <PageHeading
          eyebrow="Ulangi"
          title="Segarkan konsep pada waktunya."
          description="Nanti, Lumera akan menyarankan konsep berdasarkan riwayat belajar. Batch ini hanya memperlihatkan keadaan dan struktur ruang Ulangi."
        />
        {concepts.length === 0 ? (
          <EmptyState
            icon="clock"
            title="Belum ada konsep untuk diulangi"
            description="Setelah pelajaran interaktif tersedia dan selesai dikerjakan, konsep yang perlu disegarkan akan muncul di sini."
            action="Lihat rencana kursus"
            onAction={() => onNavigate('integers')}
          />
        ) : (
          <section className="quiet-list" aria-label="Konsep untuk diulangi">
            <header>
              <span>{concepts.length} konsep</span>
              <strong>Siap disegarkan</strong>
            </header>
            {concepts.map((concept) => (
              <article key={concept.id}>
                <span className="quiet-list__icon">
                  <Icon name="clock" width={20} height={20} />
                </span>
                <div>
                  <strong>{concept.title}</strong>
                  <p>{concept.reason}</p>
                </div>
                <span className="catalog-status">Belum aktif</span>
              </article>
            ))}
            <p className="quiet-list__footnote">Latihan review belum dibuka pada Batch 1.</p>
          </section>
        )}
      </div>
    </main>
  );
}

export function SavedScreen({
  demoData,
  onNavigate,
  onOpenConcept,
}: {
  demoData: ArdiDemoFixture | null;
  onNavigate: (route: RouteName) => void;
  onOpenConcept: (concept: DemoSavedConcept) => void;
}) {
  const concepts = demoData?.savedConcepts ?? [];
  return (
    <main className="student-page">
      <div className="student-container student-container--reading">
        <PageHeading
          eyebrow="Simpanan"
          title="Pengetahuan yang mudah ditemukan lagi."
          description="Simpanan akan menjadi tempat ringkasan konsep penting, bukan tumpukan bookmark tanpa konteks."
        />
        {concepts.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title="Belum ada konsep tersimpan"
            description="Ringkasan konsep akan muncul setelah fitur pelajaran dan simpanan diaktifkan pada batch berikutnya."
            action="Jelajahi Matematika"
            onAction={() => onNavigate('math')}
          />
        ) : (
          <section className="saved-list">
            <header>
              <span>{concepts.length} konsep</span>
              <strong>Baru disimpan</strong>
            </header>
            {concepts.map((concept) => (
              <Tactile
                key={concept.id}
                variant="card"
                fullWidth
                className="saved-row"
                onClick={() => onOpenConcept(concept)}
              >
                <span className="saved-row__icon">
                  <Icon name="bookmark" width={20} height={20} />
                </span>
                <span>
                  <strong>{concept.title}</strong>
                  <small>Bilangan Bulat</small>
                </span>
                <span>
                  Lihat ringkasan <Icon name="chevron" width={17} height={17} />
                </span>
              </Tactile>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <section className="empty-state">
      <ArtworkFrame
        assetKey={`empty-${icon}`}
        placeholderIcon={icon}
        alt=""
        decorative
        variant="amber"
      />
      <h2>{title}</h2>
      <p>{description}</p>
      <Tactile tone="neutral" onClick={onAction}>
        {action}
        <Icon name="arrow" width={18} height={18} />
      </Tactile>
    </section>
  );
}

export function ProgressScreen({
  profile,
  demoData,
  onNavigate,
}: {
  profile: LearnerProfile;
  demoData: ArdiDemoFixture | null;
  onNavigate: (route: RouteName) => void;
}) {
  const displayName = demoData?.profile.displayName ?? (profile.displayName || 'Pelajar Lumera');
  const percent = demoData?.courseProgress.percent ?? 0;
  const minutes = demoData?.profile.dailyMinutes ?? profile.dailyMinutes;
  const dayCount = demoData?.profile.studyDays.length ?? profile.studyDays.length;
  const streak = demoData?.streakDays ?? 0;
  return (
    <main className="student-page">
      <div className="student-container student-container--reading">
        <div className="profile-heading">
          <span className="profile-heading__avatar">{displayName[0]?.toUpperCase()}</span>
          <div>
            <span className="page-kicker">Progres dan profil</span>
            <h1>{displayName}</h1>
            <p>SMP Kelas VII · Matematika</p>
          </div>
          <button type="button" className="text-action" onClick={() => onNavigate('settings')}>
            Ubah pengaturan
          </button>
        </div>

        <section className="progress-overview">
          <div className="progress-overview__main">
            <span>Matematika · Bilangan Bulat</span>
            <div>
              <strong>{percent}%</strong>
              <small>progres kursus</small>
            </div>
            <ProgressBar percent={percent} label={`${percent}% kursus selesai`} />
            <p>
              {percent > 0
                ? 'Progres ilustratif hanya berasal dari Matematika.'
                : 'Progres akan mulai terisi setelah pelajaran interaktif tersedia.'}
            </p>
          </div>
          <dl>
            <div>
              <dt>Target harian</dt>
              <dd>{minutes} menit</dd>
            </div>
            <div>
              <dt>Hari belajar</dt>
              <dd>{dayCount} hari</dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>{streak} hari</dd>
            </div>
          </dl>
        </section>

        <section className="availability-note">
          <Icon name="info" width={20} height={20} />
          <div>
            <strong>Hanya progres nyata yang ditampilkan.</strong>
            <p>
              IPA, Informatika, dan mata pelajaran lain tidak diberi persentase sebelum kontennya
              tersedia.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export function SettingsScreen({
  profile,
  siswa,
  demo,
  onSave,
  onExitDemo,
  onRequestResetProfile,
  onRequestResetDemo,
  onRequestDeleteAllData,
  onOpenPrivacy,
  onImportApplied,
}: {
  profile: LearnerProfile;
  /** US7 spec 002 (T038): dibutuhkan untuk cek "berkas lebih lama dari data lokal" saat impor. */
  siswa: Siswa;
  demo: boolean;
  onSave: (profile: LearnerProfile) => void;
  onExitDemo: () => void;
  onRequestResetProfile: () => void;
  onRequestResetDemo: () => void;
  /** US6 spec 002 (T030): terpisah dari onRequestResetProfile — hapus SEMUA data (FR-015). */
  onRequestDeleteAllData: () => void;
  /** US6 spec 002 (T029): buka halaman kebijakan privasi (FR-013). */
  onOpenPrivacy: () => void;
  /** US7 spec 002 (T038): beri tahu StudentApp progres/profil berubah setelah impor berhasil. */
  onImportApplied: (hasil: { siswa: Siswa; learnerProfile: LearnerProfile }) => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<ExportedProgressFile | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(profile), [profile]);

  const terapkanBerkas = (data: ExportedProgressFile) => {
    terapkanImpor(data);
    onImportApplied({ siswa: data.siswa, learnerProfile: data.learnerProfile });
    setPendingImport(null);
    setImportError(null);
    setImportSuccess(true);
  };

  const handleImportFile = async (file: File) => {
    setImportError(null);
    setImportSuccess(false);
    const text = await file.text();
    const hasil = validasiBerkasImpor(text, siswa);

    if (!hasil.ok) {
      setImportError(hasil.error);
      return;
    }
    if (hasil.perluKonfirmasiTimpa) {
      setPendingImport(hasil.data);
      return;
    }
    terapkanBerkas(hasil.data);
  };

  const patch = (changes: Partial<LearnerProfile>) => {
    setSaved(false);
    setDraft((current) => ({ ...current, ...changes }));
  };

  const toggleDay = (day: StudyDay) => {
    patch({
      studyDays: draft.studyDays.includes(day)
        ? draft.studyDays.filter((item) => item !== day)
        : [...draft.studyDays, day],
    });
  };

  return (
    <main className="student-page settings-page">
      <div className="student-container student-container--reading">
        <PageHeading
          eyebrow="Pengaturan"
          title="Atur Lumera sesuai ritmemu."
          description="Semua pilihan pada halaman ini disimpan lokal di perangkat ini."
        />

        {demo && (
          <section className="demo-settings-note">
            <Icon name="info" width={20} height={20} />
            <div>
              <strong>Mode demo tidak mengubah profil utama.</strong>
              <p>Keluar dari demo untuk menyimpan pengaturan milikmu.</p>
            </div>
            <button type="button" onClick={onExitDemo}>
              Keluar dari demo
            </button>
          </section>
        )}

        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!demo) {
              onSave(draft);
              setSaved(true);
            }
          }}
        >
          <section>
            <header>
              <span>01</span>
              <div>
                <h2>Profil pelajar</h2>
                <p>Identitas lokal yang tampil di Beranda.</p>
              </div>
            </header>
            <label>
              <span>Nama panggilan</span>
              <input
                disabled={demo}
                value={draft.displayName}
                maxLength={24}
                onChange={(event) => patch({ displayName: event.target.value })}
              />
            </label>
            <label>
              <span>Jenjang</span>
              <input disabled value="SMP Kelas VII" />
            </label>
          </section>

          <section>
            <header>
              <span>02</span>
              <div>
                <h2>Tujuan belajar</h2>
                <p>Tentukan arah utama untuk rekomendasi berikutnya.</p>
              </div>
            </header>
            <label>
              <span>Tujuan utama</span>
              <select
                disabled={demo}
                value={draft.goal ?? ''}
                onChange={(event) => patch({ goal: event.target.value as LearningGoal })}
              >
                <option value="" disabled>
                  Pilih tujuan
                </option>
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section>
            <header>
              <span>03</span>
              <div>
                <h2>Ritme belajar</h2>
                <p>Target sederhana yang bisa dipertahankan.</p>
              </div>
            </header>
            <label>
              <span>Waktu per hari</span>
              <select
                disabled={demo}
                value={draft.dailyMinutes}
                onChange={(event) =>
                  patch({
                    dailyMinutes: Number(event.target.value) as LearnerProfile['dailyMinutes'],
                  })
                }
              >
                {[10, 15, 20, 30].map((value) => (
                  <option key={value} value={value}>
                    {value} menit
                  </option>
                ))}
              </select>
            </label>
            <fieldset disabled={demo}>
              <legend>Hari belajar</legend>
              <div className="settings-days">
                {(Object.keys(DAY_LABELS) as StudyDay[]).map((day) => (
                  <button
                    type="button"
                    key={day}
                    data-selected={draft.studyDays.includes(day)}
                    aria-pressed={draft.studyDays.includes(day)}
                    onClick={() => toggleDay(day)}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
            </fieldset>
          </section>

          <section>
            <header>
              <span>04</span>
              <div>
                <h2>Aksesibilitas</h2>
                <p>Kurangi gerakan tanpa menghilangkan kejelasan status.</p>
              </div>
            </header>
            <label className="toggle-row">
              <span>
                <strong>Kurangi animasi</strong>
                <small>Menonaktifkan gerakan hover dan tekan.</small>
              </span>
              <input
                type="checkbox"
                disabled={demo}
                checked={draft.reduceMotion}
                onChange={(event) => patch({ reduceMotion: event.target.checked })}
              />
            </label>
          </section>

          <div className="settings-save">
            <Tactile
              type="submit"
              disabled={demo || draft.displayName.trim().length < 2 || draft.studyDays.length === 0}
            >
              Simpan perubahan
            </Tactile>
            {saved && (
              <span role="status">
                <Icon name="check" width={17} height={17} /> Perubahan tersimpan
              </span>
            )}
          </div>
        </form>

        {!demo && (
          <section className="danger-zone backup-zone">
            <div>
              <h2>Cadangkan progresmu</h2>
              <p>
                Ekspor Lumens, streak, dan penguasaan modulmu ke berkas — bisa dipulihkan lagi di
                perangkat ini atau perangkat lain kapan saja.
              </p>
              {importError && (
                <p role="alert" className="backup-zone__error">
                  {importError}
                </p>
              )}
              {importSuccess && (
                <p role="status" className="backup-zone__success">
                  <Icon name="check" width={16} height={16} /> Progres berhasil dipulihkan.
                </p>
              )}
              {pendingImport && (
                <div className="backup-zone__confirm" role="alertdialog" aria-label="Konfirmasi impor">
                  <p>
                    Berkas ini lebih lama dari progresmu saat ini di perangkat ini. Menimpa akan
                    mengganti progres yang lebih baru dengan yang lebih lama.
                  </p>
                  <div>
                    <button type="button" onClick={() => setPendingImport(null)}>
                      Batal
                    </button>
                    <Tactile tone="neutral" onClick={() => terapkanBerkas(pendingImport)}>
                      Tetap timpa dengan berkas ini
                    </Tactile>
                  </div>
                </div>
              )}
            </div>
            <div className="backup-zone__actions">
              <button type="button" onClick={unduhBerkasEkspor}>
                <Icon name="arrow" width={16} height={16} /> Ekspor progres
              </button>
              <button type="button" onClick={() => importInputRef.current?.click()}>
                Impor progres
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="visually-hidden"
                aria-label="Pilih berkas ekspor progres untuk diimpor"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void handleImportFile(file);
                }}
              />
            </div>
          </section>
        )}

        <section className="danger-zone">
          <div>
            <h2>Privasi</h2>
            <p>Lihat data apa saja yang kami simpan dan bagaimana kami memakainya.</p>
          </div>
          <button type="button" onClick={onOpenPrivacy}>
            Baca kebijakan privasi
          </button>
        </section>

        <section className="danger-zone">
          <div>
            <h2>Atur ulang data lokal</h2>
            <p>Tindakan ini tidak bisa dibatalkan dari perangkat ini.</p>
          </div>
          {demo ? (
            <button type="button" onClick={onRequestResetDemo}>
              Reset data demo
            </button>
          ) : (
            <button type="button" onClick={onRequestResetProfile}>
              Ulangi onboarding
            </button>
          )}
        </section>

        {!demo && (
          <section className="danger-zone">
            <div>
              <h2>Hapus semua data saya</h2>
              <p>
                Menghapus profil, progres (Lumens/streak/mastery), dan seluruh catatan aktivitas
                belajar sekaligus — bukan hanya profil. Tidak dapat dipulihkan kecuali sudah
                diekspor lebih dulu.
              </p>
            </div>
            <button type="button" onClick={onRequestDeleteAllData}>
              Hapus semua data saya
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
