# Rencana Redesain Tampilan Lumera

Sumber visual: `docs/image_sample/`.

| Berkas | Isi | Status sebagai acuan |
|---|---|---|
| `ChatGPT Image Aug 4, 2026, 10_58_34 PM.png` | Mockup dashboard **Lumera** sendiri | **Acuan utama** — identitas, warna, tata letak |
| `Screenshot 2026-08-03 19XXXX.png` (4 buah) | Tangkapan layar **Brilliant.org** | Acuan **pola interaksi saja** — bukan warna, nama kursus, atau salinan teks |

## 0. Temuan yang memicu redesain ini

Commit terakhir (`9182dcb major ui change`) menyalin Brilliant terlalu harfiah: palet oranye `#FF8300`, judul kursus "Exploring Data Visually", dan teks Inggris ("Solve 3 problems to start a streak", "Xenon League", "Explore Premium"). Itu identitas milik pihak lain dan bertentangan dengan PRD §13. Redesain ini mengembalikan Lumera ke identitasnya sendiri seperti pada mockup: **ungu-violet + amber, berbahasa Indonesia, maskot Lumo**.

Satu konflik yang perlu keputusanmu: PRD §13 mendeskripsikan Lumo sebagai *"orb kecil bercahaya, bukan hewan/kartun bayi"*, sedangkan mockup menggambarkannya sebagai kucing oranye. Saya mengikuti **mockup** (artefak terbaru dan yang kamu minta ditiru), tetapi Lumo dibuat sebagai satu komponen SVG mandiri (`src/design/Lumo.tsx`) sehingga berganti ke bentuk orb cukup mengubah satu berkas.

## 1. Fondasi sistem desain (dikerjakan bersama landing page)

| Aspek | Keputusan |
|---|---|
| Warna primer | Violet `#6D5AE6` (aksi, progres, tautan) |
| Warna aksen | Amber `#F5A623` (streak, Lumo, dorongan lembut) — dipakai hemat |
| Latar | Lilac-grey `#F6F6FA`; kartu putih, radius 20px, garis `#ECECF3`, bayangan sangat lembut |
| Status | Hijau `#22C55E` kuat · Kuning `#FACC15` stabil · Oranye `#FB923C` mulai pudar · Merah `#EF4444` perlu diulang |
| Tipografi | Plus Jakarta Sans (UI), Inter (fallback) |
| Bentuk | Kartu besar bersudut lembut, ubin ikon 44–48px berwarna pastel, tombol pil |
| Gerak | Halus dan singkat (120–200ms); tanpa reward meledak-ledak (PRD §7.5, §14) |

## 2. Urutan pengerjaan layar

| # | Layar | Nav | Isi redesain | Status |
|---|---|---|---|---|
| 1 | **Beranda** | Beranda | Sapaan + Lumo, kartu "Lanjutkan belajar", Refresh Harian, Jalur belajarmu, rail: Target hari ini / Rekomendasi Lumo / Aktivitas terakhir | **Dikerjakan sekarang** |
| 2 | **Pelajaran** (7 langkah) | — | Chrome pelajaran per PRD §7.4 dengan palet baru; bilah umpan balik, progress dots, Lumens kanan atas | Berikutnya — layar paling sering dilihat siswa |
| 3 | **Belajar** | Belajar | Jalur belajar bertingkat (pola dari screenshot 3 & 4): baris per jalur, kartu modul, % complete | Setelah pelajaran |
| 4 | **Peta Ilmu** | Peta Ilmu | Atlas konstelasi (PRD §7.1) — ganti "stepping stone" tiruan Brilliant dengan node melayang + koneksi bercahaya | Setelah Belajar |
| 5 | **Progres** | avatar | Ringkasan mastery, streak, Lumens dengan bahasa dan kartu baru | Bersama #4 |
| 6 | **Ulangi** (Refresh Harian) | Ulangi | Fitur baru, belum ada di kode — butuh spec sendiri | Belum dibangun |
| 7 | **Simpanan** (Knowledge Bank) | Simpanan | Fitur baru, belum ada di kode — butuh spec sendiri | Belum dibangun |

Layar 6 dan 7 muncul di navigasi dengan label **"Segera"** dan tidak bisa diklik — bukan tombol mati yang berpura-pura berfungsi (PRD §14: nol elemen interaktif palsu).

## 3. Aturan yang mengikat redesain ini

1. **Tidak ada kontrol palsu.** Setiap tombol yang terlihat aktif harus melakukan yang dijanjikan. Elemen mockup yang belum punya data (lonceng notifikasi, "20 menit waktu belajar") diganti data nyata atau dihilangkan, bukan dipajang mati.
2. **Data nyata saja.** Angka di Beranda berasal dari `siswa.mastery`, `siswa.lumens`, `siswa.streakCount`, dan registry modul — tidak ada angka hias.
3. **Tanpa aset/teks pihak ketiga.** Nama kursus, ilustrasi, dan salinan teks Brilliant dihapus seluruhnya.
4. **Logika murni bisa diuji.** Perhitungan target harian, strip streak mingguan, dan aktivitas terakhir hidup di modul murni (`src/beranda/harian.ts`) dengan tes unit, bukan di dalam komponen.
5. **Gamifikasi terkendali.** Tanpa leaderboard, tanpa liga, tanpa hitungan permata (PRD §7.5).

## 4. Penyesuaian mockup → data yang benar-benar ada

| Elemen mockup | Keputusan |
|---|---|
| "20 menit waktu belajar" | Diganti **Lumens** (terlacak nyata); waktu belajar belum diinstrumentasi |
| "3 / 5 aktivitas selesai" | Diganti **aktivitas hari ini / target 3**, dihitung dari `mastery.diperbaruiPada` |
| Strip streak 7 hari | Nyata — diturunkan dari `streakCount` + `streakLastDate` |
| "Baru disimpan" (Knowledge Bank) | Diganti **"Aktivitas terakhir"** dari riwayat mastery, karena Simpanan belum ada |
| Kolom cari | Nyata — memfilter modul terdaftar dan langsung membuka pelajarannya |
| Lonceng notifikasi | Dihilangkan — tidak ada sistem notifikasi |
| "65% selesai · sekitar 6 menit lagi" | Persen dari mastery nyata; estimasi menit dihapus (durasi tidak dilacak) |
| Rekomendasi Lumo | Nyata — dari `pilihUsulan`, menyebut modul dengan mastery terendah |
