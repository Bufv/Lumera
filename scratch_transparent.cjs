const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processImage(inputPath, outputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  // data is RGBA buffer
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // If pixel is near white (>238 in all channels)
    if (r > 235 && g > 235 && b > 235) {
      const minVal = Math.min(r, g, b);
      if (minVal > 248) {
        data[i + 3] = 0; // completely transparent
      } else {
        // Soft feather edge
        const alpha = Math.floor(((248 - minVal) / 13) * 255);
        data[i + 3] = Math.max(0, Math.min(255, alpha));
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
    .png()
    .toFile(outputPath);
  console.log(`Processed: ${outputPath}`);
}

async function main() {
  const assetsDir = path.resolve(__dirname, 'public/assets');
  const brainDir = path.resolve('C:/Users/muhma/.gemini/antigravity/brain/0244b3fb-5389-450c-a742-da88c26abaa9');

  const mapping = [
    { in: path.join(brainDir, 'course_relasi_float_1786811804882.jpg'), out: path.join(assetsDir, 'course_relasi_trans.png') },
    { in: path.join(brainDir, 'course_geometri_float_1786812084047.jpg'), out: path.join(assetsDir, 'course_geometri_trans.png') },
    { in: path.join(brainDir, 'course_data_float_1786812482176.jpg'), out: path.join(assetsDir, 'course_data_trans.png') },
    { in: path.join(brainDir, 'course_kalkulus_float_1786812516925.jpg'), out: path.join(assetsDir, 'course_kalkulus_trans.png') },
    { in: path.join(brainDir, 'course_aljabar_lanjut_float_1786812700896.jpg'), out: path.join(assetsDir, 'course_aljabar_lanjut_trans.png') },
    { in: path.join(brainDir, 'course_geometri_analitik_float_1786812898586.jpg'), out: path.join(assetsDir, 'course_geometri_analitik_trans.png') },
  ];

  for (const item of mapping) {
    if (fs.existsSync(item.in)) {
      await processImage(item.in, item.out);
    } else {
      console.log('Not found:', item.in);
    }
  }
}

main().catch(console.error);
