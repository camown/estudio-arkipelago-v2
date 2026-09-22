const sharp = require('sharp');
const path = require('path');

async function generateLogos() {
  const inputPath = path.join(__dirname, '../public/logo-official.png');
  const whitePath = path.join(__dirname, '../public/logo-white.png');
  const blackPath = path.join(__dirname, '../public/logo-black.png');

  console.log('Reading official logo image...');

  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Image dimensions: ${width}x${height}, channels: ${channels}`);

  const whiteBuffer = Buffer.alloc(width * height * 4);
  const blackBuffer = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    const brightness = (r + g + b) / 3;

    if (brightness < 45) {
      // Background pixel -> 100% transparent
      whiteBuffer[i * 4 + 3] = 0;
      blackBuffer[i * 4 + 3] = 0;
    } else {
      // Logo pixel -> smooth anti-aliased alpha
      const alpha = Math.min(255, Math.round((brightness - 35) * 4.5));

      // White version for Dark Mode
      whiteBuffer[i * 4] = 255;
      whiteBuffer[i * 4 + 1] = 255;
      whiteBuffer[i * 4 + 2] = 255;
      whiteBuffer[i * 4 + 3] = alpha;

      // Dark/Black version for Light Mode (#18181B)
      blackBuffer[i * 4] = 24;
      blackBuffer[i * 4 + 1] = 24;
      blackBuffer[i * 4 + 2] = 27;
      blackBuffer[i * 4 + 3] = alpha;
    }
  }

  await sharp(whiteBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(whitePath);

  await sharp(blackBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(blackPath);

  console.log('Successfully generated public/logo-white.png and public/logo-black.png!');
}

generateLogos().catch(console.error);
