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
  | 'course'
  | 'lesson'
  | 'review'
  | 'saved'
  | 'progress'
  | 'settings'
  | 'privacy';

export type CourseView = 'roadmap' | 'list';

export interface StudentLocation {
  route: RouteName;
  demo: boolean;
  courseView: CourseView;
  courseSlug?: string;
  lessonSlug?: string;
}

type StaticRouteName = Exclude<RouteName, 'course' | 'lesson'>;

export const ROUTE_PATHS: Record<StaticRouteName, string> = {
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
  // US6 spec 002 (T029, FR-013): kebijakan privasi harus dapat diakses siswa/
  // orang tua kapan saja lewat tautan langsung, bukan hanya lewat menu.
  privacy: '/privasi',
};

const PATH_ROUTES = new Map(
  Object.entries(ROUTE_PATHS).map(([name, path]) => [path, name as RouteName]),
);

export function parseStudentHash(hash: string, onboardingComplete = false): StudentLocation {
  const normalized = hash.replace(/^#/, '') || '';
  const [rawPath = '', rawQuery = ''] = normalized.split('?');
  const path = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;
  const params = new URLSearchParams(rawQuery);
  const courseView: CourseView = params.get('view') === 'list' ? 'list' : 'roadmap';
  const demo = params.get('mode') === 'demo';
  const staticRoute = PATH_ROUTES.get(path);
  if (staticRoute) return { route: staticRoute, demo, courseView };

  const courseMatch = path.match(/^\/belajar\/matematika\/([^/]+)(?:\/([^/]+))?$/);
  if (courseMatch) {
    const [, courseSlug, lessonSlug] = courseMatch;
    return lessonSlug
      ? { route: 'lesson', demo, courseView, courseSlug, lessonSlug }
      : { route: 'course', demo, courseView, courseSlug };
  }

  return { route: onboardingComplete ? 'home' : 'welcome', demo, courseView };
}

export function hashForRoute(
  route: StaticRouteName,
  demo = false,
  courseView: CourseView = 'roadmap',
): string {
  const query: string[] = [];
  if (demo) query.push('mode=demo');
  if (route === 'integers' && courseView === 'list') query.push('view=list');
  return `#${ROUTE_PATHS[route]}${query.length > 0 ? `?${query.join('&')}` : ''}`;
}

function learningQuery(demo: boolean, courseView: CourseView, includeView: boolean): string {
  const query: string[] = [];
  if (demo) query.push('mode=demo');
  if (includeView && courseView === 'list') query.push('view=list');
  return query.length > 0 ? `?${query.join('&')}` : '';
}

export function hashForCourse(
  courseSlug: string,
  demo = false,
  courseView: CourseView = 'roadmap',
): string {
  return `#/belajar/matematika/${encodeURIComponent(courseSlug)}${learningQuery(
    demo,
    courseView,
    true,
  )}`;
}

export function hashForLesson(courseSlug: string, lessonSlug: string, demo = false): string {
  return `#/belajar/matematika/${encodeURIComponent(courseSlug)}/${encodeURIComponent(
    lessonSlug,
  )}${learningQuery(demo, 'roadmap', false)}`;
}

export function hashForCourseView(
  courseView: CourseView,
  demo = false,
  courseSlug = 'bilangan-bulat',
): string {
  return courseSlug === 'bilangan-bulat'
    ? hashForRoute('integers', demo, courseView)
    : hashForCourse(courseSlug, demo, courseView);
}

export function isOnboardingRoute(route: RouteName): boolean {
  return route === 'welcome' || route.startsWith('onboarding-');
}

export function isPrimaryRoute(route: RouteName): boolean {
  return ['home', 'learn', 'review', 'saved', 'progress'].includes(route);
}
