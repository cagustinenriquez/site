import { test, expect } from '@playwright/test';

// Serves one post from a fake API so the test doesn't depend on live content.
const POST = {
  id: '1',
  slug: 'code-and-diagrams',
  title: 'Code and diagrams',
  excerpt: 'A post with every kind of code block',
  tags: ['test'],
  date: '2026-10-28T12:00:00',
  content: [
    'Run `npm install` first.',
    '',
    '```python',
    'def greet(name):',
    '    return f"hello {name}"',
    '```',
    '',
    '```mermaid',
    'graph TD',
    '  A[Frontend] --> B[API]',
    '```',
  ].join('\n'),
};

test.beforeEach(async ({ page }) => {
  await page.route(
    (url) => url.pathname === `/posts/${POST.slug}`,
    (route) =>
      route.request().resourceType() === 'document'
        ? route.fallback()
        : route.fulfill({
            contentType: 'application/json',
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(POST),
          }),
  );
});

test('renders inline code, highlighted code and a mermaid diagram', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(`/blog/${POST.slug}`);
  await expect(page.locator('h1:has-text("Code and diagrams")')).toBeVisible();

  await expect(page.locator('p code', { hasText: 'npm install' })).toBeVisible();
  // highlight.js wraps keywords in spans
  await expect(page.locator('pre code .hljs-keyword', { hasText: 'def' })).toBeVisible();
  // mermaid replaces the diagram source with an SVG
  await expect(page.locator('.mermaid svg')).toBeVisible();
  await expect(page.locator('.mermaid svg')).toContainText('Frontend');

  expect(errors).toEqual([]);
});

test('copy button copies the code', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(`/blog/${POST.slug}`);

  await page.locator('button:has-text("Copy")').click();
  await expect(page.locator('button:has-text("✓ Copied")')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe('def greet(name):\n    return f"hello {name}"');

  // The diagram survives the re-render triggered by the copy button
  await expect(page.locator('.mermaid svg')).toBeVisible();
});
