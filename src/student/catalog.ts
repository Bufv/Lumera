import type {
  StudentCatalog,
  StudentCourse,
  StudentLearningPath,
  StudentModuleSummary,
  StudentSearchRecord,
  StudentSubject,
  StudentSubjectId,
} from './types';
import {
  LEARNING_PATHS,
  getCourseHref,
  type LearningCourse,
  type LearningPath,
  type LessonNode,
} from './learningCatalog';

export const INTEGER_MODULES: readonly StudentModuleSummary[] = [
  {
    id: 'bilangan-di-bawah-nol',
    courseId: 'bilangan-bulat',
    title: 'Bilangan di Bawah Nol',
    description: 'Mengenali bilangan negatif melalui suhu, posisi, dan garis bilangan.',
    outcomes: [
      'Membedakan bilangan positif, negatif, dan nol',
      'Membandingkan bilangan pada garis bilangan',
      'Menjelaskan nilai mutlak dalam konteks sehari-hari',
    ],
    status: 'available',
    artworkKey: 'module-negative-numbers',
  },
  {
    id: 'operasi-bilangan-bulat',
    courseId: 'bilangan-bulat',
    title: 'Operasi Bilangan Bulat',
    description: 'Memahami perubahan nilai saat bilangan bulat dijumlahkan atau dikurangkan.',
    outcomes: [
      'Menafsirkan penjumlahan bilangan bulat',
      'Menafsirkan pengurangan bilangan bulat',
      'Memilih operasi yang sesuai untuk masalah kontekstual',
    ],
    status: 'available',
    artworkKey: 'module-integer-operations',
  },
];

export const INTEGER_COURSE: StudentCourse = {
  id: 'bilangan-bulat',
  learningPathId: 'matematika-smp-kelas-7',
  title: 'Bilangan Bulat',
  description: 'Membangun pemahaman bilangan positif dan negatif untuk situasi sehari-hari.',
  gradeLabel: 'SMP Kelas VII',
  status: 'available',
  artworkKey: 'course-integers',
  modules: INTEGER_MODULES,
};

export const MATHEMATICS_COURSES: readonly StudentCourse[] = [
  INTEGER_COURSE,
  {
    id: 'pecahan-dan-desimal',
    learningPathId: 'matematika-smp-kelas-7',
    title: 'Pecahan dan Desimal',
    description: 'Menghubungkan pecahan, desimal, dan penggunaannya dalam berbagai situasi.',
    gradeLabel: 'SMP Kelas VII',
    status: 'comingSoon',
    artworkKey: 'course-fractions-decimals',
    modules: [],
  },
  {
    id: 'perbandingan-dan-skala',
    learningPathId: 'matematika-smp-kelas-7',
    title: 'Perbandingan dan Skala',
    description: 'Membandingkan besaran dan membaca hubungan skala dalam kehidupan sehari-hari.',
    gradeLabel: 'SMP Kelas VII',
    status: 'comingSoon',
    artworkKey: 'course-ratio-scale',
    modules: [],
  },
  {
    id: 'bentuk-aljabar',
    learningPathId: 'matematika-smp-kelas-7',
    title: 'Bentuk Aljabar',
    description: 'Mengenali variabel dan menyatakan hubungan matematika dengan bentuk aljabar.',
    gradeLabel: 'SMP Kelas VII',
    status: 'comingSoon',
    artworkKey: 'course-algebraic-expressions',
    modules: [],
  },
];

export const MATHEMATICS_GRADE_7_PATH: StudentLearningPath = {
  id: 'matematika-smp-kelas-7',
  subjectId: 'matematika',
  title: 'Matematika SMP Kelas VII',
  description: 'Jalur bertahap untuk membangun nalar bilangan dan dasar matematika SMP.',
  stage: 'smp',
  grade: 7,
  status: 'available',
  courses: MATHEMATICS_COURSES,
};

const COMING_SOON_SUBJECTS: readonly StudentSubject[] = [
  {
    id: 'ipa',
    title: 'IPA',
    description: 'Menyelidiki gejala alam melalui pengamatan dan penalaran.',
    status: 'comingSoon',
    artworkKey: 'subject-science',
    learningPaths: [],
  },
  {
    id: 'bahasa-indonesia',
    title: 'Bahasa Indonesia',
    description: 'Mengembangkan kemampuan membaca, menulis, dan bernalar.',
    status: 'comingSoon',
    artworkKey: 'subject-indonesian',
    learningPaths: [],
  },
  {
    id: 'bahasa-inggris',
    title: 'Bahasa Inggris',
    description: 'Membangun pemahaman dan komunikasi dalam Bahasa Inggris.',
    status: 'comingSoon',
    artworkKey: 'subject-english',
    learningPaths: [],
  },
  {
    id: 'ips',
    title: 'IPS',
    description: 'Memahami masyarakat, ruang, waktu, dan keputusan ekonomi.',
    status: 'comingSoon',
    artworkKey: 'subject-social-studies',
    learningPaths: [],
  },
  {
    id: 'informatika',
    title: 'Informatika',
    description: 'Memahami data, sistem komputasi, dan teknologi informasi.',
    status: 'comingSoon',
    artworkKey: 'subject-informatics',
    learningPaths: [],
  },
  {
    id: 'koding-ai',
    title: 'Koding & AI',
    description: 'Membuat solusi dengan kode dan memahami kecerdasan artifisial.',
    status: 'comingSoon',
    artworkKey: 'subject-coding-ai',
    learningPaths: [],
  },
  {
    id: 'literasi-finansial',
    title: 'Literasi Finansial',
    description: 'Mengambil keputusan keuangan yang bijak untuk masa depan.',
    status: 'comingSoon',
    artworkKey: 'subject-financial-literacy',
    learningPaths: [],
  },
];

export const STUDENT_SUBJECTS: readonly StudentSubject[] = [
  {
    id: 'matematika',
    title: 'Matematika',
    description: 'Memahami pola, bilangan, dan pemecahan masalah secara bertahap.',
    status: 'available',
    artworkKey: 'subject-mathematics',
    learningPaths: [MATHEMATICS_GRADE_7_PATH],
  },
  ...COMING_SOON_SUBJECTS,
];

export const STUDENT_CATALOG: StudentCatalog = {
  subjects: STUDENT_SUBJECTS,
};

const SUBJECT_ROUTES: Readonly<Partial<Record<StudentSubjectId, string>>> = {
  matematika: '#/belajar/matematika',
};

function subjectSearchRecord(subject: StudentSubject): StudentSearchRecord {
  return {
    id: `subject:${subject.id}`,
    entityId: subject.id,
    kind: 'subject',
    title: subject.title,
    description: subject.description,
    status: subject.status,
    href: SUBJECT_ROUTES[subject.id] ?? null,
    breadcrumbs: ['Mata Pelajaran'],
    keywords: [subject.title, subject.description],
  };
}

function canonicalPathSearchRecord(path: LearningPath): StudentSearchRecord {
  return {
    id: `learningPath:${path.id}`,
    entityId: path.id,
    kind: 'learningPath',
    title: path.title,
    description: path.description,
    status: 'available',
    href: '#/belajar',
    breadcrumbs: ['Matematika', path.shortTitle],
    keywords: [path.phase, path.gradeBand, path.description],
  };
}

function canonicalCourseSearchRecord(
  course: LearningCourse,
  path: LearningPath,
): StudentSearchRecord {
  return {
    id: `course:${course.id}`,
    entityId: course.id,
    kind: 'course',
    title: course.title,
    description: course.description,
    status: course.status,
    href: getCourseHref(course),
    breadcrumbs: ['Matematika', path.shortTitle],
    keywords: [course.phase, course.gradeBand, course.description],
  };
}

function canonicalLessonSearchRecord(
  lesson: LessonNode,
  course: LearningCourse,
  path: LearningPath,
): StudentSearchRecord {
  return {
    id: `module:${lesson.id}`,
    entityId: lesson.id,
    kind: 'module',
    title: lesson.title,
    description: lesson.description,
    status: lesson.moduleId ? 'available' : 'comingSoon',
    // Search opens the owning roadmap so prerequisite and review gates remain visible.
    href: lesson.moduleId ? getCourseHref(course) : null,
    breadcrumbs: ['Matematika', path.shortTitle, course.title, lesson.label],
    keywords: [lesson.description, course.title, path.title],
  };
}

export const STUDENT_SEARCH_RECORDS: readonly StudentSearchRecord[] = [
  ...STUDENT_SUBJECTS.map(subjectSearchRecord),
  ...LEARNING_PATHS.flatMap((path) => [
    canonicalPathSearchRecord(path),
    ...path.courses.flatMap((course) => [
      canonicalCourseSearchRecord(course, path),
      ...course.levels.flatMap((level) =>
        level.lessons.map((lesson) => canonicalLessonSearchRecord(lesson, course, path)),
      ),
    ]),
  ]),
];

function normalized(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID');
}

function searchScore(record: StudentSearchRecord, query: string): number {
  const title = normalized(record.title);
  const searchable = normalized(
    [record.title, record.description, ...record.breadcrumbs, ...record.keywords].join(' '),
  );

  if (title === query) return 3;
  if (title.startsWith(query)) return 2;
  return searchable.includes(query) ? 1 : 0;
}

export function searchStudentContent(query: string, limit = 8): StudentSearchRecord[] {
  const normalizedQuery = normalized(query.trim());
  if (!normalizedQuery || limit <= 0) return [];

  return STUDENT_SEARCH_RECORDS.map((record, index) => ({
    record,
    index,
    score: searchScore(record, normalizedQuery),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ record }) => record);
}

export function findStudentSubject(id: StudentSubjectId): StudentSubject | null {
  return STUDENT_SUBJECTS.find((subject) => subject.id === id) ?? null;
}

export function findStudentCourse(id: string): StudentCourse | null {
  for (const subject of STUDENT_SUBJECTS) {
    for (const path of subject.learningPaths) {
      const course = path.courses.find((candidate) => candidate.id === id);
      if (course) return course;
    }
  }
  return null;
}

export function findStudentModule(id: string): StudentModuleSummary | null {
  for (const subject of STUDENT_SUBJECTS) {
    for (const path of subject.learningPaths) {
      for (const course of path.courses) {
        const module = course.modules.find((candidate) => candidate.id === id);
        if (module) return module;
      }
    }
  }
  return null;
}
