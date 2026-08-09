# Contract: CI Pipeline — Definisi "Layak Deploy"

Gerbang yang MUST lolos sebelum sebuah perubahan boleh mencapai `staging` atau `production` (US1,
US2, US4, FR-001–005, FR-008). Ini kontrak antara kode dan siapapun yang mendorong perubahan —
termasuk kontributor masa depan yang belum tahu daftar ini ada.

## Gerbang Wajib (`ci.yml`), berurutan

| # | Gerbang | Alat | Gagal → |
|---|---|---|---|
| 1 | Lint (termasuk aturan `jsx-a11y`) | `npm run lint` | Blokir merge |
| 2 | Type-check | `tsc -b` (bagian dari `npm run build`, dijalankan terpisah lebih awal untuk sinyal lebih cepat) | Blokir merge |
| 3 | Unit test | `npm test` (`vitest run`) | Blokir merge |
| 4 | Audit kerentanan dependency | `npm audit --audit-level=high` | Blokir merge jika ada temuan kritis/tinggi pada dependency yang berubah di PR ini |
| 5 | Build production | `npm run build` | Blokir merge (build harus sukses sebelum deploy manapun dianggap mungkin) |

`lighthouse.yml` (R-008) berjalan **terpisah** dari `ci.yml` — dijalankan terhadap build hasil
langkah 5 di atas, tapi kegagalan anggaran performa MUST menghasilkan peringatan yang terlihat,
bukan otomatis memblokir merge di iterasi pertama (anggaran konkret baru punya baseline nyata
setelah beberapa run pertama — lihat Assumptions `spec.md`).

## Alur Deploy (`deploy.yml`)

1. Push ke branch apapun selain `main` yang lolos `ci.yml` → deploy otomatis ke `staging`
   (R-002). Tidak memerlukan persetujuan manual.
2. Merge ke `main` yang lolos `ci.yml` → deploy otomatis ke `production`, MUST hanya berjalan
   **setelah** `ci.yml` untuk commit yang sama berstatus sukses — tidak pernah paralel/independen.
3. Setiap deploy MUST menyematkan commit SHA pendek sebagai `appVersion` (lihat `data-model.md`
   § Rilis/Deployment) — dibaca lewat variabel environment CI saat build, bukan di-hardcode.
4. Rollback (R-003) MUST dijalankan lewat `wrangler rollback` secara manual oleh tim — **tidak**
   bagian dari `deploy.yml` otomatis (lihat R-003 untuk alasan tidak ada auto-rollback).

## Aturan

1. Tidak ada jalur untuk melewati (skip) gerbang 1–5 di atas untuk mencapai `production` — jika
   sebuah gerbang gagal karena alasan infrastruktur CI (bukan kode), perbaikan MUST pada
   infrastrukturnya, bukan override manual (edge case `spec.md`).
2. Menambah gerbang baru di masa depan MUST diperbarui di dokumen kontrak ini pada PR yang sama
   dengan perubahan workflow-nya — dokumen ini MUST selalu mencerminkan apa yang benar-benar
   dijalankan `ci.yml`, bukan aspirasi.
