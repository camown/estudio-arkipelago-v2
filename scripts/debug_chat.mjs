import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/chat');
  await page.click('button:has-text("Chat")');
  await page.waitForTimeout(500);

  const threadName = await page.locator('h2').allInnerTexts();
  console.log('Headers:', threadName);

  await page.click('button:has-text("Add Member")');
  await page.waitForTimeout(500);

  const modal = page.locator('.fixed:has(h3:has-text("Add Members to Thread"))');
  console.log('Modal visible:', await modal.isVisible());

  const membersInModal = await modal.locator('h4').allInnerTexts();
  console.log('Members in modal:', membersInModal);

  // Check which members are marked "In thread"
  const inThreadSpans = await modal.locator('span:has-text("In thread")').count();
  console.log('Count of "In thread" badges:', inThreadSpans);

  // Click on Foreman Danilo
  const danilo = modal.locator('div:has(> div > div > h4:has-text("Foreman Danilo"))').last();
  console.log('Danilo exists:', await danilo.isVisible());
  await danilo.click();
  await page.waitForTimeout(300);

  const submitBtn = modal.locator('button:has-text("Add Selected Members")');
  console.log('Submit disabled:', await submitBtn.getAttribute('disabled'));

  await browser.close();
}

debug().catch(console.error);
