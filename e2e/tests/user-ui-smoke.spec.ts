/**
 * Student UI smoke: click through main surfaces and assert nothing hard-breaks.
 * Runs guest + authenticated sessions against http://localhost:5173
 */
import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOT = path.join(__dirname, '..', 'screenshots-ui-smoke');
fs.mkdirSync(SHOT, { recursive: true });

const API = process.env.E2E_API_URL || 'http://localhost:4000/api';

function loadClerkSecret(): string {
  if (process.env.CLERK_SECRET_KEY) return process.env.CLERK_SECRET_KEY;
  const envPath = path.join(__dirname, '..', '..', 'backend', '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  const m = raw.match(/^CLERK_SECRET_KEY=(.+)$/m);
  if (!m) throw new Error('CLERK_SECRET_KEY not found');
  return m[1].trim().replace(/^["']|["']$/g, '');
}

async function clerkApi(secret: string, method: string, urlPath: string, body?: unknown) {
  const res = await fetch(`https://api.clerk.com/v1${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Clerk ${method} ${urlPath} → ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  }
  return json as any;
}

async function createStudentTicket(secret: string) {
  const email = `e2e.ui.${Date.now()}@example.com`;
  const user = await clerkApi(secret, 'POST', '/users', {
    email_address: [email],
    password: 'E2eTest!Pass123',
    first_name: 'UI',
    last_name: 'Smoke',
    skip_password_checks: true,
  });
  const emailId = user.email_addresses?.[0]?.id as string | undefined;
  if (emailId) {
    await clerkApi(secret, 'PATCH', `/email_addresses/${emailId}`, { verified: true });
  }
  const ticket = await clerkApi(secret, 'POST', '/sign_in_tokens', {
    user_id: user.id,
    expires_in_seconds: 600,
  });
  return { email, token: ticket.token as string };
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOT, `${name}.png`), fullPage: true });
}

function trackErrors(page: Page) {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message));
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      // Ignore known noisy third-party / empty-src warnings
      if (/Download the React DevTools/i.test(t)) return;
      if (/Clerk has been loaded with development keys/i.test(t)) return;
      if (/empty string \(""\) was passed to the %s attribute/i.test(t)) return;
      if (/Failed to load resource/i.test(t) && /favicon/i.test(t)) return;
      consoleErrors.push(t);
    }
  });
  return {
    pageErrors,
    consoleErrors,
    assertNoHardCrashes: async () => {
      const body = await page.locator('body').innerText().catch(() => '');
      expect(body, 'blank page').toBeTruthy();
      expect(body).not.toMatch(/Application error|Unexpected Application Error|Something went wrong/i);
      expect(pageErrors, `pageerrors: ${pageErrors.join(' | ')}`).toEqual([]);
    },
  };
}

async function dismissOverlays(page: Page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('telegramPromptDismissed', '1');
    } catch {
      /* ignore */
    }
  });
  const maybeLater = page.getByRole('button', { name: /maybe later|not now|skip|close|dismiss/i });
  if (await maybeLater.first().isVisible({ timeout: 1500 }).catch(() => false)) {
    await maybeLater.first().click({ force: true }).catch(() => {});
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('div.fixed.inset-0').forEach((el) => {
      const z = Number(getComputedStyle(el).zIndex);
      if (z >= 100) (el as HTMLElement).style.display = 'none';
    });
  });
}

async function clickNav(page: Page, label: RegExp | string) {
  const tab = page.getByText(label).first();
  await expect(tab).toBeVisible({ timeout: 10_000 });
  await tab.click({ force: true });
  await page.waitForTimeout(600);
  await dismissOverlays(page);
}

test.describe.configure({ mode: 'serial' });

test('guest UI: navigate discover / search / login / protected tabs', async ({ page }) => {
  test.setTimeout(120_000);
  const err = trackErrors(page);

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await shot(page, '01-guest-home');
  await err.assertNoHardCrashes();

  // Discover content from API
  await expect(page.getByText(/Discover|Events|CADT/i).first()).toBeVisible({ timeout: 15_000 });

  // Search / Explore tab if present
  const searchTab = page.getByText(/^Search$|^Explore$/i).first();
  if (await searchTab.isVisible().catch(() => false)) {
    await searchTab.click({ force: true });
    await page.waitForTimeout(800);
    await shot(page, '02-guest-search');
    await err.assertNoHardCrashes();
  }

  // Calendar (often public)
  const cal = page.getByText(/^Calendar$/i).first();
  if (await cal.isVisible().catch(() => false)) {
    await cal.click({ force: true });
    await page.waitForTimeout(1000);
    await shot(page, '03-guest-calendar');
    await err.assertNoHardCrashes();
  }

  // Protected: My Booking → should redirect/gate to login
  const myBooking = page.getByText(/^My Booking$/i).first();
  if (await myBooking.isVisible().catch(() => false)) {
    await myBooking.click({ force: true });
    await page.waitForTimeout(1500);
    await shot(page, '04-guest-my-booking-gate');
    // Either login page or still on shell with login CTA
    const url = page.url();
    const body = await page.locator('body').innerText();
    const gated =
      url.includes('/login') ||
      /Welcome Back|Sign in|Log in|Please sign in/i.test(body);
    expect(gated, 'My Booking should gate guests').toBeTruthy();
    await err.assertNoHardCrashes();
  }

  // Login page renders Clerk
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await shot(page, '05-guest-login');
  await expect(page.getByText(/Welcome Back|Sign in|CADT/i).first()).toBeVisible({ timeout: 20_000 });
  await err.assertNoHardCrashes();

  // Back home — open an event detail as guest
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const eventsRes = await fetch(`${API}/events`);
  const eventsJson = (await eventsRes.json()) as { data: { title: string }[] };
  const title = eventsJson.data.find((e) => e.title !== 'emwpoer')?.title || eventsJson.data[0]?.title;
  if (title) {
    const card = page.getByText(title, { exact: false }).first();
    if (await card.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await card.click({ force: true });
      await page.waitForTimeout(1200);
      await shot(page, '06-guest-event-detail');
      await expect(page.getByRole('button', { name: /REGISTER NOW|EVENT FULL|EVENT COMPLETED/i })).toBeVisible({
        timeout: 15_000,
      });
      // Guest clicks register → should go login
      const reg = page.getByRole('button', { name: /REGISTER NOW/i });
      if (await reg.isVisible().catch(() => false)) {
        await reg.click();
        await page.waitForTimeout(1500);
        await shot(page, '07-guest-register-redirect');
        const body = await page.locator('body').innerText();
        const url = page.url();
        expect(
          url.includes('/login') || /Welcome Back|Sign in/i.test(body),
          'guest register should require login',
        ).toBeTruthy();
      }
      await err.assertNoHardCrashes();
    }
  }
});

test('logged-in UI: tabs + event detail + seat map + my booking', async ({ page }) => {
  test.setTimeout(180_000);
  const err = trackErrors(page);
  const secret = loadClerkSecret();
  const student = await createStudentTicket(secret);

  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.setItem('telegramPromptDismissed', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto(`/login?__clerk_ticket=${encodeURIComponent(student.token)}`);
  try {
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25_000 });
  } catch {
    await page.goto(`/?__clerk_ticket=${encodeURIComponent(student.token)}`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await dismissOverlays(page);
  await shot(page, '10-auth-home');
  await err.assertNoHardCrashes();

  // Must show student shell, not admin
  expect(page.url()).not.toMatch(/:3000/);
  await expect(page.getByText(/Student Portal|Discover|CADT Events/i).first()).toBeVisible({
    timeout: 20_000,
  });

  // ── Discover ────────────────────────────────────────────────────────────
  await clickNav(page, /^Discover$/i);
  await shot(page, '11-discover');
  await err.assertNoHardCrashes();

  // ── Search / Explore ────────────────────────────────────────────────────
  const search = page.getByText(/^Search$|^Explore$/i).first();
  if (await search.isVisible().catch(() => false)) {
    await search.click({ force: true });
    await page.waitForTimeout(800);
    await shot(page, '12-search');
    await err.assertNoHardCrashes();
  }

  // ── Calendar ────────────────────────────────────────────────────────────
  await clickNav(page, /^Calendar$/i);
  await shot(page, '13-calendar');
  await err.assertNoHardCrashes();

  // ── Favorites ───────────────────────────────────────────────────────────
  const fav = page.getByText(/^Favorites$/i).first();
  if (await fav.isVisible().catch(() => false)) {
    await fav.click({ force: true });
    await page.waitForTimeout(1000);
    await shot(page, '14-favorites');
    await err.assertNoHardCrashes();
  }

  // ── Notifications ───────────────────────────────────────────────────────
  const notif = page.getByText(/^Notifications$/i).first();
  if (await notif.isVisible().catch(() => false)) {
    await notif.click({ force: true });
    await page.waitForTimeout(1000);
    await shot(page, '15-notifications');
    await err.assertNoHardCrashes();
  }

  // ── My Booking (empty OK) ───────────────────────────────────────────────
  await clickNav(page, /^My Booking$/i);
  await page.waitForTimeout(1200);
  await shot(page, '16-my-booking');
  await err.assertNoHardCrashes();

  // ── Back Discover → open event → seats ──────────────────────────────────
  await clickNav(page, /^Discover$/i);
  await page.waitForTimeout(800);

  const eventsRes = await fetch(`${API}/events`);
  const eventsJson = (await eventsRes.json()) as {
    data: Array<{ id: string; title: string; availableSeats: number | null; startTimestamp: string }>;
  };
  const now = Date.now();
  const target =
    eventsJson.data.find(
      (e) =>
        e.title === 'E2E Test Seminar Deploy Readiness' &&
        new Date(e.startTimestamp).getTime() > now &&
        (e.availableSeats == null || e.availableSeats > 0),
    ) ||
    eventsJson.data.find(
      (e) =>
        new Date(e.startTimestamp).getTime() > now &&
        (e.availableSeats == null || e.availableSeats > 0) &&
        e.title !== 'emwpoer',
    );

  expect(target, 'need a bookable event').toBeTruthy();
  await expect(page.getByText(target!.title, { exact: false }).first()).toBeVisible({
    timeout: 20_000,
  });
  await page.getByText(target!.title, { exact: false }).first().click({ force: true });
  await page.waitForTimeout(1200);
  await shot(page, '17-event-detail');
  await err.assertNoHardCrashes();

  const reg = page.getByRole('button', { name: /REGISTER NOW/i });
  await expect(reg).toBeVisible({ timeout: 15_000 });
  await reg.click();
  await page.waitForTimeout(1500);
  await shot(page, '18-seat-map');

  // Live seats must load
  await expect(page.locator('button[data-seat]').first()).toBeVisible({ timeout: 25_000 });
  await expect(page.getByText(/Live seat map|seats left|Capacity/i).first()).toBeVisible();
  await err.assertNoHardCrashes();

  // Select a free seat and complete booking (proves UI path)
  const free = page.locator('button[data-seat][data-occupied="false"]');
  expect(await free.count()).toBeGreaterThan(0);
  await free.first().click();
  await shot(page, '19-seat-selected');

  const confirm = page.getByRole('button', { name: /Register for Free/i });
  await expect(confirm).toBeEnabled();
  await confirm.click();

  await expect(page.getByText(/Booking Confirmed/i)).toBeVisible({ timeout: 30_000 });
  await shot(page, '20-confirmed');
  await err.assertNoHardCrashes();

  // My Booking should list it
  const goMy = page.getByRole('button', { name: /My Booking|View My Booking|Go to My/i });
  if (await goMy.first().isVisible().catch(() => false)) {
    await goMy.first().click();
  } else {
    await clickNav(page, /^My Booking$/i);
  }
  await page.waitForTimeout(1500);
  await shot(page, '21-my-booking-after');
  await expect(page.getByText(target!.title, { exact: false }).first()).toBeVisible({
    timeout: 20_000,
  });
  await err.assertNoHardCrashes();

  // Soft check: console errors (warn only if third-party noise remains)
  if (err.consoleErrors.length) {
    test.info().annotations.push({
      type: 'console-errors',
      description: err.consoleErrors.slice(0, 10).join('\n'),
    });
  }
  // Fail only on app pageerrors (already asserted) — console can have Clerk noise
});
