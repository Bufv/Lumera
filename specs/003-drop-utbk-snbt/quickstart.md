# Quickstart: Validasi Drop UTBK/SNBT

Panduan ini memvalidasi bahwa spec.md (User Story 1–3) benar-benar terpenuhi setelah implementasi.
Bukan implementasi itu sendiri — lihat tasks.md (dibuat oleh `/speckit-tasks`) untuk langkah edit
per file.

## Prasyarat

- Dependencies repo terpasang: `npm install`
- Berada di branch `003-drop-utbk-snbt`

## 1. Verifikasi tidak ada rujukan UTBK/SNBT tersisa di kode produk (US1, US3)

```bash
grep -rn "UTBK\|SNBT" src tests
```

**Expected**: tidak ada match (exit code non-zero dari grep, output kosong). Jika masih ada match
di `src/student/OnboardingFlow.tsx` atau `src/privacy/content.ts`, US3 belum selesai.

## 2. Verifikasi Atlas tidak menampilkan node UTBK/SNBT (US1)

```bash
npm run dev
```

Buka Atlas di browser, telusuri seluruh node yang tampil. **Expected**: hanya node subject world
yang punya modul terbangun (Matematika, Sains, Ekonomi & Bisnis, Sejarah & Sosial) — tidak ada
node atau label "UTBK/SNBT" (lihat research.md R-002 — ini sudah PASS by default, langkah ini
adalah regression check, bukan verifikasi fitur baru).

## 3. Verifikasi onboarding tidak menawarkan jenjang UTBK/SNBT (US3)

Buka alur onboarding siswa baru (`/` → mulai onboarding). Pada langkah pemilihan jenjang,
**Expected**: kartu yang tampil hanya "SMP Kelas VII" (terpilih), "SMP Kelas VIII–IX", "SMA" —
tanpa kartu "UTBK / SNBT".

**Cek visual grid (FR-009, SC-005 — temuan U1)**: pada lebar layar desktop (≥1024px) dan tablet,
verifikasi 3 kartu yang tersisa tersusun rapi — tidak ada baris terakhir yang menyisakan satu
kartu menggantung dengan ruang kosong di sebelahnya. Pada lebar mobile (<640px), grid sudah
otomatis jadi 1 kolom sehingga tidak ada masalah di breakpoint ini.

## 4. Verifikasi teks kebijakan privasi akurat (US3)

Buka halaman kebijakan privasi, cari bagian "Untuk siapa Lumera dibuat". **Expected**: teks hanya
menyebut SMP dan SMA, tanpa menyebut UTBK/SNBT.

## 5. Verifikasi dokumen spec 001 tersinkron (US2)

```bash
grep -n "UTBK\|SNBT" specs/001-core-mvp-prototype/spec.md
```

**Expected**: setiap match yang tersisa (jika ada) ditandai eksplisit sebagai *superseded* oleh
`specs/003-drop-utbk-snbt/spec.md` — bukan dihapus tanpa jejak (menjaga traceability historis)
dan bukan pula dibiarkan seolah masih berlaku.

## 6. Jalankan test suite penuh

```bash
npm test
```

**Expected**: seluruh test lulus, termasuk regression test baru (jika ditambahkan di tasks.md)
yang meng-assert nol rujukan UTBK/SNBT pada komponen `OnboardingFlow` dan konten privasi.

## Referensi

- Requirements: [spec.md](./spec.md)
- Temuan investigasi: [research.md](./research.md)
- Perubahan data/entity: [data-model.md](./data-model.md)
