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
            <button type="button" onClick={item.onClick}>{item.label}</button>
          ) : (
            <strong>{item.label}</strong>
          )}
        </span>
      ))}
    </nav>
  );
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
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
    <div className="student-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe}>
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
  const dayCount = demoData?.profile.studyDays.length ?? profile.studyDays.length;

  return (
    <main className="student-page home-page">
      <div className="student-container">
        <header className="home-intro">
          <div>
            <span className="page-kicker">Beranda</span>
            <h1>Selamat datang, {displayName}.</h1>
            <p>Satu jalur yang jelas lebih baik daripada banyak pilihan yang membingungkan.</p>
          </div>
          <span className="home-intro__grade">SMP Kelas VII</span>
        </header>

        <div className="home-grid">
          <Tactile
            variant="card"
            fullWidth
            className="continue-card"
            onClick={() => onNavigate('integers')}
            aria-label="Buka rencana Bilangan Bulat"
          >
            <ArtworkFrame
              assetKey="course-integers"
              placeholderIcon="math"
              alt="Ilustrasi Bilangan Bulat"
              ratio="wide"
              variant="violet"
            />
            <span className="continue-card__body">
              <span className="continue-card__eyebrow">Rencana belajarmu</span>
              <strong>Bilangan Bulat</strong>
              <span className="continue-card__module">Mulai dari Bilangan di Bawah Nol</span>
              <span className="continue-card__progress-row">
                <ProgressBar percent={percent} label={`${percent}% kursus selesai`} />
                <b>{percent}%</b>
              </span>
            </span>
            <span className="continue-card__action">
              {percent > 0 ? 'Lihat progres' : 'Lihat rencana'}
              <Icon name="arrow" width={19} height={19} />
            </span>
          </Tactile>

          <aside className="home-aside">
            <section className="goal-summary">
              <div className="section-title-row">
                <h2>Target mingguan</h2>
                <Icon name="target" width={19} height={19} />
              </div>
              <div className="goal-summary__numbers">
                <span><strong>{minutes}</strong><small>menit / hari</small></span>
                <span><strong>{dayCount}</strong><small>hari dipilih</small></span>
              </div>
              <p>{dayCount > 0 ? 'Ritmemu sudah tersusun dan bisa diubah kapan saja.' : 'Pilih hari belajar di Pengaturan.'}</p>
            </section>

            <section className="lumo-note">
              <Lumo size={58} title="Lumo" />
              <div>
                <strong>{percent > 0 ? 'Lanjut dari pemahamanmu.' : 'Mulai dengan melihat strukturnya.'}</strong>
                <p>{percent > 0 ? 'Dua konsep siap kamu tinjau, tanpa harus memulai soal sekarang.' : 'Kenali modulnya dulu. Pelajaran interaktif menyusul di batch berikutnya.'}</p>
              </div>
            </section>
          </aside>
        </div>

        <section className="home-sections">
          <div className="section-title-row section-title-row--large">
            <div><span className="page-kicker">Ringkasan</span><h2>Ruang belajarmu</h2></div>
          </div>
          <div className="home-summary-grid">
            <Tactile variant="card" fullWidth className="summary-action" onClick={() => onNavigate('math')}>
              <span className="summary-action__icon"><Icon name="route" width={22} height={22} /></span>
              <span><strong>Jalur Matematika</strong><small>1 kursus tersedia untuk Kelas VII</small></span>
              <Icon name="chevron" width={18} height={18} />
            </Tactile>
            <Tactile variant="card" fullWidth className="summary-action" onClick={() => onNavigate('review')}>
              <span className="summary-action__icon"><Icon name="clock" width={22} height={22} /></span>
              <span><strong>Ulangi</strong><small>{reviewCount > 0 ? `${reviewCount} konsep siap disegarkan` : 'Belum ada konsep untuk diulangi'}</small></span>
              <Icon name="chevron" width={18} height={18} />
            </Tactile>
            <Tactile variant="card" fullWidth className="summary-action" onClick={() => onNavigate('saved')}>
              <span className="summary-action__icon"><Icon name="bookmark" width={22} height={22} /></span>
              <span><strong>Simpanan</strong><small>{savedCount > 0 ? `${savedCount} konsep tersimpan` : 'Belum ada konsep tersimpan'}</small></span>
              <Icon name="chevron" width={18} height={18} />
            </Tactile>
          </div>
        </section>
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
          <Tactile variant="card" fullWidth className="featured-subject" onClick={() => onNavigate('math')}>
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
              <span className="featured-subject__meta"><Icon name="route" width={17} height={17} /> 1 jalur · 1 kursus · 2 modul</span>
            </span>
            <span className="featured-subject__action">Jelajahi <Icon name="arrow" width={19} height={19} /></span>
          </Tactile>
        </section>

        <section className="future-catalog">
          <div className="section-title-row section-title-row--large">
            <div><span className="page-kicker">Berikutnya</span><h2>Mata pelajaran lain</h2></div>
            <p>Ditampilkan sekarang agar arah kurikulum Lumera tetap jelas.</p>
          </div>
          <div className="subject-grid">
            {STUDENT_SUBJECTS.filter((subject) => subject.status === 'comingSoon').map((subject) => (
              <article className="future-subject" key={subject.id}>
                <ArtworkFrame
                  assetKey={subject.artworkKey}
                  placeholderIcon={SUBJECT_ICONS[subject.id]}
                  alt={`Ilustrasi ${subject.title}`}
                />
                <div><strong>{subject.title}</strong><p>{subject.description}</p></div>
                <span className="catalog-status">Segera hadir</span>
              </article>
            ))}
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
        <Breadcrumbs items={[{ label: 'Belajar', onClick: () => onNavigate('learn') }, { label: 'Matematika' }]} />

        <section className="subject-hero">
          <div className="subject-hero__copy">
            <span className="page-kicker">Mata pelajaran</span>
            <h1>Matematika</h1>
            <p>Memahami pola, bilangan, dan pemecahan masalah secara bertahap—dimulai dari fondasi Kelas VII.</p>
            <div className="subject-hero__facts">
              <span><Icon name="graduation" width={18} height={18} /> SMP Kelas VII</span>
              <span><Icon name="route" width={18} height={18} /> 1 jalur tersedia</span>
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

          <Tactile variant="card" fullWidth className="course-card" onClick={() => onNavigate('integers')}>
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
        <Breadcrumbs items={[
          { label: 'Belajar', onClick: () => onNavigate('learn') },
          { label: 'Matematika', onClick: () => onNavigate('math') },
          { label: 'Bilangan Bulat' },
        ]} />

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
              <div><span>Progres kursus</span><strong>{percent}%</strong></div>
              <ProgressBar percent={percent} label={`${percent}% kursus Bilangan Bulat selesai`} />
            </div>
          </div>
        </section>

        <section className="module-section">
          <div className="section-title-row section-title-row--large">
            <div><span className="page-kicker">Struktur kursus</span><h2>2 modul fondasi</h2></div>
            <p>Pilih modul untuk melihat tujuan dan cakupannya. Tidak ada pelajaran atau soal pada batch ini.</p>
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
                <span className="module-row__copy"><strong>{module.title}</strong><small>{module.description}</small></span>
                <span className="module-row__action">Lihat modul <Icon name="chevron" width={18} height={18} /></span>
              </Tactile>
            ))}
          </div>
          <p className="deferred-note"><Icon name="info" width={18} height={18} /> Pelajaran interaktif akan ditambahkan setelah shell dan onboarding disetujui.</p>
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
        <PageHeading eyebrow="Ulangi" title="Segarkan konsep pada waktunya." description="Nanti, Lumera akan menyarankan konsep berdasarkan riwayat belajar. Batch ini hanya memperlihatkan keadaan dan struktur ruang Ulangi." />
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
            <header><span>{concepts.length} konsep</span><strong>Siap disegarkan</strong></header>
            {concepts.map((concept) => (
              <article key={concept.id}>
                <span className="quiet-list__icon"><Icon name="clock" width={20} height={20} /></span>
                <div><strong>{concept.title}</strong><p>{concept.reason}</p></div>
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
        <PageHeading eyebrow="Simpanan" title="Pengetahuan yang mudah ditemukan lagi." description="Simpanan akan menjadi tempat ringkasan konsep penting, bukan tumpukan bookmark tanpa konteks." />
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
            <header><span>{concepts.length} konsep</span><strong>Baru disimpan</strong></header>
            {concepts.map((concept) => (
              <Tactile key={concept.id} variant="card" fullWidth className="saved-row" onClick={() => onOpenConcept(concept)}>
                <span className="saved-row__icon"><Icon name="bookmark" width={20} height={20} /></span>
                <span><strong>{concept.title}</strong><small>Bilangan Bulat</small></span>
                <span>Lihat ringkasan <Icon name="chevron" width={17} height={17} /></span>
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
      <ArtworkFrame assetKey={`empty-${icon}`} placeholderIcon={icon} alt="" decorative variant="amber" />
      <h2>{title}</h2>
      <p>{description}</p>
      <Tactile tone="neutral" onClick={onAction}>{action}<Icon name="arrow" width={18} height={18} /></Tactile>
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
          <div><span className="page-kicker">Progres dan profil</span><h1>{displayName}</h1><p>SMP Kelas VII · Matematika</p></div>
          <button type="button" className="text-action" onClick={() => onNavigate('settings')}>Ubah pengaturan</button>
        </div>

        <section className="progress-overview">
          <div className="progress-overview__main">
            <span>Matematika · Bilangan Bulat</span>
            <div><strong>{percent}%</strong><small>progres kursus</small></div>
            <ProgressBar percent={percent} label={`${percent}% kursus selesai`} />
            <p>{percent > 0 ? 'Progres ilustratif hanya berasal dari Matematika.' : 'Progres akan mulai terisi setelah pelajaran interaktif tersedia.'}</p>
          </div>
          <dl>
            <div><dt>Target harian</dt><dd>{minutes} menit</dd></div>
            <div><dt>Hari belajar</dt><dd>{dayCount} hari</dd></div>
            <div><dt>Streak</dt><dd>{streak} hari</dd></div>
          </dl>
        </section>

        <section className="availability-note">
          <Icon name="info" width={20} height={20} />
          <div><strong>Hanya progres nyata yang ditampilkan.</strong><p>IPA, Informatika, dan mata pelajaran lain tidak diberi persentase sebelum kontennya tersedia.</p></div>
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
    patch({ studyDays: draft.studyDays.includes(day) ? draft.studyDays.filter((item) => item !== day) : [...draft.studyDays, day] });
  };

  return (
    <main className="student-page settings-page">
      <div className="student-container student-container--reading">
        <PageHeading eyebrow="Pengaturan" title="Atur Lumera sesuai ritmemu." description="Semua pilihan pada halaman ini disimpan lokal di perangkat ini." />

        {demo && (
          <section className="demo-settings-note">
            <Icon name="info" width={20} height={20} />
            <div><strong>Mode demo tidak mengubah profil utama.</strong><p>Keluar dari demo untuk menyimpan pengaturan milikmu.</p></div>
            <button type="button" onClick={onExitDemo}>Keluar dari demo</button>
          </section>
        )}

        <form className="settings-form" onSubmit={(event) => { event.preventDefault(); if (!demo) { onSave(draft); setSaved(true); } }}>
          <section>
            <header><span>01</span><div><h2>Profil pelajar</h2><p>Identitas lokal yang tampil di Beranda.</p></div></header>
            <label><span>Nama panggilan</span><input disabled={demo} value={draft.displayName} maxLength={24} onChange={(event) => patch({ displayName: event.target.value })} /></label>
            <label><span>Jenjang</span><input disabled value="SMP Kelas VII" /></label>
          </section>

          <section>
            <header><span>02</span><div><h2>Tujuan belajar</h2><p>Tentukan arah utama untuk rekomendasi berikutnya.</p></div></header>
            <label><span>Tujuan utama</span><select disabled={demo} value={draft.goal ?? ''} onChange={(event) => patch({ goal: event.target.value as LearningGoal })}><option value="" disabled>Pilih tujuan</option>{Object.entries(GOAL_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </section>

          <section>
            <header><span>03</span><div><h2>Ritme belajar</h2><p>Target sederhana yang bisa dipertahankan.</p></div></header>
            <label><span>Waktu per hari</span><select disabled={demo} value={draft.dailyMinutes} onChange={(event) => patch({ dailyMinutes: Number(event.target.value) as LearnerProfile['dailyMinutes'] })}>{[10, 15, 20, 30].map((value) => <option key={value} value={value}>{value} menit</option>)}</select></label>
            <fieldset disabled={demo}><legend>Hari belajar</legend><div className="settings-days">{(Object.keys(DAY_LABELS) as StudyDay[]).map((day) => <button type="button" key={day} data-selected={draft.studyDays.includes(day)} aria-pressed={draft.studyDays.includes(day)} onClick={() => toggleDay(day)}>{DAY_LABELS[day]}</button>)}</div></fieldset>
          </section>

          <section>
            <header><span>04</span><div><h2>Aksesibilitas</h2><p>Kurangi gerakan tanpa menghilangkan kejelasan status.</p></div></header>
            <label className="toggle-row"><span><strong>Kurangi animasi</strong><small>Menonaktifkan gerakan hover dan tekan.</small></span><input type="checkbox" disabled={demo} checked={draft.reduceMotion} onChange={(event) => patch({ reduceMotion: event.target.checked })} /></label>
          </section>

          <div className="settings-save">
            <Tactile type="submit" disabled={demo || draft.displayName.trim().length < 2 || draft.studyDays.length === 0}>Simpan perubahan</Tactile>
            {saved && <span role="status"><Icon name="check" width={17} height={17} /> Perubahan tersimpan</span>}
          </div>
        </form>

        <section className="danger-zone">
          <div><h2>Atur ulang data lokal</h2><p>Tindakan ini tidak bisa dibatalkan dari perangkat ini.</p></div>
          {demo ? <button type="button" onClick={onRequestResetDemo}>Reset data demo</button> : <button type="button" onClick={onRequestResetProfile}>Ulangi onboarding</button>}
        </section>
      </div>
    </main>
  );
}
