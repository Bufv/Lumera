# Contract: Skema Data Siap-Backend

Konsolidasi aturan versioning `schemaVersion` untuk seluruh struktur data persisten Lumera (US12
spec 002, FR-027, R-011 `research.md`). Ini kontrak antara kode hari ini dan **migrasi backend di
masa depan** (Out of Scope spec 002 — lihat catatan status "ditinjau ulang" di `spec.md` §
Assumptions) — tujuannya memastikan bentuk data bisa dipetakan ke API tanpa menulis ulang bentuk
lama, bukan membangun backend-nya sekarang.

## Struktur yang Tercakup

| Struktur | Lokasi kode | `schemaVersion` saat ini | Fungsi migrasi |
|---|---|---|---|
| `Siswa` (progres: Lumens, streak, mastery) | `src/progress/store.ts` | `SISWA_SCHEMA_VERSION = 1` | `migrasiSiswa()` — migrasi berurutan v0→v1→dst. |
| `LearnerProfile` (profil pembelajar) | `src/profile/store.ts` | `PROFILE_SCHEMA_VERSION = 1` | `normalizeLearnerProfile()` — rekonstruksi penuh dari nol tiap panggilan (bukan spread parsial), jadi selalu menghasilkan versi saat ini apapun input-nya |
| `LearningEvent` (telemetry `lesson_completed`) | `src/telemetry/events.ts` | `SCHEMA_VERSION = 1` | **Belum ada** — lihat § Temuan Audit di bawah |
| `ExportedProgressFile` (berkas ekspor/impor) | `src/backup/schema.ts` | Versi format berkas sendiri, independen dari 3 di atas | Ditolak (bukan dimigrasi) jika tidak dikenal — lihat `contracts/progress-export-contract.md` |

## Aturan Versioning (berlaku untuk keempatnya)

1. `schemaVersion` MUST naik setiap kali bentuk field berubah tidak-kompatibel-mundur (field
   dihapus, tipe field berubah, makna field berubah). Penambahan field opsional baru dengan
   default yang masuk akal TIDAK wajib menaikkan versi.
2. Setiap kenaikan versi MUST disertai fungsi migrasi dari versi sebelumnya (langsung ke versi
   baru, atau berantai v(n)→v(n+1)→...) — MUST NOT mengubah bentuk data lama secara diam-diam
   lewat spread tambal-sulam (pola yang sudah terbukti berisiko, lihat `progress/store.ts`
   sebelum T033 di R-011).
3. Data dengan `schemaVersion` yang **lebih baru** dari yang dimengerti kode saat ini (dari masa
   depan — mis. build lama membaca data yang ditulis build baru) MUST diperlakukan sebagai tidak
   valid, bukan dipaksa dipakai.
4. Migrasi MUST idempotent — memigrasi data yang sudah di versi saat ini MUST NOT mengubah
   apapun (no-op).

## Temuan Audit (T067)

Diaudit terhadap `Siswa`/`LearnerProfile` sebagai referensi pola yang sudah benar (keduanya punya
fungsi migrasi eksplisit sejak T033/T034, spec 002 US7):

- **`LearningEvent` (`src/telemetry/events.ts`) belum punya fungsi migrasi.**
  `validasiEvent()` (`src/telemetry/validate.ts`) MENOLAK event apapun yang `schemaVersion`-nya
  tidak PERSIS sama dengan `SCHEMA_VERSION` saat ini — tidak ada jalur migrasi dari versi lama.
  **Ini bukan bug aktif hari ini** (`SCHEMA_VERSION` belum pernah naik dari `1` sejak dibuat di
  spec 001) — tapi begitu versi ini naik pertama kali, event lama yang sudah tersimpan di
  `localStorage` siswa (`lumera.telemetry.events.v1`) akan gagal validasi ulang tanpa jalur
  pemulihan, melanggar Aturan 2 di atas.
  **Keputusan**: TIDAK ditulis migrasi spekulatif untuk versi hipotetis yang belum ada (Prinsip
  III — kedalaman di atas kuantitas, bukan kode yang belum punya kebutuhan nyata). Sebagai
  gantinya, kewajiban ini dicatat eksplisit di sini: **kenaikan `SCHEMA_VERSION` telemetry yang
  PERTAMA kali MUST menyertakan fungsi migrasi mengikuti pola `migrasiSiswa()`** (atau,
  mengingat event log bersifat riwayat/tidak berubah — bukan state hidup — pola pemetaan
  versi-ke-versi saat `readAll()` alih-alih migrasi tulis-ulang, sesuai kebutuhan nyata saat itu),
  sebelum PR yang menaikkan versi tersebut boleh di-merge.
- `Siswa`/`LearnerProfile`/`ExportedProgressFile`: pola migrasi/penolakan sudah konsisten dengan
  Aturan 1–4 di atas. Tidak ada perubahan kode diperlukan.

## Pemetaan ke Backend Masa Depan

`schemaVersion` pada tiap struktur di atas dirancang menjadi kolom versi skema langsung pada
tabel/dokumen backend yang setara (mis. `siswa.schema_version`, `learner_profile.schema_version`,
`learning_event.schema_version`) — migrasi data lama ke backend MUST mengikuti fungsi migrasi
yang sama yang sudah ada di client, bukan menulis ulang logic migrasi dari nol di server.
