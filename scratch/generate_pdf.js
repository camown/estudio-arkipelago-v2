const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function generatePdf() {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const page = await browser.newPage();

  const htmlPath = path.resolve(__dirname, 'architecture_report.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  // Wait for mermaid diagrams to render
  await page.waitForTimeout(1500);

  const outputPath = path.resolve(__dirname, '..', 'ESTUDIO_ARKIPELAGO_SYSTEM_ARCHITECTURE.pdf');

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '12mm',
      right: '12mm'
    }
  });

  console.log('PDF Successfully Generated at:', outputPath);
  await browser.close();
}

generatePdf().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
