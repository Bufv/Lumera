const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Robust Flood-fill transparent background extractor using Euclidean color distance from white (255,255,255).
 */
async function makeTransparentFloodFill(inputPath, outputPath) {
  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBackgroundPixel(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Distance from pure white (255, 255, 255)
    const dr = 255 - r;
    const dg = 255 - g;
    const db = 255 - b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    // Any pixel near white within distance 50 is background candidate
    return dist < 50;
  }

  // Seed borders
  for (let x = 0; x < width; x++) {
    if (isBackgroundPixel(x, 0)) {
      visited[0 * width + x] = 1;
      queue.push(x, 0);
    }
    if (isBackgroundPixel(x, height - 1)) {
      visited[(height - 1) * width + x] = 1;
      queue.push(x, height - 1);
    }
  }

  for (let y = 0; y < height; y++) {
    if (isBackgroundPixel(0, y) && !visited[y * width + 0]) {
      visited[y * width + 0] = 1;
      queue.push(0, y);
    }
    if (isBackgroundPixel(width - 1, y) && !visited[y * width + (width - 1)]) {
      visited[y * width + (width - 1)] = 1;
      queue.push(width - 1, y);
    }
  }

  // BFS Flood Fill
  let head = 0;
  const dx = [1, -1, 0, 0, 1, -1, 1, -1];
  const dy = [0, 0, 1, -1, 1, -1, -1, 1];

  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    for (let d = 0; d < 8; d++) {
      const nx = x + dx[d];
      const ny = y + dy[d];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx]) {
          if (isBackgroundPixel(nx, ny)) {
            visited[nIdx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  // Apply alpha transparency
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pIdx = y * width + x;
      const dataIdx = pIdx * channels;
      const r = data[dataIdx];
      const g = data[dataIdx + 1];
      const b = data[dataIdx + 2];

      const dr = 255 - r;
      const dg = 255 - g;
      const db = 255 - b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);

      if (visited[pIdx]) {
        if (dist <= 15) {
          data[dataIdx + 3] = 0; // 100% transparent
        } else if (dist < 50) {
          // Antialiased edge feathering
          const alpha = Math.floor(((dist - 15) / 35) * 255);
          data[dataIdx + 3] = Math.max(0, Math.min(255, alpha));
        } else {
          data[dataIdx + 3] = 0;
        }
      }
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .trim({ threshold: 5 })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Saved transparent PNG: ${outputPath}`);
}

async function run() {
  const assetsDir = path.resolve(__dirname, 'public/assets');
  const brainDir = path.resolve('C:/Users/muhma/.gemini/antigravity-ide/brain/f6a19427-d43e-41df-99a6-e578b8a58de2');

  const files = [
    {
      in: path.join(brainDir, 'math_notebook_3d_1786936122393.jpg'),
      out: path.join(assetsDir, 'math_notebook_3d_trans.png'),
    },
    {
      in: path.join(brainDir, 'math_coin_unit_3d_1786936378257.jpg'),
      out: path.join(assetsDir, 'math_coin_unit_3d_trans.png'),
    },
    {
      in: path.join(brainDir, 'math_mystery_box_3d_1786936477771.jpg'),
      out: path.join(assetsDir, 'math_mystery_box_3d_trans.png'),
    },
  ];

  for (const f of files) {
    if (fs.existsSync(f.in)) {
      await makeTransparentFloodFill(f.in, f.out);
    } else {
      console.warn(`File not found: ${f.in}`);
    }
  }
}

run().catch(console.error);
