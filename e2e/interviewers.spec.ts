import { test, expect, type Page, type Route } from '@playwright/test';

// Runs against a fake API (below), like recruiters.spec.ts, so it needs no
// credentials and doesn't depend on the backend having /interviewers yet.

const USERNAME = 'admin';
const PASSWORD = 'test-password';

interface Interviewer {
  id: string;
  name: string;
  company: string;
  role: string | null;
  email: string | null;
  linkedin: string | null;
  interview_types: string[];
  rating: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function makeInterviewer(id: number, fields: Partial<Interviewer>): Interviewer {
  return {
    id: String(id),
    name: 'Unnamed',
    company: 'Unknown',
    role: null,
    email: null,
    linkedin: null,
    interview_types: [],
    rating: 0,
    notes: null,
    created_at: `2026-10-2${id}T12:00:00`,
    updated_at: `2026-10-2${id}T12:00:00`,
    ...fields,
  };
}

interface Comment {
  id: string;
  interviewer_id: string;
  author: string;
  body: string;
  created_at: string;
}

class FakeApi {
  interviewers: Interviewer[] = [
    makeInterviewer(1, {
      name: 'Dana Lee',
      company: 'Initech',
      role: 'Staff Engineer',
      interview_types: ['system_design'],
      rating: 4.5,
      notes: 'Asked to design a URL shortener',
    }),
    makeInterviewer(2, { name: 'Evan Park', company: 'Globex', role: 'Eng Manager', interview_types: ['behavioral'], rating: 2 }),
    makeInterviewer(3, { name: 'Fran Diaz', company: 'Initech', interview_types: ['coding', 'pair_programming'], rating: 3.5 }),
  ];
  private nextId = 4;
  comments: Comment[] = [
    { id: '1', interviewer_id: '1', author: USERNAME, body: 'Gave great hints', created_at: '2026-10-29T09:30:00' },
  ];
  private nextCommentId = 2;
  private validAccessTokens = new Set<string>();
  private tokenCounter = 0;

  private issueTokens() {
    const n = ++this.tokenCounter;
    const access = `access-${n}`;
    this.validAccessTokens.add(access);
    return { access_token: access, refresh_token: `refresh-${n}`, token_type: 'bearer' };
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
      if (body?.username === USERNAME && body?.password === PASSWORD) return json(200, this.issueTokens());
      return json(401, { detail: 'Invalid username or password' });
    }

    const token = (request.headers()['authorization'] ?? '').replace(/^Bearer /, '');
    if (!this.validAccessTokens.has(token)) {
      return json(401, { detail: 'Invalid authentication credentials' });
    }

    if (path === '/interviewers' && method === 'GET') {
      const page = Number(url.searchParams.get('page') ?? 1);
      const limit = Number(url.searchParams.get('limit') ?? 10);
      const sort = url.searchParams.get('sort') ?? 'rating';
      const search = (url.searchParams.get('search') ?? '').toLowerCase();
      const type = url.searchParams.get('type');
      let list = this.interviewers.filter(
        (i) =>
          (!search || [i.name, i.company, i.role ?? ''].some((v) => v.toLowerCase().includes(search))) &&
          (!type || i.interview_types.includes(type)),
      );
      list = [...list].sort((a, b) =>
        sort === 'name' ? a.name.localeCompare(b.name) : sort === 'created_at' ? b.created_at.localeCompare(a.created_at) : b.rating - a.rating,
      );
      return json(200, { interviewers: list.slice((page - 1) * limit, page * limit), total: list.length, page, limit });
    }

    if (path === '/interviewers' && method === 'POST') {
      const interviewer = makeInterviewer(this.nextId++, body);
      this.interviewers.push(interviewer);
      return json(200, interviewer);
    }

    const commentsMatch = path.match(/^\/interviewers\/(\w+)\/comments(?:\/(\w+))?$/);
    if (commentsMatch) {
      const [, interviewerId, commentId] = commentsMatch;
      if (method === 'GET') return json(200, this.comments.filter((c) => c.interviewer_id === interviewerId).reverse());
      if (method === 'POST') {
        const comment = {
          id: String(this.nextCommentId++),
          interviewer_id: interviewerId,
          author: USERNAME,
          body: String(body.body).trim(),
          created_at: '2026-10-30T10:00:00',
        };
        this.comments.push(comment);
        return json(200, comment);
      }
      if (method === 'DELETE' && commentId) {
        this.comments = this.comments.filter((c) => c.id !== commentId);
        return json(200, { detail: 'Comment deleted' });
      }
    }

    const match = path.match(/^\/interviewers\/(\w+)$/);
    if (match) {
      const index = this.interviewers.findIndex((i) => i.id === match[1]);
      if (index === -1) return json(404, { detail: 'Interviewer not found' });
      if (method === 'GET') return json(200, this.interviewers[index]);
      if (method === 'PUT') {
        this.interviewers[index] = { ...this.interviewers[index], ...body };
        return json(200, this.interviewers[index]);
      }
      if (method === 'DELETE') {
        this.interviewers.splice(index, 1);
        return json(200, { detail: 'Interviewer deleted successfully' });
      }
    }

    return json(404, { detail: 'Not Found' });
  }
}

async function useFakeApi(page: Page): Promise<FakeApi> {
  const api = new FakeApi();
  await page.route(
    (url) => /^\/(auth|interviewers|recruiters|posts)(\/|$)/.test(url.pathname),
    (route) => {
      if (route.request().resourceType() === 'document') return route.fallback();
      const path = new URL(route.request().url()).pathname;
      // The dashboard also loads posts and recruiters; give it empty lists
      if (path === '/posts' || path === '/recruiters') {
        return route.fulfill({
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ posts: [], recruiters: [], total: 0, page: 1, limit: 10 }),
        });
      }
      return api.handle(route);
    },
  );
  return api;
}

async function visitLoggedIn(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(/\/blog\/login$/);
  await page.locator('input[id="username"]').fill(USERNAME);
  await page.locator('input[id="password"]').fill(PASSWORD);
  await page.locator('button:has-text("Unlock the Spellbook")').click();
  await expect(page).toHaveURL(new RegExp(`${path.replace('?', '\\?')}$`));
}

test.describe('Technical interviewers', () => {
  for (const path of ['/interviewers', '/interviewers/1', '/admin/interviewers']) {
    test(`${path} redirects to login when logged out`, async ({ page }) => {
      await useFakeApi(page);
      await page.goto(path);
      await expect(page).toHaveURL(/\/blog\/login$/);
    });
  }

  test('lists interviewers by rating, with role and interview types', async ({ page }) => {
    await useFakeApi(page);
    await visitLoggedIn(page, '/interviewers');
    await expect(page.locator('h1:has-text("Technical Interviewers")')).toBeVisible();
    await expect(page.locator('h3')).toHaveText(['Dana Lee', 'Fran Diaz', 'Evan Park']);
    const dana = page.locator('a').filter({ has: page.locator('h3:has-text("Dana Lee")') });
    await expect(dana).toContainText('Staff Engineer · Initech');
    await expect(dana).toContainText('System design');
  });

  test('filters by interview type and searches by role', async ({ page }) => {
    await useFakeApi(page);
    await visitLoggedIn(page, '/interviewers');
    await page.locator('select[aria-label="Filter by interview type"]').selectOption('coding');
    await expect(page.locator('h3')).toHaveText(['Fran Diaz']);

    await page.locator('select[aria-label="Filter by interview type"]').selectOption('');
    await page.locator('input[placeholder*="Search"]').fill('manager');
    await expect(page.locator('h3')).toHaveText(['Evan Park']);
  });

  test('opens a profile with notes and comments', async ({ page }) => {
    const api = await useFakeApi(page);
    await visitLoggedIn(page, '/interviewers');
    await page.locator('a').filter({ has: page.locator('h3:has-text("Dana Lee")') }).click();
    await expect(page).toHaveURL(/\/interviewers\/1$/);
    await expect(page.locator('text=Asked to design a URL shortener')).toBeVisible();
    await expect(page.locator('.rec-comment-body')).toHaveText(['Gave great hints']);

    await page.locator('#rec-comment-input').fill('Followed up with feedback');
    await page.locator('button:has-text("Post")').click();
    await expect(page.locator('.rec-comment-body')).toHaveText(['Followed up with feedback', 'Gave great hints']);
    expect(api.comments.filter((c) => c.interviewer_id === '1')).toHaveLength(2);

    await page.locator('button:has-text("Back to Interviewers")').click();
    await expect(page).toHaveURL(/\/interviewers$/);
  });

  test('adds an interviewer from the list page', async ({ page }) => {
    const api = await useFakeApi(page);
    await visitLoggedIn(page, '/interviewers');
    await page.locator('a:has-text("Add Interviewer")').click();
    await expect(page.locator('h2:has-text("Add New Interviewer")')).toBeVisible();

    await page.locator('#interviewer-name').fill('Gail Kim');
    await page.locator('#interviewer-company').fill('Hooli');
    await page.locator('#interviewer-role').fill('Senior SRE');
    await page.locator('#interviewer-rating').fill('4.2');
    await page.locator('label:has-text("Take-home")').click();
    await page.locator('label:has-text("Coding")').click();
    await page.locator('button:has-text("Create")').click();

    await expect(page.locator('td a:has-text("Gail Kim")')).toBeVisible();
    expect(api.interviewers.at(-1)).toMatchObject({
      name: 'Gail Kim',
      company: 'Hooli',
      role: 'Senior SRE',
      rating: 4.2,
      interview_types: ['take_home', 'coding'],
    });
  });

  test('edits and deletes an interviewer', async ({ page }) => {
    const api = await useFakeApi(page);
    await visitLoggedIn(page, '/admin/interviewers');

    await page.locator('button[aria-label="Edit Evan Park"]').click();
    await expect(page.locator('#interviewer-role')).toHaveValue('Eng Manager');
    await page.locator('#interviewer-rating').fill('3');
    await page.locator('button:has-text("Update")').click();
    await expect(page.locator('tr', { hasText: 'Evan Park' })).toContainText('3.0');
    expect(api.interviewers.find((i) => i.id === '2')?.rating).toBe(3);

    await page.locator('button[aria-label="Delete Evan Park"]').click();
    await expect(page.locator('td a:has-text("Evan Park")')).toHaveCount(0);
    expect(api.interviewers).toHaveLength(2);
  });

  test('admin dashboard shows the total and links to the list', async ({ page }) => {
    await useFakeApi(page);
    await visitLoggedIn(page, '/interviewers');
    await page.goto('/admin');
    const card = page.locator('a', { hasText: 'Total interviewers' });
    await expect(card).toContainText('3');
    await card.click();
    await expect(page).toHaveURL(/\/interviewers$/);
  });
});
