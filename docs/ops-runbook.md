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

**Cara utama — baca header response (FR-005, T047).** Setiap response membawa
`X-Lumera-Version` berisi commit SHA yang sedang dilayani:

```sh
curl -sI https://lumera-student-batch-1-production.workers.dev | grep -i x-lumera-version
```

Ini satu-satunya cara yang menjawab pertanyaan **"versi mana yang sedang dilayani?"** secara
langsung. Pakai ini lebih dulu saat insiden.

**Cara lain, beserta batasnya** — keduanya menjawab pertanyaan yang sedikit berbeda, jadi jangan
dipakai sebagai pengganti:

1. Konteks error Sentry (`appVersion`, lihat `src/monitoring/errorReporting.ts`) — menuntut sebuah
   error terjadi lebih dulu. Tidak berguna saat kamu justru sedang memutuskan apakah perlu rollback.
2. Run `deploy.yml` terakhir yang sukses di tab **Actions** GitHub (`head_sha`) — menunjukkan apa
   yang terakhir **di-deploy**, bukan apa yang sedang **dilayani**. Keduanya berbeda begitu sebuah
   rollback sudah dijalankan (lihat bagian berikutnya).

## Rollback production

Cloudflare Workers menyimpan riwayat versi deploy secara native — rollback **tidak** memerlukan
build ulang dari kode (FR-004).

```sh
# Lihat daftar versi yang pernah di-deploy untuk environment production
npx wrangler versions list --env production

# Kembalikan production ke versi sebelumnya (ganti <VERSION_ID> dari daftar di atas)
npx wrangler rollback --env production --version-id <VERSION_ID>
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
