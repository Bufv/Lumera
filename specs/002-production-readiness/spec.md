# Feature Specification: Kesiapan Produksi — Skalabilitas, Keamanan, dan Deployment

**Feature Branch**: `[002-production-readiness]`

**Created**: 2026-08-09

**Status**: Draft

**Input**: User description: "pastikan project saat ini menyiapkan skalabilitas, keamanan, dan juga persiapan deployment. sarankan juga point penting yang seharusnya dipersiapkan (jika disetujui baru di masukkan)" — kategori awal (skalabilitas, keamanan, deployment) beserta 12 poin turunannya, ditambah 4 kategori susulan (aksesibilitas, kepatuhan privasi anak & hukum, performa, backup & pemulihan data) telah disetujui pengguna secara eksplisit sebelum spec ini ditulis.

## User Scenarios & Testing *(mandatory)*

<!--
  Spec ini bersifat lintas-fungsi (cross-cutting): "pengguna" pada sebagian besar story adalah
  tim yang mengoperasikan Lumera, bukan siswa — namun setiap story tetap dipilih karena risikonya
  langsung terhadap siswa (kehilangan data, paparan kerentanan, produk tidak dapat diakses).
  Prioritas P1 diberikan berdasarkan risiko (keselamatan data anak, kehilangan progres, rilis
  yang merusak produksi), bukan hanya urutan MVP inkremental.
-->

### User Story 1 - Deploy Aman dengan Rollback Cepat (Priority: P1)

Tim mendorong perubahan kode, sistem otomatis menjalankan lint/type-check/test, dan hanya
perubahan yang lolos yang dapat mencapai production. Jika sebuah rilis production ternyata
bermasalah, tim dapat mengembalikannya ke versi stabil sebelumnya dengan cepat.

**Why this priority**: Tanpa gerbang otomatis dan jalur rollback, setiap rilis adalah taruhan —
satu kesalahan bisa langsung dialami seluruh siswa aktif tanpa cara cepat untuk dibatalkan. Ini
prasyarat keamanan operasional bagi seluruh story lain di spec ini.

**Independent Test**: Dorong perubahan yang sengaja merusak test, verifikasi deploy diblokir;
lalu deploy versi yang lolos, sengaja tandai sebagai bermasalah, dan verifikasi rollback
mengembalikan versi sebelumnya dalam hitungan menit.

**Acceptance Scenarios**:

1. **Given** sebuah perubahan kode yang gagal lint/type-check/test, **When** perubahan didorong ke branch utama, **Then** sistem MUST mencegahnya mencapai production.
2. **Given** sebuah versi production yang baru dirilis ternyata bermasalah, **When** tim memutuskan rollback, **Then** production MUST kembali ke versi stabil sebelumnya tanpa memerlukan build ulang dari kode.
3. **Given** sebuah versi sedang live di production, **When** siapapun di tim memeriksa, **Then** commit/versi yang sedang live MUST dapat ditelusuri dengan jelas.

---

### User Story 2 - Verifikasi di Staging Sebelum Rilis Nyata (Priority: P1)

Perubahan dapat diverifikasi di environment staging yang terpisah dari production sebelum
dilihat oleh siswa sungguhan.

**Why this priority**: Tanpa staging, satu-satunya tempat menguji perubahan "sungguhan" adalah
production itu sendiri — risiko yang tidak dapat diterima untuk produk yang dipakai siswa aktif.

**Independent Test**: Deploy sebuah perubahan ke staging, verifikasi dapat diakses dan berjalan
identik dengan production tanpa memengaruhi data/pengalaman siswa di production.

**Acceptance Scenarios**:

1. **Given** sebuah perubahan siap diuji, **When** perubahan di-deploy ke staging, **Then** staging MUST dapat diakses secara terpisah dari production dan tidak memengaruhi data siswa di production.
2. **Given** perubahan telah diverifikasi di staging, **When** tim menyetujui rilis, **Then** perubahan yang sama (bukan build ulang manual) MUST yang dipromosikan ke production.

---

### User Story 3 - Mengetahui Kegagalan Produksi Sebelum Siswa Melapor (Priority: P1)

Ketika terjadi error di sisi klien pada aplikasi yang sedang dipakai siswa, tim mengetahuinya
lewat sistem pemantauan otomatis, bukan menunggu keluhan.

**Why this priority**: Produk ini tidak punya tim dukungan yang memantau laporan siswa
sepanjang waktu; tanpa pemantauan otomatis, kegagalan bisa berlangsung lama tanpa disadari.

**Independent Test**: Picu sebuah error runtime yang disengaja di build staging, verifikasi
error tersebut tercatat dan tim menerima sinyal/notifikasi tanpa perlu laporan manual.

**Acceptance Scenarios**:

1. **Given** aplikasi sedang berjalan di perangkat siswa, **When** terjadi error runtime yang tidak tertangani, **Then** sistem MUST menangkap dan melaporkannya secara otomatis.
2. **Given** jumlah error produksi melonjak melewati ambang batas wajar, **When** lonjakan terdeteksi, **Then** tim MUST menerima pemberitahuan tanpa perlu memeriksa dasbor secara manual.

---

### User Story 4 - Gerbang Keamanan Otomatis pada Setiap Rilis (Priority: P1)

Setiap rilis melewati pemeriksaan kerentanan dependency otomatis, dan aplikasi yang dilayani ke
browser menyertakan header keamanan standar.

**Why this priority**: Kerentanan dependency dan absennya header keamanan adalah celah yang
diam-diam menumpuk seiring waktu jika tidak diperiksa otomatis; keduanya murah untuk dicegah
namun mahal untuk diperbaiki setelah dieksploitasi.

**Independent Test**: Perkenalkan dependency dengan kerentanan tingkat tinggi yang diketahui,
verifikasi rilis ditahan; periksa response aplikasi yang live dan verifikasi header keamanan
standar hadir.

**Acceptance Scenarios**:

1. **Given** sebuah dependency baru ditambahkan atau diperbarui, **When** pemeriksaan kerentanan berjalan, **Then** sistem MUST menandai kerentanan tingkat kritis/tinggi sebelum rilis diizinkan lanjut.
2. **Given** aplikasi telah di-deploy, **When** response diperiksa, **Then** response MUST menyertakan header keamanan standar (minimal Content-Security-Policy, X-Content-Type-Options, dan pelindung framing).

---

### User Story 5 - Data dan Input Siswa Aman di Sisi Klien (Priority: P1)

Data yang disimpan di perangkat siswa dibatasi pada yang benar-benar perlu, dan setiap input
bebas dari siswa yang ditampilkan kembali ke layar tidak dapat dipakai untuk menjalankan skrip
berbahaya.

**Why this priority**: Audiens inti Lumera adalah pelajar SMP–SMA; kebocoran atau
penyalahgunaan data mereka merusak kepercayaan secara permanen dan berisiko hukum.

**Independent Test**: Audit seluruh kunci `localStorage` yang dipakai aplikasi dan verifikasi
tidak ada data pribadi yang tidak esensial; coba masukkan payload skrip pada field nama
tampilan dan verifikasi tidak tereksekusi di UI manapun yang menampilkannya kembali.

**Acceptance Scenarios**:

1. **Given** seluruh data yang tersimpan di perangkat siswa, **When** diaudit, **Then** data MUST terbatas pada yang esensial untuk pengalaman belajar (nama tampilan, preferensi, progres) — tanpa email, nomor telepon, atau alamat.
2. **Given** siswa memasukkan teks bebas apapun (mis. nama tampilan), **When** teks tersebut ditampilkan kembali di UI manapun, **Then** teks MUST tidak dapat dieksekusi sebagai skrip.
3. **Given** build production, **When** diperiksa, **Then** build MUST tidak menyertakan source map publik atau informasi debug yang mengekspos detail implementasi internal.

---

### User Story 6 - Kepatuhan Privasi Anak dan Kontrol atas Data Sendiri (Priority: P1)

Siswa dan orang tua dapat mengetahui data apa yang dikumpulkan lewat kebijakan privasi yang
jelas, dan siswa dapat menghapus seluruh data pribadinya kapan saja.

**Why this priority**: Karena sebagian besar pengguna berusia di bawah 18 tahun, kegagalan
memenuhi prinsip perlindungan data anak adalah risiko kepercayaan dan hukum tertinggi di
seluruh spec ini — sejajar dengan risiko kehilangan data.

**Independent Test**: Buka kebijakan privasi dari aplikasi dan verifikasi dapat diakses dan
dipahami; jalankan aksi "hapus semua data saya" dan verifikasi seluruh data lokal benar-benar
hilang.

**Acceptance Scenarios**:

1. **Given** siswa atau orang tua ingin tahu data apa yang dikumpulkan, **When** mereka membuka kebijakan privasi dari aplikasi, **Then** kebijakan MUST menjelaskan data yang dikumpulkan dan cara penggunaannya dalam bahasa yang dapat dipahami non-teknis.
2. **Given** siswa ingin menghapus datanya, **When** siswa menjalankan aksi hapus data, **Then** seluruh data lokal milik siswa tersebut MUST terhapus dalam satu aksi yang jelas, tanpa bantuan teknis.

---

### User Story 7 - Progres Siswa Tidak Hilang Permanen (Priority: P1)

Siswa dapat mengekspor progres belajarnya (Lumens, streak, mastery) ke berkas yang disimpan di
luar browser, dan mengimpornya kembali di perangkat/browser yang sama atau berbeda. Sebelum
aksi yang menghapus seluruh progres, siswa diperingatkan secara eksplisit.

**Why this priority**: Saat ini progres 100% hanya hidup di `localStorage` satu perangkat —
browser di-clear atau ganti perangkat berarti kehilangan seluruh progres belajar secara
permanen, tanpa cara pemulihan apapun. Ini risiko produk yang setara dengan kegagalan sistem.

**Independent Test**: Selesaikan beberapa pelajaran, ekspor progres, hapus data browser,
verifikasi progres hilang; impor kembali berkas ekspor dan verifikasi seluruh state (Lumens,
streak, mastery) pulih sepenuhnya.

**Acceptance Scenarios**:

1. **Given** siswa memiliki progres belajar, **When** siswa memilih ekspor progres, **Then** sistem MUST menghasilkan berkas yang dapat disimpan di luar browser.
2. **Given** siswa memiliki berkas ekspor yang valid, **When** siswa mengimpornya di perangkat/browser manapun, **Then** seluruh progres (Lumens, streak, mastery) MUST pulih sepenuhnya.
3. **Given** siswa akan melakukan aksi yang menghapus seluruh progres lokal (mis. reset profil), **When** aksi tersebut diminta, **Then** sistem MUST memperingatkan bahwa aksi tidak dapat dibatalkan kecuali progres telah diekspor.

---

### User Story 8 - Aplikasi Tetap Dapat Dipakai Meski Penyimpanan Bermasalah (Priority: P2)

Ketika `localStorage` penuh atau tidak tersedia (mode privasi ketat, browser lama), siswa tetap
dapat menggunakan aplikasi pada sesi tersebut, dengan peringatan yang jelas — bukan halaman
gagal total atau kehilangan progres secara diam-diam.

**Why this priority**: Kondisi ini jarang terjadi dibanding story P1 di atas, namun tetap
penting agar sebagian kecil siswa tidak terkunci total dari produk.

**Independent Test**: Nonaktifkan/penuhi `localStorage` secara sengaja di browser uji, buka
aplikasi, verifikasi aplikasi tetap dapat dipakai dengan peringatan eksplisit, bukan crash.

**Acceptance Scenarios**:

1. **Given** `localStorage` penuh atau diblokir, **When** siswa membuka aplikasi, **Then** sistem MUST menampilkan peringatan yang terlihat dan tetap MUST membiarkan siswa memakai aplikasi pada sesi tersebut.
2. **Given** kondisi di atas, **When** siswa menyelesaikan sebuah pelajaran, **Then** sistem MUST NOT gagal diam-diam — siswa MUST diberi tahu progresnya tidak tersimpan antar sesi.

---

### User Story 9 - Dapat Dipakai Penuh dengan Keyboard dan Screen Reader (Priority: P2)

Siswa yang mengandalkan keyboard atau pembaca layar dapat menavigasi dan menyelesaikan alur
inti (Atlas, pelajaran, ringkasan progres) tanpa hambatan.

**Why this priority**: Aksesibilitas memperluas siapa yang benar-benar bisa memakai Lumera;
diberi P2 karena bukan penghalang bagi mayoritas pengguna saat ini, namun tetap wajib sebelum
klaim "siap produksi" dianggap valid.

**Independent Test**: Navigasi seluruh alur inti hanya dengan Tab/Enter/Escape tanpa mouse;
jalankan pemeriksa kontras warna otomatis pada seluruh layar utama.

**Acceptance Scenarios**:

1. **Given** siswa hanya memakai keyboard, **When** siswa menavigasi Atlas, pelajaran, dan ringkasan progres, **Then** seluruh alur MUST dapat diselesaikan tanpa mouse/sentuhan.
2. **Given** seluruh teks dan elemen interaktif di layar utama, **When** rasio kontrasnya diperiksa, **Then** seluruhnya MUST memenuhi WCAG 2.1 level AA.
3. **Given** siswa memakai screen reader, **When** siswa berpindah antar elemen interaktif dan gambar bermakna, **Then** setiap elemen MUST memiliki label yang deskriptif, bukan generik.

---

### User Story 10 - Waktu Muat Tetap Cepat Seiring Produk Bertambah Besar (Priority: P2)

Halaman utama tetap cepat dimuat pada koneksi mobile umum, dan aset visual dioptimasi agar
tidak menjadi kontributor dominan waktu muat.

**Why this priority**: Performa memengaruhi seluruh siswa setiap sesi, namun saat ini belum
menjadi hambatan akut — diberi P2 sebagai pencegahan sebelum produk bertambah besar.

**Independent Test**: Ukur time-to-interactive build production pada simulasi koneksi mobile
4G standar dan bandingkan dengan anggaran yang ditetapkan.

**Acceptance Scenarios**:

1. **Given** build production, **When** dimuat pada simulasi koneksi mobile 4G standar, **Then** halaman utama MUST interaktif dalam waktu kurang dari anggaran yang ditetapkan.
2. **Given** aset visual (gambar, ikon, artwork) yang dirilis, **When** diperiksa, **Then** seluruhnya MUST telah dioptimasi/dikompresi sebelum rilis.

---

### User Story 11 - Menambah Modul Pelajaran Tidak Membengkakkan atau Merusak yang Lama (Priority: P2)

Developer dapat mendaftarkan modul pelajaran baru ke registry tanpa mengubah `LessonShell` atau
modul lain, dan modul baru hanya diunduh saat benar-benar diakses siswa.

**Why this priority**: Ini investasi arsitektur untuk kecepatan pengembangan jangka menengah,
bukan kebutuhan mendesak siswa saat ini.

**Independent Test**: Tambahkan satu modul contoh baru ke registry tanpa menyentuh kode Shell
atau modul lain; ukur perubahan ukuran unduhan awal aplikasi sebelum dan sesudah.

**Acceptance Scenarios**:

1. **Given** sebuah modul pelajaran baru mengikuti kontrak yang ada, **When** modul didaftarkan ke registry, **Then** pendaftaran MUST tidak memerlukan perubahan pada kode `LessonShell` atau modul lain yang sudah ada.
2. **Given** modul baru terdaftar, **When** ukuran unduhan awal aplikasi diukur, **Then** penambahan MUST tetap di bawah anggaran yang ditetapkan karena modul dimuat secara lazy.

---

### User Story 12 - Data Siap Dipetakan ke Backend Tanpa Menulis Ulang (Priority: P3)

Skema data progres dan telemetry didokumentasikan sebagai kontrak versi yang dapat dipetakan ke
API backend di masa depan, tanpa membangun backend itu sendiri sekarang.

**Why this priority**: Ini persiapan jangka panjang yang bernilai tapi tidak mendesak — tidak
ada kebutuhan backend langsung saat ini, dan menunda story ini tidak menambah risiko jangka
pendek.

**Independent Test**: Tinjau dokumentasi kontrak skema data yang ada terhadap data model
aktual; verifikasi setiap perubahan bentuk data mengikuti aturan versioning yang terdokumentasi.

**Acceptance Scenarios**:

1. **Given** skema data progres dan telemetry saat ini, **When** ditinjau, **Then** skema MUST terdokumentasikan sebagai kontrak versi (schema version) yang jelas.
2. **Given** sebuah perubahan pada bentuk data di masa depan, **When** perubahan tersebut dibuat, **Then** perubahan MUST mengikuti aturan versioning yang terdokumentasi, bukan mengubah bentuk data lama secara diam-diam.

---

### Edge Cases

- Apa yang terjadi jika pipeline CI gagal karena alasan infrastruktur (bukan karena kode)? Deploy MUST tetap diblokir dan tim MUST diberi tahu — tidak boleh ada jalur override diam-diam yang melewati gerbang ini.
- Apa yang terjadi jika berkas impor progres berasal dari versi skema yang lebih lama/tidak cocok? Sistem MUST memvalidasi dan menolak dengan pesan yang jelas jika skema tidak cocok, tanpa merusak progres yang sudah ada di perangkat saat ini.
- Bagaimana jika pemindaian dependency menemukan kerentanan kritis yang belum punya perbaikan resmi? Rilis MUST ditahan dan keputusan mitigasi (workaround atau penggantian dependency) MUST didokumentasikan, bukan diabaikan begitu saja.
- Apa yang terjadi pada siswa yang menonaktifkan `localStorage` sepenuhnya? Aplikasi MUST tetap dapat dipakai pada sesi tersebut dengan peringatan eksplisit bahwa progres tidak akan tersimpan — bukan halaman gagal total.
- Apa yang terjadi jika header Content-Security-Policy yang baru ternyata memblokir aset yang sah (mis. canvas/Rive)? Perubahan header MUST diverifikasi di staging (US2) sebelum production, sehingga insiden semacam ini tertangkap sebelum siswa terdampak.

## Requirements *(mandatory)*

### Functional Requirements

**Deployment & CI/CD**

- **FR-001**: Sistem MUST menjalankan lint, type-check, dan seluruh test otomatis pada setiap push/PR sebelum perubahan diizinkan mencapai production.
- **FR-002**: Sistem MUST memblokir deploy ke production jika salah satu dari lint/type-check/test gagal.
- **FR-003**: Sistem MUST menyediakan environment staging yang terpisah dari production (target/URL berbeda) untuk verifikasi perubahan sebelum dirilis ke siswa sungguhan.
- **FR-004**: Tim MUST dapat mengembalikan (rollback) sebuah deploy production yang bermasalah ke versi stabil sebelumnya dalam hitungan menit, tanpa memerlukan build ulang dari kode.
- **FR-005**: Sistem MUST mencatat versi/commit yang sedang live di production sehingga sumber sebuah rilis selalu dapat ditelusuri.

**Observability**

- **FR-006**: Sistem MUST menangkap dan melaporkan error runtime sisi klien pada aplikasi yang live secara otomatis, tanpa bergantung pada laporan manual siswa.
- **FR-007**: Sistem MUST memberi tahu tim ketika jumlah error produksi melonjak melewati ambang batas wajar.

**Keamanan**

- **FR-008**: Sistem MUST menjalankan pemindaian kerentanan dependency secara otomatis pada setiap perubahan dependency, dan MUST menandai kerentanan tingkat kritis/tinggi sebelum rilis diizinkan lanjut.
- **FR-009**: Response aplikasi yang dilayani ke browser MUST menyertakan header keamanan standar (minimal Content-Security-Policy, X-Content-Type-Options, dan pelindung framing).
- **FR-010**: Aplikasi MUST NOT menyimpan data pribadi siswa yang tidak esensial (mis. email, nomor telepon, alamat) di `localStorage` — hanya data yang benar-benar diperlukan untuk pengalaman belajar.
- **FR-011**: Seluruh input teks bebas dari siswa yang ditampilkan kembali ke UI MUST disaring/di-escape sehingga tidak dapat mengeksekusi skrip (XSS), dan aturan ini MUST didokumentasikan sebagai kontrak eksplisit.
- **FR-012**: Build production MUST NOT menyertakan source map publik atau informasi debug yang mengekspos detail implementasi internal ke pengguna akhir.

**Kepatuhan Privasi Anak & Hukum**

- **FR-013**: Aplikasi MUST menyediakan kebijakan privasi yang dapat diakses siswa/orang tua, menjelaskan data yang dikumpulkan dan cara penggunaannya dalam bahasa non-teknis.
- **FR-014**: Karena audiens inti berusia di bawah 18 tahun, pengumpulan data MUST dibatasi pada prinsip minimal-perlu dan MUST NOT mengumpulkan data yang tidak berkaitan langsung dengan pengalaman belajar.
- **FR-015**: Sistem MUST menyediakan mekanisme bagi siswa untuk menghapus seluruh data lokal miliknya dalam satu aksi yang jelas.

**Performa**

- **FR-016**: Sistem MUST menetapkan anggaran waktu muat halaman awal (time-to-interactive) untuk koneksi mobile umum, dan build production MUST diukur terhadap anggaran tersebut sebelum rilis.
- **FR-017**: Aset visual (gambar, ikon, artwork) yang dirilis MUST dioptimasi/dikompresi sehingga tidak menjadi kontributor dominan waktu muat.

**Backup & Pemulihan Data**

- **FR-018**: Sistem MUST menyediakan cara bagi siswa mengekspor progres belajarnya (Lumens, streak, mastery) ke berkas yang dapat disimpan di luar browser.
- **FR-019**: Sistem MUST menyediakan cara mengimpor kembali berkas progres yang diekspor, memulihkan state siswa pada perangkat/browser yang sama atau berbeda.
- **FR-020**: Sistem MUST memperingatkan siswa sebelum aksi yang secara permanen menghapus seluruh progres lokal, menjelaskan bahwa aksi tersebut tidak dapat dibatalkan kecuali data telah diekspor.

**Aksesibilitas**

- **FR-021**: Seluruh alur inti (Atlas, pelajaran, ringkasan progres) MUST dapat dinavigasi penuh menggunakan keyboard saja.
- **FR-022**: Seluruh teks dan elemen interaktif MUST memenuhi rasio kontras warna minimum WCAG 2.1 level AA.
- **FR-023**: Elemen interaktif dan gambar bermakna MUST memiliki label yang dapat dibaca screen reader (aria-label/alt text deskriptif, bukan generik).

**Skalabilitas Arsitektur**

- **FR-024**: Setiap modul pelajaran baru MUST dapat didaftarkan ke registry tanpa mengubah kode `LessonShell` atau modul lain yang sudah ada.
- **FR-025**: Modul pelajaran MUST dimuat secara lazy (hanya diunduh saat diakses siswa), sehingga penambahan modul baru MUST NOT memperbesar ukuran unduhan awal aplikasi secara signifikan.
- **FR-026**: Sistem MUST menangani kondisi `localStorage` penuh atau tidak tersedia dengan pesan yang terlihat oleh siswa, dan MUST NOT gagal diam-diam atau kehilangan progres tanpa peringatan.
- **FR-027**: Skema data progres dan telemetry MUST didokumentasikan sebagai kontrak versi (schema version) yang dirancang agar dapat dipetakan ke API backend di masa depan tanpa mengubah bentuk data yang sudah ada.

### Key Entities

- **Rilis/Deployment**: satu versi aplikasi yang di-deploy, memiliki commit/versi, environment (staging/production), dan status (aktif/telah di-rollback).
- **Laporan Error Produksi**: catatan error runtime klien yang tertangkap otomatis, berisi pesan, waktu kejadian, dan konteks — tanpa data pribadi siswa.
- **Kebijakan Privasi**: dokumen yang menjelaskan data yang dikumpulkan dan cara penggunaannya, dapat diakses siswa/orang tua kapan saja.
- **Berkas Ekspor Progres**: representasi portable dari progres siswa (Lumens, streak, mastery) berikut versi skemanya, dapat disimpan/dipulihkan di luar `localStorage`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% perubahan yang mencapai production telah lolos pemeriksaan otomatis (lint, type-check, test) sebelum live.
- **SC-002**: Tim dapat memulihkan production ke versi stabil sebelumnya dalam waktu kurang dari 10 menit sejak masalah terdeteksi.
- **SC-003**: Error produksi terdeteksi oleh sistem pemantauan dalam waktu kurang dari 5 menit sejak kemunculan pertama, tanpa menunggu laporan pengguna.
- **SC-004**: Nol kerentanan dependency tingkat kritis/tinggi yang belum ditangani pada saat rilis.
- **SC-005**: Siswa dapat menghapus seluruh data pribadinya sendiri dalam satu aksi yang jelas, tanpa bantuan teknis.
- **SC-006**: Siswa dapat memulihkan progres belajarnya secara penuh di perangkat baru dalam waktu kurang dari 2 menit menggunakan berkas ekspor.
- **SC-007**: Halaman utama dapat dimuat dan interaktif dalam waktu kurang dari 3 detik pada simulasi koneksi mobile 4G standar.
- **SC-008**: Seluruh alur inti dapat diselesaikan dari awal sampai akhir hanya menggunakan keyboard, diverifikasi lewat audit manual.
- **SC-009**: Menambahkan satu modul pelajaran baru menambah ukuran unduhan awal aplikasi kurang dari 5%.
- **SC-010**: Audit privasi tidak menemukan data pribadi siswa yang tidak esensial (di luar nama tampilan dan preferensi belajar) tersimpan di perangkat.

## Out of Scope

- **Membangun backend/API sungguhan** — spec ini hanya menyiapkan kontrak/skema data agar migrasi nanti tidak perlu menulis ulang, bukan membangun server-nya.
- **Autentikasi/akun pengguna berbasis server** — tetap di luar cakupan Lumera Core saat ini, konsisten dengan batas spec 001.
- **Audit keamanan pihak ketiga/penetration testing formal** — gerbang otomatis (pemindaian dependency, header keamanan) adalah lapisan pencegahan pertama, bukan pengganti audit profesional independen.
- **Infrastruktur multi-region atau load balancing server-side** — belum relevan pada skala trafik prototype saat ini.
- **Dukungan aplikasi mobile native (iOS/Android) dan sinkronisasi lintas perangkat berbasis akun** — tetap di luar cakupan, konsisten dengan batas spec 001.

## Assumptions

- Aplikasi tetap 100% frontend (tanpa server aplikasi sendiri) untuk saat ini; "kesiapan backend" berarti skema/kontrak siap dipetakan, bukan backend sudah dibangun.
- Target hosting tetap platform yang sudah dipakai saat ini (Cloudflare Worker via hosting privat) kecuali diputuskan lain oleh tim.
- Trafik saat ini masih skala prototype/early-stage; kebutuhan skalabilitas server-side tingkat lanjut belum mendesak.
- Solusi pemantauan error dan pemindaian dependency yang dipilih MUST memiliki tingkatan gratis/terjangkau yang memadai untuk skala tim dan trafik saat ini — bukan solusi enterprise berbayar.
- Ekspor/impor progres cukup berbasis berkas lokal (unduh/unggah manual oleh siswa); sinkronisasi otomatis lintas perangkat tetap di luar cakupan spec ini.
- Anggaran waktu muat spesifik (FR-016) dan ambang batas lonjakan error (FR-007) akan ditetapkan sebagai angka konkret pada fase perencanaan (`/speckit-plan`), berdasarkan baseline pengukuran aplikasi saat ini.
