# Contract: Lesson Module ↔ LessonShell

**Feature**: `001-core-mvp-prototype` | **Date**: 2026-07-29

Kontrak yang harus dipenuhi setiap modul agar bisa didaftarkan ke `LessonShell`. Ini adalah
mekanisme penegakan Prinsip II: modul yang tidak memenuhi kontrak **tidak bisa didaftarkan**,
sehingga alur 7 langkah tidak bisa dilewati secara diam-diam.

## Pembagian kepemilikan langkah

| Langkah | Pemilik | Bisa diubah modul? |
|---|---|---|
| 1. Prompt | Shell (render) | hanya isi teksnya |
| 2. Model visual | **Modul** | ya — slot komponen |
| 3. Aksi pengguna | **Modul** | ya — slot komponen |
| 4. Umpan balik instan | Shell | tidak |
| 5. Penjelasan "Kenapa?" | Shell (render) | hanya isi teksnya |
| 6. Refleksi | Shell (render) | hanya isi teksnya |
| 7. Lanjutkan | Shell | tidak |

Modul **tidak** memiliki kendali atas transisi antar langkah. Shell yang memutuskan kapan berpindah.

## Bentuk kontrak

```ts
interface LessonModule {
  id: string;
  subjectWorldId: string;
  judul: string;
  conceptIds: string[];              // tidak boleh kosong — dipakai event log (FR-015)

  // Konten milik langkah Shell
  prompt: string;                    // langkah 1
  penjelasanKenapa: (hasil: AttemptResult) => string;   // langkah 5
  pertanyaanRefleksi: string;        // langkah 6

  // Slot milik modul
  VisualModel: React.ComponentType<VisualModelProps>;   // langkah 2
  UserAction: React.ComponentType<UserActionProps>;     // langkah 3

  verifikasi: VerifikasiKonten;      // wajib — lihat data-model.md
}
```

### `VisualModelProps`

```ts
interface VisualModelProps {
  state: unknown;                    // state simulasi milik modul
  onStateChange: (next: unknown) => void;
}
```

### `UserActionProps`

```ts
interface UserActionProps {
  state: unknown;
  onSubmit: (jawaban: unknown) => void;   // memicu penilaian oleh Shell
  disabled: boolean;                      // true saat Shell sedang menampilkan feedback
}
```

### `AttemptResult`

```ts
interface AttemptResult {
  benar: boolean;
  mistakeType: string | null;        // wajib non-null saat benar == false
  nomorPercobaan: number;
}
```

## Aturan yang mengikat

1. **`penjelasanKenapa` wajib mengembalikan teks non-kosong untuk `benar == true` maupun
   `benar == false`.** Prinsip II menuntut penjelasan muncul di kedua kondisi. Mengembalikan string
   kosong pada jawaban benar adalah pelanggaran, bukan optimasi.

2. **Setiap kontrol pada `VisualModel` dan `UserAction` wajib mengubah state nyata** (FR-013).
   Kontrol yang dirender tapi tidak terhubung ke `onStateChange`/`onSubmit` adalah tombol palsu.

3. **`onSubmit` boleh dipanggil berkali-kali.** Siswa berhak mencoba ulang tanpa dikunci keluar
   (edge case spec); Shell menaikkan `nomorPercobaan` tiap panggilan.

4. **`mistakeType` wajib terisi saat jawaban salah.** Tanpa ini `CatatanAktivitasBelajar` cacat dan
   modul gagal FR-020.

5. **Modul tidak boleh menulis langsung ke telemetry atau progress.** Keduanya milik Shell dan
   lapisan luar. Modul yang menulis sendiri akan menghasilkan penghitungan ganda.

6. **Interaksi berbasis drag wajib menyediakan jalur non-drag yang setara** (R-005), agar FR-013
   tetap terpenuhi pada perangkat tanpa pointer presisi.

## Definition of Done per modul

Menurunkan FR-020 menjadi daftar periksa yang bisa dicentang:

- [ ] Ketujuh langkah berjalan tanpa ada yang di-skip
- [ ] Seluruh kontrol interaktif mengubah state nyata (verifikasi manual)
- [ ] `penjelasanKenapa` non-kosong untuk jawaban benar **dan** salah
- [ ] `mistakeType` terisi pada setiap jalur jawaban salah
- [ ] `verifikasi` terisi lengkap, `reviewer` ≠ penulis modul
- [ ] Event `lesson_completed` terbit dan tervalidasi
- [ ] Jalur interaksi alternatif tersedia (jika modul memakai drag)
