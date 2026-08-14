---

description: "Task list for Penyempitan Cakupan — Lumera Atlas Ditunda ke Pengembangan Berikutnya"
---

# Tasks: Penyempitan Cakupan — Lumera Atlas Ditunda ke Pengembangan Berikutnya

**Input**: Design documents from `/specs/004-defer-lumera-atlas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md) (`contracts/` sengaja tidak
ada — lihat plan.md § Project Structure)

**Context tambahan dari user** (dipakai untuk menyisir tasks di bawah): "pastikan semua logika juga
diimplementasikan di interface di semua endpoint (cek semuanya)". Di aplikasi SPA ini, "endpoint"
= setiap callback prop yang diekspos komponen layar (`onMulai`, `onBukaBelajar`, `onBukaPetaIlmu`,
`onBukaKursus`, `onMulaiPelajaran`, `onKembali`) dan setiap route (`home`, `learn`). Audit ini
menemukan satu callback yang **tidak boleh** disambungkan begitu saja: `onBukaPetaIlmu` di
`Beranda.tsx` secara harfiah berarti "buka Atlas" — yang justru ditunda oleh spec ini. Lihat T009
untuk resolusinya (bukan diarahkan diam-diam ke layar lain, tapi dijadikan kontrol
disabled/"segera hadir" konsisten dengan pola yang SUDAH ada di `StudentShell.tsx`).

**Tests**: Disertakan — plan.md § Technical Context (Testing) secara eksplisit meminta test
integrasi loop inti dan regression test deferral Atlas. Ditulis dengan pola TDD (test dulu, harus
FAIL, baru implementasi) untuk User Story 1, satu-satunya story yang mengubah kode produksi.

**Organization**: Task dikelompokkan per user story (US1, US2, US3) sesuai prioritas di spec.md.
US1 murni kode; US2 murni dokumen spec 001; US3 dokumen README + verifikasi non-destruktif kode
Atlas. US2/US3 independen dari US1 **kecuali satu task** (T018, ditandai eksplisit) yang butuh US1
selesai lebih dulu untuk bisa dicentang jujur — lihat Dependencies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa berjalan paralel (berkas berbeda, tanpa dependensi)
- **[Story]**: User story yang dilayani task ini (US1, US2, US3)

## Path Conventions

Single-project web frontend: `src/`, `tests/unit/` di root repositori (lihat plan.md → Project
Structure). Dokumen spec di `specs/001-core-mvp-prototype/` dan `specs/004-defer-lumera-atlas/`.

---

## Phase 1: Setup

**Purpose**: Rekam baseline sebelum perubahan apa pun, agar hasil bisa dibandingkan di Polish.

- [X] T001 Jalankan `grep -rln "atlas/Atlas\|shell/HeaderNav\|progress/ProgressSummary" src/App.tsx src/main.tsx src/student/StudentApp.tsx` dari root repo dan konfirmasi nol match (baseline "sebelum" — harus tetap nol match "sesudah" di T022, karena fitur ini TIDAK memasang Atlas/HeaderNav/ProgressSummary, hanya Beranda/Belajar/KursusDetail). Simpan output sebagai baseline.

**Checkpoint**: Baseline tercatat — tidak ada task Foundational terpisah; US1 (kode), US2 (dokumen
spec 001), dan US3 (dokumen README + verifikasi) menyentuh berkas yang sama sekali berbeda,
sehingga bisa dikerjakan paralel, kecuali T018 (lihat Dependencies).

---

## Phase 2: User Story 1 - Siswa mencapai dan menyelesaikan pelajaran tanpa Atlas (Priority: P1) 🎯 MVP

**Goal**: Pasang generasi UI kedua yang sudah dibangun (`Beranda`/`Belajar`/`KursusDetail`) ke
`StudentApp` yang live, sambungkan ke `LessonShell` lewat `muatModul`, dan pastikan setiap callback
("endpoint") yang diekspos ketiga layar itu benar-benar tersambung ke logika nyata — tidak ada yang
dibiarkan menjadi no-op atau salah sambung ke fitur yang ditunda (Atlas).

**Independent Test**: Jalankan test regresi T002–T004; buka `npm run dev` dari profil baru
(non-demo), telusuri Beranda → Belajar → KursusDetail → selesaikan satu pelajaran penuh
(quickstart.md langkah 1).

### Tests for User Story 1 ⚠️

> **Tulis tests ini LEBIH DULU, pastikan FAIL sebelum mengerjakan T006–T012.**

- [X] T002 [P] [US1] Buat test baru `tests/unit/loop-inti-tanpa-atlas.test.tsx`: render `App` dengan `LearnerProfile` yang sudah `onboardingComplete` dan `Siswa` progres nol (non-demo, `#/beranda`); assert layar yang tampil adalah `Beranda` generasi-2 (mis. cari heading sapaan dari `sapaanWaktu`, atau `getByText` string unik `Beranda.tsx` seperti "Refresh harian") — **bukan** `HomeScreen` fixture lama (yang menampilkan copy demo/`ARDI_DEMO_FIXTURE`). Harus FAIL saat ini karena `StudentApp.tsx` masih merender `HomeScreen` untuk route `home`.
- [X] T003 [P] [US1] Di file yang sama, tambah test: dari Beranda, klik salah satu tombol "Mulai"/item refresh (`onMulai`), assert `LessonShell` langkah 1 (Prompt) tampil — **bukan** `InfoDrawer` "hadir pada batch berikutnya". Selesaikan pelajaran sampai `Step7_Continue` ("Lanjutkan"), assert kembali ke Beranda dan `siswa.lumens`/mastery yang ditampilkan bertambah dibanding sebelum pelajaran (baca ulang `bacaSiswa()` di assertion, bukan state komponen). Harus FAIL saat ini (tidak ada glue `muatModul`/`LessonShell` di `StudentApp.tsx`).
- [X] T004 [P] [US1] Di file yang sama, tambah test: dari Beranda navigasi `onBukaBelajar` → assert `Belajar` tampil; dari `Belajar` klik sebuah kursus (`onBukaKursus`) → assert `KursusDetail` tampil dengan `kursus`/`jalur` yang benar; dari `KursusDetail` klik `onKembali` → assert kembali ke `Belajar` (bukan ke Beranda). Harus FAIL saat ini karena route `learn` masih merender `LearnScreen` lama tanpa sub-state kursus.
- [X] T005 [P] [US1] Tambah komentar di `tests/unit/student-app.test.tsx` tepat di atas test `'opens module information but never a lesson player'` (baris ~235) menjelaskan bahwa test ini sengaja tetap menguji jalur `IntegerCourseScreen`/katalog "Bilangan Bulat" lama (route `integers`, mode demo) yang **bukan** bagian dari 4 modul `LessonShell` konstitusi dan **tidak** disentuh oleh spec 004 — supaya pembaca berikutnya tidak mengira ini gap yang terlewat. Test ini TIDAK diubah perilakunya, hanya diberi anotasi.

### Implementation for User Story 1

- [X] T006 [US1] Di `src/student/StudentApp.tsx`: tambah state baru untuk pelajaran yang sedang dimuat/dimainkan (mis. `activeLesson: AnyLessonModule | null`, `loadingModuleId: string | null`) dan handler `bukaPelajaran(id: string)` yang memanggil `muatModul(id)` (dari `../modules`, async) lalu set `activeLesson`; handler `tutupPelajaran()` yang meng-clear `activeLesson`/`loadingModuleId` **dan** memanggil `setSiswa(bacaSiswa())` (pola yang sama dengan `onImportApplied` yang sudah ada) supaya progres ter-refresh baik saat pelajaran diselesaikan maupun keluar di tengah jalan.
- [X] T007 [US1] Di `src/student/StudentApp.tsx`, tambah render kondisional `<LessonShell modul={activeLesson} onKeluar={tutupPelajaran} onSelesai={tutupPelajaran} />` sebagai overlay (pola yang sama dengan blok `{selectedModule && <InfoDrawer>...}` yang sudah ada), plus indikator loading singkat saat `loadingModuleId` di-set tapi `activeLesson` belum resolve (data-model.md § "status muat"). (Depends on T006)
- [X] T008 [US1] Di `src/student/StudentApp.tsx` case `'home'`: untuk `!location.demo`, render `<Beranda siswa={siswa} onMulai={bukaPelajaran} onBukaBelajar={() => navigate('learn')} />` (tanpa prop `onBukaPetaIlmu` — lihat T009) menggantikan `<HomeScreen ...>`; untuk `location.demo` tetap `<HomeScreen ...>` seperti sekarang (mode demo Ardi di luar cakupan spec ini — spec.md Assumptions). (Depends on T006)
- [X] T009 [US1] Di `src/beranda/Beranda.tsx`: hapus prop `onBukaPetaIlmu` dari signature komponen dan tempat pemanggilannya; ganti tombol "Peta Ilmu" (baris ~114-117, saat ini `onClick={onBukaPetaIlmu}`) menjadi kontrol disabled/"segera hadir" — samakan pola dengan `student-nav__item--locked` di `src/student/StudentShell.tsx` (baris ~135-144: `disabled`, `aria-disabled="true"`, `aria-label="Peta Ilmu, segera hadir"`, `title="Peta Ilmu · Segera hadir"`). **Alasan**: tombol ini secara harfiah adalah pintu ke Atlas; Atlas ditunda oleh spec ini, jadi tombolnya MUST NOT diam-diam diarahkan ke layar lain — harus jujur bilang "belum tersedia", konsisten dengan affordance yang sudah ada di nav bar untuk fitur yang sama. [P]
- [X] T010 [US1] Di `src/student/StudentApp.tsx` case `'learn'`: untuk `!location.demo`, tambah state `openKursusId: string | null`; jika `null` render `<Belajar siswa={siswa} onBukaKursus={setOpenKursusId} />`; jika terisi, cari kursus via `ambilKursus(openKursusId)` dan jalurnya via `jalurUntukKursus(...)` (dari `../courses/katalog`), lalu render `<KursusDetail kursus={...} jalur={...} siswa={siswa} onMulaiPelajaran={bukaPelajaran} onKembali={() => setOpenKursusId(null)} />`. Untuk `location.demo` tetap `<LearnScreen ...>` seperti sekarang. (Depends on T006)
- [X] T011 [US1] Di `src/student/StudentApp.tsx`, tambahkan reset `activeLesson`/`loadingModuleId`/`openKursusId` ke `useEffect` yang sudah ada (baris ~154-158, saat ini me-reset `selectedModule`/`selectedConcept`/`confirmAction` setiap `[location.route, location.demo]` berubah) — supaya navigasi keluar dari `home`/`learn` selalu membersihkan state transient ini. (Depends on T006, T010)
- [X] T012 [US1] Jalankan ulang `npm test -- loop-inti-tanpa-atlas` dan konfirmasi T002–T004 sekarang PASS setelah T006–T011. (Depends on T006, T007, T008, T009, T010, T011)

**Checkpoint**: US1 selesai — loop inti (Beranda → Belajar → KursusDetail → LessonShell →
progres nyata) bisa dicoba end-to-end tanpa Atlas; setiap callback yang diekspos Beranda/Belajar/
KursusDetail tersambung ke logika nyata (tidak ada endpoint yang dibiarkan kosong atau salah
sambung ke Atlas).

---

## Phase 3: User Story 2 - Requirement Atlas di spec 001 ditandai jelas sebagai pekerjaan mendatang (Priority: P2)

**Goal**: Sinkronkan `specs/001-core-mvp-prototype/spec.md` dan `tasks.md` dengan penundaan Atlas —
bagian terdampak ditandai **Deferred — Next Development**, bukan dihapus diam-diam.

**Independent Test**: Baca ulang `specs/001-core-mvp-prototype/spec.md` dan `tasks.md` setelah
T013–T018; setiap rujukan Atlas yang tersisa harus punya anotasi eksplisit (quickstart.md
langkah 4).

> Task T013–T018 mengedit dua berkas yang sama — dikerjakan berurutan per berkas untuk menghindari
> conflict, tapi independen dari US1 kecuali T018 (lihat Dependencies).

### Implementation for User Story 2

- [X] T013 [US2] Di `specs/001-core-mvp-prototype/spec.md`, tambahkan anotasi **"Deferred — Next Development"** tepat di atas judul **User Story 1 - Navigasi Lumera Atlas** (baris ~28), merujuk `specs/004-defer-lumera-atlas/spec.md` — JANGAN hapus teks story aslinya (pola yang sama dengan penandaan "Superseded" di spec 003 T005).
- [X] T014 [US2] Di `specs/001-core-mvp-prototype/spec.md`, tambahkan anotasi Deferred yang sama pada **FR-001** dan **FR-002** (baris ~169-170, tentang Atlas sebagai homepage) — teks requirement asli dipertahankan.
- [X] T015 [US2] Di `specs/001-core-mvp-prototype/spec.md`, revisi **SC-001** dan **SC-002** (baris ~206) agar diukur dari entry point non-Atlas yang sekarang benar-benar dipakai (Beranda, hasil US1 spec 004); catat versi "via Atlas" sebagai target next-development terpisah, bukan dihapus. (Depends on T013 secara konten — SC harus konsisten dengan status Deferred di atas)
- [X] T016 [US2] Di `specs/001-core-mvp-prototype/tasks.md`, tandai **T085** (baris ~382, "Make Lumera Atlas ... the reachable homepage") sebagai **Deferred — Next Development** merujuk spec 004 — teks task asli dipertahankan.
- [X] T017 [US2] Di `specs/001-core-mvp-prototype/tasks.md`, pecah **T089** (baris ~386, keputusan atas `src/atlas/`, `src/beranda/`, `src/courses/`): bagian `src/atlas/` ditandai Deferred (keputusannya "simpan sebagai dormant code untuk next development" — spec 004 US3); bagian `src/beranda/`/`src/courses/` ditandai selesai oleh spec 004 US1 (terintegrasi lewat T006-T011 di atas); `src/shell/HeaderNav.tsx`/`src/progress/ProgressSummary.tsx` dicatat sebagai keputusan terpisah yang masih terbuka (research.md Decision 2 spec 004 — bukan bagian Atlas, bukan pula diselesaikan spec ini).
- [X] T018 [US2] Di `specs/001-core-mvp-prototype/tasks.md`, perbarui **T086** dan **T087** (baris ~383-384): hapus rujukan implisit ke Atlas sebagai prasyarat, catat bahwa keduanya terpenuhi lewat US1 spec 004 (Beranda/KursusDetail/Belajar + `LessonShell`, bukan lewat Atlas), dan tandai selesai — **hanya centang setelah T012 (verifikasi US1) PASS**, bukan sebelumnya. (Depends on T012)

**Checkpoint**: US2 selesai — spec 001 tersinkron, tidak ada requirement Atlas yang masih terbaca
sebagai gate rilis terbuka untuk siklus ini.

---

## Phase 4: User Story 3 - Kode Atlas tetap tersimpan sebagai aset pengembangan berikutnya (Priority: P3)

**Goal**: Dokumentasikan status Atlas di `README.md`, dan verifikasi (bukan ubah) bahwa kode Atlas
tidak ikut terhapus oleh perubahan US1.

**Independent Test**: Baca `README.md` § Status implementasi setelah T019; konfirmasi `src/atlas/`
masih ada tanpa dihapus (quickstart.md langkah 3 dan 5).

### Implementation for User Story 3

- [X] T019 [P] [US3] Di `README.md` § Status implementasi, ubah baris terkait Atlas/homepage menjadi "Direncanakan untuk pengembangan berikutnya", merujuk `specs/004-defer-lumera-atlas/spec.md`.
- [X] T020 [US3] Jalankan `ls src/atlas/Atlas.tsx src/atlas/Atlas.css src/atlas/subject-worlds.ts` dan konfirmasi ketiganya masih ada tanpa perubahan isi (`git diff --stat src/atlas/` harus kosong) — task verifikasi murni, bukan edit (pola yang sama dengan T003 di spec 003).
- [X] T021 [P] [US3] Jalankan `npm test -- suggestions` (atau test yang menutupi `src/progress/suggestions.ts`) dan konfirmasi tetap PASS — membuktikan pemakaian `subject-worlds.ts` di luar komponen visual Atlas tidak ikut regresi (FR-007 spec.md).

**Checkpoint**: US3 selesai — dokumentasi mencerminkan status Atlas yang sebenarnya, kode Atlas
terverifikasi utuh.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validasi akhir lintas-story sebelum merge.

- [X] T022 Jalankan ulang `grep -rln "atlas/Atlas\|shell/HeaderNav\|progress/ProgressSummary" src/App.tsx src/main.tsx src/student/StudentApp.tsx` dan konfirmasi nol match, sama seperti baseline T001 (quickstart.md langkah 2) — membuktikan US1 tidak diam-diam memasang Atlas/HeaderNav/ProgressSummary.
- [X] T023 Jalankan `npm run build && npm run bundle-size-report` dan konfirmasi ke-4 modul pelajaran (termasuk komponen React-nya) tidak ikut masuk ke chunk awal — `muatModul(id)` tetap dinamis (quickstart.md langkah 6, no regresi US11 spec 002).
- [X] T024 Jalankan `npm test` (full suite) dan konfirmasi seluruh test lulus, termasuk T002-T005 yang baru ditambahkan.
- [X] T025 Jalankan seluruh langkah `quickstart.md` (1–8) end-to-end, termasuk cek visual Prinsip V (langkah 7, Beranda/KursusDetail di desktop dan mobile — belum pernah dirender dalam konteks nyata sebelumnya), dan catat hasilnya (PASS/FAIL per langkah) di deskripsi PR.

  **Hasil (dijalankan via `npm run dev` + Playwright headless, screenshot desktop 1280px & mobile 390px)**:
  - Langkah 1 (loop inti): PASS — juga sudah dibuktikan otomatis oleh `loop-inti-tanpa-atlas.test.tsx`.
  - Langkah 2 (Atlas/HeaderNav/ProgressSummary tidak terpasang): PASS (= T022).
  - Langkah 3 (kode Atlas utuh): PASS (= T020).
  - Langkah 4 (dokumen spec 001 tersinkron): PASS (= T013–T018).
  - Langkah 5 (README): PASS (= T019).
  - Langkah 6 (code-splitting/bundle): PASS (= T023).
  - Langkah 7 (visual Prinsip V, desktop + mobile): **PASS setelah 2 perbaikan** yang ditemukan
    lewat verifikasi ini sendiri — persis skenario yang diantisipasi quickstart ("belum pernah
    dirender dalam konteks nyata"), karena `KursusDetail`/`Belajar` sebelumnya hanya pernah diuji
    di jsdom (tidak menghitung layout CSS sungguhan):
    1. `src/courses/KursusDetail.css`: selector `.level__peta svg` (deskendan, semua kedalaman)
       tidak sengaja ikut menimpa ukuran ikon kunci/centang di dalam `.simpul__kartu` (svg
       bersarang), meregangkannya jadi 206×76px menutupi label teks pelajaran yang belum
       tersedia. Diperbaiki jadi `.level__peta > svg` (anak langsung saja — hanya svg jalur).
    2. `src/courses/Belajar.css` (breakpoint mobile): `.cari-kolom` memakai `flex: 1 1 20rem`
       yang berarti lebar minimal di layout baris (desktop); begitu breakpoint mobile membalik
       `.belajar__cari` ke `flex-direction: column`, flex-basis yang sama mengikuti sumbu utama
       baru (vertikal) → kotak pencarian tingginya 320px, bukan lebarnya. Diperbaiki dengan
       `flex-basis: auto` di breakpoint yang sama.
    Keduanya murni perbaikan CSS pada komponen yang sudah ada (bukan penambahan fitur), diverifikasi
    ulang lewat screenshot sebelum/sesudah dan `npm test`/`tsc -b`/`eslint` tetap hijau — tidak ada
    unit test otomatis untuk keduanya (pola sama seperti T013 di spec 003: jsdom tidak menghitung
    layout CSS sungguhan).
  - Langkah 8 (full test suite): PASS (= T024, 251/251).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Tidak ada dependensi — jalankan lebih dulu untuk baseline.
- **User Story 1 (Phase 2)**: Hanya bergantung pada Phase 1. Satu-satunya story yang mengubah kode
  produksi — MVP.
- **User Story 2 (Phase 3)**: Hanya bergantung pada Phase 1, **kecuali T018** yang butuh US1 (T012)
  selesai lebih dulu (task itu mencentang T086/T087 di spec 001 sebagai selesai — tidak jujur untuk
  mencentangnya sebelum kodenya benar-benar ada).
- **User Story 3 (Phase 4)**: Hanya bergantung pada Phase 1. Independen penuh dari US1/US2.
- **Polish (Phase 5)**: Bergantung pada US1 + US2 + US3 semuanya selesai.

### User Story Dependencies

- **User Story 1 (P1)**: Tidak bergantung pada story lain.
- **User Story 2 (P2)**: Independen dari US1 kecuali T018 (lihat di atas).
- **User Story 3 (P3)**: Tidak bergantung pada story lain.

### Within Each User Story

- US1: tests (T002-T005) ditulis dan harus FAIL dulu, baru implementasi (T006-T011 — sebagian besar
  berurutan karena sama-sama menyunting `StudentApp.tsx`, T009 di berkas berbeda jadi paralel),
  baru verifikasi ulang (T012).
- US2: T013-T017 berurutan per berkas (dua berkas: `spec.md` lalu `tasks.md`); T018 menunggu US1.
- US3: T019 paralel dengan T020/T021 (berkas berbeda); T020 dan T021 juga bisa paralel satu sama
  lain.

### Parallel Opportunities

- Setelah T001 (Setup) selesai: **Phase 2 (US1) dan Phase 4 (US3) bisa mulai paralel penuh**;
  Phase 3 (US2) juga bisa mulai paralel tapi T018-nya harus menunggu T012.
- Dalam US1: T002, T003, T004, T005 (test, sebagian besar berkas sama tapi menambah test case
  berbeda — aman ditulis paralel oleh orang berbeda lalu digabung) bisa dikerjakan bersamaan;
  T009 (berkas `Beranda.tsx`) paralel dengan T006-T008/T010-T011 (berkas `StudentApp.tsx`).
- Dalam US3: T019, T020, T021 seluruhnya paralel (berkas berbeda, tidak saling bergantung).

---

## Parallel Example: Lintas Story (setelah T001)

```bash
# US1 dan US3 bisa dikerjakan bersamaan oleh developer/agent berbeda; US2 menyusul, T018-nya
# menunggu US1 selesai:
Task: "US1 — tests/unit/loop-inti-tanpa-atlas.test.tsx, lalu wiring LessonShell di StudentApp.tsx + Beranda.tsx (T006-T012)"
Task: "US3 — README.md status implementasi + verifikasi src/atlas/ utuh (T019-T021)"
Task: "US2 — sinkronisasi specs/001-core-mvp-prototype/spec.md + tasks.md (T013-T017), T018 menunggu US1"
```

---

## Implementation Strategy

### MVP First (User Story 1 saja)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: User Story 1 (T002-T012)
3. **STOP and VALIDATE**: loop inti bisa dicoba end-to-end tanpa Atlas — ini sudah menutup risiko
   utama (produk tidak bisa dibuktikan bekerja sama sekali).
4. User Story 2 (dokumen spec 001) dan User Story 3 (README + verifikasi) dapat menyusul sebagai
   increment berikutnya, tidak memblokir MVP di atas.

### Incremental Delivery

1. Setup → baseline tercatat
2. US1 (P1, MVP) → loop inti bisa dicoba nyata untuk pertama kalinya
3. US2 + US3 (bisa paralel, P2/P3) → dokumen dan repo tersinkron dengan keputusan penundaan Atlas
4. Polish → audit akhir lintas-story, siap merge

---

## Notes

- [P] tasks = berkas berbeda (atau bagian independen dari berkas yang sama), tanpa dependensi.
- [Story] label memetakan task ke user story untuk traceability.
- **Instrumentasi (Prinsip VI)**: tidak ada task instrumentasi baru — `LessonShell` sudah mencatat
  telemetry per percobaan sejak spec 001; fitur ini hanya mengaktifkannya untuk siswa nyata dengan
  menyambungkannya, tidak mengubah mekanismenya.
- **Kebenaran konten (Prinsip IV)**: tidak berlaku — tidak ada konten pelajaran baru; ke-4 modul
  yang disambungkan sudah lolos gate `verifikasi` di `registry.ts` sejak spec 001.
- **Struktur 7 langkah (Prinsip II)**: tidak berlaku diubah — `LessonShell` yang menegakkannya tidak
  disentuh; fitur ini hanya membuatnya *reachable*.
- **Privasi (Prinsip VIII)**: tidak ada task tinjauan privasi baru — tidak ada field data siswa
  baru (lihat data-model.md); `Siswa` yang dibaca/ditulis adalah skema yang sama yang sudah
  melewati kerja privasi spec 002.
- Commit setelah tiap task atau kelompok task logis.
- Berhenti di tiap checkpoint untuk memvalidasi story secara independen.
