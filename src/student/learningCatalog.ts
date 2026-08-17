import { hasIndependentCurriculumApproval } from './curriculumReview';

export type LearningPhase = 'D' | 'F';

export type LearningCourseStatus = 'available' | 'comingSoon';

export type LearningAccent = 'violet' | 'amber' | 'blue';

export type LessonAvailability =
  | 'available'
  | 'inProgress'
  | 'completed'
  | 'lockedByPrerequisite'
  | 'comingSoon'
  | 'reviewPending';

export type CurriculumReviewStatus = 'pending' | 'approved';

export interface LessonNode {
  id: string;
  slug: string;
  label: `${number}.${number}`;
  title: string;
  description: string;
  /** Absent means the lesson is roadmap context only and must never open the player. */
  moduleId?: string;
  prerequisiteIds: readonly string[];
  reviewStatus: CurriculumReviewStatus;
  authorId: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CourseLevel {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: readonly LessonNode[];
}

export interface LearningCourse {
  id: string;
  slug: string;
  pathId: string;
  title: string;
  description: string;
  phase: LearningPhase;
  gradeBand: string;
  elective: boolean;
  status: LearningCourseStatus;
  artworkKey: string;
  accent: LearningAccent;
  levels: readonly CourseLevel[];
}

/** Catalog cards intentionally consume the exact same source as course routes. */
export type LearningCourseCard = LearningCourse;

export interface LearningPath {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  phase: LearningPhase;
  gradeBand: string;
  elective: boolean;
  courses: readonly LearningCourse[];
}

export interface LearningCatalog {
  paths: readonly LearningPath[];
}

export interface DerivedLessonNode extends LessonNode {
  availability: LessonAvailability;
  unmetPrerequisiteIds: readonly string[];
}

export interface DerivedCourseLevel extends Omit<CourseLevel, 'lessons'> {
  lessons: readonly DerivedLessonNode[];
}

export interface DerivedLearningCourse extends Omit<LearningCourse, 'levels'> {
  levels: readonly DerivedCourseLevel[];
}

export interface CourseProgress {
  completedCount: number;
  availableCount: number;
  percent: number;
}

export interface LearningRouteOptions {
  demo?: boolean;
  view?: 'roadmap' | 'list';
}

const CONTENT_AUTHOR_ID = 'lumera-content-team';

export const LEARNING_PATH_IDS = {
  phaseD: 'matematika-fase-d',
  phaseF: 'matematika-tingkat-lanjut-fase-f',
} as const;

export const LEARNING_COURSE_IDS = {
  algebra: 'aljabar',
  calculus: 'kalkulus',
} as const;

export const ALGEBRA_MODULE_IDS = {
  lesson1: 'aljabar-pola-yang-tumbuh',
  lesson2: 'aljabar-aturan-di-balik-pola',
  lesson3: 'aljabar-dari-kotak-ke-x',
  lesson4: 'aljabar-cerita-menjadi-aljabar',
} as const;

export const CALCULUS_MODULE_IDS = {
  lesson1: 'kalkulus-seberapa-cepat-berubah',
  lesson2: 'kalkulus-semakin-dekat',
  lesson3: 'kalkulus-kecepatan-pada-satu-saat',
  lesson4: 'kalkulus-turunan-adalah-fungsi',
} as const;

function pendingLesson(
  courseId: string,
  level: number,
  position: number,
  slug: string,
  title: string,
  description: string,
  options: { moduleId?: string; prerequisiteIds?: readonly string[] } = {},
): LessonNode {
  const common = {
    id: `${courseId}-${level}-${position}`,
    slug,
    label: `${level}.${position}` as const,
    title,
    description,
    prerequisiteIds: options.prerequisiteIds ?? [],
    reviewStatus: 'pending' as const,
    authorId: CONTENT_AUTHOR_ID,
  };

  return options.moduleId === undefined ? common : { ...common, moduleId: options.moduleId };
}

const ALGEBRA_LEVELS: readonly CourseLevel[] = [
  {
    id: 'aljabar-level-1',
    number: 1,
    title: 'Pola Menjadi Aljabar',
    description:
      'Melihat aturan, memberi nama pada nilai yang belum diketahui, lalu memodelkannya.',
    lessons: [
      pendingLesson(
        LEARNING_COURSE_IDS.algebra,
        1,
        1,
        'pola-yang-tumbuh',
        'Pola yang Tumbuh',
        'Bangun pola visual dan prediksi bentuk berikutnya.',
        { moduleId: ALGEBRA_MODULE_IDS.lesson1 },
      ),
      pendingLesson(
        LEARNING_COURSE_IDS.algebra,
        1,
        2,
        'aturan-di-balik-pola',
        'Aturan di Balik Pola',
        'Temukan bagaimana sebuah pola dapat dilanjutkan dan dinyatakan secara konsisten.',
        {
          moduleId: ALGEBRA_MODULE_IDS.lesson2,
          prerequisiteIds: [ALGEBRA_MODULE_IDS.lesson1],
        },
      ),
      pendingLesson(
        LEARNING_COURSE_IDS.algebra,
        1,
        3,
        'dari-kotak-ke-x',
        'Dari Kotak ke x',
        'Hubungkan bentuk, tabel, dan aturan umum sebuah pola.',
        {
          moduleId: ALGEBRA_MODULE_IDS.lesson3,
          prerequisiteIds: [ALGEBRA_MODULE_IDS.lesson2],
        },
      ),
      pendingLesson(
        LEARNING_COURSE_IDS.algebra,
        1,
        4,
        'cerita-menjadi-aljabar',
        'Cerita Menjadi Aljabar',
        'Ubah kelompok benda dan cerita menjadi bentuk simbol aljabar.',
        {
          moduleId: ALGEBRA_MODULE_IDS.lesson4,
          prerequisiteIds: [ALGEBRA_MODULE_IDS.lesson3],
        },
      ),
    ],
  },
  {
    id: 'aljabar-level-2',
    number: 2,
    title: 'Bahasa Aljabar',
    description: 'Menyusun bentuk berbeda yang tetap memiliki nilai sama.',
    lessons: [
      pendingLesson(
        'aljabar',
        2,
        1,
        'suku-yang-bisa-digabung',
        'Suku yang Bisa Digabung',
        'Kenali dan gabungkan suku sejenis.',
      ),
      pendingLesson(
        'aljabar',
        2,
        2,
        'menambah-dan-mengurangi-bentuk',
        'Menambah dan Mengurangi Bentuk',
        'Operasikan bentuk aljabar dengan tetap menjaga maknanya.',
      ),
      pendingLesson(
        'aljabar',
        2,
        3,
        'buka-kurung',
        'Buka Kurung',
        'Temukan sifat distributif melalui susunan geometris.',
      ),
      pendingLesson(
        'aljabar',
        2,
        4,
        'bentuk-berbeda-nilai-sama',
        'Bentuk Berbeda, Nilai Sama',
        'Bandingkan beberapa representasi yang ekuivalen.',
      ),
    ],
  },
  {
    id: 'aljabar-level-3',
    number: 3,
    title: 'Persamaan dan Pertidaksamaan',
    description: 'Menjaga hubungan tetap benar ketika kedua sisinya berubah.',
    lessons: [
      pendingLesson(
        'aljabar',
        3,
        1,
        'menjaga-keseimbangan',
        'Menjaga Keseimbangan',
        'Pahami persamaan sebagai dua sisi yang bernilai sama.',
      ),
      pendingLesson(
        'aljabar',
        3,
        2,
        'persamaan-satu-langkah',
        'Persamaan Satu Langkah',
        'Pisahkan variabel dengan satu operasi kebalikan.',
      ),
      pendingLesson(
        'aljabar',
        3,
        3,
        'persamaan-banyak-langkah',
        'Persamaan Banyak Langkah',
        'Rencanakan urutan operasi untuk menemukan nilai variabel.',
      ),
      pendingLesson(
        'aljabar',
        3,
        4,
        'batas-dan-pertidaksamaan',
        'Batas dan Pertidaksamaan',
        'Modelkan kumpulan nilai yang lebih besar atau lebih kecil.',
      ),
    ],
  },
  {
    id: 'aljabar-level-4',
    number: 4,
    title: 'Relasi dan Fungsi',
    description: 'Membaca hubungan input-output melalui beberapa representasi.',
    lessons: [
      pendingLesson(
        'aljabar',
        4,
        1,
        'input-dan-output',
        'Input dan Output',
        'Ikuti perubahan nilai melalui sebuah aturan.',
      ),
      pendingLesson(
        'aljabar',
        4,
        2,
        'kapan-relasi-menjadi-fungsi',
        'Kapan Relasi Menjadi Fungsi?',
        'Uji apakah setiap input mempunyai tepat satu output.',
      ),
      pendingLesson(
        'aljabar',
        4,
        3,
        'domain-kodomain-dan-range',
        'Domain, Kodomain, dan Range',
        'Bedakan masukan, keluaran mungkin, dan keluaran aktual.',
      ),
      pendingLesson(
        'aljabar',
        4,
        4,
        'empat-cara-melihat-fungsi',
        'Empat Cara Melihat Fungsi',
        'Hubungkan diagram, tabel, pasangan berurutan, dan grafik.',
      ),
    ],
  },
  {
    id: 'aljabar-level-5',
    number: 5,
    title: 'Grafik dan Perubahan',
    description: 'Menafsirkan garis sebagai cerita tentang perubahan dua besaran.',
    lessons: [
      pendingLesson(
        'aljabar',
        5,
        1,
        'dari-tabel-ke-grafik',
        'Dari Tabel ke Grafik',
        'Plot pasangan nilai dan baca bentuk yang muncul.',
      ),
      pendingLesson(
        'aljabar',
        5,
        2,
        'garis-lurus-dan-gradien',
        'Garis Lurus dan Gradien',
        'Hubungkan kemiringan garis dengan laju perubahan.',
      ),
      pendingLesson(
        'aljabar',
        5,
        3,
        'persamaan-garis',
        'Persamaan Garis',
        'Bangun persamaan dari kemiringan dan satu titik.',
      ),
      pendingLesson(
        'aljabar',
        5,
        4,
        'linear-atau-nonlinear',
        'Linear atau Nonlinear?',
        'Bedakan perubahan konstan dan tidak konstan secara grafis.',
      ),
    ],
  },
  {
    id: 'aljabar-level-6',
    number: 6,
    title: 'Dua Variabel',
    description: 'Menemukan nilai yang memenuhi dua hubungan sekaligus.',
    lessons: [
      pendingLesson(
        'aljabar',
        6,
        1,
        'pasangan-yang-memenuhi',
        'Pasangan yang Memenuhi',
        'Uji pasangan nilai pada sebuah persamaan dua variabel.',
      ),
      pendingLesson(
        'aljabar',
        6,
        2,
        'titik-temu-dua-garis',
        'Titik Temu Dua Garis',
        'Maknai solusi bersama sebagai perpotongan grafik.',
      ),
      pendingLesson(
        'aljabar',
        6,
        3,
        'eliminasi-dan-substitusi',
        'Eliminasi dan Substitusi',
        'Bandingkan dua strategi menyelesaikan sistem persamaan.',
      ),
      pendingLesson(
        'aljabar',
        6,
        4,
        'masalah-dunia-nyata',
        'Masalah Dunia Nyata',
        'Modelkan situasi kontekstual dengan dua variabel.',
      ),
    ],
  },
];

const CALCULUS_LEVELS: readonly CourseLevel[] = [
  {
    id: 'kalkulus-level-1',
    number: 1,
    title: 'Dari Perubahan ke Turunan',
    description: 'Mendekati perubahan sesaat melalui gerak, grafik, dan garis singgung.',
    lessons: [
      pendingLesson(
        LEARNING_COURSE_IDS.calculus,
        1,
        1,
        'seberapa-cepat-berubah',
        'Seberapa Cepat Berubah?',
        'Hubungkan gerak, interval waktu, dan laju perubahan rata-rata.',
        { moduleId: CALCULUS_MODULE_IDS.lesson1 },
      ),
      pendingLesson(
        LEARNING_COURSE_IDS.calculus,
        1,
        2,
        'semakin-dekat',
        'Semakin Dekat',
        'Amati garis secan mendekati garis singgung ketika h mengecil.',
        {
          moduleId: CALCULUS_MODULE_IDS.lesson2,
          prerequisiteIds: [CALCULUS_MODULE_IDS.lesson1],
        },
      ),
      pendingLesson(
        LEARNING_COURSE_IDS.calculus,
        1,
        3,
        'kecepatan-pada-satu-saat',
        'Kecepatan pada Satu Saat',
        'Satukan posisi, kemiringan garis singgung, dan kecepatan sesaat.',
        {
          moduleId: CALCULUS_MODULE_IDS.lesson3,
          prerequisiteIds: [CALCULUS_MODULE_IDS.lesson2],
        },
      ),
      pendingLesson(
        LEARNING_COURSE_IDS.calculus,
        1,
        4,
        'turunan-adalah-fungsi',
        'Turunan adalah Fungsi',
        'Jejak perubahan kemiringan untuk membentuk grafik turunan.',
        {
          moduleId: CALCULUS_MODULE_IDS.lesson4,
          prerequisiteIds: [CALCULUS_MODULE_IDS.lesson3],
        },
      ),
    ],
  },
  {
    id: 'kalkulus-level-2',
    number: 2,
    title: 'Aturan Turunan',
    description: 'Menyusun aturan efisien untuk berbagai keluarga fungsi.',
    lessons: [
      pendingLesson(
        'kalkulus',
        2,
        1,
        'turunan-polinomial',
        'Turunan Polinomial',
        'Temukan pola turunan pada pangkat dan polinomial.',
      ),
      pendingLesson(
        'kalkulus',
        2,
        2,
        'hasil-kali-dan-hasil-bagi',
        'Hasil Kali dan Hasil Bagi',
        'Turunkan fungsi yang dikalikan atau dibagi.',
      ),
      pendingLesson(
        'kalkulus',
        2,
        3,
        'fungsi-di-dalam-fungsi',
        'Fungsi di Dalam Fungsi',
        'Ikuti perubahan berlapis melalui aturan rantai.',
      ),
      pendingLesson(
        'kalkulus',
        2,
        4,
        'eksponensial-dan-trigonometri',
        'Eksponensial dan Trigonometri',
        'Bandingkan turunan fungsi eksponensial dan trigonometri.',
      ),
    ],
  },
  {
    id: 'kalkulus-level-3',
    number: 3,
    title: 'Membaca Kurva',
    description: 'Menggunakan turunan untuk menjelaskan bentuk sebuah grafik.',
    lessons: [
      pendingLesson(
        'kalkulus',
        3,
        1,
        'garis-singgung',
        'Garis Singgung',
        'Tentukan gradien dan persamaan garis singgung.',
      ),
      pendingLesson(
        'kalkulus',
        3,
        2,
        'naik-dan-turun',
        'Naik dan Turun',
        'Hubungkan tanda turunan dengan arah perubahan fungsi.',
      ),
      pendingLesson(
        'kalkulus',
        3,
        3,
        'titik-kritis',
        'Titik Kritis',
        'Temukan titik tempat perilaku kurva dapat berubah.',
      ),
      pendingLesson(
        'kalkulus',
        3,
        4,
        'sketsa-kurva',
        'Sketsa Kurva',
        'Gabungkan informasi turunan menjadi sketsa yang masuk akal.',
      ),
    ],
  },
  {
    id: 'kalkulus-level-4',
    number: 4,
    title: 'Gerak dan Optimasi',
    description: 'Memakai turunan untuk menjelaskan gerak dan memilih hasil terbaik.',
    lessons: [
      pendingLesson(
        'kalkulus',
        4,
        1,
        'posisi-kecepatan-percepatan',
        'Posisi, Kecepatan, Percepatan',
        'Hubungkan tiga cara membaca perubahan gerak.',
      ),
      pendingLesson(
        'kalkulus',
        4,
        2,
        'maksimum-dan-minimum',
        'Maksimum dan Minimum',
        'Bedakan titik ekstrem lokal dan absolut.',
      ),
      pendingLesson(
        'kalkulus',
        4,
        3,
        'memodelkan-optimasi',
        'Memodelkan Optimasi',
        'Ubah kendala dunia nyata menjadi fungsi yang dapat dianalisis.',
      ),
      pendingLesson(
        'kalkulus',
        4,
        4,
        'memilih-solusi-terbaik',
        'Memilih Solusi Terbaik',
        'Uji kandidat dan batas untuk mengambil keputusan.',
      ),
    ],
  },
  {
    id: 'kalkulus-level-5',
    number: 5,
    title: 'Integral sebagai Akumulasi',
    description: 'Membangun keseluruhan dari banyak perubahan kecil.',
    lessons: [
      pendingLesson(
        'kalkulus',
        5,
        1,
        'menjumlahkan-potongan-kecil',
        'Menjumlahkan Potongan Kecil',
        'Perkirakan total dengan potongan yang semakin tipis.',
      ),
      pendingLesson(
        'kalkulus',
        5,
        2,
        'luas-di-bawah-kurva',
        'Luas di Bawah Kurva',
        'Maknai integral sebagai luas bertanda.',
      ),
      pendingLesson(
        'kalkulus',
        5,
        3,
        'anti-turunan',
        'Anti-turunan',
        'Temukan keluarga fungsi dari turunannya.',
      ),
      pendingLesson(
        'kalkulus',
        5,
        4,
        'integral-tentu',
        'Integral Tentu',
        'Hitung akumulasi pada sebuah interval.',
      ),
    ],
  },
  {
    id: 'kalkulus-level-6',
    number: 6,
    title: 'Satu Hubungan Besar',
    description: 'Menyatukan perubahan sesaat dan akumulasi sebagai proses kebalikan.',
    lessons: [
      pendingLesson(
        'kalkulus',
        6,
        1,
        'turunan-dan-integral-berbalik-arah',
        'Turunan dan Integral Berbalik Arah',
        'Lihat dua proses yang saling membatalkan.',
      ),
      pendingLesson(
        'kalkulus',
        6,
        2,
        'teorema-dasar-kalkulus',
        'Teorema Dasar Kalkulus',
        'Hubungkan luas yang tumbuh dengan nilai fungsi.',
      ),
      pendingLesson(
        'kalkulus',
        6,
        3,
        'luas-dan-perubahan-bersih',
        'Luas dan Perubahan Bersih',
        'Tafsirkan integral positif dan negatif dalam konteks.',
      ),
      pendingLesson(
        'kalkulus',
        6,
        4,
        'tantangan-koneksi',
        'Tantangan Koneksi',
        'Pilih representasi turunan atau integral untuk masalah baru.',
      ),
    ],
  },
];

export const ALGEBRA_COURSE: LearningCourse = {
  id: LEARNING_COURSE_IDS.algebra,
  slug: LEARNING_COURSE_IDS.algebra,
  pathId: LEARNING_PATH_IDS.phaseD,
  title: 'Aljabar',
  description: 'Memahami bagaimana pola, simbol, persamaan, dan grafik menggambarkan hubungan.',
  phase: 'D',
  gradeBand: 'Kelas VII–IX',
  elective: false,
  status: 'available',
  artworkKey: 'course-algebra',
  accent: 'violet',
  levels: ALGEBRA_LEVELS,
};

export const CALCULUS_COURSE: LearningCourse = {
  id: LEARNING_COURSE_IDS.calculus,
  slug: LEARNING_COURSE_IDS.calculus,
  pathId: LEARNING_PATH_IDS.phaseF,
  title: 'Kalkulus',
  description: 'Menjelajahi perubahan sesaat, turunan, optimasi, dan akumulasi secara visual.',
  phase: 'F',
  gradeBand: 'Kelas XI–XII',
  elective: true,
  status: 'available',
  artworkKey: 'course-calculus',
  accent: 'amber',
  levels: CALCULUS_LEVELS,
};

function comingSoonCourse(
  id: string,
  pathId: string,
  title: string,
  description: string,
  phase: LearningPhase,
  gradeBand: string,
  elective: boolean,
  artworkKey: string,
  accent: LearningAccent,
): LearningCourse {
  return {
    id,
    slug: id,
    pathId,
    title,
    description,
    phase,
    gradeBand,
    elective,
    status: 'comingSoon',
    artworkKey,
    accent,
    levels: [],
  };
}

export const PHASE_D_PATH: LearningPath = {
  id: LEARNING_PATH_IDS.phaseD,
  slug: LEARNING_PATH_IDS.phaseD,
  title: 'Matematika · Fase D',
  shortTitle: 'Matematika Fase D',
  description:
    'Jalur konsep untuk membangun penalaran matematika tingkat SMP secara bertahap.',
  phase: 'D',
  gradeBand: 'Kelas VII–IX',
  elective: false,
  courses: [
    ALGEBRA_COURSE,
    comingSoonCourse(
      'relasi-dan-fungsi',
      LEARNING_PATH_IDS.phaseD,
      'Relasi & Fungsi',
      'Menghubungkan input, output, dan berbagai representasi fungsi.',
      'D',
      'Kelas VII–IX',
      false,
      'course-relations-functions',
      'blue',
    ),
    comingSoonCourse(
      'geometri',
      LEARNING_PATH_IDS.phaseD,
      'Geometri',
      'Menyelidiki bentuk, ukuran, posisi, dan transformasi.',
      'D',
      'Kelas VII–IX',
      false,
      'course-geometry',
      'amber',
    ),
    comingSoonCourse(
      'data-dan-peluang',
      LEARNING_PATH_IDS.phaseD,
      'Data & Peluang',
      'Membaca data dan menalar ketidakpastian dari percobaan.',
      'D',
      'Kelas VII–IX',
      false,
      'course-data-probability',
      'violet',
    ),
  ],
};

export const PHASE_F_PATH: LearningPath = {
  id: LEARNING_PATH_IDS.phaseF,
  slug: LEARNING_PATH_IDS.phaseF,
  title: 'Matematika Tingkat Lanjut · Fase F',
  shortTitle: 'Matematika Tingkat Lanjut',
  description:
    'Jalur pilihan untuk menjelajahi fungsi, perubahan, dan pemodelan tingkat lanjut.',
  phase: 'F',
  gradeBand: 'Kelas XI–XII',
  elective: true,
  courses: [
    CALCULUS_COURSE,
    comingSoonCourse(
      'aljabar-lanjut',
      LEARNING_PATH_IDS.phaseF,
      'Aljabar Lanjut',
      'Mengembangkan model dengan polinomial, fungsi, dan transformasi.',
      'F',
      'Kelas XI–XII',
      true,
      'course-advanced-algebra',
      'violet',
    ),
    comingSoonCourse(
      'geometri-analitik',
      LEARNING_PATH_IDS.phaseF,
      'Geometri Analitik',
      'Menghubungkan bentuk geometri dengan koordinat dan persamaan.',
      'F',
      'Kelas XI–XII',
      true,
      'course-analytic-geometry',
      'blue',
    ),
  ],
};

export const LEARNING_PATHS: readonly LearningPath[] = [PHASE_D_PATH, PHASE_F_PATH];

export const ACTIVE_LEARNING_COURSES: readonly LearningCourse[] = [
  ALGEBRA_COURSE,
  CALCULUS_COURSE,
];

export const LEARNING_CATALOG: LearningCatalog = { paths: LEARNING_PATHS };

export function findLearningPath(idOrSlug: string): LearningPath | null {
  return LEARNING_PATHS.find((path) => path.id === idOrSlug || path.slug === idOrSlug) ?? null;
}

export function findLearningCourse(idOrSlug: string): LearningCourse | null {
  for (const path of LEARNING_PATHS) {
    const course = path.courses.find(
      (candidate) => candidate.id === idOrSlug || candidate.slug === idOrSlug,
    );
    if (course) return course;
  }
  return null;
}

export function findLessonNode(courseIdOrSlug: string, lessonIdOrSlug: string): LessonNode | null {
  const course = findLearningCourse(courseIdOrSlug);
  if (!course) return null;

  for (const level of course.levels) {
    const lesson = level.lessons.find(
      (candidate) =>
        candidate.id === lessonIdOrSlug ||
        candidate.slug === lessonIdOrSlug ||
        candidate.moduleId === lessonIdOrSlug,
    );
    if (lesson) return lesson;
  }
  return null;
}

export function isLessonReviewApproved(lesson: LessonNode): boolean {
  if (lesson.moduleId && hasIndependentCurriculumApproval(lesson.moduleId)) return true;
  return (
    lesson.reviewStatus === 'approved' &&
    Boolean(lesson.reviewedAt) &&
    !Number.isNaN(Date.parse(lesson.reviewedAt ?? '')) &&
    Boolean(lesson.reviewedBy) &&
    lesson.reviewedBy !== lesson.authorId
  );
}

export function deriveLessonAvailability(
  lesson: LessonNode,
  completedModuleIds: ReadonlySet<string>,
  demo: boolean,
  activeModuleId?: string,
): Pick<DerivedLessonNode, 'availability' | 'unmetPrerequisiteIds'> {
  if (!lesson.moduleId) {
    return { availability: 'comingSoon', unmetPrerequisiteIds: [] };
  }

  if (completedModuleIds.has(lesson.moduleId)) {
    return { availability: 'completed', unmetPrerequisiteIds: [] };
  }

  const unmetPrerequisiteIds = lesson.prerequisiteIds.filter(
    (moduleId) => !completedModuleIds.has(moduleId),
  );
  if (unmetPrerequisiteIds.length > 0) {
    return { availability: 'lockedByPrerequisite', unmetPrerequisiteIds };
  }

  if (!demo && !isLessonReviewApproved(lesson)) {
    return { availability: 'reviewPending', unmetPrerequisiteIds: [] };
  }

  return {
    availability: activeModuleId === lesson.moduleId ? 'inProgress' : 'available',
    unmetPrerequisiteIds: [],
  };
}

export function deriveCourseRoadmap(
  course: LearningCourse,
  completedModuleIds: Iterable<string> = [],
  demo = false,
  activeModuleId?: string,
): DerivedLearningCourse {
  const completed = new Set(completedModuleIds);
  return {
    ...course,
    levels: course.levels.map((level) => ({
      ...level,
      lessons: level.lessons.map((lesson) => ({
        ...lesson,
        ...deriveLessonAvailability(lesson, completed, demo, activeModuleId),
      })),
    })),
  };
}

export function getCourseProgress(
  course: LearningCourse,
  completedModuleIds: Iterable<string> = [],
): CourseProgress {
  const completed = new Set(completedModuleIds);
  const moduleIds = course.levels.flatMap((level) =>
    level.lessons.flatMap((lesson) => (lesson.moduleId ? [lesson.moduleId] : [])),
  );
  const completedCount = moduleIds.filter((moduleId) => completed.has(moduleId)).length;
  const availableCount = moduleIds.length;

  return {
    completedCount,
    availableCount,
    percent: availableCount === 0 ? 0 : Math.round((completedCount / availableCount) * 100),
  };
}

function learningQuery(options: LearningRouteOptions): string {
  const params = new URLSearchParams();
  if (options.demo) params.set('mode', 'demo');
  if (options.view === 'list') params.set('view', 'list');
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getCourseHref(
  course: LearningCourse,
  options: LearningRouteOptions = {},
): string | null {
  if (course.status !== 'available') return null;
  return `#/belajar/matematika/${course.slug}${learningQuery(options)}`;
}

export function getLessonHref(
  course: LearningCourse,
  lesson: LessonNode,
  options: Pick<LearningRouteOptions, 'demo'> = {},
): string | null {
  if (course.status !== 'available' || !lesson.moduleId) return null;
  return `#/belajar/matematika/${course.slug}/${lesson.slug}${learningQuery(options)}`;
}
