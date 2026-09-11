import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  expect(page).toHaveTitle(/Site/);
});
