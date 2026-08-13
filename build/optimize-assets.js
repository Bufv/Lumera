import sharp from 'sharp';
import { readdir, rename, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Kompresi PNG di `public/assets/` (US10 spec 002, T058, FR-017, R-009).
 *
 * Dijalankan MANUAL lewat `npm run optimize-assets` — sengaja BUKAN bagian
 * dari `npm run build` otomatis: kompresi PNG di sini re-encode ulang piksel
 * (palette quantization), dan menjalankannya berulang pada output-nya sendiri
 * di setiap build berisiko mendegradasi kualitas gambar sedikit demi sedikit
 * setiap commit. Jalankan sekali setiap kali aset baru/berubah ditambahkan,
 * tinjau diff visual sebelum commit (Constitution Prinsip VII: MUST tetap
 * aset asli, hanya dikompresi — bukan diganti generik).
 */

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = resolve(projectRoot, 'public', 'assets');

async function main() {
  const files = (await readdir(assetsDir)).filter((f) => f.toLowerCase().endsWith('.png'));
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    const filePath = resolve(assetsDir, file);
    const before = (await stat(filePath)).size;
    if (before < 5 * 1024) {
      // Sudah sangat kecil — lewati, tidak ada manfaat berarti.
      console.log(`[optimize-assets] ${file}: dilewati (${(before / 1024).toFixed(1)} KB, sudah kecil)`);
      continue;
    }

    const input = await sharp(filePath).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
    const after = input.length;

    if (after < before) {
      // Tulis ke berkas sementara dulu, baru timpa — menulis langsung ke
      // `filePath` yang sama dengan sumber baca bisa gagal di libvips
      // ("unable to open for write") karena berkas sumber masih ter-mmap.
      const tempPath = `${filePath}.tmp`;
      await sharp(input).toFile(tempPath);
      await rename(tempPath, filePath);
      totalBefore += before;
      totalAfter += after;
      const persen = (((before - after) / before) * 100).toFixed(0);
      console.log(
        `[optimize-assets] ${file}: ${(before / 1024).toFixed(0)} KB → ${(after / 1024).toFixed(0)} KB (-${persen}%)`,
      );
    } else {
      totalBefore += before;
      totalAfter += before;
      console.log(`[optimize-assets] ${file}: sudah optimal, tidak diubah`);
    }
  }

  if (totalBefore > 0) {
    const persenTotal = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0);
    console.log(
      `[optimize-assets] Total: ${(totalBefore / 1024).toFixed(0)} KB → ${(totalAfter / 1024).toFixed(0)} KB (-${persenTotal}%)`,
    );
  }
}

await main();
