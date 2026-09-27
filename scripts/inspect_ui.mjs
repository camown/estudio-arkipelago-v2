import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('tests/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Pre-seed localStorage with authenticated architect user
  await page.addInitScript(() => {
    localStorage.setItem(
      'arkipelago_user',
      JSON.stringify({
        id: '1',
        name: 'Leandro Locsin',
        email: 'locsin@arkipelago.ph',
        role: 'Principal Architect',
        status: 'active',
      })
    );
    localStorage.setItem('arkipelago_theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  console.log('Navigating to http://localhost:3000/dashboard (Light Mode)...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take Desktop Light Mode screenshot
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'dashboard-desktop-light.png'),
    fullPage: true,
  });
  console.log('Saved dashboard-desktop-light.png');

  // Test Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('arkipelago_theme', 'dark');
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'dashboard-desktop-dark.png'),
    fullPage: true,
  });
  console.log('Saved dashboard-desktop-dark.png');

  // Test Mobile Viewport (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'dashboard-mobile-dark.png'),
    fullPage: true,
  });
  console.log('Saved dashboard-mobile-dark.png');

  // Mobile Light Mode
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('arkipelago_theme', 'light');
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, 'dashboard-mobile-light.png'),
    fullPage: true,
  });
  console.log('Saved dashboard-mobile-light.png');

  await browser.close();
  console.log('UI inspection screenshots captured successfully!');
}

run().catch((err) => {
  console.error('Inspection failed:', err);
  process.exit(1);
});
