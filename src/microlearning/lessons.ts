import type { MicroLessonDefinition, MicroLessonId, MicroModel } from './types';

const signature = (
  kind: MicroModel['kind'],
  values: Readonly<Record<string, number>>,
  metrics: Readonly<Record<string, number | string | boolean>>,
): MicroModel => ({
  kind,
  values,
  metrics,
  signature: `${kind}:${Object.entries({ ...values, ...metrics })
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('|')}`,
});

const algebra11: MicroLessonDefinition = {
  id: 'aljabar-pola-yang-tumbuh',
  number: '1.1',
  course: 'Aljabar',
  phase: 'Fase D',
  title: 'Pola yang Tumbuh',
  eyebrow: 'Dari bentuk menuju aturan',
  prompt: 'Bisakah satu gambar memberi tahu kita bentuk yang belum dibuat?',
  invitation: 'Amati bagaimana dua ubin baru muncul pada setiap langkah.',
  exploreInstruction: 'Ubah langkah n. Setiap angka yang kamu ketik langsung membangun ulang pola.',
  predictPrompt: 'Sebelum menghitung, tebak jumlah ubin pada langkah yang sedang terlihat.',
  manipulateInstruction: 'Coba beberapa langkah. Temukan bagian yang tetap dan bagian yang tumbuh.',
  assessmentPrompt: 'Berapa jumlah seluruh ubin pada pola ini?',
  whyTitle: 'Satu pusat, dua ubin setiap langkah',
  why: 'Pola selalu memiliki satu ubin pusat. Setiap kenaikan langkah menambah dua ubin, sehingga jumlahnya 2n + 1.',
  reflectionPrompt: 'Dua langkah setelah pola ini, berapa jumlah ubinnya?',
  completionCopy: 'Kamu tidak hanya meneruskan pola—kamu menemukan mesin yang membangunnya.',
  controls: [
    { key: 'n', label: 'Langkah pola', shortLabel: 'n', defaultValue: 3, min: 1, max: 12, step: 1 },
  ],
  predictionDefault: 5,
  answerDefault: 5,
  transferDefault: 9,
  buildModel: (values) => {
    const n = Math.round(values.n ?? 3);
    return signature('growing-pattern', { n }, { count: 2 * n + 1, transferN: n + 2 });
  },
  expectedAnswer: (model) => Number(model.metrics.count),
  expectedTransfer: (model) => 2 * Number(model.metrics.transferN) + 1,
  hints: [
    'Sorot ubin pusat yang tidak pernah berubah.',
    'Kelompokkan lengan kiri dan kanan: masing-masing berisi n ubin.',
    'Mulai dari 1, lalu tambahkan n + n.',
  ],
  transferHint: 'Naik dua langkah berarti menambah empat ubin dari jumlah sekarang.',
};

const algebra12: MicroLessonDefinition = {
  id: 'aljabar-aturan-di-balik-pola',
  number: '1.2',
  course: 'Aljabar',
  phase: 'Fase D',
  title: 'Aturan di Balik Pola',
  eyebrow: 'Tiga representasi, satu hubungan',
  prompt: 'Bisakah bentuk, tabel, dan rumus bergerak sebagai satu sistem?',
  invitation: 'Satu aturan an + b dapat terlihat sebagai susunan benda, baris tabel, dan nilai.',
  exploreInstruction: 'Edit a, n, atau b. Pola dan tabel berubah pada ketukan tombol yang sama.',
  predictPrompt: 'Tebak nilai keluaran sebelum menelusuri tabel.',
  manipulateInstruction: 'Ubah satu koefisien saja dan lihat bagian pola mana yang merespons.',
  assessmentPrompt: 'Berapa nilai an + b untuk pengaturan yang terlihat?',
  whyTitle: 'a mengulang, b menetap',
  why: 'Koefisien a menentukan banyaknya ubin pada setiap kelompok n. Konstanta b adalah ubin tetap yang tidak ikut tumbuh.',
  reflectionPrompt: 'Jika n bertambah dua tetapi a dan b tetap, berapa nilai keluarannya?',
  completionCopy: 'Sekarang kamu bisa membaca aturan yang sama melalui benda, tabel, dan simbol.',
  controls: [
    {
      key: 'a',
      label: 'Ubin per langkah',
      shortLabel: 'a',
      defaultValue: 2,
      min: 1,
      max: 5,
      step: 1,
    },
    { key: 'n', label: 'Nomor langkah', shortLabel: 'n', defaultValue: 3, min: 1, max: 8, step: 1 },
    { key: 'b', label: 'Ubin tetap', shortLabel: 'b', defaultValue: 1, min: 0, max: 6, step: 1 },
  ],
  predictionDefault: 6,
  answerDefault: 6,
  transferDefault: 11,
  buildModel: (values) => {
    const a = Math.round(values.a ?? 2);
    const n = Math.round(values.n ?? 3);
    const b = Math.round(values.b ?? 1);
    return signature('linear-rule', { a, n, b }, { output: a * n + b, transferN: n + 2 });
  },
  expectedAnswer: (model) => Number(model.metrics.output),
  expectedTransfer: (model) =>
    Number(model.values.a) * Number(model.metrics.transferN) + Number(model.values.b),
  hints: [
    'Cari kelompok yang berulang.',
    'Hitung a × n terlebih dahulu.',
    'Tambahkan b setelah seluruh kelompok dihitung.',
  ],
  transferHint: 'Gunakan n + 2 pada aturan yang sama; a dan b tidak berubah.',
};

const algebra13: MicroLessonDefinition = {
  id: 'aljabar-dari-kotak-ke-x',
  number: '1.3',
  course: 'Aljabar',
  phase: 'Fase D',
  title: 'Dari Kotak ke x',
  eyebrow: 'Nilai tak diketahui yang terasa nyata',
  prompt: 'Berapa isi kotak agar kedua sisi benar-benar seimbang?',
  invitation: 'Neraca membandingkan x + 3 dengan 8. Kandidatmu menggerakkan balok secara langsung.',
  exploreInstruction:
    'Ketik nilai x. Kemiringan neraca menunjukkan selisih sebelum kamu memeriksa jawaban.',
  predictPrompt: 'Tebak isi kotak yang akan membuat balok mendatar.',
  manipulateInstruction: 'Uji beberapa nilai dan dekati titik seimbang dari kedua arah.',
  assessmentPrompt: 'Nilai x berapa yang membuat x + 3 = 8?',
  whyTitle: 'Kesetaraan berarti bobot yang sama',
  why: 'Tiga unit sudah berada bersama x. Agar sama dengan 8, kita menghilangkan 3 dari kedua sisi: x = 8 − 3 = 5.',
  reflectionPrompt: 'Neraca baru menunjukkan x + 4 = 10. Berapa nilai x?',
  completionCopy: 'Huruf x kini bukan teka-teki—ia adalah nilai yang bisa diuji dan diseimbangkan.',
  controls: [
    {
      key: 'x',
      label: 'Kandidat isi kotak',
      shortLabel: 'x',
      defaultValue: 2,
      min: -4,
      max: 12,
      step: 1,
    },
  ],
  predictionDefault: 4,
  answerDefault: 4,
  transferDefault: 5,
  buildModel: (values) => {
    const x = values.x ?? 2;
    const left = x + 3;
    return signature(
      'balance',
      { x },
      { left, right: 8, difference: left - 8, balanced: Math.abs(left - 8) < 0.001 },
    );
  },
  expectedAnswer: () => 5,
  expectedTransfer: () => 6,
  hints: [
    'Perhatikan sisi mana yang turun.',
    'Pisahkan tiga unit tetap dari kotak x.',
    'Kurangi kedua sisi dengan 3.',
  ],
  transferHint: 'Lakukan operasi yang sama pada kedua sisi: 10 − 4.',
};

const algebra14: MicroLessonDefinition = {
  id: 'aljabar-cerita-menjadi-aljabar',
  number: '1.4',
  course: 'Aljabar',
  phase: 'Fase D',
  title: 'Cerita Menjadi Aljabar',
  eyebrow: 'Kompres benda menjadi simbol',
  prompt: 'Seberapa ringkas sebuah cerita dapat ditulis tanpa kehilangan makna?',
  invitation: 'Mesin ekspresi mengubah a kelompok x dan b unit lepas menjadi ax + b.',
  exploreInstruction: 'Edit a, x, dan b. Kelompok, unit, dan total berubah serempak.',
  predictPrompt: 'Tebak nilai semua benda sebelum mesin menghitungnya.',
  manipulateInstruction: 'Ubah koefisien dan konstanta. Temukan peran berbeda keduanya.',
  assessmentPrompt: 'Berapa nilai keseluruhan ekspresi ax + b yang terlihat?',
  whyTitle: 'Koefisien menghitung kelompok',
  why: 'a menyatakan banyak kelompok, x adalah nilai setiap kelompok, dan b adalah unit yang berdiri sendiri. Totalnya a × x + b.',
  reflectionPrompt: 'Jika nilai setiap kelompok naik satu, berapa total barunya?',
  completionCopy:
    'Kamu bisa bergerak dua arah: dari cerita ke ekspresi dan dari ekspresi kembali ke benda.',
  controls: [
    {
      key: 'a',
      label: 'Jumlah kelompok',
      shortLabel: 'a',
      defaultValue: 3,
      min: 1,
      max: 5,
      step: 1,
    },
    {
      key: 'x',
      label: 'Nilai tiap kelompok',
      shortLabel: 'x',
      defaultValue: 2,
      min: 1,
      max: 6,
      step: 1,
    },
    { key: 'b', label: 'Unit lepas', shortLabel: 'b', defaultValue: 2, min: 0, max: 6, step: 1 },
  ],
  predictionDefault: 7,
  answerDefault: 7,
  transferDefault: 10,
  buildModel: (values) => {
    const a = Math.round(values.a ?? 3);
    const x = Math.round(values.x ?? 2);
    const b = Math.round(values.b ?? 2);
    return signature('expression-machine', { a, x, b }, { total: a * x + b, transferX: x + 1 });
  },
  expectedAnswer: (model) => Number(model.metrics.total),
  expectedTransfer: (model) =>
    Number(model.values.a) * Number(model.metrics.transferX) + Number(model.values.b),
  hints: [
    'Hitung nilai satu kelompok.',
    'Ada a kelompok yang masing-masing bernilai x.',
    'Setelah a × x, tambahkan b unit lepas.',
  ],
  transferHint: 'Ganti x dengan x + 1, lalu gunakan a dan b yang sama.',
};

const calculus11: MicroLessonDefinition = {
  id: 'kalkulus-seberapa-cepat-berubah',
  number: '1.1',
  course: 'Kalkulus',
  phase: 'Fase F',
  title: 'Seberapa Cepat Berubah?',
  eyebrow: 'Gerak di antara dua saat',
  prompt: 'Apakah jarak saja cukup untuk mengatakan seberapa cepat sesuatu bergerak?',
  invitation: 'Mobil mengikuti s(t) = t². Dua waktu membentuk satu interval dan satu garis secan.',
  exploreInstruction: 'Ketik t₁ dan t₂. Posisi mobil, interval, dan kemiringan bergerak bersama.',
  predictPrompt: 'Tebak laju perubahan rata-rata pada interval yang terlihat.',
  manipulateInstruction:
    'Ubah lebar interval dan perhatikan garis secan menjadi lebih atau kurang curam.',
  assessmentPrompt: 'Berapa laju perubahan rata-rata s(t) = t² dari t₁ ke t₂?',
  whyTitle: 'Perubahan posisi dibagi perubahan waktu',
  why: 'Laju rata-rata adalah (s(t₂) − s(t₁)) ÷ (t₂ − t₁). Untuk s(t)=t², bentuk itu menyederhana menjadi t₁ + t₂.',
  reflectionPrompt:
    'Jika kedua waktu digeser satu detik ke depan dengan jarak interval tetap, berapa laju barunya?',
  completionCopy:
    'Sekarang kemiringan garis dan kecepatan rata-rata menceritakan perubahan yang sama.',
  controls: [
    {
      key: 't1',
      label: 'Waktu awal',
      shortLabel: 't₁',
      defaultValue: 1,
      min: 0,
      max: 6,
      step: 0.5,
    },
    {
      key: 't2',
      label: 'Waktu akhir',
      shortLabel: 't₂',
      defaultValue: 4,
      min: 0,
      max: 6,
      step: 0.5,
    },
  ],
  predictionDefault: 4,
  answerDefault: 4,
  transferDefault: 6,
  buildModel: (values) => {
    const t1 = values.t1 ?? 1;
    const t2 = values.t2 ?? 4;
    const collapsed = Math.abs(t2 - t1) < 1e-9;
    const rate = collapsed ? 2 * t1 : (t2 * t2 - t1 * t1) / (t2 - t1);
    return signature('average-rate', { t1, t2 }, { s1: t1 * t1, s2: t2 * t2, rate, collapsed });
  },
  expectedAnswer: (model) => Number(model.metrics.rate),
  expectedTransfer: (model) => Number(model.metrics.rate) + 2,
  hints: [
    'Cari perubahan posisi dan perubahan waktu.',
    'Hitung t₂² − t₁².',
    'Bagi perubahan posisi dengan t₂ − t₁; saat interval nol, baca keadaan limit.',
  ],
  transferHint: 'Menggeser kedua waktu satu detik menambah 2 pada t₁ + t₂.',
};

const calculus12: MicroLessonDefinition = {
  id: 'kalkulus-semakin-dekat',
  number: '1.2',
  course: 'Kalkulus',
  phase: 'Fase F',
  title: 'Semakin Dekat',
  eyebrow: 'Dari secan menuju tangen',
  prompt: 'Apa yang terjadi pada kemiringan ketika dua titik hampir menjadi satu?',
  invitation: 'Pada f(x)=x², titik kedua berada sejauh h dari titik pertama.',
  exploreInstruction:
    'Ketik h, termasuk 0. Garis secan berubah menjadi keadaan limit yang bermakna.',
  predictPrompt: 'Tebak kemiringan garis ketika titik kedua berada pada x + h.',
  manipulateInstruction:
    'Dekatkan h ke nol dari arah positif dan negatif. Amati satu nilai yang sama.',
  assessmentPrompt: 'Berapa kemiringan secan—atau limitnya saat h=0?',
  whyTitle: 'Lubang aljabar dapat ditutup oleh limit',
  why: 'Untuk h ≠ 0, kemiringannya ((x+h)²−x²)/h = 2x+h. Ketika h mendekati 0, nilainya mendekati 2x.',
  reflectionPrompt: 'Jika titik utama bergeser ke x + 1 dan h tetap, berapa kemiringan secannya?',
  completionCopy: 'Kamu melihat tangen lahir dari dua titik yang terus didekatkan.',
  controls: [
    {
      key: 'x',
      label: 'Titik utama',
      shortLabel: 'x',
      defaultValue: 2,
      min: -3,
      max: 3,
      step: 0.25,
    },
    {
      key: 'h',
      label: 'Jarak antartitik',
      shortLabel: 'h',
      defaultValue: 1,
      min: -4,
      max: 4,
      step: 0.25,
    },
  ],
  predictionDefault: 4,
  answerDefault: 4,
  transferDefault: 7,
  buildModel: (values) => {
    const x = values.x ?? 2;
    const h = values.h ?? 1;
    const limitState = Math.abs(h) < 1e-9;
    return signature('secant-limit', { x, h }, { secondX: x + h, slope: 2 * x + h, limitState });
  },
  expectedAnswer: (model) => Number(model.metrics.slope),
  expectedTransfer: (model) => Number(model.metrics.slope) + 2,
  hints: [
    'Bandingkan tinggi kedua titik.',
    'Kembangkan (x + h)² lalu kurangi x².',
    'Untuk h=0 gunakan nilai yang didekati 2x, bukan membagi dengan nol.',
  ],
  transferHint: 'Mengganti x dengan x + 1 menambah 2 pada 2x + h.',
};

const calculus13: MicroLessonDefinition = {
  id: 'kalkulus-kecepatan-pada-satu-saat',
  number: '1.3',
  course: 'Kalkulus',
  phase: 'Fase F',
  title: 'Kecepatan pada Satu Saat',
  eyebrow: 'Tangen menjadi speedometer',
  prompt: 'Bagaimana grafik posisi mengetahui kecepatan tepat sekarang?',
  invitation: 'Pada s(t)=t², garis tangen, mobil, dan speedometer membaca saat yang sama.',
  exploreInstruction:
    'Ketik waktu t. Titik posisi, tangen, dan jarum kecepatan merespons langsung.',
  predictPrompt: 'Tebak kecepatan sesaat pada waktu yang terlihat.',
  manipulateInstruction: 'Geser waktu. Bandingkan pertumbuhan posisi dengan pertumbuhan kecepatan.',
  assessmentPrompt: 'Berapa kecepatan sesaat pada waktu t?',
  whyTitle: 'Turunan posisi adalah kecepatan',
  why: 'Kemiringan tangen s(t)=t² pada waktu t adalah 2t. Itulah kecepatan sesaat yang dibaca speedometer.',
  reflectionPrompt: 'Satu detik setelah waktu ini, berapa kecepatan sesaatnya?',
  completionCopy:
    'Kamu menghubungkan gerak nyata, kemiringan grafik, dan turunan dalam satu pandangan.',
  controls: [
    { key: 't', label: 'Waktu', shortLabel: 't', defaultValue: 3, min: 0, max: 6, step: 0.25 },
  ],
  predictionDefault: 5,
  answerDefault: 5,
  transferDefault: 8,
  buildModel: (values) => {
    const t = values.t ?? 3;
    return signature('instant-speed', { t }, { position: t * t, speed: 2 * t, transferT: t + 1 });
  },
  expectedAnswer: (model) => Number(model.metrics.speed),
  expectedTransfer: (model) => 2 * Number(model.metrics.transferT),
  hints: [
    'Lihat angka pada speedometer dan kemiringan tangen.',
    'Untuk s(t)=t², laju perubahan bertambah dua setiap detik.',
    'Gunakan turunan 2t.',
  ],
  transferHint: 'Ganti t dengan t + 1 pada 2t.',
};

const calculus14: MicroLessonDefinition = {
  id: 'kalkulus-turunan-adalah-fungsi',
  number: '1.4',
  course: 'Kalkulus',
  phase: 'Fase F',
  title: 'Turunan adalah Fungsi',
  eyebrow: 'Satu kurva menggambar kurva lain',
  prompt: 'Bagaimana setiap kemiringan pada kurva dapat menjadi grafik baru?',
  invitation: 'Edit f(x)=ax²+bx+c. Di bawahnya, kemiringan menelusuri f′(x)=2ax+b.',
  exploreInstruction: 'Ketik a, b, c, atau x. Kurva, tangen, dan grafik turunan bergerak serempak.',
  predictPrompt: 'Tebak kemiringan tangen pada x yang terlihat.',
  manipulateInstruction: 'Ubah c lalu a. Temukan koefisien yang mengubah turunan dan yang tidak.',
  assessmentPrompt: 'Berapa nilai f′(x) pada titik yang terlihat?',
  whyTitle: 'Turunan mencatat kemiringan di setiap x',
  why: 'Turunan ax²+bx+c adalah 2ax+b. Konstanta c menggeser kurva ke atas atau bawah tanpa mengubah kemiringannya.',
  reflectionPrompt: 'Pada x + 1 dengan fungsi yang sama, berapa nilai turunannya?',
  completionCopy:
    'Kamu melihat turunan bukan sebagai satu angka, melainkan fungsi yang memetakan semua kemiringan.',
  controls: [
    {
      key: 'a',
      label: 'Koefisien kuadrat',
      shortLabel: 'a',
      defaultValue: 1,
      min: -2,
      max: 2,
      step: 0.25,
    },
    {
      key: 'b',
      label: 'Koefisien linear',
      shortLabel: 'b',
      defaultValue: 0,
      min: -4,
      max: 4,
      step: 0.5,
    },
    { key: 'c', label: 'Konstanta', shortLabel: 'c', defaultValue: 0, min: -4, max: 4, step: 0.5 },
    {
      key: 'x',
      label: 'Titik yang ditelusuri',
      shortLabel: 'x',
      defaultValue: 2,
      min: -3,
      max: 3,
      step: 0.25,
    },
  ],
  predictionDefault: 3,
  answerDefault: 3,
  transferDefault: 6,
  buildModel: (values) => {
    const a = values.a ?? 1;
    const b = values.b ?? 0;
    const c = values.c ?? 0;
    const x = values.x ?? 2;
    return signature(
      'quadratic-derivative',
      { a, b, c, x },
      { y: a * x * x + b * x + c, derivative: 2 * a * x + b, transferX: x + 1 },
    );
  },
  expectedAnswer: (model) => Number(model.metrics.derivative),
  expectedTransfer: (model) =>
    2 * Number(model.values.a) * Number(model.metrics.transferX) + Number(model.values.b),
  hints: [
    'Kemiringan dibaca oleh grafik turunan di x yang sama.',
    'Konstanta c tidak memengaruhi kemiringan.',
    'Gunakan 2ax + b.',
  ],
  transferHint: 'Ganti x dengan x + 1 dalam 2ax + b; a dan b tetap.',
};

const lessons = {
  'aljabar-pola-yang-tumbuh': algebra11,
  'aljabar-aturan-di-balik-pola': algebra12,
  'aljabar-dari-kotak-ke-x': algebra13,
  'aljabar-cerita-menjadi-aljabar': algebra14,
  'kalkulus-seberapa-cepat-berubah': calculus11,
  'kalkulus-semakin-dekat': calculus12,
  'kalkulus-kecepatan-pada-satu-saat': calculus13,
  'kalkulus-turunan-adalah-fungsi': calculus14,
} satisfies Readonly<Record<MicroLessonId, MicroLessonDefinition>>;

export function getMicroLesson(id: string): MicroLessonDefinition | undefined {
  return lessons[id as MicroLessonId];
}

export const MICRO_LESSONS = Object.values(lessons);
