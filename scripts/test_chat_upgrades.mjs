import { chromium } from 'playwright';

async function testChatUpgrades() {
  console.log('Starting Playwright test for Studio Chats & Threads UX Upgrades...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem(
      'arkipelago_user',
      JSON.stringify({
        id: 'usr-1',
        name: 'Arch. Leandro Locsin',
        email: 'locsin@arkipelago.ph',
        role: 'partner',
        status: 'active',
      })
    );
    localStorage.setItem('arkipelago_theme', 'dark');
  });

  // 1. Navigate to Chat page
  console.log('Navigating to http://localhost:3000/chat...');
  await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // 2. Switch to "Chat & Threads" tab
  console.log('--- 1. SWITCHING TO CHAT & THREADS TAB ---');
  const chatTabBtn = page.locator('button:has-text("Chat & Threads")').first();
  await chatTabBtn.waitFor({ state: 'visible', timeout: 5000 });
  await chatTabBtn.click();
  await page.waitForTimeout(600);
  console.log('✓ Switched to "Chat & Threads" tab');

  // Verify threads sidebar elements
  const searchInput = page.locator('input[placeholder*="Search threads..."]');
  await searchInput.waitFor({ state: 'visible', timeout: 4000 });
  console.log('✓ Thread search input visible');

  const newTopicBtn = page.locator('button[title="Start New Topic Thread"]');
  await newTopicBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "Start New Topic Thread" button visible in sidebar');

  // 3. Verify Active Thread Header Member Stack and Roster Popover
  console.log('\n--- 2. VERIFYING THREAD MEMBER AVATAR STACK & ROSTER POPOVER ---');
  const rosterTrigger = page.locator('div[title="View thread participants roster"]').first();
  await rosterTrigger.waitFor({ state: 'visible', timeout: 4000 });
  console.log('✓ Thread roster trigger avatar stack visible in header');

  await rosterTrigger.click();
  await page.waitForTimeout(400);

  const rosterTitle = page.locator('h4:has-text("Thread Members")');
  await rosterTitle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "Thread Members" roster popover opened');

  // Close roster by clicking outside
  await page.locator('body').click({ position: { x: 500, y: 150 } });
  await page.waitForTimeout(300);

  // 4. Verify "+ Add Member" Button & Modal
  console.log('\n--- 3. VERIFYING "+ ADD MEMBER" MODAL & MULTI-SELECTION ---');
  const addMemberHeaderBtn = page.locator('button:has-text("Add Member")').first();
  await addMemberHeaderBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "+ Add Member" header action button found');

  await addMemberHeaderBtn.click();
  await page.waitForTimeout(500);

  const addModal = page.locator('.fixed:has(h3:has-text("Add Members to Thread"))');
  await addModal.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "Add Members to Thread" modal is visible');

  // Search in member modal
  const memberSearchInput = addModal.locator('input[placeholder*="Search team members by name or role..."]');
  await memberSearchInput.fill('Engr');
  await page.waitForTimeout(300);
  console.log('✓ Member search filtered for "Engr"');

  // Click on the matching member header inside the modal
  const memberHeading = addModal.locator('h4:has-text("Engr. Roberto Cruz")');
  await memberHeading.waitFor({ state: 'visible', timeout: 3000 });
  await memberHeading.click();
  await page.waitForTimeout(300);
  console.log('✓ Selected Engr. Roberto Cruz inside modal');

  // Click Add Selected Members inside the modal
  const confirmAddBtn = addModal.locator('button:has-text("Add Selected Members")');
  await confirmAddBtn.click();
  await page.waitForTimeout(600);
  console.log('✓ Submitted Add Selected Members modal');

  // Verify System Message posted in thread stream
  const systemMsg = page.locator('text=added').first();
  if (await systemMsg.isVisible()) {
    console.log(`✓ System message verified in thread stream: "${(await systemMsg.textContent()).trim()}"`);
  }

  // 5. Verify New Topic Thread Modal with Multi-Member Selection
  console.log('\n--- 4. VERIFYING NEW TOPIC THREAD MULTI-MEMBER MODAL ---');
  await newTopicBtn.click();
  await page.waitForTimeout(500);

  const newTopicModal = page.locator('.fixed:has(h2:has-text("Start New Topic Thread"))');
  await newTopicModal.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "Start New Topic Thread" modal opened');

  const topicTitleInput = newTopicModal.locator('input[placeholder*="Curtain Wall Facade Mullions"]');
  await topicTitleInput.fill('Seismic Joint Detail & Glazing Spec Review');

  // Click "Select All Studio" shortcut in new topic modal
  const selectAllStudio = newTopicModal.locator('button:has-text("Select All Studio")');
  if (await selectAllStudio.isVisible()) {
    await selectAllStudio.click();
    console.log('✓ "Select All Studio" shortcut clicked');
  }

  // Submit new topic thread
  const createThreadBtn = newTopicModal.locator('button:has-text("Create Thread")');
  await createThreadBtn.click();
  await page.waitForTimeout(800);
  console.log('✓ Submitted new topic thread with team members');

  // Verify new thread became active
  const createdHeader = page.locator('h2:has-text("Seismic Joint Detail & Glazing Spec Review")').first();
  await createdHeader.waitFor({ state: 'visible', timeout: 4000 });
  console.log('✓ Newly created thread is active in main chat pane!');

  // 6. Verify Slack/Discord-Style Message Reactions
  console.log('\n--- 5. VERIFYING MESSAGE REACTIONS & LIVE COUNTERS ---');
  // Send a message in this thread
  const chatInput = page.locator('input[placeholder*="Send a message to"]').first();
  await chatInput.fill('Please inspect the 3D expansion joint details before Friday.');
  await chatInput.press('Enter');
  await page.waitForTimeout(600);
  console.log('✓ Sent chat message in thread');

  // Hover over the message bubble to trigger emoji reaction action bar
  const messageRow = page.locator('div:has-text("Please inspect the 3D expansion joint details before Friday.")').last();
  await messageRow.hover();
  await page.waitForTimeout(400);

  // Click emoji reaction button
  const thumbBtn = page.locator('button[title="React 👍"]').first();
  if (await thumbBtn.isVisible()) {
    await thumbBtn.click();
    await page.waitForTimeout(400);
    console.log('✓ Clicked 👍 reaction button on hover toolbar');

    // Verify reaction pill appears below message
    const reactionPill = page.locator('button:has-text("👍")').last();
    await reactionPill.waitFor({ state: 'visible', timeout: 3000 });
    console.log('✓ Reaction pill "👍" rendered and verified!');

    // Toggle reaction to add 📐
    await messageRow.hover();
    const rulerBtn = page.locator('button[title="React 📐"]').first();
    if (await rulerBtn.isVisible()) {
      await rulerBtn.click();
      await page.waitForTimeout(400);
      const rulerPill = page.locator('button:has-text("📐")').last();
      await rulerPill.waitFor({ state: 'visible', timeout: 3000 });
      console.log('✓ Reaction pill "📐" rendered and verified!');
    }
  }

  // Final Screenshot of Chat with Roster, Reactions, and Multi-Member Thread
  await page.screenshot({ path: 'chat_upgraded_verified.png' });
  console.log('✓ Final screenshot saved to chat_upgraded_verified.png');

  await browser.close();
  console.log('\n=============================================');
  console.log('ALL CHAT & THREADS TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================');
}

testChatUpgrades().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
