/**
 * Kebijakan privasi (US6 spec 002, FR-013–FR-015).
 *
 * Bahasa non-teknis, ditulis untuk dibaca siswa SMP maupun orang tua —
 * bukan untuk pengacara. Isinya HARUS tetap sinkron dengan data yang
 * benar-benar disimpan aplikasi; lihat audit di
 * specs/002-production-readiness/quickstart.md § V-5 sebelum mengubah bagian
 * "Data yang kami simpan" di bawah.
 */

export interface PrivacySection {
  judul: string;
  paragraf: string[];
}

export const PRIVACY_LAST_UPDATED = '2026-08-11';

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    judul: 'Data yang kami simpan',
    paragraf: [
      'Lumera menyimpan tiga jenis data, semuanya hanya di perangkatmu sendiri (localStorage peramban) — bukan di server kami:',
      '1. Profil belajar: nama tampilan yang kamu pilih sendiri, jenjang, tujuan belajar, dan preferensi ritme belajar.',
      '2. Progres belajar: Lumens, rangkaian hari belajar (streak), dan persentase penguasaan tiap modul.',
      '3. Catatan aktivitas belajar: konsep yang dipelajari, jenis kesalahan saat mengerjakan, dan waktu pengerjaan — dipakai untuk membuatkan rencana belajar yang sesuai.',
      'Kami TIDAK meminta atau menyimpan email, nomor telepon, alamat, maupun data pribadi lain yang tidak berkaitan langsung dengan pengalaman belajarmu.',
    ],
  },
  {
    judul: 'Kenapa data ini disimpan di perangkatmu, bukan di server',
    paragraf: [
      'Lumera saat ini tidak punya akun atau server yang menyimpan datamu — semuanya hidup di peramban perangkat yang kamu pakai. Artinya progresmu tidak otomatis muncul di perangkat lain, tapi juga berarti kami tidak bisa membaca atau membagikan datamu ke pihak manapun, karena datanya memang tidak pernah sampai ke kami.',
    ],
  },
  {
    judul: 'Kapan data meninggalkan perangkatmu',
    paragraf: [
      'Ada satu pengecualian: jika terjadi error teknis saat kamu memakai aplikasi, kami menerima laporan error otomatis (lewat layanan pemantauan pihak ketiga) agar bisa memperbaikinya. Laporan ini HANYA berisi pesan error, halaman yang sedang dibuka, dan versi aplikasi — tidak pernah nama tampilanmu, progresmu, atau data lain yang tersimpan di perangkatmu.',
      // FR-018 (keputusan cakupan ekspor 2026-08-11, T052): berkas ekspor memuat
      // nama tampilan. Siswa/orang tua MUST tahu itu SEBELUM memutuskan
      // membagikan berkasnya — kalimat ini dikunci oleh test agar tidak hilang
      // dalam satu edit copy, pola yang sama dengan FR-020 di T044.
      'Satu hal lagi yang perlu kamu tahu: kalau kamu memakai fitur "Ekspor progres" di Pengaturan, berkas yang terunduh itu memuat nama tampilanmu, preferensi belajarmu, dan seluruh progresmu. Berkas itu milikmu dan tersimpan di perangkatmu sendiri — kami tidak menerima salinannya. Tapi karena namamu ada di dalamnya, pikirkan dulu sebelum mengirimkan berkas itu ke orang lain.',
    ],
  },
  {
    judul: 'Kendali penuh ada di tanganmu',
    paragraf: [
      'Kamu bisa menghapus seluruh data di atas kapan saja lewat menu Pengaturan → "Hapus semua data saya". Sekali dihapus, data tersebut tidak dapat dipulihkan kecuali kamu sudah mengekspornya lebih dulu ke berkas cadangan.',
    ],
  },
  {
    judul: 'Untuk siapa Lumera dibuat',
    paragraf: [
      'Lumera Core ditujukan untuk pelajar SMP, SMA, dan persiapan UTBK/SNBT — banyak di antaranya berusia di bawah 18 tahun. Karena itu kami sengaja membatasi data yang dikumpulkan pada yang benar-benar perlu untuk belajar, dan tidak pernah meminta data yang tidak berkaitan langsung dengan itu.',
    ],
  },
];
