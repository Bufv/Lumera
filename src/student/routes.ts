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
  | 'settings';

export interface StudentLocation {
  route: RouteName;
  demo: boolean;
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
};

const PATH_ROUTES = new Map(Object.entries(ROUTE_PATHS).map(([name, path]) => [path, name as RouteName]));

export function parseStudentHash(
  hash: string,
  onboardingComplete = false,
): StudentLocation {
  const normalized = hash.replace(/^#/, '') || '';
  const [rawPath = '', rawQuery = ''] = normalized.split('?');
  const path = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;
  const route = PATH_ROUTES.get(path) ?? (onboardingComplete ? 'home' : 'welcome');
  const params = new URLSearchParams(rawQuery);
  return { route, demo: params.get('mode') === 'demo' };
}

export function hashForRoute(route: RouteName, demo = false): string {
  return `#${ROUTE_PATHS[route]}${demo ? '?mode=demo' : ''}`;
}

export function isOnboardingRoute(route: RouteName): boolean {
  return route === 'welcome' || route.startsWith('onboarding-');
}

export function isPrimaryRoute(route: RouteName): boolean {
  return ['home', 'learn', 'review', 'saved', 'progress'].includes(route);
}
