# Implementation Plan: Penyempitan Cakupan — Lumera Atlas Ditunda ke Pengembangan Berikutnya

**Branch**: `004-defer-lumera-atlas` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-defer-lumera-atlas/spec.md`

## Summary

Menunda Lumera Atlas (peta visual node sebagai homepage) ke pengembangan berikutnya, dan membuat
loop inti (buka aplikasi → pilih pelajaran → selesaikan → progres tersimpan) bisa dicapai pada
rilis ini **tanpa** Atlas. Riset Phase 0 menemukan bahwa jalur ini jauh lebih murah dari perkiraan
awal spec: sudah ada satu generasi UI kedua yang lengkap dan teruji (`src/beranda/Beranda.tsx`,
`src/courses/KursusDetail.tsx`, `src/courses/Belajar.tsx`, plus `src/courses/katalog.ts`) yang
sudah terhubung ke `MODULE_META` (4 modul pelajaran nyata) dan `Siswa` (progres nyata) — hanya
belum pernah dipasang sebagai root aplikasi maupun disambungkan ke `LessonShell`. Rencana ini
memasang generasi tersebut (minus Atlas) ke dalam `StudentApp` yang sudah live, dan menyambungkan
`LessonShell` ke callback `onMulai`/`onMulaiPelajaran`-nya — alih-alih membangun wiring baru dari
nol di atas katalog lama (`src/student/catalog.ts`, konten "Bilangan Bulat" yang tidak terkait
dengan 4 modul konstitusi). Bagian dokumen (`specs/001-core-mvp-prototype/spec.md`/`tasks.md`,
`README.md`) diperbarui sejalan dengan itu.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19 (sesuai `package.json` repo saat ini).

**Primary Dependencies**: Tidak ada dependency baru. Menyambungkan komponen yang sudah ada:
`src/shell/LessonShell.tsx` (alur 7 langkah, sudah stabil), `src/modules/index.ts` (`muatModul`,
lazy-load modul penuh), `src/beranda/Beranda.tsx`, `src/courses/KursusDetail.tsx`,
`src/courses/Belajar.tsx`, `src/courses/katalog.ts` (katalog statis yang sudah memetakan
`math-slope`/`physics-motion`/`econ-supply-demand`/`history-causal-chain`), dan
`src/progress/store.ts` (`Siswa`, `bacaSiswa`) — seluruhnya sudah ada di repo, tidak ada modul
React/state-management baru yang diperkenalkan.

**Storage**: N/A baru — memakai ulang `Siswa`/`LearnerProfile` di `localStorage` yang sudah ada dan
sudah punya ekspor/impor/hapus (spec 002 US6/US7); tidak ada field data siswa baru.

**Testing**: Vitest + @testing-library/react (stack yang sudah ada). `tests/unit/layar-belajar.test.tsx`
dan `tests/unit/a11y.test.tsx` sudah menguji `Beranda`/`KursusDetail`/`Belajar` secara terisolasi
(dengan callback `onMulai`/`onMulaiPelajaran` di-mock) — tes baru yang diperlukan fokus pada
**integrasi**: alur end-to-end dari `StudentApp` (pilih pelajaran → `LessonShell` tampil → selesai →
progres nyata ter-update), regression test bahwa Atlas/HeaderNav/ProgressSummary tetap tidak
ter-mount di manapun (bukti deferral tidak bocor), dan sinkronisasi dokumen (pola sama seperti
`tests/unit/onboarding-scope.test.tsx` di spec 003).

**Target Platform**: Web (SPA React di-deploy ke Cloudflare Pages/Workers, sesuai `wrangler.jsonc`).

**Project Type**: Web application (single-page app + Cloudflare Worker tipis) — struktur project
tidak berubah; fitur ini murni menyambungkan kode yang sudah ada di dalam struktur itu.

**Performance Goals**: MUST mempertahankan code-splitting per-modul yang sudah ada (US11 spec 002,
R-013) — `muatModul(id)` tetap dinamis (`import()`), modul penuh (termasuk komponen React-nya)
MUST NOT ikut masuk ke bundle awal.

**Constraints**: MUST NOT mengubah `LessonShell` atau isi ke-4 modul pelajaran itu sendiri (Prinsip
III/IV — kontraknya sudah ditegakkan `registry.ts`); MUST NOT memasang Lumera Atlas maupun
`src/shell/HeaderNav.tsx`/`src/progress/ProgressSummary.tsx` (nav/summary generasi-2 yang juga
belum pernah dipasang) sebagai bagian dari fitur ini — keduanya di luar cakupan spec 004 (lihat
Edge Cases spec.md); MUST mempertahankan `StudentShell` (nav chrome), onboarding, settings,
privasi, dan pencarian yang sudah live tanpa perubahan perilaku.

**Scale/Scope**: ~3 titik sambung kode (`src/student/StudentApp.tsx` untuk route `home`/pemilihan
modul, glue baru untuk memuat modul + merender `LessonShell`, penyesuaian kecil di
`src/student/StudentScreens.tsx` jika `HomeScreen` digantikan) + sinkronisasi dokumen di
`specs/001-core-mvp-prototype/spec.md`, `tasks.md`, dan `README.md`. Tidak ada direktori/paket
baru. Lihat research.md untuk daftar keputusan lengkap.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v2.0.0. Mark each gate PASS / FAIL / N/A with a
one-line justification. Any FAIL must be recorded in Complexity Tracking below.

- [x] **Mukadimah**: PASS — fitur ini membuat loop belajar inti benar-benar bisa dipakai siswa
      untuk pertama kalinya (misi sosial), bukan fitur monetisasi; tidak ada premium/paywall
      dirancang atau disentuh.
- [x] **I. Interaksi Nyata**: PASS (justru memperbaiki pelanggaran laten) — saat ini mengklik modul
      pelajaran memunculkan info drawer yang berjanji "hadir pada batch berikutnya"; kontrol yang
      terlihat bisa diklik tapi berujung janji kosong adalah dekoratif secara efektif. Fitur ini
      menggantinya dengan `LessonShell` yang benar-benar berfungsi.
- [x] **II. Struktur 7 Langkah**: PASS — `LessonShell` dan `registry.periksaKontrak` sudah
      menegakkan struktur 7 langkah untuk ke-4 modul; fitur ini hanya membuatnya *reachable*, tidak
      mengubah urutan/isi langkah.
- [x] **III. Kedalaman di Atas Kuantitas**: PASS — tidak ada modul yang dipangkas; sebaliknya,
      4 modul yang sudah dibangun penuh menjadi benar-benar bisa diakses, bukan berkurang.
- [x] **IV. Kebenaran Konten**: PASS — tidak ada konten pelajaran baru/diubah; ke-4 modul yang
      disambungkan sudah lolos gate `verifikasi` (`reviewer` ≠ penulis) di `registry.ts` sejak
      spec 001.
- [x] **V. Dewasa Secara Visual**: PASS (perlu verifikasi visual manual — lihat quickstart.md) —
      `Beranda.tsx` sudah punya catatan eksplisit "Liga dan leaderboard tidak diambil — PRD §7.5
      melarangnya"; tetap MUST diperiksa visual saat dipasang ke `StudentShell` yang live, karena
      belum pernah dirender dalam konteks nyata sebelumnya.
- [x] **VI. Instrumentasi Sejak Awal**: PASS — `LessonShell` sudah memanggil `telemetry`/
      `buatEventId` per percobaan; menyambungkannya membuat instrumentasi ini aktif untuk siswa
      nyata untuk pertama kali, bukan menguranginya.
- [x] **VII. Aset Orisinal**: N/A — tidak ada aset ilustrasi/animasi/ikon baru; seluruhnya memakai
      ulang komponen yang sudah ada.
- [x] **VIII. Privasi dan Keamanan Data Siswa**: PASS — tidak ada field data siswa baru; `Siswa`
      yang dibaca/ditulis (`bacaSiswa`/`selesaikanPelajaran`) adalah skema yang sama yang sudah
      melewati kerja privasi spec 002 (ekspor/impor/hapus, US6/US7). Fitur ini hanya membuat data
      yang sudah dikumpulkan benar-benar terlihat oleh siswa yang bersangkutan.

## Project Structure

### Documentation (this feature)

```text
specs/004-defer-lumera-atlas/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

`contracts/` sengaja tidak dibuat — fitur ini tidak menambah/mengubah interface publik (tidak ada
endpoint API/worker baru, tidak ada skema data baru); murni menyambungkan komponen internal yang
sudah ada. Lihat research.md.

### Source Code (repository root)

Repo ini adalah satu aplikasi web (React SPA + Cloudflare Worker tipis) — bukan multi-package.
Fitur ini TIDAK menambah direktori baru; menyambungkan yang sudah ada dan menyunting titik masuk:

```text
src/
├── student/
│   ├── StudentApp.tsx          # ganti case 'home' + penanganan pilih-modul: render
│   │                            # Beranda/KursusDetail/Belajar (bukan HomeScreen fixture +
│   │                            # InfoDrawer "coming soon"); tambah state untuk modul yang
│   │                            # sedang dimuat/dimainkan lewat LessonShell (US1, FR-001, FR-005)
│   └── StudentScreens.tsx      # HomeScreen fixture lama TIDAK dihapus dari kode (masih dipakai
│                                # mode demo Ardi, di luar cakupan spec ini) — hanya tidak lagi
│                                # jadi satu-satunya opsi untuk siswa dengan progres nyata
├── beranda/Beranda.tsx         # dipasang sebagai layar utama pengganti HomeScreen untuk siswa
│                                # non-demo (US1) — TIDAK diubah isinya, hanya disambungkan
├── courses/
│   ├── KursusDetail.tsx        # dipasang untuk navigasi kursus → pelajaran (US1) — tidak diubah
│   ├── Belajar.tsx             # dipasang untuk listing jalur belajar (US1) — tidak diubah
│   └── katalog.ts              # dipakai apa adanya — sudah memetakan 4 modul MODULE_META
├── shell/
│   └── LessonShell.tsx         # TIDAK diubah — disambungkan lewat glue baru di StudentApp.tsx
└── modules/index.ts            # TIDAK diubah — muatModul(id) dipanggil dari glue baru

specs/001-core-mvp-prototype/
├── spec.md                     # tandai User Story 1 (Atlas), FR-001, FR-002 sebagai
│                                # "Deferred — Next Development" merujuk spec 004; revisi
│                                # SC-001/SC-002 agar diukur dari entry point non-Atlas (US2, FR-002/003)
└── tasks.md                    # tandai T085 + bagian Atlas di T089 Deferred; lepas T086/T087 dari
                                 # ketergantungan T085, tandai selesai setelah wiring di atas
                                 # terverifikasi (FR-004/FR-005)

README.md                       # baris status Atlas/homepage → "Direncanakan untuk pengembangan
                                 # berikutnya" (US3, FR-008)
```

**Di luar cakupan struktur ini (sengaja tidak disentuh)**: `src/atlas/` (Atlas — deferred),
`src/shell/HeaderNav.tsx` dan `src/progress/ProgressSummary.tsx` (nav/ringkasan progres generasi-2
yang juga belum pernah dipasang — bukan bagian dari "fitur Atlas" secara harfiah, tapi keduanya
disatukan sebagai keputusan pemasangan UI generasi-2 berikutnya di luar spec ini; lihat research.md
Decision 2 untuk alasan pemisahannya).

**Structure Decision**: Reuse struktur single-project React SPA yang sudah ada. Tidak ada
project/package baru. Perubahan bersifat penyambungan (wiring) komponen yang sudah dibangun dan
teruji secara terisolasi, bukan pembangunan fitur dari nol — lihat research.md Decision 1 untuk
alasan memilih generasi UI kedua (`Beranda`/`KursusDetail`/`Belajar`) alih-alih katalog lama.

## Complexity Tracking

> Tidak diisi — seluruh gate Constitution Check di atas PASS atau N/A, tidak ada pelanggaran yang
> perlu dijustifikasi. Satu-satunya item yang butuh verifikasi tambahan (V — visual saat dipasang
> nyata) dicatat sebagai langkah quickstart, bukan pelanggaran gate.
