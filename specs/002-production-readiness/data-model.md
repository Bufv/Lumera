# Phase 1 Data Model: Kesiapan Produksi

Spec ini menambah sedikit data baru (kebanyakan story bersifat proses/tooling) — tapi bagian yang
memang menyentuh data harus versi-eksplisit, karena itulah poin utamanya (FR-027).

## Siswa (DIUBAH — tambahan dari spec 001)

Bentuk dasar didefinisikan di `specs/001-core-mvp-prototype/data-model.md`. Perubahan spec ini:

| Field | Tipe | Catatan |
|---|---|---|
| `schemaVersion` | `number` | **BARU**. `1` untuk bentuk saat ini (field-field yang sudah ada di spec 001). Naik setiap kali bentuk field berubah tidak-kompatibel-mundur. |

**Aturan migrasi**: `bacaSiswa()` MUST memeriksa `schemaVersion` data yang dibaca. Jika lebih
lama dari versi saat ini, MUST dijalankan lewat fungsi migrasi berurutan (v1→v2→...→saat ini)
sebelum dipakai — bukan spread tambal-sulam seperti pola saat ini (lihat R-011 di
`research.md`). Jika `schemaVersion` tidak dikenali (lebih baru dari yang dimengerti kode saat
ini), MUST diperlakukan sebagai data tidak valid, bukan dipaksa dipakai.

## LearnerProfile (DIUBAH — tambahan dari implementasi Batch 1 saat ini)

Bentuk dasar didefinisikan di `src/profile/store.ts`. Perubahan spec ini:

| Field | Tipe | Catatan |
|---|---|---|
| `schemaVersion` | `number` | **BARU**. Sama semantiknya dengan `Siswa.schemaVersion` di atas. |

Aturan migrasi sama dengan `Siswa` — didefinisikan sekali di `src/storage/safeStorage.ts` (R-012)
dan dipakai ulang oleh kedua store, bukan diimplementasikan dua kali secara terpisah.

## ExportedProgressFile (BARU)

Representasi portable satu siswa untuk dipindah keluar-masuk `localStorage` (US7, FR-018–020).
Kontrak format lengkap ada di `contracts/progress-export-contract.md`; ringkasan bentuk:

| Field | Tipe | Catatan |
|---|---|---|
| `schemaVersion` | `number` | Versi format berkas ekspor itu sendiri (independen dari `Siswa.schemaVersion`/`LearnerProfile.schemaVersion`, meski nilainya disematkan di dalam). |
| `exportedAt` | `string` (ISO 8601) | Kapan berkas dibuat — dipakai untuk memilih data terbaru jika siswa mengimpor ke perangkat yang juga punya progres lokal. |
| `siswa` | `Siswa` | Snapshot lengkap termasuk `schemaVersion`-nya sendiri. |
| `learnerProfile` | `LearnerProfile` | Snapshot lengkap termasuk `schemaVersion`-nya sendiri. |

**Validasi saat impor**: berkas MUST ditolak dengan pesan jelas (bukan diterima diam-diam atau
merusak data yang ada) jika: `schemaVersion` berkas tidak dikenali, `siswa`/`learnerProfile` tidak
ada atau gagal validasi bentuk, atau berkas bukan JSON valid. Pola ini mengikuti
`telemetry/validate.ts` yang sudah ada di spec 001 (tolak dengan error terlihat, jangan pernah
gagal diam-diam).

## ErrorReportContext (BARU — bentuk data yang boleh dikirim ke Sentry)

Bukan data yang disimpan aplikasi — ini kontrak *field apa yang diizinkan* keluar dari perangkat
siswa lewat `src/monitoring/errorReporting.ts` (US3 vs Constitution Check Prinsip VI). Field di
luar daftar ini MUST disaring oleh `beforeSend` sebelum terkirim (lihat R-004).

| Field | Tipe | Diizinkan? |
|---|---|---|
| `message`, `stack` | `string` | Ya — inti dari sebuah laporan error. |
| `route` | `string` (hash route aplikasi, mis. `#/belajar/matematika`) | Ya — konteks navigasi, bukan identitas. |
| `appVersion` | `string` (commit/versi build) | Ya — untuk korelasi dengan `Rilis/Deployment` tertentu. |
| `displayName` (nama siswa) | — | **Tidak pernah**. |
| Isi `localStorage` apapun | — | **Tidak pernah**. |
| IP address, user agent penuh | — | **Tidak pernah** disimpan melebihi default minimal Sentry — dinonaktifkan lewat konfigurasi `sendDefaultPii: false`. |

## Rilis/Deployment (konseptual — metadata CI/CD, bukan data aplikasi)

Tidak disimpan di `localStorage` atau database manapun — hidup sebagai metadata GitHub
Actions/Cloudflare (nomor run, commit SHA, environment). Didokumentasikan di sini hanya agar
`ErrorReportContext.appVersion` di atas punya definisi sumber yang jelas: **commit SHA pendek
yang di-deploy**, diinjeksikan saat build lewat variabel environment CI (lihat
`contracts/ci-pipeline-contract.md`).
