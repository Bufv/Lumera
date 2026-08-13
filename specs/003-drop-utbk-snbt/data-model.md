# Phase 1 Data Model: Drop UTBK/SNBT dari Lumera Core

Fitur ini tidak memperkenalkan entity baru maupun skema penyimpanan baru. Satu-satunya entity yang
terpengaruh adalah **Subject World**, yang definisinya di-superseded sebagian oleh spec ini.

## Subject World (diperbarui — superseded dari spec 001)

Kategori mata pelajaran yang ditampilkan sebagai node di Lumera Atlas.

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | id unik subject world, mis. `matematika`, `sains` |
| `nama` | string | terminologi produk resmi yang ditampilkan (FR-019 spec 001) |
| `moduleIds` | string[] | id modul pelajaran yang termasuk subject world ini |
| `connections` | string[] | id subject world lain yang terhubung secara visual di Atlas |
| `x`, `y` | number | posisi node pada peta (persen viewBox) |

**Perubahan oleh spec ini**: definisi kategori subject world di spec 001 (entity "Subject World")
mencantumkan `UTBK/SNBT` sebagai salah satu kategori. Spec ini men-supersede cakupan kategori
tersebut menjadi 5 kategori tanpa UTBK/SNBT:

- Matematika
- Fisika/Sains
- Ekonomi & Bisnis
- Sejarah & Sosial
- Bahasa & Komunikasi

**Status implementasi vs spec**: struktur data `SubjectWorld` (`src/atlas/subject-worlds.ts`)
tidak berubah — hanya berisi 4 entri (Bahasa & Komunikasi belum punya modul terbangun sehingga
belum muncul sebagai node, konsisten dengan pola "hanya subject world dengan modul terbangun yang
ditampilkan"). Tidak ada entri UTBK yang perlu dihapus dari data ini (lihat research.md R-002).

## Tidak ada perubahan pada entity lain

Entity-entity berikut dari spec 001 (Siswa, Modul Pelajaran, Percobaan Interaksi/Simulasi, Streak,
Saldo Lumens, Catatan Mastery, Catatan Aktivitas Belajar) TIDAK disentuh oleh spec ini — tidak ada
field, relasi, atau state transition yang berubah. Tidak ada migrasi data diperlukan (research.md
R-005: tidak ada data siswa tersimpan untuk subject world UTBK).

## Persistence / Storage

N/A. Tidak ada skema database, `localStorage` key, atau kontrak penyimpanan baru yang
ditambahkan atau diubah oleh fitur ini.
