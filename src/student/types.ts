export type ContentStatus = 'available' | 'comingSoon';

export type StudentSubjectId =
  | 'matematika'
  | 'ipa'
  | 'bahasa-indonesia'
  | 'bahasa-inggris'
  | 'ips'
  | 'informatika'
  | 'koding-ai'
  | 'literasi-finansial';

export interface StudentModuleSummary {
  id: string;
  courseId: string;
  title: string;
  description: string;
  outcomes: readonly string[];
  status: ContentStatus;
  artworkKey: string;
}

export interface StudentCourse {
  id: string;
  learningPathId: string;
  title: string;
  description: string;
  gradeLabel: string;
  status: ContentStatus;
  artworkKey: string;
  modules: readonly StudentModuleSummary[];
}

export interface StudentLearningPath {
  id: string;
  subjectId: StudentSubjectId;
  title: string;
  description: string;
  stage: 'smp';
  grade: 7;
  status: ContentStatus;
  courses: readonly StudentCourse[];
}

export interface StudentSubject {
  id: StudentSubjectId;
  title: string;
  description: string;
  status: ContentStatus;
  artworkKey: string;
  learningPaths: readonly StudentLearningPath[];
}

export interface StudentCatalog {
  subjects: readonly StudentSubject[];
}

export type StudentSearchKind = 'subject' | 'learningPath' | 'course' | 'module';

export interface StudentSearchRecord {
  id: string;
  entityId: string;
  kind: StudentSearchKind;
  title: string;
  description: string;
  status: ContentStatus;
  /** Null means the result is visible but intentionally unavailable. */
  href: string | null;
  breadcrumbs: readonly string[];
  keywords: readonly string[];
}
