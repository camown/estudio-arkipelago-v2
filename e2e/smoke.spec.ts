import { test, expect } from '@playwright/test';

test.describe('Estudio Arkipelago - Navigation Smoke Tests', () => {
  test('should redirect root to login when unauthenticated', async ({ page }) => {
    await page.goto('/');

    // Verify redirected to login
    await expect(page).toHaveURL(/login|dashboard/);
    await expect(page.getByText(/login|sign in|access|studio/i).first()).toBeVisible();
  });

  test('should load login page with branding and access controls', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/ESTUDIO ARKIPELAGO/i);
    await expect(page.getByText(/login|sign in/i).first()).toBeVisible();
  });
});

