import { ArtworkFrame } from '../design/ArtworkFrame';
import { Icon, type IconName } from '../design/Icon';
import { Lumo } from '../design/Lumo';
import { Tactile } from '../design/Tactile';
import type {
  DailyMinutes,
  LearnerProfile,
  LearningGoal,
  OnboardingStep,
  StudyDay,
} from '../profile';
import { STUDENT_SUBJECTS } from './catalog';
import type { RouteName } from './routes';
import type { StudentSubjectId } from './types';
import './OnboardingFlow.css';

const STEP_ROUTES: RouteName[] = [
  'onboarding-profile',
  'onboarding-goal',
  'onboarding-subject',
  'onboarding-rhythm',
  'onboarding-plan',
];

const ROUTE_STEP: Partial<Record<RouteName, OnboardingStep>> = {
  welcome: 'welcome',
  'onboarding-profile': 'profile',
  'onboarding-goal': 'goal',
  'onboarding-subject': 'subject',
  'onboarding-rhythm': 'rhythm',
  'onboarding-plan': 'plan',
};

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

const GOALS: { id: LearningGoal; title: string; description: string; icon: IconName }[] = [
  {
    id: 'strengthen-foundations',
    title: 'Menguatkan dasar',
    description: 'Bangun pemahaman dari konsep paling penting, tanpa terburu-buru.',
    icon: 'route',
  },
  {
    id: 'support-school',
    title: 'Mengikuti pelajaran sekolah',
    description: 'Pelajari konsep yang sejalan dengan Matematika Kelas VII.',
    icon: 'book',
  },
  {
    id: 'build-routine',
    title: 'Membangun kebiasaan',
    description: 'Sisihkan waktu singkat dan konsisten untuk terus bertumbuh.',
    icon: 'clock',
  },
];

const DAYS: { id: StudyDay; short: string; label: string }[] = [
  { id: 'monday', short: 'S', label: 'Senin' },
  { id: 'tuesday', short: 'S', label: 'Selasa' },
  { id: 'wednesday', short: 'R', label: 'Rabu' },
  { id: 'thursday', short: 'K', label: 'Kamis' },
  { id: 'friday', short: 'J', label: 'Jumat' },
  { id: 'saturday', short: 'S', label: 'Sabtu' },
  { id: 'sunday', short: 'M', label: 'Minggu' },
];

function previousRoute(route: RouteName): RouteName {
  const index = STEP_ROUTES.indexOf(route);
  return index <= 0 ? 'welcome' : STEP_ROUTES[index - 1]!;
}

export function OnboardingFlow({
  route,
  profile,
  onChange,
  onNavigate,
  onEnterDemo,
  onComplete,
}: {
  route: RouteName;
  profile: LearnerProfile;
  onChange: (patch: Partial<LearnerProfile>) => void;
  onNavigate: (route: RouteName) => void;
  onEnterDemo: () => void;
  onComplete: () => void;
}) {
  const stepIndex = STEP_ROUTES.indexOf(route);
  const go = (next: RouteName) => {
    const onboardingStep = ROUTE_STEP[next];
    if (onboardingStep) onChange({ onboardingStep });
    onNavigate(next);
  };

  if (route === 'welcome') {
    return (
      <main className="onboarding onboarding--welcome">
        <header className="onboarding__header">
          <span className="onboarding__wordmark">Lumera</span>
          <span className="onboarding__header-note">Belajar dengan mencoba, bukan menghafal.</span>
        </header>

        <section className="welcome-layout">
          <div className="welcome-copy">
            <span className="welcome-copy__eyebrow">Untuk SMP Kelas VII</span>
            <h1>Mulai dari yang penting. Pahami sampai masuk akal.</h1>
            <p>
              Lumera menyusun Matematika menjadi jalur yang jelas, singkat, dan mudah diikuti—tanpa membuatmu menebak harus mulai dari mana.
            </p>
            <div className="welcome-copy__actions">
              <Tactile onClick={() => go('onboarding-profile')}>
                Mulai atur rencana
                <Icon name="arrow" width={19} height={19} />
              </Tactile>
              <button type="button" className="onboarding-link" onClick={onEnterDemo}>
                Lihat contoh akun Ardi
              </button>
            </div>
            <small>Butuh sekitar 2 menit. Tidak ada tes penempatan pada tahap ini.</small>
          </div>

          <div className="welcome-lumo" aria-label="Lumo, pemandu Lumera">
            <div className="welcome-lumo__note">Kita susun langkah pertamamu.</div>
            <Lumo size={176} title="Lumo, pemandu Lumera" />
            <div className="welcome-lumo__base">
              <span>01</span>
              <strong>Profil</strong>
              <span>05</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="onboarding">
      <header className="onboarding__header">
        <button type="button" className="onboarding__wordmark" onClick={() => go('welcome')}>
          Lumera
        </button>
        <span className="onboarding__step-label">Langkah {stepIndex + 1} dari 5</span>
      </header>

      <div className="onboarding-progress" aria-label={`Langkah ${stepIndex + 1} dari 5`}>
        {STEP_ROUTES.map((step, index) => (
          <i key={step} data-complete={index <= stepIndex} />
        ))}
      </div>

      <section className="onboarding-panel">
        <button type="button" className="onboarding-back" onClick={() => go(previousRoute(route))}>
          <Icon name="chevron" width={17} height={17} />
          Kembali
        </button>

        {route === 'onboarding-profile' && (
          <ProfileStep profile={profile} onChange={onChange} onContinue={() => go('onboarding-goal')} />
        )}
        {route === 'onboarding-goal' && (
          <GoalStep profile={profile} onChange={onChange} onContinue={() => go('onboarding-subject')} />
        )}
        {route === 'onboarding-subject' && (
          <SubjectStep onContinue={() => go('onboarding-rhythm')} />
        )}
        {route === 'onboarding-rhythm' && (
          <RhythmStep profile={profile} onChange={onChange} onContinue={() => go('onboarding-plan')} />
        )}
        {route === 'onboarding-plan' && <PlanStep profile={profile} onComplete={onComplete} />}
      </section>
    </main>
  );
}

function StepHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="step-heading">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function ProfileStep({
  profile,
  onChange,
  onContinue,
}: {
  profile: LearnerProfile;
  onChange: (patch: Partial<LearnerProfile>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="onboarding-step">
      <StepHeading
        eyebrow="Profil pelajar"
        title="Kami boleh memanggilmu siapa?"
        description="Nama panggilan membantu Lumera membuat rencana terasa lebih personal."
      />

      <label className="profile-field">
        <span>Nama panggilan</span>
        {/*
          Perilaku saat ini dipertahankan apa adanya (patch P1 tidak mengubah UX
          onboarding). Catatan untuk US9: autofocus ke input membuat screen
          reader melewati StepHeading di atasnya — kandidat peninjauan saat
          lintasan keyboard/screen-reader manual V-9 dijalankan.
        */}
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={profile.displayName}
          maxLength={24}
          placeholder="Contoh: Ardi"
          onChange={(event) => onChange({ displayName: event.target.value })}
        />
      </label>

      <fieldset className="grade-options">
        <legend>Jenjang saat ini</legend>
        <div className="grade-options__grid">
          <div className="grade-card grade-card--selected">
            <Icon name="graduation" width={22} height={22} />
            <span><strong>SMP Kelas VII</strong><small>Tersedia sekarang</small></span>
            <Icon name="check" width={20} height={20} />
          </div>
          {['SMP Kelas VIII–IX', 'SMA', 'UTBK / SNBT'].map((label) => (
            <div className="grade-card grade-card--disabled" key={label}>
              <span><strong>{label}</strong><small>Segera hadir</small></span>
              <Icon name="lock" width={17} height={17} />
            </div>
          ))}
        </div>
      </fieldset>

      <Tactile fullWidth disabled={profile.displayName.trim().length < 2} onClick={onContinue}>
        Lanjutkan
        <Icon name="arrow" width={19} height={19} />
      </Tactile>
    </div>
  );
}

function GoalStep({
  profile,
  onChange,
  onContinue,
}: {
  profile: LearnerProfile;
  onChange: (patch: Partial<LearnerProfile>) => void;
  onContinue: () => void;
}) {
  return (
    <div className="onboarding-step">
      <StepHeading
        eyebrow="Tujuan belajar"
        title="Apa yang paling ingin kamu capai?"
        description="Pilih satu tujuan utama. Kamu bisa mengubahnya nanti di Pengaturan."
      />
      <div className="goal-options">
        {GOALS.map((goal) => (
          <Tactile
            key={goal.id}
            variant="card"
            fullWidth
            className="choice-card"
            data-selected={profile.goal === goal.id}
            aria-pressed={profile.goal === goal.id}
            onClick={() => onChange({ goal: goal.id })}
          >
            <span className="choice-card__icon"><Icon name={goal.icon} width={23} height={23} /></span>
            <span className="choice-card__copy"><strong>{goal.title}</strong><small>{goal.description}</small></span>
            <span className="choice-card__check"><Icon name="check" width={18} height={18} /></span>
          </Tactile>
        ))}
      </div>
      <Tactile fullWidth disabled={!profile.goal} onClick={onContinue}>
        Simpan tujuan
        <Icon name="arrow" width={19} height={19} />
      </Tactile>
    </div>
  );
}

function SubjectStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="onboarding-step onboarding-step--wide">
      <StepHeading
        eyebrow="Mata pelajaran"
        title="Mulai dengan Matematika"
        description="Lumera akan berkembang ke delapan mata pelajaran. Untuk Batch 1, hanya Matematika SMP Kelas VII yang benar-benar tersedia."
      />
      <div className="subject-options">
        {STUDENT_SUBJECTS.map((subject) => {
          const available = subject.status === 'available';
          const content = (
            <>
              <ArtworkFrame
                assetKey={subject.artworkKey}
                placeholderIcon={SUBJECT_ICONS[subject.id]}
                alt={`Ilustrasi ${subject.title}`}
                variant={available ? 'violet' : 'plain'}
              />
              <span className="subject-option__copy">
                <strong>{subject.title}</strong>
                <small>{available ? 'SMP Kelas VII' : 'Segera hadir'}</small>
              </span>
              {available && <Icon name="check" width={19} height={19} />}
            </>
          );

          return available ? (
            <div
              key={subject.id}
              className="subject-option subject-option--selected"
              aria-label="Matematika dipilih"
            >
              {content}
            </div>
          ) : (
            <div className="subject-option subject-option--disabled" key={subject.id}>
              {content}
            </div>
          );
        })}
      </div>
      <Tactile fullWidth onClick={onContinue}>
        Gunakan Matematika
        <Icon name="arrow" width={19} height={19} />
      </Tactile>
    </div>
  );
}

function RhythmStep({
  profile,
  onChange,
  onContinue,
}: {
  profile: LearnerProfile;
  onChange: (patch: Partial<LearnerProfile>) => void;
  onContinue: () => void;
}) {
  const toggleDay = (day: StudyDay) => {
    const exists = profile.studyDays.includes(day);
    onChange({
      studyDays: exists ? profile.studyDays.filter((item) => item !== day) : [...profile.studyDays, day],
    });
  };

  return (
    <div className="onboarding-step">
      <StepHeading
        eyebrow="Ritme belajar"
        title="Buat target yang masuk akal"
        description="Rencana yang ringan dan konsisten lebih berguna daripada target besar yang cepat ditinggalkan."
      />

      <fieldset className="rhythm-group">
        <legend>Waktu per hari</legend>
        <div className="minute-options">
          {([10, 15, 20, 30] as DailyMinutes[]).map((minutes) => (
            <Tactile
              key={minutes}
              tone="neutral"
              className="minute-option"
              data-selected={profile.dailyMinutes === minutes}
              aria-pressed={profile.dailyMinutes === minutes}
              onClick={() => onChange({ dailyMinutes: minutes })}
            >
              <strong>{minutes}</strong><span>menit</span>
            </Tactile>
          ))}
        </div>
      </fieldset>

      <fieldset className="rhythm-group">
        <legend>Hari belajar</legend>
        <div className="day-options">
          {DAYS.map((day) => (
            <Tactile
              key={day.id}
              tone="neutral"
              className="day-option"
              data-selected={profile.studyDays.includes(day.id)}
              aria-pressed={profile.studyDays.includes(day.id)}
              aria-label={day.label}
              onClick={() => toggleDay(day.id)}
            >
              {day.short}
            </Tactile>
          ))}
        </div>
      </fieldset>

      <p className="rhythm-note">
        <Icon name="info" width={17} height={17} />
        Target ini hanya menjadi pengingat lokal di perangkatmu.
      </p>

      <Tactile fullWidth disabled={profile.studyDays.length === 0} onClick={onContinue}>
        Susun rencana saya
        <Icon name="arrow" width={19} height={19} />
      </Tactile>
    </div>
  );
}

function PlanStep({ profile, onComplete }: { profile: LearnerProfile; onComplete: () => void }) {
  return (
    <div className="onboarding-step plan-step">
      <div className="plan-step__lumo"><Lumo size={92} title="Lumo" /></div>
      <StepHeading
        eyebrow="Rencana siap"
        title={`${profile.displayName.trim() || 'Kamu'}, langkah pertamamu sudah jelas.`}
        description="Tidak ada tes atau soal sekarang. Kamu akan masuk ke Beranda dan melihat struktur kursus terlebih dahulu."
      />

      <div className="learning-plan">
        <div className="learning-plan__art">
          <ArtworkFrame
            assetKey="course-integers"
            placeholderIcon="math"
            alt="Ilustrasi kursus Bilangan Bulat"
            ratio="wide"
            variant="violet"
          />
        </div>
        <div className="learning-plan__copy">
          <span>Matematika · SMP Kelas VII</span>
          <h2>Bilangan Bulat</h2>
          <p>Mulai dari bilangan di bawah nol, lalu pahami operasi bilangan bulat.</p>
          <div><Icon name="clock" width={16} height={16} /> {profile.dailyMinutes} menit per hari · {profile.studyDays.length} hari per minggu</div>
        </div>
      </div>

      <Tactile fullWidth onClick={onComplete}>
        Masuk ke Lumera
        <Icon name="arrow" width={19} height={19} />
      </Tactile>
    </div>
  );
}
