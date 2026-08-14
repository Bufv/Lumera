# Feature Specification: Penyempitan Cakupan — Lumera Atlas Ditunda ke Pengembangan Berikutnya

**Feature Branch**: `004-defer-lumera-atlas`

**Created**: 2026-08-13

**Status**: Draft

**Input**: User description: "untuk semua fitur atlas, jadikan out of scope yang akan di kerjakan di next development/update. update semua spec"

**Context**: Amandemen ini dipicu oleh temuan bahwa Lumera Atlas (`src/atlas/Atlas.tsx`) sudah
dibangun sebagai komponen tetapi **tidak pernah tersambung** ke aplikasi yang berjalan — bukan
homepage, tidak ada route yang me-render-nya (lihat `specs/001-core-mvp-prototype/tasks.md`
T085/T089). Alih-alih memaksa Atlas selesai sebagai syarat rilis saat ini, spec ini secara resmi
menunda **seluruh fitur Lumera Atlas** (peta visual node subject world sebagai homepage) ke siklus
pengembangan berikutnya, dan mendefinisikan ulang bagaimana siswa mencapai pelajaran pada rilis
saat ini **tanpa** bergantung pada Atlas — supaya loop inti (buka aplikasi → pilih pelajaran →
selesaikan → progres tersimpan) tidak ikut terblokir menunggu Atlas selesai.

Bagian-bagian berikut di `specs/001-core-mvp-prototype/spec.md` dan `tasks.md`-nya berada di luar
cakupan rilis ini dan dinyatakan **Deferred — Next Development** oleh spec ini (bukan dihapus,
bukan superseded permanen): User Story 1 ("Navigasi Lumera Atlas"), FR-001/FR-002, task T085 dan
T089 (bagian keputusan Atlas), serta bagian SC-001/SC-002 yang mengukur alur "Atlas → selesai
pelajaran".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Siswa mencapai dan menyelesaikan pelajaran tanpa perlu Atlas (Priority: P1) 🎯 MVP

Seorang siswa membuka Lumera, disambut oleh layar beranda yang **sudah ada saat ini** (bukan
Lumera Atlas), memilih sebuah modul pelajaran dari sana, dan dapat menyelesaikan seluruh alur
pelajaran interaktif sampai selesai — tanpa peta visual node Atlas terlibat sama sekali di alur
ini.

**Why this priority**: Ini adalah loop nilai inti produk (belajar sebuah konsep). Menunggu Atlas
selesai sebelum loop ini bisa dicoba siapa pun berarti tidak ada nilai produk yang bisa
didemonstrasikan sama sekali. Melepas ketergantungan pada Atlas untuk rilis ini adalah satu-satunya
cara MVP inti bisa dikirim sekarang.

**Independent Test**: Buka aplikasi dari kondisi baru (tanpa progres), dari layar beranda yang ada
pilih satu modul, selesaikan seluruh langkah pelajaran, dan verifikasi status "selesai" beserta
progres/Lumens tersimpan — seluruhnya tanpa pernah melalui Atlas.

**Acceptance Scenarios**:

1. **Given** siswa baru membuka aplikasi, **When** aplikasi dimuat, **Then** siswa disambut layar
   beranda yang sudah ada saat ini (bukan Lumera Atlas) sebagai entry point yang berfungsi.
2. **Given** siswa berada di layar beranda, **When** siswa memilih sebuah modul pelajaran yang
   terdaftar, **Then** siswa masuk ke alur pelajaran interaktif penuh (bukan info drawer ringkasan)
   dan dapat menyelesaikannya sampai akhir.
3. **Given** siswa menyelesaikan sebuah pelajaran, **When** siswa kembali ke layar beranda,
   **Then** progres/Lumens/mastery yang ditampilkan berasal dari data nyata siswa tersebut, bukan
   fixture demo statis.

---

### User Story 2 - Requirement Atlas di spec 001 ditandai jelas sebagai pekerjaan mendatang (Priority: P2)

Tim yang membaca `specs/001-core-mvp-prototype/spec.md` dan `tasks.md`-nya melihat setiap bagian
yang berkaitan dengan Lumera Atlas (User Story 1, FR-001, FR-002, task T085, dan bagian Atlas pada
T089) ditandai eksplisit **"Deferred — Next Development"** dengan rujukan ke spec ini, sehingga
tidak ada anggota tim yang menganggapnya sebagai syarat kelulusan rilis saat ini, dan tidak ada
yang lupa bahwa Atlas tetap menjadi rencana produk — hanya ditunda.

**Why this priority**: Tanpa penandaan eksplisit, requirement Atlas yang tidak selesai akan terus
dibaca sebagai gate rilis yang gagal, atau sebaliknya, dilupakan sama sekali dari roadmap. P2 karena
ini murni pekerjaan dokumentasi/penelusuran, bukan blocker fungsional.

**Independent Test**: Baca ulang `specs/001-core-mvp-prototype/spec.md` dan `tasks.md` setelah
amandemen ini diterapkan; setiap rujukan Atlas yang tersisa harus punya anotasi eksplisit "Deferred
— Next Development, lihat spec 004", dan SC-001/SC-002 (spec 001) tidak lagi mensyaratkan Atlas
untuk dianggap tercapai pada rilis ini.

**Acceptance Scenarios**:

1. **Given** spec 001 dibaca setelah amandemen, **When** pembaca menemukan User Story 1 (Atlas),
   **Then** ada catatan eksplisit "Deferred — Next Development" tepat di atas judul, merujuk spec
   004 — teks aslinya tetap utuh untuk jejak historis.
2. **Given** tasks.md spec 001 dibaca setelah amandemen, **When** pembaca menemukan T085, **Then**
   task tersebut ditandai Deferred dan tidak lagi dihitung sebagai task terbuka yang memblokir rilis
   saat ini.
3. **Given** kriteria sukses SC-001/SC-002 spec 001 dibaca setelah amandemen, **When** kriteria
   tersebut ditinjau, **Then** keduanya sudah direvisi agar diukur dari entry point yang benar-benar
   dipakai pada rilis ini (layar beranda yang ada), dengan versi "via Atlas" dicatat sebagai target
   next-development terpisah.

---

### User Story 3 - Kode Lumera Atlas tetap tersimpan sebagai aset pengembangan berikutnya (Priority: P3)

Seseorang yang membuka repositori melihat kode Lumera Atlas (`src/atlas/Atlas.tsx`, `Atlas.css`,
`subject-worlds.ts`) masih ada secara utuh, tidak dihapus, dan didokumentasikan secara eksplisit
sebagai fitur yang **belum diintegrasikan secara sengaja** — bukan kode mati yang terlupakan atau
gagal diintegrasikan.

**Why this priority**: P3 — kejelasan dokumentasi ini penting untuk pengembang berikutnya, tetapi
tidak memblokir rilis atau pengalaman siswa saat ini.

**Independent Test**: Baca `README.md` § Status implementasi dan `tasks.md` T089 setelah amandemen;
verifikasi Atlas disebut sebagai item "Direncanakan untuk pengembangan berikutnya", dan konfirmasi
`src/atlas/` masih ada di repositori tanpa perubahan destruktif.

**Acceptance Scenarios**:

1. **Given** repositori diperiksa setelah amandemen, **When** direktori `src/atlas/` ditelusuri,
   **Then** ketiga berkasnya (`Atlas.tsx`, `Atlas.css`, `subject-worlds.ts`) masih ada tanpa
   dihapus.
2. **Given** `README.md` § Status implementasi dibaca, **When** baris terkait Atlas/homepage
   ditemukan, **Then** statusnya berbunyi "Direncanakan untuk pengembangan berikutnya" — bukan
   "Dalam proses" atau tersirat sudah selesai.
3. **Given** `subject-worlds.ts` (data subject world) masih dipakai oleh `src/progress/suggestions.ts`
   untuk logika saran belajar, **When** amandemen ini diterapkan, **Then** pemakaian data tersebut
   TIDAK ikut dihapus — hanya komponen visual Atlas (peta node sebagai homepage) yang ditunda.

---

### Edge Cases

- Bagaimana dengan `src/beranda/` dan `src/courses/` — implementasi UI lain yang juga disebut
  "yatim" (T089) tapi bukan bagian dari Atlas? Di luar cakupan spec ini; keputusan atas keduanya
  MUST ditangani terpisah dari deferral Atlas, agar tidak tercampur dengan keputusan spec ini.
- Apa yang terjadi jika layar beranda yang ada saat ini (pengganti sementara Atlas) juga
  memerlukan perbaikan agar bisa menjadi entry point yang layak (mis. menampilkan modul yang benar-
  benar bisa dibuka)? Itu bagian dari User Story 1 spec ini (lihat FR-001, FR-005) — bukan
  dianggap "sudah cukup baik" begitu saja.
- Bagaimana jika di masa depan Atlas ingin dikerjakan? Cukup lanjutkan dari kode yang sudah ada di
  `src/atlas/` melalui spec/plan baru — tidak perlu membangun ulang dari nol, karena spec ini secara
  eksplisit MUST NOT menghapus kode tersebut.
- Apa yang terjadi pada task T086/T087 (wiring `LessonShell` dan `Siswa` store nyata) yang
  sebelumnya berurutan setelah T085 (Atlas)? Task tersebut MUST dilepas dari ketergantungannya pada
  Atlas dan dikerjakan lewat entry point yang ada saat ini (lihat FR-005) — tidak ikut tertunda.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan entry point/homepage yang fungsional untuk rilis ini yang
  TIDAK bergantung pada Lumera Atlas, memakai layar beranda yang sudah ada di `StudentApp`, agar
  siswa tetap bisa mencapai dan menyelesaikan pelajaran.
- **FR-002**: User Story 1 ("Navigasi Lumera Atlas") beserta FR-001 dan FR-002 di
  `specs/001-core-mvp-prototype/spec.md` MUST ditandai **"Deferred — Next Development"** dengan
  rujukan eksplisit ke spec ini — teks aslinya MUST NOT dihapus, demi jejak historis.
- **FR-003**: Kriteria sukses SC-001 dan SC-002 di spec 001 (yang mengukur alur "Atlas → selesai
  pelajaran") MUST direvisi agar diukur dari entry point yang benar-benar dipakai pada rilis ini
  (layar beranda yang ada); versi "via Atlas" MUST dicatat terpisah sebagai target
  next-development, bukan dihapus begitu saja.
- **FR-004**: Task T085 (menjadikan Atlas sebagai homepage) dan bagian keputusan Atlas pada T089 di
  `specs/001-core-mvp-prototype/tasks.md` MUST ditandai Deferred/Next-Development dan MUST NOT lagi
  dihitung sebagai task terbuka yang memblokir rilis saat ini.
- **FR-005**: Task T086 (wiring `LessonShell` dan modul terdaftar ke route yang bisa dijangkau) dan
  T087 (menyambungkan `HomeScreen`/`ProgressScreen` ke `Siswa` store nyata) di
  `specs/001-core-mvp-prototype/tasks.md` MUST tetap berstatus aktif/terbuka untuk rilis ini dan
  MUST dikerjakan lewat entry point yang ada saat ini (FR-001) — MUST NOT menunggu Atlas selesai.
- **FR-006**: Kode `src/atlas/` (`Atlas.tsx`, `Atlas.css`, `subject-worlds.ts`) MUST NOT dihapus
  oleh perubahan ini — hanya integrasinya sebagai homepage yang ditunda.
- **FR-007**: Pemakaian `subject-worlds.ts` yang sudah aktif di luar komponen visual Atlas (mis.
  `src/progress/suggestions.ts`) MUST tetap berjalan tanpa regresi — deferral ini hanya berlaku
  untuk peta visual node Atlas sebagai homepage, bukan seluruh data subject world.
- **FR-008**: `README.md` § Status implementasi MUST diperbarui agar baris terkait Atlas/homepage
  berbunyi "Direncanakan untuk pengembangan berikutnya", bukan "Dalam proses" atau tersirat selesai.
- **FR-009**: Perubahan ini MUST NOT mengurangi kedalaman atau fungsi 4 modul pelajaran yang sudah
  dibangun (Matematika, Fisika, Ekonomi, Sejarah) — deferral berlaku hanya pada homepage/navigasi
  Atlas, bukan pada modul itu sendiri.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Siswa baru dapat berpindah dari membuka aplikasi hingga menyelesaikan satu pelajaran
  penuh dalam waktu kurang dari 5 menit, seluruhnya lewat entry point yang ada saat ini tanpa
  melalui Atlas.
- **SC-002**: Nol requirement Atlas di spec 001 yang masih terhitung sebagai gate rilis terbuka
  setelah amandemen — seluruhnya berlabel Deferred dengan rujukan ke spec ini.
- **SC-003**: Kode `src/atlas/` tetap ada di repositori pasca perubahan (diverifikasi lewat audit
  direktori), nol berkas dihapus.
- **SC-004**: `README.md` dan `specs/001-core-mvp-prototype/spec.md`/`tasks.md` menyebut Atlas
  sebagai item next-development pada audit teks pasca-amandemen — nol rujukan yang tersisa
  menyiratkan Atlas adalah bagian rilis saat ini.
- **SC-005**: Task T086/T087 di spec 001 dapat diselesaikan dan diverifikasi (loop inti: pilih
  modul → selesaikan pelajaran → progres tersimpan) tanpa satupun langkah verifikasinya menyebut
  atau bergantung pada Atlas.

## Assumptions

- Lumera Atlas (`src/atlas/Atlas.tsx`) sudah dibangun sebagai komponen tetapi belum pernah
  tersambung ke route yang bisa dijangkau pengguna — tidak ada pengguna produksi yang pernah
  memakainya, sehingga tidak ada data/perilaku pengguna existing yang perlu dimigrasi akibat
  penundaan ini.
- Layar beranda (`HomeScreen`) yang sudah ada di `StudentApp` saat ini cukup layak dijadikan entry
  point sementara untuk rilis ini, asalkan T086/T087 (wiring lesson engine + progress store nyata)
  diselesaikan di atasnya — spec ini tidak mensyaratkan desain ulang visual beranda tersebut,
  hanya fungsinya sebagai jalan menuju pelajaran nyata.
- "Next development/update" tidak diberi tanggal target pasti oleh spec ini; keputusan penjadwalan
  dan resourcing untuk pengembangan Atlas berikutnya berada di luar cakupan spec ini.
- Spec ini adalah amandemen bertaut ke `specs/001-core-mvp-prototype/spec.md` dan `tasks.md`-nya,
  mengikuti pola yang sama dengan `specs/003-drop-utbk-snbt/spec.md`: bagian yang disebutkan di
  atas dianggap Deferred oleh spec ini, dan MUST disinkronkan langsung ke teks spec 001 saat
  `/speckit-plan`/`/speckit-tasks` untuk spec ini dijalankan.
- Keputusan atas `src/beranda/` dan `src/courses/` (UI yatim lain yang disebut T089 tapi bukan
  Atlas) secara eksplisit di luar cakupan spec ini.
- Perubahan ini murni penundaan cakupan (deferral), bukan pembatalan — tidak ada requirement baru
  terkait monetisasi atau fitur lain yang ditambahkan oleh spec ini.
