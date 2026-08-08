import type { StudentSubjectId } from './types';

export type DemoLearningGoal = 'strengthen-foundations' | 'support-school' | 'build-routine';

export type IndonesianStudyDay =
  'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export interface DemoStudentProfile {
  displayName: string;
  stage: 'smp';
  grade: 7;
  goal: DemoLearningGoal;
  focusSubjectId: StudentSubjectId;
  dailyMinutes: 20;
  studyDays: readonly IndonesianStudyDay[];
  onboardingStep: 6;
  onboardingComplete: true;
  reduceMotion: false;
}

export interface DemoSavedConcept {
  id: string;
  moduleId: string;
  title: string;
  summary: string;
  savedAt: string;
}

export interface DemoReviewConcept {
  id: string;
  moduleId: string;
  title: string;
  reason: string;
}

export interface DemoModuleProgress {
  moduleId: string;
  percent: number;
}

export interface ArdiDemoFixture {
  mode: 'demo';
  disclosure: 'Mode demo · Data ilustratif';
  referenceDate: '2026-08-08';
  profile: DemoStudentProfile;
  streakDays: 7;
  courseProgress: {
    courseId: 'bilangan-bulat';
    percent: 45;
  };
  moduleProgress: readonly DemoModuleProgress[];
  savedConcepts: readonly DemoSavedConcept[];
  reviewConcepts: readonly DemoReviewConcept[];
}

/** Returns a fresh copy so resetting demo state never mutates the canonical fixture. */
export function createArdiDemoFixture(): ArdiDemoFixture {
  return {
    mode: 'demo',
    disclosure: 'Mode demo · Data ilustratif',
    referenceDate: '2026-08-08',
    profile: {
      displayName: 'Ardi',
      stage: 'smp',
      grade: 7,
      goal: 'support-school',
      focusSubjectId: 'matematika',
      dailyMinutes: 20,
      studyDays: ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'],
      onboardingStep: 6,
      onboardingComplete: true,
      reduceMotion: false,
    },
    streakDays: 7,
    courseProgress: {
      courseId: 'bilangan-bulat',
      percent: 45,
    },
    moduleProgress: [
      {
        moduleId: 'bilangan-di-bawah-nol',
        percent: 90,
      },
      {
        moduleId: 'operasi-bilangan-bulat',
        percent: 0,
      },
    ],
    savedConcepts: [
      {
        id: 'saved-number-line',
        moduleId: 'bilangan-di-bawah-nol',
        title: 'Cara Membaca Garis Bilangan',
        summary: 'Semakin ke kanan posisi sebuah bilangan, semakin besar nilainya.',
        savedAt: '2026-08-08T10:00:00+07:00',
      },
      {
        id: 'saved-compare-negatives',
        moduleId: 'bilangan-di-bawah-nol',
        title: 'Aturan Membandingkan Bilangan Negatif',
        summary: 'Di antara dua bilangan negatif, yang lebih dekat ke nol bernilai lebih besar.',
        savedAt: '2026-08-07T19:15:00+07:00',
      },
      {
        id: 'saved-temperature-change',
        moduleId: 'operasi-bilangan-bulat',
        title: 'Contoh Perubahan Suhu',
        summary: 'Kenaikan dan penurunan suhu dapat dimodelkan dengan operasi bilangan bulat.',
        savedAt: '2026-08-06T16:30:00+07:00',
      },
    ],
    reviewConcepts: [
      {
        id: 'review-compare-negatives',
        moduleId: 'bilangan-di-bawah-nol',
        title: 'Membandingkan Bilangan Negatif',
        reason: 'Konsep ini siap disegarkan kembali.',
      },
      {
        id: 'review-integer-subtraction',
        moduleId: 'operasi-bilangan-bulat',
        title: 'Pengurangan Bilangan Bulat',
        reason: 'Konsep ini terakhir dilihat beberapa hari lalu.',
      },
    ],
  };
}

export const ARDI_DEMO_FIXTURE: ArdiDemoFixture = createArdiDemoFixture();
