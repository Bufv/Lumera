# Quickstart: Validasi Penundaan Lumera Atlas + Loop Inti Tanpa Atlas

Panduan ini memvalidasi bahwa spec.md (User Story 1–3) benar-benar terpenuhi setelah implementasi.
Bukan implementasi itu sendiri — lihat tasks.md (dibuat oleh `/speckit-tasks`) untuk langkah edit
per file.

## Prasyarat

- Dependencies repo terpasang: `npm install`
- Berada di branch `004-defer-lumera-atlas`

## 1. Verifikasi loop inti bisa dicapai tanpa Atlas (US1)

```bash
npm run dev
```

Buka aplikasi dari kondisi baru (tanpa progres sebelumnya, bukan mode demo). **Expected**:

- Layar yang tampil adalah entry point pengganti (Beranda generasi-2), **bukan** Lumera Atlas
  (tidak ada peta node visual) dan bukan lagi `HomeScreen` fixture lama untuk siswa non-demo.
- Dari sana, pilih sebuah kursus lalu sebuah pelajaran. **Expected**: `LessonShell` (alur 7
  langkah lengkap: Prompt → Model visual → Aksi → Umpan balik → Kenapa? → Refleksi → Lanjutkan)
  tampil — **bukan** info drawer "hadir pada batch berikutnya".
- Selesaikan pelajaran sampai akhir. **Expected**: kembali ke layar sebelumnya, Lumens/streak/
  mastery yang tampil sudah bertambah/berubah sesuai hasil pelajaran barusan.
- Reload browser. **Expected**: progres yang baru saja didapat tetap ada (tersimpan nyata di
  `Siswa`/`localStorage`, bukan fixture ilustratif).

## 2. Verifikasi Atlas dan komponen generasi-2 lain tetap tidak terpasang (US2, US3)

```bash
grep -rln "atlas/Atlas\|shell/HeaderNav\|progress/ProgressSummary" src/App.tsx src/main.tsx src/student/StudentApp.tsx
```

**Expected**: tidak ada match — `Atlas.tsx`, `HeaderNav.tsx`, dan `ProgressSummary.tsx` masih ada
di repo (lihat langkah 3) tapi belum diimpor oleh titik masuk aplikasi mana pun; ini konsisten
dengan deferral yang disengaja, bukan regresi tak sengaja.

## 3. Verifikasi kode Atlas tidak dihapus (US3, FR-006)

```bash
ls src/atlas/Atlas.tsx src/atlas/Atlas.css src/atlas/subject-worlds.ts
```

**Expected**: ketiga berkas masih ada. `subject-worlds.ts` boleh (dan memang) masih dipakai
`src/progress/suggestions.ts` — hanya komponen visual Atlas sebagai homepage yang ditunda, bukan
seluruh data subject world (FR-007).

## 4. Verifikasi dokumen spec 001 tersinkron (US2)

```bash
grep -n "Deferred" specs/001-core-mvp-prototype/spec.md specs/001-core-mvp-prototype/tasks.md
```

**Expected**: User Story 1 (Atlas), FR-001, FR-002 di `spec.md`, serta T085 dan bagian Atlas pada
T089 di `tasks.md`, masing-masing punya anotasi "Deferred — Next Development" merujuk spec 004 —
teks asli tetap ada di bawah/di samping anotasi (bukan dihapus). SC-001/SC-002 di `spec.md` sudah
terbaca sebagai kriteria yang diukur dari entry point non-Atlas, dengan versi "via Atlas" dicatat
terpisah.

## 5. Verifikasi README mencerminkan status baru (US3, FR-008)

Baca `README.md` § Status implementasi. **Expected**: baris terkait Atlas/homepage berbunyi
"Direncanakan untuk pengembangan berikutnya" — bukan "Dalam proses" atau tersirat selesai.

## 6. Verifikasi tidak ada regresi pada code-splitting (Technical Context: Performance Goals)

```bash
npm run build && npm run bundle-size-report
```

**Expected**: laporan ukuran bundle tidak menunjukkan ke-4 modul pelajaran (termasuk komponen
React-nya) ikut masuk ke chunk awal — `muatModul(id)` tetap memuatnya lewat `import()` dinamis saat
benar-benar diakses (US11 spec 002, R-013 tidak boleh regresi).

## 7. Cek visual "Soft Academic Adventure" (Prinsip V constitution)

Buka Beranda dan KursusDetail di lebar desktop dan mobile. **Expected**: tidak ada leaderboard/
ruang sosial, tidak ada copy childish, konsisten dengan arah visual modul yang sudah ada — ini
verifikasi manual karena `Beranda`/`KursusDetail` belum pernah dirender dalam konteks aplikasi
nyata sebelumnya (selalu diuji terisolasi lewat `tests/unit/layar-belajar.test.tsx`).

## 8. Jalankan test suite penuh

```bash
npm test
```

**Expected**: seluruh test lulus, termasuk test integrasi baru (loop inti end-to-end) dan
regression test deferral Atlas yang ditambahkan tasks.md.

## Referensi

- Requirements: [spec.md](./spec.md)
- Temuan investigasi (generasi UI kedua yang belum terpasang): [research.md](./research.md)
- Entity yang terlibat: [data-model.md](./data-model.md)
