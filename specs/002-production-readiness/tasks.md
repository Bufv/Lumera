---

description: "Task list for Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment (P1 scope)"
---

# Tasks: Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment

**Input**: Design documents from `/specs/002-production-readiness/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Scope of this file**: **Hanya 7 user story P1** (US1–US7) sesuai permintaan eksplisit
("tackle P1 first"). US8–US12 (P2/P3) akan digenerate pada pass `/speckit-tasks` berikutnya
setelah P1 divalidasi, bukan diabaikan.

**Dependensi lintas-spec**: T085 (Atlas reachable) dan T086 (LessonShell reachable) di
`specs/001-core-mvp-prototype/tasks.md` **tidak** memblokir US1–US6 di bawah — keduanya
infrastruktur/operasional yang independen dari apakah alur pelajaran sudah tersambung ke live
app. **US7 (ekspor/impor progres) adalah pengecualian**: implementasinya (T033–T039) bisa selesai
sekarang dengan data sintetis, tapi validasi manual end-to-end (T040 / Quickstart V-7) terblokir
sampai T086 dan T087 (spec 001) selesai, karena saat ini tidak ada jalur live yang menghasilkan
progres nyata untuk diekspor. Lihat T040 untuk detail.

**Tests**: Unit test ditulis untuk logika murni (scrubbing PII, header keamanan, ekspor/impor,
hapus data) mengikuti pola R-007 spec 001. Verifikasi environment/deploy/CI sungguhan dilakukan
manual lewat `quickstart.md` — tidak ada cara realistis mengotomasi verifikasi "apakah rollback
sungguhan bekerja di Cloudflare" dari dalam test suite.

**Organization**: Task dikelompokkan per user story P1 agar tiap story bisa diimplementasikan dan
divalidasi independen (kecuali catatan dependensi lintas-spec pada US7 di atas).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa berjalan paralel (berkas berbeda, tanpa dependensi)
- **[Story]**: User story yang dilayani task ini (US1, US2, ...)

## Path Conventions

Single-project web frontend: `src/`, `tests/`, `.github/` di root repositori (lihat plan.md →
Project Structure).

---

## Phase 1: Setup

**Purpose**: Siapkan dependency dan versi tooling sebelum pipeline/fitur apapun dibangun

- [ ] T001 Tambahkan dependency baru ke `package.json`: `@sentry/react`, `eslint-plugin-jsx-a11y`, `vitest-axe`, `@lhci/cli` (yang terakhir hanya dipakai P2 US10, tapi diinstal sekarang agar `npm install` tidak perlu diulang saat P2 digarap)
- [ ] T002 [P] Tambahkan `.nvmrc` berisi versi Node yang dipakai CI, agar lingkungan lokal dan `ci.yml` konsisten

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fondasi pipeline CI/CD yang dipakai bersama US1 (production deploy) dan US2 (staging
deploy) — **MEMBLOKIR** kedua story tersebut sampai selesai

**⚠️ CRITICAL**: US1 dan US2 tidak dapat dimulai sebelum fase ini selesai; keduanya sama-sama
bergantung pada `ci.yml` sebagai gerbang dan pada environment yang didefinisikan di
`wrangler.jsonc`.

- [ ] T003 Buat `.github/workflows/ci.yml`: jalankan berurutan lint (`npm run lint`), type-check (`tsc -b`), `npm test`, `npm audit --audit-level=high`, dan `npm run build` pada setiap push/PR, sesuai `contracts/ci-pipeline-contract.md` gerbang 1–5
- [ ] T004 [P] Tambahkan environment bernama `staging` dan `production` (nama Worker berbeda) di `wrangler.jsonc` sesuai R-002 `research.md`
- [ ] T005 Tambahkan penyematan commit SHA sebagai `VITE_APP_VERSION` saat build (`vite.config.ts` `define`), dibaca lewat `import.meta.env` — dasar untuk FR-005 (keterlacakan rilis) dan `ErrorReportContext.appVersion` di US3

**Checkpoint**: `ci.yml` menjalankan seluruh gerbang dan environment staging/production sudah
terdefinisi. US1 dan US2 boleh dimulai.

---

## Phase 3: User Story 1 - Deploy Aman dengan Rollback Cepat (Priority: P1) 🎯 MVP

**Goal**: Perubahan yang lolos `ci.yml` deploy otomatis ke production; rollback tersedia dalam
hitungan menit tanpa build ulang.

**Independent Test**: Dorong perubahan gagal test → verifikasi deploy diblokir. Deploy versi yang
lolos → tandai bermasalah → jalankan rollback → verifikasi production kembali ke versi stabil
dalam < 10 menit.

- [ ] T006 [US1] Buat job `production` di `.github/workflows/deploy.yml`: `wrangler deploy --env production`, dipicu hanya pada push ke `main` dengan `needs: ci` mengacu ke T003
- [ ] T007 [US1] Tulis `docs/ops-runbook.md`: prosedur rollback (`wrangler rollback --env production`) dan cara membaca versi/commit yang sedang live (merujuk `VITE_APP_VERSION` dari T005), merujuk `contracts/ci-pipeline-contract.md`
- [ ] T008 [US1] Jalankan Quickstart V-1 (branch gagal test diblokir; rollback production < 10 menit) dan catat hasilnya di `quickstart.md`

**Checkpoint**: US1 berfungsi penuh dan dapat didemokan sendiri — deploy production tergerbang,
rollback terdokumentasi dan teruji.

---

## Phase 4: User Story 2 - Verifikasi di Staging Sebelum Rilis Nyata (Priority: P1)

**Goal**: Perubahan dapat diverifikasi di environment terpisah sebelum menyentuh production.

**Independent Test**: Dorong perubahan ke branch non-`main` → verifikasi staging ter-deploy di
URL/Worker terpisah, tanpa memengaruhi data/pengalaman di production.

- [ ] T009 [US2] Buat job `staging` di `.github/workflows/deploy.yml`: `wrangler deploy --env staging`, dipicu pada push branch manapun selain `main` dengan `needs: ci`
- [ ] T010 [US2] Verifikasi nama/URL Worker `staging` berbeda dari `production` dan catat di `docs/ops-runbook.md` (T007) bahwa keduanya tidak berbagi state/storage apapun
- [ ] T011 [US2] Jalankan Quickstart V-2 dan catat hasilnya di `quickstart.md`

**Checkpoint**: US1 dan US2 bersama membentuk pipeline deploy lengkap — staging untuk verifikasi,
production tergerbang dengan rollback.

---

## Phase 5: User Story 3 - Mengetahui Kegagalan Produksi Sebelum Siswa Melapor (Priority: P1)

**Goal**: Error runtime sisi klien tertangkap dan dilaporkan otomatis, dengan PII tersaring
sebelum meninggalkan perangkat siswa.

**Independent Test**: Picu error runtime disengaja di staging → verifikasi tercatat di dasbor
pemantauan dalam < 5 menit tanpa laporan manual, dan field yang terkirim tidak memuat PII.

- [ ] T012 [US3] Buat project Sentry (tier gratis); simpan DSN sebagai GitHub Actions secret `SENTRY_DSN` dan Cloudflare Worker environment variable untuk `staging`/`production`
- [ ] T013 [US3] Implementasikan `src/monitoring/errorReporting.ts`: inisialisasi Sentry dengan `sendDefaultPii: false` dan `beforeSend` yang **hanya** meloloskan field sesuai `data-model.md` § ErrorReportContext (`message`, `stack`, `route`, `appVersion`) — tolak field lain secara eksplisit, bukan default-allow
- [ ] T014 [US3] Panggil inisialisasi `errorReporting` di `src/main.tsx` sebelum `createRoot(...).render(...)`. Bergantung pada T013
- [ ] T015 [P] [US3] Unit test `beforeSend` di `tests/unit/error-reporting.test.ts`: mock event Sentry berisi `displayName` dan snapshot `localStorage`, verifikasi keduanya tersaring habis sebelum "terkirim"
- [ ] T016 [US3] Konfigurasikan alert rule ambang lonjakan error di dasbor Sentry sesuai FR-007
- [ ] T017 [US3] Jalankan Quickstart V-3 dan catat hasilnya di `quickstart.md` — **verifikasi eksplisit tidak ada PII di event yang benar-benar terkirim**, bukan hanya di unit test mock

**Checkpoint**: Tim mendapat sinyal error produksi otomatis, tanpa membocorkan data siswa ke
pihak ketiga (Constitution Check Prinsip VI, plan.md).

---

## Phase 6: User Story 4 - Gerbang Keamanan Otomatis pada Setiap Rilis (Priority: P1)

**Goal**: Kerentanan dependency tertangkap sebelum rilis; response aplikasi menyertakan header
keamanan standar pada setiap request, bukan hanya fallback SPA.

**Independent Test**: Perkenalkan dependency dengan kerentanan tinggi yang diketahui → verifikasi
rilis ditahan. Periksa response staging/production → verifikasi header keamanan hadir pada aset
200 maupun fallback 404.

- [ ] T018 [US4] Buat `.github/dependabot.yml` (ecosystem `npm`, jadwal mingguan, alert kerentanan aktif)
- [ ] T019 [US4] Ubah `run_worker_first` menjadi `true` di `wrangler.jsonc` (Complexity Tracking, plan.md) — prasyarat agar header dapat disisipkan pada seluruh response, bukan hanya fallback
- [ ] T020 [US4] Implementasikan penyisipan header di `worker/index.js`: bungkus response `env.ASSETS.fetch(request)` dan tambahkan seluruh header pada `contracts/security-headers-contract.md` sebelum dikembalikan. Bergantung pada T019
- [ ] T021 [P] [US4] Ekstrak logika pembangun header ke fungsi murni yang diuji di `tests/unit/security-headers.test.ts` (agar testable tanpa runtime Worker sungguhan)
- [ ] T022 [US4] Jalankan Quickstart V-4: verifikasi `npm audit --audit-level=high` (T003) menahan dependency rentan; verifikasi header hadir di kedua jenis response; verifikasi aset Rive (`koji-gameboard.riv`) dan canvas modul Fisika tidak diblokir CSP

**Checkpoint**: Gerbang keamanan otomatis aktif di CI dan di response — US4 dapat didemokan
independen dari US1–US3.

---

## Phase 7: User Story 5 - Data dan Input Siswa Aman di Sisi Klien (Priority: P1)

**Goal**: Data yang tersimpan di perangkat siswa terbatas pada yang esensial; input bebas siswa
tidak dapat mengeksekusi skrip; build production tidak membocorkan detail internal.

**Independent Test**: Audit seluruh kunci `localStorage` → verifikasi tanpa PII tidak esensial.
Masukkan payload skrip pada nama tampilan → verifikasi tidak tereksekusi di UI manapun.

- [ ] T023 [US5] Audit seluruh kunci `localStorage` aplikasi (`lumera.progress.v1`, `lumera.profile.v1`, kunci telemetry) terhadap FR-010; dokumentasikan hasil sebagai catatan di `quickstart.md` § V-5
- [ ] T024 [P] [US5] Tambahkan test regresi XSS di `tests/unit/xss-safety.test.tsx`: render nama tampilan berisi payload skrip (`<img src=x onerror=...>`) lewat `StudentShell`/`HomeScreen`, assert dirender sebagai teks literal, bukan dieksekusi
- [ ] T025 [US5] Set `build.sourcemap: false` eksplisit di `vite.config.ts` untuk build production dan audit `console.log`/output debug yang bocor ke bundle production
- [ ] T026 [US5] Jalankan Quickstart V-5 dan catat hasilnya di `quickstart.md`

**Checkpoint**: Permukaan data-di-klien dan input siswa terverifikasi aman — independen dari
story lain.

---

## Phase 8: User Story 6 - Kepatuhan Privasi Anak dan Kontrol atas Data Sendiri (Priority: P1)

**Goal**: Siswa/orang tua dapat membaca kebijakan privasi dan menghapus seluruh data pribadi
dalam satu aksi.

**Independent Test**: Buka kebijakan privasi dari aplikasi → verifikasi dapat diakses dan
dipahami. Jalankan aksi hapus-semua-data → verifikasi seluruh data lokal benar-benar hilang.

- [ ] T027 [US6] Tulis konten kebijakan privasi di `src/privacy/content.ts` (bahasa non-teknis: data yang dikumpulkan — nama tampilan, preferensi, progres — dan cara penggunaannya; tanpa PII lain per FR-014)
- [ ] T028 [P] [US6] Implementasikan `src/privacy/PrivacyPolicy.tsx` memakai token desain `src/design/tokens.ts` (Constitution Check Prinsip V, plan.md)
- [ ] T029 [US6] Daftarkan rute kebijakan privasi ke `src/student/routes.ts` dan tautkan dari `SettingsScreen` (`src/student/StudentScreens.tsx`)
- [ ] T030 [US6] Implementasikan aksi "hapus semua data saya" yang memanggil `resetLearnerProfile()` (`src/profile/store.ts`), `resetProgres()` (`src/progress/store.ts`), **dan** pembersihan storage telemetry sekaligus — perluas `onRequestResetProfile`/`confirmReset` di `src/student/StudentApp.tsx` yang saat ini hanya me-reset profil, tidak progress/telemetry
- [ ] T031 [P] [US6] Unit test aksi hapus-semua-data di `tests/unit/data-deletion.test.ts`: isi ketiga kunci storage dengan data fixture, jalankan aksi, verifikasi ketiganya kosong setelahnya
- [ ] T032 [US6] Jalankan Quickstart V-6 dan catat hasilnya di `quickstart.md`

**Checkpoint**: US6 dapat didemokan independen — kebijakan privasi dan hak hapus data berfungsi
penuh terlepas dari status story lain.

---

## Phase 9: User Story 7 - Progres Siswa Tidak Hilang Permanen (Priority: P1)

**Goal**: Siswa dapat mengekspor progres ke berkas eksternal dan memulihkannya di perangkat
manapun.

**Independent Test**: Selesaikan pelajaran (⚠️ lihat T040), ekspor progres, hapus data browser,
verifikasi hilang, impor kembali, verifikasi seluruh state pulih.

- [ ] T033 [US7] Tambahkan field `schemaVersion: number` ke `Siswa` (`src/progress/store.ts`) dan fungsi migrasi dasar (v1 = bentuk field saat ini) sesuai `data-model.md` § Siswa
- [ ] T034 [P] [US7] Tambahkan field `schemaVersion: number` ke `LearnerProfile` (`src/profile/store.ts`) dan fungsi migrasi dasar, pola sama dengan T033
- [ ] T035 [US7] Definisikan tipe `ExportedProgressFile` di `src/backup/schema.ts` sesuai `contracts/progress-export-contract.md`. Bergantung pada T033, T034
- [ ] T036 [US7] Implementasikan `src/backup/export.ts`: bangun `ExportedProgressFile` dari state `Siswa` + `LearnerProfile` saat ini, unduh sebagai `lumera-progres-<YYYY-MM-DD>.json` lewat `Blob` + `<a download>`. Bergantung pada T035
- [ ] T037 [US7] Implementasikan `src/backup/import.ts`: parse JSON, validasi `schemaVersion` dikenali dan bentuk `siswa`/`learnerProfile` valid, tolak dengan pesan jelas jika tidak (kontrak aturan 2, 3, 5), peringatkan sebelum menimpa jika `exportedAt` berkas lebih lama dari data lokal (kontrak aturan 4). Bergantung pada T035
- [ ] T038 [US7] Sambungkan kontrol ekspor/impor ke `SettingsScreen` (`src/student/StudentScreens.tsx`). Bergantung pada T036, T037
- [ ] T039 [P] [US7] Unit test round-trip ekspor/impor dan penolakan skema tidak cocok di `tests/unit/backup.test.ts`, memakai fixture `Siswa`/`LearnerProfile` sintetis — **tidak bergantung pada lesson engine sungguhan**, dapat dikerjakan sekarang
- [ ] T040 [US7] **Catatan dependensi lintas-spec (bukan kode)**: validasi manual penuh Quickstart V-7 ("selesaikan satu pelajaran, catat Lumens/streak/mastery, lalu ekspor") terblokir sampai `specs/001-core-mvp-prototype/tasks.md` T086 (wire `LessonShell` agar dapat dijangkau siswa) dan T087 (sambungkan `Siswa` store nyata ke UI live) selesai — saat ini tidak ada jalur live yang menghasilkan progres nyata untuk diekspor. T033–T039 di atas tetap selesai dan teruji penuh sekarang lewat fixture sintetis; task ini hanya menahan langkah validasi manual V-7 sampai prasyaratnya ada, dan MUST dijalankan begitu T086/T087 selesai — jangan dilupakan begitu blocker hilang

**Checkpoint**: Mekanisme ekspor/impor selesai dan teruji unit; validasi manual end-to-end
menunggu penyelesaian T086/T087 di spec 001 (lihat T040).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: tanpa dependensi — bisa langsung dimulai
- **Foundational (Phase 2)**: bergantung pada Setup — **MEMBLOKIR US1 dan US2**
- **US1, US2 (Phase 3–4)**: bergantung pada Foundational; independen satu sama lain setelahnya
- **US3, US4, US5, US6, US7 (Phase 5–9)**: hanya bergantung pada Setup — **tidak** bergantung pada
  Foundational (Phase 2) maupun pada US1/US2, sehingga bisa dikerjakan paralel dengan Phase 3–4
- **US7 khusus**: implementasi (T033–T039) independen; validasi manual (T040) bergantung pada
  `specs/001-core-mvp-prototype` T086 dan T087 — dependensi eksternal ke spec lain, bukan ke task
  manapun dalam file ini

### Within Each Story

- Perubahan skema/kontrak sebelum implementasi yang memakainya (mis. T033/T034 sebelum T035)
- Unit test bisa paralel dengan task lain begitu berkas yang diuji sudah didefinisikan bentuknya
- Verifikasi Quickstart selalu task terakhir tiap story

### Parallel Opportunities

- T001, T002 (Setup) bisa paralel
- T004 (Foundational) bisa paralel dengan T003/T005
- **Setelah Foundational selesai**: US1 dan US2 bisa dikerjakan dua developer paralel
- **US3, US4, US5, US6, US7 sepenuhnya independen dari US1/US2 dan satu sama lain** — bisa
  dikerjakan hingga lima developer paralel begitu Setup (Phase 1) selesai
- T015 (US3), T021 (US4), T024 (US5), T031 (US6), T028+T034+T039 (US6/US7) — seluruh task
  bertanda `[P]` dalam story yang sama bisa paralel dengan task `[P]` lain di story yang sama

---

## Parallel Example: Setelah Setup selesai

```bash
# Lima story P1 yang tidak menyentuh ci.yml/wrangler.jsonc bisa mulai serentak,
# paralel dengan Foundational (Phase 2) yang dikerjakan developer lain:
Developer A: T012–T017  (US3 Observability)
Developer B: T018–T022  (US4 Gerbang Keamanan)
Developer C: T023–T026  (US5 Data & Input Aman)
Developer D: T027–T032  (US6 Privasi & Hapus Data)
Developer E: T033–T040  (US7 Ekspor/Impor Progres)

# Setelah Foundational (T003–T005) selesai:
Developer F: T006–T008  (US1 Deploy & Rollback)
Developer G: T009–T011  (US2 Staging)
```

---

## Implementation Strategy

### MVP First (US1 + US2 saja)

1. Selesaikan Phase 1: Setup
2. Selesaikan Phase 2: Foundational (KRITIS — memblokir US1 dan US2)
3. Selesaikan Phase 3: US1 (deploy + rollback)
4. Selesaikan Phase 4: US2 (staging)
5. **STOP dan VALIDASI**: jalankan Quickstart V-1 dan V-2 — pipeline deploy aman sudah bisa
   dipakai untuk merilis story P1 lain dengan lebih percaya diri

### Incremental Delivery

1. Setup → fondasi CI/CD siap (Foundational)
2. US1 + US2 → pipeline deploy aman dengan staging — semua rilis berikutnya lewat jalur ini
3. US3, US4, US5, US6, US7 → paralel, masing-masing diverifikasi independen lewat Quickstart-nya
4. US7 khusus: implementasi selesai, tapi tandai T040 sebagai item terbuka sampai spec 001 T086/T087 selesai
5. Setelah seluruh P1 (US1–US7) selesai dan tervalidasi → lanjut `/speckit-tasks` untuk P2/P3 (US8–US12)

### Jika waktu menyempit

Ikuti urutan pemotongan yang sudah dicatat di Complexity Tracking `plan.md` — **tidak berlaku di
sini karena seluruh task di atas adalah P1** (tidak boleh dipotong sebagian per Constitution
Check Prinsip III). Jika sungguh terpaksa, US7 (T033–T040) adalah kandidat penundaan paling aman
di antara ketujuh P1, karena sudah punya blocker eksternal (T040) yang menahannya dari validasi
penuh — menunda seluruh story tidak menambah risiko baru di atas yang sudah ada.

---

## Notes

- Task `[P]` = berkas berbeda, tanpa dependensi
- Label `[Story]` memetakan task ke user story P1 untuk keterlacakan
- Commit setelah tiap task atau kelompok logis
- Berhenti di tiap checkpoint untuk memvalidasi story secara independen
- US8–US12 (P2/P3: ketahanan localStorage, aksesibilitas, performa, code-splitting modul, kontrak
  skema siap-backend) **belum** ada di file ini — akan digenerate lewat `/speckit-tasks` lagi
  setelah P1 selesai/tervalidasi, sesuai instruksi eksplisit untuk fokus P1 dulu
