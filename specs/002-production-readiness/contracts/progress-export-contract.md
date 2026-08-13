# Contract: Progress Export File

Format berkas portable yang siswa unduh/unggah untuk memindahkan progres antar perangkat/browser
(US7, FR-018–020). Ini kontrak antara aplikasi dan **siswa yang menyimpan berkas ini sendiri** —
begitu diunduh, berkas itu bisa hidup bertahun-tahun sebelum diimpor lagi, jadi kontrak ini MUST
stabil dan MUST diversi secara eksplisit.

## Bentuk Berkas

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-08-09T10:15:00.000Z",
  "siswa": {
    "schemaVersion": 1,
    "id": "…",
    "lumens": 120,
    "streakCount": 4,
    "streakLastDate": "2026-08-09",
    "mastery": [{ "moduleId": "math-slope", "masteryPersen": 78, "skorTerakhir": [70, 80, 84], "diperbaruiPada": "2026-08-08T09:00:00.000Z" }],
    "modulSelesai": ["math-slope"]
  },
  "learnerProfile": {
    "schemaVersion": 1,
    "displayName": "…",
    "stage": "smp",
    "grade": 7,
    "goal": "strengthen-foundations",
    "focusSubjectId": "matematika",
    "dailyMinutes": 20,
    "studyDays": ["monday", "wednesday"],
    "onboardingStep": "complete",
    "onboardingComplete": true,
    "reduceMotion": false
  }
}
```

Nama berkas yang disarankan saat diunduh: `lumera-progres-<YYYY-MM-DD>.json` — bukan bagian dari
kontrak yang diverifikasi mesin, hanya konvensi untuk memudahkan siswa mengenali berkasnya.

## Aturan

1. `schemaVersion` di level akar merepresentasikan versi **format berkas ekspor itu sendiri**,
   terpisah dari `schemaVersion` di dalam `siswa`/`learnerProfile`. Menaikkan salah satu tidak
   otomatis menaikkan yang lain.
2. Aplikasi MUST menolak impor jika `schemaVersion` akar lebih besar dari yang dimengerti versi
   aplikasi saat ini (berkas dari masa depan) — pesan yang ditampilkan MUST menyarankan
   memperbarui aplikasi, bukan pesan generik.
3. Aplikasi MUST menjalankan migrasi berurutan jika `schemaVersion` akar (atau
   `siswa.schemaVersion`/`learnerProfile.schemaVersion` di dalamnya) lebih lama dari versi saat
   ini, sebelum data dipakai untuk menimpa state lokal.
4. Aplikasi MUST NOT menimpa progres lokal yang sudah ada tanpa konfirmasi eksplisit siswa jika
   `exportedAt` pada berkas yang diimpor lebih lama dari `mastery[].diperbaruiPada` terbaru pada
   data lokal — mencegah siswa tidak sadar menimpa progres baru dengan berkas lama.
5. Validasi kegagalan MUST terlihat (pesan di UI), tidak pernah gagal diam-diam — pola yang sama
   dengan `telemetry/validate.ts` di spec 001.
6. Berkas ekspor MUST NOT menyertakan field selain yang didefinisikan di atas — tidak ada
   metadata perangkat, IP, atau identitas lain di luar apa yang sudah ada di `Siswa`/
   `LearnerProfile`.
