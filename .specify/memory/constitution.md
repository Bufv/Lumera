<!--
Sync Impact Report
==================
Version change: 1.0.0 → 2.0.0
Bump rationale: MAJOR because the scope redefinition ("Cakupan Lumera Core" narrowed to SMP-SMA,
dropping UTBK/SNBT and kuliah awal) is backward-incompatible with content already built in
specs/001-core-mvp-prototype/spec.md (User Story 7, part of FR-003, the Atlas UTBK/SNBT subject
world node, and the explicit "target audiens" line). A new Preamble and a new non-negotiable
principle (VIII) were also added, which alone would be MINOR, but the scope redefinition forces
MAJOR.

Modified principles:
- V. Dewasa Secara Visual, Bukan Childish — rationale line updated ("SMP–SMA–UTBK" → "SMP–SMA")
  to match the narrowed scope.

Added sections:
- Mukadimah (Misi) — new preamble above Core Principles: Lumera's purpose is solving Indonesian
  children's literacy and disengagement problems, not business/revenue maximization. Monetization
  is explicitly subordinated to this mission and deferred (see Additional Constraints).
- VIII. Privasi dan Keamanan Data Siswa (NON-NEGOTIABLE) — new principle covering data
  minimization, right to self-delete, no third-party sale, and privacy review gating for any
  feature that stores/processes student data in the database, given the majority of users are
  minors and progress data now persists server-side (not just localStorage).

Modified sections:
- Additional Constraints: Scope & Content Standards — "Cakupan Lumera Core" narrowed from
  "SMP, SMA, UTBK/SNBT, dan kuliah awal" to "SMP dan SMA"; new bullet added deferring
  monetization/premium features to a future realization phase, out of scope for now.
- Development Workflow & Quality Gates — "selesai" checklist now also requires a privacy review
  per Principle VIII.
- Governance / Kepatuhan — compliance scope updated from "Prinsip I–VII" to "Prinsip I–VIII".

Removed sections: none

Templates requiring updates:
- ✅ .specify/templates/plan-template.md — Constitution Check gates updated to v2.0.0, gate VIII
  added, gate V wording aligned to SMP-SMA scope
- ✅ .specify/templates/tasks-template.md — version reference updated to v2.0.0; privacy-review
  task requirement added alongside instrumentation/content-verification requirements
- ✅ .specify/templates/spec-template.md — reviewed; no structural change required
- ✅ .claude/skills/speckit-*/SKILL.md — reviewed; no outdated agent-specific references requiring change
- ⚠ specs/001-core-mvp-prototype/spec.md — NOT amended by this command (out of governance scope).
  User Story 7 ("Penalaran Kuantitatif (UTBK)"), the UTBK candidate in FR-003, the Atlas
  "UTBK/SNBT" subject world node, and the "target audiens ... UTBK/kuliah awal" line now fall
  outside the narrowed constitution scope and need a deliberate amendment via /speckit-specify.
  Tracked in this command's Next Actions.

Follow-up TODOs:
- None left unresolved by this amendment; the spec 001 UTBK misalignment above is intentionally
  deferred as a Next Action, not a TODO placeholder.
-->

# Lumera Constitution

## Mukadimah (Misi)

Lumera dibangun untuk menyelesaikan masalah nyata anak-anak Indonesia: rendahnya literasi dan
proses belajar yang membosankan — bukan pertama-tama sebagai model bisnis. Setiap keputusan
produk, fitur, dan prioritas MUST diuji terhadap pertanyaan "Apakah ini membuat siswa Indonesia
lebih literat dan lebih terlibat dalam belajar?", bukan "Apakah ini memaksimalkan pendapatan?".
Prinsip-prinsip di bawah ini MUST dibaca dan diterapkan dengan misi ini sebagai konteks utama.

Pertimbangan monetisasi (termasuk fitur premium) MAY dipikirkan untuk keberlanjutan jangka
panjang produk di dunia nyata, tetapi MUST NOT dirancang atau diimplementasikan pada fase
pengembangan saat ini, dan ketika saatnya direalisasikan, MUST ditinjau ulang agar tetap tunduk
pada misi sosial ini (lihat Additional Constraints: Scope & Content Standards).

## Core Principles

### I. Interaksi Nyata, Bukan Dekoratif

Setiap elemen yang tampak interaktif (slider, drag-and-drop, grafik, tombol simulasi) MUST
mengubah state aplikasi secara nyata dan menghasilkan umpan balik yang sesuai. Kontrol kosmetik
yang terlihat interaktif tetapi tidak berfungsi MUST NOT dikirim ke pengguna dalam bentuk apa pun,
termasuk demo, prototype, dan landing page.

Rationale: Nilai inti Lumera adalah "belajar dengan mencoba, bukan menghafal". Interaksi palsu
menghancurkan proposisi nilai tersebut sekaligus kepercayaan pengguna, dan secara eksplisit
dilarang oleh PRD Bagian 14.

### II. Struktur 7 Langkah Lesson (NON-NEGOTIABLE)

Semua modul pelajaran — berapa pun berbedanya gaya interaksinya — MUST mengikuti alur:
Prompt → Model visual → Aksi pengguna → Umpan balik instan → Penjelasan "Kenapa?" → Refleksi →
Lanjutkan. Langkah MUST NOT dihapus, digabung, atau diurutkan ulang untuk mempercepat pengiriman.
Penjelasan "Kenapa?" MUST tetap ditampilkan pada jawaban salah maupun benar.

Rationale: Ini kontrak konsistensi produk, bukan preferensi UI. Konsistensi alur adalah yang
membuat pengalaman terasa satu produk dan menjamin setiap interaksi berakhir pada pemahaman
konsep, bukan sekadar skor.

### III. Kedalaman di Atas Kuantitas

Ketika terjadi trade-off antara waktu dan cakupan, tim MUST mengurangi jumlah modul/pelajaran dan
MUST NOT mengurangi kualitas interaksi, akurasi, atau kedalaman penjelasan per modul. Sebuah modul
dianggap "selesai" hanya jika seluruh 7 langkah berfungsi penuh; modul setengah jadi MUST NOT
dihitung sebagai deliverable.

Rationale: Empat modul yang benar-benar solid membuktikan nilai produk; enam modul tanggung
membuktikan sebaliknya. Ini juga menegaskan prioritas build pada PRD Bagian 15.

### IV. Kebenaran Konten di Atas Kecepatan

Akurasi materi edukasi MUST diverifikasi terhadap Kurikulum Merdeka sebelum sebuah modul dirilis.
Konten yang belum terverifikasi MUST NOT dikirim ke pengguna, bahkan untuk memenuhi tenggat.
Setiap penjelasan konsep dan koreksi miskonsepsi MUST dapat ditelusuri ke sumber kurikulum atau
referensi pedagogi yang jelas.

Rationale: Ini aplikasi belajar. Satu kesalahan konsep merusak kepercayaan siswa, orang tua, dan
sekolah secara permanen — kerugiannya jauh melampaui keuntungan ship lebih cepat.

### V. Dewasa Secara Visual, Bukan Childish

Warna, copy, dan gaya animasi pada Lumera Core MUST mengikuti arah desain "Soft Academic
Adventure". Estetika game anak, copy berlebihan ("Yuk belajar!", "Hebat banget kamu!"), reward
yang meledak-ledak di setiap klik, serta leaderboard/ruang sosial yang ramai MUST NOT digunakan.
Pengecualian gaya hanya berlaku untuk Lumera Junior, yang berada di luar cakupan Lumera Core.

Rationale: Target Lumera Core adalah SMP–SMA. Nuansa kekanak-kanakan langsung menghilangkan
kredibilitas produk di mata segmen tersebut dan orang tua mereka.

### VI. Instrumentasi Sejak Awal

Setiap pelajaran MUST mencatat data minimal sejak implementasi pertama: konsep apa yang dipelajari,
kesalahan apa yang dilakukan siswa, dan waktu pengerjaan. Data ini MUST tersimpan meskipun fitur
yang mengonsumsinya (Knowledge Bank, Refresh Harian, adaptive learning) belum dibangun.
Pengiriman modul tanpa instrumentasi ini MUST NOT disetujui.

Rationale: Knowledge Bank dan Refresh Harian adalah fitur signature yang bergantung sepenuhnya
pada riwayat belajar. Menunda instrumentasi berarti data historis hilang permanen dan setiap modul
harus diinstrumentasi ulang dari nol.

### VII. Aset Orisinal dan Berlisensi

Seluruh ilustrasi, animasi, dan ikon MUST dibuat sendiri atau dilisensikan secara sah. Menyalin
aset atau desain dari Brilliant, Kinnu, Duolingo, atau produk lain MUST NOT dilakukan. Ilustrasi
hasil AI generik tanpa arah desain yang jelas MUST NOT digunakan sebagai aset produksi.

Rationale: Konten visual custom adalah unfair advantage Lumera (PRD Bagian 12). Aset jiplakan
menghapus keunggulan itu sekaligus menciptakan risiko hukum.

### VIII. Privasi dan Keamanan Data Siswa (NON-NEGOTIABLE)

Karena mayoritas pengguna Lumera Core adalah anak di bawah umur, setiap data siswa yang tersimpan
di database (termasuk data progres belajar hasil instrumentasi Prinsip VI) MUST mengikuti prinsip
minimisasi data: hanya data yang benar-benar esensial untuk pengalaman belajar boleh disimpan, dan
data pribadi non-esensial (mis. alamat, nomor telepon) MUST NOT disimpan tanpa kebutuhan
fungsional yang jelas. Siswa (atau wali) MUST dapat menghapus seluruh data pribadinya sendiri
kapan saja, dalam satu aksi jelas, tanpa bantuan teknis. Data siswa MUST NOT dijual atau
dibagikan ke pihak ketiga untuk kepentingan komersial apa pun. Setiap fitur baru yang menyimpan
atau memproses data siswa MUST melewati tinjauan privasi sebelum dirilis.

Rationale: Lumera menyasar anak SMP–SMA; kegagalan melindungi data mereka adalah risiko
kepercayaan dan hukum tertinggi yang dihadapi produk ini, sejalan dengan Mukadimah dan dengan
kepatuhan privasi anak yang sudah menjadi prioritas P1 di specs/002-production-readiness.
Kepercayaan siswa, orang tua, dan sekolah bergantung sepenuhnya pada bagaimana data ini
diperlakukan.

## Additional Constraints: Scope & Content Standards

- Bahasa antarmuka default adalah Bahasa Indonesia. Terminologi produk (Lumera Atlas, Knowledge
  Bank, Refresh Harian, Lumens, Lumo) MUST digunakan konsisten dan MUST NOT diterjemahkan ulang
  secara ad hoc antar fitur.
- Cakupan Lumera Core adalah SMP dan SMA. UTBK/SNBT dan kuliah awal berada di luar cakupan untuk
  saat ini — spec turunan yang sebelumnya menargetkan segmen tersebut (mis. modul UTBK di
  specs/001-core-mvp-prototype) MUST ditinjau dan diamandemen secara eksplisit, bukan dibiarkan
  bertentangan diam-diam dengan cakupan ini. Fitur yang menargetkan SD MUST diarahkan ke Lumera
  Junior dan MUST NOT mengubah gaya visual atau tone Lumera Core.
- Gamifikasi terbatas pada streak, Lumens, progress, mastery %, badge, dan pengingat konsep lemah.
  Leaderboard berat, ruang sosial, dan kompetisi antar siswa MUST NOT ditambahkan tanpa amandemen
  konstitusi.
- Model monetisasi (fitur premium, freemium, langganan, atau bentuk lain) MUST NOT dirancang atau
  diimplementasikan pada fase pengembangan saat ini. Ide ini dicatat sebagai pertimbangan
  realisasi produk di dunia nyata di masa depan, dan ketika saatnya tiba MUST ditinjau ulang agar
  tetap tunduk pada Mukadimah (misi sosial di atas profit) — bukan prioritas sekarang.
- Setiap spec turunan MUST menyatakan secara eksplisit fitur mana yang berada di luar cakupannya,
  sehingga batas antar spec tetap jelas.

## Development Workflow & Quality Gates

- Setiap `plan.md` MUST melewati Constitution Check sebelum Phase 0 dan diperiksa ulang setelah
  Phase 1. Pelanggaran yang tidak dapat dihindari MUST dicatat di tabel Complexity Tracking
  beserta alasan dan alternatif yang ditolak.
- Sebuah modul pelajaran MUST NOT ditandai selesai sampai: seluruh 7 langkah berfungsi (Prinsip II),
  seluruh kontrol interaktifnya benar-benar berfungsi (Prinsip I), konten telah diverifikasi
  terhadap Kurikulum Merdeka (Prinsip IV), instrumentasi minimal aktif (Prinsip VI), dan data
  siswa yang tersimpan sudah melewati tinjauan privasi (Prinsip VIII).
- Review konten pedagogi MUST dilakukan oleh orang selain penulis modul tersebut.
- Trade-off jadwal MUST diselesaikan dengan memangkas jumlah modul, bukan kedalaman modul
  (Prinsip III). Keputusan pemangkasan MUST dicatat dalam plan atau tasks feature terkait.

## Governance

Konstitusi ini mengikat semua spec, plan, dan tasks turunan dalam repositori ini dan menggantikan
praktik lain yang bertentangan dengannya.

- **Amandemen**: Perubahan MUST diusulkan sebagai edit terhadap file ini disertai Sync Impact
  Report, alasan perubahan, dan pembaruan artefak dependen (template plan/spec/tasks serta spec
  aktif yang terdampak).
- **Versioning**: Mengikuti semantic versioning. MAJOR untuk penghapusan atau redefinisi prinsip
  yang tidak backward compatible; MINOR untuk penambahan prinsip/section atau perluasan panduan
  yang material; PATCH untuk klarifikasi, perbaikan kata, dan penyempurnaan non-semantik.
- **Kepatuhan**: Setiap review plan dan review implementasi MUST memverifikasi kepatuhan terhadap
  Prinsip I–VIII. Pelanggaran yang ditemukan setelah rilis MUST diperbaiki sebelum penambahan
  cakupan baru pada area yang sama.

**Version**: 2.0.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-08-13
