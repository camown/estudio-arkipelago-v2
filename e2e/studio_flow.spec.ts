import { test, expect } from '@playwright/test';

test.describe('Estudio Arkipelago - Full Studio Lifecycle & Device Responsiveness', () => {

  test('Desktop Studio Flow: Login, Dashboard KPIs, Clock-In, and Projects Hub', async ({ page }) => {
    // 1. Visit login
    await page.goto('/login');
    await expect(page).toHaveTitle(/ESTUDIO ARKIPELAGO/i);

    // 2. Perform authentication with partner account
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('partner@arkipelago.ph');
    await passwordInput.fill('admin');

    const submitBtn = page.getByRole('button', { name: /enter studio|sign in|login|access/i }).first();
    await submitBtn.click();

    // 3. Confirm redirected to dashboard and verify greeting
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/Mabuhay/i).first()).toBeVisible({ timeout: 10000 });

    // 4. Verify Desktop Sidebar is visible
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // 5. Navigate to HR Time Tracker
    await page.goto('/hr');
    await expect(page).toHaveURL(/hr/);
    await expect(page.getByText(/TIME TRACKING|CLOCK IN|LEDGER/i).first()).toBeVisible();

    // 6. Navigate to Projects Hub
    await page.goto('/projects');
    await expect(page).toHaveURL(/projects/);
    await expect(page.getByText(/PROJECTS|DRAWING SETS|CONSTRUCTION/i).first()).toBeVisible();

    // 7. Navigate to Sketch Studio
    await page.goto('/sketch');
    await expect(page).toHaveURL(/sketch/);
    await expect(page.locator('canvas, [data-canvas="true"], .sketch-canvas').first()).toBeAttached();
  });

  test('Mobile Responsiveness Flow: Verify Bottom Navigation & Touch Layout', async ({ page }) => {
    // Emulate iPhone / Mobile screen (390x844)
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('partner@arkipelago.ph');
    await passwordInput.fill('admin');

    const submitBtn = page.getByRole('button', { name: /enter studio|sign in|login|access/i }).first();
    await submitBtn.click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText(/Mabuhay/i).first()).toBeVisible({ timeout: 10000 });

    const mobileBottomNav = page.locator('nav.fixed.bottom-0');
    await expect(mobileBottomNav).toBeVisible();

    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();
  });

  test('Dashboard Customizer, This Week Schedule Widget & Weekly Calendar Navigation', async ({ page }) => {
    // 1. Authenticate
    await page.goto('/login');
    await page.locator('input[type="email"], input[name="email"]').first().fill('partner@arkipelago.ph');
    await page.locator('input[type="password"], input[name="password"]').first().fill('admin');
    await page.getByRole('button', { name: /enter studio|sign in|login|access/i }).first().click();

    await expect(page).toHaveURL(/dashboard/);

    // 2. Verify "Customize Layout" button & modal
    const customizeBtn = page.getByRole('button', { name: /customize layout|presets/i });
    await expect(customizeBtn).toBeVisible();
    await customizeBtn.click();

    // Verify modal is open
    await expect(page.getByText('Customize Studio Dashboard')).toBeVisible();
    await expect(page.getByText('Quick Presets:')).toBeVisible();

    // Click 'Drafting Lead' preset and apply
    await page.getByRole('button', { name: 'Drafting Lead' }).click();
    await page.getByRole('button', { name: /apply changes/i }).click();

    // Modal should close
    await expect(page.getByText('Customize Studio Dashboard')).toBeHidden();

    // 2b. Test On-Canvas "Arrange Dashboard" (Interactive drag, resize handles, and container guide)
    const arrangeBtn = page.getByRole('button', { name: /arrange dashboard/i });
    await expect(arrangeBtn).toBeVisible();
    await arrangeBtn.click();

    // Canvas Edit Mode notice banner should appear
    await expect(page.getByText(/Canvas Edit Mode Active/i)).toBeVisible();

    // Drag-to-resize handles should be rendered on cards
    const resizeHandle = page.locator('[aria-label="Drag to resize column width"]').first();
    await expect(resizeHandle).toBeAttached();

    // Test Putting Project 1-by-1 on canvas
    const projectSelect = page.getByLabel(/choose project to put on canvas/i);
    await projectSelect.selectOption('proj-004');
    await expect(page.getByRole('heading', { name: /Siargao Eco Villa Complex/i })).toBeVisible();

    // Lock layout
    const lockBtn = page.getByRole('button', { name: /lock layout|done editing/i }).first();
    await lockBtn.click();
    await expect(page.getByText(/Canvas Edit Mode Active/i)).toBeHidden();

    // 3. Verify This Week's Schedule Widget on Dashboard
    await expect(page.getByText(/THIS WEEK'S SCHEDULE & TO-DO/i)).toBeVisible();
    // Verify 7-day selector strip has day pills
    const dayPills = page.locator('button:has-text("MON"), button:has-text("TUE"), button:has-text("WED")');
    await expect(dayPills.first()).toBeVisible();

    // 4. Navigate to Calendar page
    await page.goto('/calendar');
    await expect(page).toHaveURL(/calendar/);

    // 5. Verify Weekly Calendar view is active by default
    const weekBtn = page.getByRole('button', { name: 'Week', exact: true });
    await expect(weekBtn).toBeVisible();

    // Verify 7 day columns exist with day names
    await expect(page.getByText('MON').first()).toBeVisible();
    await expect(page.getByText('FRI').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'This Week', exact: true })).toBeVisible();

    // 6. Test view mode switching
    const agendaBtn = page.getByRole('button', { name: 'Agenda', exact: true });
    await agendaBtn.click();
    await expect(page.getByText(/Displaying \d+ meeting/i)).toBeVisible();

    const monthBtn = page.getByRole('button', { name: 'Month', exact: true });
    await monthBtn.click();
    await expect(page.getByText('Sun').first()).toBeVisible();
    await expect(page.getByText('Sat').first()).toBeVisible();
  });
});

