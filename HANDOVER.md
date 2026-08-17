# Lumera Engineering & Pedagogical Handover Document

> **Untuk AI Assistant Selanjutnya**: Baca dokumen ini dengan seksama sebelum melakukan tindakan atau modifikasi apa pun pada codebase Lumera.

---

## 1. Aturan Pengguna Mutlak (*Mandatory User Rules*)

1. **Nama Pengguna**: Pengguna bernama **Mahdy**.
2. **ATURAN WAJIB DI SETIAP RESPONS**: Setiap kali Anda mengirim pesan ke pengguna, **KATA PERTAMA HARUS SELALU** dimulai dengan `Mahdy, `.
   - *Contoh Benar*: `Mahdy, saya telah menyelesaikan...`
   - *Contoh Salah*: `Halo Mahdy, saya telah...` atau `Saya telah...`
3. **Standar Desain & Estetika**:
   - Jangan pernah menggunakan karakter teks mentah (seperti `×`) untuk tombol antarmuka. Selalu gunakan ikon vektor SVG Lumera `<Icon name="..." />` dengan *flexbox centering* simetris.
   - Jangan membuat animasi dengan lengkungan/puncak buatan yang berlebihan (*no fake/exaggerated arc peaks*). Mahdy menginginkan pergerakan yang lurus, presisi, cepat, dan berbobot (*Direct Straight Glide 160ms*).
   - Jangan ada elemen ganda/bertumpuk saat animasi berjalan (*Zero Ghosting / Clean Docking*).

---

## 2. Ikhtisar Arsitektur Proyek

- **Nama Proyek**: **Lumera** (`lumera_student_batch_1`)
- **Teknologi**:
  - React 18 + TypeScript + Vite
  - Styling: **Vanilla CSS scoped** (hindari TailwindCSS kecuali secara eksplisit diminta pengguna).
  - Pengujian: **Vitest** + **@testing-library/react** + **axe-core** (audit aksesibilitas tanpa pelanggaran).
  - Sistem Ikon: `src/design/Icon.tsx` (komponen vektor SVG kustom terstandarisasi).

---

## 3. Kurikulum Matematika: Aljabar Level 1

### A. Modul 1.1 — Pola yang Tumbuh (*Growing Patterns*)
- **File Utama**:
  - `src/microlearning/GrowingPatternLesson.tsx`
  - `src/microlearning/GrowingPatternLesson.css`
  - `tests/unit/growing-pattern-lesson.test.tsx`
- **Tujuan Pedagogis**:
  - Mengenali pola visual yang berkembang secara aditif (+2 pada kubus, +3 pada wajik emas, +3 pada lingkaran).
  - Menghitung jumlah per langkah, menemukan selisih pertumbuhan, memprediksi dan membangun langkah berikutnya.
- **Struktur State (9 Langkah + 1 Kelulusan)**:
  1. *Observe* (Amati 3 kelompok balok 1, 3, 5)
  2. *Quantity Reveal* (Ketuk kelompok untuk mengungkap angka)
  3. *Find What was Added* (Temukan bagian penambahan)
  4. *Describe Change* (Isi slot sequence chain dengan chip `+1`, `+2`, `+3`)
  5. *Predict by Building* (Bangun Langkah 4 dengan baki `+ Tambah balok`)
  6. *Isolate Structure* (Lihat 1 balok dasar + penambahan)
  7. *Rule Selection* (Pilih aturan: mulai dari 1 lalu tambah 2)
  8. *Transfer* (Wajik emas: pola 2, 5, 8 $\to$ bangun 11)
  9. *Independent Mastery* (Lingkaran: pola 4, 7, 10 $\to$ bangun 13)
  10. *Completion Screen* (Kartu kesimpulan & tombol lanjut ke 1.2)

### B. Modul 1.2 — Aturan di Balik Pola (*Algebraic Generalization*)
- **File Utama**:
  - `src/microlearning/PatternRuleLesson.tsx`
  - `src/microlearning/PatternRuleLesson.css`
  - `tests/unit/pattern-rule-lesson.test.tsx`
- **Tujuan Pedagogis**:
  - Menjadi **jembatan konseptual** dari *Pattern Recognition* ke *Algebraic Generalization*.
  - Menjawab pertanyaan kunci: *"Bagaimana kita mengetahui nilai langkah apa pun (misal Langkah 20) tanpa menggambar/menghitung satu per satu?"*
- **Struktur State (9 Langkah + 1 Kelulusan)**:
  1. *Create the Need for a Rule*: Friksi simulasi langkah demi langkah menuju Langkah 20.
  2. *Interactive Synchronized Slider*: Eksplorasi interaktif nomor langkah $n$ yang terhubung langsung dengan visual kubus.
  3. *Coordinate Table Relationship*: Menemukan relasi pola dari tabel nilai $n \to \text{Jumlah}$.
  4. *Decompose Structure*: Memisahkan balok menjadi bagian $n$ (nomor langkah) dan $n-1$ (satu kurang dari langkah).
  5. *Build Rule in Words*: Menyusun aturan verbal `Jumlah = [nomor langkah] + [satu kurang dari nomor langkah]` dan memperkenalkan simbol $n$.
  6. *Symbolic Compression*: Mengompresi aturan menjadi rumus aljabar $2n - 1$.
  7. *Test the Formula*: Menguji rumus pada Langkah 20 ($2 \times 20 - 1 = 39$).
  8. *Transfer Rule Discovery*: Menemukan rumus untuk pola baru (Wajik emas: $3n - 1$).
  9. *Independent Mastery Test*: Uji penguasaan mandiri (Lingkaran: $3n + 1$).
  10. *Milestone Completion Screen*: Kartu kesimpulan & tombol lanjut ke 1.3.

---

## 4. Arsitektur Animasi: Clean Docking & Direct Straight Glide

```
+------------------+         Direct Glide (160ms)         +------------------+
|  Tombol / Chip   | -----------------------------------> |   Slot Target    |
| (Origin Element) |     [Partikel Tunggal Bergerak]      | (Receiving Slot) |
+------------------+                                      +------------------+
                                                                   |
                                                      [Mendarat & Terkunci]
                                                    @keyframes chipSnapIn /
                                                    @keyframes newObjSpring
```

### Prinsip Utama:
1. **Zero Ghosting / No Duplicates**:
   - Slot tujuan **tetap kosong** saat partikel meluncur lurus.
   - Begitu partikel mencapai titik target (160ms), partikel dihilangkan dan state React diperbarui secara sinkron (`commit`), memicu mikro-animasi landing.
2. **Direct Straight Glide (160ms)**:
   - Lintasan partikel adalah garis lurus langsung dari pusat tombol ke pusat slot target (`@keyframes trajectoryFlight`) menggunakan `cubic-bezier(0.16, 1, 0.3, 1)`. Tidak ada lengkungan buatan (*no artificial peak arc*).
3. **Penyelarasan Headless / Unit Test**:
   - Jika `originRect.width === 0 && originRect.height === 0` (kondisi di lingkungan jsdom/vitest), fungsi `triggerFlight` memanggil `onLanded?.()` secara instan agar pengujian otomatis tidak mengalami *timeout delay*.
4. **Keamanan Siklus Hidup React**:
   - Menggunakan `isMountedRef` untuk mencegah eksekusi `setState` pada komponen yang telah di-unmount.

---

## 5. Rencana & Panduan untuk Modul Berikutnya (1.3 — Dari Kotak ke x)

Ketika Mahdy meminta implementasi **1.3 — Dari Kotak ke x (*From Concrete to Symbolic Variables*)**:
1. **Fokus Pedagogis**:
   - Transisi dari manipulatif konkret (balok/kotak misteri) ke representasi simbolik variabel $x$.
   - Memahami konsep persamaan aljabar seimbang (neraca/balance scale).
2. **Desain Komponen**:
   - Gunakan pola *Focus Mode Layout* yang sama dengan header minimalis, progress bar 9 segmen, dan tombol tutup vektor SVG.
   - Integrasikan *Clean Docking* (160ms) untuk pemindahan variabel/beban ke neraca.
   - Pastikan setiap state memiliki petunjuk berjenjang (*tiered hints*) dan penanganan kesalahan yang memandu tanpa memblokir.

---

## 6. Standar Verifikasi Wajib

Sebelum menyelesaikan pekerjaan apa pun, Anda **wajib** menjalankan 2 perintah berikut:
1. **Unit Test Suite**:
   ```bash
   npx vitest run
   ```
   *Ekspektasi: Seluruh 36 file pengujian harus lulus (296/296 tests hijau).*
2. **Production Build**:
   ```bash
   npm run build
   ```
   *Ekspektasi: Selesai dengan 0 error TypeScript dan 0 error CSS bundle.*
