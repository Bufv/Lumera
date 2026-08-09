# Runbook Operasional — Deploy, Rollback, dan Environment

Referensi cepat untuk tim yang mengoperasikan Lumera. Kontrak yang mengikat perilaku ini:
[`specs/002-production-readiness/contracts/ci-pipeline-contract.md`](../specs/002-production-readiness/contracts/ci-pipeline-contract.md).

## Environment

| Environment | Worker name | Dipicu oleh | Approval GitHub Environment |
|---|---|---|---|
| `staging` | `lumera-student-batch-1-staging` | Push ke branch manapun selain `main`, setelah `CI` sukses | Tidak — otomatis |
| `production` | `lumera-student-batch-1-production` | Push ke `main`, setelah `CI` sukses | Sesuai konfigurasi GitHub Environment `production` (disarankan: minimal satu reviewer) |

Kedua environment didefinisikan di `wrangler.jsonc` → `env.staging` / `env.production`. Keduanya
**tidak berbagi** state/storage apapun — `staging` aman dipakai bereksperimen tanpa memengaruhi
data siswa di `production` (US2, FR-003 spec 002).

## Membaca versi yang sedang live

Setiap build production menyematkan commit SHA sebagai `VITE_APP_VERSION` (lihat
`vite.config.ts`, `.github/workflows/deploy.yml`). Untuk mengetahui versi yang sedang live:

1. Buka aplikasi yang di-deploy.
2. Versi terlihat di `import.meta.env.VITE_APP_VERSION` — saat ini diekspos lewat konteks error
   yang dikirim ke Sentry (`appVersion`, lihat `src/monitoring/errorReporting.ts`) dan dapat
   ditambahkan ke UI (mis. footer Pengaturan) bila dibutuhkan tim non-teknis.
3. Alternatif: lihat run `deploy.yml` terakhir yang sukses di tab **Actions** GitHub — `head_sha`
   pada run tersebut adalah commit yang di-deploy.

## Rollback production

Cloudflare Workers menyimpan riwayat versi deploy secara native — rollback **tidak** memerlukan
build ulang dari kode (FR-004).

```sh
# Lihat daftar versi yang pernah di-deploy untuk environment production.
# --name eksplisit (bukan hanya --env) -- lihat catatan di wrangler.jsonc:
# env.production.name terbukti tidak selalu bertahan lewat config redirect
# @cloudflare/vite-plugin jika ada sisa build lokal di direktori ini.
npx wrangler versions list --env production --name lumera-student-batch-1-production

# Kembalikan production ke versi sebelumnya (VERSION_ID dari daftar di atas,
# argumen posisi -- BUKAN flag --version-id, itu tidak ada di wrangler rollback)
npx wrangler rollback <VERSION_ID> --env production --name lumera-student-batch-1-production
```

Rollback **selalu dijalankan manual oleh tim**, bukan otomatis (lihat R-003
`specs/002-production-readiness/research.md` untuk alasan). Target waktu: production kembali ke
versi stabil dalam < 10 menit sejak masalah terdeteksi (SC-002).

Setelah rollback:

1. Konfirmasi versi yang live sudah berubah (bagian "Membaca versi yang sedang live" di atas).
2. Catat insiden secukupnya (apa yang salah, versi mana yang di-rollback-dari/ke) di tempat tim
   biasa mencatat insiden.
3. Perbaikan MUST lewat jalur normal (PR → `CI` → `staging` → `production`) sebelum dicoba deploy
   ulang — rollback bukan alasan untuk melewati gerbang (edge case `spec.md`).

## Staging: kapan dan bagaimana memakainya

Setiap push ke branch non-`main` yang lolos `CI` otomatis ter-deploy ke `staging`. Pakai ini
untuk memverifikasi perubahan berisiko sebelum menyentuh `production` — terutama perubahan pada
`Content-Security-Policy` (`worker/index.js`), yang berpotensi memblokir aset sah (Rive/canvas)
tanpa error yang jelas ke pengembang jika langsung ke production (lihat edge case `spec.md` dan
`contracts/security-headers-contract.md`).

## Rahasia yang dibutuhkan CI/CD

Disimpan sebagai GitHub Actions secrets (Settings → Secrets and variables → Actions), **tidak**
pernah di-commit ke repo:

| Secret | Dipakai oleh | Keterangan |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | `deploy.yml` (staging + production) | Token dengan izin **Edit Cloudflare Workers** pada akun target — jangan pakai Global API Key. |
| `CLOUDFLARE_ACCOUNT_ID` | `deploy.yml` (staging + production) | Account ID Cloudflare tempat kedua Worker di-deploy. |
| `SENTRY_DSN` | Build (diinjeksikan sebagai env var) | Lihat `src/monitoring/errorReporting.ts` — DSN publik, bukan rahasia berisiko tinggi, tapi tetap disimpan sebagai secret agar mudah dirotasi tanpa commit kode. |
