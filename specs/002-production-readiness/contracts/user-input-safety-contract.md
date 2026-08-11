# Contract: Keamanan Input Bebas Siswa

Memenuhi klausa kedua **FR-011** ("aturan ini MUST didokumentasikan sebagai kontrak eksplisit").
Klausa pertama — input MUST disaring/di-escape sehingga tidak dapat mengeksekusi skrip — ditegakkan
oleh aturan di bawah dan diuji di `tests/unit/xss-safety.test.tsx`.

Kontrak ini berlaku untuk **setiap** teks yang asalnya dari siswa atau dari berkas yang diberikan
siswa, bukan hanya nama tampilan.

## Sumber yang MUST diperlakukan tidak tepercaya

| Sumber | Masuk lewat | Ditampilkan kembali di |
|---|---|---|
| `displayName` (nama panggilan) | Onboarding (`OnboardingFlow.tsx`), Pengaturan | Header shell, HomeScreen, ProgressScreen, dialog konfirmasi |
| Berkas impor progres (`.json`) | `<input type="file">` → `src/backup/import.ts` | Seluruh UI yang membaca `Siswa`/`LearnerProfile` setelah impor |
| Hash rute (`window.location.hash`) | URL yang bisa dibagikan/diedit siswa | Routing (`src/student/routes.ts`), tag `route` pada laporan error |
| Isi `localStorage` | Perangkat bersama, DevTools | Seluruh permukaan yang membaca ketiga kunci storage |

Menambahkan field teks bebas baru berarti **menambah baris di tabel ini pada PR yang sama** —
tabelnya MUST mencerminkan permukaan yang sebenarnya, bukan yang diingat.

## Aturan

1. **Escaping default JSX adalah mekanisme utama.** Nilai dari siswa MUST dirender sebagai
   `{nilai}` di dalam JSX, yang di-escape React secara otomatis. Tidak perlu — dan MUST NOT —
   ada "sanitasi" manual sebelum render; menyaring dua kali justru merusak teks yang sah
   (nama dengan `&` atau `<`).
2. **`dangerouslySetInnerHTML` MUST NOT dipakai dengan data yang berasal dari siswa**, termasuk
   yang sudah melewati validasi impor. Jika suatu saat dibutuhkan untuk konten statis internal,
   sumbernya MUST literal di dalam kode, bukan variabel runtime.
3. **API DOM yang menulis markup mentah MUST NOT dipakai** untuk data siswa: `innerHTML`,
   `outerHTML`, `insertAdjacentHTML`, `document.write`, serta `eval`/`new Function`.
4. **Simpan mentah, escape saat render.** Nilai MUST disimpan apa adanya di `localStorage`; titik
   pertahanan adalah batas render. Menyimpan bentuk yang sudah di-escape membuat nilai rusak
   berlipat setiap kali diekspor lalu diimpor ulang.
5. **URL dari siswa MUST NOT dipasang langsung ke `href`/`src`.** Skema `javascript:` dan `data:`
   adalah jalur eksekusi skrip yang tidak tertutup oleh escaping JSX. Saat ini aplikasi tidak
   punya field URL dari siswa — aturan ini mendahului kebutuhannya, bukan menutup lubang yang ada.
6. **Berkas impor MUST divalidasi bentuknya sebelum menyentuh state**, sesuai
   `progress-export-contract.md`. Berkas yang ditolak MUST NOT merusak data lokal yang sudah ada.
7. **Content-Security-Policy adalah lapisan kedua, bukan pengganti aturan 1–6.** Header di
   `security-headers-contract.md` membatasi dampak jika salah satu aturan di atas bocor; ia tidak
   membuat pelanggarannya jadi boleh.

## Cara aturan ini ditegakkan

| Lapisan | Mekanisme |
|---|---|
| Otomatis | `tests/unit/xss-safety.test.tsx` — payload `<img src=x onerror=...>` sebagai `displayName`, diverifikasi dirender sebagai teks literal |
| Otomatis | CSP pada setiap response (`worker/security-headers.js`, diuji `tests/unit/security-headers.test.ts`) |
| Manual | Quickstart V-5 langkah 2 — payload yang sama lewat browser sungguhan, bukan jsdom |
| Review | Aturan 2 dan 3 adalah pola yang mudah di-grep; PR yang memperkenalkannya MUST menyertakan alasan eksplisit |
