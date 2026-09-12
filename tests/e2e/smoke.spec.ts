import { test, expect } from '@playwright/test';

test.describe('LegalHubMumbai Smoke Tests', () => {
  test('should load the technical verification home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h3')).toContainText('LegalHubMumbai');
    await expect(page.locator('text=Production foundation initialized.')).toBeVisible();
  });

  test('should load lawyer discovery route stub', async ({ page }) => {
    await page.goto('/find-lawyer');
    await expect(page.locator('text=Lawyer Discovery & Search')).toBeVisible();
  });

  test('should load admin route stub', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Admin Governance & Operations Control Panel')).toBeVisible();
  });
});
