const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/logo.png');
  const outputPath = path.join(__dirname, '../public/logo-transparent.png');

  console.log('Processing logo image to remove dark background...');

  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Image info: ${width}x${height}, channels: ${channels}`);

  // Create RGBA buffer (4 channels)
  const newBuffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;

    if (brightness < 45) {
      // Dark background pixel -> 100% transparent
      newBuffer[i * 4] = 0;
      newBuffer[i * 4 + 1] = 0;
      newBuffer[i * 4 + 2] = 0;
      newBuffer[i * 4 + 3] = 0;
    } else {
      // White logo pixel -> render as clean white with anti-aliased alpha
      const alpha = Math.min(255, Math.round((brightness - 35) * 4));
      newBuffer[i * 4] = 255;
      newBuffer[i * 4 + 1] = 255;
      newBuffer[i * 4 + 2] = 255;
      newBuffer[i * 4 + 3] = alpha;
    }
  }

  await sharp(newBuffer, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log('Successfully saved transparent logo to public/logo-transparent.png!');
}

processLogo().catch(console.error);
