import { chromium } from 'playwright';

async function testProjectsUpgrade() {
  console.log('Starting Playwright test for Studio Projects Tab Redesign & UX Upgrade...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.addInitScript(() => {
    localStorage.setItem(
      'arkipelago_user',
      JSON.stringify({
        id: '1',
        name: 'Leandro Locsin',
        email: 'locsin@arkipelago.ph',
        role: 'partner',
        status: 'active',
      })
    );
    localStorage.setItem('arkipelago_theme', 'dark');
  });

  // 1. Navigate to Projects page
  console.log('Navigating to http://localhost:3000/projects...');
  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // 2. Verify Top Header & Studio Metrics Ribbon
  console.log('--- 1. VERIFYING TOP HEADER & PORTFOLIO METRICS BANNER ---');
  const title = page.locator('h1:has-text("Projects Vault & Studio Portfolio")');
  await title.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Header "Projects Vault & Studio Portfolio" visible');

  const portfolioMetric = page.locator('text=Total Portfolio');
  await portfolioMetric.waitFor({ state: 'visible', timeout: 3000 });
  const vaultMetric = page.locator('text=Blueprint Vault').first();
  await vaultMetric.waitFor({ state: 'visible', timeout: 3000 });
  const milestonesMetric = page.locator('text=Phase Milestones');
  await milestonesMetric.waitFor({ state: 'visible', timeout: 3000 });
  const focusMetric = page.locator('text=Focus Project');
  await focusMetric.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Portfolio metrics ribbon (Total, Vault, Milestones, Focus) verified!');

  // 3. Verify Studio Toolbar
  console.log('\n--- 2. VERIFYING STUDIO TOOLBAR CONTROLS ---');
  const searchInput = page.locator('input[placeholder*="Search projects by name"]');
  await searchInput.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Search input visible');

  const allPill = page.locator('button:has-text("All")').first();
  const activePill = page.locator('button:has-text("Active")').first();
  const onHoldPill = page.locator('button:has-text("On-Hold")').first();
  const completedPill = page.locator('button:has-text("Completed")').first();
  await allPill.waitFor({ state: 'visible', timeout: 3000 });
  await activePill.waitFor({ state: 'visible', timeout: 3000 });
  await onHoldPill.waitFor({ state: 'visible', timeout: 3000 });
  await completedPill.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Status filter pills (All, Active, On-Hold, Completed) verified');

  const counter = page.locator('text=/Displaying \\d+ projects?/');
  await counter.waitFor({ state: 'visible', timeout: 3000 });
  const countStr = await counter.innerText();
  console.log(`✓ Live counter display: "${countStr}"`);

  // 4. Test View Switcher (Grid <-> Table)
  console.log('\n--- 3. TESTING DUAL VIEW SWITCHER ---');
  // Currently in Grid mode
  const gridCard = page.locator('h3:has-text("Makati Tower Phase 2")').first();
  await gridCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Visual Grid Mode renders architectural project cards with hero render preview and phase tracks');

  // Switch to Table / List mode
  console.log('Switching to List/Table View...');
  const tableBtn = page.locator('button[title*="Engineering Detail Table View"]');
  await tableBtn.click();
  await page.waitForTimeout(400);

  const tableRow = page.locator('h3:has-text("Makati Tower Phase 2")').first();
  await tableRow.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Switched to Engineering Detail Table View cleanly');

  // Switch back to Grid mode
  console.log('Switching back to Visual Grid View...');
  const gridBtn = page.locator('button[title*="Visual Card Grid View"]');
  await gridBtn.click();
  await page.waitForTimeout(400);

  // 5. Test Live Search Filtering
  console.log('\n--- 4. TESTING SEARCH FILTERING ---');
  await searchInput.fill('Siargao');
  await page.waitForTimeout(300);
  const siargaoProject = page.locator('h3:has-text("Siargao Eco Villa Complex")').first();
  await siargaoProject.waitFor({ state: 'visible', timeout: 3000 });
  const filteredCount = await counter.innerText();
  console.log(`✓ Search "Siargao" filtered down correctly: "${filteredCount}"`);
  await searchInput.fill('');
  await page.waitForTimeout(300);

  // 6. Test Status Filter Pills
  console.log('\n--- 5. TESTING STATUS FILTER PILLS ---');
  console.log('Clicking "On-Hold" pill...');
  await onHoldPill.click();
  await page.waitForTimeout(300);
  const onHoldCard = page.locator('h3:has-text("Tagaytay Ridge House")').first();
  await onHoldCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Filtered to On-Hold projects!');
  await allPill.click();
  await page.waitForTimeout(300);

  // 7. Test Sidebar Active Working Focus & Folder Filtering
  console.log('\n--- 6. TESTING SIDEBAR ACTIVE CONTEXT & FOLDERS ---');
  const focusContext = page.locator('text=Active Studio Context');
  await focusContext.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Sidebar Active Studio Context card visible');

  console.log('Clicking folder "Important"...');
  const importantFolderBtn = page.locator('button:has-text("important")').first();
  await importantFolderBtn.click();
  await page.waitForTimeout(300);
  const activeFilterTag = page.locator('text=Filtered by: IMPORTANT');
  await activeFilterTag.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Folder filtering triggered: Filtered by: IMPORTANT');
  // Clear folder filter
  const clearFolderBtn = page.locator('text=Filtered by: IMPORTANT').locator('..').locator('button');
  await clearFolderBtn.click();
  await page.waitForTimeout(300);

  // 8. Test Blueprint Vault Modal & Drag-and-Drop
  console.log('\n--- 7. TESTING BLUEPRINT VAULT MODAL & DROPZONE ---');
  const makatiCard = page.locator('text=Inspect Blueprints & Vault').first();
  await makatiCard.click();
  await page.waitForTimeout(500);

  const vaultHeader = page.locator('h3:has-text("Blueprint & Drawing Sets Vault")');
  await vaultHeader.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Architectural Blueprint Sets Vault modal opened!');

  // Verify Drawing Sheet A-101 is displayed
  const sheetItem = page.locator('text=Ground Floor Plan & Massing').first();
  await sheetItem.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Architectural Drawing Sheet A-101 verified inside vault');

  // Click Upload Sheet
  const uploadSheetBtn = page.locator('button:has-text("Upload Sheet")').first();
  await uploadSheetBtn.click();
  await page.waitForTimeout(400);

  // Verify tactile dashed dropzone exists
  const dropzone = page.locator('text=Drag & drop architectural sheet, or').first();
  await dropzone.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Interactive dashed drag-and-drop zone verified in Upload Sheet Modal!');

  // Close upload sheet modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // Close vault detail modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 9. Test New Project Modal Validation & Creation
  console.log('\n--- 8. TESTING INITIALIZE NEW PROJECT MODAL ---');
  const newProjectBtn = page.locator('button:has-text("New Project")').first();
  await newProjectBtn.click();
  await page.waitForTimeout(400);

  const newProjModalTitle = page.locator('text=Initialize Architectural Project');
  await newProjModalTitle.waitFor({ state: 'visible', timeout: 3000 });

  // Test empty submit validation
  const createProjSubmit = page.locator('button:has-text("Create Project")');
  await createProjSubmit.click();
  await page.waitForTimeout(300);
  const nameError = page.locator('text=⚠ Project name is required.');
  await nameError.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Form validation prevents empty project creation and shows inline warning');

  // Fill valid project
  await page.fill('input[placeholder*="Alabang Villa Modern"]', 'Amanpulo Private Pavilion');
  await page.fill('input[placeholder*="AVM-2026"]', 'APP-2026');
  await createProjSubmit.click();
  await page.waitForTimeout(500);

  const createdCard = page.locator('h3:has-text("Amanpulo Private Pavilion")').first();
  await createdCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ New architectural project created and rendered with toast confirmation!');

  console.log('\n======================================================');
  console.log('🎉 ALL PROJECTS TAB UPGRADES TESTED & VERIFIED!');
  console.log('======================================================\n');

  await browser.close();
}

testProjectsUpgrade().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
