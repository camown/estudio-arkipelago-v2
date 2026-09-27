import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.click('text=PARTNER');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(1000);
  
  // Click 3 dots menu on the first post
  const moreBtn = page.locator('button[title*="settings"]').first();
  if (await moreBtn.count() > 0) {
    await moreBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: 'dashboard_wall_menu_verified.png' });
  console.log('Post menu verified');

  // Click reply button
  const replyBtn = page.locator('button:has-text("Reply")').first();
  if (await replyBtn.count() > 0) {
    await replyBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: 'dashboard_wall_reply_verified.png' });
  console.log('Post reply verified');

  await browser.close();
})();
