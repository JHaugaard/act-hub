import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads correctly with all key elements', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:8080');

    // Check page title (actual title is "proposal-port")
    await expect(page).toHaveTitle(/proposal-port/);

    // Check main dashboard elements are visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByText('Overview of Proposals')).toBeVisible();

    // Check for proposal status cards
    await expect(page.getByRole('heading', { name: 'In', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pending', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pending Signatures' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Process' })).toBeVisible();

    // Verify Add Proposal button exists
    await expect(page.getByRole('button', { name: /Add Proposal/i })).toBeVisible();

    // Verify navigation sidebar is present
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Proposals$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /^PIs$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sponsors/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /DB Distiller/i })).toBeVisible();
  });

  test('displays statistics correctly', async ({ page }) => {
    await page.goto('http://localhost:8080');

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check that stat cards show numbers (exact text is "0" above "proposals")
    const statCards = page.locator('[data-component-name="Card"]');
    await expect(statCards.first()).toContainText(/\d+/);
  });

  test('loads without errors', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:8080');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for React/JS errors
    expect(errors).toHaveLength(0);
  });
});
