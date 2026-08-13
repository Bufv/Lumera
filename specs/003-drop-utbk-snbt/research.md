# Phase 0 Research: Drop UTBK/SNBT dari Lumera Core

Tidak ada `NEEDS CLARIFICATION` di Technical Context plan.md — semua keputusan teknis diturunkan
langsung dari investigasi repositori di bawah ini. Dokumen ini merangkum temuan yang membentuk
Phase 1 design, bukan mengonfirmasi pilihan teknologi baru (tidak ada).

## R-001: Apakah modul pelajaran UTBK pernah dibangun secara fungsional?

- **Decision**: Tidak. Tidak ada perubahan kode modul yang diperlukan untuk "membongkar" modul
  UTBK, karena modul tersebut tidak pernah ada.
- **Rationale**: `src/modules/index.ts` (registry produksi, lazy-loaded) hanya mendaftarkan 4
  modul: `math-slope`, `physics-motion`, `econ-supply-demand`, `history-causal-chain`. Tidak ada
  entri `utbk-*` atau modul penalaran kuantitatif di `src/modules/`.
  `specs/001-core-mvp-prototype/tasks.md` (baris 40) secara eksplisit mencatat: *"TIDAK dibangun
  di iterasi ini: US6 (Bahasa) dan US7 (UTBK — Penalaran Kuantitatif)"*.
- **Alternatives considered**: N/A — ini temuan faktual, bukan keputusan desain.

## R-002: Apakah Lumera Atlas (kode) sudah menampilkan node "UTBK/SNBT"?

- **Decision**: Tidak — `src/atlas/subject-worlds.ts` sudah HANYA berisi 4 subject world yang
  punya modul terbangun (Matematika, Sains, Ekonomi & Bisnis, Sejarah & Sosial). Tidak ada entri
  "Bahasa & Komunikasi" maupun "UTBK/SNBT" di array `SUBJECT_WORLDS`.
- **Rationale**: FR-001 spec.md ("Atlas MUST NOT menampilkan node UTBK/SNBT") sudah terpenuhi oleh
  kode saat ini. Task implementasi untuk FR-001 karenanya adalah **verifikasi/regression test**,
  bukan perubahan kode — mencegah regresi di masa depan (mis. saat modul Bahasa akhirnya dibangun
  dan seseorang menambahkan node UTBK sekalian secara tidak sengaja).
- **Alternatives considered**: Menulis ulang `subject-worlds.ts` — ditolak, tidak ada yang perlu
  diubah; melakukan itu berisiko menyentuh kode yang sudah benar tanpa manfaat.

## R-003: Di mana saja teks "UTBK"/"SNBT" masih tampil ke pengguna?

- **Decision**: 2 lokasi kode produksi perlu diedit:
  1. `src/student/OnboardingFlow.tsx` — array label kartu jenjang `['SMP Kelas VIII–IX', 'SMA',
     'UTBK / SNBT']` menampilkan kartu "UTBK / SNBT" (berstatus disabled/"Segera hadir", tapi
     tetap terlihat dan dijanjikan ke pengguna).
  2. `src/privacy/content.ts` — paragraf "Untuk siapa Lumera dibuat" menyebut *"pelajar SMP, SMA,
     dan persiapan UTBK/SNBT"*.
- **Rationale**: `grep -rl "UTBK\|SNBT" src tests` mengembalikan hanya kedua file ini di kode
  produk aktif (di luar `specs/`). Tidak ada test yang men-assert string "UTBK"/"SNBT", sehingga
  edit tidak memecah test yang ada — tapi juga berarti perlu regression test baru (lihat
  quickstart.md) agar penghapusan ini tidak diam-diam kembali di masa depan.
- **Alternatives considered**: Mengganti label "UTBK / SNBT" dengan placeholder lain (mis. "Segera
  hadir" generik) alih-alih dihapus — ditolak; FR-007 spec.md eksplisit melarang menawarkan jalur
  onboarding UTBK sama sekali, bukan sekadar mengubah labelnya.

## R-004: Bagaimana dengan `docs/concept.md` dan `docs/leancanvas.md` (PRD asli) yang banyak menyebut UTBK?

- **Decision**: Di luar cakupan spec ini — tidak diedit.
- **Rationale**: Kedua dokumen adalah artefak PRD historis (Input original spec 001: "berdasarkan
  semua file di dalam folder @docs"), bukan permukaan yang dilihat pengguna maupun spec aktif yang
  diikat governance constitution. spec.md (003) hanya mencakup FR untuk Atlas, requirement
  turunan, entity, dan teks antarmuka pengguna — tidak menyebut docs/ PRD. Mengubahnya adalah
  scope creep di luar yang disetujui pengguna saat amandemen constitution.
- **Alternatives considered**: Menambahkan catatan "superseded" di header docs/concept.md —
  dipertimbangkan tapi ditolak untuk iterasi ini karena menambah FR baru yang tidak diminta;
  dicatat sebagai potensi Next Action terpisah jika diperlukan nanti.

## R-005: Apakah ada data siswa (progress/instrumentasi) tersimpan untuk subject world UTBK?

- **Decision**: Tidak ada — tidak diperlukan migrasi atau pembersihan data.
- **Rationale**: Instrumentasi (Prinsip VI / FR-015 spec 001) hanya aktif untuk modul yang
  benar-benar dijalankan siswa lewat `muatModul()`. Karena modul UTBK tidak pernah terdaftar di
  `MODULE_LOADERS`, tidak ada `Catatan Aktivitas Belajar` yang pernah dihasilkan dengan subject
  world UTBK.
- **Alternatives considered**: N/A — temuan faktual.
