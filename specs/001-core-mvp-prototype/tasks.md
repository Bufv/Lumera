---

description: "Task list for Lumera Core MVP — Functional Interactive Lesson Prototype"
---

# Tasks: Lumera Core MVP — Functional Interactive Lesson Prototype

**Input**: Design documents from `/specs/001-core-mvp-prototype/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Automated tests dibatasi pada logika murni (penilaian, mastery, event log) sesuai
keputusan R-007. Spec tidak meminta E2E; verifikasi alur pelajaran dilakukan manual lewat
`quickstart.md`.

**Organization**: Tasks dikelompokkan per user story agar tiap story bisa diimplementasi dan diuji
independen.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa berjalan paralel (berkas berbeda, tanpa dependensi)
- **[Story]**: User story yang dilayani task ini (US1, US2, ...)

## Path Conventions

Single-project web frontend: `src/`, `tests/` di root repositori (lihat plan.md → Project Structure).

## Cakupan modul

`docs/plan.md` memilih **4 dari 6** modul (batas bawah FR-003), dipilih untuk memaksimalkan variasi
jenis interaksi:

| Dibangun | Story | Jenis interaksi |
|---|---|---|
| Matematika — Membaca Kemiringan Grafik | US2 (P1) | baca grafik + input |
| Fisika — Simulasi Gerak Lurus | US3 (P1) | slider + animasi live |
| Ekonomi — Supply & Demand | US4 (P2) | slider + kurva reaktif |
| Sejarah — Rantai Sebab-Akibat | US5 (P2) | drag-and-drop sequencing |

**TIDAK dibangun di iterasi ini**: US6 (Bahasa — Perbaiki Argumen) dan US7 (UTBK — Penalaran
Kuantitatif). Keduanya tetap terspesifikasi di `spec.md` agar bisa diambil tanpa menulis ulang spec.

## Catatan urutan fase

Fase mengikuti urutan build `plan.md`, **bukan** urutan prioritas spec. **US1 (Atlas, P1) sengaja
ditempatkan terakhir**: Atlas minimal berbiaya rendah dan bergantung pada daftar modul yang sudah
final, sementara risiko teknis terbesar ada di Shell dan modul. Selama Fase 3–7 modul diakses lewat
rute dev langsung. Konsekuensinya US1 baru dapat diuji utuh di Fase 8.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inisialisasi proyek dan struktur dasar

- [X] T001 Inisialisasi proyek Vite + React 19 + TypeScript 5.x di root repositori (`package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`)
- [X] T002 [P] Tambahkan dependensi `d3-scale`, `d3-shape`, `@dnd-kit/core`, `@dnd-kit/sortable` ke `package.json` (D3 dipakai sebagai pustaka perhitungan saja, tidak menyentuh DOM — R-003)
- [X] T003 [P] Konfigurasi Vitest + jsdom di `vite.config.ts` dan `tests/setup.ts`
- [X] T004 [P] Konfigurasi ESLint + Prettier di `eslint.config.js` dan `.prettierrc`
- [X] T005 Buat kerangka direktori sesuai plan.md di `src/shell/`, `src/modules/`, `src/progress/`, `src/telemetry/`, `src/atlas/`, `src/design/`, `src/content/`, `tests/unit/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fondasi yang WAJIB selesai sebelum user story manapun dikerjakan — ini adalah Fase 0
pada plan.md

**⚠️ CRITICAL**: Tidak ada pekerjaan user story yang boleh dimulai sebelum fase ini selesai. Shell
dan telemetry ada di sini justru agar Prinsip II dan VI tidak bisa dilewati oleh modul manapun.

### Design tokens (Prinsip V)

- [X] T006 [P] Definisikan design token warna, tipografi, spacing, dan motion di `src/design/tokens.ts` mengikuti palet "Soft Academic Adventure" (ivory hangat, teal/emerald, lime, cobalt, gold) — hindari hijau terang dominan ala mainan anak (FR-018)

### Kontrak & telemetry (Prinsip VI)

- [X] T007 [P] Definisikan tipe kontrak modul di `src/shell/types.ts` sesuai `contracts/lesson-module-contract.md` (`LessonModule`, `VisualModelProps`, `UserActionProps`, `AttemptResult`)
- [X] T008 [P] Definisikan tipe event pembelajaran + `schemaVersion: 1` di `src/telemetry/events.ts` sesuai `contracts/learning-event-contract.md`
- [X] T009 Implementasikan validasi event di `src/telemetry/validate.ts` — tolak `conceptIds` kosong dan `durasiMs <= 0`, munculkan error yang **terlihat**, jangan pernah gagal diam-diam (kontrak aturan 3)
- [X] T010 Implementasikan `TelemetryAdapter` (`record`/`readAll`, antarmuka async, implementasi `localStorage`) di `src/telemetry/adapter.ts` — antarmuka async sejak awal agar migrasi ke backend tidak menyentuh pemanggil (R-002). Bergantung pada T008, T009
- [X] T011 [P] Unit test validasi event dan round-trip adapter di `tests/unit/telemetry.test.ts`

### Persistensi progres

- [X] T012 Implementasikan penyimpanan entitas `Siswa` (`id`, `lumens`, `streakCount`, `streakLastDate`) di `src/progress/store.ts` sesuai data-model.md
- [X] T013 Implementasikan pemberian Lumens saat pelajaran selesai di `src/progress/award.ts` — **tetapkan besaran Lumens per pelajaran** (titik terbuka research.md)

### LessonShell (Prinsip II)

- [X] T014 Implementasikan state machine 7 langkah `LessonShell` di `src/shell/LessonShell.tsx` — Shell memiliki langkah 1, 4, 5, 6, 7; modul hanya mengisi slot langkah 2 dan 3
- [X] T015 [P] Implementasikan komponen langkah milik Shell di `src/shell/steps/` (`Step1_Prompt.tsx`, `Step4_InstantFeedback.tsx`, `Step5_WhyExplanation.tsx`, `Step6_Reflection.tsx`, `Step7_Continue.tsx`)
- [X] T016 Implementasikan layout UI pelajaran sesuai FR-011 di `src/shell/LessonChrome.tsx` — tombol tutup kiri atas, progress dots tengah atas, Lumens kanan atas, area interaksi tengah, kontrol jawaban bawah, bilah umpan balik paling bawah
- [X] T017 Tegakkan aturan `penjelasanKenapa` non-kosong untuk `benar == true` **maupun** `false` di `src/shell/LessonShell.tsx` (kontrak aturan 1) — string kosong pada jawaban benar adalah pelanggaran, bukan optimasi
- [X] T018 Implementasikan registry modul yang **menolak** modul tidak memenuhi kontrak di `src/shell/registry.ts` — inilah yang membuat pelanggaran Prinsip II sulit terjadi secara struktural
- [X] T019 Implementasikan penerbitan event `lesson_completed` hanya pada penekanan "Lanjutkan" di langkah 7 di `src/shell/LessonShell.tsx` — tidak pernah terbit untuk pelajaran yang ditinggalkan (FR-014). Bergantung pada T010, T014
- [X] T020 Implementasikan pengukuran `durasiMs` (langkah 1 hingga "Lanjutkan") di `src/shell/LessonShell.tsx`
- [X] T021 Implementasikan izin percobaan ulang tanpa mengunci siswa keluar di `src/shell/LessonShell.tsx` — `nomorPercobaan` naik tiap `onSubmit` (kontrak aturan 3)
- [X] T022 Bangun modul dummy di `src/modules/_dummy/` dan verifikasi ketujuh langkah Shell berjalan penuh — membuktikan Shell reusable sebelum modul nyata dibangun

**Checkpoint**: Fondasi siap — Shell menegakkan 7 langkah, telemetry merekam, progres tersimpan. User story boleh dimulai.

---

## Phase 3: User Story 2 - Membaca Kemiringan Grafik (Matematika) (Priority: P1) 🎯 MVP

**Goal**: Satu pelajaran nyata selesai end-to-end, membuktikan `LessonShell` benar-benar reusable.

**Independent Test**: Buka modul lewat rute dev, selesaikan alur 7 langkah, verifikasi status selesai dan Lumens bertambah.

**Kenapa MVP**: modul dengan kompleksitas teknis terendah (grafik statis + input), sehingga
kegagalan di sini berarti masalah ada di Shell — bukan di kerumitan modul.

- [X] T023 [US2] Tulis naskah pelajaran + `conceptIds` di `src/content/math-slope.ts`
- [X] T024 [US2] Isi metadata `VerifikasiKonten` (`rujukanCP` Kurikulum Merdeka, `reviewer`, `tanggalVerifikasi`) di `src/content/math-slope.ts` — **`reviewer` wajib berbeda dari penulis modul** (FR-016, gate konstitusi)
- [X] T025 [P] [US2] Implementasikan slot Model visual: grafik SVG memakai `d3-scale`/`d3-shape` di `src/modules/math-slope/VisualModel.tsx`
- [X] T026 [P] [US2] Implementasikan slot Aksi pengguna (input jawaban kemiringan) di `src/modules/math-slope/UserAction.tsx`
- [X] T027 [US2] Implementasikan penilaian jawaban + klasifikasi `mistakeType` di `src/modules/math-slope/scoring.ts` — `mistakeType` wajib terisi pada setiap jalur jawaban salah
- [X] T028 [US2] Tulis `penjelasanKenapa` untuk jawaban benar dan salah di `src/content/math-slope.ts`
- [X] T029 [P] [US2] Unit test penilaian dan klasifikasi `mistakeType` di `tests/unit/math-slope.test.ts`
- [X] T030 [US2] Daftarkan modul ke `src/shell/registry.ts`
- [X] T031 [US2] Verifikasi instrumentasi: `lesson_completed` terbit dengan `conceptIds` non-kosong, `mistakes` terisi saat salah, `durasiMs > 0` (quickstart V-7)
- [ ] T032 [US2] Jalankan quickstart V-2, V-3, V-4 untuk modul ini dan centang Definition of Done pada `contracts/lesson-module-contract.md`

**Checkpoint**: US2 berfungsi penuh dan dapat didemokan sendiri. Ini titik "STOP and VALIDATE" pertama.

---

## Phase 4: User Story 3 - Simulasi Gerak Lurus (Fisika) (Priority: P1)

**Goal**: Modul dengan animasi live yang merespons parameter, membuktikan Shell menampung interaksi kontinu.

**Independent Test**: Ubah variabel gerak, verifikasi visualisasi diperbarui real-time, selesaikan 7 langkah.

- [X] T033 [US3] Tulis naskah pelajaran + `conceptIds` di `src/content/physics-motion.ts`
- [X] T034 [US3] Isi metadata `VerifikasiKonten` di `src/content/physics-motion.ts` — `reviewer` ≠ penulis modul
- [X] T035 [P] [US3] Implementasikan slot Model visual: animasi canvas `requestAnimationFrame` dengan integrasi posisi berbasis **delta-time** di `src/modules/physics-motion/VisualModel.tsx` — delta-time wajib agar fisikanya tetap benar di frame rate berbeda; gerak yang salah adalah kesalahan konten, bukan cacat visual (R-004)
- [X] T036 [P] [US3] Implementasikan slot Aksi pengguna (slider kecepatan awal/percepatan) di `src/modules/physics-motion/UserAction.tsx`
- [X] T037 [US3] Implementasikan penilaian + `mistakeType` di `src/modules/physics-motion/scoring.ts`
- [X] T038 [US3] Tulis `penjelasanKenapa` yang merujuk hasil simulasi siswa di `src/content/physics-motion.ts`
- [X] T039 [P] [US3] Unit test penilaian dan perhitungan posisi di `tests/unit/physics-motion.test.ts`
- [X] T040 [US3] Daftarkan modul ke `src/shell/registry.ts`
- [ ] T041 [US3] Verifikasi animasi mencapai 60 fps pada perangkat mid-range
- [ ] T042 [US3] Verifikasi instrumentasi (V-7) dan jalankan quickstart V-2, V-3, V-4 untuk modul ini

**Checkpoint**: US2 dan US3 keduanya berfungsi independen.

---

## Phase 5: User Story 4 - Supply & Demand Simulator (Ekonomi) (Priority: P2)

**Goal**: Grafik reaktif — kurva bergeser mengikuti slider, titik ekuilibrium ikut berpindah.

**Independent Test**: Geser variabel supply/demand, verifikasi grafik harga-kuantitas berubah sesuai teori, selesaikan 7 langkah.

- [X] T043 [US4] Tulis naskah pelajaran + `conceptIds` di `src/content/econ-supply-demand.ts`
- [X] T044 [US4] Isi metadata `VerifikasiKonten` di `src/content/econ-supply-demand.ts` — `reviewer` ≠ penulis modul
- [X] T045 [P] [US4] Implementasikan slot Model visual: kurva supply/demand + titik ekuilibrium reaktif di `src/modules/econ-supply-demand/VisualModel.tsx`
- [X] T046 [P] [US4] Implementasikan slot Aksi pengguna (slider pergeseran kurva) di `src/modules/econ-supply-demand/UserAction.tsx`
- [X] T047 [US4] Implementasikan perhitungan ekuilibrium + penilaian + `mistakeType` di `src/modules/econ-supply-demand/scoring.ts`
- [X] T048 [US4] Tulis `penjelasanKenapa` untuk efek pergeseran kurva di `src/content/econ-supply-demand.ts`
- [X] T049 [P] [US4] Unit test perhitungan ekuilibrium dan penilaian di `tests/unit/econ-supply-demand.test.ts`
- [X] T050 [US4] Daftarkan modul ke `src/shell/registry.ts`
- [ ] T051 [US4] Verifikasi instrumentasi (V-7) dan jalankan quickstart V-2, V-3, V-4 untuk modul ini

**Checkpoint**: Tiga modul berfungsi independen.

---

## Phase 6: User Story 5 - Rantai Sebab-Akibat (Sejarah) (Priority: P2)

**Goal**: Modul sequencing drag-and-drop, melengkapi batas bawah 4 modul FR-003.

**Independent Test**: Susun rantai sebab-akibat, verifikasi urutan benar/salah dinilai dan dijelaskan, selesaikan 7 langkah.

- [X] T052 [US5] Tulis naskah pelajaran + `conceptIds` di `src/content/history-causal-chain.ts`
- [X] T053 [US5] Isi metadata `VerifikasiKonten` di `src/content/history-causal-chain.ts` — `reviewer` ≠ penulis modul
- [X] T054 [P] [US5] Implementasikan slot Model visual: kartu peristiwa di `src/modules/history-causal-chain/VisualModel.tsx`
- [X] T055 [US5] Implementasikan slot Aksi pengguna: sequencing `@dnd-kit` di `src/modules/history-causal-chain/UserAction.tsx`
- [X] T056 [US5] Implementasikan jalur interaksi alternatif non-drag (sensor keyboard `@dnd-kit` + mode tap-to-select) di `src/modules/history-causal-chain/UserAction.tsx` — **tanpa ini modul gagal FR-013 di perangkat sentuh**: kontrol terlihat tapi tidak berfungsi (R-005, kontrak aturan 6)
- [X] T057 [US5] Implementasikan validasi urutan + `mistakeType` di `src/modules/history-causal-chain/scoring.ts`
- [X] T058 [US5] Tulis `penjelasanKenapa` yang menjelaskan hubungan sebab-akibat benar di `src/content/history-causal-chain.ts`
- [X] T059 [P] [US5] Unit test validasi urutan di `tests/unit/history-causal-chain.test.ts`
- [X] T060 [US5] Daftarkan modul ke `src/shell/registry.ts`
- [ ] T061 [US5] Jalankan quickstart V-5 (jalur alternatif: keyboard dan tap-to-select di viewport mobile)
- [ ] T062 [US5] Verifikasi instrumentasi (V-7) dan jalankan quickstart V-2, V-3, V-4 untuk modul ini

**Checkpoint**: Keempat modul berfungsi — batas bawah FR-003 terpenuhi.

---

## Phase 7: User Story 8 - Melihat Progres, Streak, dan Lumens (Priority: P3)

**Goal**: Progres belajar terlihat dan bertahan antar sesi.

**Independent Test**: Selesaikan pelajaran, muat ulang halaman, verifikasi streak/Lumens/mastery bertahan.

**Catatan**: dipasang di lapisan **luar** Shell, bukan di dalam logika modul manapun — agar tidak
perlu diimplementasikan ulang tiap kali modul baru ditambahkan.

- [X] T063 [US8] Implementasikan transisi streak harian di `src/progress/streak.ts` sesuai aturan data-model.md (hari sama → tetap; H+1 → naik; selisih > 1 hari → reset ke 1)
- [X] T064 [US8] Implementasikan perhitungan mastery % di `src/progress/mastery.ts` — **tetapkan rumusnya** (titik terbuka research.md); harus mencerminkan performa **terbaru**, bukan akumulasi seumur hidup, agar siswa yang membaik terlihat membaik (FR-009)
- [X] T065 [P] [US8] Unit test transisi streak (termasuk batas lintas hari) dan perhitungan mastery di `tests/unit/progress.test.ts`
- [X] T066 [US8] Implementasikan layar ringkasan progres (streak, Lumens, mastery per modul) di `src/progress/ProgressSummary.tsx`
- [X] T067 [US8] Verifikasi FR-014: tinggalkan pelajaran sebelum langkah 7, pastikan Lumens/streak/progres **tidak** berubah (quickstart V-6)
- [ ] T068 [US8] Jalankan quickstart V-6 penuh termasuk uji persistensi setelah reload

**Checkpoint**: Progres terlihat dan persisten.

---

## Phase 8: User Story 1 - Navigasi Lumera Atlas (Priority: P1)

**Goal**: Homepage peta pengetahuan yang menghubungkan siswa ke keempat modul.

**Independent Test**: Buka aplikasi dengan `localStorage` kosong, verifikasi node tampil dengan koneksi visual, klik node, verifikasi masuk ke modul yang benar.

**Catatan urutan**: berprioritas P1 namun sengaja dikerjakan terakhir — lihat "Catatan urutan fase"
di atas. Bergantung pada daftar modul final (Fase 3–6) dan indikator mastery (Fase 7).

- [X] T069 [US1] Definisikan data `SubjectWorld` (`id`, `nama`, `moduleIds`, `connections`) di `src/atlas/subject-worlds.ts` sesuai data-model.md — gunakan terminologi produk resmi (FR-019)
- [X] T070 [US1] Implementasikan render peta node dengan koneksi visual bercahaya di `src/atlas/Atlas.tsx` — node melayang dengan garis penghubung, **bukan** grid tombol statis (FR-001); node statis sudah cukup, graph engine di luar cakupan
- [X] T071 [US1] Implementasikan navigasi node → modul pelajaran di `src/atlas/Atlas.tsx` (FR-002)
- [X] T072 [US1] Tampilkan indikator progress/mastery per node di `src/atlas/SubjectNode.tsx` — node yang sudah dipelajari berbeda dari yang belum disentuh (US1 skenario 3). Bergantung pada T064
- [X] T073 [US1] Tangani kondisi siswa baru: seluruh node berstatus "belum dimulai", tanpa mastery, tanpa streak aktif (edge case spec)
- [ ] T074 [US1] Jalankan quickstart V-1 (alur lengkap siswa baru < 5 menit)

**Checkpoint**: Alur end-to-end lengkap — Atlas → pelajaran → kembali dengan progres ter-update.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verifikasi lintas story dan penutupan gate konstitusi

- [ ] T075 [P] Audit Prinsip I di seluruh modul: klik/geser **setiap** kontrol yang terlihat, pastikan semuanya mengubah state nyata (quickstart V-4, SC-005) — satu kontrol tidak merespons = gagal
- [ ] T076 [P] Audit Prinsip VII: telusuri setiap aset visual ke berkas sumber orisinal atau lisensi sah, pastikan tidak ada aset AI generik (quickstart V-9, SC-008)
- [ ] T077 [P] Audit Prinsip V: tidak ada hijau terang dominan, tidak ada mascot berlebihan, tidak ada copy childish (quickstart V-9, SC-009)
- [ ] T078 [P] Audit FR-019: konsistensi terminologi produk di seluruh layar (mis. selalu "Refresh Harian", tidak pernah "Review Harian")
- [ ] T079 Audit Prinsip IV: pastikan keempat modul punya `VerifikasiKonten` lengkap dengan `reviewer` ≠ penulis (quickstart V-8, SC-007)
- [X] T080 Verifikasi SC-006 menyeluruh: `readAll()` menunjukkan tepat satu event `lesson_completed` per pelajaran selesai di keempat modul, semua field minimal terisi
- [X] T081 Verifikasi FR-012: tidak ada leaderboard, ruang sosial, maupun elemen kompetisi antar siswa
- [ ] T082 Responsivitas: verifikasi keempat modul dan Atlas pada viewport mobile dan desktop
- [X] T083 Centang Definition of Done pada `contracts/lesson-module-contract.md` untuk keempat modul — modul yang gagal satu butir **tidak boleh** dihitung ke dalam "minimal 4 modul" (FR-020)
- [ ] T084 Jalankan seluruh skenario quickstart V-1 s.d. V-9 sebagai gate rilis akhir

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: tanpa dependensi — bisa langsung dimulai
- **Foundational (Phase 2)**: bergantung pada Setup — **MEMBLOKIR seluruh user story**
- **User Stories (Phase 3–8)**: seluruhnya bergantung pada Foundational
- **Polish (Phase 9)**: bergantung pada seluruh story yang diinginkan selesai

### User Story Dependencies

- **US2 (P1, Fase 3)**: hanya butuh Foundational — MVP, tidak bergantung story lain
- **US3, US4, US5 (Fase 4–6)**: hanya butuh Foundational — ketiganya saling independen, bisa paralel
- **US8 (P3, Fase 7)**: butuh Foundational; agar bermakna, minimal satu modul sudah ada
- **US1 (P1, Fase 8)**: butuh daftar modul final (Fase 3–6) dan T064 untuk indikator mastery

### Within Each Module Story

- Naskah + verifikasi konten sebelum implementasi slot (naskah menentukan `conceptIds` dan `mistakeType`)
- Slot Model visual dan Aksi pengguna bisa paralel (berkas berbeda)
- Penilaian sebelum pendaftaran ke registry
- Verifikasi instrumentasi paling akhir — memastikan modul lulus FR-020

### Parallel Opportunities

- T002, T003, T004 (Setup) bisa paralel
- T006, T007, T008 (definisi tipe & token) bisa paralel
- T011, T015 bisa paralel dengan pekerjaan Shell lain
- **US3, US4, US5 dapat dikerjakan tiga developer secara paralel** setelah US2 memvalidasi Shell
- Dalam tiap modul: `VisualModel.tsx` dan `UserAction.tsx` paralel; unit test paralel dengan implementasi
- T075, T076, T077, T078 (audit Polish) bisa paralel

---

## Parallel Example: Setelah US2 selesai

```bash
# Tiga modul variatif dibangun serentak oleh developer berbeda:
Developer A: T033–T042  (US3 Fisika)
Developer B: T043–T051  (US4 Ekonomi)
Developer C: T052–T062  (US5 Sejarah)

# Dalam satu modul, dua slot dikerjakan paralel:
Task: "Implementasikan VisualModel di src/modules/physics-motion/VisualModel.tsx"
Task: "Implementasikan UserAction di src/modules/physics-motion/UserAction.tsx"
```

---

## Implementation Strategy

### MVP First (US2 saja)

1. Selesaikan Phase 1: Setup
2. Selesaikan Phase 2: Foundational (KRITIS — memblokir semua story)
3. Selesaikan Phase 3: US2 Matematika
4. **STOP dan VALIDASI**: uji US2 independen lewat quickstart V-2, V-3, V-4
5. Demo jika siap — pada titik ini Shell sudah terbukti reusable

### Incremental Delivery

1. Setup + Foundational → fondasi siap
2. US2 → uji independen → demo (MVP)
3. US3, US4, US5 → paralel → uji masing-masing independen
4. US8 → progres terlihat dan persisten
5. US1 → alur end-to-end lengkap
6. Polish → gate rilis

### Jika waktu menyempit (Prinsip III)

Potong **jumlah modul**, jangan kedalaman modul manapun. Urutan pemotongan: US5 (Sejarah) lebih
dulu, lalu US4 (Ekonomi) — keduanya P2. Merilis 3 modul yang benar-benar lulus lebih baik daripada
4 modul tanggung. Keputusan pemotongan wajib dicatat di file ini beserta alasannya (gate workflow
konstitusi).

---

## Notes

- Task `[P]` = berkas berbeda, tanpa dependensi
- Label `[Story]` memetakan task ke user story untuk keterlacakan
- Commit setelah tiap task atau kelompok logis
- Berhenti di tiap checkpoint untuk memvalidasi story secara independen
- Modul tidak boleh menulis langsung ke telemetry atau progress — keduanya milik Shell dan lapisan luar; penulisan sendiri menghasilkan penghitungan ganda (kontrak aturan 5)

---

## Status Implementasi (2026-07-29)

**69 dari 84 task selesai.** Sisa 15 task **tidak dapat diselesaikan dari lingkungan ini** karena
seluruhnya menuntut peramban sungguhan dan/atau penilaian mata manusia.

### Yang BELUM selesai dan alasannya

| Task | Kenapa belum |
|---|---|
| T041 | Pengukuran 60 fps butuh perangkat & profiler nyata |
| T032, T042, T051, T061, T062 | Quickstart V-2…V-5 per modul — interaksi manual di peramban |
| T068 | Quickstart V-6 — uji persistensi lewat reload halaman sungguhan |
| T074 | Quickstart V-1 — pengukuran "< 5 menit tanpa bantuan" butuh pengguna nyata |
| T075–T078 | Audit visual, aset, tone, dan terminologi — penilaian mata manusia |
| T079 | Audit akhir verifikasi konten oleh reviewer pedagogi manusia |
| T082 | Uji responsivitas lintas viewport nyata |
| T084 | Gate rilis akhir — menunggu seluruh butir di atas |

### Yang menggantikannya sebagian

Beberapa butir verifikasi manual kini punya penjaga otomatis, sehingga regresi tertangkap lebih
awal — tapi ini **melengkapi**, bukan menggantikan, verifikasi manual di peramban:

- `tests/unit/lesson-flow.test.tsx` — menelusuri ketujuh langkah, umpan balik instan, "Kenapa?" pada
  jawaban benar maupun salah, percobaan ulang, penerbitan event, dan FR-014
- `tests/unit/modules-registration.test.ts` — gate konstitusi untuk keempat modul: reviewer ≠ penulis,
  rujukan CP terisi, `conceptIds` non-kosong, penjelasan benar ≠ penjelasan salah
- `tests/unit/shell-registry.test.ts` — membuktikan registry menolak modul cacat

### Catatan deviasi dari R-007

R-007 menetapkan automated test hanya untuk logika murni. Cakupannya diperluas ke uji komponen
alur Shell karena tiga hal terikat SC-004/SC-006 yang **tidak terlihat pada demo manual**: event
yang gagal ditulis, Lumens yang terlanjur diberikan pada pelajaran yang ditinggalkan, dan
penjelasan "Kenapa?" yang hilang pada jawaban benar. Ketiganya lolos mata telanjang, jadi justru
di sanalah test otomatis paling berharga.
