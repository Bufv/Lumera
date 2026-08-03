# Inspirasi UX — Pola Belajar Interaktif untuk Lumera

Dokumen ini menelaah **pola interaksi, layout visual, dan desain tema** yang diterapkan di Lumera berdasarkan contoh referensi visual di `docs/image_sample/` (gaya visual Brilliant). Lumera kini mengadopsi secara utuh layout header navigasi atas, widget sidebar beranda, hero card dengan tombol aksi Vibrant Orange (`#FF8300`), halaman Learning Paths berlapisan unit/kategori, serta peta stepping-stone bertingkat dengan 3D ring disk.

> Referensi acuan hanya pada tingkat pola yang teramati publik. Tidak ada konten, ilustrasi, atau
> salinan modul pihak ketiga yang direproduksi di Lumera.

---

## 1. Prinsip inti yang membedakan kategori ini

Aplikasi belajar interaktif yang bagus menang bukan karena banyak materi, melainkan karena lima
kebiasaan desain berikut. Empat dari lima sudah menjadi tulang punggung konstitusi Lumera.

| Pola kategori | Sudah ada di Lumera? | Lokasi |
|---|---|---|
| Belajar dengan **memanipulasi objek visual**, bukan membaca paragraf | ✅ | Prinsip I; slot `VisualModel` + `UserAction` |
| **Umpan balik instan** pada tiap aksi | ✅ | `LessonShell` langkah 4 |
| Selalu jawab **"kenapa?"** — di benar *dan* salah | ✅ | `LessonShell` langkah 5 (dipaksa kontrak) |
| **Mastery bergerak** + streak halus, tanpa leaderboard | ✅ | `progress/mastery.ts`, `progress/streak.ts` |
| **Alur masuk terarah**: placement → jalur → sesi harian | ⛔ belum | *gap — bagian 3* |

Kesimpulan cepat: Lumera sudah kuat di **kedalaman satu pelajaran**. Yang belum dibangun adalah
**lapisan di atas pelajaran** — bagaimana siswa tahu harus mulai dari mana dan kembali tiap hari.

---

## 2. Pola per-area, dan padanannya di Lumera

### 2.1 Beranda = peta, bukan daftar
Kategori ini jarang memakai daftar kursus datar. Beranda berupa **peta/graf bercabang** yang
memberi rasa "petualangan" dan menunjukkan keterkaitan antar topik.

- **Lumera sekarang:** `atlas/Atlas.tsx` sudah node melayang + garis penghubung bergradien +
  indikator mastery per node. Ini sudah sesuai pola.
- **Peluang:** node Atlas saat ini setara "subject world". Tambahkan **status per node** yang lebih
  kaya: terkunci / terbuka / dikuasai, sehingga peta juga berfungsi sebagai penunjuk langkah
  berikutnya (lihat 2.4).

### 2.2 Satu pelajaran = satu ide, dipecah jadi langkah pendek
Pelajaran yang baik tidak menyodorkan konsep utuh sekaligus; ia memandu lewat langkah kecil yang
tiap langkahnya menuntut satu aksi.

- **Lumera sekarang:** alur 7 langkah (`Prompt → Model visual → Aksi → Umpan balik → Kenapa →
  Refleksi → Lanjut`) persis pola ini, dan ditegakkan secara struktural oleh `LessonShell` +
  registry. Sudah sangat kuat.
- **Peluang:** satu modul Lumera = satu langkah aksi. Kategori acuan sering merangkai **beberapa
  langkah aksi berurutan** dalam satu pelajaran (naik tingkat kesulitan). Ini bisa jadi evolusi
  kontrak modul di iterasi berikutnya (mis. `UserAction[]` bertahap), **bukan** untuk MVP ini.

### 2.3 Umpan balik yang mengajar, bukan menghakimi
Jawaban salah tidak dibalas "X merah" lalu selesai — ia memicu penjelasan yang menautkan kesalahan
ke miskonsepsi spesifik.

- **Lumera sekarang:** `penjelasanKenapa(hasil)` menerima `mistakeType`, dan keempat modul sudah
  mengklasifikasikan miskonsepsi (mis. Δx/Δy tertukar, faktor ½ hilang). Ini **lebih maju** dari
  sekadar benar/salah dan sudah diuji otomatis.
- **Peluang:** tidak ada yang mendesak. Pertahankan.

### 2.4 Progres yang terasa, bukan angka mentah
Streak, poin, dan level dipakai untuk **ritme kembali**, bukan kompetisi.

- **Lumera sekarang:** Lumens (20 +5 bonus), streak (`hitungStreak`), mastery rata-rata 3 sesi.
  Sudah "halus" sesuai Prinsip V (tanpa leaderboard/animasi meledak).
- **Peluang:** jadikan mastery **penggerak rekomendasi** — node dengan mastery rendah muncul sebagai
  " diusulkan hari ini". Progres yang mengarahkan langkah berikutnya, bukan sekadar dipajang.

---

## 3. Tiga celah nyata (yang layak dibangun berikutnya)

Ini bagian paling berharga dari menelaah kategori ini: tiga lapisan yang **belum** ada di spec 001
Lumera, dan justru menentukan retensi.

### Celah A — Onboarding / Placement di awal
Sesi pertama menempatkan siswa pada tingkat yang tepat lewat beberapa soal cepat, bukan langsung
melempar ke Atlas kosong.

- **Untuk Lumera:** 3–5 interaksi singkat lintas mapel → tetapkan mastery awal per subject world →
  Atlas terbuka dengan node yang sudah "diusulkan". Bisa jadi **US baru** di spec 001 atau spec 002.

### Celah B — Hierarki `Subject World → Unit → Pelajaran`
Saat ini Atlas menunjuk langsung ke modul. Kategori acuan menyisipkan lapisan **unit** agar ada rasa
kemajuan bertahap dan "bab yang selesai".

- **Untuk Lumera:** perluas `data-model.md` (`SubjectWorld` → `Unit` → `ModulPelajaran`). Perubahan
  data-model + Atlas, tidak menyentuh `LessonShell`.

### Celah C — Beranda harian yang mengarahkan
Layar yang, tiap dibuka, berkata "lanjutkan dari sini" — menyatukan streak, usulan pelajaran, dan
progres unit.

- **Untuk Lumera:** komponen `Beranda` di atas Atlas yang membaca `progress/store` + mastery untuk
  memilih 1–3 pelajaran usulan. Murni komposisi dari data yang **sudah** dicatat instrumentasi.

---

## 4. Batasan yang dijaga (Prinsip V & VII)

Beberapa hal dari kategori acuan **sengaja tidak** ditiru karena melanggar konstitusi Lumera:

- ❌ Leaderboard / perbandingan antar-siswa → dilarang Prinsip V.
- ❌ Animasi hadiah meledak-ledak, copy kekanakan → dilarang Prinsip V.
- ❌ Aset visual, ikon, ilustrasi, atau teks pihak ketiga → dilarang Prinsip VII (aset orisinal &
  berlisensi). Semua visual Lumera dibuat sendiri dalam palet Soft Academic Adventure.

---

## 5. Ringkasan tindakan

| Prioritas | Item | Dampak | Sentuh apa |
|---|---|---|---|
| Tinggi | Celah C — beranda harian | Retensi harian | Komponen baru, data lama |
| Tinggi | 2.4 — mastery menggerakkan usulan | Arah belajar | `Atlas` + `progress` |
| Sedang | Celah A — placement | Sesi pertama tepat sasaran | US/spec baru |
| Sedang | Celah B — lapisan Unit | Rasa kemajuan | `data-model` + `Atlas` |
| Rendah | 2.2 — multi-langkah aksi/pelajaran | Kedalaman | Kontrak modul (iterasi berikut) |

Tidak ada satu pun item di atas yang menuntut reverse engineering atau penyalinan produk lain —
semuanya adopsi pola pada tingkat ide, dijalankan dengan konten dan identitas Lumera sendiri.
