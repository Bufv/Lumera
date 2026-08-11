---

description: "Task list for Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment (P1 scope)"
---

# Tasks: Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment

**Input**: Design documents from `/specs/002-production-readiness/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Scope of this file**: **seluruh 12 user story** — US1–US7 (P1, Tahap 1) dan US8–US12 (P2/P3,
Tahap 2) — ditambah Phase 10–12 (remediasi temuan analisis dan requirement susulan) serta dua task
`[Governance]` yang berasal langsung dari konstitusi.

US8–US12 ditambahkan pada pass `/speckit-tasks` kedua (2026-08-11), setelah `/speckit-specify`
memberi mereka kriteria terukur — SC-011 dan SC-012 untuk aksesibilitas, protokol pengukuran
SC-007 dan anggaran SC-013 untuk performa, serta tabel gerbang Tahap 2 per-requirement. Sebelum
itu US9 dan US10 tidak punya definisi selesai, jadi men-generate-nya lebih awal akan menghasilkan
task yang harus diulang.

**Dependensi lintas-spec**: T085 (Atlas reachable), T086 (LessonShell reachable), dan T087
(sambungkan `Siswa` store nyata ke UI live) di `specs/001-core-mvp-prototype/tasks.md` **tidak**
memblokir US1–US6 di bawah — seluruhnya infrastruktur/operasional yang independen dari apakah alur
pelajaran sudah tersambung ke live app. **US7 (ekspor/impor progres) adalah pengecualian**:
implementasinya (T033–T039) bisa selesai sekarang dengan data sintetis, tapi validasi manual
end-to-end (T040 / Quickstart V-7) terblokir sampai **T086 dan T087** (spec 001) selesai, karena
saat ini tidak ada jalur live yang menghasilkan progres nyata untuk diekspor. Lihat T040 untuk
detail — T087 disebut di sini juga supaya blocker tidak dikira hilang begitu T086 di-merge.

**Tests**: Unit test ditulis untuk logika murni (scrubbing PII, header keamanan, ekspor/impor,
hapus data) mengikuti pola R-007 spec 001. Verifikasi environment/deploy/CI sungguhan dilakukan
manual lewat `quickstart.md` — tidak ada cara realistis mengotomasi verifikasi "apakah rollback
sungguhan bekerja di Cloudflare" dari dalam test suite.

**Organization**: Task dikelompokkan per user story P1 agar tiap story bisa diimplementasikan dan
divalidasi independen (kecuali catatan dependensi lintas-spec pada US7 di atas).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Bisa berjalan paralel — **berkas berbeda**, tidak menunggu task `[P]` lain di story yang sama. Ini **bukan** klaim "tanpa dependensi sama sekali": task test bertanda `[P]` (T015, T031, T039) tetap butuh berkas yang diujinya ada lebih dulu. Dependensi urutan sungguhan selalu ditulis eksplisit di deskripsi task ("Bergantung pada T035"), jadi `[P]` dan "Bergantung pada …" bisa muncul bersamaan tanpa saling bertentangan
- **[Story]**: User story yang dilayani task ini (US1, US2, ...); `[Governance]` menandai task yang berasal dari konstitusi, bukan dari satu user story

## Path Conventions

Single-project web frontend: `src/`, `tests/`, `.github/` di root repositori (lihat plan.md →
Project Structure).

---

## Phase 1: Setup

**Purpose**: Siapkan dependency dan versi tooling sebelum pipeline/fitur apapun dibangun

- [X] T001 Tambahkan dependency baru ke `package.json`: `@sentry/react`, `eslint-plugin-jsx-a11y`, `vitest-axe`
  **DEVIASI 2026-08-09**: `@lhci/cli` awalnya termasuk dalam task ini, lalu dikeluarkan — rantai dependency-nya (Lighthouse/Puppeteer) sendirian membawa ~5 kerentanan `high` baru (nanoid, sharp, tmp, uuid), yang berarti gerbang `npm audit --audit-level=high` yang baru dibangun di T003 langsung gagal di run pertamanya untuk fitur P2 yang belum digarap. Pemasangannya pindah ke US10 (P2) — lihat § Dibawa ke pass P2 butir 3. Deskripsi task ini sudah dipersempit agar tanda `[X]` menyatakan apa yang benar-benar terpasang, bukan daftar aslinya.
  **KOREKSI 2026-08-11**: `vitest-axe` **terpasang tapi nol dipakai** — tidak ada satu pun berkas di `tests/` yang meng-impornya. Jadi dependency-nya ada, gerbangnya tidak. Aktivasinya adalah pekerjaan US9 (§ Dibawa ke pass P2 butir 2), bukan bagian task ini; dicatat di sini supaya kehadirannya di `package.json` tidak salah dibaca sebagai gerbang a11y runtime yang sudah aktif.
- [X] T002 [P] Tambahkan `.nvmrc` berisi versi Node yang dipakai CI, agar lingkungan lokal dan `ci.yml` konsisten

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fondasi pipeline CI/CD yang dipakai bersama US1 (production deploy) dan US2 (staging
deploy) — **MEMBLOKIR** kedua story tersebut sampai selesai

**⚠️ CRITICAL**: US1 dan US2 tidak dapat dimulai sebelum fase ini selesai; keduanya sama-sama
bergantung pada `ci.yml` sebagai gerbang dan pada environment yang didefinisikan di
`wrangler.jsonc`.

- [X] T003 Buat `.github/workflows/ci.yml`: jalankan berurutan lint (`npm run lint`), type-check (`tsc -b`), `npm test`, `npm audit --audit-level=high`, dan `npm run build` pada setiap push/PR, sesuai `contracts/ci-pipeline-contract.md` gerbang 1–5
- [X] T004 [P] Tambahkan environment bernama `staging` dan `production` (nama Worker berbeda) di `wrangler.jsonc` sesuai R-002 `research.md`
- [X] T005 Tambahkan penyematan commit SHA sebagai `VITE_APP_VERSION` saat build (`vite.config.ts` `define`), dibaca lewat `import.meta.env` — dasar untuk FR-005 (keterlacakan rilis) dan `ErrorReportContext.appVersion` di US3

**Checkpoint**: `ci.yml` menjalankan seluruh gerbang dan environment staging/production sudah
terdefinisi. US1 dan US2 boleh dimulai.

---

## Phase 3: User Story 1 - Deploy Aman dengan Rollback Cepat (Priority: P1) 🎯 MVP

**Goal**: Perubahan yang lolos `ci.yml` deploy otomatis ke production; rollback tersedia dalam
hitungan menit tanpa build ulang.

**Independent Test**: Dorong perubahan gagal test → verifikasi deploy diblokir. Deploy versi yang
lolos → tandai bermasalah → jalankan rollback → verifikasi production kembali ke versi stabil
dalam < 10 menit.

- [X] T006 [US1] Buat job `production` di `.github/workflows/deploy.yml`: `wrangler deploy --env production`, dipicu hanya pada push ke `main` dengan `needs: ci` mengacu ke T003
  **CATATAN**: digerbang lewat `workflow_run` terhadap workflow `CI` (bukan literal `needs: ci` satu file — GitHub Actions tidak mendukung `needs` lintas workflow), efeknya sama: job production hanya jalan setelah `CI` sukses di commit yang sama.
- [X] T007 [US1] Tulis `docs/ops-runbook.md`: prosedur rollback (`wrangler rollback --env production`) dan cara membaca versi/commit yang sedang live (merujuk `VITE_APP_VERSION` dari T005), merujuk `contracts/ci-pipeline-contract.md`
- [ ] T008 [US1] Jalankan Quickstart V-1 (branch gagal test diblokir; rollback production < 10 menit) dan catat hasilnya di `quickstart.md`
  **BELUM SELESAI**: butuh repo GitHub sungguhan dengan Actions aktif + kredensial Cloudflare (`CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`) — di luar jangkauan lingkungan implementasi ini. Konfigurasi (`ci.yml`, `deploy.yml`, `wrangler.jsonc`) sudah divalidasi lewat `wrangler deploy --dry-run --env production` (sukses, `definedEnvironments` mengenali `production`) dan `npm run build` sungguhan.

**Checkpoint**: US1 berfungsi penuh dan dapat didemokan sendiri — deploy production tergerbang,
rollback terdokumentasi dan teruji.

---

## Phase 4: User Story 2 - Verifikasi di Staging Sebelum Rilis Nyata (Priority: P1)

**Goal**: Perubahan dapat diverifikasi di environment terpisah sebelum menyentuh production.

**Independent Test**: Dorong perubahan ke branch non-`main` → verifikasi staging ter-deploy di
URL/Worker terpisah, tanpa memengaruhi data/pengalaman di production.

- [X] T009 [US2] Buat job `staging` di `.github/workflows/deploy.yml`: `wrangler deploy --env staging`, dipicu pada push branch manapun selain `main` dengan `needs: ci`
  **CATATAN**: sama seperti T006 — digerbang lewat `workflow_run` terhadap workflow `CI`, bukan literal `needs: ci` (GitHub Actions tidak mendukung `needs` lintas workflow). Efek gate-nya setara.
- [X] T010 [US2] Verifikasi nama/URL Worker `staging` berbeda dari `production` dan catat di `docs/ops-runbook.md` (T007) bahwa keduanya tidak berbagi state/storage apapun
- [ ] T011 [US2] Jalankan Quickstart V-2 dan catat hasilnya di `quickstart.md`
  **BELUM SELESAI**: sama seperti T008 — butuh deploy sungguhan. `wrangler deploy --dry-run --env staging` sukses dan mengenali environment `staging` secara terpisah dari `production`.

**Checkpoint**: US1 dan US2 bersama membentuk pipeline deploy lengkap — staging untuk verifikasi,
production tergerbang dengan rollback.

---

## Phase 5: User Story 3 - Mengetahui Kegagalan Produksi Sebelum Siswa Melapor (Priority: P1)

**Goal**: Error runtime sisi klien tertangkap dan dilaporkan otomatis, dengan PII tersaring
sebelum meninggalkan perangkat siswa.

**Independent Test**: Picu error runtime disengaja di staging → verifikasi tercatat di dasbor
pemantauan dalam < 5 menit tanpa laporan manual, dan field yang terkirim tidak memuat PII.

- [ ] T012 [US3] Buat project Sentry (tier gratis); simpan DSN sebagai GitHub Actions secret `SENTRY_DSN` — **satu jalur konfigurasi saja**, dibaca saat build oleh `deploy.yml` (T041) untuk job `staging` maupun `production`
  **BELUM SELESAI**: butuh akun/dashboard Sentry sungguhan — aksi eksternal di luar jangkauan implementasi ini. `src/monitoring/errorReporting.ts` (T013) sudah menangani ketiadaan DSN secara eksplisit (`initErrorReporting()` no-op, bukan gagal diam-diam) sehingga aplikasi tetap berjalan normal sampai DSN ini diisi.
  **KOREKSI 2026-08-11**: DSN adalah variabel **build-time** (`import.meta.env.VITE_SENTRY_DSN`), bukan runtime — menyimpannya sebagai environment variable Worker saja TIDAK akan pernah sampai ke bundle. Jalur build sudah diperbaiki di T041; yang tersisa untuk task ini murni pembuatan akun + pengisian secret `SENTRY_DSN` di GitHub. Judul task di atas sudah ditulis ulang (2026-08-11) agar tidak lagi meminta Worker environment variable — dua jalur konfigurasi untuk satu nilai adalah undangan untuk mengisi yang salah.
- [X] T013 [US3] Implementasikan `src/monitoring/errorReporting.ts`: inisialisasi Sentry dengan `sendDefaultPii: false` dan `beforeSend` yang **hanya** meloloskan field sesuai `data-model.md` § ErrorReportContext (`message`, `stack`, `route`, `appVersion`) — tolak field lain secara eksplisit, bukan default-allow
- [X] T014 [US3] Panggil inisialisasi `errorReporting` di `src/main.tsx` sebelum `createRoot(...).render(...)`. Bergantung pada T013
- [X] T015 [P] [US3] Unit test `beforeSend` di `tests/unit/error-reporting.test.ts`: mock event Sentry berisi `displayName` dan snapshot `localStorage`, verifikasi keduanya tersaring habis sebelum "terkirim"
- [ ] T016 [US3] Konfigurasikan alert rule ambang lonjakan error di dasbor Sentry sesuai FR-007, memakai **kedua** ambang konkret di `plan.md` § Observability Goals: (A) ≥ 5 event fingerprint sama dari ≥ 3 sesi berbeda dalam rolling window 5 menit pada satu release production; (B) ≥ 20 event total dalam 1 jam pada satu release production
  **BELUM SELESAI**: bergantung pada T012 (akun Sentry belum ada). Angkanya sendiri sudah tidak lagi terbuka — sebelumnya task ini hanya berbunyi "sesuai FR-007" yang tidak punya kriteria lolos.
- [ ] T017 [US3] Jalankan Quickstart V-3 dan catat hasilnya di `quickstart.md` — **verifikasi eksplisit tidak ada PII di event yang benar-benar terkirim**, bukan hanya di unit test mock
  **BELUM SELESAI**: bergantung pada T012. Bagian yang bisa diverifikasi tanpa Sentry sungguhan (logika `scrubBeforeSend`) sudah teruji penuh lewat T015 (4 test, termasuk memastikan `user`/`request`/`breadcrumbs`/`extra`/`contexts` terbuang total).

**Checkpoint**: Tim mendapat sinyal error produksi otomatis, tanpa membocorkan data siswa ke
pihak ketiga (Constitution Check Prinsip VI, plan.md).

---

## Phase 6: User Story 4 - Gerbang Keamanan Otomatis pada Setiap Rilis (Priority: P1)

**Goal**: Kerentanan dependency tertangkap sebelum rilis; response aplikasi menyertakan header
keamanan standar pada setiap request, bukan hanya fallback SPA.

**Independent Test**: Perkenalkan dependency dengan kerentanan tinggi yang diketahui → verifikasi
rilis ditahan. Periksa response staging/production → verifikasi header keamanan hadir pada aset
200 maupun fallback 404.

- [X] T018 [US4] Buat `.github/dependabot.yml` (ecosystem `npm`, jadwal mingguan, alert kerentanan aktif)
- [X] T019 [US4] Ubah `run_worker_first` menjadi `true` di `wrangler.jsonc` (Complexity Tracking, plan.md) — prasyarat agar header dapat disisipkan pada seluruh response, bukan hanya fallback
- [X] T020 [US4] Implementasikan penyisipan header di `worker/index.js`: bungkus response `env.ASSETS.fetch(request)` dan tambahkan seluruh header pada `contracts/security-headers-contract.md` sebelum dikembalikan. Bergantung pada T019
  **CATATAN**: diekstrak ke `worker/security-headers.js` (bukan inline di `index.js`) supaya T021 bisa mengujinya sebagai fungsi murni. `worker/` ditambahkan ke `tsconfig.json` (`allowJs`, `include`) agar test TypeScript bisa meng-impornya.
- [X] T021 [P] [US4] Ekstrak logika pembangun header ke fungsi murni yang diuji di `tests/unit/security-headers.test.ts` (agar testable tanpa runtime Worker sungguhan)
- [ ] T022 [US4] Jalankan Quickstart V-4: verifikasi `npm audit --audit-level=high` (T003) menahan dependency rentan; verifikasi header hadir di kedua jenis response; verifikasi aset Rive (`koji-gameboard.riv`) dan canvas modul Fisika tidak diblokir CSP
  **SEBAGIAN**: header teruji via T021 (4 test). Verifikasi CSP-vs-Rive/canvas sungguhan di browser BELUM dijalankan — butuh deploy staging (T011). Bagian `npm audit` **gagal**, lihat T046.
  **KOREKSI 2026-08-11**: catatan sebelumnya menulis "10 kerentanan ... (wrangler/typescript-eslint toolchain)" dan menyimpulkan "runner CI bersih tidak akan mengalami ini". Keduanya salah, dan kesalahan kedua yang berbahaya: gerbang ini **sedang merah di CI sekarang**. Angka sebenarnya **7 `high`** (10 adalah total lintas semua tingkat: 1 low, 2 moderate, 7 high), berasal dari `sharp`/`undici`/`ws` lewat `@cloudflare/vite-plugin` → `miniflare`, `wrangler` → `miniflare`, dan `jsdom` → `ws` — `typescript-eslint` tidak terlibat sama sekali. `npm audit fix` juga bukan sekadar tertahan file lock: perbaikannya menyeret `miniflare` ke `5.x-alpha`. Remediasinya dipisah ke T046.

**Checkpoint**: Gerbang keamanan otomatis aktif di CI dan di response — US4 dapat didemokan
independen dari US1–US3.

---

## Phase 7: User Story 5 - Data dan Input Siswa Aman di Sisi Klien (Priority: P1)

**Goal**: Data yang tersimpan di perangkat siswa terbatas pada yang esensial; input bebas siswa
tidak dapat mengeksekusi skrip; build production tidak membocorkan detail internal.

**Independent Test**: Audit seluruh kunci `localStorage` → verifikasi tanpa PII tidak esensial.
Masukkan payload skrip pada nama tampilan → verifikasi tidak tereksekusi di UI manapun.

- [X] T023 [US5] Audit seluruh kunci `localStorage` aplikasi (`lumera.progress.v1`, `lumera.profile.v1`, kunci telemetry) terhadap FR-010; dokumentasikan hasil sebagai catatan di `quickstart.md` § V-5
  **Hasil audit**: tiga kunci (`lumera.profile.v1`, `lumera.progress.v1`, `lumera.telemetry.events.v1`). Tidak ada email/telepon/alamat pada bentuk manapun; `siswaId`/telemetry `eventId` adalah UUID acak, bukan identitas nyata; `displayName` adalah satu-satunya teks bebas siswa. PASS terhadap FR-010 pada kode saat ini.
- [X] T024 [P] [US5] Tambahkan test regresi XSS di `tests/unit/xss-safety.test.tsx`: render nama tampilan berisi payload skrip (`<img src=x onerror=...>`) lewat `StudentShell`/`HomeScreen`, assert dirender sebagai teks literal, bukan dieksekusi
- [X] T025 [US5] Set `build.sourcemap: false` eksplisit di `vite.config.ts` untuk build production dan audit `console.log`/output debug yang bocor ke bundle production
  **Hasil audit**: nol `console.log`/`console.debug`/`console.info` di `src/`; tiga `console.error` yang ada seluruhnya diagnostik pendek tanpa PII (pola "gagal diam-diam dilarang" yang sudah ada sejak spec 001). `build.sourcemap: false` diverifikasi lewat build sungguhan — nol berkas `.map` di `dist/`.
- [ ] T026 [US5] Jalankan Quickstart V-5 dan catat hasilnya di `quickstart.md`
  **SEBAGIAN**: audit localStorage (T023), test XSS (T024), dan verifikasi source map (T025) sudah dijalankan sungguhan. Yang tersisa (payload XSS lewat browser DevTools sungguhan, bukan jsdom) butuh sesi manual.

**Checkpoint**: Permukaan data-di-klien dan input siswa terverifikasi aman — independen dari
story lain.

---

## Phase 8: User Story 6 - Kepatuhan Privasi Anak dan Kontrol atas Data Sendiri (Priority: P1)

**Goal**: Siswa/orang tua dapat membaca kebijakan privasi dan menghapus seluruh data pribadi
dalam satu aksi.

**Independent Test**: Buka kebijakan privasi dari aplikasi → verifikasi dapat diakses dan
dipahami. Jalankan aksi hapus-semua-data → verifikasi seluruh data lokal benar-benar hilang.

- [X] T027 [US6] Tulis konten kebijakan privasi di `src/privacy/content.ts` (bahasa non-teknis: data yang dikumpulkan — nama tampilan, preferensi, progres — dan cara penggunaannya; tanpa PII lain per FR-014)
- [X] T028 [P] [US6] Implementasikan `src/privacy/PrivacyPolicy.tsx` memakai token desain `src/design/tokens.ts` (Constitution Check Prinsip V, plan.md)
- [X] T029 [US6] Daftarkan rute kebijakan privasi ke `src/student/routes.ts` dan tautkan dari `SettingsScreen` (`src/student/StudentScreens.tsx`)
- [X] T030 [US6] Implementasikan aksi "hapus semua data saya" yang memanggil `resetLearnerProfile()` (`src/profile/store.ts`), `resetProgres()` (`src/progress/store.ts`), **dan** pembersihan storage telemetry sekaligus — perluas `onRequestResetProfile`/`confirmReset` di `src/student/StudentApp.tsx` yang saat ini hanya me-reset profil, tidak progress/telemetry
  **CATATAN**: diimplementasikan sebagai `src/privacy/deleteAllData.ts` (`hapusSemuaDataSiswa`), aksi `ConfirmAction` BARU `'delete-all-data'` — sengaja **terpisah** dari `'reset-profile'` yang sudah ada (yang tetap hanya me-reset profil, dipakai alur "ulangi onboarding"), bukan menggantikannya, supaya kedua makna aksi tidak tercampur.
- [X] T031 [P] [US6] Unit test aksi hapus-semua-data di `tests/unit/data-deletion.test.ts`: isi ketiga kunci storage dengan data fixture, jalankan aksi, verifikasi ketiganya kosong setelahnya
- [ ] T032 [US6] Jalankan Quickstart V-6 dan catat hasilnya di `quickstart.md`
  **SEBAGIAN**: alur hapus-data teruji penuh lewat unit test (T031, 2 test). Verifikasi manual "buka kebijakan privasi dari aplikasi yang benar-benar jalan" butuh sesi browser.

**Checkpoint**: US6 dapat didemokan independen — kebijakan privasi dan hak hapus data berfungsi
penuh terlepas dari status story lain.

---

## Phase 9: User Story 7 - Progres Siswa Tidak Hilang Permanen (Priority: P1)

**Goal**: Siswa dapat mengekspor progres ke berkas eksternal dan memulihkannya di perangkat
manapun.

**Independent Test**: Selesaikan pelajaran (⚠️ lihat T040), ekspor progres, hapus data browser,
verifikasi hilang, impor kembali, verifikasi seluruh state pulih.

- [X] T033 [US7] Tambahkan field `schemaVersion: number` ke `Siswa` (`src/progress/store.ts`) dan fungsi migrasi dasar (v1 = bentuk field saat ini) sesuai `data-model.md` § Siswa
- [X] T034 [P] [US7] Tambahkan field `schemaVersion: number` ke `LearnerProfile` (`src/profile/store.ts`) dan fungsi migrasi dasar, pola sama dengan T033
- [X] T035 [US7] Definisikan tipe `ExportedProgressFile` di `src/backup/schema.ts` sesuai `contracts/progress-export-contract.md`. Bergantung pada T033, T034
- [X] T036 [US7] Implementasikan `src/backup/export.ts`: bangun `ExportedProgressFile` dari state `Siswa` + `LearnerProfile` saat ini, unduh sebagai `lumera-progres-<YYYY-MM-DD>.json` lewat `Blob` + `<a download>`. Bergantung pada T035
- [X] T037 [US7] Implementasikan `src/backup/import.ts`: parse JSON, validasi `schemaVersion` dikenali dan bentuk `siswa`/`learnerProfile` valid, tolak dengan pesan jelas jika tidak (kontrak aturan 2, 3, 5), peringatkan sebelum menimpa jika `exportedAt` berkas lebih lama dari data lokal (kontrak aturan 4). Bergantung pada T035
- [X] T038 [US7] Sambungkan kontrol ekspor/impor ke `SettingsScreen` (`src/student/StudentScreens.tsx`). Bergantung pada T036, T037
- [X] T039 [P] [US7] Unit test round-trip ekspor/impor dan penolakan skema tidak cocok di `tests/unit/backup.test.ts`, memakai fixture `Siswa`/`LearnerProfile` sintetis — **tidak bergantung pada lesson engine sungguhan**, dapat dikerjakan sekarang
  **Cakupan**: 7 test — round-trip penuh, tolak `schemaVersion` masa depan, tolak JSON rusak (tanpa merusak data lokal), tolak berkas tidak lengkap, minta konfirmasi timpa saat berkas lebih lama, tidak minta konfirmasi untuk siswa baru, format nama berkas.
- [ ] T040 [US7] **Catatan dependensi lintas-spec (bukan kode)**: validasi manual penuh Quickstart V-7 ("selesaikan satu pelajaran, catat Lumens/streak/mastery, lalu ekspor") terblokir sampai `specs/001-core-mvp-prototype/tasks.md` T086 (wire `LessonShell` agar dapat dijangkau siswa) dan T087 (sambungkan `Siswa` store nyata ke UI live) selesai — saat ini tidak ada jalur live yang menghasilkan progres nyata untuk diekspor. T033–T039 di atas tetap selesai dan teruji penuh sekarang lewat fixture sintetis; task ini hanya menahan langkah validasi manual V-7 sampai prasyaratnya ada, dan MUST dijalankan begitu T086/T087 selesai — jangan dilupakan begitu blocker hilang
  **STATUS 2026-08-09**: T086 sudah selesai di branch terpisah `001-convergence-fixes` (belum digabung ke branch ini). T087 (sambungkan `Siswa` store nyata ke UI live/`HomeScreen`/`ProgressScreen`) **belum** — masih task terbuka di `specs/001-core-mvp-prototype/tasks.md`. Blocker ini karena itu **masih berlaku**; V-7 belum bisa divalidasi end-to-end dari branch manapun sampai T087 selesai dan kedua branch digabung.

**Checkpoint**: Mekanisme ekspor/impor selesai dan teruji unit; validasi manual end-to-end
menunggu penyelesaian T086/T087 di spec 001 (lihat T040).

---

## Phase 10: Remediasi Temuan `/speckit-analyze` (2026-08-11)

**Purpose**: Menutup temuan yang mengubah perilaku produk atau membuat requirement P1 tidak dapat
diverifikasi. Temuan yang murni drift dokumentasi diperbaiki langsung di berkas terkait tanpa
task sendiri.

- [X] T041 [US3] Alirkan `VITE_SENTRY_DSN: ${{ secrets.SENTRY_DSN }}` pada step Build job `staging` **dan** `production` di `.github/workflows/deploy.yml`
  **Kenapa**: `initErrorReporting()` membaca DSN lewat `import.meta.env` (build-time). Tanpa ini, T012 bisa diselesaikan sepenuhnya — akun dibuat, secret diisi — dan pemantauan error **tetap** tidak akan pernah aktif di production, tanpa gejala apa pun. Ini blocker diam-diam untuk US3/FR-006, bukan sekadar konfigurasi yang kurang rapi.
- [X] T042 [US3] Ubah `scrubBeforeSend` (`src/monitoring/errorReporting.ts`) menjadi allowlist sungguhan: bangun event baru berisi hanya `FIELD_EVENT_DIIZINKAN`, dan bangun `tags` dari nol alih-alih menyebar `event.tags`
  **Kenapa**: implementasi sebelumnya membuang lima field berisiko lewat destructuring lalu menyebar sisanya (`...safeEvent`) — itu default-ALLOW, kebalikan dari yang diminta T013 ("tolak field lain secara eksplisit, bukan default-allow") dan `data-model.md` § ErrorReportContext. Setiap field baru dari upgrade SDK Sentry akan lolos sendiri. Ditambah 3 test bentuk-persis di `tests/unit/error-reporting.test.ts` (total 7).
- [X] T043 [US5] Tulis `contracts/user-input-safety-contract.md` — sumber input tidak tepercaya, larangan `dangerouslySetInnerHTML`/`innerHTML`/`eval`, aturan "simpan mentah, escape saat render", dan cara tiap aturan ditegakkan
  **Kenapa**: menutup klausa kedua FR-011 yang sebelumnya nol cakupan (T024 hanya menutup klausa pertama lewat test).
- [X] T044 [US6] Tambahkan assertion regresi FR-020 di `tests/unit/student-app.test.tsx`: dialog "Hapus semua data saya?" MUST memuat "tidak dapat dibatalkan" **dan** "ekspor"
  **Kenapa**: teksnya sudah benar di `StudentApp.tsx` § CONFIRM_COPY, tapi tidak ada satu pun test yang menahannya — jalan keluar bagi siswa bisa hilang dalam satu edit copy tanpa CI protes.
- [X] T045 [US9-prasyarat] Aktifkan `eslint-plugin-jsx-a11y` di `eslint.config.js`, dibatasi ke `src/**/*.tsx`
  **Kenapa**: gerbang 1 `contracts/ci-pipeline-contract.md` sudah mengklaim lint mencakup `jsx-a11y`, plugin sudah ada di `package.json`, tapi tidak pernah didaftarkan ke config — dan ternyata belum terpasang di `node_modules` lokal sama sekali. Kontrak menjanjikan gerbang yang tidak ada.
  **Hasil pengukuran**: 20 pelanggaran total, 16 di antaranya di `docs/sample/` (artefak referensi, tidak pernah dirender — lihat CLAUDE.md), sehingga cakupan dibatasi ke `src/`. Empat pelanggaran nyata di `src/`: dua false positive konfigurasi (`no-noninteractive-tabindex` pada scroller `role="region"` yang justru MUST fokusable per WCAG 2.1.1; `label-has-associated-control` pada label yang teksnya di kedalaman 3) diselesaikan lewat opsi rule, dua `no-autofocus` diberi disable beralasan — satu permanen (fokus MUST masuk ke dialog, WCAG 2.4.3), satu ditandai untuk ditinjau di V-9 (autofocus onboarding membuat screen reader melewati StepHeading). **Tidak ada UX yang diubah dalam patch P1 ini.**

**Checkpoint**: gerbang CI kini benar-benar menjalankan apa yang dijanjikan kontraknya, dan dua
blocker diam-diam US3 tertutup sebelum akun Sentry dibuat — bukan setelah gagal di produksi.

---

## Phase 11: Remediasi Verifikasi Silang (2026-08-11)

**Purpose**: Menutup temuan yang requirement-nya **sudah ada** di spec/konstitusi tetapi belum
punya task — jadi tidak perlu menunggu pass `/speckit-specify` berikutnya. Temuan yang menuntut
perubahan requirement (definisi selesai Tahap 2, promosi artefak, cakupan ekspor, SC kontras/
screen reader, titik ukur rollback, protokol pengukuran performa, yurisdiksi privasi) **sengaja
tidak ada di sini** — semuanya masuk satu pass `/speckit-specify` sebelum US8–US12 digenerate.

- [ ] T046 [US4] Hijaukan kembali gerbang `npm audit --audit-level=high`: turunkan 7 kerentanan `high` devDependency (`sharp`, `undici`, `ws`) ke nol, lalu commit `package-lock.json` hasilnya
  **Kenapa**: FR-008 dan SC-004 mensyaratkan nol kerentanan kritis/tinggi yang belum ditangani saat rilis, dan `ci.yml` gerbang 4 menegakkannya. Gerbang itu **merah sekarang**, jadi tidak ada satu pun commit di branch manapun yang bisa mencapai `deploy.yml` — ini memblokir T008 dan T011 sekaligus.
  **Konteks terukur (2026-08-11)**: `npm audit --omit=dev` → **0 kerentanan**. Seluruh temuan berada di jalur devDependency (`@cloudflare/vite-plugin` → `miniflare` → `sharp`/`undici`/`ws`, `wrangler` → `miniflare`, `jsdom` → `ws`); bundle yang dilayani ke siswa tidak terdampak. Ini masalah pipeline, bukan lubang keamanan pada produk — tapi tetap blocker rilis karena gerbangnya tidak boleh dilemahkan.
  **Keputusan yang MUST diambil eksplisit** (catat hasilnya di task ini, jangan diam-diam):
  1. `overrides` di `package.json` untuk `sharp`/`undici`/`ws` — menaikkan tiga paket bermasalah saja, toolchain tetap di versi teruji. Jalur yang paling kecil radiusnya.
  2. `npm audit fix` apa adanya — **menyeret `miniflare` ke `5.20260804.0-alpha`** (via `wrangler@4.120.1`), plus `@cloudflare/vite-plugin` 1.37.1→1.51.2 dan `esbuild` 0.27→0.28. Prerelease di runtime deploy adalah risiko yang MUST disadari, bukan efek samping.
  3. `--omit=dev` pada gerbang audit — melemahkan gerbang; hanya boleh dengan alasan tertulis, dan tetap menyisakan kewajiban Edge Case `spec.md` soal pencatatan mitigasi (T048).
  **Selesai bila**: `npm audit --audit-level=high` keluar dengan kode 0 di runner CI bersih (bukan hanya lokal), `npm run build` + `npx vitest run` tetap hijau setelah perubahan, dan opsi yang dipilih beserta alasannya tercatat di task ini.
- [ ] T047 [US1] Ekspos versi/commit yang sedang live agar dapat dibaca langsung dari aplikasi yang berjalan — tambahkan header response (mis. `X-Lumera-Version`) di `worker/security-headers.js` yang membaca `VITE_APP_VERSION` (T005), dan uji di `tests/unit/security-headers.test.ts`
  **Kenapa**: FR-005 mensyaratkan versi yang live "selalu dapat ditelusuri" dan Acceptance Scenario 3 US1 menuntut "siapapun di tim memeriksa". Saat ini `grep` untuk versi di `worker/` mengembalikan nol hasil — satu-satunya cara membaca versi live adalah lewat event Sentry (yang butuh error lebih dulu) atau run Actions terakhir (yang menunjukkan apa yang **di-deploy**, bukan apa yang **sedang dilayani**). Keduanya tidak berlaku persis saat dibutuhkan: di tengah insiden, sebelum memutuskan rollback.
  **Catatan**: `docs/ops-runbook.md` (T007) MUST diperbarui begitu ini selesai — prosedurnya saat ini mendokumentasikan jalur tidak langsung tersebut sebagai satu-satunya cara.
- [ ] T048 [US4] Tambahkan jalur notifikasi kegagalan CI/deploy yang eksplisit dan catatan mitigasi kerentanan tanpa patch: konfigurasi notifikasi kegagalan di `ci.yml`/`deploy.yml`, dan bagian "Kerentanan tanpa perbaikan resmi" di `docs/ops-runbook.md` (apa yang dicatat, siapa yang memutuskan, di mana disimpan)
  **Kenapa**: dua Edge Case di `spec.md` § Edge Cases sudah mewajibkan ini — "tim MUST diberi tahu, tidak boleh ada jalur override diam-diam" dan "keputusan mitigasi MUST didokumentasikan, bukan diabaikan begitu saja" — tetapi tidak ada satu pun task yang menutupnya. `grep` untuk notif/slack/email/alert di `.github/workflows/` mengembalikan nol hasil; yang tersisa hanya email default GitHub ke pelaku push, yang tidak sampai ke siapa pun yang tidak mendorong commit itu.
  **Prasyarat de facto untuk T046 opsi 3**: kalau gerbang audit dilemahkan, catatan mitigasi inilah yang mencegah pelemahan itu hilang dari ingatan.
- [ ] T049 [Governance] Jalankan review implementasi terhadap Prinsip I–VII (`.specify/memory/constitution.md`) untuk seluruh cakupan P1 (US1–US7), catat hasil per prinsip di task ini
  **Kenapa**: `constitution.md` § Governance ("Kepatuhan") mewajibkan **setiap** review implementasi memverifikasi Prinsip I–VII, dan konstitusi mengikat seluruh spec turunan. Spec ini tidak menambah modul pelajaran, sehingga Prinsip II/III/IV/VI sebagian besar akan berupa "tidak terdampak" — tapi itu kesimpulan yang MUST ditulis, bukan diasumsikan. Prinsip I (kontrol interaktif benar-benar mengubah state) dan Prinsip V (nada visual) punya permukaan nyata di sini: kontrol ekspor/impor (T038), aksi hapus-semua-data (T030), dan halaman kebijakan privasi (T028).
  **Waktu**: setelah T008/T011/T022/T026/T032 selesai — review sebelum Quickstart dijalankan hanya akan mereview niat, bukan implementasi.
- [ ] T050 [Governance] Ulangi review Prinsip I–VII setelah Tahap 2 (US8–US12) selesai, sebelum label "siap produksi" dipakai
  **Kenapa**: sumber yang sama (`constitution.md` § Governance) berlaku per review implementasi, bukan sekali per fitur. Tahap 2 menyentuh aksesibilitas dan performa — dua area yang paling mungkin menggeser Prinsip V (nada visual) dan Prinsip I (kontrol yang benar-benar berfungsi) tanpa disadari. `spec.md` § Definisi "Siap Produksi" melarang label itu sebelum kedua tahap tuntas; task ini adalah gerbang terakhirnya.

**Checkpoint**: gerbang CI hijau kembali tanpa dilemahkan diam-diam, versi live dapat dibaca saat
insiden, kegagalan pipeline sampai ke manusia, dan kepatuhan konstitusi punya task sendiri alih-alih
mengandalkan ingatan.

---

## Phase 12: Requirement Susulan dari Amandemen Spec (2026-08-11)

**Purpose**: Menutup dua requirement yang **baru ditambahkan** ke `spec.md` pada pass
`/speckit-specify` 2026-08-11. Keduanya melayani story P1 yang sudah ada (US2, US6), jadi bukan
bagian Tahap 2 — tetapi baru bisa ditugaskan sekarang karena requirement-nya sebelumnya belum ada.

- [ ] T051 [US2] Implementasikan jejak verifikasi staging (FR-028) di `.github/workflows/deploy.yml`: job `production` MUST mencatat SHA staging yang sudah diverifikasi pada ringkasan run, dan MUST menandai eksplisit bila commit yang dirilis tidak pernah dilayani di staging; dokumentasikan cara membacanya di `docs/ops-runbook.md`
  **Kenapa**: staging dilayani dari branch, production dari `main` — begitu PR di-squash/merge, identitas commit berganti, sehingga "sudah diuji di staging" tidak dapat dibuktikan maupun dibantah setelah kejadian. Lihat `spec.md` FR-028 untuk alasan lengkap dan untuk alasan promosi artefak biner **ditolak**.
  **Selesai bila**: satu rilis production menampilkan SHA staging asalnya, dan satu hotfix simulasi yang langsung ke `main` muncul bertanda pengecualian — keduanya terbaca tanpa membuka log mentah.
- [ ] T052 [US6] Tambahkan pernyataan di `src/privacy/content.ts` bahwa berkas ekspor progres memuat **nama tampilan**, dan kunci teksnya dengan assertion di `tests/unit/data-deletion.test.ts` atau berkas test kebijakan privasi yang setara
  **Kenapa**: konsekuensi langsung keputusan cakupan FR-018 (2026-08-11). Berkas ekspor turun ke penyimpanan siswa dan bisa dibagikan; siswa/orang tua MUST tahu isinya memuat nama sebelum memutuskan membagikannya. Tanpa assertion, kalimat ini bisa hilang dalam satu edit copy — pola kegagalan yang sama yang T044 tutup untuk FR-020.
- [ ] T053 [US6] Jalankan review kebijakan privasi terhadap `spec.md` § Yurisdiksi dan Dasar Hukum Privasi (UU PDP, dasar persetujuan orang tua/wali, transfer keluar wilayah), oleh peninjau kompeten yang **bukan** penulis kebijakannya; catat nama peninjau, tanggal, dan temuannya di `quickstart.md` § V-6
  **Kenapa**: `plan.md` mewajibkan review akurasi hukum tapi tidak pernah punya task, dan sampai 2026-08-11 spec bahkan tidak menyebut yurisdiksi mana yang dipenuhi — sehingga "kebijakan privasi yang akurat" tidak dapat dinilai benar atau salah oleh siapa pun. Aturan peninjau-bukan-penulis mengikuti Prinsip IV, yang sudah dipakai untuk verifikasi konten pelajaran.
  **Catatan**: ini aksi manusia dengan kompetensi tertentu, bukan pekerjaan kode — MUST dijadwalkan, bukan diasumsikan selesai.

**Checkpoint**: kedua requirement susulan tertutup; US2 dan US6 kini utuh terhadap spec versi
2026-08-11, bukan versi saat task-nya pertama ditulis.

---

## Phase 13: User Story 8 - Aplikasi Tetap Dapat Dipakai Meski Penyimpanan Bermasalah (Priority: P2)

**Goal**: `localStorage` penuh atau diblokir tidak lagi membuat siswa kehilangan progres tanpa
pemberitahuan — aplikasi tetap dapat dipakai pada sesi itu, dengan peringatan yang terlihat.

**Independent Test**: Penuhi/blokir `localStorage` di browser uji, buka aplikasi, verifikasi
aplikasi tetap dapat dipakai dengan peringatan eksplisit; selesaikan satu pelajaran dan verifikasi
siswa diberi tahu progresnya tidak tersimpan antar sesi.

- [ ] T054 [US8] Buat `src/storage/safeStorage.ts` sesuai R-012: bungkus `getItem`/`setItem` dengan deteksi kuota-penuh dan mode-diblokir, kembalikan **hasil eksplisit** (berhasil/gagal beserta sebabnya) alih-alih melempar atau mengembalikan `null` yang ambigu
  **Kenapa hasil eksplisit**: `progress/store.ts` saat ini mengembalikan `siswaBaru()` diam-diam saat gagal parse — siswa melihat progresnya "hilang" tanpa satu pun pesan. Itu persis pelanggaran FR-026 yang story ini tutup, dan ia tidak akan tertutup oleh pembungkus yang juga diam.
- [ ] T055 [US8] Satukan kedua tangga migrasi ke satu tempat: pindahkan `migrasiSiswa()` (`src/progress/store.ts`) dan migrasi `LearnerProfile` (`src/profile/store.ts`) ke modul migrasi bersama yang dipakai keduanya lewat `src/storage/safeStorage.ts`. Bergantung pada T054
  **Kenapa ini bagian US8 dan bukan pembersihan opsional**: `data-model.md` awalnya menetapkan aturan migrasi didefinisikan **sekali**; T033/T034 terpaksa mengimplementasikannya terpisah karena `safeStorage.ts` adalah artefak P2 sementara migrasi dibutuhkan di P1. Dua tangga migrasi yang perlahan berbeda perilaku adalah persis kegagalan yang R-012 ingin cegah. Task ini MUST menyatukan **logika migrasinya**, bukan hanya membungkus `getItem`/`setItem` — lihat § Dibawa ke pass P2 butir 1.
- [ ] T056 [P] [US8] Implementasikan `src/storage/StorageWarningBanner.tsx` memakai token `src/design/tokens.ts` — peringatan yang terlihat siswa saat penulisan gagal, dengan nada Prinsip V (tenang dan menjelaskan, bukan alarm merah)
- [ ] T057 [US8] Sambungkan banner ke `src/student/StudentApp.tsx` dan pastikan penyelesaian pelajaran yang gagal disimpan memberi tahu siswa pada saat itu juga, bukan hanya saat aplikasi dibuka. Bergantung pada T054, T056
- [ ] T058 [P] [US8] Unit test di `tests/unit/safe-storage.test.ts`: simulasikan `QuotaExceededError` dan `localStorage` yang melempar saat diakses (mode privasi), verifikasi aplikasi tetap berfungsi, hasil gagal terlaporkan eksplisit, dan tidak ada jalur yang mengembalikan state kosong tanpa sinyal
- [ ] T059 [US8] Jalankan Quickstart V-8 (kedua kondisi di browser sungguhan) dan catat hasilnya di `quickstart.md`

**Checkpoint**: FR-026 tertutup dan duplikasi migrasi dari P1 terbayar — US8 dapat didemokan
independen.

---

## Phase 14: User Story 9 - Dapat Dipakai Penuh dengan Keyboard dan Screen Reader (Priority: P2)

**Goal**: Alur inti dapat diselesaikan dengan keyboard saja maupun dengan screen reader, dan
seluruh kontras memenuhi WCAG 2.1 AA.

**Independent Test**: Selesaikan Atlas → pelajaran → ringkasan progres hanya dengan
Tab/Enter/Escape; ulangi dengan screen reader desktop dan mobile; jalankan pemeriksa kontras
otomatis pada seluruh layar utama.

- [ ] T060 [US9] Aktifkan `vitest-axe` (sudah terpasang sejak T001, nol dipakai): daftarkan matcher di `tests/setup.ts` dan buat `tests/unit/a11y.test.tsx` yang menjalankan audit pada layar inti Batch 1 (`HomeScreen`, katalog, `SettingsScreen`, `PrivacyPolicy`) plus `LessonShell`
  **Kenapa duluan**: tanpa ini, T061–T063 memperbaiki hal yang tidak ada penegaknya, dan regresi berikutnya lolos tanpa terdeteksi. R-007 menetapkan kombinasi statis (`jsx-a11y`, sudah aktif lewat T045) + otomatis (task ini) + manual (T065).
- [ ] T061 [US9] Perbaiki seluruh pelanggaran kontras yang ditemukan T060 pada token warna `src/design/tokens.ts` dan pemakaiannya, terhadap ambang SC-011: 4,5:1 teks normal, 3:1 teks besar/batas komponen/indikator fokus. Bergantung pada T060
  **Batas**: perubahan MUST tetap di dalam nada "Soft Academic Adventure" (Prinsip V) — menaikkan kontras bukan alasan untuk warna kontras-tinggi yang keras. Bila sebuah token tidak bisa memenuhi ambang tanpa merusak nada, catat trade-off-nya, jangan diam-diam melewatinya.
- [ ] T062 [US9] Audit dan perbaiki label screen reader di `src/student/` dan `src/shell/` terhadap SC-012: setiap kontrol interaktif mengumumkan nama, peran, dan status; setiap gambar bermakna (`ArtworkFrame`, maskot Lumo, ilustrasi katalog) punya deskripsi yang menjelaskan **maknanya**, bukan nama berkas atau kata generik
- [ ] T063 [US9] Umumkan perpindahan langkah pelajaran ke screen reader di `src/shell/LessonShell.tsx` (live region atau pemindahan fokus yang disengaja), sesuai klausa ketiga SC-012
  **Kenapa ini di Shell dan bukan di modul**: transisi langkah dimiliki `LessonShell` (Prinsip II, FR-024) — menaruh pengumuman di modul akan menduplikasinya empat kali dan membuka jalan bagi modul untuk berbeda perilaku.
- [ ] T064 [US9] Tinjau `eslint-disable no-autofocus` yang sengaja ditinggalkan di `src/student/OnboardingFlow.tsx` (T045): autofocus membuat screen reader melewati `StepHeading`. Perbaiki atau naikkan menjadi keputusan tertulis dengan alasannya
- [ ] T065 [US9] Jalankan Quickstart V-9 dan catat hasilnya di `quickstart.md`: lintasan keyboard-only penuh (SC-008: urutan Tab mengikuti urutan visual, fokus selalu terlihat, tanpa jebakan fokus) dan lintasan screen reader pada **minimal satu screen reader desktop dan satu mobile** (SC-012)

**Checkpoint**: FR-021, FR-022, FR-023 masing-masing punya gerbang yang berjalan — dua otomatis,
satu manual. US9 dapat didemokan independen.

---

## Phase 15: User Story 10 - Waktu Muat Tetap Cepat Seiring Produk Bertambah Besar (Priority: P2)

**Goal**: Waktu muat dan biaya data terukur terhadap anggaran tetap, bukan terhadap kesan.

**Independent Test**: Ukur build production dengan protokol SC-007 pada URL staging; bandingkan
hasilnya dengan anggaran SC-007 (< 3 detik median) dan SC-013 (≤ 600 KB unduhan awal).

- [ ] T066 [US10] Pasang `@lhci/cli` di `package.json` (ditunda sejak T001) dan terapkan **keputusan kerentanan yang sama** dengan yang dipilih di T046 untuk ~5 kerentanan `high` yang dibawa rantai Lighthouse/Puppeteer — jangan melemahkan gerbang, dan jangan menciptakan kebijakan kedua
  **Kenapa satu kebijakan**: dua cara berbeda memperlakukan kerentanan di satu `package.json` adalah cara tercepat kehilangan jejak kenapa sebuah kerentanan dibiarkan. Bergantung pada T046.
- [ ] T067 [US10] Buat `.github/workflows/lighthouse.yml` per R-008 dengan konfigurasi yang **persis** mengikuti protokol SC-007: 1,6 Mbps unduh / 750 Kbps unggah, 150 ms RTT, pelambatan CPU 4×, cache kosong, 5 run, ambil **median**, dijalankan terhadap URL staging yang sudah ter-deploy (bukan dev server). Assertion: median < 3 detik dan tidak ada satu run pun > 5 detik. Bergantung pada T066
  **Prasyarat**: butuh staging yang hidup — bergantung pada T011 (dan karena itu pada T046).
- [ ] T068 [US10] Tambahkan assertion anggaran ukuran di konfigurasi Lighthouse yang sama: total unduhan kunjungan pertama ≤ 600 KB terkompresi transfer (SC-013), dan simpan angkanya sebagai baseline yang dibaca SC-009. Bergantung pada T067
- [ ] T069 [US10] Buat langkah prebuild kompresi aset di `build/` per R-009, terhadap anggaran numerik FR-017: ikon UI ≤ 20 KB per berkas, gambar layar pertama ≤ 100 KB
  **Baseline terukur 2026-08-11**: `public/assets` 3,4 MB, di antaranya `icon_clipboard.png` 379 KB, `icon_target.png` 339 KB, `icon_barchart.png` 275 KB, `icon_star.png` 244 KB — ikon yang seharusnya belasan KB — plus `math_banner.png` 548 KB dan `lumera_logo.png` 477 KB. Keadaan sekarang melanggar FR-017 dengan selisih besar; ini bukan optimasi mikro.
- [ ] T070 [US10] Muat `public/assets/koji-gameboard.riv` (964 KB) secara lazy hanya pada layar yang memakainya, bukan pada muat awal (R-009, klausa ketiga FR-017)
  **Hati-hati**: `wrangler.jsonc` `run_worker_first: true` dan CSP dari `worker/security-headers.js` berlaku pada setiap response — verifikasi aset yang dimuat belakangan tidak diblokir CSP (risiko yang sama yang T022 tandai).
- [ ] T071 [US10] Jalankan Quickstart V-10 dan catat angkanya di `quickstart.md`: median 5 run, total unduhan awal, dan ukuran aset terbesar setelah kompresi — sebagai baseline yang dibandingkan SC-009 di US11

**Checkpoint**: FR-016 dan FR-017 terukur terhadap angka, bukan kesan; SC-007 dan SC-013 punya
gerbang di CI. US10 dapat didemokan independen.

---

## Phase 16: User Story 11 - Menambah Modul Pelajaran Tidak Membengkakkan atau Merusak yang Lama (Priority: P2)

**Goal**: Modul dimuat hanya saat diakses, tanpa mengorbankan penolakan registry yang menjaga
kualitas konten.

**Independent Test**: Tambahkan satu modul contoh ke registry tanpa menyentuh `LessonShell` atau
modul lain; ukur perubahan unduhan awal terhadap baseline T071.

- [ ] T072 [US11] Pisahkan **metadata modul** (`conceptIds`, `verifikasi`, `prompt`, `pertanyaanRefleksi`) dari **komponen beratnya** (`VisualModel`, `UserAction`) pada tipe kontrak di `src/shell/registry.ts` dan keempat modul di `src/modules/`, sehingga metadata dapat didaftarkan seketika sementara komponen di-`import()` belakangan
  **Kenapa task ini ada dan MUST dikerjakan lebih dulu**: R-013 meminta impor statis diganti `React.lazy()` + dynamic `import()`. Diterapkan naif, itu **merusak invarian inti**: `daftarkanSemuaModul()` berjalan di `src/main.tsx` sebelum render supaya registry menolak modul cacat dan aplikasi gagal keras saat start (CLAUDE.md, Prinsip IV). Modul yang seluruhnya lazy tidak bisa divalidasi saat start — kegagalan baru muncul saat siswa membuka modulnya, yaitu persis yang dicegah desain sekarang. Memisahkan metadata dari komponen mempertahankan penolakan-saat-start **dan** mendapat code-splitting; keduanya, bukan salah satu.
- [ ] T073 [US11] Ubah `src/modules/index.ts` ke dynamic `import()` per modul untuk bagian komponen saja, dengan `daftarkanSemuaModul()` tetap mendaftarkan dan memvalidasi seluruh metadata secara sinkron saat start. Bergantung pada T072
- [ ] T074 [US11] Tambahkan penanganan status memuat di `src/shell/LessonShell.tsx` untuk komponen modul yang belum ter-resolve, tanpa mengubah urutan tujuh langkah (FR-024, Prinsip II). Bergantung pada T073
- [ ] T075 [P] [US11] Perluas test penolakan registry di `tests/unit/` agar membuktikan penolakan **tetap terjadi saat start** setelah lazy loading: modul dengan `conceptIds` kosong, slot hilang, `penjelasanKenapa` kosong untuk salah satu hasil, atau `verifikasi` tidak lengkap MUST tetap membuat `daftarkanSemuaModul()` melempar. Bergantung pada T073
- [ ] T076 [US11] Ukur unduhan awal sebelum dan sesudah menambahkan satu modul contoh terhadap baseline T071, verifikasi selisihnya < 5% (SC-009), dan catat di `quickstart.md` § V-11. Bergantung pada T068, T073

**Checkpoint**: FR-025 tertutup tanpa melemahkan FR-024 maupun penegakan Prinsip IV oleh registry.

---

## Phase 17: User Story 12 - Data Siap Dipetakan ke Backend Tanpa Menulis Ulang (Priority: P3)

**Goal**: Bentuk data progres dan telemetry terdokumentasi sebagai kontrak berversi yang terbukti
dapat dipetakan ke API tanpa mengubah bentuk data yang sudah tersimpan di perangkat siswa.

**Independent Test**: Tinjau kontrak terhadap bentuk data aktual di kode; jalankan latihan
pemetaan ke bentuk API dan verifikasi tidak ada bentuk data lama yang perlu berubah.

- [ ] T077 [US12] Tulis `contracts/data-schema-contract.md`: bentuk persisten `Siswa`, `LearnerProfile`, dan event telemetry berikut `schemaVersion` masing-masing, plus aturan versioning eksplisit (perubahan tidak backward-compatible MUST menaikkan versi dan menyertakan langkah migrasi; bentuk lama MUST NOT diubah diam-diam) per R-011
- [ ] T078 [US12] Jalankan latihan pemetaan tertulis dari ketiga skema di atas ke bentuk endpoint API hipotetis, dan catat hasilnya di kontrak yang sama — termasuk setiap tempat yang **tidak** memetakan bersih, bila ada. Bergantung pada T077
  **Kenapa latihan ini yang jadi gerbangnya**: FR-027 menjanjikan skema yang "dapat dipetakan ke API backend di masa depan tanpa mengubah bentuk data yang sudah ada". Itu klaim yang hanya bisa dibuktikan dengan mencobanya; membaca ulang skema sendiri tidak membuktikan apa pun. Ini juga masukan langsung bagi spec 003 (`spec.md` § Arah Backend).
- [ ] T079 [P] [US12] Unit test aturan versioning di `tests/unit/schema-migration.test.ts` (perluas yang sudah ada): data versi lama MUST termigrasi, data dengan versi tak dikenal MUST ditolak dengan error terlihat, dan bentuk hasil migrasi MUST sesuai kontrak T077
- [ ] T080 [US12] Jalankan Quickstart V-12 (tinjau kontrak terhadap kode aktual) dan catat hasilnya di `quickstart.md`

**Checkpoint**: FR-027 terbukti lewat latihan pemetaan, bukan diasumsikan dari niat desain.
Seluruh Tahap 2 selesai — **T050 (review konstitusi pasca-Tahap 2) adalah gerbang terakhir sebelum
label "siap produksi" boleh dipakai.**

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
- **Phase 11 (T046–T050)**: T046 **MEMBLOKIR seluruh validasi lingkungan sungguhan** (T008, T011,
  dan sisa T022) — selama gerbang audit merah, tidak ada commit yang mencapai `deploy.yml`, jadi
  tidak ada staging untuk diverifikasi. T047 dan T048 independen satu sama lain dan dari T046.
  T049 menunggu seluruh Quickstart P1 selesai; T050 menunggu US8–US12
- **Phase 12 (T051–T053)**: T051 butuh pipeline deploy yang hidup (dan karena itu T046); T052
  murni kode, bisa sekarang; T053 aksi manusia berkompetensi khusus, dijadwalkan terpisah
- **US8, US9, US12 (Phase 13, 14, 17)**: independen satu sama lain dan dari US10/US11 — bisa
  dikerjakan paralel tiga developer. Tidak satu pun bergantung pada lingkungan eksternal
- **US10 (Phase 15)**: **paling terikat** — T066 bergantung pada keputusan T046, T067 butuh
  staging hidup (T011). Ini story Tahap 2 yang paling mungkin tertahan blocker P1
- **US11 (Phase 16)**: T072 MUST mendahului T073–T075 (pemisahan metadata sebelum lazy loading);
  T076 juga bergantung pada T068 karena butuh baseline ukuran dari US10 — satu-satunya tempat
  US11 menyentuh US10

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
- **Tahap 2**: US8 (T054–T059), US9 (T060–T065), dan US12 (T077–T080) bisa dikerjakan tiga
  developer serentak — tidak berbagi berkas dan tidak berbagi dependensi. T056 (`StorageWarningBanner`),
  T058 (test safeStorage), T075 (test registry), dan T079 (test versioning) bertanda `[P]`
- **Yang TIDAK bisa paralel meski terlihat begitu**: T072 → T073 → T074 (satu rantai berkas yang
  sama), dan T066 → T067 → T068 (konfigurasi Lighthouse yang sama)

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
5. **T046 sebelum apa pun yang butuh lingkungan sungguhan** — gerbang audit merah menahan seluruh
   pipeline deploy, jadi ia mendahului sisa Tahap 1 maupun US10
6. Tahap 2: US8, US9, US12 bisa jalan kapan saja (murni kode lokal); US10 dan US11 menunggu
   staging hidup
7. **T049 lalu T050** — dua review konstitusi adalah gerbang terakhir masing-masing tahap. Label
   "siap produksi" MUST NOT dipakai sebelum T050 selesai (`spec.md` § Definisi "Siap Produksi")

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
  skema siap-backend) **sudah ada** sejak pass `/speckit-tasks` kedua, 2026-08-11 — Phase 13–17,
  T054–T080
- **Pass `/speckit-specify` sudah dijalankan (2026-08-11)** — ketujuh temuan analisis yang menuntut
  perubahan requirement sudah masuk ke `spec.md`, jadi `/speckit-tasks` untuk US8–US12 kini boleh
  berjalan di atas kriteria yang terukur. Yang berubah dan MUST dibaca saat men-generate US8–US12:
  - **FR-028** (baru) — jejak verifikasi staging pada setiap rilis production; butuh task sendiri
  - **FR-005** diperkuat — versi live MUST dapat dibaca dari aplikasi yang berjalan (sudah ada T047)
  - **FR-017** kini punya anggaran numerik (gambar layar pertama ≤ 100 KB, ikon ≤ 20 KB, aset besar
    lazy) dan **SC-013** (unduhan awal ≤ 600 KB terkompresi) — baseline terukur menunjukkan keadaan
    sekarang melanggarnya jauh: `public/assets` 3,4 MB, empat ikon PNG 244–379 KB, bundel JS 533 KB
  - **SC-007** kini punya protokol pengukuran tetap (1,6 Mbps/150 ms/CPU 4×, cache kosong, 5 run,
    median, diukur di staging) — US10 MUST memakai protokol ini, bukan menciptakan sendiri
  - **SC-011** (kontras) dan **SC-012** (screen reader) baru — US9 kini punya definisi selesai
  - **Tabel gerbang Tahap 2 per-requirement** menggantikan daftar tiga SC; FR-026 dan FR-027 kini
    punya gerbang eksplisit
  - **§ Arah Backend** dan **§ Yurisdiksi dan Dasar Hukum Privasi** baru di spec — yang kedua
    menuntut task review kebijakan privasi oleh peninjau kompeten yang bukan penulisnya
  - **FR-018** kini menyatakan nama tampilan ikut diekspor, dengan kewajiban turunan pada FR-013

### Dibawa ke pass P2 — ✅ SUDAH TERSERAP (2026-08-11)

Ketiga butir di bawah ditulis sebelum US8–US12 ada, supaya tidak hilang di antara dua pass
`/speckit-tasks`. Pass kedua sudah dijalankan dan **ketiganya sudah punya task**: butir 1 → T055,
butir 2 → T060 dan T064, butir 3 → T066. Teks aslinya dipertahankan di bawah sebagai alasan
mengapa task-task itu ada — bukan sebagai pekerjaan yang masih menunggu.

1. **Konsolidasi logika migrasi (US8, dari temuan I2)**. `data-model.md` awalnya menetapkan aturan
   migrasi didefinisikan **sekali** di `src/storage/safeStorage.ts` dan dipakai ulang kedua store.
   Karena `safeStorage.ts` adalah artefak US8 (P2) sementara migrasi dibutuhkan di P1, T033/T034
   mengimplementasikannya terpisah di `progress/store.ts` dan `profile/store.ts`. Ini duplikasi
   nyata dengan risiko **divergen** — dua tangga migrasi yang perlahan berbeda perilaku adalah
   persis kegagalan yang R-012 ingin cegah. Task US8 MUST menyatukan keduanya, bukan hanya
   membungkus `getItem`/`setItem`.
2. **Aktivasi penuh gerbang a11y (US9)**. T045 sudah memasang `jsx-a11y` untuk `src/`, tapi
   `vitest-axe` (uji kontras/label, R-007) belum. Selain itu satu `eslint-disable` di
   `OnboardingFlow.tsx` sengaja ditinggalkan untuk ditinjau saat lintasan manual V-9.
   **Diperkuat 2026-08-11**: `vitest-axe` bukan sekadar "belum dipakai penuh" — **nol** berkas di
   `tests/` meng-impornya, jadi ia dependency mati di `package.json`. Sampai US9 digarap, satu-satunya
   gerbang a11y yang benar-benar berjalan adalah lint statis `jsx-a11y`; klaim cakupan a11y apa pun
   di luar itu tidak punya penegak. Task US9 juga MUST menunggu SC kontras/screen-reader ditambahkan
   lewat `/speckit-specify` (lihat § Notes) — tanpa itu, "selesai" tidak terdefinisi.
3. **`@lhci/cli` (US10)**. Masih ditunda sejak T001 karena membawa ~5 kerentanan `high` ke gerbang
   `npm audit --audit-level=high`. Saat US10 digarap, pemasangannya MUST disertai keputusan
   eksplisit soal kerentanan tersebut (pin/override/kecualikan), bukan melemahkan gerbangnya.
   **Catatan 2026-08-11**: keputusan yang diambil di T046 untuk 7 kerentanan devDependency yang ada
   sekarang MUST dipakai ulang di sini — dua kebijakan berbeda untuk masalah yang sama di satu
   `package.json` adalah cara tercepat kehilangan jejak kenapa sebuah kerentanan dibiarkan.

---

## Status Implementasi (diperbarui 2026-08-11)

**36 dari 80 task selesai** (branch `002-production-readiness`). Tahap 1 (P1): 36 dari 50. Tahap 2
(P2/P3, T054–T080): 0 dari 27 — belum dimulai.

Catatan koreksi: revisi sebelumnya menulis "29 dari 40" — hitungan sebenarnya saat itu **31 dari
40** (tabel "yang belum selesai" di bawah, yang berisi 9 task, sudah benar sejak awal; hanya
angka ringkasannya yang salah). Ditambah T041–T045 (Phase 10) totalnya menjadi 45, lalu T046–T050
(Phase 11) menjadikannya 50. Pass `/speckit-tasks` kedua menambahkan T051–T053 (Phase 12,
requirement susulan) dan T054–T080 (Phase 13–17, US8–US12), sehingga totalnya kini **80 task
dengan 44 terbuka**.

`npx tsc -b`, `npm run lint` (kini **termasuk gerbang `jsx-a11y`**, T045), dan `npx vitest run`
seluruhnya bersih. Build production (`npm run build`) sukses, nol berkas `.map` di `dist/`.

**`npm audit --audit-level=high` TIDAK bersih** — 7 kerentanan `high` pada devDependency membuat
gerbang 4 CI merah. Ini satu-satunya gerbang pra-push (CLAUDE.md) yang gagal, dan konsekuensinya
melampaui dirinya sendiri: seluruh validasi lingkungan sungguhan di bawah menunggunya. Lihat T046.

### Yang BELUM selesai dan alasannya

Sebagian besar butuh akun/lingkungan sungguhan (GitHub Actions aktif, kredensial Cloudflare, akun
Sentry, sesi browser manual) yang berada di luar jangkauan lingkungan implementasi ini — bukan
pekerjaan kode yang terlewat. **Pengecualian: T046 dan T047 adalah pekerjaan kode yang bisa
dikerjakan sekarang juga**, dan T046 adalah prasyarat bagi seluruh baris lain di tabel ini.

| Task | Kenapa belum |
|---|---|
| T008, T011 | Deploy sungguhan ke staging/production butuh `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` dan repo GitHub dengan Actions aktif |
| T012, T016, T017 | Butuh akun & dashboard Sentry sungguhan. Jalur teknisnya kini lengkap: DSN mengalir ke build (T041) dan penyaringan PII sudah default-deny (T042) — tersisa murni aksi akun + isi secret `SENTRY_DSN`, lalu pasang kedua ambang alert dari `plan.md` § Observability Goals |
| T022, T026, T032 | Sebagian selesai (lihat catatan per-task) — sisanya butuh sesi verifikasi browser manual (CSP vs aset nyata, XSS lewat DevTools, kebijakan privasi di aplikasi yang benar-benar jalan) |
| T040 | Blocker lintas-spec **masih berlaku**: T086 (spec 001) selesai di branch terpisah `001-convergence-fixes` yang belum digabung; T087 (spec 001) masih task terbuka |
| T046 | **Bisa dikerjakan sekarang** — butuh keputusan eksplisit antara tiga opsi (lihat task), bukan lingkungan eksternal. Memblokir T008, T011, T022 |
| T047 | **Bisa dikerjakan sekarang** — perubahan kode di `worker/security-headers.js` + test; verifikasi live-nya menumpang pada T011 |
| T048 | Konfigurasi notifikasi butuh keputusan kanal (email/Slack/lainnya) dari tim; bagian runbook bisa ditulis sekarang |
| T049 | Menunggu Quickstart P1 (T008, T011, T022, T026, T032) dijalankan — review sebelum itu hanya mereview niat |
| T050 | Menunggu US8–US12 yang belum digenerate |

### Deviasi dari rencana awal

- **T001**: `@lhci/cli` sengaja ditunda ke US10 (P2) — instalasinya sekarang akan langsung
  meloloskan ~5 kerentanan `high` baru ke gerbang `npm audit --audit-level=high` yang baru
  dibangun di task yang sama.
- **`npm audit fix`** — ~~10 kerentanan baseline (toolchain wrangler/typescript-eslint); file lock
  Windows; aman dijalankan di runner CI bersih~~. **Dicabut 2026-08-11**: tiga klaim, tiga salah.
  (a) Angkanya **7 `high`** dari 10 total lintas semua tingkat. (b) Sumbernya `@cloudflare/vite-plugin`
  → `miniflare` → `sharp`/`undici`/`ws`, `wrangler` → `miniflare`, dan `jsdom` → `ws`; `typescript-eslint`
  tidak terlibat. (c) "Aman di runner CI bersih" menyesatkan dua kali: `npm audit fix` bukan sekadar
  tertahan file lock — ia menaikkan `miniflare` ke `5.x-alpha` — **dan** menjalankannya di runner tidak
  menolong sama sekali, karena gerbang audit berjalan setelah `npm ci`, jadi perbaikan hanya berlaku
  bila `package-lock.json`-nya di-commit. Verifikasi ulang: `npm audit --omit=dev` → 0 kerentanan
  (produksi bersih), gerbang CI tetap merah. Remediasi: **T046**.
- **T006 "`needs: ci`"**: diimplementasikan sebagai `workflow_run` (GitHub Actions tidak punya
  `needs` lintas file workflow) — perilaku gate-nya setara.

### Yang menggantikannya sebagian

- `tests/unit/error-reporting.test.ts` — membuktikan `beforeSend` membuang `user`/`request`/
  `breadcrumbs`/`extra`/`contexts` total, tanpa perlu DSN Sentry sungguhan.
- `tests/unit/security-headers.test.ts` — membuktikan seluruh header kontrak terpasang pada
  response 200 maupun fallback, tanpa runtime Worker sungguhan.
- `tests/unit/xss-safety.test.tsx`, `tests/unit/data-deletion.test.ts`, `tests/unit/backup.test.ts`,
  `tests/unit/schema-migration.test.ts` — menutup US5–US7 di tingkat logika.
- Verifikasi manual di `quickstart.md` (V-1 s.d. V-7) tetap wajib dijalankan sebelum rilis
  sungguhan — unit test **melengkapi**, bukan menggantikan, verifikasi di lingkungan nyata.
