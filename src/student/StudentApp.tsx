import { useEffect, useMemo, useState } from 'react';
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
import { selesaikanPelajaran } from '../progress/award';
import { bacaProgresDemo, resetProgresDemo, selesaikanPelajaranDemo } from '../progress/demoStore';
import { MicroLessonPlayer, type MicroLessonCompletion } from '../microlearning';
import { ARDI_DEMO_FIXTURE, type DemoSavedConcept } from './demo';
import { OnboardingFlow } from './OnboardingFlow';
import {
  hashForCourse,
  hashForCourseView,
  hashForLesson,
  hashForRoute,
  isOnboardingRoute,
  parseStudentHash,
  type CourseView,
  type RouteName,
  type StudentLocation,
} from './routes';
import { IntegerCourseScreen } from './IntegerCourseScreen';
import { LearningPathsScreen } from './LearningPathsScreen';
import { CourseRoadmapScreen } from './CourseRoadmapScreen';
import {
  ACTIVE_LEARNING_COURSES,
  deriveLessonAvailability,
  findLearningCourse,
  findLessonNode,
  getCourseProgress,
  type LearningCourse,
  type LessonNode,
} from './learningCatalog';
import {
  HomeScreen,
  ProgressScreen,
  ReviewScreen,
  SavedScreen,
  SettingsScreen,
} from './StudentScreens';
import { StudentShell } from './StudentShell';
import type { StudentModuleSummary, StudentSearchRecord } from './types';
import './StudentOverlays.css';

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

const LESSON_RETURN_HASH_STATE_KEY = 'lumeraLessonReturnHash';

function currentHistoryState(): Record<string, unknown> {
  return typeof window.history.state === 'object' && window.history.state !== null
    ? { ...(window.history.state as Record<string, unknown>) }
    : {};
}

function rememberLessonReturnHash(returnHash: string): void {
  window.history.replaceState(
    { ...currentHistoryState(), [LESSON_RETURN_HASH_STATE_KEY]: returnHash },
    '',
    window.location.href,
  );
}

function validLessonReturnHash(courseSlug: string, demo: boolean): string | null {
  const candidate = currentHistoryState()[LESSON_RETURN_HASH_STATE_KEY];
  if (typeof candidate !== 'string' || !candidate.startsWith('#/')) return null;
  const destination = parseStudentHash(candidate, true);
  return destination.route === 'course' &&
    destination.courseSlug === courseSlug &&
    destination.demo === demo
    ? candidate
    : null;
}

function replaceCurrentStudentHash(nextHash: string): void {
  const nextState = currentHistoryState();
  delete nextState[LESSON_RETURN_HASH_STATE_KEY];
  window.history.replaceState(nextState, '', nextHash);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

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
  const [demoSiswa, setDemoSiswa] = useState<Siswa | null>(() =>
    location.demo ? bacaProgresDemo() : null,
  );
  const [focusLessonId, setFocusLessonId] = useState<string | undefined>();
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
  const learningProgress = location.demo ? demoSiswa : siswa;
  const completedLearningModuleIds = useMemo(
    () => learningProgress?.modulSelesai ?? [],
    [learningProgress?.modulSelesai],
  );
  const progressByCourse = useMemo(
    () =>
      Object.fromEntries(
        ACTIVE_LEARNING_COURSES.map((course) => [
          course.slug,
          getCourseProgress(course, completedLearningModuleIds).percent,
        ]),
      ),
    [completedLearningModuleIds],
  );

  useEffect(() => {
    if (location.demo && !demoSiswa) setDemoSiswa(bacaProgresDemo());
  }, [demoSiswa, location.demo]);

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
    if (route === 'course' || route === 'lesson') return;
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

  const openCourse = (courseSlug: string) => {
    setFocusLessonId(undefined);
    window.location.hash = hashForCourse(courseSlug, location.demo);
  };

  const openLesson = (lesson: LessonNode, course: LearningCourse) => {
    if (!lesson.moduleId) return;
    const returnHash = window.location.hash;
    const returnLocation = parseStudentHash(returnHash, true);
    window.location.hash = hashForLesson(course.slug, lesson.slug, location.demo);
    if (
      returnLocation.route === 'course' &&
      returnLocation.courseSlug === course.slug &&
      returnLocation.demo === location.demo
    ) {
      rememberLessonReturnHash(returnHash);
    }
  };

  const changeCourseView = (courseView: CourseView) => {
    const courseSlug = location.courseSlug ?? 'bilangan-bulat';
    const nextHash = hashForCourseView(courseView, location.demo, courseSlug);
    setSelectedModule(null);
    if (window.location.hash === nextHash) {
      setLocation(
        courseSlug === 'bilangan-bulat'
          ? { route: 'integers', demo: location.demo, courseView }
          : { route: 'course', demo: location.demo, courseView, courseSlug },
      );
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
    if (destination.route === 'course' && destination.courseSlug) {
      openCourse(destination.courseSlug);
      return;
    }
    if (destination.route === 'lesson' && destination.courseSlug && destination.lessonSlug) {
      window.location.hash = hashForLesson(
        destination.courseSlug,
        destination.lessonSlug,
        location.demo,
      );
      return;
    }
    navigate(destination.route, location.demo);
  };

  const completeMicroLesson = (payload: MicroLessonCompletion) => {
    const course = ACTIVE_LEARNING_COURSES.find((candidate) =>
      candidate.levels.some((level) =>
        level.lessons.some((lesson) => lesson.moduleId === payload.lessonId),
      ),
    );
    if (!course) return;

    const result = location.demo
      ? selesaikanPelajaranDemo(payload.lessonId, payload.mistakes)
      : selesaikanPelajaran(payload.lessonId, payload.mistakes);
    if (location.demo) setDemoSiswa(result.siswa);
    else setSiswa(result.siswa);

    const registeredLessons = course.levels.flatMap((level) =>
      level.lessons.filter((lesson): lesson is LessonNode & { moduleId: string } =>
        Boolean(lesson.moduleId),
      ),
    );
    const completedIndex = registeredLessons.findIndex(
      (lesson) => lesson.moduleId === payload.lessonId,
    );
    setFocusLessonId(registeredLessons[completedIndex + 1]?.id);
    replaceCurrentStudentHash(hashForCourse(course.slug, location.demo));
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
      resetProgresDemo();
      setDemoSiswa(bacaProgresDemo());
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

  const routedCourse = location.courseSlug ? findLearningCourse(location.courseSlug) : null;
  const routedLesson =
    routedCourse && location.lessonSlug
      ? findLessonNode(routedCourse.slug, location.lessonSlug)
      : null;
  const previewPendingReview = location.demo || import.meta.env.DEV;
  const routedLessonState =
    routedLesson && routedCourse
      ? deriveLessonAvailability(
          routedLesson,
          new Set(completedLearningModuleIds),
          previewPendingReview,
        ).availability
      : null;
  const routedLessonCanOpen =
    routedLessonState === 'available' ||
    routedLessonState === 'inProgress' ||
    routedLessonState === 'completed';

  if (
    location.route === 'lesson' &&
    routedCourse?.status === 'available' &&
    routedLesson?.moduleId &&
    routedLessonCanOpen
  ) {
    return (
      <MicroLessonPlayer
        lessonId={routedLesson.moduleId}
        lumens={learningProgress?.lumens ?? 0}
        reducedMotion={visibleProfile.reduceMotion}
        onExit={() => {
          setFocusLessonId(routedLesson.id);
          if (validLessonReturnHash(routedCourse.slug, location.demo)) {
            window.history.back();
            return;
          }
          replaceCurrentStudentHash(hashForCourse(routedCourse.slug, location.demo));
        }}
        onComplete={completeMicroLesson}
      />
    );
  }

  const content = (() => {
    switch (location.route) {
      case 'learn':
      case 'math':
        return (
          <LearningPathsScreen
            onOpenCourse={openCourse}
            progressByCourse={progressByCourse}
            demo={location.demo}
          />
        );
      case 'course':
      case 'lesson':
        return routedCourse?.status === 'available' ? (
          <CourseRoadmapScreen
            course={routedCourse}
            completedModuleIds={completedLearningModuleIds}
            demo={previewPendingReview}
            view={location.courseView}
            focusLessonId={location.route === 'lesson' ? routedLesson?.id : focusLessonId}
            onBack={() => navigate('learn')}
            onChangeView={changeCourseView}
            onOpenLesson={openLesson}
          />
        ) : (
          <LearningPathsScreen
            onOpenCourse={openCourse}
            progressByCourse={progressByCourse}
            demo={location.demo}
          />
        );
      case 'integers':
        return (
          <IntegerCourseScreen
            percent={demoData?.courseProgress.percent ?? 0}
            moduleProgress={moduleProgress}
            view={location.courseView}
            onChangeView={changeCourseView}
            onNavigate={navigate}
            onOpenModule={setSelectedModule}
          />
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
          {/*
            Fokus MUST berpindah ke dalam dialog saat dibuka — tanpa ini pengguna
            keyboard/screen reader tetap tertinggal di belakang backdrop. Ini
            justru pemenuhan WCAG 2.4.3, bukan pelanggaran no-autofocus.
          */}
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
