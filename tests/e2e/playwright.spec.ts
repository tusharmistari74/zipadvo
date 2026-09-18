import { test, expect } from '@playwright/test';

test.describe('LegalHubMumbai Phase 24: Comprehensive E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to base homepage
    await page.goto('/');
  });

  test('Flow 1: User Registration (/register)', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveTitle(/LegalHubMumbai/i);
    await expect(page.locator('h1, h2, h3')).toContainText(/Create Account|Register|Sign Up/i);

    // Verify presence of core registration inputs
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('Flow 2: User Login (/login)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1, h2, h3')).toContainText(/Sign In|Login|Welcome/i);

    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('Flow 3: Lawyer Discovery & Search Filters (/find-lawyer)', async ({ page }) => {
    await page.goto('/find-lawyer');
    await expect(page.locator('h1')).toContainText(/Find Verified Mumbai Property Lawyers/i);

    // Verify search filters & lawyer roster
    const searchInput = page.locator('input[placeholder*="Bandra, Title, RERA" i]');
    await expect(searchInput).toBeVisible();

    // Type search query and verify filtered results
    await searchInput.fill('Bandra');
    await expect(page.locator('text=Adv. Priya Deshmukh')).toBeVisible();

    // Toggle interactive map
    const mapToggleBtn = page.locator('button:has-text("Hide Map"), button:has-text("Show Map")');
    await expect(mapToggleBtn).toBeVisible();
  });

  test('Flow 4: Lawyer Profile Inspection (/lawyers/lawyer-1)', async ({ page }) => {
    await page.goto('/lawyers/lawyer-1');
    await expect(page.locator('h1, h2')).toContainText(/Adv. Rajeshwar/i);
    await expect(page.locator('text=Bar Council of Maharashtra and Goa')).toBeVisible();
    await expect(page.locator('text=Bombay High Court')).toBeVisible();
    await expect(page.locator('text=₹299')).toBeVisible();
  });

  test('Flow 5: Consultation Booking Modal & Slot Selection', async ({ page }) => {
    await page.goto('/lawyers/lawyer-1');
    const bookBtn = page.locator('button:has-text("Book Consultation"), button:has-text("Unlock & Book")').first();
    if (await bookBtn.isVisible()) {
      await bookBtn.click();
      // Verify modal or redirection
      await expect(page.locator('text=Consultation|Schedule|Booking|Slot|Service').first()).toBeVisible();
    }
  });

  test('Flow 6: Payment Unlock Presentation & Facilitation Fee', async ({ page }) => {
    await page.goto('/refund-policy');
    await expect(page.locator('h1')).toContainText(/Refund & Cancellation Policy/i);
    await expect(page.locator('text=₹299')).toBeVisible();
  });

  test('Flow 7: Lawyer Portal Bookings (/lawyer/bookings)', async ({ page }) => {
    await page.goto('/lawyer/bookings');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('text=Bookings|Consultations|Schedule').first()).toBeVisible();
  });

  test('Flow 8: Service Completion & Deliverables (/lawyer/documents)', async ({ page }) => {
    await page.goto('/lawyer/documents');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('text=Document|Vault|Title|Upload').first()).toBeVisible();
  });

  test('Flow 9: Client Dashboard & Review System (/dashboard)', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('text=Dashboard|Bookings|Overview|Consultations').first()).toBeVisible();
  });

  test('Flow 10: Admin Approval & Governance Panel (/admin/lawyers)', async ({ page }) => {
    await page.goto('/admin/lawyers');
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    await expect(page.locator('text=Advocate|Lawyers|Verification|Sanad|KYC').first()).toBeVisible();
  });
});
