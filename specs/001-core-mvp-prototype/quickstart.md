# Quickstart: Validasi Lumera Core MVP

**Feature**: `001-core-mvp-prototype` | **Date**: 2026-07-29

Panduan menjalankan dan **membuktikan** prototype memenuhi Success Criteria pada [spec.md](./spec.md).
Ini dokumen verifikasi, bukan panduan implementasi.

## Prasyarat

- Node.js 20+
- Peramban modern (Chromium/Firefox/Safari terbaru)

## Menjalankan

```bash
npm install
npm run dev          # dev server
npm run test         # Vitest — logika penilaian, mastery, event log
```

## Skenario validasi

Setiap skenario memetakan langsung ke Success Criteria. Jalankan di profil peramban bersih
(`localStorage` kosong) kecuali disebutkan lain.

---

### V-1 — Alur lengkap siswa baru → **SC-002**

1. Buka aplikasi dengan `localStorage` kosong.
2. Atlas tampil; seluruh node berstatus "belum dimulai", tanpa streak aktif.
3. Pilih node Matematika → modul "Membaca Kemiringan Grafik".
4. Lalui ketujuh langkah sampai menekan "Lanjutkan".

**Lulus jika**: seluruh alur selesai dalam **< 5 menit** tanpa bantuan eksternal, dan pengguna
kembali ke Atlas dengan progres ter-update.

---

### V-2 — Ketujuh langkah pada tiap modul → **SC-001**, Prinsip II

Ulangi untuk keempat modul: Matematika, Fisika, Ekonomi, Sejarah.

**Lulus jika** setiap modul menampilkan ketujuh langkah berurutan tanpa ada yang di-skip, dan
selesai end-to-end tanpa error atau jalan buntu.

---

### V-3 — Umpan balik instan & penjelasan "Kenapa?" → **SC-003**, Prinsip II

Pada tiap modul, lakukan **dua** percobaan: satu jawaban benar, satu jawaban salah.

**Lulus jika**:
- Kedua percobaan memunculkan umpan balik yang terlihat, tanpa interaksi yang macet.
- Penjelasan "Kenapa?" muncul pada **kedua** kondisi — termasuk saat jawaban benar.
- Setelah jawaban salah, siswa masih bisa mencoba ulang tanpa terkunci keluar.

---

### V-4 — Tidak ada tombol palsu → **SC-005**, Prinsip I

Untuk tiap modul, klik/geser **setiap** kontrol yang terlihat.

**Lulus jika** setiap kontrol menghasilkan perubahan state yang teramati. Satu saja kontrol yang
tidak merespons = gagal.

---

### V-5 — Jalur interaksi alternatif → edge case spec

Pada modul Sejarah (drag-and-drop): coba selesaikan **tanpa** drag — lewat keyboard, dan lewat
tap-to-select di viewport mobile.

**Lulus jika** kedua jalur menghasilkan hasil setara dengan drag.

---

### V-6 — Gamifikasi & persistensi → **SC-004**, FR-010

1. Selesaikan satu pelajaran. Catat Lumens, streak, mastery %.
2. **Muat ulang halaman.**
3. Periksa ketiga nilai tersebut.

**Lulus jika** ketiganya bertambah setelah pelajaran selesai **dan** bertahan setelah reload.

Uji tambahan (FR-014): mulai pelajaran, lalu tutup lewat tombol kiri atas sebelum langkah 7.
**Lulus jika** Lumens, streak, dan progres **tidak** berubah.

---

### V-7 — Event log terekam → **SC-006**, Prinsip VI

Ini yang paling mudah lolos secara semu — demo manual terlihat normal walau datanya tidak pernah
tersimpan. Jadi periksa datanya langsung.

1. Selesaikan pelajaran pada keempat modul (sengaja buat minimal satu kesalahan di salah satunya).
2. Baca isi event log lewat `readAll()` pada konsol peramban.

**Lulus jika** terdapat tepat satu event `lesson_completed` per pelajaran selesai, dan setiap event
punya `conceptIds` non-kosong, `durasiMs` > 0, serta `mistakes` terisi pada pelajaran yang sengaja
dijawab salah.

**Gagal jika** ada pelajaran selesai tanpa event — meski UI-nya terlihat normal.

---

### V-8 — Konten terverifikasi → **SC-007**, Prinsip IV

Periksa metadata `verifikasi` pada keempat modul di `content/`.

**Lulus jika** setiap modul punya `rujukanCP`, `reviewer`, dan `tanggalVerifikasi` terisi, dengan
`reviewer` **berbeda** dari penulis modul.

---

### V-9 — Aset & gaya visual → **SC-008**, **SC-009**, Prinsip V & VII

**Lulus jika**:
- Setiap aset visual dapat ditelusuri ke berkas sumber orisinal atau lisensi yang sah — tidak ada aset AI generik.
- Tidak ada warna hijau terang dominan maupun mascot berlebihan.
- Tidak ada copy childish ("Yuk belajar!", "Hebat banget kamu!").
- Terminologi produk konsisten di seluruh layar (mis. selalu "Refresh Harian", tidak pernah "Review Harian").

---

## Ringkasan kelulusan

Prototype dianggap memenuhi spec jika **V-1 s.d. V-9 lulus seluruhnya** untuk keempat modul.
Modul yang gagal salah satu butir tidak boleh dihitung ke dalam "minimal 4 modul" (FR-020) —
lebih baik dirilis 3 modul yang benar-benar lulus daripada 4 yang tanggung (Prinsip III).
