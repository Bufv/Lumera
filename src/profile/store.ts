/**
 * Profil pembelajar lokal untuk shell Lumera Batch 1.
 *
 * Penyimpanan ini sengaja terpisah dari `lumera.progress.v1`: profil berisi
 * pilihan onboarding dan preferensi UI, sedangkan progres pelajaran tetap
 * dikelola oleh modul progres yang sudah ada.
 */

export const STORAGE_KEY = 'lumera.profile.v1';

/** Naikkan setiap kali bentuk field LearnerProfile berubah tidak-kompatibel-
 * mundur, dan tambahkan penanganannya di `normalizeLearnerProfile` (T034,
 * spec 002 — mengikuti pola SISWA_SCHEMA_VERSION di progress/store.ts). */
export const PROFILE_SCHEMA_VERSION = 1;

export const LEARNING_GOALS = [
  'strengthen-foundations',
  'support-school',
  'build-routine',
] as const;
export type LearningGoal = (typeof LEARNING_GOALS)[number];

export const STUDY_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type StudyDay = (typeof STUDY_DAYS)[number];

export const DAILY_MINUTES = [10, 15, 20, 30] as const;
export type DailyMinutes = (typeof DAILY_MINUTES)[number];

export const ONBOARDING_STEPS = [
  'welcome',
  'profile',
  'goal',
  'subject',
  'rhythm',
  'plan',
  'complete',
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export interface LearnerProfile {
  /** Versi bentuk data ini — lihat PROFILE_SCHEMA_VERSION dan contracts/progress-export-contract.md. */
  schemaVersion: number;
  displayName: string;
  stage: 'smp';
  grade: 7;
  goal: LearningGoal | null;
  focusSubjectId: 'matematika';
  dailyMinutes: DailyMinutes;
  studyDays: StudyDay[];
  onboardingStep: OnboardingStep;
  onboardingComplete: boolean;
  reduceMotion: boolean;
}

const DEFAULT_STUDY_DAYS: StudyDay[] = [];

export function createDefaultLearnerProfile(): LearnerProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    displayName: '',
    stage: 'smp',
    grade: 7,
    goal: null,
    focusSubjectId: 'matematika',
    dailyMinutes: 20,
    studyDays: [...DEFAULT_STUDY_DAYS],
    onboardingStep: 'welcome',
    onboardingComplete: false,
    reduceMotion: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<const T extends readonly unknown[]>(
  options: T,
  value: unknown,
): value is T[number] {
  return options.includes(value);
}

function normalizeStudyDays(value: unknown): StudyDay[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<StudyDay[]>((days, candidate) => {
    if (isOneOf(STUDY_DAYS, candidate) && !days.includes(candidate)) {
      days.push(candidate);
    }
    return days;
  }, []);
}

/**
 * Menyaring data runtime agar data parsial, versi lama, atau hasil manipulasi
 * localStorage tidak dapat membuat UI menerima bentuk profil yang tidak valid.
 */
export function normalizeLearnerProfile(value: unknown): LearnerProfile {
  const defaults = createDefaultLearnerProfile();
  if (!isRecord(value)) return defaults;

  const rawStep = isOneOf(ONBOARDING_STEPS, value.onboardingStep)
    ? value.onboardingStep
    : defaults.onboardingStep;
  const isComplete = value.onboardingComplete === true || rawStep === 'complete';

  return {
    // Field ini sendiri tidak butuh migrasi bertahap: fungsi ini sudah
    // merekonstruksi seluruh bentuk dari nol setiap dipanggil (bukan spread
    // parsial seperti progress/store.ts), jadi outputnya selalu versi saat
    // ini apapun versi input-nya (T034, spec 002).
    schemaVersion: PROFILE_SCHEMA_VERSION,
    displayName: typeof value.displayName === 'string' ? value.displayName : defaults.displayName,
    stage: 'smp',
    grade: 7,
    goal: isOneOf(LEARNING_GOALS, value.goal) ? value.goal : null,
    focusSubjectId: 'matematika',
    dailyMinutes: isOneOf(DAILY_MINUTES, value.dailyMinutes)
      ? value.dailyMinutes
      : defaults.dailyMinutes,
    studyDays: normalizeStudyDays(value.studyDays),
    onboardingStep: isComplete ? 'complete' : rawStep,
    onboardingComplete: isComplete,
    reduceMotion: value.reduceMotion === true,
  };
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window.localStorage;
  } catch {
    // localStorage dapat diblokir oleh mode privasi atau kebijakan browser.
    return null;
  }
}

export function loadLearnerProfile(): LearnerProfile {
  const storage = browserStorage();
  if (!storage) return createDefaultLearnerProfile();

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultLearnerProfile();
    return normalizeLearnerProfile(JSON.parse(raw) as unknown);
  } catch {
    return createDefaultLearnerProfile();
  }
}

export function saveLearnerProfile(profile: LearnerProfile): LearnerProfile {
  const normalized = normalizeLearnerProfile(profile);
  const storage = browserStorage();

  if (storage) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Profil tetap dapat dipakai di memori ketika penyimpanan browser gagal.
    }
  }

  return normalized;
}

type LearnerProfileUpdate =
  Partial<LearnerProfile> | ((current: LearnerProfile) => Partial<LearnerProfile>);

export function updateLearnerProfile(update: LearnerProfileUpdate): LearnerProfile {
  const current = loadLearnerProfile();
  const changes = typeof update === 'function' ? update(current) : update;
  return saveLearnerProfile({ ...current, ...changes });
}

export function resetLearnerProfile(): LearnerProfile {
  const storage = browserStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      // Reset in-memory tetap berhasil meski storage browser sedang diblokir.
    }
  }

  return createDefaultLearnerProfile();
}
