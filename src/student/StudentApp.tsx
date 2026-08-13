import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Icon } from '../design/Icon';
import { Tactile } from '../design/Tactile';
import {
  loadLearnerProfile,
  resetLearnerProfile,
  saveLearnerProfile,
  PROFILE_SCHEMA_VERSION,
  type LearnerProfile,
  type StudyDay,
} from '../profile';
import { PrivacyPolicy } from '../privacy/PrivacyPolicy';
import { hapusSemuaDataSiswa } from '../privacy/deleteAllData';
import { bacaSiswa, type Siswa } from '../progress/store';
import { StorageWarningBanner } from '../storage/StorageWarningBanner';
import { findStudentModule } from './catalog';
import { ARDI_DEMO_FIXTURE, type DemoSavedConcept } from './demo';
import { OnboardingFlow } from './OnboardingFlow';
import {
  hashForCourseView,
  hashForRoute,
  isOnboardingRoute,
  parseStudentHash,
  type CourseView,
  type RouteName,
  type StudentLocation,
} from './routes';
import {
  HomeScreen,
  LearnScreen,
  MathScreen,
  ProgressScreen,
  ReviewScreen,
  SavedScreen,
  SettingsScreen,
} from './StudentScreens';
import { StudentShell } from './StudentShell';
import type { StudentModuleSummary, StudentSearchRecord } from './types';
import './StudentOverlays.css';

// US10 spec 002 (T059, R-009, FR-017): satu-satunya layar yang memakai
// `RiveGameboardNode` (runtime + wasm @rive-app/canvas-lite) — dimuat lazy
// agar runtime Rive tidak lagi bagian dari bundle awal, hanya diunduh saat
// siswa benar-benar membuka kursus Bilangan Bulat.
const IntegerCourseScreen = lazy(() =>
  import('./IntegerCourseScreen').then((m) => ({ default: m.IntegerCourseScreen })),
);

// US6 spec 002 (T030): 'reset-profile' tetap ada untuk alur onboarding-ulang
// yang sudah ada (hanya reset LearnerProfile); 'delete-all-data' adalah aksi
// BARU dan terpisah — menghapus profil + progres + telemetry sekaligus (FR-015).
type ConfirmAction = 'reset-profile' | 'reset-demo' | 'delete-all-data' | null;

const CONFIRM_COPY: Record<
  Exclude<ConfirmAction, null>,
  { title: string; description: string; confirmLabel: string }
> = {
  'reset-profile': {
    title: 'Ulangi onboarding?',
    description:
      'Nama, tujuan, dan ritme belajar lokal akan dihapus. Progres lesson engine tetap dipertahankan.',
    confirmLabel: 'Ya, ulangi onboarding',
  },
  'reset-demo': {
    title: 'Reset data demo?',
    description: 'Mode demo akan kembali ke data ilustratif awal milik Ardi.',
    confirmLabel: 'Reset data demo',
  },
  'delete-all-data': {
    title: 'Hapus semua data saya?',
    description:
      'Profil, progres (Lumens/streak/mastery), dan seluruh catatan aktivitas belajar akan dihapus permanen dari perangkat ini. Tindakan ini TIDAK dapat dibatalkan kecuali kamu sudah mengekspor progresmu.',
    confirmLabel: 'Ya, hapus semua data saya',
  },
};

const DEMO_DAYS: StudyDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

function demoProfile(): LearnerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    displayName: ARDI_DEMO_FIXTURE.profile.displayName,
    stage: 'smp',
    grade: 7,
    goal: ARDI_DEMO_FIXTURE.profile.goal,
    focusSubjectId: 'matematika',
    dailyMinutes: 20,
    studyDays: [...DEMO_DAYS],
    onboardingStep: 'complete',
    onboardingComplete: true,
    reduceMotion: false,
  };
}

export function StudentApp() {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadLearnerProfile());
  const [location, setLocation] = useState<StudentLocation>(() =>
    parseStudentHash(window.location.hash, loadLearnerProfile().onboardingComplete),
  );
  const [selectedModule, setSelectedModule] = useState<StudentModuleSummary | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<DemoSavedConcept | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  // US7 spec 002 (T038): progres nyata, dibutuhkan SettingsScreen untuk cek
  // staleness saat impor (contracts/progress-export-contract.md aturan 4) dan
  // diperbarui setelah impor/hapus-semua-data berhasil.
  const [siswa, setSiswa] = useState<Siswa>(() => bacaSiswa());
  const demoData = location.demo ? ARDI_DEMO_FIXTURE : null;
  const visibleProfile = useMemo(
    () => (location.demo ? demoProfile() : profile),
    [location.demo, profile],
  );
  const moduleProgress = useMemo(
    () =>
      Object.fromEntries(
        (demoData?.moduleProgress ?? []).map((item) => [item.moduleId, item.percent]),
      ),
    [demoData],
  );

  useEffect(() => {
    if (!window.location.hash) {
      window.location.replace(hashForRoute(profile.onboardingComplete ? 'home' : 'welcome'));
    }
    const onHashChange = () => {
      setLocation(parseStudentHash(window.location.hash, profile.onboardingComplete));
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [profile.onboardingComplete]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = visibleProfile.reduceMotion ? 'true' : 'false';
    return () => {
      delete document.documentElement.dataset.reduceMotion;
    };
  }, [visibleProfile.reduceMotion]);

  useEffect(() => {
    if (!location.demo && !profile.onboardingComplete && !isOnboardingRoute(location.route)) {
      window.location.replace(hashForRoute('welcome'));
    }
  }, [location, profile.onboardingComplete]);

  useEffect(() => {
    setSelectedModule(null);
    setSelectedConcept(null);
    setConfirmAction(null);
  }, [location.route, location.demo]);

  const navigate = (route: RouteName, demo = location.demo) => {
    const nextCourseView = route === 'integers' ? location.courseView : 'roadmap';
    const nextHash = hashForRoute(route, demo, nextCourseView);
    setSelectedModule(null);
    setSelectedConcept(null);
    if (window.location.hash === nextHash) {
      setLocation({ route, demo, courseView: nextCourseView });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } else {
      window.location.hash = nextHash;
    }
  };

  const changeCourseView = (courseView: CourseView) => {
    const nextHash = hashForCourseView(courseView, location.demo);
    setSelectedModule(null);
    if (window.location.hash === nextHash) {
      setLocation({ route: 'integers', demo: location.demo, courseView });
    } else {
      window.location.hash = nextHash;
    }
  };

  const updateProfile = (patch: Partial<LearnerProfile>) => {
    setProfile((current) => saveLearnerProfile({ ...current, ...patch }));
  };

  const completeOnboarding = () => {
    const completed = saveLearnerProfile({
      ...profile,
      displayName: profile.displayName.trim(),
      onboardingStep: 'complete',
      onboardingComplete: true,
    });
    setProfile(completed);
    navigate('home', false);
  };

  const exitDemo = () => navigate(profile.onboardingComplete ? 'home' : 'welcome', false);

  const handleSearchSelect = (record: StudentSearchRecord) => {
    if (!record.href || record.status === 'comingSoon') return;
    const destination = parseStudentHash(record.href, true);
    navigate(destination.route);
    if (record.kind === 'module') {
      const module = findStudentModule(record.entityId);
      if (module) window.setTimeout(() => setSelectedModule(module), 0);
    }
  };

  const confirmReset = () => {
    if (confirmAction === 'reset-profile') {
      const fresh = resetLearnerProfile();
      setProfile(fresh);
      setConfirmAction(null);
      navigate('welcome', false);
      return;
    }
    if (confirmAction === 'reset-demo') {
      setConfirmAction(null);
      setSelectedConcept(null);
      setSelectedModule(null);
      navigate('home', true);
      return;
    }
    if (confirmAction === 'delete-all-data') {
      // US6 spec 002 (T030, FR-015): berbeda dari 'reset-profile' — ini juga
      // menghapus progres (Siswa) dan telemetry, bukan hanya LearnerProfile.
      void hapusSemuaDataSiswa().then((fresh) => {
        setProfile(fresh);
        setSiswa(bacaSiswa());
        setConfirmAction(null);
        navigate('welcome', false);
      });
    }
  };

  if (isOnboardingRoute(location.route)) {
    return (
      <OnboardingFlow
        route={location.route}
        profile={profile}
        onChange={updateProfile}
        onNavigate={(route) => navigate(route, false)}
        onEnterDemo={() => navigate('home', true)}
        onComplete={completeOnboarding}
      />
    );
  }

  const content = (() => {
    switch (location.route) {
      case 'learn':
        return (
          <LearnScreen
            onNavigate={navigate}
            progressPercent={demoData?.courseProgress.percent ?? 0}
          />
        );
      case 'math':
        return (
          <MathScreen
            onNavigate={navigate}
            progressPercent={demoData?.courseProgress.percent ?? 0}
          />
        );
      case 'integers':
        return (
          <Suspense fallback={null}>
            <IntegerCourseScreen
              percent={demoData?.courseProgress.percent ?? 0}
              moduleProgress={moduleProgress}
              view={location.courseView}
              onChangeView={changeCourseView}
              onNavigate={navigate}
              onOpenModule={setSelectedModule}
            />
          </Suspense>
        );
      case 'review':
        return <ReviewScreen demoData={demoData} onNavigate={navigate} />;
      case 'saved':
        return (
          <SavedScreen
            demoData={demoData}
            onNavigate={navigate}
            onOpenConcept={setSelectedConcept}
          />
        );
      case 'progress':
        return <ProgressScreen profile={profile} demoData={demoData} onNavigate={navigate} />;
      case 'settings':
        return (
          <SettingsScreen
            profile={visibleProfile}
            siswa={siswa}
            demo={location.demo}
            onSave={(next) => setProfile(saveLearnerProfile(next))}
            onExitDemo={exitDemo}
            onRequestResetProfile={() => setConfirmAction('reset-profile')}
            onRequestResetDemo={() => setConfirmAction('reset-demo')}
            onRequestDeleteAllData={() => setConfirmAction('delete-all-data')}
            onOpenPrivacy={() => navigate('privacy', location.demo)}
            onImportApplied={({ siswa: siswaBaru, learnerProfile }) => {
              setSiswa(siswaBaru);
              setProfile(learnerProfile);
            }}
          />
        );
      case 'privacy':
        return <PrivacyPolicy onKembali={() => navigate('settings', location.demo)} />;
      case 'home':
      default:
        return <HomeScreen profile={profile} demoData={demoData} onNavigate={navigate} />;
    }
  })();

  return (
    <StudentShell
      route={location.route}
      displayName={visibleProfile.displayName || 'Pelajar Lumera'}
      streakDays={demoData?.streakDays ?? 0}
      demo={location.demo}
      onNavigate={navigate}
      onExitDemo={exitDemo}
      onSearchSelect={handleSearchSelect}
    >
      <StorageWarningBanner />
      {content}

      {selectedModule && (
        <InfoDrawer
          title={selectedModule.title}
          eyebrow="Ringkasan modul"
          onClose={() => setSelectedModule(null)}
        >
          <p>{selectedModule.description}</p>
          <h3>Yang akan dipahami</h3>
          <ul>
            {selectedModule.outcomes.map((outcome) => (
              <li key={outcome}>
                <Icon name="check" width={17} height={17} />
                {outcome}
              </li>
            ))}
          </ul>
          <div className="drawer-note">
            <Icon name="info" width={18} height={18} /> Pelajaran interaktif untuk modul ini hadir
            pada batch berikutnya.
          </div>
        </InfoDrawer>
      )}

      {selectedConcept && (
        <InfoDrawer
          title={selectedConcept.title}
          eyebrow="Konsep tersimpan"
          onClose={() => setSelectedConcept(null)}
        >
          <p>{selectedConcept.summary}</p>
          <dl className="concept-meta">
            <div>
              <dt>Kursus</dt>
              <dd>Bilangan Bulat</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Data ilustratif</dd>
            </div>
          </dl>
        </InfoDrawer>
      )}

      {confirmAction && (
        <ConfirmDialog
          title={CONFIRM_COPY[confirmAction].title}
          description={CONFIRM_COPY[confirmAction].description}
          confirmLabel={CONFIRM_COPY[confirmAction].confirmLabel}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmReset}
        />
      )}
    </StudentShell>
  );
}

function InfoDrawer({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="student-overlay" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
      <button
        type="button"
        className="student-overlay__backdrop"
        onClick={onClose}
        aria-label="Tutup ringkasan"
      />
      <aside className="info-drawer">
        <header>
          <div>
            <span>{eyebrow}</span>
            <h2 id="drawer-title">{title}</h2>
          </div>
          {/* US9 spec 002 (T051, FR-021): pola dialog modal WAI-ARIA standar —
              fokus MUST berpindah ke dalam dialog saat terbuka, tombol tutup
              adalah target yang aman/dapat diprediksi. */}
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <button type="button" onClick={onClose} aria-label="Tutup" autoFocus>
            <Icon name="close" width={20} height={20} />
          </button>
        </header>
        <div className="info-drawer__content">{children}</div>
      </aside>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="student-overlay student-overlay--center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
    >
      <button
        type="button"
        className="student-overlay__backdrop"
        onClick={onCancel}
        aria-label="Batal"
      />
      <section className="confirm-dialog">
        <span className="confirm-dialog__icon">
          <Icon name="info" width={24} height={24} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div>
          <button type="button" className="confirm-dialog__cancel" onClick={onCancel}>
            Batal
          </button>
          <Tactile onClick={onConfirm}>{confirmLabel}</Tactile>
        </div>
      </section>
    </div>
  );
}
