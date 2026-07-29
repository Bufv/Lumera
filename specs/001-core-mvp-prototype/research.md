# Phase 0 Research: Lumera Core MVP

**Feature**: `001-core-mvp-prototype` | **Date**: 2026-07-29

Menyelesaikan seluruh titik yang belum ditentukan pada Technical Context. `docs/plan.md` sudah
mengunci sebagian besar keputusan; dokumen ini mencatat alasannya dan mengisi celah yang tersisa.

---

## R-001: Bagaimana menegakkan alur 7 langkah secara struktural

**Decision**: Satu `LessonShell` memiliki ketujuh langkah. Modul mendaftar lewat objek definisi
yang hanya menyediakan slot langkah 2 (Model visual) dan 3 (Aksi pengguna), plus konten untuk
langkah 1, 5, dan 6. Shell yang mengatur transisi antar langkah; modul tidak punya akses untuk
melompati langkah.

**Rationale**: Prinsip II bersifat NON-NEGOTIABLE, tapi kalau tiap modul dibuat sebagai halaman
mandiri, pelanggaran hanya dicegah oleh disiplin manual — dan developer berikutnya yang menambah
modul akan lupa satu langkah tanpa ada yang menahan. Menaruh alur di Shell memindahkan penegakan
dari kebiasaan ke struktur: modul yang tidak melengkapi kontrak tidak bisa didaftarkan.

**Alternatives considered**:
- *Halaman per modul dengan checklist review* — ditolak, bergantung penuh pada ketelitian reviewer.
- *Shell sebagai HOC/wrapper opsional* — ditolak, "opsional" berarti bisa dilewati.

---

## R-002: Penyimpanan progres & event tanpa backend

**Decision**: `localStorage` di balik satu modul adapter (`telemetry/`, `progress/`). Kode aplikasi
tidak menyentuh `localStorage` langsung; semua lewat adapter dengan antarmuka async.

**Rationale**: FR-010 hanya menuntut persistensi antar sesi, dan asumsi spec sudah membatasi ke satu
perangkat — `localStorage` cukup. Antarmuka async sejak awal berarti penggantian ke backend nanti
tidak mengubah satu pun pemanggil, hanya isi adapter. Ini yang membuat Prinsip VI benar-benar
terpenuhi: data tidak sekadar dicatat, tapi dicatat dalam bentuk yang siap dipindahkan.

**Alternatives considered**:
- *IndexedDB* — ditolak, volume data prototype jauh di bawah batas `localStorage` (~5 MB); kompleksitas tidak sebanding.
- *Akses `localStorage` langsung dari komponen* — ditolak, membuat migrasi ke backend menyentuh seluruh basis kode.

---

## R-003: Cara menggambar grafik (Matematika & Ekonomi)

**Decision**: SVG yang dirender React, memakai D3 **hanya untuk `d3-scale` dan `d3-shape`** —
perhitungan skala, sumbu, dan path. D3 tidak memegang DOM.

**Rationale**: Perhitungan skala/sumbu adalah matematika membosankan yang mudah salah; D3 sudah
menyelesaikannya. Tapi membiarkan D3 memanipulasi DOM akan bentrok dengan React dan mempersulit
kontrol visual. Memakai D3 sebagai pustaka perhitungan saja memberi ketepatan tanpa kehilangan
kendali render — penting karena Prinsip VII menuntut visual buatan sendiri.

**Alternatives considered**:
- *Chart library siap pakai (Recharts/Chart.js)* — ditolak, gaya visual bawaannya generik dan sulit ditundukkan ke "Soft Academic Adventure"; juga menyulitkan interaksi kustom seperti kurva yang bergeser mengikuti slider.
- *Canvas* — ditolak untuk grafik statis/reaktif; SVG lebih mudah dibuat aksesibel dan di-inspect.

---

## R-004: Animasi simulasi gerak lurus

**Decision**: `requestAnimationFrame` manual di atas `<canvas>`, dengan integrasi posisi berbasis
delta-time (bukan per-frame konstan).

**Rationale**: Target 60 fps dan animasi gerak kontinu adalah kasus di mana canvas mengungguli SVG.
Delta-time membuat simulasi tetap benar secara fisika di perangkat dengan frame rate berbeda —
penting karena ini konten fisika, dan gerak yang salah adalah kesalahan konten (Prinsip IV), bukan
sekadar cacat visual.

**Alternatives considered**:
- *Library animasi (Framer Motion / GSAP)* — ditolak, dirancang untuk animasi UI, bukan simulasi berbasis parameter fisika.
- *Animasi CSS* — ditolak, tidak bisa merespons perubahan parameter secara kontinu di tengah animasi.

---

## R-005: Drag-and-drop dengan jalur alternatif (modul Sejarah)

**Decision**: `@dnd-kit`, yang menyediakan sensor pointer **dan** keyboard secara bawaan. Ditambah
mode fallback tap-to-select: ketuk kartu asal, lalu ketuk posisi tujuan.

**Rationale**: Spec mencantumkan edge case eksplisit — perangkat yang tidak mendukung drag harus
punya cara setara. `@dnd-kit` memberi dukungan keyboard tanpa kerja tambahan, dan tap-to-select
menutup perangkat sentuh berlayar kecil. Tanpa ini, modul Sejarah akan gagal FR-013 di sebagian
perangkat: kontrol terlihat tapi tidak berfungsi.

**Alternatives considered**:
- *HTML5 native drag-and-drop* — ditolak, dukungan di peramban mobile buruk dan tidak konsisten.
- *`react-beautiful-dnd`* — ditolak, tidak lagi dipelihara aktif.

---

## R-006: Bagaimana "kebenaran konten" dibuat dapat diaudit

**Decision**: Naskah pelajaran disimpan sebagai data terstruktur di `content/`, terpisah dari kode
komponen, dengan metadata wajib per modul: rujukan Capaian Pembelajaran Kurikulum Merdeka, nama
reviewer, dan tanggal verifikasi. Modul tanpa metadata terisi tidak boleh dirilis.

**Rationale**: FR-016 dan SC-007 menuntut 100% konten terverifikasi — itu hanya bisa dibuktikan
kalau status verifikasi tersimpan sebagai data, bukan ingatan tim. Memisahkan naskah dari kode juga
membuat reviewer pedagogi bisa memeriksa tanpa membaca React.

**Alternatives considered**:
- *Naskah hardcoded di dalam komponen* — ditolak, tidak bisa diaudit dan memaksa reviewer membaca kode.
- *CMS eksternal* — ditolak, infrastruktur berlebihan untuk 4 modul.

---

## R-007: Cakupan pengujian otomatis

**Decision**: Vitest untuk logika murni saja — fungsi penilaian jawaban, perhitungan mastery, dan
penulisan event log. Alur pelajaran diverifikasi manual lewat `quickstart.md`.

**Rationale**: Spec tidak meminta automated test, dan Definition of Done pada `docs/plan.md`
menetapkan verifikasi manual. Namun tiga hal di atas adalah logika berisiko diam-diam salah:
mastery yang salah hitung atau event yang tidak tertulis tidak akan terlihat saat demo manual,
padahal keduanya diikat SC-004 dan SC-006. Di situlah test otomatis memberi nilai terbesar dengan
biaya terkecil.

**Alternatives considered**:
- *Tanpa test sama sekali* — ditolak, kegagalan senyap pada event logging akan merusak Prinsip VI tanpa ketahuan.
- *E2E penuh (Playwright)* — ditolak untuk tahap ini, biaya perawatan tinggi untuk prototype yang UI-nya masih akan banyak berubah.

---

## Titik yang sengaja dibiarkan terbuka

Bukan blocker untuk Phase 1, tapi harus diputuskan sebelum implementasi modul terkait:

- **Besaran Lumens per pelajaran** — angka spesifik belum ditentukan. Spec hanya menuntut saldo
  bertambah (FR-007). Nilai awal bisa ditetapkan sembarang dan dikalibrasi setelah playtest.
- **Rumus mastery %** — spec menuntut "mencerminkan performa terbaru" (FR-009). Pendekatan yang
  disarankan: rata-rata bergerak atas percobaan terakhir, bukan akumulasi seumur hidup, agar siswa
  yang membaik terlihat membaik. Rumus finalnya ditetapkan di `tasks.md`.
