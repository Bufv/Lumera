# Feature Specification: Penyempitan Cakupan — Drop UTBK/SNBT dari Lumera Core

**Feature Branch**: `003-drop-utbk-snbt`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "amandemen spec 001 untuk drop UTBK/SNBT"

**Context**: Amandemen ini dipicu oleh Lumera Constitution v2.0.0 (2026-08-13), yang mempersempit
"Cakupan Lumera Core" dari "SMP, SMA, UTBK/SNBT, dan kuliah awal" menjadi **SMP dan SMA saja**.
Bagian-bagian berikut di `specs/001-core-mvp-prototype/spec.md` berada di luar cakupan baru dan
dinyatakan **superseded** oleh spec ini: User Story 7 ("Penalaran Kuantitatif (UTBK)"), kandidat
modul UTBK pada FR-003, entity "Subject World" (mencantumkan UTBK/SNBT), dan baris asumsi target
audiens ("SMP–SMA–UTBK/kuliah awal").

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Atlas hanya menampilkan subject world dalam cakupan SMP-SMA (Priority: P1)

Seorang siswa membuka Lumera Atlas dan melihat node subject world yang relevan untuk SMP-SMA
(Matematika, Sains, Ekonomi & Bisnis, Sejarah & Sosial, Bahasa & Komunikasi) — tanpa node atau
label "UTBK/SNBT" di mana pun pada peta.

**Why this priority**: Atlas adalah entry point utama produk. Menampilkan node di luar cakupan
constitution menyesatkan siswa tentang apa yang sebenarnya tersedia, dan menyesatkan tim tentang
batas produk yang sebenarnya harus dibangun.

**Independent Test**: Buka Atlas tanpa progress sebelumnya, telusuri seluruh node yang tampil,
verifikasi tidak ada node atau label "UTBK/SNBT" di antarmuka.

**Acceptance Scenarios**:

1. **Given** siswa membuka Lumera Atlas, **When** peta subject world dimuat, **Then** hanya node
   subject world yang sudah punya modul terbangun yang tampil (saat ini: Matematika, Sains,
   Ekonomi & Bisnis, Sejarah & Sosial) tanpa node "UTBK/SNBT" — "Bahasa & Komunikasi" akan
   menyusul sebagai node begitu modulnya dibangun (di luar cakupan spec ini; lihat data-model.md
   § "Status implementasi vs spec").
2. **Given** siswa menelusuri seluruh permukaan Atlas, **When** siswa mencari label/teks apa pun,
   **Then** tidak ditemukan rujukan aktif ke "UTBK" atau "SNBT" sebagai subject world yang bisa
   dipilih.

---

### User Story 2 - Daftar kandidat modul MVP tidak lagi mencakup modul UTBK (Priority: P1)

Tim yang membaca requirement kandidat modul pelajaran MVP (sebelumnya FR-003 di spec 001) melihat
daftar berisi 5 kandidat modul — bukan 6 — dengan syarat kelayakan minimal "4 dari 5 modul
fungsional penuh", menggantikan "4 dari 6".

**Why this priority**: FR-003 dan FR-020 di spec 001 adalah requirement build-gating yang
menentukan kapan produk dianggap layak rilis. Membiarkan modul UTBK tetap terhitung sebagai
kandidat valid berisiko membuat tim salah alokasi effort ke modul yang sudah di luar cakupan
constitution, atau salah menghitung syarat kelulusan "minimal 4".

**Independent Test**: Baca requirement kandidat modul hasil amandemen ini bersama FR-003/FR-020
spec 001, verifikasi tidak ada rujukan ke modul UTBK dan syarat minimal konsisten dihitung ulang.

**Acceptance Scenarios**:

1. **Given** requirement kandidat modul dibaca bersama amandemen ini, **When** jumlah kandidat
   dihitung, **Then** jumlahnya 5 dan syarat "minimal 4 dari 5" berlaku menggantikan "minimal 4
   dari 6" pada FR-003 spec 001.
2. **Given** User Story 7 (UTBK) di spec 001 ditandai superseded, **When** dokumen requirement
   ditinjau, **Then** tidak ada acceptance scenario yang tersisa merujuk ke soal penalaran
   kuantitatif bergaya UTBK sebagai deliverable aktif.

---

### User Story 3 - Copy produk yang menyebut UTBK/SNBT disesuaikan (Priority: P2)

Teks yang saat ini ditampilkan ke pengguna dan menyebut UTBK/SNBT (halaman privasi, kartu pilihan
jenjang di onboarding) diperbarui agar konsisten dengan cakupan SMP-SMA, sehingga siswa dan orang
tua tidak diberi janji jenjang/fitur yang tidak akan dibangun pada fase ini.

**Why this priority**: P2, bukan blocker fungsional (modul UTBK belum pernah dibangun secara
fungsional), tetapi membiarkan copy lama berisiko menyesatkan pengguna dan mengganggu audit
kepatuhan privasi (Prinsip VIII constitution) yang menyatakan segmen pengguna secara eksplisit.

**Independent Test**: Telusuri seluruh permukaan UI/teks yang menyebut "UTBK" atau "SNBT",
verifikasi tidak ada lagi janji jenjang/fitur UTBK aktif untuk pengguna baru.

**Acceptance Scenarios**:

1. **Given** siswa baru menyelesaikan onboarding, **When** kartu pilihan jenjang ditampilkan,
   **Then** tidak ada opsi atau label "UTBK / SNBT" yang ditawarkan.
2. **Given** siswa membaca halaman kebijakan privasi, **When** teks "untuk siapa Lumera dibuat"
   ditampilkan, **Then** teks tersebut hanya menyebut SMP dan SMA sebagai segmen pengguna.
3. **Given** kartu pilihan jenjang yang tersisa (tanpa kartu UTBK/SNBT) ditampilkan di lebar layar
   desktop/tablet, **When** grid kartu dirender, **Then** tata letaknya tetap rapi dan seimbang —
   tidak ada baris terakhir yang menyisakan satu kartu menggantung dengan ruang kosong di
   sebelahnya (Prinsip V constitution — "Dewasa Secara Visual").

---

### Edge Cases

- Bagaimana dengan siswa yang mungkin sudah memilih kartu onboarding "UTBK/SNBT"? Kartu tersebut
  saat ini berstatus non-aktif ("Segera hadir") dan belum bisa dipilih pengguna, sehingga tidak
  ada data pengguna existing berjenjang UTBK yang perlu dimigrasi (lihat Assumptions).
- Apa yang terjadi pada Catatan Aktivitas Belajar yang mungkin sudah men-tag subject world
  "UTBK/SNBT"? Karena belum ada modul UTBK yang dirilis/fungsional secara produksi, tidak ada data
  progress produksi yang perlu dibersihkan.
- Bagaimana jika di masa depan produk ingin kembali menargetkan UTBK/SNBT? Itu MUST melalui
  amandemen constitution eksplisit (lihat Governance di `.specify/memory/constitution.md`) sebelum
  spec baru dibuat — bukan dengan mengembalikan begitu saja bagian yang di-superseded oleh spec
  ini.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Lumera Atlas MUST NOT menampilkan node atau label subject world "UTBK/SNBT" di
  antarmuka manapun.
- **FR-002**: Daftar kandidat modul pelajaran MVP (sebelumnya FR-003 di spec 001) MUST dikurangi
  menjadi 5 kandidat modul, dengan syarat kelayakan minimal "4 dari 5 modul fungsional penuh",
  menggantikan "4 dari 6".
- **FR-003**: User Story 7 ("Penalaran Kuantitatif (UTBK)") beserta seluruh acceptance scenario-nya
  di spec 001 MUST ditandai superseded oleh spec ini dan MUST NOT lagi dihitung sebagai deliverable
  aktif.
- **FR-004**: Entity "Subject World" pada spec 001 MUST diperbarui agar tidak lagi mencantumkan
  "UTBK/SNBT" sebagai salah satu kategori subject world.
- **FR-005**: Baris asumsi target audiens pada spec 001 ("SMP–SMA–UTBK/kuliah awal") MUST
  diperbarui menjadi "SMP–SMA", selaras dengan Lumera Constitution v2.0.0.
- **FR-006**: Seluruh teks antarmuka yang ditujukan ke pengguna (termasuk halaman privasi dan kartu
  pilihan jenjang onboarding) yang menyebut "UTBK" atau "SNBT" MUST diperbarui agar tidak
  menjanjikan jenjang/fitur yang berada di luar cakupan saat ini.
- **FR-007**: Sistem MUST NOT menawarkan atau menyediakan jalur onboarding aktif untuk jenjang
  "UTBK/SNBT" kepada pengguna baru.
- **FR-008**: Perubahan ini MUST NOT mengurangi kedalaman atau kualitas dari 5 subject
  world/modul yang tetap dalam cakupan (Prinsip III constitution) — pengurangan berlaku hanya pada
  cakupan jenjang, bukan pada kualitas kelima modul yang tersisa.
- **FR-009**: Tata letak grid kartu pilihan jenjang pada onboarding MUST tetap seimbang secara
  visual (tidak menyisakan baris dengan satu kartu menggantung dan ruang kosong di sebelahnya)
  setelah kartu "UTBK / SNBT" dihapus, pada seluruh breakpoint layar yang didukung (Prinsip V
  constitution).

### Key Entities

- **Subject World (diperbarui)**: kategori mata pelajaran yang ditampilkan sebagai node di Atlas;
  sekarang berisi Matematika, Fisika/Sains, Ekonomi & Bisnis, Sejarah & Sosial, dan Bahasa &
  Komunikasi — tanpa UTBK/SNBT. Menggantikan definisi entity "Subject World" di spec 001.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nol kemunculan node atau label "UTBK/SNBT" di Lumera Atlas pada audit antarmuka
  pasca-perubahan.
- **SC-002**: Nol rujukan tersisa ke "UTBK" atau "SNBT" sebagai jenjang/fitur aktif pada seluruh
  teks yang dilihat pengguna (halaman privasi, onboarding, Atlas).
- **SC-003**: Requirement kandidat modul (FR-003/FR-020 spec 001) terhitung ulang secara konsisten
  (5 kandidat, minimal 4) tanpa ambiguitas jumlah pada tinjauan dokumen oleh siapa pun di tim.
- **SC-004**: Kelima modul yang tetap dalam cakupan mempertahankan seluruh 7 langkah dan syarat
  kelayakan (FR-020 spec 001) tanpa penurunan kedalaman sebagai akibat perubahan ini.
- **SC-005**: Audit visual layar pilihan jenjang onboarding pada lebar desktop dan tablet
  menemukan nol baris kartu yang asimetris/menggantung setelah kartu UTBK/SNBT dihapus.

## Assumptions

- Modul pelajaran UTBK ("Penalaran Kuantitatif") belum pernah diimplementasikan secara fungsional
  di kode — penelusuran repositori tidak menemukan modul tersebut, sehingga tidak ada rollback
  data atau kode modul yang diperlukan.
- Kartu pilihan jenjang "UTBK / SNBT" pada alur onboarding saat ini berstatus non-aktif ("Segera
  hadir") dan belum bisa dipilih pengguna, sehingga tidak ada data pengguna existing berjenjang
  UTBK yang perlu dimigrasi.
- Spec ini adalah amandemen bertaut ke `specs/001-core-mvp-prototype/spec.md`: bagian yang
  disebutkan di atas (User Story 7, FR-003, FR-020, entity Subject World, baris target audiens)
  pada spec 001 dianggap superseded oleh spec ini, dan MUST disinkronkan langsung ke teks spec 001
  saat spec tersebut berikutnya diedit oleh perintah lain (mis. `/speckit-clarify`,
  `/speckit-plan`, atau amandemen manual).
- "Kuliah awal" (early college) turut di-drop dari cakupan bersamaan dengan UTBK/SNBT sesuai
  amandemen constitution v2.0.0, meskipun tidak ada modul "kuliah awal" yang pernah dispesifikasikan
  secara terpisah di spec 001 — sehingga tidak ada requirement tambahan yang perlu di-superseded
  untuk itu.
- Perubahan ini murni pengurangan cakupan (descoping); tidak ada requirement baru terkait
  monetisasi atau fitur lain yang ditambahkan oleh spec ini.
