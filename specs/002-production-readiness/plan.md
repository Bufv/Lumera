# Implementation Plan: Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment

**Branch**: `002-production-readiness` | **Date**: 2026-08-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-production-readiness/spec.md`

## Summary

Bangun lapisan operasional yang saat ini sepenuhnya absen di sekitar aplikasi frontend Lumera
yang sudah ada: pipeline CI/CD dengan gerbang otomatis dan rollback cepat, pemisahan environment
staging/production di Cloudflare Worker yang sudah dipakai, pemantauan error produksi,
pemindaian kerentanan dependency, header keamanan pada response, kebijakan privasi dan hak hapus
data (audiens inti anak di bawah 18 tahun), ekspor/impor progres sebagai jaring pengaman
`localStorage`, aksesibilitas keyboard/screen-reader dasar, anggaran performa, dan
persiapan arsitektur (lazy-load modul + kontrak skema data siap-backend).

Keputusan arsitektur inti: **tidak ada backend baru dan tidak ada layanan berbayar tingkat
enterprise**. Setiap kebutuhan dipenuhi dengan (a) compute yang sudah ada — Worker Cloudflare
yang sudah menjadi entry point aplikasi — atau (b) layanan SaaS dengan tingkatan gratis yang
memadai untuk skala prototype saat ini. Ini menjaga filosofi "tanpa backend" dari spec 001 tetap
utuh sambil menutup celah operasional yang nyata.

**Catatan (Klarifikasi 2026-08-09)**: keputusan "tanpa backend" di atas berlaku **untuk cakupan
spec ini**, tapi sedang ditinjau ulang oleh tim di luar spec ini — tidak lagi dianggap batas
jangka panjang yang final (lihat `spec.md` § Assumptions, § Out of Scope). Jika/ketika backend
sungguhan diputuskan, itu MUST digarap sebagai spec/plan terpisah, bukan perluasan retroaktif
plan ini. Terpisah dari itu, spec.md juga sekarang menyatakan eksplisit bahwa **kesiapan
operasional pada plan ini adalah precondition yang perlu tapi tidak cukup** untuk "siap dipakai
siswa sungguhan" — status itu tetap menunggu fitur inti spec 001 (tab homepage, alur pelajaran)
selesai tersambung, di luar cakupan implementasi plan ini (lihat `spec.md` § Edge Cases).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (tidak berubah dari spec 001). Workflow CI ditulis
sebagai GitHub Actions YAML; header keamanan ditambahkan sebagai JavaScript di `worker/index.js`
yang sudah ada (Cloudflare Workers runtime).

**Primary Dependencies (baru)**: `@sentry/react` (pemantauan error, tingkatan gratis, PII-scrubbing
bawaan), `eslint-plugin-jsx-a11y` (gerbang aksesibilitas statis), `vitest-axe` atau `axe-core`
(uji aksesibilitas otomatis atas komponen kunci), Lighthouse CI (`@lhci/cli`, anggaran performa di
CI). Tidak ada dependency baru untuk ekspor/impor progres atau kebijakan privasi — cukup Web API
bawaan (`Blob`, `<a download>`, `<input type="file">`) dan konten statis dalam aplikasi.

**Storage**: `localStorage` peramban tetap satu-satunya penyimpanan aplikasi (tidak berubah).
Ditambah: format berkas ekspor JSON ber-versi sebagai representasi portable progres siswa di luar
`localStorage` (lihat `data-model.md`).

**Testing**: Vitest (sudah ada) diperluas dengan uji aksesibilitas komponen dan uji round-trip
ekspor/impor. Gerbang baru non-Vitest di CI: `npm audit`, ESLint (termasuk `jsx-a11y`), dan
Lighthouse CI — seluruhnya dijalankan sebagai job GitHub Actions terpisah, bukan bagian dari
`vitest run`.

**Target Platform**: Tidak berubah — peramban web modern (desktop + mobile web). Hosting tetap
Cloudflare Workers (`wrangler.jsonc`, sudah ada), diperluas dengan **dua environment bernama**
(`staging`, `production`) alih-alih satu target tunggal.

**Project Type**: Single-project web frontend, ditambah lapisan tipis tooling ops (workflow CI/CD,
middleware header di Worker yang sudah ada). Tidak menjadi proyek backend baru.

**Performance Goals**: Time-to-interactive halaman utama < 3 detik pada simulasi 4G standar
(SC-007, diukur Lighthouse CI). Penambahan satu modul pelajaran menambah bundle awal < 5%
(SC-009, diukur lewat laporan ukuran build Vite di CI).

**Observability Threshold**: Notifikasi lonjakan error (FR-007) dipicu pada **10 error dalam
jendela 5 menit** (ditetapkan lewat sesi klarifikasi 2026-08-09, lihat `spec.md` § Clarifications
dan R-014 `research.md`) — dikonfigurasi sebagai alert rule di dasbor Sentry (T016 `tasks.md`).

**Constraints**: Tanpa layanan berbayar tingkat enterprise (Assumptions spec.md) — seluruh
layanan pihak ketiga yang dipilih (Sentry) MUST tetap dalam tingkatan gratisnya pada skala tim
dan trafik saat ini. Header keamanan MUST tidak memblokir aset yang sah (Rive/canvas) — diverifikasi
di staging sebelum production (edge case spec.md). Data yang dikirim ke layanan pihak ketiga
(Sentry) MUST disaring dari PII sebelum terkirim (Prinsip VI vs privasi anak — lihat Constitution
Check).

**Scale/Scope**: 1 pipeline CI/CD, 2 environment deploy, ~7 kategori kesiapan produksi mencakup
12 user story (5 area kerja baru: `privacy/`, `backup/`, `monitoring/`, workflow `.github/`,
middleware header Worker) plus modifikasi pada `progress/`, `profile/`, dan `modules/` yang sudah
ada dari spec 001.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Derived from `.specify/memory/constitution.md` v1.0.0.

**Pre-Phase 0 evaluation:**

- [x] **I. Interaksi Nyata** — N/A. Spec ini tidak menambah kontrol pelajaran baru; kontrol baru
      yang muncul (ekspor/impor, hapus data) sepenuhnya fungsional sejak awal (tidak ada tombol
      dekoratif) — konsisten dengan prinsip meski di luar konteks pelajaran.
- [x] **II. Struktur 7 Langkah** — N/A. Tidak ada modul pelajaran baru dalam spec ini.
- [x] **III. Kedalaman di Atas Kuantitas** — PASS, dengan syarat urutan. Cakupan spec ini luas
      (7 kategori). Jika waktu menyempit, yang dipotong adalah story P2/P3 (US8–US12) secara utuh,
      **bukan** implementasi setengah jadi dari story P1 manapun (US1–US7) — lihat Complexity
      Tracking untuk urutan pemotongan.
- [x] **IV. Kebenaran Konten** — N/A. Tidak ada konten kurikulum baru. Konten kebijakan privasi
      (US6) bukan konten pedagogis, tapi tetap MUST ditinjau untuk akurasi hukum sebelum rilis
      (dicatat sebagai gate di quickstart, bukan gate konstitusi formal).
- [x] **V. Dewasa Secara Visual** — PASS. Seluruh UI baru (halaman kebijakan privasi, kontrol
      ekspor/impor, banner peringatan localStorage) MUST memakai token desain yang sudah ada di
      `src/design/tokens.ts`, bukan komponen ad hoc bergaya berbeda.
- [x] **VI. Instrumentasi Sejak Awal** — PASS dengan syarat eksplisit. Menambah pemantauan error
      (Sentry) adalah instrumentasi baru yang MUST dikonfigurasi menyaring PII sebelum data
      meninggalkan perangkat siswa — bertegangan langsung dengan FR-010/FR-014 (minimal-perlu)
      jika tidak disaring. Ini gate wajib pada task implementasi `monitoring/errorReporting.ts`,
      bukan opsi.
- [x] **VII. Aset Orisinal** — PASS. Optimasi aset (FR-017) MUST hanya mengompresi/mengubah ukuran
      aset asli yang sudah ada — MUST NOT mengganti aset dengan stok generik/AI demi ukuran file
      lebih kecil.

**Post-Phase 1 re-evaluation:** PASS — tidak ada gate yang berubah status. Desain Phase 1
menegaskan Gate VI lewat `contracts/security-headers-contract.md` (mendokumentasikan data apa
yang boleh/tidak boleh keluar) dan Gate III lewat urutan story P1→P2→P3 yang eksplisit di
`spec.md` dan Complexity Tracking di bawah.

**Re-evaluasi pasca-klarifikasi (2026-08-09):** PASS — tidak ada gate yang berubah status.
Klarifikasi menambah dua catatan baru ke `spec.md` (status "tanpa backend" sedang ditinjau ulang;
precondition eksplisit bahwa kesiapan operasional plan ini bukan pengganti kesiapan fitur inti
spec 001) — keduanya scoping/dokumentasi, tidak mengubah desain teknis Phase 1 di plan ini.
Gate II ("Struktur 7 Langkah Lesson") tetap N/A untuk plan ini karena tidak ada modul pelajaran
baru dibangun di sini; kesiapan fitur inti (termasuk kepatuhan Gate II) tetap tanggung jawab
spec 001, bukan diduplikasi di plan ini.

## Project Structure

### Documentation (this feature)

```text
specs/002-production-readiness/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── progress-export-contract.md
│   ├── security-headers-contract.md
│   ├── input-escaping-contract.md    # FR-011 — ditambahkan 2026-08-11 lewat /speckit-analyze
│   ├── ci-pipeline-contract.md
│   └── data-schema-contract.md       # US12/FR-027 — ditambahkan T066, terlewat dari daftar semula
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
.github/
├── workflows/
│   ├── ci.yml                    # lint + typecheck + test + npm audit + a11y lint on push/PR
│   ├── lighthouse.yml            # anggaran performa (SC-007, SC-009) pada build production
│   └── deploy.yml                # staging on branch push, production on main — gated on ci.yml
└── dependabot.yml                 # pembaruan & alert kerentanan dependency terjadwal

src/
├── privacy/                       # BARU — kebijakan privasi + aksi hapus data (US6, FR-013-015)
│   ├── PrivacyPolicy.tsx
│   └── content.ts
├── backup/                        # BARU — ekspor/impor progres (US7, FR-018-020)
│   ├── export.ts
│   ├── import.ts
│   └── schema.ts                  # versi skema berkas ekspor, sesuai contracts/progress-export-contract.md
├── monitoring/                    # BARU — inisialisasi error reporting dengan PII-scrubbing (US3)
│   └── errorReporting.ts
├── storage/                       # BARU — wrapper localStorage bersama: deteksi penuh/diblokir (US8)
│   ├── safeStorage.ts
│   └── StorageWarningBanner.tsx
├── progress/
│   └── store.ts                   # DIUBAH — tambah `schemaVersion`, pakai safeStorage (FR-026, FR-027)
├── profile/
│   └── store.ts                   # DIUBAH — tambah `schemaVersion`, pakai safeStorage (FR-026, FR-027)
└── modules/
    └── index.ts                   # DIUBAH — daftarkan modul lewat React.lazy()/dynamic import (US11)

worker/
└── index.js                        # DIUBAH — sisipkan header keamanan standar pada tiap response (US4)

wrangler.jsonc                      # DIUBAH — environment bernama `staging` dan `production` (US2)

tests/
└── unit/
    ├── backup.test.ts              # round-trip ekspor/impor, penolakan skema tidak cocok
    ├── safe-storage.test.ts        # simulasi localStorage penuh/diblokir
    └── a11y.test.tsx               # axe check pada Atlas, Lesson, ringkasan progres, home Batch 1
```

**Structure Decision**: Single-project frontend, tidak berubah dari spec 001. Ditambah lapisan
tipis ops (`.github/`) dan lima direktori fitur kecil (`privacy/`, `backup/`, `monitoring/`,
`storage/`) yang **sengaja terpisah** dari `progress/`/`profile/`/`telemetry/` yang sudah ada,
mengikuti pola pemisahan tanggung jawab yang sudah ditetapkan spec 001 — setiap kebutuhan lintas
fitur punya satu rumah, tidak dicangkokkan ke modul pelajaran manapun. `worker/index.js` dan
`wrangler.jsonc` diubah langsung (bukan file baru) karena keduanya sudah menjadi satu-satunya
titik masuk request dan konfigurasi deploy — menduplikasinya akan menciptakan dua sumber kebenaran.

## Complexity Tracking

> Tidak ada pelanggaran Constitution Check yang perlu dijustifikasi.

Satu keputusan sengaja dicatat agar tidak salah dibaca sebagai kelalaian, dan satu urutan
pemotongan dicatat di muka sesuai Prinsip III:

| Keputusan | Alasan |
|---|---|
| `run_worker_first: true` di `wrangler.jsonc` (bukan default `false`) | Header keamanan (FR-009) harus menempel pada **setiap** response termasuk aset statis yang sukses (200) — bukan hanya fallback SPA (404). Konsekuensinya setiap request melewati Worker, menambah overhead kecil yang dapat diterima pada skala trafik prototype saat ini (Assumptions spec.md). |
| Status "tanpa backend" diubah dari final menjadi "sedang ditinjau ulang" (Klarifikasi 2026-08-09), tanpa menambah scope backend ke plan ini | Menjaga plan ini tetap fokus pada kesiapan operasional frontend yang sudah didesain di Phase 0/1 — evaluasi backend sungguhan (jika terjadi) MUST jadi plan/spec baru dengan Constitution Check dan research-nya sendiri, bukan disisipkan retroaktif di sini. |
| Precondition eksplisit "kesiapan operasional ≠ kesiapan produk" ditambahkan ke `spec.md`, tidak ditambahkan sebagai FR/task baru di plan ini | Ini pernyataan scoping (mencegah klaim "siap produksi" disalahpahami), bukan pekerjaan implementasi baru — pekerjaan menyambungkan fitur inti tetap milik `specs/001-core-mvp-prototype` (lihat T040 di `tasks.md` spec ini, yang sudah melacak dependensi ke T086/T087 di `specs/001-core-mvp-prototype/tasks.md`). |

**Jika waktu menyempit (Prinsip III)**: potong story berdasarkan prioritas yang sudah ditetapkan
di `spec.md`, urutan pemotongan dari yang paling dulu dipotong:

1. US12 (kontrak skema siap-backend, P3) — paling aman dipotong, murni persiapan jangka panjang.
2. US11 (code-splitting modul, P2) — bundle tetap berfungsi tanpa ini, hanya lebih besar.
3. US10 (anggaran performa, P2) — dapat diukur manual sekali di akhir, bukan digate otomatis.
4. US9 (aksesibilitas otomatis, P2) — audit manual sebagai jaring pengaman sementara.
5. US8 (ketahanan localStorage, P2) — kondisi tepi yang jarang terjadi.

Story P1 (US1–US7) MUST tidak dipotong sebagian — mengikuti gate FR-020 spec 001: sebuah
kapabilitas P1 yang setengah jadi (mis. CI ada tapi rollback tidak ada) MUST NOT dihitung selesai.
