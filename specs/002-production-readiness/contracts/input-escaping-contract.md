# Contract: Input Bebas Siswa — Escaping & Anti-XSS (FR-011)

Aturan yang MUST diikuti oleh setiap kode yang menampilkan kembali teks bebas yang diketik siswa
(US5, FR-011). Ini kontrak eksplisit yang dirujuk FR-011 ("aturan ini MUST didokumentasikan
sebagai kontrak eksplisit") — sebelumnya hanya disebut sekilas di
`security-headers-contract.md` § Aturan 4 tanpa isi sendiri.

## Aturan

1. Seluruh teks bebas siswa yang ditampilkan kembali ke UI manapun MUST dirender lewat mekanisme
   escaping otomatis React — teks sebagai children JSX (`{value}`) atau prop teks biasa (`alt`,
   `aria-label`, dst.) — TIDAK PERNAH lewat `dangerouslySetInnerHTML` atau penyisipan string HTML
   manual (`innerHTML`, `insertAdjacentHTML`).
2. `dangerouslySetInnerHTML` MUST NOT dipakai pada konten yang berasal — langsung maupun tidak
   langsung (mis. digabung dari beberapa field) — dari input siswa. Penggunaannya hanya diizinkan
   untuk konten statis yang ditulis developer sendiri (mis. `src/privacy/content.ts`), tidak
   pernah untuk mengeko-balikkan input pengguna.
3. Ini adalah lapisan pertahanan pertama (level komponen). Header
   `Content-Security-Policy` (`security-headers-contract.md`) adalah lapisan kedua yang membatasi
   *dampak* jika lapisan pertama gagal — CSP MUST NOT dianggap pengganti aturan 1–2 di atas.
4. Field yang tunduk pada kontrak ini saat ini: `displayName` (`src/profile/store.ts`) — satu-
   satunya teks bebas siswa di aplikasi per audit T023 (`quickstart.md` § V-5). Field teks bebas
   baru yang ditambahkan di masa depan (mis. catatan siswa, jawaban esai) MUST mengikuti aturan
   yang sama dan MUST ditambahkan ke cakupan `tests/unit/xss-safety.test.tsx`.

## Verifikasi

- Regresi otomatis: `tests/unit/xss-safety.test.tsx` (T024) — payload `<img src=x
  onerror="...">` sebagai `displayName`, dirender di Beranda dan Progres, MUST tampil sebagai teks
  literal, MUST NOT menjadi elemen DOM nyata yang bisa memicu handler.
- Audit statis: grep `dangerouslySetInnerHTML` di `src/` MUST kosong (diverifikasi 2026-08-11,
  lihat catatan T024 di `tasks.md`); jika sebuah PR menambahkannya, review MUST memverifikasi
  kontennya bukan berasal dari input siswa sebelum disetujui.
