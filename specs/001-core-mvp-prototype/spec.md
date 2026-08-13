# Feature Specification: Lumera Core MVP — Functional Interactive Lesson Prototype

**Feature Branch**: `[001-core-mvp-prototype]`

**Created**: 2026-07-28

**Status**: Draft

**Last Amended**: 2026-07-29 — diselaraskan dengan Lumera Constitution v1.0.0. Ditambahkan FR-015
s.d. FR-020 (Prinsip III, IV, V, VI, VII), entitas Catatan Aktivitas Belajar, SC-006 s.d. SC-009,
dan bagian Out of Scope eksplisit.

**Last Amended**: 2026-08-13 — diselaraskan dengan Lumera Constitution v2.0.0 (cakupan Lumera Core
dipersempit ke SMP–SMA saja). User Story 7, bagian UTBK pada FR-003, entity Subject World, dan
baris target audiens ditandai **superseded** oleh `specs/003-drop-utbk-snbt/spec.md` — lihat
anotasi masing-masing di bawah. Teks asli dipertahankan untuk traceability historis.

**Input**: User description: "berdasarkan semua file di dalam folder @docs\" — scoped by user selection to the "MVP prototype fungsional" slice of the Lumera PRD (docs/concept.md, docs/leancanvas.md): Lumera Atlas (minimal), the 7-step interactive lesson flow across the six candidate subject modules (at least 4 must be fully functional), and basic gamification (streak, Lumens, progress/mastery %).

## User Scenarios & Testing *(mandatory)*

<!--
  Each story below is independently testable/demoable. PRD §15 (Prioritas Pengembangan)
  requires at least 4 of the 6 lesson-module stories to be fully functional before the
  product expands to other subjects/features — any 4 can be chosen to satisfy that bar.
-->

### User Story 1 - Navigasi Lumera Atlas (Priority: P1)

Seorang siswa membuka Lumera dan disambut oleh Lumera Atlas — peta pengetahuan visual berisi node-node subject world (Matematika, Sains, Ekonomi & Bisnis, Sejarah & Sosial, Bahasa & Komunikasi — tanpa UTBK/SNBT, di-drop oleh `specs/003-drop-utbk-snbt/spec.md`) yang saling terhubung. Siswa memilih salah satu node untuk masuk ke modul pelajaran interaktif di dalamnya.

**Why this priority**: Atlas adalah entry point wajib — tanpa ini siswa tidak punya cara untuk mencapai pelajaran manapun. Tidak ada story lain yang bisa didemokan tanpa ini.

**Independent Test**: Buka aplikasi tanpa progres sebelumnya, verifikasi peta subject world tampil dengan koneksi visual, klik salah satu node, dan verifikasi siswa masuk ke modul pelajaran yang benar.

**Acceptance Scenarios**:

1. **Given** siswa baru pertama kali membuka aplikasi, **When** Atlas dimuat, **Then** semua subject world yang tersedia di prototype ini tampil sebagai node dengan koneksi visual (bukan grid tombol statis).
2. **Given** siswa berada di Atlas, **When** siswa memilih sebuah node subject world, **Then** siswa diarahkan ke modul pelajaran interaktif yang sesuai dengan node tersebut.
3. **Given** siswa sudah menyelesaikan satu pelajaran sebelumnya, **When** siswa kembali ke Atlas, **Then** node yang sudah dipelajari menunjukkan indikator progress/mastery yang berbeda dari node yang belum disentuh.

---

### User Story 2 - Membaca Kemiringan Grafik (Matematika) (Priority: P1)

Siswa mengerjakan modul interaktif "Membaca Kemiringan Grafik", memanipulasi model visual grafik, menjawab pertanyaan berbasis interaksi tersebut, dan mendapat penjelasan instan atas jawabannya.

**Why this priority**: Salah satu dari minimal 4 modul yang wajib berfungsi penuh sesuai prioritas build PRD; matematika adalah subject world pertama yang disebut.

**Independent Test**: Buka modul ini langsung dari Atlas, selesaikan seluruh alur 7 langkah pelajaran, dan verifikasi siswa keluar dengan status "selesai" serta Lumens bertambah.

**Acceptance Scenarios**:

1. **Given** siswa memasuki modul, **When** langkah "Prompt" dan "Model visual" ditampilkan, **Then** siswa dapat berinteraksi langsung dengan representasi visual kemiringan grafik (bukan teks statis).
2. **Given** siswa melakukan aksi pada model visual (langkah "Aksi pengguna"), **When** siswa mengirim jawaban, **Then** sistem menampilkan umpan balik instan yang menyatakan benar/salah.
3. **Given** jawaban siswa salah, **When** umpan balik ditampilkan, **Then** sistem tetap menampilkan penjelasan "Kenapa?" yang menjelaskan konsep kemiringan grafik yang relevan, bukan sekadar tanda silang.
4. **Given** siswa telah melalui refleksi, **When** siswa menekan "Lanjutkan", **Then** pelajaran ditandai selesai dan siswa kembali ke Atlas dengan Lumens/progress yang sudah diperbarui.

---

### User Story 3 - Simulasi Gerak Lurus (Fisika) (Priority: P1)

Siswa memanipulasi simulasi gerak lurus (mengubah kecepatan/waktu/percepatan) dan menjawab pertanyaan yang bergantung pada hasil simulasi yang mereka jalankan sendiri.

**Why this priority**: Salah satu dari minimal 4 modul wajib; fisika adalah contoh konsep abstrak yang menurut PRD paling sulit dipahami secara tekstual sehingga menjadi bukti nilai utama produk.

**Independent Test**: Buka modul ini langsung dari Atlas, jalankan simulasi dengan variabel berbeda, selesaikan seluruh alur 7 langkah, dan verifikasi hasil simulasi memengaruhi jawaban yang diminta sistem.

**Acceptance Scenarios**:

1. **Given** siswa berada di langkah "Model visual", **When** siswa mengubah variabel gerak (misal kecepatan awal), **Then** simulasi memperbarui visualisasi gerak secara real-time.
2. **Given** siswa telah menjalankan simulasi, **When** siswa menjawab pertanyaan terkait hasil simulasi, **Then** sistem memberi umpan balik instan dan penjelasan "Kenapa?" yang merujuk pada hasil simulasi tersebut.
3. **Given** siswa menyelesaikan modul, **When** langkah "Lanjutkan" ditekan, **Then** status selesai, Lumens, dan progress tercatat.

---

### User Story 4 - Supply & Demand Simulator (Ekonomi) (Priority: P2)

Siswa mengubah variabel supply dan demand pada simulator interaktif dan mengamati efeknya terhadap grafik harga-kuantitas secara langsung.

**Why this priority**: Kandidat modul kedua dari kelompok non-inti (P2) untuk melengkapi minimal 4 modul; ekonomi memperluas cakupan subject world di luar sains/matematika murni.

**Independent Test**: Buka modul ini langsung dari Atlas, ubah variabel supply/demand, verifikasi grafik berubah sesuai teori, selesaikan alur 7 langkah.

**Acceptance Scenarios**:

1. **Given** siswa berada di langkah "Aksi pengguna", **When** siswa menggeser variabel supply atau demand, **Then** grafik harga-kuantitas diperbarui secara visual sesuai perubahan tersebut.
2. **Given** siswa menjawab pertanyaan tentang efek pergeseran kurva, **When** jawaban dikirim, **Then** sistem memberi umpan balik instan dan penjelasan konsep terkait.

---

### User Story 5 - Rantai Sebab-Akibat (Sejarah) (Priority: P2)

Siswa menyusun urutan sebab-akibat suatu peristiwa sejarah melalui interaksi visual (misalnya menyusun/menghubungkan kartu peristiwa).

**Why this priority**: Kandidat modul untuk melengkapi minimal 4; mewakili subject world non-sains/matematika (Sejarah & Sosial).

**Independent Test**: Buka modul ini langsung dari Atlas, susun rantai sebab-akibat, selesaikan alur 7 langkah, verifikasi urutan yang benar/salah dinilai dan dijelaskan.

**Acceptance Scenarios**:

1. **Given** siswa diberi satu set peristiwa acak, **When** siswa menyusun urutan sebab-akibatnya, **Then** sistem menampilkan umpan balik instan terhadap urutan yang disusun.
2. **Given** urutan yang disusun siswa salah, **When** umpan balik ditampilkan, **Then** sistem menjelaskan hubungan sebab-akibat yang benar pada langkah "Kenapa?".

---

### User Story 6 - Perbaiki Argumen (Bahasa/Literasi) (Priority: P2)

Siswa membaca sebuah teks argumentatif, mengidentifikasi kelemahan logika/argumen di dalamnya, dan memperbaikinya melalui interaksi terpandu.

**Why this priority**: Kandidat modul untuk melengkapi minimal 4; mewakili subject world Bahasa & Komunikasi.

**Independent Test**: Buka modul ini langsung dari Atlas, identifikasi kelemahan argumen pada teks yang diberikan, selesaikan alur 7 langkah.

**Acceptance Scenarios**:

1. **Given** siswa membaca teks argumentatif yang mengandung kelemahan, **When** siswa menandai bagian yang lemah, **Then** sistem memberi umpan balik instan apakah bagian yang ditandai benar.
2. **Given** siswa mengusulkan perbaikan argumen, **When** perbaikan dikirim, **Then** sistem menjelaskan mengapa perbaikan tersebut memperkuat/tidak memperkuat argumen.

---

> **⚠️ SUPERSEDED (2026-08-13)**: Story ini berada di luar cakupan Lumera Core sejak Constitution
> v2.0.0 (SMP–SMA saja, UTBK/SNBT & kuliah awal di-drop). Lihat
> `specs/003-drop-utbk-snbt/spec.md`. Teks di bawah dipertahankan untuk traceability historis —
> MUST NOT dihitung sebagai deliverable aktif atau kandidat modul (lihat FR-003).

### User Story 7 - Penalaran Kuantitatif (UTBK) (Priority: P2)

Siswa mengerjakan soal penalaran kuantitatif bergaya UTBK/SNBT dengan bantuan model visual, bukan sekadar soal pilihan ganda berteks.

**Why this priority**: Kandidat modul untuk melengkapi minimal 4; mewakili subject world UTBK/SNBT yang menjadi target segmen inti (persiapan ujian).

**Independent Test**: Buka modul ini langsung dari Atlas, kerjakan soal penalaran kuantitatif dengan bantuan visual, selesaikan alur 7 langkah.

**Acceptance Scenarios**:

1. **Given** siswa diberi soal penalaran kuantitatif, **When** siswa menggunakan model visual bantu untuk bernalar, **Then** sistem memberi umpan balik instan atas jawaban yang dipilih.
2. **Given** siswa menjawab salah, **When** umpan balik ditampilkan, **Then** sistem menjelaskan langkah penalaran yang benar pada langkah "Kenapa?".

---

### User Story 8 - Melihat Progres, Streak, dan Lumens (Priority: P3)

Setelah menyelesaikan satu atau lebih pelajaran, siswa dapat melihat streak harian, saldo Lumens yang terkumpul, dan persentase mastery per modul yang telah dikerjakan.

**Why this priority**: Memperkuat motivasi berkelanjutan, tetapi bukan prasyarat untuk mendemokan nilai inti (pemahaman konsep lewat simulasi) dari story P1/P2 di atas — karenanya P3.

**Independent Test**: Selesaikan satu pelajaran, lalu verifikasi streak, Lumens, dan mastery % ter-update dan terlihat oleh siswa tanpa navigasi tambahan yang rumit.

**Acceptance Scenarios**:

1. **Given** siswa menyelesaikan sebuah pelajaran untuk pertama kali hari ini, **When** siswa kembali ke Atlas atau halaman ringkasan, **Then** streak harian bertambah 1 dan tersimpan.
2. **Given** siswa menyelesaikan sebuah pelajaran, **When** pelajaran ditandai selesai, **Then** saldo Lumens siswa bertambah sesuai pelajaran yang diselesaikan.
3. **Given** siswa telah mengerjakan sebuah modul lebih dari sekali, **When** siswa melihat modul tersebut di Atlas, **Then** mastery % modul tersebut mencerminkan performa terbaru siswa.

---

### Edge Cases

- Apa yang terjadi jika siswa menutup/meninggalkan pelajaran di tengah simulasi (sebelum langkah "Lanjutkan")? Progress pelajaran tersebut tidak ditandai selesai dan Lumens/streak tidak diberikan.
- Bagaimana sistem menangani jawaban salah berulang kali pada langkah yang sama? Siswa tetap dapat mencoba ulang dan tetap menerima penjelasan "Kenapa?" setiap kali, tanpa mengunci siswa keluar dari pelajaran.
- Bagaimana pengalaman siswa yang benar-benar baru (tanpa progress sama sekali) saat pertama membuka Atlas? Semua node subject world tampil dalam status "belum dimulai" tanpa mastery, dan tidak ada streak aktif.
- Apa yang terjadi jika perangkat/browser siswa tidak mendukung jenis interaksi tertentu (misalnya drag-and-drop pada modul Sejarah)? Modul menyediakan cara interaksi alternatif (misalnya tap-to-select) yang menghasilkan hasil setara.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menampilkan Lumera Atlas sebagai homepage berisi node subject world yang saling terhubung secara visual (bukan grid tombol statis).
- **FR-002**: Sistem MUST memungkinkan siswa memilih sebuah node di Atlas dan masuk ke modul pelajaran interaktif yang sesuai.
- **FR-003**: Sistem MUST mengimplementasikan minimal 4 dari 5 modul pelajaran interaktif berikut secara penuh fungsional: Membaca Kemiringan Grafik (Matematika), Simulasi Gerak Lurus (Fisika), Supply & Demand Simulator (Ekonomi), Rantai Sebab-Akibat (Sejarah), Perbaiki Argumen (Bahasa). (Disesuaikan oleh spec 003 — "Penalaran Kuantitatif (UTBK)" di-drop dari daftar kandidat karena di luar cakupan Constitution v2.0.0; lihat `specs/003-drop-utbk-snbt/spec.md` FR-002.)
- **FR-004**: Setiap modul yang dibangun MUST mengikuti alur 7 langkah: Prompt → Model visual → Aksi pengguna → Umpan balik instan → Penjelasan "Kenapa?" → Refleksi → Lanjutkan.
- **FR-005**: Sistem MUST memberikan umpan balik instan (benar/salah) setiap kali siswa melakukan aksi pada langkah interaksi/simulasi.
- **FR-006**: Sistem MUST menampilkan penjelasan konsep ("Kenapa?") setelah setiap jawaban, baik benar maupun salah.
- **FR-007**: Sistem MUST memperbarui saldo Lumens siswa setelah sebuah pelajaran ditandai selesai.
- **FR-008**: Sistem MUST memperbarui streak harian siswa saat siswa menyelesaikan minimal satu pelajaran pada hari tersebut.
- **FR-009**: Sistem MUST menyimpan dan menampilkan mastery % per modul yang telah dikerjakan siswa.
- **FR-010**: Sistem MUST menyimpan progress siswa (pelajaran selesai, streak, Lumens, mastery) secara persisten antar sesi.
- **FR-011**: Layout UI pelajaran MUST mengikuti struktur: tombol tutup di kiri atas, progress dots di tengah atas, XP/Lumens di kanan atas, area interaksi/simulasi di tengah, kontrol jawaban di bawah, bilah umpan balik di bagian bawah.
- **FR-012**: Sistem MUST NOT menyertakan leaderboard, ruang sosial, atau elemen kompetisi ramai antar siswa dalam prototype ini.
- **FR-013**: Sistem MUST NOT menampilkan kontrol interaktif yang tidak berfungsi ("tombol palsu") — setiap kontrol yang terlihat harus benar-benar melakukan aksi yang dideskripsikan.
- **FR-014**: Jika siswa meninggalkan pelajaran sebelum langkah "Lanjutkan", sistem MUST NOT menandai pelajaran tersebut selesai maupun memberikan Lumens/streak untuknya.
- **FR-015**: Sistem MUST mencatat, untuk setiap pelajaran yang dikerjakan, minimal: konsep yang dipelajari, jenis kesalahan yang dilakukan siswa, dan waktu pengerjaan. Catatan ini MUST tersimpan persisten sejak rilis pertama, meskipun fitur yang mengonsumsinya (Knowledge Bank, Refresh Harian) belum dibangun. *(Prinsip VI)*
- **FR-016**: Seluruh konten yang ditampilkan (penjelasan konsep, soal, koreksi miskonsepsi) MUST akurat dan selaras dengan Capaian Pembelajaran Kurikulum Merdeka. Konten yang belum terverifikasi MUST NOT dirilis ke pengguna. *(Prinsip IV)*
- **FR-017**: Seluruh ilustrasi, animasi, dan ikon yang dirilis MUST orisinal atau berlisensi sah. Aset yang disalin dari produk lain maupun ilustrasi AI generik tanpa arah desain yang jelas MUST NOT digunakan sebagai aset produksi. *(Prinsip VII)*
- **FR-018**: Gaya visual, palet warna, dan copy MUST mengikuti arah desain "Soft Academic Adventure". Copy childish ("Yuk belajar!", "Hebat banget kamu!") dan perayaan reward yang meledak-ledak di setiap interaksi MUST NOT digunakan. *(Prinsip V)*
- **FR-019**: Terminologi produk (Lumera Atlas, Lumens, Knowledge Bank, Refresh Harian, Lumo) MUST digunakan konsisten di seluruh antarmuka dan MUST NOT diganti dengan sinonim ad hoc antar layar.
- **FR-020**: Sebuah modul MUST NOT dihitung sebagai bagian dari "minimal 4 modul" pada FR-003 kecuali seluruh kondisi berikut terpenuhi: ketujuh langkah pada FR-004 berfungsi, seluruh kontrol interaktifnya benar-benar berfungsi (FR-013), kontennya telah terverifikasi (FR-016), dan instrumentasinya aktif (FR-015). Modul setengah jadi MUST NOT dihitung sebagai deliverable. *(Prinsip III)*

### Key Entities

- **Siswa (User)**: pengguna individu prototype ini; memiliki identitas, saldo Lumens, streak harian, dan riwayat mastery per modul.
- **Subject World**: kategori mata pelajaran yang ditampilkan sebagai node di Atlas (Matematika, Fisika/Sains, Ekonomi & Bisnis, Sejarah & Sosial, Bahasa & Komunikasi — tanpa UTBK/SNBT). Definisi lengkap superseded oleh `specs/003-drop-utbk-snbt/data-model.md`.
- **Modul Pelajaran**: satu unit pelajaran interaktif di dalam sebuah subject world, terdiri dari satu instance alur 7 langkah.
- **Percobaan Interaksi/Simulasi**: satu kali aksi siswa pada langkah "Aksi pengguna" beserta hasil benar/salah dan penjelasannya.
- **Streak**: hitungan hari berturut-turut siswa menyelesaikan minimal satu pelajaran.
- **Saldo Lumens**: akumulasi reward yang diperoleh siswa dari pelajaran yang diselesaikan.
- **Catatan Mastery**: persentase penguasaan siswa untuk sebuah modul, diperbarui berdasarkan performa terbaru.
- **Catatan Aktivitas Belajar**: rekaman per pelajaran berisi konsep yang dipelajari, jenis kesalahan yang dilakukan, dan waktu pengerjaan; menjadi fondasi data untuk Knowledge Bank dan Refresh Harian yang dibangun kemudian.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Minimal 4 dari 5 modul pelajaran yang dispesifikasikan dapat diselesaikan end-to-end oleh pengguna uji tanpa error atau jalan buntu. (Disesuaikan oleh spec 003 — lihat FR-003.)
- **SC-002**: Siswa baru dapat berpindah dari membuka Atlas hingga menyelesaikan satu pelajaran penuh dalam waktu kurang dari 5 menit tanpa bantuan eksternal.
- **SC-003**: 90% atau lebih dari percobaan interaksi pada langkah "Aksi pengguna" menghasilkan umpan balik instan yang terlihat (tidak ada interaksi yang macet/tidak merespons).
- **SC-004**: 100% pelajaran yang diselesaikan menghasilkan pembaruan Lumens, streak, dan progress yang terlihat oleh siswa.
- **SC-005**: Tidak ditemukan elemen interaktif yang tidak berfungsi ("tombol palsu") pada modul manapun yang dirilis dalam prototype ini.
- **SC-006**: 100% pelajaran yang diselesaikan menghasilkan catatan aktivitas belajar yang berisi ketiga data minimal (konsep, jenis kesalahan, waktu pengerjaan) dan dapat ditelusuri kembali.
- **SC-007**: 100% modul yang dirilis telah lolos verifikasi konten terhadap Kurikulum Merdeka, dengan nol kesalahan konsep yang ditemukan pada review akhir.
- **SC-008**: 100% aset visual yang dirilis dapat ditelusuri ke sumber orisinal atau lisensi yang sah.
- **SC-009**: Audit antarmuka menemukan nol penggunaan istilah produk yang tidak konsisten dan nol copy bergaya childish.

## Out of Scope

Dinyatakan eksplisit agar batas antar spec tetap jelas. Hal-hal berikut TIDAK dibangun dalam spec ini:

- **Knowledge Bank** (Simple View maupun Graph View) — namun data fondasinya tetap dikumpulkan lewat FR-015.
- **Refresh Harian** dan mekanisme spaced repetition/retrieval practice.
- **Lumera Junior** dan seluruh konten "Dunia SD".
- **Monetisasi**: Lumera Plus, Lumera Family, dan seluruh alur langganan/pembayaran.
- **Lumera for Schools (B2B)**: dashboard guru, manajemen kelas, laporan progres sekolah.
- **Akun keluarga** dan onboarding multi-anak lintas jenjang.
- **Mode offline** dan sinkronisasi lintas perangkat.
- **Toggle bahasa Inggris** pada antarmuka.

## Assumptions

- Prototype ini hanya mencakup akun individu; target audiens adalah SMP–SMA (Lumera Core). (Disesuaikan oleh spec 003 — UTBK/SNBT dan kuliah awal di-drop dari cakupan sesuai Lumera Constitution v2.0.0.)
- Bahasa antarmuka adalah Bahasa Indonesia.
- Koneksi internet stabil diasumsikan tersedia selama sesi belajar.
- Pelajaran dapat diselesaikan tanpa menghasilkan kartu Knowledge Bank yang terlihat oleh siswa — namun data mentahnya tetap wajib direkam (FR-015) agar Knowledge Bank dan Refresh Harian tidak perlu instrumentasi ulang dari nol saat dibangun nanti.
- Modul mana saja (4 dari 5) yang dipilih untuk dibangun lebih dulu adalah keputusan implementasi/sequencing, bukan ambiguitas spesifikasi — seluruh 5 modul dispesifikasikan agar tim dapat memilih, dengan syarat kelayakan pada FR-020 terpenuhi. (Disesuaikan oleh spec 003 — lihat FR-003.)
- Verifikasi konten (FR-016) dilakukan oleh reviewer selain penulis modul, sesuai gate pada konstitusi; mekanisme review-nya sendiri berada di luar spec ini.
