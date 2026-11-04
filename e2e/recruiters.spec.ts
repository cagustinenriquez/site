import { test, expect, type Page, type Route } from '@playwright/test';

// These tests run against a fake API (below) instead of the real backend, so
// they need no credentials and don't depend on whatever data production has.

const USERNAME = 'admin';
const PASSWORD = 'test-password';

interface Recruiter {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  notes: string | null;
  reputation: number;
  total_placements: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

function makeRecruiter(id: number, fields: Partial<Recruiter>): Recruiter {
  return {
    id: String(id),
    name: 'Unnamed',
    company: 'Unknown',
    email: '',
    phone: null,
    linkedin: null,
    notes: null,
    reputation: 0,
    total_placements: 0,
    average_rating: 0,
    created_at: '2026-10-28T12:00:00',
    updated_at: '2026-10-28T12:00:00',
    ...fields,
  };
}

interface Comment {
  id: string;
  recruiter_id: string;
  author: string;
  body: string;
  created_at: string;
}

/**
 * In-memory stand-in for the backend's /auth and /recruiters endpoints.
 * Mirrors the real API: recruiter reads and writes need a valid access token.
 */
class FakeApi {
  recruiters: Recruiter[] = [
    makeRecruiter(1, { name: 'Alice Smith', company: 'Acme', reputation: 5, total_placements: 2, average_rating: 4.5 }),
    makeRecruiter(2, { name: 'Bob Jones', company: 'Globex', reputation: -3, notes: 'Ghosted after the final round' }),
    makeRecruiter(3, { name: 'Carol White', company: 'Acme', reputation: 1, total_placements: 7, average_rating: 3.0 }),
  ];
  private nextId = 4;
  comments: Comment[] = [
    { id: '1', recruiter_id: '2', author: USERNAME, body: 'Never sent feedback', created_at: '2026-10-29T09:30:00' },
  ];
  private nextCommentId = 2;
  /** Set to false to simulate a backend that has no comment endpoints yet */
  commentsEnabled = true;
  private validAccessTokens = new Set<string>();
  private tokenCounter = 0;
  /** Set to true to simulate the backend no longer accepting the user's tokens */
  revokeAll = false;

  private issueTokens() {
    const n = ++this.tokenCounter;
    const access = `access-${n}`;
    this.validAccessTokens.add(access);
    return { access_token: access, refresh_token: `refresh-${n}`, token_type: 'bearer' };
  }

  private isAuthorized(route: Route): boolean {
    const header = route.request().headers()['authorization'] ?? '';
    const token = header.replace(/^Bearer /, '');
    return !this.revokeAll && this.validAccessTokens.has(token);
  }

  async handle(route: Route) {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;
    const body = request.postDataJSON?.() ?? null;
    const json = (status: number, data: unknown) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(data),
      });

    if (method === 'OPTIONS') {
      return route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    if (path === '/auth/login') {
      if (body?.username === USERNAME && body?.password === PASSWORD) {
        return json(200, this.issueTokens());
      }
      return json(401, { detail: 'Invalid username or password' });
    }

    if (path === '/auth/refresh') {
      if (!this.revokeAll && String(body?.refresh_token).startsWith('refresh-')) {
        return json(200, this.issueTokens());
      }
      return json(401, { detail: 'Invalid or expired refresh token' });
    }

    if (!this.isAuthorized(route)) {
      return json(401, { detail: 'Invalid authentication credentials' });
    }

    if (path === '/recruiters' && method === 'GET') {
      const page = Number(url.searchParams.get('page') ?? 1);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      const sort = (url.searchParams.get('sort') ?? 'reputation') as keyof Recruiter;
      const search = url.searchParams.get('search')?.toLowerCase();
      let list = [...this.recruiters];
      if (search) {
        list = list.filter((r) => r.name.toLowerCase().includes(search) || r.company.toLowerCase().includes(search));
      }
      list.sort((a, b) => (b[sort] as number) - (a[sort] as number));
      return json(200, { recruiters: list.slice((page - 1) * limit, page * limit), total: list.length, page, limit });
    }

    if (path === '/recruiters' && method === 'POST') {
      // Like the real API: placements and rating are ignored on create
      const recruiter = makeRecruiter(this.nextId++, { ...body, total_placements: 0, average_rating: 0 });
      this.recruiters.push(recruiter);
      return json(200, recruiter);
    }

    const commentsMatch = path.match(/^\/recruiters\/(\w+)\/comments(?:\/(\w+))?$/);
    if (commentsMatch && this.commentsEnabled) {
      const [, recruiterId, commentId] = commentsMatch;
      if (!this.recruiters.some((r) => r.id === recruiterId)) return json(404, { detail: 'Recruiter not found' });
      if (!commentId && method === 'GET') {
        return json(200, this.comments.filter((c) => c.recruiter_id === recruiterId).reverse());
      }
      if (!commentId && method === 'POST') {
        if (!String(body?.body ?? '').trim()) return json(422, { detail: 'Comment cannot be empty' });
        const comment = {
          id: String(this.nextCommentId++),
          recruiter_id: recruiterId,
          author: USERNAME,
          body: String(body.body).trim(),
          created_at: '2026-11-04T10:00:00',
        };
        this.comments.push(comment);
        return json(200, comment);
      }
      if (commentId && method === 'DELETE') {
        const index = this.comments.findIndex((c) => c.id === commentId && c.recruiter_id === recruiterId);
        if (index === -1) return json(404, { detail: 'Comment not found' });
        this.comments.splice(index, 1);
        return json(200, { detail: 'Comment deleted successfully' });
      }
    }

    const match = path.match(/^\/recruiters\/(\w+)$/);
    if (match) {
      const index = this.recruiters.findIndex((r) => r.id === match[1]);
      if (index === -1) return json(404, { detail: 'Recruiter not found' });
      if (method === 'GET') return json(200, this.recruiters[index]);
      if (method === 'PUT') {
        this.recruiters[index] = { ...this.recruiters[index], ...body };
        return json(200, this.recruiters[index]);
      }
      if (method === 'DELETE') {
        this.recruiters.splice(index, 1);
        return json(200, { detail: 'Recruiter deleted successfully' });
      }
    }

    // Same body FastAPI sends when no route matches
    return json(404, { detail: 'Not Found' });
  }
}

async function useFakeApi(page: Page): Promise<FakeApi> {
  const api = new FakeApi();
  // Only API calls: page navigations to /recruiters on the dev server pass through
  await page.route(
    (url) => /^\/(auth|recruiters)(\/|$)/.test(url.pathname),
    (route) => (route.request().resourceType() === 'document' ? route.fallback() : api.handle(route)),
  );
  return api;
}

async function logIn(page: Page) {
  await page.locator('input[id="username"]').fill(USERNAME);
  await page.locator('input[id="password"]').fill(PASSWORD);
  await page.locator('button:has-text("Unlock the Spellbook")').click();
}

/** Go to a login-only page: get redirected to login, log in, land back on it */
async function visitLoggedIn(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(/\/blog\/login$/);
  await logIn(page);
  await expect(page).toHaveURL(new RegExp(`${path}$`));
}

function formField(page: Page, label: string) {
  return page.locator(`div:has(> label:text-is("${label}"))`).locator('input, textarea');
}

test.describe('Recruiters', () => {
  test.describe('Login required', () => {
    for (const path of ['/recruiters', '/recruiters/1', '/admin/recruiters']) {
      test(`${path} redirects to login when logged out`, async ({ page }) => {
        await useFakeApi(page);
        await page.goto(path);
        await expect(page).toHaveURL(/\/blog\/login$/);
        await expect(page.locator('text=Enter the Spellbook')).toBeVisible();
      });
    }

    test('returns to the original page after logging in', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters/2');
      await expect(page.locator('h1:has-text("Bob Jones")')).toBeVisible();
    });

    test('shows an error for a wrong password', async ({ page }) => {
      await useFakeApi(page);
      await page.goto('/blog/login');
      await page.locator('input[id="username"]').fill(USERNAME);
      await page.locator('input[id="password"]').fill('wrong');
      await page.locator('button:has-text("Unlock the Spellbook")').click();
      await expect(page.locator('text=Invalid username or password')).toBeVisible();
    });

    test('sends you to login when the session is no longer accepted', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters');
      await expect(page.locator('h3:has-text("Alice Smith")')).toBeVisible();

      // e.g. logged in via the admin fallback, then a real user was created
      api.revokeAll = true;
      await page.locator('input[placeholder*="Search"]').fill('acme');

      await expect(page).toHaveURL(/\/blog\/login$/);
      await expect(page.locator('text=Session expired. Please log in again.')).toBeVisible();
    });
  });

  test.describe('List page', () => {
    test('shows recruiters sorted by reputation', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters');
      await expect(page.locator('h1:has-text("Recruiters")')).toBeVisible();
      await expect(page.locator('h3')).toHaveText(['Alice Smith', 'Carol White', 'Bob Jones']);
    });

    test('re-sorts by placements', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters');
      await page.locator('select').selectOption('total_placements');
      await expect(page.locator('h3')).toHaveText(['Carol White', 'Alice Smith', 'Bob Jones']);
    });

    test('searches by company', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters');
      await page.locator('input[placeholder*="Search"]').fill('globex');
      await expect(page.locator('h3')).toHaveText(['Bob Jones']);
    });

    test('opens a profile and goes back', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters');
      await page.locator('a').filter({ has: page.locator('h3:has-text("Bob Jones")') }).click();
      await expect(page).toHaveURL(/\/recruiters\/2$/);
      await expect(page.locator('text=Ghosted after the final round')).toBeVisible();

      await page.locator('button:has-text("Back to Recruiters")').click();
      await expect(page).toHaveURL(/\/recruiters$/);
    });
  });

  test.describe('Add Recruiter links', () => {
    test('the list page opens the add form', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters');
      await page.locator('a:has-text("Add Recruiter")').click();
      await expect(page).toHaveURL(/\/admin\/recruiters\?new=1$/);
      await expect(page.locator('h2:has-text("Add New Recruiter")')).toBeVisible();
    });

    test('the admin dashboard links to the add form', async ({ page }) => {
      await useFakeApi(page);
      // The dashboard also lists blog posts; keep that off the real backend
      await page.route(
        (url) => url.pathname === '/posts',
        (route) =>
          route.request().resourceType() === 'document'
            ? route.fallback()
            : route.fulfill({
                contentType: 'application/json',
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ posts: [], total: 0, page: 1, limit: 10 }),
              }),
      );
      await visitLoggedIn(page, '/recruiters');
      await page.goto('/admin');
      await expect(page.locator('a:has-text("New Post")')).toBeVisible();
      await page.locator('a:has-text("Add Recruiter")').click();
      await expect(page.locator('h2:has-text("Add New Recruiter")')).toBeVisible();
    });
  });

  test.describe('Comments', () => {
    test('shows existing comments and posts a new one', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters/2');
      await expect(page.locator('.rec-comment')).toHaveText([/Never sent feedback/]);

      await page.locator('#rec-comment-input').fill('  Pushed a lowball offer  ');
      await page.locator('button:has-text("Post")').click();

      await expect(page.locator('.rec-comment-body')).toHaveText(['Pushed a lowball offer', 'Never sent feedback']);
      await expect(page.locator('#rec-comment-input')).toHaveValue('');
      expect(api.comments.filter((c) => c.recruiter_id === '2')).toHaveLength(2);
    });

    test('cannot post an empty comment', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters/1');
      await expect(page.locator('text=No comments yet.')).toBeVisible();
      await page.locator('#rec-comment-input').fill('   ');
      await expect(page.locator('button:has-text("Post")')).toBeDisabled();
    });

    test('deletes a comment after confirming', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/recruiters/2');

      await page.locator('button[aria-label="Delete comment"]').click();
      await page.locator('.rec-comment-actions button:has-text("Cancel")').click();
      await expect(page.locator('.rec-comment')).toHaveCount(1);

      await page.locator('button[aria-label="Delete comment"]').click();
      await page.locator('.rec-comment-actions button:has-text("Delete")').click();
      await expect(page.locator('text=No comments yet.')).toBeVisible();
      expect(api.comments).toHaveLength(0);
    });

    test('explains when the server has no comments yet', async ({ page }) => {
      const api = await useFakeApi(page);
      api.commentsEnabled = false;
      await visitLoggedIn(page, '/recruiters/2');
      await expect(page.locator("text=Comments aren't available yet")).toBeVisible();
      await expect(page.locator('#rec-comment-input')).toHaveCount(0);
    });
  });

  test.describe('Admin page', () => {
    test('adds a recruiter', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/admin/recruiters');

      await page.locator('button:has-text("Add Recruiter")').click();
      await formField(page, 'Name').fill('Dana Lee');
      await formField(page, 'Company').fill('Initech');
      await formField(page, 'Reputation').fill('-2');
      await page.locator('button[type="submit"]:has-text("Create")').click();

      await expect(page.locator('tr', { hasText: 'Dana Lee' })).toContainText('-2');
      expect(api.recruiters.find((r) => r.name === 'Dana Lee')?.company).toBe('Initech');
    });

    test('edits a recruiter', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/admin/recruiters');

      await page.locator('tr', { hasText: 'Bob Jones' }).locator('button').first().click();
      await expect(formField(page, 'Name')).toHaveValue('Bob Jones');
      await formField(page, 'Company').fill('Globex Corp');
      await page.locator('button[type="submit"]:has-text("Update")').click();

      await expect(page.locator('tr', { hasText: 'Bob Jones' })).toContainText('Globex Corp');
      expect(api.recruiters.find((r) => r.id === '2')?.company).toBe('Globex Corp');
    });

    test('adds a recruiter with placements and a rating', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/admin/recruiters');

      await page.locator('button:has-text("Add Recruiter")').click();
      await formField(page, 'Name').fill('Eve Park');
      await formField(page, 'Company').fill('Hooli');
      await formField(page, 'Placements').fill('3');
      await formField(page, 'Rating').fill('4.5');
      await page.locator('button[type="submit"]:has-text("Create")').click();

      await expect(page.locator('tr', { hasText: 'Eve Park' })).toContainText('4.5');
      const eve = api.recruiters.find((r) => r.name === 'Eve Park');
      expect(eve?.total_placements).toBe(3);
      expect(eve?.average_rating).toBe(4.5);
    });

    test('edits placements and rating', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/admin/recruiters');

      await page.locator('tr', { hasText: 'Alice Smith' }).locator('button').first().click();
      await expect(formField(page, 'Placements')).toHaveValue('2');
      await expect(formField(page, 'Rating')).toHaveValue('4.5');
      await formField(page, 'Placements').fill('4');
      await formField(page, 'Rating').fill('3.8');
      await page.locator('button[type="submit"]:has-text("Update")').click();

      await expect(page.locator('tr', { hasText: 'Alice Smith' })).toContainText('3.8');
      const alice = api.recruiters.find((r) => r.id === '1');
      expect(alice?.total_placements).toBe(4);
      expect(alice?.average_rating).toBe(3.8);
    });

    test('opens a profile from the table', async ({ page }) => {
      await useFakeApi(page);
      await visitLoggedIn(page, '/admin/recruiters');

      await page.locator('tr', { hasText: 'Bob Jones' }).locator('a:has-text("Bob Jones")').click();
      await expect(page).toHaveURL(/\/recruiters\/2$/);
      await expect(page.locator('text=Ghosted after the final round')).toBeVisible();
    });

    test('deletes a recruiter', async ({ page }) => {
      const api = await useFakeApi(page);
      await visitLoggedIn(page, '/admin/recruiters');

      await page.locator('tr', { hasText: 'Carol White' }).locator('button').last().click();

      await expect(page.locator('tr', { hasText: 'Carol White' })).toHaveCount(0);
      expect(api.recruiters.map((r) => r.name)).toEqual(['Alice Smith', 'Bob Jones']);
    });
  });
});
