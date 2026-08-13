# Implementation Plan: Penyempitan Cakupan — Drop UTBK/SNBT dari Lumera Core

**Branch**: `003-drop-utbk-snbt` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-drop-utbk-snbt/spec.md`

## Summary

Menyelaraskan seluruh permukaan produk dan dokumen spec dengan Lumera Constitution v2.0.0 (cakupan
Lumera Core = SMP-SMA saja): menghapus rujukan aktif ke "UTBK/SNBT" dari kartu onboarding dan teks
kebijakan privasi, menandai bagian terkait UTBK di `specs/001-core-mvp-prototype/spec.md` sebagai
superseded, dan memverifikasi (bukan mengubah — sudah sesuai) bahwa Lumera Atlas tidak menampilkan
node UTBK. Investigasi Phase 0 mengonfirmasi modul pelajaran UTBK tidak pernah dibangun secara
fungsional di kode, sehingga ini murni perubahan copy + dokumen, tanpa migrasi data atau perubahan
skema.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19 (sesuai `package.json` repo saat ini)

**Primary Dependencies**: Tidak ada dependency baru. Perubahan menyentuh komponen React yang sudah
ada (`OnboardingFlow.tsx`), modul konten statis (`privacy/content.ts`), dan dokumen spec Markdown.

**Storage**: N/A — tidak ada data siswa terkait UTBK yang tersimpan (dikonfirmasi di research.md);
tidak ada migrasi skema/database.

**Testing**: Vitest + @testing-library/react (stack pengujian project saat ini); regression test
string-level untuk memastikan nol rujukan "UTBK"/"SNBT" tersisa di permukaan yang dilihat pengguna.

**Target Platform**: Web (SPA React di-deploy ke Cloudflare Pages/Workers, sesuai `wrangler.jsonc`).

**Project Type**: Web application (single-page app + Cloudflare Worker tipis) — struktur project
tidak berubah oleh fitur ini.

**Performance Goals**: N/A — perubahan copy/dokumen murni, tidak menyentuh jalur render/interaksi
yang performance-sensitive.

**Constraints**: MUST NOT mengubah fungsionalitas atau kedalaman 4 modul yang sudah dibangun
(Prinsip III); MUST menjaga spec 001 tetap tertelusuri (bagian yang di-superseded ditandai, bukan
dihapus diam-diam — lihat data-model.md).

**Scale/Scope**: 3 file source (`src/student/OnboardingFlow.tsx`, `src/student/OnboardingFlow.css`,
`src/privacy/content.ts`) + 1 verifikasi non-perubahan (`src/atlas/subject-worlds.ts`) +
sinkronisasi dokumen di `specs/001-core-mvp-prototype/spec.md`. Lihat research.md untuk daftar
lengkap hasil investigasi.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v2.0.0. Mark each gate PASS / FAIL / N/A with a
one-line justification. Any FAIL must be recorded in Complexity Tracking below.

- [x] **Mukadimah**: PASS — perubahan ini memperbaiki akurasi klaim produk ke pengguna (privasi,
      onboarding) agar sesuai kapasitas nyata tim; tidak ada fitur monetisasi/premium yang
      dirancang atau disentuh.
- [x] **I. Interaksi Nyata**: PASS — kartu onboarding "UTBK / SNBT" yang dihapus sudah berstatus
      non-interaktif ("Segera hadir" + ikon lock, disabled), bukan kontrol yang berpura-pura
      berfungsi; menghapusnya tidak membuat kontrol lain jadi dekoratif.
- [x] **II. Struktur 7 Langkah**: N/A — tidak ada modul pelajaran yang dibangun/diubah oleh fitur
      ini; modul UTBK yang di-superseded tidak pernah punya implementasi 7-langkah untuk diubah.
- [x] **III. Kedalaman di Atas Kuantitas**: PASS — FR-008 (spec.md) eksplisit melarang penurunan
      kedalaman pada 5 subject world/modul yang tetap dalam cakupan; perubahan ini hanya memangkas
      cakupan jenjang, bukan kualitas.
- [x] **IV. Kebenaran Konten**: PASS — tidak ada konten pelajaran yang diubah; perubahan justru
      menghapus klaim yang tidak lagi akurat (janji UTBK) dari teks yang dilihat pengguna.
- [x] **V. Dewasa Secara Visual**: PASS (direvisi setelah /speckit-analyze menemukan U1) — grid
      kartu jenjang (`OnboardingFlow.css`) memakai 2 kolom tetap; menghapus 1 dari 4 kartu
      menyisakan 3 kartu yang bolong sebelah di baris terakhir pada lebar desktop/tablet. FR-009
      dan AC3 (US3, spec.md) mewajibkan penyesuaian grid agar tetap seimbang — lihat T013 baru di
      tasks.md.
- [x] **VI. Instrumentasi Sejak Awal**: N/A — tidak ada data pelajaran baru yang dicatat; modul UTBK
      tidak pernah punya instrumentasi untuk dihapus (dikonfirmasi di research.md).
- [x] **VII. Aset Orisinal**: N/A — tidak ada aset ilustrasi/animasi/ikon baru maupun yang diubah.
- [x] **VIII. Privasi dan Keamanan Data Siswa**: PASS — tidak ada data siswa baru yang
      disimpan/diproses; perubahan justru meningkatkan akurasi teks privasi tentang segmen
      pengguna yang sebenarnya dilayani.

## Project Structure

### Documentation (this feature)

```text
specs/003-drop-utbk-snbt/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

`contracts/` sengaja tidak dibuat — fitur ini tidak menambah atau mengubah interface publik
(tidak ada endpoint API/worker baru, tidak ada skema data baru). Lihat research.md.

### Source Code (repository root)

Repo ini adalah satu aplikasi web (React SPA + Cloudflare Worker tipis) — bukan multi-package.
Fitur ini TIDAK menambah direktori baru; hanya menyentuh file yang sudah ada:

```text
src/
├── student/
│   ├── OnboardingFlow.tsx     # hapus opsi kartu jenjang "UTBK / SNBT" (US3, FR-006/007)
│   └── OnboardingFlow.css     # sesuaikan grid kartu jenjang agar tidak bolong sebelah (US3, FR-009)
├── privacy/
│   └── content.ts             # perbarui teks "untuk siapa Lumera dibuat" (US3, FR-006)
└── atlas/
    └── subject-worlds.ts      # verifikasi-saja: sudah tanpa node UTBK/SNBT (US1, FR-001)

specs/001-core-mvp-prototype/
├── spec.md                    # tandai User Story 7, FR-003 (item UTBK), entity Subject World,
│                               # dan baris target audiens sebagai superseded (US2, FR-002–005)
└── tasks.md                   # catatan "TIDAK dibangun" untuk US7 tetap akurat — tidak perlu
                                # diubah, karena UTBK memang tidak pernah dibangun (research.md)
```

**Structure Decision**: Reuse struktur single-project React SPA yang sudah ada. Tidak ada
project/package baru, tidak ada perubahan arsitektur — perubahan bersifat surgical pada 2 file
UI teks, 1 file verifikasi, dan sinkronisasi dokumen spec.

## Complexity Tracking

> Tidak diisi — seluruh gate Constitution Check di atas PASS atau N/A, tidak ada pelanggaran yang
> perlu dijustifikasi.
