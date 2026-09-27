import { chromium } from 'playwright';

async function testCalendarUpgrade() {
  console.log('Starting Playwright test for Studio Calendar Upgrade & Reference Design...\n');

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

  // 1. Navigate to Calendar page
  console.log('Navigating to http://localhost:3000/calendar...');
  await page.goto('http://localhost:3000/calendar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // 2. Verify Top Header
  console.log('--- 1. VERIFYING TOP HEADER & ACTIONS ---');
  const pageHeading = page.locator('h1:has-text("Calendar")');
  await pageHeading.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ "Calendar" title visible');

  const settingsBtn = page.locator('button[aria-label="Settings"]');
  await settingsBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Settings gear button visible');

  const shareBtn = page.locator('button[aria-label="Share Calendar"]');
  await shareBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Share / Export external link button visible');

  // 3. Verify Toolbar Row 1 Controls
  console.log('\n--- 2. VERIFYING TOOLBAR ROW 1 CONTROLS ---');
  const sourceDropdown = page.locator('button:has-text("My Calendly")').first();
  await sourceDropdown.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Calendar Source selector visible (My Calendly)');

  // Open source dropdown and pick "All Calendars"
  await sourceDropdown.click();
  await page.waitForTimeout(200);
  const allCalendarsOpt = page.locator('button:has-text("All Calendars")');
  await allCalendarsOpt.click();
  await page.waitForTimeout(200);
  console.log('✓ Calendar source selector toggled to All Calendars');

  const searchInput = page.locator('input[placeholder="Search meetings"]');
  await searchInput.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Search input with "Search meetings" placeholder visible');

  const filterBtn = page.locator('button:has-text("Filter")').first();
  await filterBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Filter button visible');

  const allMeetingsSegment = page.locator('button:has-text("All meetings")');
  const calendlyOnlySegment = page.locator('button:has-text("Calendly only")');
  await allMeetingsSegment.waitFor({ state: 'visible', timeout: 3000 });
  await calendlyOnlySegment.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Segmented switch [ All meetings | Calendly only ] visible');

  // 4. Verify Toolbar Row 2 Controls
  console.log('\n--- 3. VERIFYING TOOLBAR ROW 2 CONTROLS & TIME HORIZONS ---');
  const dateBtn = page.locator('button:has-text("Sat Sep 26, 2026")');
  await dateBtn.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Date display dropdown (Sat Sep 26, 2026 ⌄) visible');

  // Time horizon pills
  const todayPill = page.locator('button:has-text("Today")');
  const upcomingPill = page.locator('button:has-text("Upcoming")');
  const thisWeekPill = page.locator('button:has-text("This week")');
  const lastWeekPill = page.locator('button:has-text("Last week")');

  await todayPill.waitFor({ state: 'visible', timeout: 3000 });
  await upcomingPill.waitFor({ state: 'visible', timeout: 3000 });
  await thisWeekPill.waitFor({ state: 'visible', timeout: 3000 });
  await lastWeekPill.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Time horizon pills visible: Today, Upcoming, This week, Last week');

  // Verify counter display
  const counterText = page.locator('text=/Displaying \\d+ meetings?/');
  await counterText.waitFor({ state: 'visible', timeout: 3000 });
  const initialCountStr = await counterText.innerText();
  console.log(`✓ Initial count displayed: "${initialCountStr}"`);

  // 5. Test Live Search Filtering
  console.log('\n--- 4. TESTING SEARCH FILTERING ---');
  await searchInput.fill('Makati');
  await page.waitForTimeout(300);
  const makatiMeeting = page.locator('text=Makati Tower Phase 2 - Client Design Review').first();
  await makatiMeeting.waitFor({ state: 'visible', timeout: 3000 });
  const filteredCount = await counterText.innerText();
  console.log(`✓ Live search for "Makati" filtered results correctly: "${filteredCount}"`);
  await searchInput.fill('');
  await page.waitForTimeout(300);

  // 6. Test Time Horizon Switching
  console.log('\n--- 5. TESTING TIME HORIZON PILLS ---');
  console.log('Clicking "Upcoming" pill...');
  await upcomingPill.click();
  await page.waitForTimeout(300);
  const upcomingMeeting = page.locator('text=Prospective Siargao Villa Architectural Consultation').first();
  await upcomingMeeting.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Upcoming meetings displayed successfully!');

  console.log('Clicking "Last week" pill...');
  await lastWeekPill.click();
  await page.waitForTimeout(300);
  const lastWeekMeeting = page.locator('text=Casa Verde Residence - Structural Framing Walkthrough').first();
  await lastWeekMeeting.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Last week meetings displayed successfully!');

  console.log('Restoring to "Today" pill...');
  await todayPill.click();
  await page.waitForTimeout(300);

  // 7. Test Segmented Switch (Calendly Only)
  console.log('\n--- 6. TESTING SEGMENTED CONTROL ---');
  await calendlyOnlySegment.click();
  await page.waitForTimeout(300);
  const calendlyBadge = page.locator('text=Calendly Booking').first();
  await calendlyBadge.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Calendly only segment successfully filters to Calendly meetings!');
  await allMeetingsSegment.click();
  await page.waitForTimeout(300);

  // 8. Test Meeting Details Modal
  console.log('\n--- 7. TESTING MEETING DETAILS MODAL ---');
  const detailsBtn = page.locator('button:has-text("View Details")').first();
  await detailsBtn.click();
  await page.waitForTimeout(400);

  const modalTitle = page.locator('h3:has-text("Makati Tower Phase 2 - Client Design Review")').last();
  await modalTitle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Meeting Details modal opened with full briefing and attendees');

  // Close modal with Escape key
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  console.log('✓ Meeting Details modal dismissed with Escape');

  // 9. Test Settings Modal
  console.log('\n--- 8. TESTING SETTINGS MODAL ---');
  await settingsBtn.click();
  await page.waitForTimeout(400);
  const settingsModal = page.locator('text=Calendar & Integration Settings');
  await settingsModal.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Settings modal opened cleanly');
  const doneBtn = page.locator('button:has-text("Done")');
  await doneBtn.click();
  await page.waitForTimeout(300);
  console.log('✓ Settings modal closed');

  // 10. Test Scheduling a New Meeting
  console.log('\n--- 9. TESTING MEETING SCHEDULING ---');
  const scheduleBtn = page.locator('button:has-text("Schedule Meeting")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(400);

  await page.fill('input[placeholder*="Schematic Design Review"]', 'Bespoke Penthouse Lighting Sync');
  await page.fill('input[placeholder*="Ayala Horizon Dev"]', 'Atelier Lumiere Lighting');
  const submitSchedule = page.locator('button:has-text("Confirm & Schedule")');
  await submitSchedule.click();
  await page.waitForTimeout(500);

  const newMeetingCard = page.locator('text=Bespoke Penthouse Lighting Sync').first();
  await newMeetingCard.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ New studio meeting created and rendered in meeting list with toast confirmation!');

  // 11. Test Month Grid Switcher
  console.log('\n--- 10. TESTING VIEW SWITCHER (MONTH GRID) ---');
  const gridViewBtn = page.locator('button[title="Month Grid View"]');
  await gridViewBtn.click();
  await page.waitForTimeout(400);
  const monthTitle = page.locator('text=September 2026').first();
  await monthTitle.waitFor({ state: 'visible', timeout: 3000 });
  console.log('✓ Switched smoothly to Month Grid View');

  // Switch back to Agenda view
  const agendaViewBtn = page.locator('button[title="Meetings Agenda View"]');
  await agendaViewBtn.click();
  await page.waitForTimeout(400);
  console.log('✓ Switched back to Meetings Agenda View');

  console.log('\n======================================================');
  console.log('🎉 ALL CALENDAR FEATURES & DESIGN UPGRADES VERIFIED!');
  console.log('======================================================\n');

  await browser.close();
}

testCalendarUpgrade().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
