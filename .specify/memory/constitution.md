<!--
Sync Impact Report
==================
Version change: (unfilled template) → 1.0.0
Bump rationale: Initial ratification. The constitution previously contained only
placeholder tokens; this is the first concrete adoption, so MAJOR.MINOR.PATCH starts at 1.0.0.

Modified principles: none (no prior named principles existed)

Added sections:
- I. Interaksi Nyata, Bukan Dekoratif
- II. Struktur 7 Langkah Lesson (NON-NEGOTIABLE)
- III. Kedalaman di Atas Kuantitas
- IV. Kebenaran Konten di Atas Kecepatan
- V. Dewasa Secara Visual, Bukan Childish
- VI. Instrumentasi Sejak Awal
- VII. Aset Orisinal dan Berlisensi
- Additional Constraints: Scope & Content Standards
- Development Workflow & Quality Gates
- Governance

Removed sections: none

Templates requiring updates:
- ✅ .specify/templates/plan-template.md — Constitution Check gates filled with the seven concrete gates
- ✅ .specify/templates/tasks-template.md — note added that instrumentation tasks (Principle VI) are mandatory per story
- ✅ .specify/templates/spec-template.md — reviewed; no structural change required (principles are enforced at the plan gate, not via new mandatory spec sections)
- ✅ .claude/skills/speckit-*/SKILL.md — reviewed; no outdated agent-specific references requiring change
- ✅ specs/001-core-mvp-prototype/spec.md — amended 2026-07-29 to cover all seven principles.
  Added FR-015 (Principle VI), FR-016 (IV), FR-017 (VII), FR-018 (V), FR-019 (terminology),
  FR-020 (III), entity Catatan Aktivitas Belajar, SC-006–SC-009, and an explicit Out of Scope
  section. Alignment tracked in specs/001-core-mvp-prototype/checklists/requirements.md.

Follow-up TODOs:
- None. TODO(SPEC_001_INSTRUMENTATION) was resolved by the 2026-07-29 spec amendment (FR-015).
-->

# Lumera Constitution

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

Rationale: Target Lumera Core adalah SMP–SMA–UTBK. Nuansa kekanak-kanakan langsung menghilangkan
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

## Additional Constraints: Scope & Content Standards

- Bahasa antarmuka default adalah Bahasa Indonesia. Terminologi produk (Lumera Atlas, Knowledge
  Bank, Refresh Harian, Lumens, Lumo) MUST digunakan konsisten dan MUST NOT diterjemahkan ulang
  secara ad hoc antar fitur.
- Cakupan Lumera Core adalah SMP, SMA, UTBK/SNBT, dan kuliah awal. Fitur yang menargetkan SD
  MUST diarahkan ke Lumera Junior dan MUST NOT mengubah gaya visual atau tone Lumera Core.
- Gamifikasi terbatas pada streak, Lumens, progress, mastery %, badge, dan pengingat konsep lemah.
  Leaderboard berat, ruang sosial, dan kompetisi antar siswa MUST NOT ditambahkan tanpa amandemen
  konstitusi.
- Setiap spec turunan MUST menyatakan secara eksplisit fitur mana yang berada di luar cakupannya,
  sehingga batas antar spec tetap jelas.

## Development Workflow & Quality Gates

- Setiap `plan.md` MUST melewati Constitution Check sebelum Phase 0 dan diperiksa ulang setelah
  Phase 1. Pelanggaran yang tidak dapat dihindari MUST dicatat di tabel Complexity Tracking
  beserta alasan dan alternatif yang ditolak.
- Sebuah modul pelajaran MUST NOT ditandai selesai sampai: seluruh 7 langkah berfungsi (Prinsip II),
  seluruh kontrol interaktifnya benar-benar berfungsi (Prinsip I), konten telah diverifikasi
  terhadap Kurikulum Merdeka (Prinsip IV), dan instrumentasi minimal aktif (Prinsip VI).
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
  Prinsip I–VII. Pelanggaran yang ditemukan setelah rilis MUST diperbaiki sebelum penambahan
  cakupan baru pada area yang sama.

**Version**: 1.0.0 | **Ratified**: 2026-07-29 | **Last Amended**: 2026-07-29
