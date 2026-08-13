# Phase 0 Research: Kesiapan Produksi

Setiap keputusan di bawah menyelesaikan satu area yang butuh pilihan konkret sebelum desain
Phase 1. Format: Decision / Rationale / Alternatives considered.

## R-001: Platform CI/CD

**Decision**: GitHub Actions.

**Rationale**: Repositori sudah di-host di GitHub (`origin` → `github.com/Bufv/Lumera`). GitHub
Actions gratis untuk kebutuhan skala tim/trafik saat ini, terintegrasi native dengan Dependabot
(R-005), dan tidak menambah akun/layanan pihak ketiga baru.

**Alternatives considered**: CircleCI/Travis — menambah akun eksternal tanpa manfaat tambahan
untuk repo yang sudah di GitHub. Cloudflare Pages built-in CI — proyek memakai Cloudflare
**Workers** (bukan Pages) lewat `@cloudflare/vite-plugin` + `wrangler.jsonc`, jadi build/deploy
tetap perlu dipicu dari luar (GitHub Actions memanggil `wrangler deploy`).

## R-002: Pemisahan Environment Staging/Production

**Decision**: Environment bernama di `wrangler.jsonc` (`env.staging`, `env.production`), masing-
masing dengan nama Worker berbeda sehingga URL deploy juga berbeda.

**Rationale**: Wrangler mendukung banyak environment dalam satu config tanpa infrastruktur
tambahan — cocok dengan constraint "tanpa layanan enterprise baru". Push ke branch non-utama
men-deploy ke `staging`; merge ke `main` men-deploy ke `production` (lihat R-001 workflow).

**Alternatives considered**: Dua repo/proyek Cloudflare terpisah — duplikasi konfigurasi tanpa
manfaat; branch preview bawaan Cloudflare Pages — tidak berlaku karena proyek memakai Workers.

## R-003: Mekanisme Rollback

**Decision**: `wrangler rollback` (Cloudflare Workers gradual deployments/versioning), dipicu
manual oleh tim lewat perintah terdokumentasi di `quickstart.md` — bukan otomatis.

**Rationale**: Cloudflare Workers menyimpan riwayat versi deploy secara native; rollback tidak
memerlukan build ulang dari kode (memenuhi FR-004 secara langsung) dan selesai dalam hitungan
menit (SC-002). Rollback tetap keputusan manusia (bukan auto-rollback berbasis metrik) karena
proyek belum punya sinyal kualitas otomatis yang cukup andal untuk dipercaya memicu rollback
sendiri.

**Alternatives considered**: Auto-rollback berbasis error-rate dari Sentry — over-engineering
pada tahap ini (selaras Prinsip III/Complexity Tracking spec 001); revert commit + redeploy —
lebih lambat dari `wrangler rollback` dan gagal memenuhi "hitungan menit" pada SC-002 jika build
lambat.

## R-004: Layanan Pemantauan Error Produksi

**Decision**: Sentry (`@sentry/react`), tingkatan gratis, dikonfigurasi dengan `beforeSend` yang
menyaring field selain: pesan error, stack trace, route/hash aplikasi, dan versi build. **Tidak**
mengirim `displayName`, isi `localStorage`, atau identifier apapun yang bisa dihubungkan ke siswa
tertentu.

**Rationale**: SDK resmi untuk React sudah matang, tingkatan gratis (event bulanan terbatas)
lebih dari cukup untuk skala prototype, dan `beforeSend` memberi titik kontrol eksplisit untuk
memenuhi gate Prinsip VI vs privasi anak (Constitution Check plan.md). Tidak perlu backend
sendiri untuk menampung log error (menjaga constraint "tanpa backend baru").

**Alternatives considered**: Membangun endpoint log sendiri di Worker + KV — menambah permukaan
yang harus dijaga (retensi, akses, keamanan) untuk manfaat yang sudah tersedia gratis dari SaaS
matang; LogRocket/Bugsnag — fitur setara namun tingkatan gratis lebih terbatas untuk kasus ini.

## R-005: Pemindaian Kerentanan Dependency

**Decision**: Dua lapis — (a) GitHub Dependabot (`.github/dependabot.yml`) untuk alert dan PR
pembaruan terjadwal, (b) `npm audit --audit-level=high` sebagai step wajib di `ci.yml` yang
menahan merge jika ada kerentanan tinggi/kritis pada dependency yang diubah.

**Rationale**: Dependabot menangani pemantauan berkelanjutan (di luar siklus PR manapun);
`npm audit` di CI menangani gerbang tepat-waktu (FR-008) sehingga kerentanan tidak lolos lewat PR
yang sedang berjalan sebelum Dependabot sempat memindainya. Keduanya native GitHub, tanpa akun
baru.

**Alternatives considered**: Snyk — kapabilitas serupa tapi menambah akun/layanan pihak ketiga
untuk manfaat yang sudah dipenuhi kombinasi Dependabot + `npm audit`.

## R-006: Mekanisme Header Keamanan

**Decision**: Sisipkan header di `worker/index.js` dengan membungkus response dari
`env.ASSETS.fetch(...)` sebelum dikembalikan, dan ubah `run_worker_first: true` di
`wrangler.jsonc` agar Worker selalu dilewati (lihat Complexity Tracking plan.md untuk trade-off).

**Rationale**: `worker/index.js` sudah menjadi satu-satunya kode yang menyentuh setiap response
HTML/SPA-fallback; ini titik natural untuk menambahkan `Content-Security-Policy`,
`X-Content-Type-Options`, dan pelindung framing tanpa menambah layer baru. Dengan
`run_worker_first: false` (nilai saat ini), aset yang sukses (200) tidak pernah menyentuh kode
Worker — header tidak akan pernah terpasang pada respons paling umum.

**Alternatives considered**: Berkas `_headers` statis (konvensi Cloudflare Pages) — tidak
berlaku untuk Workers dengan `assets` binding pada `compatibility_date` proyek ini.

## R-007: Perkakas Aksesibilitas

**Decision**: `eslint-plugin-jsx-a11y` sebagai gerbang statis di `eslint.config.js` (gagal build
jika melanggar), ditambah `vitest-axe` untuk uji otomatis atas rasio kontras & label pada layar
inti (Atlas, Lesson, ringkasan progres, home Batch 1), ditambah satu lintasan manual
keyboard-only + screen reader yang didokumentasikan di `quickstart.md` sebagai jaring pengaman
untuk hal yang tidak bisa dites otomatis (mis. urutan fokus yang masuk akal).

**Rationale**: Kombinasi statis + otomatis + manual mengikuti pola yang sama dengan spec 001
(unit test untuk logika, manual quickstart untuk yang butuh mata/tangan manusia) — konsisten
dengan keputusan R-007 spec 001, bukan pola baru yang asing bagi tim.

**Alternatives considered**: Hanya audit manual — tidak ada gerbang otomatis berarti regresi
aksesibilitas bisa lolos tanpa terdeteksi berbulan-bulan.

## R-008: Pengukuran Performa

**Decision**: Lighthouse CI (`@lhci/cli`) dijalankan di `.github/workflows/lighthouse.yml`
terhadap build production, dengan assertion anggaran time-to-interactive (SC-007) dan diff
ukuran bundle terhadap baseline (SC-009).

**Rationale**: Lighthouse CI adalah standar industri untuk anggaran performa yang bisa digate di
CI tanpa layanan berbayar, dan mengukur metrik yang sama dengan yang dipakai developer secara
manual lewat Chrome DevTools — tidak ada dua sumber kebenaran performa.

**Alternatives considered**: WebPageTest API — butuh API key/kuota eksternal untuk kebutuhan yang
sudah dipenuhi Lighthouse CI open-source.

## R-009: Optimasi Aset

**Decision**: Skrip prebuild yang mengompresi PNG di `public/assets/` (saat ini didominasi oleh
beberapa varian maskot Lumo dan `koji-gameboard.riv` 964 KB) dan memuat `.riv` secara lazy hanya
pada layar yang memakainya, alih-alih memuatnya di bundle awal.

**Rationale**: Footprint aset saat ini (≈3.4 MB di `public/assets/`) hampir seluruhnya dari aset
raster/Rive, bukan kode — kompresi dan lazy-load menyerang kontributor waktu muat yang sebenarnya
(SC-007), bukan optimasi kode yang dampaknya kecil di sini.

**Alternatives considered**: Pindah ke CDN gambar pihak ketiga — menambah layanan berbayar/akun
baru untuk masalah yang sudah selesai dengan kompresi lokal pada skala aset saat ini.

## R-010: Format Berkas Ekspor/Impor Progres

**Decision**: JSON ber-versi (`schemaVersion`), berisi snapshot `Siswa` + `LearnerProfile`,
diunduh lewat `Blob` + elemen `<a download>`, diunggah lewat `<input type="file">` dan divalidasi
sebelum menimpa state lokal. Detail penuh di `contracts/progress-export-contract.md`.

**Rationale**: Tidak butuh dependency baru (Web API bawaan browser sudah cukup); pola validasi
sebelum menerima data mengikuti pola yang sudah ada di `telemetry/validate.ts` (menolak data
tidak valid dengan error terlihat, bukan gagal diam-diam) — konsisten dengan kontrak aturan 3
`lesson-module-contract.md` dari spec 001.

**Alternatives considered**: Sinkronisasi otomatis ke cloud storage pengguna (Google Drive, dst.)
— eksplisit di luar cakupan (spec.md § Out of Scope: sinkronisasi lintas perangkat berbasis akun).

## R-011: Kontrak Skema Data Siap-Backend

**Decision**: Tambahkan field `schemaVersion: number` eksplisit ke bentuk persisten `Siswa`
(`progress/store.ts`) dan `LearnerProfile` (`profile/store.ts`), mengikuti pola yang sudah
ditetapkan `telemetry/events.ts` (`schemaVersion: 1`) di spec 001. Aturan versioning: perubahan
bentuk field yang tidak backward-compatible MUST menaikkan `schemaVersion` dan menyertakan fungsi
migrasi dari versi sebelumnya.

**Rationale**: Spec 001 sudah membuktikan pola ini bekerja untuk telemetry; memperluasnya ke dua
struktur data lain yang juga kandidat migrasi backend menutup celah tanpa merancang pola baru.

**Alternatives considered**: Menunda skema versi sampai backend benar-benar dibangun — berisiko
mengulang masalah yang sudah pernah terjadi pada `progress/store.ts` (lihat kode saat ini yang
melakukan spread manual `{ ...siswaBaru(), ...parsed }` untuk mengisi field yang hilang dari data
lama — pola tambal-sulam yang justru ingin dicegah versioning eksplisit).

## R-012: Pola Ketahanan localStorage

**Decision**: Satu utilitas bersama `src/storage/safeStorage.ts` yang membungkus
`getItem`/`setItem` dengan deteksi kuota-penuh dan mode-diblokir, dipakai ulang oleh
`progress/store.ts` dan `profile/store.ts` (menggantikan try/catch yang saat ini terduplikasi
secara independen di masing-masing berkas), plus satu komponen `StorageWarningBanner` yang
tampil saat penulisan gagal.

**Rationale**: `profile/store.ts` dan `progress/store.ts` sudah masing-masing punya try/catch
sendiri untuk kondisi ini — menyatukannya jadi satu utilitas mencegah kedua tempat itu makin
berbeda perilaku seiring waktu, dan memberi satu titik untuk memicu banner peringatan (FR-026)
yang sebelumnya tidak ada sama sekali (saat ini error hanya di-`console.error`, tidak terlihat
siswa).

**Alternatives considered**: Biarkan tiap store menangani sendiri — sudah terbukti berisiko
divergen (progress/store.ts mengembalikan `siswaBaru()` diam-diam saat gagal parse, tanpa
memberi tahu siswa sama sekali — persis pelanggaran FR-026 yang ingin ditutup).

## R-013: Code-Splitting Modul Pelajaran

**Decision**: Ganti impor statis di `src/modules/index.ts` dengan `React.lazy()` +
dynamic `import()` per modul, didaftarkan ke `LessonShell`'s registry lewat factory yang
di-resolve saat modul benar-benar diakses.

**Rationale**: Vite membuat chunk terpisah otomatis untuk setiap dynamic `import()` tanpa
konfigurasi tambahan — mekanisme paling sederhana yang tersedia dan konsisten dengan constraint
"tanpa state management global/tooling tambahan" dari Complexity Tracking spec 001.

**Alternatives considered**: Route-based code splitting granular per-langkah Shell — di luar
cakupan; unit modul (bukan langkah) sudah cukup granular mengikuti struktur `modules/` yang ada.

## R-014: Ambang Notifikasi Lonjakan Error (FR-007)

**Decision**: 10 error dalam jendela 5 menit memicu alert rule di dasbor Sentry, ditetapkan lewat
sesi `/speckit-clarify` 2026-08-09 (bukan lagi "ambang batas wajar" tanpa angka).

**Rationale**: Skala trafik saat ini masih prototype/early-stage (Assumptions spec.md) dengan
sedikit pengguna aktif bersamaan — 10 error/5 menit cukup sensitif untuk menangkap lonjakan nyata
tanpa noise dari 1-2 error sporadis yang wajar terjadi pada aplikasi web apapun. Selaras dengan
SC-003 (deteksi < 5 menit): jendela alert yang sama dengan target waktu deteksi menjaga kedua
metrik tetap konsisten satu sama lain.

**Alternatives considered**: Ambang relatif (mis. lonjakan >3x rata-rata harian) — lebih tahan
terhadap perubahan skala trafik, tapi butuh baseline historis yang belum ada saat ini; ditolak
sampai ada data trafik produksi nyata untuk dijadikan baseline. Bisa dikalibrasi ulang nanti tanpa
mengubah mekanisme (Sentry alert rule tetap sama, hanya angkanya berubah).
