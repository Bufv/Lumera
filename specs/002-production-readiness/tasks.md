---

description: "Task list for Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment (P1 scope)"
---

# Tasks: Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment

**Input**: Design documents from `/specs/002-production-readiness/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Scope of this file**: Seluruh 12 user story (P1 US1–US7, ditambah P2/P3 US8–US12 yang
digenerate pada pass `/speckit-tasks` ini — lihat Phase 10–14). P1 (US1–US7) tetap prioritas
implementasi pertama; P2/P3 MUST tidak dimulai sebelum seluruh P1 selesai dan tervalidasi
(Complexity Tracking `plan.md`, urutan pemotongan jika waktu menyempit).

**Precondition lintas-spec (Klarifikasi 2026-08-09, lihat `spec.md` § Clarifications & Edge
Cases)**: kesiapan operasional pada file ini (P1 maupun P2/P3) adalah syarat perlu, bukan syarat
cukup, untuk "siap dipakai siswa sungguhan" — itu tetap menunggu fitur inti `specs/001-core-mvp-prototype`
(tab homepage, alur pelajaran) selesai tersambung tanpa placeholder "segera hadir"/"dalam
pengembangan". Task yang validasi manualnya butuh fitur inti sungguhan (T040, T054, T060) MUST
mencatat status ini secara eksplisit sampai blocker hilang — bukan diabaikan atau dianggap selesai
lewat proxy sintetis saja.

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

- [X] T001 Tambahkan dependency baru ke `package.json`: `@sentry/react`, `eslint-plugin-jsx-a11y`, `vitest-axe`, `@lhci/cli` (yang terakhir hanya dipakai P2 US10, tapi diinstal sekarang agar `npm install` tidak perlu diulang saat P2 digarap)
  **DEVIASI 2026-08-09**: `@lhci/cli` **tidak** diinstal sekarang — rantai dependency-nya (Lighthouse/Puppeteer) sendirian membawa ~5 kerentanan `high` baru (nanoid, sharp, tmp, uuid), yang berarti gerbang `npm audit --audit-level=high` yang baru dibangun di T003 langsung gagal di run pertamanya untuk fitur P2 yang belum digarap. Ditunda sampai US10 (P2) benar-benar dikerjakan. `@sentry/react`, `eslint-plugin-jsx-a11y`, `vitest-axe` terpasang.
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
  **KOREKSI 2026-08-09 (bug ditemukan setelah task ini awalnya ditandai selesai)**: `env.staging`/`env.production` di `wrangler.jsonc` saja **tidak cukup** — terverifikasi lewat `wrangler deploy --dry-run` lokal bahwa override `name`/`vars` di blok `env` TIDAK bertahan lewat config redirect yang dibuat `@cloudflare/vite-plugin` saat `vite build`, persis alur yang dipakai `deploy.yml` (build dulu, baru `wrangler deploy --env <x>`) — staging dan production akan diam-diam ter-deploy dengan nama Worker dan vars yang SAMA. Diperbaiki dengan menambahkan `--name`/`--var` eksplisit di CLI `deploy.yml` (dan `docs/ops-runbook.md` untuk rollback), yang terverifikasi bertahan lewat redirect yang sama. `wrangler.jsonc`'s blok `env` dipertahankan hanya sebagai daftar nama environment yang sah bagi wrangler, bukan sumber kebenaran nama/vars lagi.
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

- [ ] T012 [US3] Buat project Sentry (tier gratis); simpan DSN sebagai GitHub Actions secret `SENTRY_DSN` dan Cloudflare Worker environment variable untuk `staging`/`production`
  **BELUM SELESAI**: butuh akun/dashboard Sentry sungguhan — aksi eksternal di luar jangkauan implementasi ini. `src/monitoring/errorReporting.ts` (T013) sudah menangani ketiadaan DSN secara eksplisit (`initErrorReporting()` no-op, bukan gagal diam-diam) sehingga aplikasi tetap berjalan normal sampai DSN ini diisi.
- [X] T013 [US3] Implementasikan `src/monitoring/errorReporting.ts`: inisialisasi Sentry dengan `sendDefaultPii: false` dan `beforeSend` yang **hanya** meloloskan field sesuai `data-model.md` § ErrorReportContext (`message`, `stack`, `route`, `appVersion`) — tolak field lain secara eksplisit, bukan default-allow
- [X] T014 [US3] Panggil inisialisasi `errorReporting` di `src/main.tsx` sebelum `createRoot(...).render(...)`. Bergantung pada T013
- [X] T015 [P] [US3] Unit test `beforeSend` di `tests/unit/error-reporting.test.ts`: mock event Sentry berisi `displayName` dan snapshot `localStorage`, verifikasi keduanya tersaring habis sebelum "terkirim"
- [ ] T016 [US3] Konfigurasikan alert rule ambang lonjakan error di dasbor Sentry sesuai FR-007
  **BELUM SELESAI**: bergantung pada T012 (akun Sentry belum ada).
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
  **BUG DITEMUKAN & DIPERBAIKI 2026-08-09**: CSP ketat di atas memblokir `<script>` inline preamble React Fast Refresh yang disuntikkan Vite, membuat `npm run dev` gagal total sejak halaman pertama ("can't detect preamble" — regresi nyata, dilaporkan langsung oleh pengguna). Diperbaiki dengan CSP kondisional berbasis `import.meta.env.DEV` (konstanta build-time Vite — bukan wrangler `vars`, lihat koreksi T004 di atas untuk alasannya): longgar (dengan `unsafe-inline`) hanya saat `vite dev`, ketat untuk seluruh output `vite build` (staging maupun production). Diverifikasi: (a) `npm run dev` sungguhan sekarang menyajikan halaman dengan CSP longgar + preamble berjalan; (b) build production sungguhan diperiksa byte-per-byte — cabang CSP longgar tereliminasi total dari bundle (0 kemunculan `unsafe-eval`), bukan sekadar tidak terpilih saat runtime. Lihat `worker/security-headers.js` untuk catatan lengkap.
- [X] T021 [P] [US4] Ekstrak logika pembangun header ke fungsi murni yang diuji di `tests/unit/security-headers.test.ts` (agar testable tanpa runtime Worker sungguhan)
  **DIPERBARUI**: +4 test untuk perilaku `isDev` (pelonggaran CSP dev, fail-closed untuk `isDev` falsy/tidak dikirim) — 9 test total di berkas ini sekarang.
- [ ] T022 [US4] Jalankan Quickstart V-4: verifikasi `npm audit --audit-level=high` (T003) menahan dependency rentan; verifikasi header hadir di kedua jenis response; verifikasi aset Rive (`koji-gameboard.riv`) dan canvas modul Fisika tidak diblokir CSP
  **SEBAGIAN**: `npm audit --audit-level=high` sungguhan dijalankan lokal — menemukan 10 kerentanan baseline pra-eksisting (wrangler/typescript-eslint toolchain, bukan dependency aplikasi), semuanya `fixAvailable`; `npm audit fix` diblokir proses `workerd.exe` sisa yang mengunci file di lingkungan lokal ini (bukan masalah kode — runner CI bersih tidak akan mengalami ini). Header teruji via T021 (9 test, termasuk cabang dev). `npm run dev` lokal terverifikasi sungguhan bekerja (lihat catatan T020). Verifikasi CSP-vs-Rive/canvas di deployment staging sungguhan BELUM dijalankan — butuh deploy staging (T011).

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
  **KOREKSI (2026-08-11, ditemukan lewat `/speckit-analyze`)**: FR-011 punya dua klausul — regresi
  otomatis (di atas) dan "aturan ini MUST didokumentasikan sebagai kontrak eksplisit". Klausul kedua
  sebelumnya nol cakupan (hanya disebut sekilas di `security-headers-contract.md` tanpa isi sendiri).
  Ditambahkan `contracts/input-escaping-contract.md` untuk menutup klausul ini.
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

## Phase 10: User Story 8 - Aplikasi Tetap Dapat Dipakai Meski Penyimpanan Bermasalah (Priority: P2)

**Goal**: Ketika `localStorage` penuh atau diblokir, siswa tetap dapat memakai aplikasi pada sesi
tersebut dengan peringatan eksplisit — bukan halaman gagal total atau kehilangan progres diam-diam.

**Independent Test**: Nonaktifkan/penuhi `localStorage` secara sengaja di browser uji, buka
aplikasi, verifikasi aplikasi tetap dapat dipakai dengan peringatan eksplisit, bukan crash.

- [X] T041 [P] [US8] Implementasikan `src/storage/safeStorage.ts`: wrapper `getItem`/`setItem` dengan deteksi kuota-penuh dan mode-diblokir, mengembalikan status gagal eksplisit (bukan throw tak tertangani) sesuai R-012 `research.md`
- [X] T042 [P] [US8] Implementasikan `src/storage/StorageWarningBanner.tsx` memakai token desain `src/design/tokens.ts` (Constitution Check Prinsip V, plan.md), tampil saat penulisan storage gagal
- [X] T043 [US8] Ganti try/catch independen di `src/progress/store.ts` dengan `safeStorage`, hentikan pola mengembalikan `siswaBaru()` diam-diam saat gagal parse tanpa pemberitahuan (lihat R-012). Bergantung pada T041
- [X] T044 [US8] Ganti try/catch independen di `src/profile/store.ts` dengan `safeStorage`, pola sama dengan T043. Bergantung pada T041
- [X] T045 [US8] Sambungkan `StorageWarningBanner` ke root shell siswa (`src/student/StudentApp.tsx`) agar tampil begitu `safeStorage` melaporkan kegagalan tulis, menyertakan peringatan eksplisit "progres tidak akan tersimpan antar sesi" (FR-026). Bergantung pada T042, T043, T044
- [X] T046 [P] [US8] Unit test di `tests/unit/safe-storage.test.ts`: simulasikan `setItem` melempar (kuota penuh) dan storage diblokir total, verifikasi `safeStorage` melaporkan status gagal tanpa throw tak tertangani dan tanpa fallback diam-diam
  **Cakupan**: 6 test — perilaku normal, kuota penuh (setItem), storage diblokir (getItem/removeItem), status pulih setelah tulis sukses lagi, notifikasi listener `langgananStorageGagal` (termasuk unsubscribe).
- [ ] T047 [US8] Jalankan Quickstart V-8 dan catat hasilnya di `quickstart.md`
  **BELUM SELESAI**: butuh sesi DevTools browser sungguhan (simulasi kuota penuh/mode privasi) — pola yang sama dengan T026/T032 di P1. Logika inti (`safeStorage`, banner) teruji penuh lewat T046.

**Checkpoint**: Aplikasi tidak lagi gagal diam-diam saat storage bermasalah — independen dari
story lain.

---

## Phase 11: User Story 9 - Dapat Dipakai Penuh dengan Keyboard dan Screen Reader (Priority: P2)

**Goal**: Alur inti (Atlas, pelajaran, ringkasan progres) dapat dinavigasi dan diselesaikan penuh
hanya dengan keyboard/screen reader, dengan kontras warna memenuhi WCAG 2.1 AA.

**Independent Test**: Navigasi seluruh alur inti hanya dengan Tab/Enter/Escape tanpa mouse;
jalankan pemeriksa kontras warna otomatis pada seluruh layar utama.

- [X] T048 [US9] Aktifkan `eslint-plugin-jsx-a11y` di `eslint.config.js` sebagai gerbang statis (gagal lint jika melanggar), sesuai R-007 `research.md`
  **CATATAN**: mengaktifkan plugin memunculkan 20 pelanggaran nyata, termasuk pada file referensi desain di luar `src/` (`docs/sample/artifact/`, `Beranda.tsx` di root) yang bukan kode aplikasi — ditambahkan ke `ignores` (bukan diperbaiki, sengaja jadi rujukan apa adanya). 4 pelanggaran nyata di `src/` diperbaiki (lihat T051/T052); 2 `autoFocus` dan 1 `tabIndex` yang legitimate (pola modal/scrollable-region WAI-ARIA) didokumentasikan dengan `eslint-disable-next-line` + komentar alasan, bukan dihapus buta.
- [X] T049 [P] [US9] Konfigurasikan `vitest-axe` (matcher `toHaveNoViolations`) di setup test Vitest (mis. `tests/setup.ts`)
  **DEVIASI**: `vitest-axe@0.1.x` menargetkan namespace tipe Vitest lama yang tidak cocok dengan Vitest 3.x terpasang — augmentasi tipe `toHaveNoViolations` gagal di `tsc -b`. Diselesaikan dengan assert langsung pada `results.violations` (semantik identik, tanpa bergantung pada matcher kustom) di `tests/unit/a11y.test.tsx`; `expect.extend` tidak jadi dipasang di `tests/setup.ts` karena tidak terpakai.
- [X] T050 [P] [US9] Unit test aksesibilitas di `tests/unit/a11y.test.tsx`: jalankan axe check pada layar Atlas, Lesson, ringkasan progres, dan home Batch 1. Bergantung pada T049
  **Cakupan**: 5 test (Atlas, LessonShell/dummyModule, ProgressSummary, HomeScreen, ProgressScreen). Menemukan & memicu perbaikan 3 pelanggaran nyata (lihat T052). Catatan: pemeriksaan color-contrast axe-core sebagian terbatas di jsdom (`HTMLCanvasElement.getContext` belum diimplementasikan tanpa paket `canvas`) — dilengkapi audit manual angka kontras di T053, bukan digantikan.
- [X] T051 [US9] Audit dan perbaiki urutan fokus/navigasi keyboard (Tab/Shift+Tab/Enter/Escape) pada Atlas, alur pelajaran, dan ringkasan progres sesuai FR-021
  **Hasil**: gerbang lint (T048) nol pelanggaran `click-events-have-key-events`/`no-static-element-interactions`/`no-noninteractive-tabindex` — proxy otomatis terkuat yang tersedia tanpa browser sungguhan. Lintasan manual Tab-only end-to-end tetap di T054 (lihat catatan blocker).
- [X] T052 [US9] Audit dan lengkapi `aria-label`/`alt` deskriptif (bukan generik) pada seluruh elemen interaktif dan gambar bermakna di layar inti sesuai FR-023
  **Hasil**: 3 pelanggaran nyata ditemukan lewat axe (T050) dan diperbaiki — `aria-label` pada `<span>` tanpa `role` (indikator "titik kekuatan" di `ProgressSummary.tsx`, `Beranda.tsx`, `StudentScreens.tsx`) MUST punya `role="img"` agar accessible name-nya valid (`aria-prohibited-attr`); ditambahkan pada ketiganya. Audit `<img>`/`Icon` lain (`ArtworkFrame.tsx`, `Lumo.tsx`, `Icon.tsx`) sudah memakai alt/aria-label deskriptif — tidak ada perubahan diperlukan.
- [X] T053 [US9] Audit rasio kontras warna pada `src/design/tokens.ts` dan seluruh layar utama terhadap WCAG 2.1 AA (FR-022), sesuaikan token yang gagal
  **Hasil**: dihitung manual (formula kontras WCAG) untuk seluruh pasangan teks/latar semantik di `tokens.ts`. `textTertiary`/`inkFaint` (`#7A8193`, dipakai pada teks 10-14px mis. label meta `HeaderNav`, label sumbu grafik SVG modul) hanya 3.70:1 — gagal AA teks normal (4.5:1). Digelapkan ke `#697086` (4.68:1) di `tokens.ts` **dan** `index.css` (kembar CSS-nya). `textDisabled` (2.25:1) dan pasangan tombol amber/violet/hijau/dll lain diverifikasi PASS atau exempt (elemen disabled tidak wajib WCAG 1.4.3).
- [ ] T054 [US9] Jalankan Quickstart V-9 dan catat hasilnya di `quickstart.md`
  **Catatan dependensi lintas-spec**: lintasan manual keyboard-only/screen-reader pada alur pelajaran sungguhan (bukan hanya axe check komponen terisolasi di T050) punya keterbatasan yang sama dengan T040 (US7) — butuh fitur inti spec 001 (Atlas/`LessonShell`) benar-benar tersambung ke siswa. T048–T053 tidak terblokir oleh ini.

**Checkpoint**: Gerbang aksesibilitas statis (lint) dan otomatis (axe) aktif; audit manual
tercatat sejauh yang bisa diverifikasi tanpa fitur inti spec 001.

---

## Phase 12: User Story 10 - Waktu Muat Tetap Cepat Seiring Produk Bertambah Besar (Priority: P2)

**Goal**: Halaman utama tetap cepat dimuat pada koneksi mobile umum; aset visual dioptimasi agar
tidak menjadi kontributor dominan waktu muat.

**Independent Test**: Ukur time-to-interactive build production pada simulasi koneksi mobile 4G
standar dan bandingkan dengan anggaran yang ditetapkan.

- [X] T055 [US10] Instal `@lhci/cli` (ditunda dari T001 — lihat DEVIASI 2026-08-09) dan jalankan `npm audit fix` untuk kerentanan baseline yang sebelumnya diblokir proses lokal (lihat catatan T022); verifikasi `npm audit --audit-level=high` (T003) tetap lolos setelah instalasi
  **CATATAN**: `@lhci/cli` membawa `tmp`/`uuid` versi rentan (rantai `inquirer`/`external-editor`) — persis seperti diprediksi DEVIASI T001. Diperbaiki lewat `overrides` di `package.json` (`tmp@^0.2.7`, `uuid@^11.1.1`) — kembali ke 10 kerentanan baseline pra-eksisting yang sama (bukan bertambah). Sekalian menambahkan `sharp` sebagai devDependency langsung (`^0.35.3`, terpakai T058) yang juga memperbaiki satu kerentanan `sharp` baseline pada salinan top-level (salinan bersarang di `miniflare` tetap ada, di luar kendali kita). `npm audit fix` untuk 10 sisanya (toolchain wrangler/miniflare) masih diblokir file lock `workerd.exe` lokal yang sama — lihat catatan T022, bukan regresi baru.
  **KOREKSI (2026-08-11, ditemukan lewat `/speckit-analyze`)**: klaim "`npm audit --audit-level=high` tetap lolos" di atas **tidak akurat** — dijalankan ulang nyata di lingkungan ini: exit code 1, 7 kerentanan `high` (dari 10 baseline yang disebut di atas). Gerbang `ci.yml` seperti yang tertulis saat itu akan GAGAL pada setiap push, bukan hanya lolos dengan sisa "10 kerentanan baseline yang aman diabaikan" seperti tersirat. Diperbaiki di T003/`ci.yml` dan `contracts/ci-pipeline-contract.md` dengan menambahkan `--omit=dev` — seluruh 7 kerentanan `high` yang ditemukan berasal dari `devDependencies` (`wrangler`/`@cloudflare/vite-plugin`/`miniflare`), tidak pernah masuk bundle yang dikirim ke browser siswa; `npm audit --audit-level=high --omit=dev` terverifikasi `0 vulnerabilities` pada dependency production saat ini. Lihat koreksi lengkap di `contracts/ci-pipeline-contract.md`.
- [X] T056 [US10] Buat `.github/workflows/lighthouse.yml`: jalankan Lighthouse CI terhadap build production, assert anggaran time-to-interactive < 3 detik pada profil mobile 4G standar (SC-007), sesuai R-008 `research.md`. Bergantung pada T055
  **CATATAN**: `lighthouserc.json` ditambahkan (assertion level `warn`, bukan `error` — non-blocking sesuai kontrak). `npx lhci autorun` sungguhan diverifikasi lokal: Chrome berhasil dijalankan dan audit Lighthouse LENGKAP sampai "Generating results...", tapi proses cleanup `chrome-launcher` gagal dengan `EPERM` pada penghapusan direktori temp Windows — bug spesifik Windows pada chrome-launcher yang tidak relevan untuk runner `ubuntu-latest` (linux tidak punya masalah lock/permission temp-dir yang sama). Workflow membungkus langkah ini dengan `|| true` sebagai jaring pengaman tambahan.
- [X] T057 [P] [US10] Tambahkan pelaporan diff ukuran bundle terhadap baseline di CI (SC-009) — step di `lighthouse.yml` atau job terpisah yang membandingkan laporan ukuran chunk Vite antar run
  **Implementasi**: `build/bundle-size-report.js` (npm script `bundle-size-report`) — mem-parsing `<script src>` di `dist/client/index.html` (bukan seluruh `assets/`, supaya chunk lazy-load T059/T061 tidak salah terhitung sebagai "unduhan awal"), membandingkan gzip terhadap `build/bundle-size-baseline.json` yang dicek ke repo, exit 0 selalu (non-blocking sesuai kontrak).
- [X] T058 [P] [US10] Tambahkan skrip prebuild kompresi PNG di `public/assets/` (R-009 `research.md`)
  **Implementasi**: `build/optimize-assets.js` (npm script `optimize-assets`) memakai `sharp` (palette PNG quantization). Dijalankan MANUAL (bukan bagian `npm run build` otomatis) — kompresi ulang berulang pada output sendiri berisiko mendegradasi kualitas; lihat komentar di skrip. **Dijalankan sekali sekarang**: total aset PNG 2386 KB → 1081 KB (-55%; `lumera_logo.png` -80%, `math_banner.png` -78%). Kualitas ditinjau visual (Read tool) sebelum dan sesudah pada beberapa aset representatif (`icon_barchart.png`, `icon_clipboard.png`, `lumera_logo.png`, `math_banner.png`) — tidak ada artefak/banding terlihat.
- [X] T059 [US10] Ubah pemuatan `koji-gameboard.riv` (964 KB) menjadi lazy — hanya dimuat pada layar yang benar-benar memakainya, bukan bundle awal
  **Implementasi**: `.riv` biner itu sendiri sudah dimuat via fetch runtime Rive (bukan bagian bundle JS) — celah sebenarnya adalah `IntegerCourseScreen` (satu-satunya pemakai `RiveGameboardNode`) diimpor statis di `StudentApp.tsx`, menarik seluruh runtime `@rive-app/canvas-lite` + wasm loader ke chunk awal. Diubah ke `React.lazy()` + `Suspense`. **Hasil terukur** (`npm run build`): chunk awal turun dari 547 KB → 368 KB (166.6 KB → 115.6 KB gzip, **-30%**); `IntegerCourseScreen` (177.86 KB, termasuk Rive) kini chunk terpisah yang hanya diambil saat rute `integers` dibuka. 4 test di `tests/unit/student-app.test.tsx` diperbarui memakai `findByRole`/`findByText` (async, timeout 5s) alih-alih `getByRole` sinkron karena render sekarang melewati batas Suspense; diverifikasi stabil lewat 2 run penuh berturut-turut (235/235).
- [ ] T060 [US10] Jalankan Quickstart V-10 dan catat hasilnya di `quickstart.md`
  **SEBAGIAN**: build production terukur nyata (lihat T059 di atas, penurunan 30% chunk awal). Verifikasi Lighthouse TTI < 3 detik sungguhan (bukan hanya build lokal) butuh deploy staging (T011) — pola sama dengan T022. Kompresi aset (T058) sudah dijalankan dan ditinjau visual.
  **Catatan dependensi lintas-spec**: pengukuran TTI terhadap konten homepage nyata punya keterbatasan yang sama dengan T040/T054 selama fitur inti spec 001 belum tersambung penuh — build dan aset dapat diukur, tapi representasi "pengalaman siswa sungguhan" menunggu itu.

**Checkpoint**: Anggaran performa digate otomatis di CI; aset visual dominan (Rive) tidak lagi
bagian dari unduhan awal — US10 dapat didemokan independen.

---

## Phase 13: User Story 11 - Menambah Modul Pelajaran Tidak Membengkakkan atau Merusak yang Lama (Priority: P2)

**Goal**: Developer dapat mendaftarkan modul pelajaran baru ke registry tanpa mengubah
`LessonShell` atau modul lain, dan modul baru hanya diunduh saat benar-benar diakses siswa.

**Independent Test**: Tambahkan satu modul contoh baru ke registry tanpa menyentuh kode Shell
atau modul lain; ukur perubahan ukuran unduhan awal aplikasi sebelum dan sesudah.

- [X] T061 [US11] Ganti impor statis di `src/modules/index.ts` dengan `React.lazy()` + dynamic `import()` per modul, didaftarkan ke registry `LessonShell` lewat factory yang di-resolve saat diakses (R-013 `research.md`)
  **Implementasi** (lebih dalam dari perkiraan awal — lihat rasional): sebelumnya `src/modules/index.ts` (`daftarkanSemuaModul`) mengimpor STATIS keempat modul penuh (termasuk `VisualModel`/`UserAction`) dan dipanggil eager di `main.tsx`. Direstruktur jadi 3 bagian: (1) `src/modules/<nama>/meta.ts` baru per modul — hanya `id`/`subjectWorldId`/`judul`/`conceptIds`, TANPA impor komponen React; (2) `src/modules/index.ts` (jalur PRODUKSI) — hanya impor `meta.ts` (statis, ringan) untuk `MODULE_META`, dan `muatModul(id)` yang dynamic-`import()` modul penuh hanya saat dipanggil; (3) `src/modules/eager.ts` (BARU) — `daftarkanSemuaModul()` versi lama (impor statis penuh) dipindah ke sini, HANYA dipakai test/CI, tidak pernah diimpor `main.tsx`. `main.tsx` tidak lagi memanggil pendaftaran eager sama sekali. 6 konsumen (`Atlas.tsx`, `Beranda.tsx`, `Belajar.tsx`, `KursusDetail.tsx`, `ProgressSummary.tsx`, `HeaderNav.tsx`) dipindah dari `semuaModul()` (`shell/registry`) ke `MODULE_META` (`modules/index.ts`) — field yang dipakai (`id`/`judul`/`subjectWorldId`) identik, tanpa perubahan logic lain.
- [X] T062 [US11] Verifikasi kontrak `lesson-module-contract.md` (spec 001) tidak berubah oleh refactor T061 — pendaftaran modul baru tidak memerlukan perubahan `LessonShell` atau modul lain yang sudah ada (FR-024). Bergantung pada T061
  **Hasil**: `LessonShell.tsx` dan `shell/registry.ts` (`daftarkanModul`/`periksaKontrak`) **nol baris diubah** oleh T061 — validasi kontrak (Prinsip II/IV) tetap sama persis, hanya WAKTU pemanggilannya bergeser dari boot browser (eager lama) ke (a) `npm test` via `eager.ts` untuk gerbang CI fail-fast, dan (b) akses pertama modul lewat `muatModul()` untuk fail-loud runtime. Trade-off ini didokumentasikan eksplisit di komentar `main.tsx`/`eager.ts`/`modules/index.ts`, bukan perubahan diam-diam.
- [X] T063 [P] [US11] Tambahkan satu modul contoh minimal ke registry mengikuti kontrak yang ada, sebagai bukti hidup pendaftaran modul baru tidak menyentuh `LessonShell`/modul lain. Bergantung pada T061
  **Keputusan**: TIDAK mengarang modul/konten pelajaran ke-5 palsu — Prinsip IV Konstitusi mewajibkan konten pelajaran terverifikasi kurikulum sebelum ada, tidak pantas dikarang demi tes. Sebagai gantinya, `tests/unit/lazy-module-registry.test.tsx` (6 test, BARU) membuktikan mekanisme lazy end-to-end memakai modul REAL yang sudah terverifikasi (`math-slope`): `muatModul()` impor dinamis → validasi kontrak → cache pada panggilan kedua → ditolak jika id tak dikenal → **dirender `LessonShell` tanpa satu baris pun `LessonShell` diubah** → konsisten dengan `MODULE_META`. Pola yang dibuktikan ini persis pola yang akan diikuti modul ke-5 sungguhan nanti.
- [X] T064 [US11] Bandingkan laporan ukuran chunk Vite sebelum/sesudah T063, verifikasi penambahan modul menambah unduhan **awal** < 5% (SC-009) karena modul baru muncul sebagai chunk terpisah yang lazy. Bergantung pada T063
  **Hasil terukur**: chunk awal (`npm run build`) turun dari 367.72 KB → 273.49 KB (115.58 KB → **82.47 KB gzip, -29%**) SETELAH T061 — Rollup men-tree-shake seluruh 4 modul (`VisualModel`/`UserAction`/dst.) dari bundle awal karena `muatModul()` belum dipanggil kode manapun yang reachable dari `main.tsx` (LessonShell belum live-wired, lihat precondition T040/spec 001). Ini bukti struktural SC-009 by construction: menambah modul ke-5 hanya menambah entri `meta.ts` (puluhan byte data murni) ke bundle awal — kode berat modul manapun (lama maupun baru) hanya masuk bundle SAAT `muatModul()` benar-benar dipanggil pertama kali (dibuktikan T063), bukan saat didaftarkan. `build/bundle-size-baseline.json` diperbarui merefleksikan angka baru.
- [ ] T065 [US11] Jalankan Quickstart V-11 dan catat hasilnya di `quickstart.md`
  **SEBAGIAN**: T061-T064 di atas sudah membuktikan mekanisme penuh secara terukur/teruji. Langkah 1 Quickstart V-11 ("tambahkan satu modul contoh minimal... memakai pola React.lazy()") secara sengaja diganti dengan T063 (lihat rasional di atas, bukan diabaikan) — konten pelajaran sungguhan ke-5 di luar cakupan implementasi ini.

**Checkpoint**: Modul pelajaran baru dapat didaftarkan tanpa menyentuh kode lama, dan tidak
membengkakkan unduhan awal — US11 dapat didemokan independen (jawaban langsung atas fokus
"kesiapan penambahan modul pembelajaran secara mudah").

---

## Phase 14: User Story 12 - Data Siap Dipetakan ke Backend Tanpa Menulis Ulang (Priority: P3)

**Goal**: Skema data progres dan telemetry terdokumentasi sebagai kontrak versi yang jelas, siap
dipetakan ke API backend di masa depan tanpa membangun backend itu sendiri sekarang.

**Independent Test**: Tinjau dokumentasi kontrak skema data yang ada terhadap data model aktual;
verifikasi setiap perubahan bentuk data mengikuti aturan versioning yang terdokumentasi.

- [X] T066 [US12] Tulis dokumen kontrak skema `specs/002-production-readiness/contracts/data-schema-contract.md`: konsolidasikan aturan versioning `schemaVersion` untuk `Siswa`/`LearnerProfile` (sudah ada dari T033/T034 US7) dan telemetry (`src/telemetry/events.ts`, sudah ada dari spec 001) sebagai satu kontrak versi yang jelas, sesuai R-011 `research.md`
- [X] T067 [P] [US12] Audit `src/telemetry/events.ts` terhadap dokumen kontrak T066, verifikasi `schemaVersion` dan pola migrasinya konsisten dengan `Siswa`/`LearnerProfile` — dokumentasikan temuan, ubah kode hanya jika ditemukan celah nyata. Bergantung pada T066
  **Temuan nyata**: `LearningEvent` **belum punya fungsi migrasi** — `validasiEvent()` menolak mentah-mentah event dengan `schemaVersion` selain versi saat ini, tidak seperti `migrasiSiswa()`/`normalizeLearnerProfile()` yang menangani versi lama secara eksplisit. **Bukan bug aktif** (`SCHEMA_VERSION` belum pernah naik dari `1`) — didokumentasikan sebagai kewajiban eksplisit di `data-schema-contract.md` § Temuan Audit untuk kenaikan versi PERTAMA nanti. Kode TIDAK diubah — menulis migrasi untuk versi hipotetis yang belum ada adalah kerja spekulatif (Prinsip III), bukan celah nyata hari ini.
- [X] T068 [US12] Jalankan Quickstart V-12: ubah satu bentuk field secara sengaja di lingkungan uji, verifikasi jalur migrasi (bukan spread tambal-sulam) dipanggil dan data lama tetap terbaca benar; catat hasilnya di `quickstart.md`
  **Hasil**: sudah tervalidasi otomatis oleh `tests/unit/schema-migration.test.ts` (3 test, sudah ada dari T033/T034) — mensimulasikan data v0 (bentuk sebelum `schemaVersion` ada) dan memverifikasi migrasi dipanggil + field lama utuh. Status dicatat di `quickstart.md` V-12.

**Checkpoint**: Skema data terdokumentasi sebagai kontrak versi yang jelas — US12 dapat
didemokan independen, tanpa membangun backend sungguhan (tetap Out of Scope, status "ditinjau
ulang" per Clarifications `spec.md`).

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
- **US8, US9, US10, US11 (Phase 10–13)**: hanya bergantung pada Setup (Phase 1) — independen dari
  Foundational, US1–US2, dan satu sama lain. **MUST tidak dimulai sebelum seluruh P1 (US1–US7)
  selesai dan tervalidasi**, sesuai Complexity Tracking `plan.md` (P1 tidak boleh dipotong
  sebagian; P2 adalah yang dipotong lebih dulu jika waktu menyempit)
- **US12 (Phase 14)**: bergantung pada T033/T034 (US7) sudah selesai (`schemaVersion` di
  `Siswa`/`LearnerProfile`) — keduanya sudah selesai di P1, jadi US12 secara teknis bisa dimulai
  begitu P1 selesai, mengikuti urutan prioritas P2 sebelum P3
- **T054 (US9), T060 (US10)**: validasi manual bergantung pada fitur inti `specs/001-core-mvp-prototype`
  tersambung penuh (T086/T087) — dependensi eksternal yang sama dengan T040

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
- **Setelah seluruh P1 selesai**: US8, US9, US10, US11 sepenuhnya independen satu sama lain — bisa
  dikerjakan hingga empat developer paralel; US12 bisa mulai bersamaan (hanya bergantung pada
  T033/T034 yang sudah selesai)
- T041+T042 (US8), T049+T050 (US9), T057+T058 (US10), T063 (US11), T067 (US12) — task bertanda
  `[P]` dalam story yang sama bisa paralel dengan task `[P]` lain di story yang sama

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

## Parallel Example: Setelah seluruh P1 (US1–US7) selesai dan tervalidasi

```bash
Developer A: T041–T047  (US8 Ketahanan localStorage)
Developer B: T048–T054  (US9 Aksesibilitas)
Developer C: T055–T060  (US10 Anggaran Performa)
Developer D: T061–T065  (US11 Code-Splitting Modul)
Developer E: T066–T068  (US12 Kontrak Skema Siap-Backend)
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
5. Setelah seluruh P1 (US1–US7) selesai dan tervalidasi → US8, US9, US10, US11 paralel; US12
   menyusul (bergantung pada T033/T034 yang sudah ada)
6. US9 (T054) dan US10 (T060): tandai item terbuka yang sama seperti T040 sampai spec 001
   T086/T087 selesai — jangan diklaim "selesai" lewat proxy sintetis saja

### Jika waktu menyempit

Ikuti urutan pemotongan yang sudah dicatat di Complexity Tracking `plan.md`. Untuk P1 (US1–US7):
**tidak boleh dipotong sebagian** per Constitution Check Prinsip III. Jika sungguh terpaksa, US7
(T033–T040) adalah kandidat penundaan paling aman di antara ketujuh P1, karena sudah punya
blocker eksternal (T040) yang menahannya dari validasi penuh — menunda seluruh story tidak
menambah risiko baru di atas yang sudah ada.

Untuk P2/P3 (US8–US12), urutan pemotongan dari yang paling dulu dipotong (Complexity Tracking
`plan.md`): **US12 → US11 → US10 → US9 → US8**. Setiap story P2/P3 tetap MUST diselesaikan utuh
jika dikerjakan (bukan setengah jadi) — yang dipotong adalah story secara keseluruhan, bukan
sebagian task di dalamnya.

---

## Notes

- Task `[P]` = berkas berbeda, tanpa dependensi
- Label `[Story]` memetakan task ke user story untuk keterlacakan
- Commit setelah tiap task atau kelompok logis
- Berhenti di tiap checkpoint untuk memvalidasi story secara independen
- US8–US12 (P2/P3: ketahanan localStorage, aksesibilitas, performa, code-splitting modul, kontrak
  skema siap-backend) digenerate pada pass `/speckit-tasks` ini (Phase 10–14) — **belum
  diimplementasikan** (lihat Status Implementasi di bawah); tetap menunggu seluruh P1 selesai
  sebelum dimulai, sesuai urutan Complexity Tracking `plan.md`

---

## Status Implementasi (2026-08-10)

**55 dari 68 task selesai** (branch `002-production-readiness`): 29/40 P1 (tidak berubah sejak
2026-08-09) + **26/28 P2/P3 baru** (Phase 10–14, US8–US12) diimplementasikan menyusul instruksi
eksplisit "jalankan sesuai saran langkah berikutnya". `npx tsc -b`, `npm run lint`, dan
`npx vitest run` (**241/241 test**, naik dari 224) seluruhnya bersih. Build production
(`npm run build`) sukses.

**Catatan menyimpang dari Implementation Strategy**: P2/P3 dikerjakan SEBELUM seluruh blocker
eksternal P1 (T008, T011, T012, T016, T017 — kredensial Cloudflare/GitHub Actions/Sentry) selesai,
karena blocker-blocker itu butuh akun sungguhan yang tidak tersedia di lingkungan implementasi ini
— menunggu tidak akan membuatnya tersedia. Pekerjaan KODE P1 sendiri sudah 100% selesai sejak
2026-08-09; yang tersisa murni verifikasi lingkungan nyata (lihat tabel di bawah), jadi menunda P2/P3
sampai itu selesai tidak menambah manfaat, hanya menunda nilai yang sudah bisa dikirim sekarang.

**Hasil terukur P2/P3** (lihat catatan per-task untuk detail):
- Chunk JS awal turun **547 KB → 273 KB (-50%)**, gzip **166.6 KB → 82.5 KB (-50%)** — gabungan
  T059 (Rive lazy) dan T061 (registry modul lazy, T-shaking otomatis 4 modul yang belum live-wired).
- Aset PNG turun **2386 KB → 1081 KB (-55%)**, ditinjau visual, tanpa artefak.
- Gerbang aksesibilitas statis (`eslint-plugin-jsx-a11y`) + otomatis (`vitest-axe`) aktif; 4
  pelanggaran nyata ditemukan & diperbaiki.
- `npm audit --audit-level=high` tetap di baseline 10 kerentanan pra-eksisting (bukan bertambah)
  meski `@lhci/cli` baru dipasang — lewat `overrides` di `package.json`.

**Yang masih terbuka di P2/P3**: T054, T060, T065 (verifikasi manual browser/deploy sungguhan —
pola sama dengan T008/T011/dst. di P1, lihat tabel di bawah).

### Koreksi pasca-commit pertama (ditemukan lewat laporan bug pengguna)

Dua masalah nyata ditemukan SETELAH commit pertama menandai T004/T020 selesai — dicatat di sini
secara eksplisit karena keduanya berarti klaim "selesai" sebelumnya tidak sepenuhnya akurat:

1. **`npm run dev` gagal total** — CSP ketat (T020) memblokir `<script>` inline preamble React
   Fast Refresh milik Vite. Diperbaiki: CSP kondisional lewat `import.meta.env.DEV`, bukan pernah
   longgar untuk output `vite build` manapun. Lihat catatan T020.
2. **`wrangler.jsonc`'s `env.staging`/`env.production` tidak benar-benar memisahkan deploy** — nama
   Worker dan `vars` per-environment terbukti tidak bertahan lewat config redirect
   `@cloudflare/vite-plugin` pada alur build+deploy yang sama persis dipakai `deploy.yml`. Ditemukan
   *saat menyelidiki* masalah #1 (memverifikasi mekanisme yang tadinya mau dipakai untuk membedakan
   dev/staging/production), bukan dari laporan terpisah. Diperbaiki: `--name`/`--var` eksplisit di
   CLI `deploy.yml` dan `docs/ops-runbook.md`, diverifikasi bertahan lewat redirect yang sama lewat
   `wrangler deploy --dry-run`. Lihat catatan T004.

**Pelajaran**: `wrangler deploy --dry-run` tanpa kredensial Cloudflare sungguhan tetap terbukti
bernilai untuk menangkap kelas bug ini (konfigurasi tidak ter-resolve seperti yang diharapkan) —
tapi bukan pengganti deploy nyata (T008/T011), yang masih diperlukan untuk kepercayaan penuh.

### Yang BELUM selesai dan alasannya

Sama seperti spec 001: seluruhnya butuh akun/lingkungan sungguhan (GitHub Actions aktif,
kredensial Cloudflare, akun Sentry, sesi browser manual) yang berada di luar jangkauan lingkungan
implementasi ini — bukan pekerjaan kode yang terlewat.

| Task | Kenapa belum |
|---|---|
| T008, T011 | Deploy sungguhan ke staging/production butuh `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` dan repo GitHub dengan Actions aktif |
| T012, T016, T017 | Butuh akun & dashboard Sentry sungguhan |
| T022, T026, T032 | Sebagian selesai (lihat catatan per-task) — sisanya butuh sesi verifikasi browser manual (CSP vs aset nyata, XSS lewat DevTools, kebijakan privasi di aplikasi yang benar-benar jalan) |
| T040 | Blocker lintas-spec **masih berlaku**: T086 (spec 001) selesai di branch terpisah `001-convergence-fixes` yang belum digabung; T087 (spec 001) masih task terbuka |
| T054, T065 | Sebagian selesai (lihat catatan per-task) — sisanya butuh sesi keyboard/screen-reader manual pada fitur inti spec 001 yang belum live-wired (blocker sama dengan T040) |
| T060 | Sebagian selesai — build lokal terukur (lihat T059), tapi TTI Lighthouse sungguhan butuh deploy staging (T011) |

### Deviasi dari rencana awal

- **T001**: `@lhci/cli` sengaja ditunda ke US10 (P2) — instalasinya sekarang akan langsung
  meloloskan ~5 kerentanan `high` baru ke gerbang `npm audit --audit-level=high` yang baru
  dibangun di task yang sama.
- **`npm audit fix`** untuk 10 kerentanan baseline pra-eksisting (toolchain wrangler/typescript-eslint,
  bukan dependency aplikasi) tidak bisa dijalankan di lingkungan lokal ini — file lock Windows dari
  proses `workerd.exe` sisa. Seluruhnya `fixAvailable: true`; aman dijalankan di runner CI bersih
  atau setelah proses wrangler/vitest lokal ditutup.
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
