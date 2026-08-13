---

description: "Task list for Penyempitan Cakupan — Drop UTBK/SNBT dari Lumera Core"
---

# Tasks: Penyempitan Cakupan — Drop UTBK/SNBT dari Lumera Core

**Input**: Design documents from `/specs/003-drop-utbk-snbt/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md) (`contracts/` sengaja tidak ada — lihat plan.md § Project Structure)

**Revisi 2026-08-13 (pasca `/speckit-analyze`)**: Ditambahkan T013 (grid CSS kartu jenjang, FR-009 —
temuan U1) dan referensi eksplisit FR-008/SC-004 di T017 (temuan G1). spec.md AC1 (US1) juga
diperbaiki (temuan I1) agar konsisten dengan research.md/data-model.md — lihat commit spec.md
terkait. Total task naik dari 17 menjadi 18; T013 lama (edit privacy/content.ts) bergeser jadi T014,
dan seterusnya.

**Tests**: Disertakan — plan.md § Technical Context (Testing) dan quickstart.md langkah 6 secara
eksplisit meminta regression test string-level yang mencegah rujukan "UTBK"/"SNBT" kembali muncul
di permukaan pengguna. Ditulis dengan pola TDD (test dulu, harus FAIL, baru implementasi) untuk
User Story 3 karena itu satu-satunya story yang mengubah kode produksi. Perubahan CSS murni (T013)
tidak punya unit test otomatis — jsdom tidak menghitung layout grid sungguhan — jadi diverifikasi
manual lewat quickstart.md (langkah baru, lihat T018).

**Organization**: Task dikelompokkan per user story (US1, US2, US3) sesuai prioritas di spec.md.
Ketiganya independen satu sama lain — masing-masing menyentuh berkas yang sama sekali berbeda,
sehingga bisa dikerjakan dan divalidasi terpisah, termasuk paralel oleh orang/agent berbeda.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa berjalan paralel (berkas berbeda, tanpa dependensi)
- **[Story]**: User story yang dilayani task ini (US1, US2, US3)

## Path Conventions

Single-project web frontend: `src/`, `tests/unit/` di root repositori (lihat plan.md → Project
Structure). Dokumen spec di `specs/001-core-mvp-prototype/` dan `specs/003-drop-utbk-snbt/`.

---

## Phase 1: Setup

**Purpose**: Rekam baseline sebelum perubahan apa pun, agar hasil tiap story bisa dibandingkan.

- [X] T001 Jalankan `grep -rn "UTBK\|SNBT" src tests specs/001-core-mvp-prototype` dari root repo dan simpan output sebagai baseline "sebelum" (bandingkan dengan hasil akhir di T016). Konfirmasi hasilnya cocok dengan temuan research.md (R-002, R-003): hanya `src/student/OnboardingFlow.tsx`, `src/privacy/content.ts`, dan `specs/001-core-mvp-prototype/spec.md` yang punya match.

**Checkpoint**: Baseline tercatat — tidak ada task Foundational lain; ketiga user story di bawah
sepenuhnya independen (berkas berbeda), tidak ada prasyarat bersama yang memblokir semuanya
sekaligus.

---

## Phase 2: User Story 1 - Atlas hanya menampilkan subject world dalam cakupan SMP-SMA (Priority: P1) 🎯 MVP

**Goal**: Pastikan Lumera Atlas tidak pernah menampilkan node/label "UTBK/SNBT" (FR-001), dan
pasang regression test agar ini tidak diam-diam berubah di masa depan.

**Independent Test**: Jalankan test regresi T003; buka Atlas via `npm run dev` dan telusuri semua
node yang tampil (quickstart.md langkah 2).

### Tests for User Story 1

- [X] T002 [P] [US1] Buat test baru `tests/unit/atlas-subject-worlds.test.ts`: import `SUBJECT_WORLDS` dari `src/atlas/subject-worlds.ts`, assert tidak ada entri yang `id` atau `nama`-nya mengandung "utbk" atau "snbt" (case-insensitive), dan assert jumlah entri (`toHaveLength`) sesuai isi array saat ini — sehingga penambahan entri baru di masa depan wajib melewati review eksplisit (FR-001, research.md R-002).

### Implementation for User Story 1

- [X] T003 [US1] Jalankan `npm test -- atlas-subject-worlds` dan konfirmasi T002 PASS tanpa mengubah `src/atlas/subject-worlds.ts` sama sekali — ini murni task verifikasi (research.md R-002 sudah mengonfirmasi kode saat ini bebas UTBK/SNBT), bukan task edit.

**Checkpoint**: US1 selesai — Atlas terverifikasi bebas UTBK/SNBT, dengan regression test aktif
mencegah regresi.

---

## Phase 3: User Story 2 - Daftar kandidat modul MVP tidak lagi mencakup modul UTBK (Priority: P1) 🎯 MVP

**Goal**: Sinkronkan `specs/001-core-mvp-prototype/spec.md` dengan cakupan baru — bagian yang
terdampak ditandai **superseded** oleh spec ini, bukan dihapus diam-diam, agar tetap tertelusuri
(data-model.md § "Subject World (diperbarui)").

**Independent Test**: Baca ulang `specs/001-core-mvp-prototype/spec.md` setelah T004–T009; setiap
rujukan UTBK yang tersisa harus punya anotasi eksplisit "superseded oleh spec 003"
(quickstart.md langkah 5).

### Implementation for User Story 2

> Task T004–T009 mengedit berkas yang sama (`specs/001-core-mvp-prototype/spec.md`) — dikerjakan
> berurutan, tidak paralel, untuk menghindari conflict.

- [X] T004 [US2] Tambahkan baris "Last Amended" baru di header `specs/001-core-mvp-prototype/spec.md` (mengikuti pola baris 9–11 yang sudah ada), merujuk amandemen ini dan Lumera Constitution v2.0.0.
- [X] T005 [US2] Di `specs/001-core-mvp-prototype/spec.md`, tandai **User Story 7 - Penalaran Kuantitatif (UTBK)** (Priority P2) sebagai **Superseded** dengan catatan eksplisit merujuk `specs/003-drop-utbk-snbt/spec.md` tepat di atas judul story tersebut — JANGAN hapus teks story aslinya (jaga traceability historis).
- [X] T006 [US2] Di `specs/001-core-mvp-prototype/spec.md`, perbarui **FR-003**: hapus item "Penalaran Kuantitatif (UTBK)" dari daftar kandidat modul, ubah "minimal 4 dari 6" menjadi "minimal 4 dari 5", dan tambahkan catatan singkat "(disesuaikan oleh spec 003)" di akhir requirement.
- [X] T007 [US2] Di `specs/001-core-mvp-prototype/spec.md`, perbarui entity **Subject World** (bagian Key Entities): hapus "UTBK/SNBT" dari daftar kategori subject world, tambahkan catatan bahwa definisi lengkap sekarang mengikuti `specs/003-drop-utbk-snbt/data-model.md`.
- [X] T008 [US2] Di `specs/001-core-mvp-prototype/spec.md` bagian Assumptions, ubah baris "target audiens adalah SMP–SMA–UTBK/kuliah awal (Lumera Core)" menjadi "target audiens adalah SMP–SMA (Lumera Core)", merujuk Lumera Constitution v2.0.0.
- [X] T009 [US2] Baca ulang **FR-020** di `specs/001-core-mvp-prototype/spec.md` setelah T006 — verifikasi teksnya ("...bagian dari 'minimal 4 modul' pada FR-003...") tetap konsisten secara logis dengan hitungan baru "4 dari 5"; edit hanya jika ditemukan rujukan tersisa ke angka "6".

**Checkpoint**: US2 selesai — spec 001 tersinkron dengan cakupan baru, seluruh rujukan UTBK
ditandai superseded dengan jejak audit yang jelas.

---

## Phase 4: User Story 3 - Copy produk yang menyebut UTBK/SNBT disesuaikan (Priority: P2)

**Goal**: Hapus rujukan UTBK/SNBT dari dua permukaan UI live (kartu onboarding, teks kebijakan
privasi) yang masih menjanjikan jenjang di luar cakupan (FR-006, FR-007), dan pastikan grid kartu
jenjang yang tersisa tetap terlihat rapi (FR-009 — temuan U1 dari `/speckit-analyze`, dikonfirmasi
langsung oleh pengguna: kartu UTBK ini yang terlihat sebagai "UI tertinggal" di layar onboarding
sebelum login).

**Independent Test**: Jalankan test regresi T010–T011; buka alur onboarding dan halaman privasi
secara manual, termasuk cek visual grid di lebar desktop/tablet (quickstart.md langkah 3–4).

### Tests for User Story 3 ⚠️

> **Tulis tests ini LEBIH DULU, pastikan FAIL sebelum mengerjakan T012, T014.**

- [X] T010 [P] [US3] Buat test baru `tests/unit/onboarding-scope.test.tsx`: render `OnboardingFlow` (dari `src/student/OnboardingFlow.tsx`) pada route `onboarding-profile` dengan props minimal yang valid, dan assert tidak ada teks "UTBK" atau "SNBT" di manapun pada output (`queryAllByText(/UTBK|SNBT/i)` harus kosong). Harus FAIL saat ini karena kartu "UTBK / SNBT" masih ada.
- [X] T011 [P] [US3] Buat test baru `tests/unit/privacy-content.test.ts`: import `PRIVACY_SECTIONS` dari `src/privacy/content.ts`, assert tidak ada `paragraf` yang mengandung substring "UTBK" atau "SNBT" (case-insensitive). Harus FAIL saat ini karena section "Untuk siapa Lumera dibuat" masih menyebut UTBK/SNBT.

### Implementation for User Story 3

- [X] T012 [P] [US3] Di `src/student/OnboardingFlow.tsx` (fungsi `ProfileStep`, array label kartu jenjang), hapus `'UTBK / SNBT'` dari array `['SMP Kelas VIII–IX', 'SMA', 'UTBK / SNBT']` — sisakan `['SMP Kelas VIII–IX', 'SMA']` (FR-006, FR-007).
- [X] T013 [P] [US3] Di `src/student/OnboardingFlow.css`, sesuaikan `.grade-options__grid` (saat ini `grid-template-columns: repeat(2, minmax(0, 1fr))`, baris ~265-269) agar 3 kartu jenjang (1 "SMP Kelas VII" terpilih + 2 disabled) tidak menyisakan baris terakhir bolong sebelah di lebar desktop/tablet — mis. ubah ke `grid-template-columns: repeat(auto-fit, minmax(140px, 1fr))`, atau susun ulang jadi 1 kolom penuh untuk kartu terpilih + 2 kolom untuk sisanya, sesuai preferensi visual desain "Soft Academic Adventure" (Prinsip V). Breakpoint mobile (baris ~605-608, sudah 1 kolom) TIDAK perlu diubah (FR-009).
- [X] T014 [P] [US3] Di `src/privacy/content.ts`, ubah paragraf section "Untuk siapa Lumera dibuat" dari "...pelajar SMP, SMA, dan persiapan UTBK/SNBT..." menjadi "...pelajar SMP dan SMA..."; perbarui `PRIVACY_LAST_UPDATED` ke `'2026-08-13'` mengikuti konvensi sinkronisasi yang sudah didokumentasikan di komentar file ini (FR-006).
- [X] T015 [US3] Jalankan ulang `npm test -- onboarding-scope privacy-content` dan konfirmasi T010 dan T011 sekarang PASS setelah T012 dan T014; lalu buka `npm run dev` dan verifikasi visual T013 (grid kartu jenjang rapi, tanpa baris bolong) di lebar desktop DAN tablet — dokumentasikan hasilnya (FR-009, SC-005).

**Checkpoint**: US3 selesai — tidak ada lagi rujukan UTBK/SNBT di permukaan yang dilihat pengguna,
grid kartu jenjang tetap rapi, dilindungi regression test.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validasi akhir lintas-story sebelum merge.

- [X] T016 Jalankan `grep -rn "UTBK\|SNBT" src tests` dari root repo dan konfirmasi nol match (quickstart.md langkah 1) — bandingkan dengan baseline T001 untuk memastikan hanya berkas yang direncanakan yang berubah.
- [X] T017 Jalankan `npm test` (full suite) dan konfirmasi seluruh test lulus, termasuk T002, T010, T011 yang baru ditambahkan — full suite yang lulus juga jadi bukti tidak langsung bahwa kedalaman/kualitas 4 modul terbangun tidak berkurang (FR-008, SC-004; lihat catatan G1 di laporan `/speckit-analyze` — tidak ada test khusus FR-008, ini adalah jaring pengaman via regresi test modul yang sudah ada).
- [X] T018 Jalankan seluruh langkah `quickstart.md` (1–6, termasuk cek visual grid dari T013) secara end-to-end dan catat hasilnya (PASS/FAIL per langkah) di deskripsi PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Tidak ada dependensi — jalankan lebih dulu untuk baseline.
- **User Stories (Phase 2–4)**: Semua hanya bergantung pada Phase 1 selesai. Tidak ada
  Foundational phase terpisah — tidak ada prasyarat bersama yang memblokir ketiga story
  sekaligus, karena masing-masing menyentuh berkas yang sama sekali berbeda.
  - US1 (Phase 2), US2 (Phase 3), dan US3 (Phase 4) dapat dikerjakan **paralel penuh** oleh
    orang/agent berbeda — tidak ada dependensi silang di antara ketiganya.
- **Polish (Phase 5)**: Bergantung pada US1 + US2 + US3 semuanya selesai (butuh hasil akhir semua
  berkas untuk audit grep dan quickstart end-to-end).

### User Story Dependencies

- **User Story 1 (P1)**: Tidak bergantung pada story lain.
- **User Story 2 (P1)**: Tidak bergantung pada story lain (hanya mengedit dokumen spec 001).
- **User Story 3 (P2)**: Tidak bergantung pada story lain (hanya mengedit 3 berkas UI: teks + CSS).

### Within Each User Story

- US1: test (T002) sebelum verifikasi (T003).
- US2: T004–T009 berurutan (berkas sama — `specs/001-core-mvp-prototype/spec.md`).
- US3: tests (T010, T011) ditulis dan harus FAIL dulu, baru implementasi (T012, T013, T014 —
  paralel, berkas berbeda), baru verifikasi ulang (T015).

### Parallel Opportunities

- Setelah T001 (Setup) selesai: **Phase 2 (US1), Phase 3 (US2), dan Phase 4 (US3) bisa berjalan
  sepenuhnya paralel** — berkas yang disentuh tidak tumpang tindih sama sekali.
- Dalam US3: T010 dan T011 (test, berkas berbeda) paralel; T012, T013, dan T014 (implementasi,
  3 berkas berbeda) paralel.
- Dalam US2: T004–T009 **tidak** paralel (satu berkas yang sama).

---

## Parallel Example: Lintas Story (setelah T001)

```bash
# Ketiga user story bisa dikerjakan bersamaan oleh developer/agent berbeda:
Task: "US1 — tests/unit/atlas-subject-worlds.test.ts + verifikasi src/atlas/subject-worlds.ts"
Task: "US2 — sinkronisasi specs/001-core-mvp-prototype/spec.md (T004-T009)"
Task: "US3 — tests/unit/onboarding-scope.test.tsx + tests/unit/privacy-content.test.ts, lalu edit OnboardingFlow.tsx + OnboardingFlow.css + privacy/content.ts"
```

## Parallel Example: User Story 3

```bash
# Tests dulu, paralel:
Task: "Test regresi onboarding di tests/unit/onboarding-scope.test.tsx"
Task: "Test regresi privacy content di tests/unit/privacy-content.test.ts"

# Setelah tests FAIL terkonfirmasi, implementasi paralel:
Task: "Hapus kartu UTBK di src/student/OnboardingFlow.tsx"
Task: "Sesuaikan grid kartu jenjang di src/student/OnboardingFlow.css"
Task: "Perbarui teks privasi di src/privacy/content.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 — keduanya P1)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: User Story 1 (T002–T003)
3. Complete Phase 3: User Story 2 (T004–T009)
4. **STOP and VALIDATE**: spec 001 tersinkron dan Atlas terverifikasi bebas UTBK — ini sudah
   cukup untuk menutup risiko utama (dokumentasi/requirement yang menyesatkan tim).
5. User Story 3 (P2, copy UI + grid) dapat menyusul sebagai increment berikutnya tanpa memblokir
   MVP di atas — meski ini yang paling terlihat langsung oleh pengguna nyata.

### Incremental Delivery

1. Setup → baseline tercatat
2. US1 + US2 (P1, bisa paralel) → requirement & Atlas tersinkron dengan constitution v2.0.0
3. US3 (P2) → permukaan UI yang dilihat pengguna (termasuk grid onboarding) ikut disesuaikan
4. Polish → audit akhir lintas-story, siap merge

### Parallel Team Strategy

Dengan 3 orang/agent: satu mengerjakan US1, satu US2, satu US3 — sepenuhnya independen setelah
T001, temu di Phase 5 (Polish) untuk validasi gabungan.

---

## Notes

- [P] tasks = berkas berbeda, tanpa dependensi.
- [Story] label memetakan task ke user story untuk traceability.
- Fitur ini TIDAK mengirim/mengubah modul pelajaran apa pun — requirement task konstitusi terkait
  modul (instrumentasi Prinsip VI, verifikasi konten Prinsip IV, 7-langkah Prinsip II) **tidak
  berlaku** di sini (lihat plan.md § Constitution Check: N/A untuk gate-gate tersebut).
- Tidak ada data siswa baru yang disimpan/diproses (Prinsip VIII) — task privacy-review formal
  tidak diwajibkan, tapi T014 tetap memperbarui `PRIVACY_LAST_UPDATED` demi akurasi.
- T013 (grid CSS) tidak punya unit test otomatis — diverifikasi manual di T015/T018. Jika di masa
  depan project menambah visual regression testing (mis. Playwright screenshot diff), pertimbangkan
  menambah test otomatis untuk `.grade-options__grid` saat itu.
- Commit setelah tiap task atau kelompok task logis.
- Berhenti di tiap checkpoint untuk memvalidasi story secara independen.
