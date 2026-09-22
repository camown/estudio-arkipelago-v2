const sharp = require('sharp');
const path = require('path');

async function processPreciseLogos() {
  const inputPath = 'C:/Users/ADMIN/.gemini/antigravity/brain/96fb658e-5846-4f00-8421-87ab935c08f8/.user_uploaded/media_1790057734597.png';
  const whitePath = path.join(__dirname, '../public/logo-white.png');
  const blackPath = path.join(__dirname, '../public/logo-black.png');

  const { data, info } = await sharp(inputPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Original dimensions: ${width}x${height}, channels: ${channels}`);

  // Sample top-left corner as background color reference
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  console.log(`Background reference RGB: (${bgR}, ${bgG}, ${bgB})`);

  const whiteBuffer = Buffer.alloc(width * height * 4);
  const blackBuffer = Buffer.alloc(width * height * 4);

  let logoPixelCount = 0;

  for (let i = 0; i < width * height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];

    // Euclidean distance in RGB color space from background
    const dist = Math.sqrt(
      (r - bgR) * (r - bgR) +
      (g - bgG) * (g - bgG) +
      (b - bgB) * (b - bgB)
    );

    if (dist <= 10) {
      // Background -> 100% transparent
      whiteBuffer[i * 4 + 3] = 0;
      blackBuffer[i * 4 + 3] = 0;
    } else {
      logoPixelCount++;
      // Smooth anti-aliased opacity curve
      const alpha = Math.min(255, Math.round((dist - 5) * 3.5));

      // White logo for Dark Mode (#FFFFFF)
      whiteBuffer[i * 4] = 255;
      whiteBuffer[i * 4 + 1] = 255;
      whiteBuffer[i * 4 + 2] = 255;
      whiteBuffer[i * 4 + 3] = alpha;

      // Deep Black logo for Light Mode (#000000) - Maximum Contrast!
      blackBuffer[i * 4] = 0;
      blackBuffer[i * 4 + 1] = 0;
      blackBuffer[i * 4 + 2] = 0;
      blackBuffer[i * 4 + 3] = alpha;
    }
  }

  console.log(`Identified ${logoPixelCount} logo mark & text pixels out of ${width * height} total pixels.`);

  await sharp(whiteBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(whitePath);

  await sharp(blackBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(blackPath);

  console.log('Successfully generated crisp high-contrast logo-white.png and logo-black.png!');
}

processPreciseLogos().catch(console.error);
