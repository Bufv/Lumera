import { gzipSync } from 'node:zlib';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Laporan diff ukuran bundle awal terhadap baseline (US10 spec 002, T057,
 * SC-009). Non-blocking dengan sengaja (contracts/ci-pipeline-contract.md:
 * "kegagalan anggaran performa MUST menghasilkan peringatan yang terlihat,
 * bukan otomatis memblokir merge di iterasi pertama") — skrip ini selalu
 * exit 0, hanya mencetak peringatan jika pertumbuhan > ambang.
 *
 * Dijalankan setelah `npm run build`. Baseline disimpan di
 * `build/bundle-size-baseline.json` (dicek ke repo) — jalankan dengan flag
 * `--update-baseline` untuk menulis ulang setelah pertumbuhan yang disengaja
 * dan sudah ditinjau (mis. dependency baru yang memang dibutuhkan).
 */

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = resolve(projectRoot, 'dist', 'client');
const baselinePath = resolve(projectRoot, 'build', 'bundle-size-baseline.json');
const AMBANG_PERSEN = 5;

/**
 * "Unduhan awal" = hanya berkas `.js` yang dirujuk langsung `<script>` di
 * `index.html` — BUKAN seluruh isi `assets/`. Sejak US11 (T061, code-splitting
 * modul) dan US10 (T059, Rive lazy) berjalan, banyak chunk di `assets/` hanya
 * diambil lewat dynamic `import()` saat benar-benar diakses; menghitungnya di
 * sini akan salah melaporkan pertumbuhan padahal justru itulah yang
 * dioptimasi (SC-009 mengukur unduhan AWAL, bukan total seluruh kode).
 */
async function totalGzipAwal() {
  const html = await readFile(resolve(clientDir, 'index.html'), 'utf-8');
  const entryFiles = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) =>
    m[1].replace(/^\//, ''),
  );

  let total = 0;
  for (const file of entryFiles) {
    const buf = await readFile(resolve(clientDir, file));
    total += gzipSync(buf).length;
  }
  return { total, entryFiles };
}

async function main() {
  const updateBaseline = process.argv.includes('--update-baseline');
  const { total, entryFiles } = await totalGzipAwal();

  let baseline = null;
  try {
    baseline = JSON.parse(await readFile(baselinePath, 'utf-8'));
  } catch {
    // Belum ada baseline — run pertama.
  }

  console.log(
    `[bundle-size] Entry chunk (index.html): ${entryFiles.join(', ')} — total gzip: ${(total / 1024).toFixed(1)} KB`,
  );

  if (!baseline) {
    console.log('[bundle-size] Tidak ada baseline — menulis baseline baru dari run ini.');
    await writeFile(baselinePath, JSON.stringify({ totalGzipBytes: total, recordedAt: new Date().toISOString() }, null, 2) + '\n');
    return;
  }

  const persenPerubahan = ((total - baseline.totalGzipBytes) / baseline.totalGzipBytes) * 100;
  const arah = persenPerubahan >= 0 ? '+' : '';
  console.log(
    `[bundle-size] Baseline: ${(baseline.totalGzipBytes / 1024).toFixed(1)} KB (${baseline.recordedAt}) → ` +
      `sekarang: ${(total / 1024).toFixed(1)} KB (${arah}${persenPerubahan.toFixed(1)}%)`,
  );

  if (persenPerubahan > AMBANG_PERSEN) {
    console.warn(
      `[bundle-size] PERINGATAN: pertumbuhan ${persenPerubahan.toFixed(1)}% melebihi ambang ${AMBANG_PERSEN}% (SC-009). ` +
        'Tidak memblokir build — tinjau apakah pertumbuhan ini disengaja.',
    );
  } else {
    console.log(`[bundle-size] Dalam ambang ${AMBANG_PERSEN}%.`);
  }

  if (updateBaseline) {
    await writeFile(baselinePath, JSON.stringify({ totalGzipBytes: total, recordedAt: new Date().toISOString() }, null, 2) + '\n');
    console.log('[bundle-size] Baseline diperbarui.');
  }
}

await main();
