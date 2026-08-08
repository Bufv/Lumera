import { useEffect, useState } from 'react';
import { ArtworkFrame } from '../design/ArtworkFrame';
import { Icon, type IconName } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { Tactile } from '../design/Tactile';
import type { LearnerProfile, LearningGoal, StudyDay } from '../profile';
import { INTEGER_COURSE, MATHEMATICS_GRADE_7_PATH, STUDENT_SUBJECTS } from './catalog';
import type { ArdiDemoFixture, DemoSavedConcept } from './demo';
import type { RouteName } from './routes';
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
  const savedCount = demoData?.savedConcepts.length ?? 0;
  const reviewCount = demoData?.reviewConcepts.length ?? 0;
  const minutes = demoData?.profile.dailyMinutes ?? profile.dailyMinutes;
  const activityCount = demoData ? 3 : 0;
  const streakDays = demoData?.streakDays ?? 0;
  const savedTimeLabels = ['2 jam lalu', 'Kemarin', '2 hari lalu'];
  const refreshItems: {
    title: string;
    icon: IconName;
    tone: string;
    strength: number;
    status: string;
  }[] = [
    {
      title: 'Positif, Negatif, dan Nol',
      icon: 'pages',
      tone: 'blue',
      strength: demoData ? 4 : 0,
      status: demoData ? 'Kuat' : 'Belum mulai',
    },
    {
      title: 'Garis Bilangan',
      icon: 'target',
      tone: 'orange',
      strength: demoData ? 3 : 0,
      status: demoData ? 'Stabil' : 'Belum mulai',
    },
    {
      title: 'Nilai Mutlak',
      icon: 'bar-chart',
      tone: 'violet',
      strength: demoData ? 2 : 0,
      status: demoData ? 'Mulai pudar' : 'Belum mulai',
    },
    {
      title: 'Penjumlahan Bilangan Bulat',
      icon: 'sparkles',
      tone: 'amber',
      strength: demoData ? 2 : 0,
      status: demoData ? 'Perlu diulangi' : 'Belum mulai',
    },
  ];

  return (
    <main className="student-page home-page">
      <div className="student-container">
        <div className="home-dashboard">
          <div className="home-main-column">
            <header className="home-intro">
              <h1>
                Selamat malam, {displayName} <span aria-hidden="true">👋</span>
              </h1>
              <p>Mau lanjut belajar atau menyegarkan ingatanmu?</p>
            </header>

            <section className="continue-section" aria-label="Lanjutkan belajar">
              <div className="continue-section__lumo" aria-hidden="true">
                <Lumo size={100} title="" />
                <span>
                  Kamu bisa
                  <br />
                  hari ini! 💪
                </span>
              </div>
              <div className="continue-card">
                <div className="continue-card__art">
                  <img src="/assets/math_banner.png" alt="Ilustrasi Matematika Bilangan Bulat" />
                </div>
                <div className="continue-card__body">
                  <span className="continue-card__eyebrow">Lanjutkan belajar</span>
                  <strong>Menjelajahi Bilangan Negatif</strong>
                  <span className="continue-card__module">
                    <i /> Membandingkan Bilangan Negatif
                  </span>
                  <span className="continue-card__progress-copy">
                    <b>{percent}% selesai</b>
                    <i>•</i>
                    <span>{percent > 0 ? 'sekitar 4 menit lagi' : 'mulai dari sini'}</span>
                  </span>
                  <span className="continue-card__progress-row">
                    <ProgressBar percent={percent} label={`${percent}% kursus selesai`} />
                  </span>
                  <Tactile className="continue-card__action" onClick={() => onNavigate('integers')}>
                    {percent > 0 ? 'Lanjutkan' : 'Lihat rencana'}
                    <Icon name="arrow" width={18} height={18} />
                  </Tactile>
                </div>
              </div>
            </section>

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
                  {reviewCount > 0 ? 'Mulai Refresh' : 'Lihat Ulangi'}
                </Tactile>
              </div>
              <div className="refresh-grid">
                {refreshItems.map((item) => (
                  <Tactile
                    key={item.title}
                    variant="card"
                    className="refresh-card"
                    onClick={() => onNavigate('review')}
                  >
                    <span className={`refresh-card__icon refresh-card__icon--${item.tone}`}>
                      <Icon name={item.icon} width={18} height={18} />
                    </span>
                    <strong>{item.title}</strong>
                    <span className="refresh-card__mastery">
                      <small>{item.status}</small>
                      <span
                        className={`mastery-dots mastery-dots--${item.tone}`}
                        aria-label={`${item.strength} dari 5 tingkat penguasaan`}
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
                  <span className="path-card__progress">
                    <b>{percent}%</b>
                    <ProgressBar percent={percent} label={`${percent}% Matematika selesai`} />
                  </span>
                </Tactile>
                <article className="path-card path-card--passive" aria-label="IPA, segera hadir">
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
                  className="path-card path-card--passive"
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
            <section className="today-panel">
              <h2>Target hari ini</h2>
              <div className="today-panel__metrics">
                <div>
                  <span className="today-metric__icon today-metric__icon--time">
                    <Icon name="clock" width={25} height={25} />
                  </span>
                  <span>
                    <strong>
                      {minutes} <small>menit</small>
                    </strong>
                    <small>Waktu belajar</small>
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
                  <strong>{streakDays} hari</strong>
                  <small>{streakDays > 0 ? 'konsisten!' : 'mulai hari ini'}</small>
                </span>
                <div className="week-streak__days">
                  {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((day, index) => (
                    <span key={`${day}-${index}`}>
                      <small>{day}</small>
                      <i data-active={index < streakDays && index < 6}>
                        {index < streakDays && index < 6 ? '✓' : ''}
                      </i>
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="recommendation-panel">
              <h2>Rekomendasi Lumo</h2>
              <div className="recommendation-panel__message">
                <Lumo size={92} title="Lumo" />
                <p>
                  {percent > 0
                    ? 'Kamu masih sedikit ragu saat membandingkan −8 dan −3. Coba tinjau konsepnya selama 3 menit.'
                    : 'Mulai dari struktur Bilangan Bulat. Kenali urutan modulnya sebelum latihan interaktif hadir.'}
                </p>
              </div>
              <Tactile
                tone="amber"
                fullWidth
                onClick={() => onNavigate(percent > 0 ? 'review' : 'integers')}
              >
                {percent > 0 ? 'Coba sekarang' : 'Lihat rencana'}
                <Icon name="arrow" width={17} height={17} />
              </Tactile>
            </section>

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
                        className={`recent-saved-list__icon recent-saved-list__icon--${index + 1}`}
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
    </main>
  );
}

export function LearnScreen({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  return (
    <main className="student-page">
      <div className="student-container">
        <PageHeading
          eyebrow="Belajar"
          title="Pilih jalur, bukan tumpukan materi."
          description="Lumera menyusun mata pelajaran menjadi urutan yang bisa dipahami. Batch pertama dimulai dari Matematika SMP Kelas VII."
        />

        <section className="catalog-feature">
          <Tactile
            variant="card"
            fullWidth
            className="featured-subject"
            onClick={() => onNavigate('math')}
          >
            <ArtworkFrame
              assetKey="subject-mathematics"
              placeholderIcon="math"
              alt="Ilustrasi Matematika"
              ratio="wide"
              variant="violet"
            />
            <span className="featured-subject__body">
              <span className="catalog-status catalog-status--available">Tersedia sekarang</span>
              <strong>Matematika</strong>
              <p>Bangun nalar bilangan dan dasar pemecahan masalah melalui jalur SMP Kelas VII.</p>
              <span className="featured-subject__meta">
                <Icon name="route" width={17} height={17} /> 1 jalur · 1 kursus · 2 modul
              </span>
            </span>
            <span className="featured-subject__action">
              Jelajahi <Icon name="arrow" width={19} height={19} />
            </span>
          </Tactile>
        </section>

        <section className="future-catalog">
          <div className="section-title-row section-title-row--large">
            <div>
              <span className="page-kicker">Berikutnya</span>
              <h2>Mata pelajaran lain</h2>
            </div>
            <p>Ditampilkan sekarang agar arah kurikulum Lumera tetap jelas.</p>
          </div>
          <div className="subject-grid">
            {STUDENT_SUBJECTS.filter((subject) => subject.status === 'comingSoon').map(
              (subject) => (
                <article className="future-subject" key={subject.id}>
                  <ArtworkFrame
                    assetKey={subject.artworkKey}
                    placeholderIcon={SUBJECT_ICONS[subject.id]}
                    alt={`Ilustrasi ${subject.title}`}
                  />
                  <div>
                    <strong>{subject.title}</strong>
                    <p>{subject.description}</p>
                  </div>
                  <span className="catalog-status">Segera hadir</span>
                </article>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export function MathScreen({ onNavigate }: { onNavigate: (route: RouteName) => void }) {
  return (
    <main className="student-page">
      <div className="student-container student-container--narrow">
        <Breadcrumbs
          items={[
            { label: 'Belajar', onClick: () => onNavigate('learn') },
            { label: 'Matematika' },
          ]}
        />

        <section className="subject-hero">
          <div className="subject-hero__copy">
            <span className="page-kicker">Mata pelajaran</span>
            <h1>Matematika</h1>
            <p>
              Memahami pola, bilangan, dan pemecahan masalah secara bertahap—dimulai dari fondasi
              Kelas VII.
            </p>
            <div className="subject-hero__facts">
              <span>
                <Icon name="graduation" width={18} height={18} /> SMP Kelas VII
              </span>
              <span>
                <Icon name="route" width={18} height={18} /> 1 jalur tersedia
              </span>
            </div>
          </div>
          <ArtworkFrame
            assetKey="subject-mathematics"
            placeholderIcon="math"
            alt="Ilustrasi Matematika"
            ratio="wide"
            variant="violet"
          />
        </section>

        <section className="path-section">
          <header className="path-section__heading">
            <span>Jalur belajar</span>
            <h2>{MATHEMATICS_GRADE_7_PATH.title}</h2>
            <p>{MATHEMATICS_GRADE_7_PATH.description}</p>
          </header>

          <Tactile
            variant="card"
            fullWidth
            className="course-card"
            onClick={() => onNavigate('integers')}
          >
            <span className="course-card__number">01</span>
            <ArtworkFrame
              assetKey={INTEGER_COURSE.artworkKey}
              placeholderIcon="math"
              alt="Ilustrasi Bilangan Bulat"
              variant="violet"
            />
            <span className="course-card__copy">
              <span>Kursus pertama</span>
              <strong>{INTEGER_COURSE.title}</strong>
              <p>{INTEGER_COURSE.description}</p>
              <small>2 modul · Struktur kursus tersedia</small>
            </span>
            <Icon name="arrow" width={21} height={21} />
          </Tactile>
        </section>
      </div>
    </main>
  );
}

export function IntegerCourseScreen({
  percent,
  onNavigate,
  onOpenModule,
}: {
  percent: number;
  onNavigate: (route: RouteName) => void;
  onOpenModule: (module: StudentModuleSummary) => void;
}) {
  return (
    <main className="student-page">
      <div className="student-container student-container--narrow">
        <Breadcrumbs
          items={[
            { label: 'Belajar', onClick: () => onNavigate('learn') },
            { label: 'Matematika', onClick: () => onNavigate('math') },
            { label: 'Bilangan Bulat' },
          ]}
        />

        <section className="course-hero">
          <ArtworkFrame
            assetKey="course-integers"
            placeholderIcon="math"
            alt="Ilustrasi Bilangan Bulat"
            ratio="wide"
            variant="violet"
          />
          <div className="course-hero__copy">
            <span className="page-kicker">Kursus · SMP Kelas VII</span>
            <h1>Bilangan Bulat</h1>
            <p>Membangun pemahaman bilangan positif dan negatif untuk situasi sehari-hari.</p>
            <div className="course-hero__progress">
              <div>
                <span>Progres kursus</span>
                <strong>{percent}%</strong>
              </div>
              <ProgressBar percent={percent} label={`${percent}% kursus Bilangan Bulat selesai`} />
            </div>
          </div>
        </section>

        <section className="module-section">
          <div className="section-title-row section-title-row--large">
            <div>
              <span className="page-kicker">Struktur kursus</span>
              <h2>2 modul fondasi</h2>
            </div>
            <p>
              Pilih modul untuk melihat tujuan dan cakupannya. Tidak ada pelajaran atau soal pada
              batch ini.
            </p>
          </div>
          <div className="module-list">
            {INTEGER_COURSE.modules.map((module, index) => (
              <Tactile
                key={module.id}
                variant="card"
                fullWidth
                className="module-row"
                onClick={() => onOpenModule(module)}
                aria-label={`Lihat ringkasan modul ${module.title}`}
              >
                <span className="module-row__number">{String(index + 1).padStart(2, '0')}</span>
                <ArtworkFrame
                  assetKey={module.artworkKey}
                  placeholderIcon={index === 0 ? 'route' : 'math'}
                  alt={`Ilustrasi ${module.title}`}
                  variant={index === 0 ? 'amber' : 'violet'}
                />
                <span className="module-row__copy">
                  <strong>{module.title}</strong>
                  <small>{module.description}</small>
                </span>
                <span className="module-row__action">
                  Lihat modul <Icon name="chevron" width={18} height={18} />
                </span>
              </Tactile>
            ))}
          </div>
          <p className="deferred-note">
            <Icon name="info" width={18} height={18} /> Pelajaran interaktif akan ditambahkan
            setelah shell dan onboarding disetujui.
          </p>
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
