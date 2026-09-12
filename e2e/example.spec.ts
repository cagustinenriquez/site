import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
});

test('can navigate to blog', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Read Blog');
  await page.waitForLoadState('networkidle');
});

test('can enter a single blog post', async ({ page }) => {
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');

  // Click on the first blog post title (h3 inside a link)
  await page.locator('h3').first().click();
  await page.waitForLoadState('networkidle');

  // Verify we're on a blog post page
  await expect(page).toHaveURL(/\/blog\/[^/]+$/);
  await expect(page.locator('article')).toBeVisible();
});

test('can toggle contact dialog', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Click the Contact details button
  await page.click('button:has-text("Contact details")');

  // Verify the contact dialog appears
  await expect(page.locator('text=Summon the Wizard')).toBeVisible();
  await expect(page.locator('text=Agustin Enriquez')).toBeVisible();

  // Click the Close button to close the dialog
  await page.click('button:has-text("Close")');

  // Verify the dialog is closed
  await expect(page.locator('text=Summon the Wizard')).not.toBeVisible();
});
