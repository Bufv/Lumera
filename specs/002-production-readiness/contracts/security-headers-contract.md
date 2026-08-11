# Contract: Security Response Headers

Header yang MUST hadir pada setiap response yang dilayani `worker/index.js` (US4, FR-009). Ini
kontrak antara aplikasi dan browser/security scanner — bukan sesuatu yang siswa lihat langsung,
tapi bagian dari "permukaan yang dilayani ke pengguna lain" sehingga layak jadi contract, bukan
sekadar detail implementasi.

Pengecualian khusus local Vite development dijelaskan pada aturan 5; nilai deployment tetap
persis seperti kontrak di bawah.

## Header Wajib

| Header                    | Nilai                                                                                                                                                           | Alasan                                                                                                                                                                                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.sentry.io; frame-ancestors 'none'` | Mencegah eksekusi skrip dari sumber tak dikenal (mitigasi XSS lapis kedua di atas FR-011); `connect-src` khusus mengizinkan Sentry (R-004). Nilai `style-src 'unsafe-inline'` dipertahankan karena styling saat ini memakai CSS modul/inline yang sah, bukan celah — MUST ditinjau ulang jika pola styling berubah. |
| `X-Content-Type-Options`  | `nosniff`                                                                                                                                                       | Mencegah browser menebak MIME type aset.                                                                                                                                                                                                                                                                            |
| `X-Frame-Options`         | `DENY`                                                                                                                                                          | Mencegah aplikasi di-embed di `<iframe>` domain lain (clickjacking) — redundan dengan `frame-ancestors` di atas untuk browser lama yang belum membaca CSP level 2.                                                                                                                                                  |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`                                                                                                                               | Mencegah URL penuh (yang bisa memuat hash route) bocor ke pihak ketiga lewat header `Referer`.                                                                                                                                                                                                                      |

## Aturan

1. Header MUST disisipkan untuk **seluruh** response, termasuk aset statis yang sukses (200) —
   bukan hanya fallback SPA 404. Ini mensyaratkan `run_worker_first: true` di `wrangler.jsonc`
   (lihat Complexity Tracking `plan.md`).
2. Perubahan pada `Content-Security-Policy` MUST diverifikasi di environment `staging` (R-002)
   sebelum menyentuh `production` — CSP yang salah bisa memblokir aset Rive/canvas yang sah tanpa
   error yang jelas ke pengembang (edge case `spec.md`).
3. `connect-src` MUST diperbarui jika layanan pihak ketiga baru ditambahkan di masa depan (mis.
   endpoint Sentry berubah) — daftar ini MUST tetap eksplisit, tidak pernah `*`.
4. Header ini tidak menggantikan validasi/escaping di level komponen React (FR-011) — CSP adalah
   lapisan pertahanan kedua, bukan pengganti sanitisasi input.
5. Pada **local Vite development saja**, `Content-Security-Policy` MUST dihilangkan karena
   `@vitejs/plugin-react` menyisipkan preamble React Refresh inline dan HMR memakai WebSocket.
   Header keamanan lain MUST tetap dipasang. Pengecualian ini MUST dikendalikan oleh
   `import.meta.env.DEV`; build, preview, staging, dan production tetap memakai nilai CSP ketat pada
   tabel di atas.
