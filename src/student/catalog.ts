import type {
  StudentCatalog,
  StudentCourse,
  StudentLearningPath,
  StudentModuleSummary,
  StudentSearchRecord,
  StudentSubject,
  StudentSubjectId,
} from './types';

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

export const MATHEMATICS_GRADE_7_PATH: StudentLearningPath = {
  id: 'matematika-smp-kelas-7',
  subjectId: 'matematika',
  title: 'Matematika SMP Kelas VII',
  description: 'Jalur bertahap untuk membangun nalar bilangan dan dasar matematika SMP.',
  stage: 'smp',
  grade: 7,
  status: 'available',
  courses: [INTEGER_COURSE],
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

function pathSearchRecord(path: StudentLearningPath, subject: StudentSubject): StudentSearchRecord {
  return {
    id: `learningPath:${path.id}`,
    entityId: path.id,
    kind: 'learningPath',
    title: path.title,
    description: path.description,
    status: path.status,
    href: SUBJECT_ROUTES[subject.id] ?? null,
    breadcrumbs: [subject.title],
    keywords: [subject.title, 'SMP', 'Kelas VII', path.description],
  };
}

function courseSearchRecord(
  course: StudentCourse,
  path: StudentLearningPath,
  subject: StudentSubject,
): StudentSearchRecord {
  return {
    id: `course:${course.id}`,
    entityId: course.id,
    kind: 'course',
    title: course.title,
    description: course.description,
    status: course.status,
    href: '#/belajar/matematika/bilangan-bulat',
    breadcrumbs: [subject.title, path.title],
    keywords: [subject.title, path.title, course.gradeLabel, course.description],
  };
}

function moduleSearchRecord(
  module: StudentModuleSummary,
  course: StudentCourse,
  path: StudentLearningPath,
  subject: StudentSubject,
): StudentSearchRecord {
  return {
    id: `module:${module.id}`,
    entityId: module.id,
    kind: 'module',
    title: module.title,
    description: module.description,
    status: module.status,
    href: '#/belajar/matematika/bilangan-bulat',
    breadcrumbs: [subject.title, path.title, course.title],
    keywords: [module.description, ...module.outcomes],
  };
}

function buildSearchRecords(subjects: readonly StudentSubject[]): StudentSearchRecord[] {
  return subjects.flatMap((subject) => [
    subjectSearchRecord(subject),
    ...subject.learningPaths.flatMap((path) => [
      pathSearchRecord(path, subject),
      ...path.courses.flatMap((course) => [
        courseSearchRecord(course, path, subject),
        ...course.modules.map((module) => moduleSearchRecord(module, course, path, subject)),
      ]),
    ]),
  ]);
}

export const STUDENT_SEARCH_RECORDS: readonly StudentSearchRecord[] =
  buildSearchRecords(STUDENT_SUBJECTS);

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
