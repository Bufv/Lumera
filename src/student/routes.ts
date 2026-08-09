export type RouteName =
  | 'welcome'
  | 'onboarding-profile'
  | 'onboarding-goal'
  | 'onboarding-subject'
  | 'onboarding-rhythm'
  | 'onboarding-plan'
  | 'home'
  | 'learn'
  | 'math'
  | 'integers'
  | 'review'
  | 'saved'
  | 'progress'
  | 'settings'
  | 'peta-ilmu'
  | 'lesson';

export type CourseView = 'roadmap' | 'list';

export interface StudentLocation {
  route: RouteName;
  demo: boolean;
  courseView: CourseView;
  /** Hanya terisi saat `route === 'lesson'` — id modul di `src/shell/registry.ts`. */
  lessonModuleId?: string | null;
}

export const ROUTE_PATHS: Record<RouteName, string> = {
  welcome: '/mulai',
  'onboarding-profile': '/mulai/profil',
  'onboarding-goal': '/mulai/tujuan',
  'onboarding-subject': '/mulai/pelajaran',
  'onboarding-rhythm': '/mulai/ritme',
  'onboarding-plan': '/mulai/rencana',
  home: '/beranda',
  learn: '/belajar',
  math: '/belajar/matematika',
  integers: '/belajar/matematika/bilangan-bulat',
  review: '/ulangi',
  saved: '/simpanan',
  progress: '/progres',
  settings: '/pengaturan',
  'peta-ilmu': '/peta-ilmu',
  lesson: '/pelajaran',
};

const PATH_ROUTES = new Map(
  Object.entries(ROUTE_PATHS).map(([name, path]) => [path, name as RouteName]),
);

export function parseStudentHash(hash: string, onboardingComplete = false): StudentLocation {
  const normalized = hash.replace(/^#/, '') || '';
  const [rawPath = '', rawQuery = ''] = normalized.split('?');
  const path = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;
  const route = PATH_ROUTES.get(path) ?? (onboardingComplete ? 'home' : 'welcome');
  const params = new URLSearchParams(rawQuery);
  const courseView: CourseView = params.get('view') === 'list' ? 'list' : 'roadmap';
  return {
    route,
    demo: params.get('mode') === 'demo',
    courseView,
    // Kunci opsional ini sengaja tidak pernah muncul di objek untuk rute selain
    // 'lesson', agar bentuk StudentLocation untuk rute lama tetap sama persis
    // (lihat tests/unit/student-routes.test.ts yang membandingkan bentuk penuh).
    ...(route === 'lesson' ? { lessonModuleId: params.get('modul') } : {}),
  };
}

export function hashForRoute(
  route: RouteName,
  demo = false,
  courseView: CourseView = 'roadmap',
): string {
  const query: string[] = [];
  if (demo) query.push('mode=demo');
  if (route === 'integers' && courseView === 'list') query.push('view=list');
  return `#${ROUTE_PATHS[route]}${query.length > 0 ? `?${query.join('&')}` : ''}`;
}

export function hashForCourseView(courseView: CourseView, demo = false): string {
  return hashForRoute('integers', demo, courseView);
}

/** US1/US2 spec 001 (T086): tautan langsung ke sebuah modul lewat LessonShell. */
export function hashForLesson(moduleId: string, demo = false): string {
  const query = [`modul=${encodeURIComponent(moduleId)}`];
  if (demo) query.push('mode=demo');
  return `#${ROUTE_PATHS.lesson}?${query.join('&')}`;
}

export function isOnboardingRoute(route: RouteName): boolean {
  return route === 'welcome' || route.startsWith('onboarding-');
}

export function isPrimaryRoute(route: RouteName): boolean {
  return ['home', 'learn', 'review', 'saved', 'progress'].includes(route);
}
