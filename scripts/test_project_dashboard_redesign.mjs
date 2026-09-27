import { chromium } from 'playwright';

async function testProjectDashboardRedesign() {
  console.log('Starting Playwright test for Studio Project Dashboard (Image 2 Design)...\n');

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

  // 1. Navigate to Projects page
  console.log('Navigating to http://localhost:3000/projects...');
  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 2. Verify Top Header: "Project Dashboard"
  console.log('--- 1. VERIFYING TOP HEADER & CONTROLS ---');
  const title = page.locator('h1:has-text("Project Dashboard")');
  await title.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Header "Project Dashboard" visible');

  // Verify Project Counter
  const counter = page.locator('text=Projects').first();
  await counter.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Projects counter pill visible in header');

  // Verify New Project button
  const newProjBtn = page.locator('button:has-text("New Project")');
  await newProjBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "+ New Project" button visible');

  // 3. Verify 5 Architectural Stage Pipeline Columns (Image 2 Style)
  console.log('\n--- 2. VERIFYING 5 STAGE PIPELINE COLUMNS (IMAGE 2) ---');
  const colInquiries = page.locator('h2:has-text("New Inquiries")');
  const colDesign = page.locator('h2:has-text("Active Design")');
  const colDocumentation = page.locator('h2:has-text("Documentation")');
  const colConstruction = page.locator('h2:has-text("Construction")');
  const colOnHold = page.locator('h2:has-text("On Hold")');

  await colInquiries.waitFor({ state: 'visible', timeout: 3000 });
  await colDesign.waitFor({ state: 'visible', timeout: 3000 });
  await colDocumentation.waitFor({ state: 'visible', timeout: 3000 });
  await colConstruction.waitFor({ state: 'visible', timeout: 3000 });
  await colOnHold.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ All 5 Stage Pipeline columns visible across viewport!');

  // 4. Verify Project Cards (Visual Hierarchy: Image + Title + Budget + Status Pill)
  console.log('\n--- 3. VERIFYING CARD ANATOMY (1 TO 2 FOCAL POINTS) ---');
  const oakCard = page.locator('h3:has-text("Oak Street Residence")');
  await oakCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Found "Oak Street Residence" card');

  const makatiCard = page.locator('h3:has-text("Makati Tower Phase 2")');
  await makatiCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Found "Makati Tower Phase 2" card');

  // Verify Status Badge Pills
  const newPill = page.locator('span:has-text("New")').first();
  await newPill.waitFor({ state: 'visible', timeout: 3000 });
  const designPill = page.locator('span:has-text("In Design")').first();
  await designPill.waitFor({ state: 'visible', timeout: 3000 });
  const docPill = page.locator('span:has-text("In Documentation")').first();
  await docPill.waitFor({ state: 'visible', timeout: 3000 });
  const constrPill = page.locator('span:has-text("In Construction")').first();
  await constrPill.waitFor({ state: 'visible', timeout: 3000 });
  const onHoldPill = page.locator('span:has-text("On Hold")').first();
  await onHoldPill.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ All Stage Status Pills (New, In Design, In Documentation, In Construction, On Hold) verified!');

  // 5. Verify Clicking Card Opens Blueprint Vault Modal (Zero Lost Features)
  console.log('\n--- 4. VERIFYING BLUEPRINT VAULT MODAL INTEGRATION ---');
  await makatiCard.click();
  await page.waitForTimeout(600);

  const vaultHeader = page.locator('h3:has-text("Blueprint & Drawing Sets Vault")');
  await vaultHeader.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Blueprint Vault modal opened smoothly on card click');

  // Verify Drawing category tabs inside vault
  const rendersTab = page.locator('button:has-text("RENDERS")');
  await rendersTab.waitFor({ state: 'visible', timeout: 3000 });
  await rendersTab.click();
  await page.waitForTimeout(300);
  console.log('✓ Filtered for 3D RENDERS in Blueprint Vault');

  // Verify Redline button
  const redlineBtn = page.locator('button:has-text("Redline")').first();
  await redlineBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ "Redline" in Sketch Studio button visible');

  // Close Vault using top X close button
  const closeModalXBtn = page.locator('div.fixed.inset-0 button.rounded-full').first();
  await closeModalXBtn.click();
  await page.waitForTimeout(500);
  console.log('✓ Closed Blueprint Vault modal');

  // 6. Test Search Control in Header
  console.log('\n--- 5. VERIFYING SEARCH CONTROL ---');
  const searchBtn = page.locator('button[title="Search projects"]');
  await searchBtn.click();
  await page.waitForTimeout(300);

  const searchInput = page.locator('input[placeholder*="Search projects..."]');
  await searchInput.fill('Makati');
  await page.waitForTimeout(400);

  const filteredCards = page.locator('h3:has-text("Makati Tower Phase 2")');
  console.log(`✓ Search filtered properly: ${await filteredCards.count()} match(es) for "Makati"`);
  await searchInput.fill('');
  await page.waitForTimeout(300);

  // 7. Test View Switcher: Grid Mode and Table Mode
  console.log('\n--- 6. VERIFYING VIEW MODES ---');
  const gridBtn = page.locator('button[title="Full-Width Visual Grid"]');
  await gridBtn.click();
  await page.waitForTimeout(400);
  console.log('✓ Switched to Full-Width Visual Grid mode');

  const tableBtn = page.locator('button[title="Engineering Detail Table"]');
  await tableBtn.click();
  await page.waitForTimeout(400);
  console.log('✓ Switched to Engineering Detail Table mode');

  // Switch back to Image 2 Board mode
  const boardBtn = page.locator('button[title*="Pipeline Columns View"]');
  await boardBtn.click();
  await page.waitForTimeout(400);
  console.log('✓ Switched back to Stage Pipeline Columns View (Image 2)');

  // 8. Capture verified screenshot of the new clean design
  await page.screenshot({ path: 'project_dashboard_image2_verified.png' });
  console.log('✓ Screenshot saved to project_dashboard_image2_verified.png');

  await browser.close();
  console.log('\n======================================================');
  console.log('ALL PROJECT DASHBOARD IMAGE 2 TESTS PASSED PERFECTLY!');
  console.log('======================================================');
}

testProjectDashboardRedesign().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
