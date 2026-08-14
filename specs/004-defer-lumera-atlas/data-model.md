# Phase 1 Data Model: Lumera Atlas Ditunda ke Pengembangan Berikutnya

Fitur ini tidak memperkenalkan entity, field, atau skema penyimpanan baru. Seluruh entity yang
terlibat sudah ada dan tidak berubah bentuknya — yang berubah hanya *jalur* yang menyambungkannya
(lihat research.md). Bagian ini mendokumentasikan entity yang ikut terlibat dalam wiring, bukan
mendefinisikan yang baru.

## Entity yang dipakai ulang tanpa perubahan

### Siswa (`src/progress/store.ts`)

Sudah ada sejak spec 001/002 (Lumens, streak, `CatatanMastery[]`, `schemaVersion`). Fitur ini hanya
membuat lebih banyak layar (Beranda, KursusDetail) membaca `bacaSiswa()` yang sama alih-alih
fixture `ARDI_DEMO_FIXTURE`, dan membuat `LessonShell.onSelesai` memicu `setSiswa(bacaSiswa())` di
`StudentApp` supaya perubahan langsung terlihat. Tidak ada field baru, tidak ada migrasi.

### ModuleMeta / AnyLessonModule (`src/modules/index.ts`, `src/shell/types.ts`)

4 modul terdaftar (`math-slope`, `physics-motion`, `econ-supply-demand`, `history-causal-chain`)
sudah lengkap dan lolos gate `registry.periksaKontrak` sejak spec 001. Tidak diubah.

### KursusKatalog / JalurKatalog (`src/courses/katalog.ts`)

Katalog statis yang sudah memetakan struktur jalur → kursus → level → pelajaran ke 4 `ModuleMeta`
di atas, dan sudah punya fungsi (`susunKursus`, `susunKatalog`) untuk menghitung status tampilan
(`selesai`/`sedang`/`terbuka`/`disiapkan`) dari `Siswa.mastery`. Dipakai apa adanya oleh
`Beranda`/`KursusDetail`/`Belajar` yang dipasang fitur ini — tidak diubah.

## State baru di level UI (bukan entity persisten)

`StudentApp.tsx` mendapat satu state transient baru untuk melacak modul yang sedang dimuat/
dimainkan lewat `LessonShell` — pola yang sama dengan `selectedModule`/`selectedConcept` yang
sudah ada (state in-memory React, hilang saat navigasi/reload, TIDAK disimpan ke `localStorage`):

| Field (konsep) | Tipe | Keterangan |
|---|---|---|
| modul aktif | `AnyLessonModule \| null` | hasil `muatModul(id)`; `null` berarti tidak ada `LessonShell` yang tampil |
| status muat | implicit (pending/loaded) | selama `muatModul(id)` masih pending, tampilkan loading state singkat (bukan langsung `LessonShell`) |

Ini bukan entity domain — murni state komponen untuk mengoordinasikan async `import()` dinamis
(`muatModul`) dengan render `LessonShell`, dan dibuang begitu siswa keluar dari pelajaran
(`onKeluar`) atau menyelesaikannya (`onSelesai`).

## Tidak ada perubahan pada entity lain

`LearnerProfile`, `ExportedProgressFile` (spec 002 backup), dan seluruh entity privasi/telemetry
TIDAK disentuh oleh fitur ini.

## Persistence / Storage

N/A baru. Tidak ada `localStorage` key baru, tidak ada skema database baru (repo masih
localStorage-only, sesuai `README.md`), tidak ada perubahan kontrak ekspor/impor progres.
