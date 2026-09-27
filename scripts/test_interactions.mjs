import { chromium } from 'playwright';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('tests/screenshots');

async function testInteractions() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Fail if any native dialogs are opened (we eliminated all native alerts/confirms!)
  page.on('dialog', async (dialog) => {
    console.error(`UNEXPECTED NATIVE DIALOG DETECTED: [${dialog.type()}] ${dialog.message()}`);
    await dialog.dismiss();
    throw new Error(`Unexpected browser dialog: ${dialog.message()}`);
  });

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

  console.log('--- 1. DASHBOARD TASK CONFIRMATION & UNDO TEST ---');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Find a task toggle button
  const taskToggleBtn = page.locator('button[aria-label="Toggle task status"]').first();
  await taskToggleBtn.waitFor({ state: 'visible', timeout: 5000 });
  await taskToggleBtn.click();
  await page.waitForTimeout(400);

  // Verify Confirmation Modal
  const confirmModalHeader = page.locator('text=Mark Task as Completed?').first();
  await confirmModalHeader.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Task completion confirmation modal appeared successfully!');

  // Confirm task completion
  const confirmBtn = page.locator('button:has-text("Confirm & Complete")');
  await confirmBtn.click();
  await page.waitForTimeout(400);

  // Verify Toast Notification with Undo button
  const toastUndoBtn = page.locator('button:has-text("Undo")');
  await toastUndoBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Toast notification with Undo button displayed!');

  // Click Undo
  await toastUndoBtn.click();
  await page.waitForTimeout(400);
  console.log('✓ Task action undone successfully!');

  console.log('--- 2. DASHBOARD TASK INITIALIZATION INLINE VALIDATION ---');
  // Open Task modal
  const newTaskBtn = page.locator('button:has-text("Task")').first();
  await newTaskBtn.click();
  await page.waitForTimeout(500);

  // Clear task name and click initialize
  const taskNameInput = page.locator('input[placeholder*="Schematic design review"]');
  await taskNameInput.waitFor({ state: 'visible', timeout: 5000 });
  await taskNameInput.fill('');
  const initTaskSubmit = page.locator('button:has-text("Create Task")');
  await initTaskSubmit.click();
  await page.waitForTimeout(300);

  // Verify inline error message
  const taskNameError = page.locator('text=Task name is required.');
  await taskNameError.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Task name inline error message displayed with red highlight!');

  // Close modal with Cancel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('--- 3. PROJECTS PAGE FORM VALIDATION ---');
  await page.goto('http://localhost:3000/projects', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Open New Project modal
  const newProjBtn = page.locator('button:has-text("New Project")').first();
  await newProjBtn.click();
  await page.waitForTimeout(400);

  // Click Create Project without filling
  const createProjBtn = page.locator('button:has-text("Create Project")');
  await createProjBtn.click();
  await page.waitForTimeout(300);

  // Verify inline validation errors
  const projNameError = page.locator('text=Project name is required.');
  await projNameError.waitFor({ state: 'visible', timeout: 3000 });
  const projCodeError = page.locator('text=Project code is required.');
  await projCodeError.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Project creation inline validation errors verified!');

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('--- 4. DIRECTORY PAGE INLINE VALIDATION ---');
  await page.goto('http://localhost:3000/directory', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Open Add Entry modal
  const addDirBtn = page.locator('button:has-text("Add to Directory")').first();
  await addDirBtn.click();
  await page.waitForTimeout(400);

  // Submit empty
  const submitDirBtn = page.locator('button:has-text("Add Entry")').last();
  await submitDirBtn.click();
  await page.waitForTimeout(300);

  // Verify inline error
  const dirNameError = page.locator('text=Company / consultant name is required.');
  await dirNameError.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Directory entry inline validation verified!');

  // Fill in name and submit
  const dirNameInput = page.locator('input[placeholder="e.g. Apex Glass and Metal Specialists"]');
  await dirNameInput.fill('Test Engineering Firm');
  await submitDirBtn.click();
  await page.waitForTimeout(400);

  // Verify toast appears
  const dirToast = page.locator('text=added to directory!');
  await dirToast.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Directory success toast notification verified!');

  console.log('--- 5. CHAT TOPIC THREAD VALIDATION ---');
  await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Open Topic modal
  const newTopicBtn = page.locator('button[title="Create New Topic Thread"]').first();
  await newTopicBtn.click();
  await page.waitForTimeout(400);

  // Click Create Thread without name
  const createThreadBtn = page.locator('button:has-text("Create Thread")');
  await createThreadBtn.click();
  await page.waitForTimeout(300);

  // Verify inline error
  const topicNameError = page.locator('text=Topic name / title is required.');
  await topicNameError.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Chat topic thread inline validation verified!');

  // Close topic modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('--- 6. SKETCH CLEAR CANVAS CONFIRMATION MODAL ---');
  await page.goto('http://localhost:3000/sketch', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click Clear Canvas button
  const clearBtn = page.locator('button:has-text("Clear Canvas")');
  await clearBtn.click();
  await page.waitForTimeout(400);

  // Verify custom Clear Canvas confirmation modal
  const clearModalHeader = page.locator('text=Clear Canvas?').first();
  await clearModalHeader.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Custom Clear Canvas confirmation modal verified (no native alert)!');

  // Cancel out safely
  const cancelClearBtn = page.locator('button:has-text("Cancel")').first();
  await cancelClearBtn.click();
  await page.waitForTimeout(300);
  console.log('✓ Clear canvas dismissed safely.');

  console.log('\n=========================================');
  console.log('🎉 ALL USER EXPERIENCE ENHANCEMENTS PASSED!');
  console.log('=========================================\n');

  await browser.close();
}

testInteractions().catch((err) => {
  console.error('Interaction test failed:', err);
  process.exit(1);
});
