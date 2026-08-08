import { useEffect, useState } from 'react';
import { ArtworkFrame } from '../design/ArtworkFrame';
import { Icon, type IconName } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { Tactile } from '../design/Tactile';
import type { LearnerProfile, LearningGoal, StudyDay } from '../profile';
import { INTEGER_COURSE, MATHEMATICS_GRADE_7_PATH, STUDENT_SUBJECTS } from './catalog';
import type { ArdiDemoFixture, DemoSavedConcept } from './demo';
import type { CourseView, RouteName } from './routes';
import type { StudentModuleSummary, StudentSubjectId } from './types';
import './StudentScreens.css';

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

const COMPACT_DAY_LABELS: Readonly<Record<string, string>> = {
  ...DAY_LABELS,
  senin: 'Sen',
  selasa: 'Sel',
  rabu: 'Rab',
  kamis: 'Kam',
  jumat: 'Jum',
  sabtu: 'Sab',
  minggu: 'Min',
};

function Breadcrumbs({ items }: { items: { label: string; onClick?: () => void }[] }) {
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
  const displayName = demoData?.profile.displayName ?? (profile.displayName || 'Pelajar');
  const percent = demoData?.courseProgress.percent ?? 0;
  const minutes = demoData?.profile.dailyMinutes ?? profile.dailyMinutes;
  const dayKeys: readonly string[] = demoData ? demoData.profile.studyDays : profile.studyDays;
  const rhythmDays = dayKeys.map(
    (day) =>
      COMPACT_DAY_LABELS[day] ?? day.slice(0, 3).replace(/^./, (letter) => letter.toUpperCase()),
  );

  return (
    <main className="student-page home-page home-page--focused">
      <div className="student-container">
        <header className="home-intro home-intro--focused">
          <h1>
            Selamat malam, {displayName} <span aria-hidden="true">👋</span>
          </h1>
          <p>Mau lanjut belajar atau menyegarkan ingatanmu?</p>
        </header>

        <div className="home-overview">
          <section className="home-continue-panel" aria-labelledby="home-course-title">
            <div className="home-continue-panel__art">
              <ArtworkFrame
                assetKey="course-integers"
                placeholderIcon="math"
                decorative
                ratio="wide"
                variant="violet"
              />
              <span className="home-continue-panel__lumo" aria-hidden="true">
                <Lumo size={62} title="" />
              </span>
            </div>

            <div className="home-continue-panel__body">
              <span className="page-kicker">Matematika · SMP Kelas VII</span>
              <h2 id="home-course-title">Menjelajahi Bilangan Negatif</h2>
              <p>Membandingkan Bilangan Negatif</p>

              {percent > 0 ? (
                <div className="home-course-progress">
                  <span>
                    <strong>{percent}%</strong> selesai
                  </span>
                  <ProgressBar
                    percent={percent}
                    label={percent + '% kursus Bilangan Bulat selesai'}
                  />
                </div>
              ) : (
                <span className="home-course-ready">
                  <Icon name="check" width={17} height={17} />
                  Siap dimulai
                </span>
              )}

              <Tactile
                className="home-continue-panel__action"
                onClick={() => onNavigate('integers')}
              >
                Lihat jalur
                <Icon name="arrow" width={18} height={18} />
              </Tactile>
            </div>
          </section>

          <aside className="home-rhythm-panel" aria-labelledby="home-rhythm-title">
            <span className="page-kicker">Ritme belajarmu</span>
            <h2 id="home-rhythm-title">Target yang ringan, tetap konsisten.</h2>
            <div className="home-rhythm-panel__target">
              <strong>{minutes}</strong>
              <span>
                menit
                <small>target belajar</small>
              </span>
            </div>
            <div className="home-rhythm-panel__days" aria-label="Hari belajar pilihan">
              {rhythmDays.length > 0 ? (
                rhythmDays.map((day, index) => <span key={day + '-' + index}>{day}</span>)
              ) : (
                <p>Belum ada hari yang dipilih.</p>
              )}
            </div>
            <button
              type="button"
              className="home-rhythm-panel__settings"
              onClick={() => onNavigate('settings')}
            >
              Atur ritme belajar
              <Icon name="chevron" width={16} height={16} />
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export function LearnScreen({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  const path = MATHEMATICS_GRADE_7_PATH;

  return (
    <main className="student-page learn-page">
      <div className="student-container">
        <PageHeading
          eyebrow="Belajar"
          title="Satu jalur, langkah demi langkah."
          description="Mulai dari Matematika SMP Kelas VII. Mata pelajaran berikutnya akan hadir dengan struktur yang sama jelasnya."
        />

        <section className="learning-path-band" aria-labelledby="active-path-title">
          <div className="learning-path-band__copy">
            <span className="catalog-status catalog-status--available">Jalur tersedia</span>
            <h2 id="active-path-title">{path.title}</h2>
            <p>{path.description}</p>
            <dl>
              <div>
                <dt>Jenjang</dt>
                <dd>SMP Kelas VII</dd>
              </div>
              <div>
                <dt>Isi jalur</dt>
                <dd>
                  {path.courses.length} kursus · {INTEGER_COURSE.modules.length} modul
                </dd>
              </div>
            </dl>
          </div>
          <ArtworkFrame
            assetKey="subject-mathematics"
            placeholderIcon="math"
            alt="Ilustrasi jalur Matematika"
            ratio="wide"
            variant="violet"
          />
        </section>

        <section className="course-rail-section" aria-labelledby="course-rail-title">
          <div className="section-title-row section-title-row--large">
            <div>
              <span className="page-kicker">Di jalur ini</span>
              <h2 id="course-rail-title">Kursus</h2>
            </div>
            <p>Urutan kursus mengikuti fondasi yang dibutuhkan siswa Kelas VII.</p>
          </div>
          <div className="course-rail">
            {path.courses.map((course, index) =>
              course.status === 'available' ? (
                <Tactile
                  key={course.id}
                  variant="card"
                  className="course-rail__card course-rail__card--active"
                  onClick={() => onNavigate('integers')}
                  aria-label={'Lihat jalur kursus ' + course.title}
                >
                  <span className="course-rail__number">{String(index + 1).padStart(2, '0')}</span>
                  <Icon name="arrow" width={20} height={20} />
                  <ArtworkFrame
                    assetKey={course.artworkKey}
                    placeholderIcon="math"
                    decorative
                    ratio="wide"
                    variant="violet"
                  />
                  <span className="course-rail__copy">
                    <small>Kursus aktif</small>
                    <strong>{course.title}</strong>
                    <p>{course.description}</p>
                    <span>{course.modules.length} modul · Struktur tersedia</span>
                  </span>
                </Tactile>
              ) : (
                <article
                  key={course.id}
                  className="course-rail__card course-rail__card--passive"
                  aria-label={course.title + ', segera hadir'}
                >
                  <span className="course-rail__number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="catalog-status">Segera hadir</span>
                  <ArtworkFrame
                    assetKey={course.artworkKey}
                    placeholderIcon="math"
                    decorative
                    ratio="wide"
                  />
                  <span className="course-rail__copy">
                    <small>Kursus berikutnya</small>
                    <strong>{course.title}</strong>
                    <p>{course.description}</p>
                  </span>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="subject-directory" aria-labelledby="subject-directory-title">
          <div className="section-title-row section-title-row--large">
            <div>
              <span className="page-kicker">Direktori</span>
              <h2 id="subject-directory-title">Mata pelajaran Lumera</h2>
            </div>
            <p>Delapan bidang belajar, dengan status ketersediaan yang selalu jujur.</p>
          </div>
          <div className="subject-directory__grid">
            {STUDENT_SUBJECTS.map((subject) => (
              <article
                key={subject.id}
                className="subject-directory__item"
                data-available={subject.status === 'available'}
              >
                <span className="subject-directory__icon">
                  <Icon name={SUBJECT_ICONS[subject.id]} width={21} height={21} />
                </span>
                <span>
                  <strong>{subject.title}</strong>
                  <small>{subject.status === 'available' ? 'Tersedia' : 'Segera hadir'}</small>
                </span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function MathScreen({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  return <LearnScreen onNavigate={onNavigate} />;
}

function ModuleControl({
  module,
  index,
  progress,
  variant,
  onOpen,
}: {
  module: StudentModuleSummary;
  index: number;
  progress: number;
  variant: CourseView;
  onOpen: (module: StudentModuleSummary) => void;
}) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <Tactile
      variant="card"
      fullWidth
      className={'course-module-control course-module-control--' + variant}
      onClick={() => onOpen(module)}
      aria-label={'Lihat ringkasan modul ' + module.title}
    >
      <span className="course-module-control__number">{String(index + 1).padStart(2, '0')}</span>
      <ArtworkFrame
        assetKey={module.artworkKey}
        placeholderIcon={index === 0 ? 'route' : 'math'}
        decorative
        variant={index === 0 ? 'amber' : 'violet'}
      />
      <span className="course-module-control__copy">
        <strong>{module.title}</strong>
        <small>{module.description}</small>
      </span>
      <span className="course-module-control__state" data-progress={safeProgress > 0}>
        {safeProgress > 0 ? safeProgress + '% selesai' : 'Belum dimulai'}
        <Icon name="chevron" width={17} height={17} />
      </span>
    </Tactile>
  );
}

function ModuleOutcomes({
  outcomes,
  ordered = false,
}: {
  outcomes: readonly string[];
  ordered?: boolean;
}) {
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className="course-module-outcomes">
      {outcomes.map((outcome, index) => (
        <li key={outcome}>
          <span>{index + 1}</span>
          <p>{outcome}</p>
        </li>
      ))}
    </Tag>
  );
}

export function IntegerCourseScreen({
  percent,
  view,
  onChangeView,
  moduleProgress,
  onNavigate,
  onOpenModule,
}: {
  percent: number;
  view: CourseView;
  onChangeView: (view: CourseView) => void;
  moduleProgress: Readonly<Record<string, number>>;
  onNavigate: (route: RouteName) => void;
  onOpenModule: (module: StudentModuleSummary) => void;
}) {
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <main className="student-page course-page">
      <div className="student-container">
        <Breadcrumbs
          items={[
            { label: 'Belajar', onClick: () => onNavigate('learn') },
            { label: 'Matematika', onClick: () => onNavigate('math') },
            { label: 'Bilangan Bulat' },
          ]}
        />

        <section className="course-summary" aria-labelledby="course-summary-title">
          <ArtworkFrame
            assetKey={INTEGER_COURSE.artworkKey}
            placeholderIcon="math"
            alt="Ilustrasi Bilangan Bulat"
            ratio="wide"
            variant="violet"
          />
          <div className="course-summary__copy">
            <span className="page-kicker">Kursus · SMP Kelas VII</span>
            <h1 id="course-summary-title">{INTEGER_COURSE.title}</h1>
            <p>{INTEGER_COURSE.description}</p>
            <span className="course-summary__meta">
              {INTEGER_COURSE.modules.length} modul · 6 capaian pemahaman
            </span>
          </div>
          <div className="course-summary__progress">
            {safePercent > 0 ? (
              <>
                <span>
                  <strong>{safePercent}%</strong>
                  <small>progres kursus</small>
                </span>
                <ProgressBar
                  percent={safePercent}
                  label={safePercent + '% kursus Bilangan Bulat selesai'}
                />
              </>
            ) : (
              <span className="course-summary__ready">
                <Icon name="check" width={17} height={17} />
                Siap dimulai
              </span>
            )}
          </div>
        </section>

        <section className="course-structure" aria-labelledby="course-structure-title">
          <header className="course-structure__heading">
            <div>
              <span className="page-kicker">Struktur kursus</span>
              <h2 id="course-structure-title">Dua modul fondasi</h2>
              <p>Pilih modul untuk membaca tujuan dan cakupannya.</p>
            </div>
            <div className="course-view-switch" role="group" aria-label="Pilih tampilan kursus">
              <button
                type="button"
                data-active={view === 'roadmap'}
                aria-pressed={view === 'roadmap'}
                onClick={() => onChangeView('roadmap')}
              >
                <Icon name="route" width={17} height={17} />
                Jalur
              </button>
              <button
                type="button"
                data-active={view === 'list'}
                aria-pressed={view === 'list'}
                onClick={() => onChangeView('list')}
              >
                <Icon name="list" width={17} height={17} />
                Daftar
              </button>
            </div>
          </header>

          {view === 'roadmap' ? (
            <div className="course-roadmap" data-view="roadmap">
              {INTEGER_COURSE.modules.map((module, index) => (
                <section className="course-roadmap__checkpoint" key={module.id}>
                  <span className="course-roadmap__step">
                    Modul {String(index + 1).padStart(2, '0')}
                  </span>
                  <ModuleControl
                    module={module}
                    index={index}
                    progress={moduleProgress[module.id] ?? 0}
                    variant="roadmap"
                    onOpen={onOpenModule}
                  />
                  <ModuleOutcomes outcomes={module.outcomes} />
                </section>
              ))}
            </div>
          ) : (
            <div className="course-list-view" data-view="list">
              {INTEGER_COURSE.modules.map((module, index) => (
                <section className="course-list-view__section" key={module.id}>
                  <ModuleControl
                    module={module}
                    index={index}
                    progress={moduleProgress[module.id] ?? 0}
                    variant="list"
                    onOpen={onOpenModule}
                  />
                  <div className="course-list-view__outcomes">
                    <strong>Yang akan dipahami</strong>
                    <ModuleOutcomes outcomes={module.outcomes} ordered />
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
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
  demo,
  onSave,
  onExitDemo,
  onRequestResetProfile,
  onRequestResetDemo,
}: {
  profile: LearnerProfile;
  demo: boolean;
  onSave: (profile: LearnerProfile) => void;
  onExitDemo: () => void;
  onRequestResetProfile: () => void;
  onRequestResetDemo: () => void;
}) {
  const [draft, setDraft] = useState(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(profile), [profile]);

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
      </div>
    </main>
  );
}
