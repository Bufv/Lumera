import type { IconName } from '../design/Icon';
import type { NamaRona } from '../design/tokens';
import type { Siswa } from '../progress/store';

/**
 * Katalog kurikulum.
 *
 * Hierarkinya mengikuti arsitektur informasi di `docs/sample/brilliant/`:
 *
 *     Jalur  →  Kursus  →  Level  →  Pelajaran
 *
 * Jalur adalah baris di halaman Belajar; kursus adalah ubin persegi berantai di
 * dalamnya; level adalah kepala lengket di halaman kursus; pelajaran adalah
 * simpul yang berkelok di bawahnya.
 *
 * Aturan yang mengikat seluruh berkas ini:
 *   Pelajaran tanpa `moduleId`, atau yang `moduleId`-nya tidak ada di registry,
 *   TIDAK PERNAH bisa diklik. Ia tampil sebagai rencana bertanda "Sedang
 *   disiapkan" — bukan tombol mati yang berpura-pura bisa ditekan (PRD §14).
 *
 * Semua persentase hanya dihitung dari pelajaran yang benar-benar ada.
 */

export type JenisPelajaran = 'pelajari' | 'cek-level';

export interface PelajaranKatalog {
  id: string;
  judul: string;
  ringkas: string;
  /** Perkiraan durasi dari naskah kurikulum, [min, maks] menit. */
  menit: [number, number];
  jenis: JenisPelajaran;
  /** Id modul di shell/registry. Kosong = naskahnya belum ditulis. */
  moduleId?: string;
}

export interface LevelKatalog {
  id: string;
  judul: string;
  /** Konsep yang dikuasai di level ini. */
  konsep: string[];
  pelajaran: PelajaranKatalog[];
}

export interface KursusKatalog {
  id: string;
  /** Menghubungkan kursus ke node Peta Ilmu (atlas/subject-worlds). */
  subjectWorldId: string;
  judul: string;
  ringkas: string;
  /** Lencana kecil di pojok ubin, mis. "KLS VIII". */
  kelas: string;
  ikon: IconName;
  level: LevelKatalog[];
}

export interface JalurKatalog {
  id: string;
  judul: string;
  ringkas: string;
  /** Eyebrow di atas judul jalur, mis. "SMP KELAS VII–IX". */
  jenjang: string;
  jenjangKelompok: 'SMP' | 'SMA';
  hue: NamaRona;
  ikon: IconName;
  kursus: KursusKatalog[];
}

/* --------------------------------------------------------------- isi katalog */

const CEK_MENIT: [number, number] = [8, 12];

export const KATALOG: JalurKatalog[] = [
  {
    id: 'matematika-dasar',
    judul: 'Matematika Dasar',
    ringkas: 'Bangun dasar bilangan dan aljabar yang dipakai di semua mapel lain.',
    jenjang: 'SMP Kelas VII–IX',
    jenjangKelompok: 'SMP',
    hue: 'violet',
    ikon: 'math',
    kursus: [
      {
        id: 'kemiringan-garis',
        subjectWorldId: 'matematika',
        judul: 'Kemiringan dan Garis Lurus',
        ringkas: 'Membaca grafik garis lurus dan memahami arti kemiringannya.',
        kelas: 'Kls VIII',
        ikon: 'math',
        level: [
          {
            id: 'membaca-garis',
            judul: 'Membaca Garis',
            konsep: ['Kemiringan garis', 'Gradien linear', 'Arah garis'],
            pelajaran: [
              {
                id: 'kemiringan-01',
                judul: 'Membaca Kemiringan Grafik',
                ringkas: 'Menelusuri garis dan menentukan kemiringannya lewat simulasi.',
                menit: [6, 10],
                jenis: 'pelajari',
                moduleId: 'math-slope',
              },
              {
                id: 'kemiringan-02',
                judul: 'Gradien dari Dua Titik',
                ringkas: 'Menghitung gradien ketika hanya dua titik yang diketahui.',
                menit: [6, 8],
                jenis: 'pelajari',
              },
              {
                id: 'kemiringan-03',
                judul: 'Naik, Turun, dan Datar',
                ringkas: 'Membedakan gradien positif, negatif, dan nol dari bentuk garis.',
                menit: [5, 8],
                jenis: 'pelajari',
              },
              {
                id: 'kemiringan-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang membaca kemiringan.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
          {
            id: 'persamaan-garis',
            judul: 'Persamaan Garis',
            konsep: ['Bentuk y = mx + c', 'Titik potong sumbu', 'Menggambar garis'],
            pelajaran: [
              {
                id: 'persamaan-01',
                judul: 'Mengenal Bentuk y = mx + c',
                ringkas: 'Memahami peran m dan c pada persamaan garis.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'persamaan-02',
                judul: 'Menggambar Garis dari Persamaan',
                ringkas: 'Mengubah persamaan menjadi garis pada bidang koordinat.',
                menit: [7, 10],
                jenis: 'pelajari',
              },
              {
                id: 'persamaan-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang persamaan garis.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
      {
        id: 'bilangan-operasi',
        subjectWorldId: 'matematika',
        judul: 'Bilangan dan Operasinya',
        ringkas: 'Memahami bilangan bulat, pecahan, dan cara mengoperasikannya.',
        kelas: 'Kls VII',
        ikon: 'grid',
        level: [
          {
            id: 'bilangan-bulat',
            judul: 'Bilangan di Bawah Nol',
            konsep: ['Positif dan negatif', 'Garis bilangan', 'Nilai mutlak'],
            pelajaran: [
              {
                id: 'bilangan-01',
                judul: 'Mengapa Ada Bilangan Negatif?',
                ringkas: 'Menemukan bilangan negatif dalam situasi sehari-hari.',
                menit: [5, 7],
                jenis: 'pelajari',
              },
              {
                id: 'bilangan-02',
                judul: 'Menempatkan Bilangan pada Garis',
                ringkas: 'Membaca posisi bilangan pada garis bilangan.',
                menit: [6, 8],
                jenis: 'pelajari',
              },
              {
                id: 'bilangan-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang bilangan bulat.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
      {
        id: 'perbandingan-skala',
        subjectWorldId: 'matematika',
        judul: 'Perbandingan dan Skala',
        ringkas: 'Membaca perbandingan, laju, dan skala peta.',
        kelas: 'Kls VII',
        ikon: 'target',
        level: [
          {
            id: 'perbandingan-dasar',
            judul: 'Membaca Perbandingan',
            konsep: ['Rasio', 'Laju', 'Skala'],
            pelajaran: [
              {
                id: 'perbandingan-01',
                judul: 'Apa Itu Perbandingan?',
                ringkas: 'Menyatakan hubungan dua besaran sebagai perbandingan.',
                menit: [5, 8],
                jenis: 'pelajari',
              },
              {
                id: 'perbandingan-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang perbandingan.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sains-terapan',
    judul: 'Sains Terapan',
    ringkas: 'Amati gejala alam lewat simulasi, lalu terjemahkan jadi angka.',
    jenjang: 'SMP Kelas VII–IX',
    jenjangKelompok: 'SMP',
    hue: 'green',
    ikon: 'science',
    kursus: [
      {
        id: 'gerak-benda',
        subjectWorldId: 'sains',
        judul: 'Gerak dan Perubahannya',
        ringkas: 'Mengamati gerak benda dan menghubungkannya dengan angka.',
        kelas: 'Kls VIII',
        ikon: 'science',
        level: [
          {
            id: 'gerak-lurus',
            judul: 'Gerak Lurus',
            konsep: ['GLBB', 'Jarak tempuh', 'Percepatan'],
            pelajaran: [
              {
                id: 'gerak-01',
                judul: 'Simulasi Gerak Lurus',
                ringkas: 'Menjalankan simulasi dan menghitung jarak yang ditempuh.',
                menit: [6, 10],
                jenis: 'pelajari',
                moduleId: 'physics-motion',
              },
              {
                id: 'gerak-02',
                judul: 'Kecepatan dan Percepatan',
                ringkas: 'Membedakan seberapa cepat dan seberapa cepat bertambah cepat.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'gerak-03',
                judul: 'Membaca Grafik Gerak',
                ringkas: 'Membaca cerita gerak dari grafik jarak dan kecepatan.',
                menit: [7, 10],
                jenis: 'pelajari',
              },
              {
                id: 'gerak-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang gerak lurus.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
      {
        id: 'energi-sekitar',
        subjectWorldId: 'sains',
        judul: 'Energi di Sekitar Kita',
        ringkas: 'Menelusuri perubahan bentuk energi dalam kehidupan sehari-hari.',
        kelas: 'Kls VII',
        ikon: 'sparkles',
        level: [
          {
            id: 'bentuk-energi',
            judul: 'Bentuk dan Perubahan Energi',
            konsep: ['Energi kinetik', 'Energi potensial', 'Kekekalan energi'],
            pelajaran: [
              {
                id: 'energi-01',
                judul: 'Energi Tidak Hilang',
                ringkas: 'Melacak ke mana perginya energi saat benda bergerak.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'energi-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang energi.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
      {
        id: 'zat-wujud',
        subjectWorldId: 'sains',
        judul: 'Zat dan Wujudnya',
        ringkas: 'Memahami partikel penyusun zat dan perubahan wujudnya.',
        kelas: 'Kls VII',
        ikon: 'brain',
        level: [
          {
            id: 'partikel',
            judul: 'Partikel Penyusun Zat',
            konsep: ['Padat, cair, gas', 'Perubahan wujud', 'Suhu dan kalor'],
            pelajaran: [
              {
                id: 'zat-01',
                judul: 'Apa yang Terjadi Saat Mendidih?',
                ringkas: 'Mengamati perilaku partikel saat wujud zat berubah.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'zat-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang wujud zat.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'ekonomi-keputusan',
    judul: 'Ekonomi dan Keputusan',
    ringkas: 'Lihat bagaimana harga terbentuk dan keputusan ekonomi diambil.',
    jenjang: 'SMA Kelas X–XI',
    jenjangKelompok: 'SMA',
    hue: 'amber',
    ikon: 'bar-chart',
    kursus: [
      {
        id: 'pasar-dan-harga',
        subjectWorldId: 'ekonomi',
        judul: 'Pasar dan Harga',
        ringkas: 'Melihat bagaimana harga terbentuk dari tarik-menarik pasar.',
        kelas: 'Kls X',
        ikon: 'bar-chart',
        level: [
          {
            id: 'permintaan-penawaran',
            judul: 'Permintaan dan Penawaran',
            konsep: ['Kurva permintaan', 'Kurva penawaran', 'Ekuilibrium pasar'],
            pelajaran: [
              {
                id: 'pasar-01',
                judul: 'Supply & Demand Simulator',
                ringkas: 'Mengubah variabel pasar dan menemukan harga keseimbangan.',
                menit: [7, 11],
                jenis: 'pelajari',
                moduleId: 'econ-supply-demand',
              },
              {
                id: 'pasar-02',
                judul: 'Ketika Kurva Bergeser',
                ringkas: 'Menelusuri penyebab kurva bergeser dan akibatnya.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'pasar-03',
                judul: 'Harga Keseimbangan',
                ringkas: 'Menjelaskan mengapa pasar kembali ke titik keseimbangan.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'pasar-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang pasar dan harga.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
      {
        id: 'uang-perbankan',
        subjectWorldId: 'ekonomi',
        judul: 'Uang dan Perbankan',
        ringkas: 'Memahami peran uang, bank, dan bunga dalam perekonomian.',
        kelas: 'Kls X',
        ikon: 'target',
        level: [
          {
            id: 'fungsi-uang',
            judul: 'Fungsi Uang',
            konsep: ['Alat tukar', 'Nilai waktu uang', 'Bunga'],
            pelajaran: [
              {
                id: 'uang-01',
                judul: 'Kenapa Uang Bernilai?',
                ringkas: 'Menelusuri alasan sepotong kertas bisa dipakai bertransaksi.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'uang-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang uang.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sejarah-nalar',
    judul: 'Sejarah dan Nalar Sosial',
    ringkas: 'Latih cara membaca peristiwa: apa sebabnya, apa akibatnya.',
    jenjang: 'SMA Kelas XI–XII',
    jenjangKelompok: 'SMA',
    hue: 'blue',
    ikon: 'globe',
    kursus: [
      {
        id: 'sebab-akibat',
        subjectWorldId: 'sejarah',
        judul: 'Membaca Sebab dan Akibat',
        ringkas: 'Menyusun peristiwa sejarah menjadi rantai sebab-akibat yang utuh.',
        kelas: 'Kls XI',
        ikon: 'globe',
        level: [
          {
            id: 'rantai-peristiwa',
            judul: 'Rantai Peristiwa',
            konsep: ['Sebab-akibat sejarah', 'Tanam paksa', 'Politik etis'],
            pelajaran: [
              {
                id: 'sejarah-01',
                judul: 'Rantai Sebab-Akibat',
                ringkas: 'Menyusun urutan sebab-akibat sebuah peristiwa sejarah.',
                menit: [7, 11],
                jenis: 'pelajari',
                moduleId: 'history-causal-chain',
              },
              {
                id: 'sejarah-02',
                judul: 'Tanam Paksa dan Dampaknya',
                ringkas: 'Menelusuri akibat panjang sebuah kebijakan kolonial.',
                menit: [7, 10],
                jenis: 'pelajari',
              },
              {
                id: 'sejarah-03',
                judul: 'Lahirnya Politik Etis',
                ringkas: 'Menghubungkan kritik masyarakat dengan perubahan kebijakan.',
                menit: [6, 9],
                jenis: 'pelajari',
              },
              {
                id: 'sejarah-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang rantai sebab-akibat.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
      {
        id: 'masa-kolonial',
        subjectWorldId: 'sejarah',
        judul: 'Indonesia Masa Kolonial',
        ringkas: 'Menelusuri perubahan masyarakat Indonesia di bawah kolonialisme.',
        kelas: 'Kls XI',
        ikon: 'book',
        level: [
          {
            id: 'kolonial-awal',
            judul: 'Datangnya Kekuasaan Asing',
            konsep: ['VOC', 'Monopoli dagang', 'Perlawanan daerah'],
            pelajaran: [
              {
                id: 'kolonial-01',
                judul: 'Dari Dagang Menjadi Kuasa',
                ringkas: 'Melihat bagaimana kongsi dagang berubah jadi penguasa.',
                menit: [7, 10],
                jenis: 'pelajari',
              },
              {
                id: 'kolonial-cek',
                judul: 'Cek Level',
                ringkas: 'Menguji pemahamanmu tentang masa kolonial awal.',
                menit: CEK_MENIT,
                jenis: 'cek-level',
              },
            ],
          },
        ],
      },
    ],
  },
];

/** Mapel yang belum punya jalur sama sekali. */
export const MAPEL_MENYUSUL: {
  nama: string;
  ringkas: string;
  ikon: IconName;
  status: 'Sedang disiapkan' | 'Dalam pengembangan';
  hue: NamaRona;
}[] = [
  {
    nama: 'Bahasa Indonesia',
    ringkas: 'Mengembangkan kemampuan berbahasa dan bernalar.',
    ikon: 'book',
    status: 'Dalam pengembangan',
    hue: 'amber',
  },
  {
    nama: 'Bahasa Inggris',
    ringkas: 'Meningkatkan kemampuan berkomunikasi global.',
    ikon: 'globe',
    status: 'Sedang disiapkan',
    hue: 'blue',
  },
  {
    nama: 'Informatika',
    ringkas: 'Memahami teknologi informasi dan cara kerjanya.',
    ikon: 'code',
    status: 'Dalam pengembangan',
    hue: 'violet',
  },
  {
    nama: 'Literasi Finansial',
    ringkas: 'Mengelola uang dengan bijak untuk masa depan.',
    ikon: 'target',
    status: 'Sedang disiapkan',
    hue: 'green',
  },
];

/* ------------------------------------------------------- turunan untuk layar */

/**
 * `disiapkan` sengaja tidak sama dengan `terkunci`. Terkunci berarti "ada, tapi
 * belum boleh dibuka"; disiapkan berarti "belum ada". Katalog ini hanya pernah
 * menghasilkan yang kedua — tidak ada pelajaran yang dikunci di balik pelajaran
 * lain pada prototype ini.
 */
export type StatusPelajaran = 'selesai' | 'sedang' | 'terbuka' | 'disiapkan';

export interface PelajaranTampil extends PelajaranKatalog {
  /** Nomor urut dalam levelnya, mulai dari 1. */
  no: number;
  status: StatusPelajaran;
  /** null bila belum dibangun — bukan 0, supaya tidak ikut dirata-rata. */
  masteryPersen: number | null;
  bisaDibuka: boolean;
}

export interface LevelTampil extends Omit<LevelKatalog, 'pelajaran'> {
  /** Nomor level dalam kursusnya, mulai dari 1. */
  urutan: number;
  pelajaran: PelajaranTampil[];
  persen: number;
  jumlahSelesai: number;
  jumlahTersedia: number;
  jumlahDisiapkan: number;
}

export interface KursusTampil extends Omit<KursusKatalog, 'level'> {
  level: LevelTampil[];
  persen: number;
  jumlahSelesai: number;
  jumlahTersedia: number;
  jumlahDisiapkan: number;
  totalPelajaran: number;
  totalKonsep: number;
  totalMenit: [number, number];
  /** Pelajaran yang wajar dibuka berikutnya, atau null bila belum ada. */
  berikutnya: PelajaranTampil | null;
}

export interface JalurTampil extends Omit<JalurKatalog, 'kursus'> {
  kursus: KursusTampil[];
  persen: number;
  jumlahTersedia: number;
  /** true bila siswa sudah mengerjakan sesuatu di jalur ini. */
  sudahDimulai: boolean;
}

function statusPelajaran(
  pelajaran: PelajaranKatalog,
  siswa: Siswa,
  terdaftar: ReadonlySet<string>,
): { status: StatusPelajaran; masteryPersen: number | null; bisaDibuka: boolean } {
  if (!pelajaran.moduleId || !terdaftar.has(pelajaran.moduleId)) {
    return { status: 'disiapkan', masteryPersen: null, bisaDibuka: false };
  }

  const catatan = siswa.mastery.find((m) => m.moduleId === pelajaran.moduleId);
  const persen = catatan?.masteryPersen ?? 0;

  if (siswa.modulSelesai.includes(pelajaran.moduleId)) {
    return { status: 'selesai', masteryPersen: persen, bisaDibuka: true };
  }
  return { status: persen > 0 ? 'sedang' : 'terbuka', masteryPersen: persen, bisaDibuka: true };
}

function rataRata(nilai: number[]): number {
  if (nilai.length === 0) return 0;
  return Math.round(nilai.reduce((a, b) => a + b, 0) / nilai.length);
}

/**
 * Menggabungkan katalog statis dengan progres siswa dan isi registry.
 * `terdaftar` disuntikkan (bukan dibaca langsung dari registry) supaya fungsi
 * ini tetap murni dan bisa diuji tanpa mendaftarkan modul sungguhan.
 */
export function susunKursus(
  kursus: KursusKatalog,
  siswa: Siswa,
  terdaftar: ReadonlySet<string>,
): KursusTampil {
  const level: LevelTampil[] = kursus.level.map((lv, indeks) => {
    const pelajaran: PelajaranTampil[] = lv.pelajaran.map((p, i) => ({
      ...p,
      no: i + 1,
      ...statusPelajaran(p, siswa, terdaftar),
    }));

    const tersedia = pelajaran.filter((p) => p.bisaDibuka);
    return {
      ...lv,
      urutan: indeks + 1,
      pelajaran,
      persen: rataRata(tersedia.map((p) => p.masteryPersen ?? 0)),
      jumlahSelesai: pelajaran.filter((p) => p.status === 'selesai').length,
      jumlahTersedia: tersedia.length,
      jumlahDisiapkan: pelajaran.length - tersedia.length,
    };
  });

  const semua = level.flatMap((lv) => lv.pelajaran);
  const tersedia = semua.filter((p) => p.bisaDibuka);
  const berikutnya =
    tersedia.find((p) => p.status === 'sedang') ??
    tersedia.find((p) => p.status === 'terbuka') ??
    tersedia[tersedia.length - 1] ??
    null;

  return {
    ...kursus,
    level,
    persen: rataRata(tersedia.map((p) => p.masteryPersen ?? 0)),
    jumlahSelesai: semua.filter((p) => p.status === 'selesai').length,
    jumlahTersedia: tersedia.length,
    jumlahDisiapkan: semua.length - tersedia.length,
    totalPelajaran: semua.length,
    totalKonsep: level.reduce((total, lv) => total + lv.konsep.length, 0),
    totalMenit: [
      semua.reduce((total, p) => total + p.menit[0], 0),
      semua.reduce((total, p) => total + p.menit[1], 0),
    ],
    berikutnya,
  };
}

export function susunJalur(
  jalur: JalurKatalog,
  siswa: Siswa,
  terdaftar: ReadonlySet<string>,
): JalurTampil {
  const kursus = jalur.kursus.map((k) => susunKursus(k, siswa, terdaftar));
  const tersedia = kursus.filter((k) => k.jumlahTersedia > 0);

  return {
    ...jalur,
    kursus,
    persen: rataRata(tersedia.map((k) => k.persen)),
    jumlahTersedia: kursus.reduce((total, k) => total + k.jumlahTersedia, 0),
    sudahDimulai: kursus.some((k) => k.persen > 0),
  };
}

export function susunKatalog(
  siswa: Siswa,
  terdaftar: ReadonlySet<string>,
  katalog: JalurKatalog[] = KATALOG,
): JalurTampil[] {
  return katalog.map((jalur) => susunJalur(jalur, siswa, terdaftar));
}

/**
 * Memisahkan "Jalur belajarmu" dari "Jalur lainnya". Jalur masuk kelompok
 * pertama kalau sudah dikerjakan; kalau belum ada satu pun yang dikerjakan,
 * jalur yang punya pelajaran siap dipakai sebagai titik mulai.
 */
export function bagiJalur(daftar: JalurTampil[]): { milikmu: JalurTampil[]; lainnya: JalurTampil[] } {
  const dimulai = daftar.filter((j) => j.sudahDimulai);
  if (dimulai.length > 0) {
    return { milikmu: dimulai, lainnya: daftar.filter((j) => !j.sudahDimulai) };
  }

  const siap = daftar.filter((j) => j.jumlahTersedia > 0);
  return siap.length > 0
    ? { milikmu: siap, lainnya: daftar.filter((j) => j.jumlahTersedia === 0) }
    : { milikmu: [], lainnya: daftar };
}

export function semuaKursus(katalog: JalurKatalog[] = KATALOG): KursusKatalog[] {
  return katalog.flatMap((j) => j.kursus);
}

export function ambilKursus(id: string, katalog: JalurKatalog[] = KATALOG): KursusKatalog | null {
  return semuaKursus(katalog).find((k) => k.id === id) ?? null;
}

export function jalurUntukKursus(
  kursusId: string,
  katalog: JalurKatalog[] = KATALOG,
): JalurKatalog | null {
  return katalog.find((j) => j.kursus.some((k) => k.id === kursusId)) ?? null;
}

export function kursusUntukModul(
  moduleId: string,
  katalog: JalurKatalog[] = KATALOG,
): KursusKatalog | null {
  return (
    semuaKursus(katalog).find((k) =>
      k.level.some((lv) => lv.pelajaran.some((p) => p.moduleId === moduleId)),
    ) ?? null
  );
}

export function labelMenit([min, maks]: [number, number]): string {
  return min === maks ? `${min} menit` : `${min}–${maks} menit`;
}
