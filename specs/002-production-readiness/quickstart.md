# Quickstart: Validasi Kesiapan Produksi

Panduan verifikasi manual/semi-manual untuk tiap user story di `spec.md`. Sesuai keputusan R-007
(mengikuti pola spec 001): logika murni diuji otomatis lewat Vitest; hal yang butuh mata manusia
atau lingkungan sungguhan (browser nyata, deploy sungguhan) diverifikasi di sini.

**Prasyarat**: `npm install`, akses ke repo GitHub dengan Actions aktif, akun Sentry (tingkatan
gratis) sudah dibuat dan DSN tersedia sebagai secret CI.

## V-1 — Deploy Aman dengan Rollback (US1)

1. Buat perubahan yang sengaja gagal test, dorong ke sebuah branch, buka PR.
   **Expected**: gerbang `ci.yml` gagal (lihat `contracts/ci-pipeline-contract.md`), tidak ada
   deploy yang terpicu.
2. Perbaiki perubahan agar lolos, merge ke `main`.
   **Expected**: `deploy.yml` berjalan, `production` menerima versi baru, commit SHA baru
   terlihat sebagai `appVersion` (lihat `data-model.md`).
3. Jalankan `wrangler rollback` mengikuti prosedur R-003.
   **Expected**: `production` kembali ke versi sebelumnya dalam < 10 menit (SC-002), tanpa build
   ulang.

## V-2 — Staging Terpisah dari Production (US2)

1. Dorong perubahan ke branch non-`main`.
   **Expected**: deploy otomatis ke `staging` (URL Worker berbeda dari `production`, lihat
   R-002), data siswa di `production` tidak berubah.

## V-3 — Deteksi Error Produksi (US3)

1. Di build `staging`, picu error runtime yang disengaja (mis. lewat console browser).
   **Expected**: error muncul di dasbor Sentry dalam < 5 menit (SC-003), field yang terkirim
   sesuai `data-model.md` § ErrorReportContext — **verifikasi eksplisit tidak ada `displayName`
   atau isi `localStorage` yang ikut terkirim**.
2. Picu ≥10 error berturut-turut dalam jendela 5 menit (ambang FR-007, lihat R-014
   `research.md`).
   **Expected**: tim menerima notifikasi tanpa membuka dasbor secara manual.

## V-4 — Gerbang Keamanan Otomatis (US4)

1. Tambahkan dependency dengan kerentanan tinggi yang diketahui pada branch uji.
   **Expected**: `npm audit --audit-level=high` di `ci.yml` gagal, merge tertahan.
2. Buka DevTools → Network pada `staging` dan `production`, periksa response header pada
   permintaan dokumen HTML dan salah satu aset statis (bukan hanya fallback SPA).
   **Expected**: seluruh header di `contracts/security-headers-contract.md` hadir pada
   **keduanya** (200 aset maupun fallback), karena `run_worker_first: true`.
3. Verifikasi aset Rive (`koji-gameboard.riv`) dan canvas modul Fisika tetap termuat setelah CSP
   aktif.
   **Expected**: tidak ada entri `Refused to load/connect` terkait CSP di console.

## V-5 — Data & Input Siswa Aman (US5)

1. Audit seluruh kunci `localStorage` yang dipakai aplikasi (`lumera.progress.v1`,
   `lumera.profile.v1`, dst).
   **Expected**: tidak ada field email/nomor telepon/alamat pada data manapun.
2. Masukkan `<img src=x onerror=alert(1)>` sebagai nama tampilan lewat onboarding, lalu lihat
   nama tersebut dirender ulang di header/HomeScreen.
   **Expected**: teks tampil apa adanya sebagai string, skrip tidak tereksekusi.
3. Periksa berkas hasil `npm run build` di `dist/`.
   **Expected**: tidak ada berkas `.map` yang ikut ter-deploy secara publik, tidak ada
   `console.log` debug yang mengekspos state internal.

## V-6 — Kepatuhan Privasi Anak (US6)

1. Buka halaman kebijakan privasi dari aplikasi (rute baru di `src/privacy/`).
   **Expected**: dapat diakses tanpa navigasi rumit, isi menjelaskan data yang dikumpulkan dalam
   bahasa non-teknis.
2. Jalankan aksi "hapus semua data saya" dari Pengaturan.
   **Expected**: `localStorage.getItem('lumera.progress.v1')`,
   `localStorage.getItem('lumera.profile.v1')`, dan data telemetry seluruhnya kosong setelahnya.

## V-7 — Progres Tidak Hilang Permanen (US7)

1. Selesaikan satu pelajaran, catat Lumens/streak/mastery saat ini, lalu ekspor progres
   (menghasilkan berkas sesuai `contracts/progress-export-contract.md`).
2. Hapus seluruh `localStorage` (simulasikan ganti perangkat).
   **Expected**: progres di aplikasi kembali ke kondisi siswa baru.
3. Impor berkas dari langkah 1.
   **Expected**: Lumens/streak/mastery pulih persis seperti sebelum dihapus, dalam < 2 menit
   (SC-006).
4. Coba impor berkas dengan `schemaVersion` yang sengaja diubah jadi angka tidak dikenal.
   **Expected**: impor ditolak dengan pesan jelas, progres lokal yang ada tidak rusak/berubah.

## V-8 — Ketahanan localStorage (US8)

1. Di DevTools, aktifkan mode yang membuat `localStorage.setItem` melempar error (simulasi kuota
   penuh) atau buka aplikasi dalam mode incognito dengan storage diblokir penuh.
   **Expected**: `StorageWarningBanner` (R-012) tampil, aplikasi tetap dapat dipakai pada sesi
   tersebut — bukan halaman gagal/putih.
2. Selesaikan sebuah pelajaran dalam kondisi di atas.
   **Expected**: siswa diberi tahu progres sesi ini tidak akan tersimpan; tidak ada crash diam-diam.

## V-9 — Navigasi Keyboard & Screen Reader (US9)

1. Lepas mouse sepenuhnya. Navigasi Atlas → pilih modul → selesaikan satu pelajaran → lihat
   ringkasan progres, hanya dengan Tab/Shift+Tab/Enter/Escape.
   **Expected**: seluruh alur dapat diselesaikan, urutan fokus masuk akal, tidak ada elemen
   interaktif yang terlewat/tidak terjangkau.
2. Jalankan screen reader (NVDA/VoiceOver) pada layar yang sama.
   **Expected**: setiap elemen interaktif dan gambar bermakna diumumkan dengan label deskriptif.
3. Jalankan `npm test` (mencakup `tests/unit/a11y.test.tsx`) dan periksa lint `jsx-a11y`.
   **Expected**: nol pelanggaran kontras WCAG 2.1 AA otomatis pada layar yang diuji.

## V-10 — Anggaran Performa (US10)

1. Jalankan workflow `lighthouse.yml` terhadap build `staging`.
   **Expected**: time-to-interactive < 3 detik pada profil mobile 4G standar (SC-007).
2. Bandingkan ukuran total `public/assets/` sebelum dan sesudah optimasi (R-009).
   **Expected**: pengurangan berarti pada aset raster; `.riv` tidak lagi bagian dari bundle awal
   (dimuat lazy hanya di layar yang memakainya).

## V-11 — Modul Baru Tidak Membengkakkan Bundle (US11)

1. Tambahkan satu modul contoh minimal ke registry mengikuti kontrak `lesson-module-contract.md`
   (spec 001), memakai pola `React.lazy()` (R-013).
2. Jalankan `npm run build` sebelum dan sesudah, bandingkan laporan ukuran chunk Vite.
   **Expected**: penambahan modul baru menambah ukuran unduhan **awal** < 5% (SC-009) — modul
   baru muncul sebagai chunk terpisah yang hanya diambil saat diakses.

## V-12 — Kontrak Skema Siap-Backend (US12)

1. Tinjau `progress/store.ts` dan `profile/store.ts`, verifikasi keduanya menulis
   `schemaVersion` sesuai `data-model.md`.
2. Ubah salah satu bentuk field secara sengaja di lingkungan uji dan verifikasi jalur migrasi
   (R-011) dipanggil, bukan spread tambal-sulam seperti pola lama.
   **Expected**: data lama tetap terbaca benar setelah migrasi, tanpa kehilangan field.
   **STATUS (2026-08-10, T068)**: divalidasi otomatis lewat `tests/unit/schema-migration.test.ts`
   (3 test) — mensimulasikan data v0 (bentuk spec 001, sebelum `schemaVersion` ada sama sekali)
   untuk `Siswa` dan `LearnerProfile`, memverifikasi `migrasiSiswa()`/`normalizeLearnerProfile()`
   benar-benar dipanggil dan seluruh field lama (termasuk `mastery`, `modulSelesai`) tetap utuh
   setelah migrasi — bukan spread tambal-sulam. Lihat juga temuan audit di
   `contracts/data-schema-contract.md` § Temuan Audit soal `LearningEvent` (telemetry) yang belum
   punya jalur migrasi karena belum pernah ada kenaikan versi sungguhan untuk dimigrasi.
