# Fondasi Desain Lumera

Sumber acuan: `docs/sample/brilliant/` (halaman tersimpan: Home, Courses, Fractions, Settings) untuk **mekanika sistem desain**, dan `docs/sample/artifact/` untuk **identitas dan bahasa produk**.

Pembagiannya tegas dan tidak boleh dibalik:

| Diambil dari `brilliant/` | Diambil dari `artifact/` |
|---|---|
| Skala tipografi, bobot, dan line-height | Palet merek (violet + amber Lumera) |
| Skala spasi, radius, elevasi | Nama produk, ikon, maskot Lumo |
| Anatomi komponen (kartu 3D, tombol keycap, lencana, pil progres) | Seluruh salinan teks — Bahasa Indonesia |
| Arsitektur informasi halaman | Nama mapel, kursus, dan pelajaran |
| Mekanika interaksi (tekan, hover, underline nav) | Ilustrasi (vektor sendiri) |

Nama kursus, string Inggris, logo, dan aset gambar Brilliant **tidak dipakai**. Commit `9182dcb` dulu melakukan itu dan harus dibatalkan; catatan ini ada supaya tidak terulang.

---

## 1. Warna

### 1.1 Netral akromatik

Temuan paling menentukan: netral Brilliant **tidak punya rona sama sekali**. `bg.primary` putih murni, `bg.secondary` `#f8f8f8`, `border.solid` `#e5e5e5`, `text.primary` hitam, `text.secondary` hitam-alpha-700.

Lumera mengikuti ini. Abu-abu bernuansa lavender yang dipakai sebelumnya (`#101936`, `#f8f8fc`, `#e7e7f0`) dihapus — warna hanya boleh muncul dari aksen, bukan merembes ke netral. Efeknya: aksen violet jadi jauh lebih menonjol karena tidak bersaing dengan latar yang juga kebiruan.

### 1.2 Tangga rona

Setiap rona punya 11 langkah: `50 100 200 300 400 500 600 700 800 900 950`. Nilai 500 adalah warna merek.

Rona Lumera: **violet** (merek), **amber** (aksen kedua), **green** (benar/selesai), **blue**, **rose** (salah).

### 1.3 Rumus komposisi

Komponen berwarna tidak pernah menyetel hex sendiri. Ia menyusun dari satu rona:

| Peran | Langkah | Contoh pemakaian |
|---|---|---|
| `fill` | 500 | latar tombol utama |
| `soft` | 200 | latar lencana |
| `tint` | 100 | latar ubin ikon |
| `border` | 400 | garis kartu berwarna |
| `borderBold` | 500 | garis kartu terpilih |
| `text` | 700 | teks di atas latar terang |
| `depth` | 600 | bayangan keycap tombol |

Itulah kenapa satu komponen bisa dipakai untuk mapel apa pun hanya dengan mengganti satu variabel `--hue-*`.

---

## 2. Tipografi

Skala persis mengikuti mekanika Brilliant. Yang paling mengubah tampilan: **judul besar berbobot 500, bukan 800**, dan **teks tubuh 16px, bukan 14px**.

| Peran | Ukuran | Bobot | Line-height | Tracking |
|---|---|---|---|---|
| `display.lg` | 24px | 500 | 1.1 | 0 |
| `display.xl` | 30px | 500 | 1.1 | 0 |
| `display.2xl` | 36px | 500 | 1.1 | −0.36px |
| `display.3xl` | 40px | 500 | 1.1 | −0.4px |
| `heading.xs` | 14px | 700 | 1.4 | 0 |
| `heading.sm` | 16px | 700 | 1.4 | 0 |
| `heading.md` | 20px | 700 | 1.25 | 0 |
| `heading.lg` | 24px | 700 | 1.25 | 0 |
| `heading.xl` | 30px | 700 | 1.25 | 0 |
| `body.xs` | 12px | 400 | 1.5 | 0 |
| `body.sm` | 14px | 400 | 1.5 | 0 |
| `body.base` | 16px | 400 | 1.5 | 0 |
| `body.lg` | 20px | 400 | 1.5 | 0 |
| `ui.action.sm` | 12px | 700 | 1.1 | 0.48px, UPPERCASE |
| `ui.action.base` | 16px | 500 | 1.25 | 0 |
| `ui.nav` | 16px | 400 (terpilih: 500) | 1.5 | 0 |

Hanya tiga bobot yang dipakai: 400, 500, 700. Tidak ada 600 atau 800.

`ui.action.sm` adalah satu-satunya teks huruf besar di seluruh aplikasi — dipakai untuk eyebrow dan label level.

---

## 3. Spasi, radius, elevasi

- **Spasi**: kelipatan 4px (`0.25rem`). Nilai yang benar-benar dipakai: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Radius**: `sm 2px · base 4px · xs 6px · md 8px · lg 12px · xl 16px · 2xl 20px · 3xl 32px · full 9999px`.
- **Elevasi**: bayangan **difus tanpa offset vertikal** — `0 0 15px` dan `0 0 25px`. Bukan drop shadow berarah. Ditambah `subtle: 0 1px 3px rgba(0,0,0,.04)` dan cincin fokus `0 0 0 3px`.
- **Lebar konten**: 1216px (76rem).

---

## 4. Primitif komponen

### 4.1 Kartu 3D (`.card3d`)

```
border: 2px solid border.solid
box-shadow: 0 4px 0 0 border.solid
transform: translateY(-4px)
transition: transform 100ms ease-out, box-shadow 100ms ease-out,
            border-color 200ms, background-color 200ms
hover  → border-color: border.hover;  box-shadow: 0 4px 0 0 border.hover
active → transform: translateY(0);    box-shadow: none
```

Kartu terangkat 4px dan meninggalkan "sisi" setebal 4px berwarna sama dengan garisnya. Bukan bayangan gelap — inilah kenapa terlihat seperti benda, bukan seperti kertas melayang.

### 4.2 Tombol keycap (`.btn3d`)

```
padding: 14px 20px 18px       /* bawah 4px lebih tebal */
box-shadow: 0 4px 0 0 {hue-600}
active → box-shadow: none; margin-top: 4px; padding-bottom: 14px
```

Ditekan berarti tombolnya **memendek**, bukan bergeser. Tinggi kotak totalnya tetap, jadi tata letak tidak bergoyang.

### 4.3 Underline navigasi

Batang `2px` berwarna **netral** (bukan warna merek), `translateY(-2px)` saat aktif atau hover, transisi `100ms linear`. Tab tidak aktif tetap menampilkan batang redup — jadi yang beranimasi posisinya, bukan kemunculannya.

### 4.4 Pil progres

`border-radius: full`, latar `bg.secondary`, isi: cincin SVG 20px (`stroke-width` 3.33, `stroke-linecap: round`, diputar −90°) + teks `ui.action.base`. Dipakai di kepala setiap jalur.

---

## 5. Arsitektur informasi

Diambil apa adanya dari struktur Brilliant, diisi konten Lumera.

### 5.1 Belajar — "Jalur belajar"

```
Jalur (mis. Matematika Dasar)
 ├─ eyebrow jenjang · judul · deskripsi · pil progres
 └─ deret horizontal ubin kursus, dirantai garis 2px
      Ubin = kartu persegi 3D + lencana jenjang + ilustrasi + label di bawahnya
```

Dipisah dua bagian: **"Jalur belajarmu"** (sudah dimulai) dan **"Jalur lainnya"**.

### 5.2 Detail kursus

```
Kiri   : ilustrasi 100px · judul · deskripsi · meta (N pelajaran · N latihan)
Kanan  : kolom 392px
          Kepala level (lengket, keycap, berwarna per level)
          Simpul pelajaran berkelok kiri-kanan, label di sampingnya
```

Kepala level lengket saat digulir sehingga siswa selalu tahu sedang di level mana.

### 5.3 Beranda

Kolom utama berisi kartu lanjutkan per kursus; rail kanan berisi streak, target harian, dan aktivitas terakhir. Liga/leaderboard Brilliant **tidak diambil** — PRD §7.5 melarang leaderboard.

---

## 6. Yang sengaja tidak diambil dari Brilliant

| Elemen | Alasan |
|---|---|
| Liga & leaderboard ("Xenon League") | PRD §7.5: tanpa leaderboard, tanpa liga |
| "Keys" / batas pelajaran harian | Mekanik monetisasi, di luar cakupan |
| Upsell Premium | Belum ada tingkatan langganan |
| Mode gelap | Belum dispesifikasi; sistem token sudah siap kalau nanti dibuat |
| Shimmer sweep pada CTA | Menarik perhatian tanpa memberi informasi |
| Ilustrasi & nama kursus | Milik pihak ketiga |
