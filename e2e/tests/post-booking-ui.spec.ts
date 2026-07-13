/**
 * After booking: does the user see their book? notifications? do buttons break?
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOT = path.join(__dirname, '..', 'screenshots-post-book');
fs.mkdirSync(SHOT, { recursive: true });
const API = process.env.E2E_API_URL || 'http://localhost:4000/api';

function loadClerkSecret(): string {
  if (process.env.CLERK_SECRET_KEY) return process.env.CLERK_SECRET_KEY;
  const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'backend', '.env'), 'utf8');
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
  if (!res.ok) throw new Error(`Clerk ${method} ${urlPath} ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json as any;
}

async function loginStudent(page: Page) {
  const secret = loadClerkSecret();
  const email = `e2e.postbook.${Date.now()}@example.com`;
  const user = await clerkApi(secret, 'POST', '/users', {
    email_address: [email],
    password: 'E2eTest!Pass123',
    first_name: 'Post',
    last_name: 'Book',
    skip_password_checks: true,
  });
  const emailId = user.email_addresses?.[0]?.id as string | undefined;
  if (emailId) await clerkApi(secret, 'PATCH', `/email_addresses/${emailId}`, { verified: true });
  const ticket = await clerkApi(secret, 'POST', '/sign_in_tokens', {
    user_id: user.id,
    expires_in_seconds: 600,
  });

  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.setItem('telegramPromptDismissed', '1');
    } catch {
      /* */
    }
  });
  await page.goto(`/login?__clerk_ticket=${encodeURIComponent(ticket.token)}`);
  try {
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 25_000 });
  } catch {
    await page.goto(`/?__clerk_ticket=${encodeURIComponent(ticket.token)}`);
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    document.querySelectorAll('div.fixed.inset-0').forEach((el) => {
      if (Number(getComputedStyle(el).zIndex) >= 100) (el as HTMLElement).style.display = 'none';
    });
  });
  return { email, userId: user.id as string };
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SHOT, `${name}.png`), fullPage: true });
}

async function pickEvent() {
  const res = await fetch(`${API}/events`);
  const json = (await res.json()) as {
    data: Array<{ id: string; title: string; availableSeats: number | null; startTimestamp: string }>;
  };
  const now = Date.now();
  return (
    json.data.find(
      (e) =>
        e.title === 'E2E Test Seminar Deploy Readiness' &&
        new Date(e.startTimestamp).getTime() > now &&
        (e.availableSeats == null || e.availableSeats > 0),
    ) ||
    json.data.find(
      (e) =>
        new Date(e.startTimestamp).getTime() > now &&
        (e.availableSeats == null || e.availableSeats > 0) &&
        e.title !== 'emwpoer',
    )!
  );
}

test('book → see My Booking, click buttons, check notifications', async ({ page }) => {
  test.setTimeout(180_000);
  const findings: string[] = [];
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('dialog', async (d) => {
    findings.push(`dialog: ${d.type()} — ${d.message()}`);
    await d.accept();
  });

  const student = await loginStudent(page);
  findings.push(`user: ${student.email}`);
  await shot(page, '01-home');

  const target = await pickEvent();
  expect(target).toBeTruthy();
  findings.push(`event: ${target.title}`);

  // Track API calls after login
  const apiHits: { method: string; url: string; status: number }[] = [];
  page.on('response', (r) => {
    if (r.url().includes('/api/')) {
      apiHits.push({
        method: r.request().method(),
        url: r.url().replace(/^https?:\/\/[^/]+/, ''),
        status: r.status(),
      });
    }
  });

  // ── Book ────────────────────────────────────────────────────────────────
  await page.getByText(target.title, { exact: false }).first().click({ force: true });
  await page.getByRole('button', { name: /REGISTER NOW/i }).click();
  await expect(page.locator('button[data-seat]').first()).toBeVisible({ timeout: 25_000 });
  const freeSeat = page.locator('button[data-seat][data-occupied="false"]').first();
  const seatId = await freeSeat.getAttribute('data-seat');
  await freeSeat.click();
  findings.push(`selected seat: ${seatId}`);
  await page.getByRole('button', { name: /Register for Free/i }).click();
  await expect(page.getByText(/Booking Confirmed/i)).toBeVisible({ timeout: 30_000 });
  await shot(page, '02-confirmed');
  findings.push('booking confirmed UI: PASS');

  const confBody = await page.locator('body').innerText();
  const refMatch = confBody.match(/CADT-\d{8}-[A-F0-9]+/i);
  findings.push(`ticket on confirm: ${refMatch?.[0] || 'MISSING'}`);
  expect(refMatch, 'confirmation shows booking reference').toBeTruthy();

  // ── My Booking shows it ─────────────────────────────────────────────────
  const goMy = page.getByRole('button', { name: /My Booking|View My Booking|Go to My/i });
  if (await goMy.first().isVisible().catch(() => false)) {
    await goMy.first().click();
  } else {
    await page.getByText(/^My Booking$/i).first().click({ force: true });
  }
  await page.waitForTimeout(1500);
  await shot(page, '03-my-booking');

  await expect(page.getByText(target.title, { exact: false }).first()).toBeVisible({ timeout: 20_000 });
  findings.push('My Booking lists event: PASS');

  // Seat + booking id visible
  const myBody = await page.locator('body').innerText();
  if (/Seat\s+[A-Z]\d+/i.test(myBody) || /Seat/i.test(myBody)) {
    findings.push('seat shown on My Booking: PASS (or label present)');
  } else {
    findings.push('seat shown on My Booking: WEAK/MISSING');
  }
  if (/CADT-\d{8}/i.test(myBody)) {
    findings.push('booking id on My Booking: PASS');
  } else {
    findings.push('booking id on My Booking: FAIL');
  }

  // ── Button: Download Ticket ─────────────────────────────────────────────
  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 }).catch(() => null);
  const dl = page.getByRole('button', { name: /Download Ticket/i });
  if (await dl.isVisible().catch(() => false)) {
    await dl.click();
    const dlEvent = await downloadPromise;
    if (dlEvent) {
      findings.push(`Download Ticket: PASS (${await dlEvent.suggestedFilename()})`);
    } else {
      findings.push('Download Ticket: clicked, no download event (may still work)');
    }
  } else {
    findings.push('Download Ticket: button not found');
  }
  await shot(page, '04-after-download');

  // ── Button: Modify Booking (known dead UI?) ─────────────────────────────
  const modify = page.getByRole('button', { name: /Modify Booking/i });
  if (await modify.isVisible().catch(() => false)) {
    await modify.click();
    await page.waitForTimeout(800);
    // Does anything happen?
    const stillOnMyBooking = await page.getByText(/Next Event|My Booking|Your Activity/i).first().isVisible().catch(() => false);
    findings.push(
      stillOnMyBooking
        ? 'Modify Booking: NO-OP (button exists, no navigation/action) — UI stub'
        : 'Modify Booking: navigated somewhere',
    );
  } else {
    findings.push('Modify Booking: not visible');
  }
  await shot(page, '05-after-modify');

  // ── Notifications tab / bell ────────────────────────────────────────────
  const bell = page.getByLabel(/System Notifications|Notifications/i).or(page.getByText(/^Notifications$/i));
  // Prefer navbar bell
  const notifBtn = page.locator('button[aria-label="System Notifications"]');
  if (await notifBtn.isVisible().catch(() => false)) {
    await notifBtn.click();
  } else {
    await page.getByText(/^Notifications$/i).first().click({ force: true }).catch(() => {});
  }
  await page.waitForTimeout(2000);
  await shot(page, '06-notifications');

  const notifBody = await page.locator('body').innerText();
  const notifApi = apiHits.filter((h) => h.url.includes('/notifications'));
  findings.push(
    `notifications API calls: ${notifApi.map((h) => `${h.method} ${h.status}`).join(', ') || 'none'}`,
  );

  if (/Booking Confirmed|registration|booked/i.test(notifBody) && !/No notifications|empty|nothing yet|No unread/i.test(notifBody)) {
    findings.push('in-app notification for booking: PASS (content present)');
  } else if (/No notifications|No unread|nothing|empty|Stay updated/i.test(notifBody) || notifBody.includes('Never miss an update')) {
    // Check if list is empty
    const empty =
      /No notifications|no unread|You have no|nothing here|empty/i.test(notifBody) ||
      (!/CADT-\d{8}/i.test(notifBody) && !/Booking Confirmed/i.test(notifBody));
    findings.push(
      empty
        ? 'in-app notification for booking: EMPTY — only Telegram path on book (no DB notification row)'
        : 'in-app notification: page loaded with some content',
    );
  } else {
    findings.push('in-app notification: page loaded (see screenshot)');
  }

  // ── Favorites ───────────────────────────────────────────────────────────
  const heart = page.locator('button[aria-label*="Favorite"], button[aria-label*="favorite"]').or(
    page.getByText(/^Favorites$/i),
  );
  if (await page.getByText(/^Favorites$/i).first().isVisible().catch(() => false)) {
    await page.getByText(/^Favorites$/i).first().click({ force: true });
  } else if (await heart.first().isVisible().catch(() => false)) {
    await heart.first().click();
  }
  await page.waitForTimeout(1000);
  await shot(page, '07-favorites');
  findings.push('Favorites tab: no crash');

  // ── Calendar ────────────────────────────────────────────────────────────
  await page.getByText(/^Calendar$/i).first().click({ force: true });
  await page.waitForTimeout(1000);
  await shot(page, '08-calendar');
  findings.push('Calendar tab: no crash');

  // ── Discover + Explore still work ───────────────────────────────────────
  await page.getByText(/^Discover$/i).first().click({ force: true });
  await page.waitForTimeout(800);
  await page.getByText(/^Explore$|^Search$/i).first().click({ force: true });
  await page.waitForTimeout(800);
  await shot(page, '09-explore');
  findings.push('Discover/Explore after book: no crash');

  // ── Back My Booking → Cancel ────────────────────────────────────────────
  await page.getByText(/^My Booking$/i).first().click({ force: true });
  await page.waitForTimeout(1200);
  const cancel = page.getByRole('button', { name: /^Cancel$/i });
  if (await cancel.first().isVisible().catch(() => false)) {
    const delPromise = page
      .waitForResponse(
        (r) => r.url().includes('/api/bookings/') && r.request().method() === 'DELETE',
        { timeout: 15_000 },
      )
      .catch(() => null);
    await cancel.first().click();
    const delRes = await delPromise;
    await page.waitForTimeout(1000);
    await shot(page, '10-after-cancel');
    if (delRes) {
      findings.push(`Cancel booking API: HTTP ${delRes.status()} ${delRes.ok() ? 'PASS' : 'FAIL'}`);
    } else {
      findings.push('Cancel booking: dialog/API not clearly captured');
    }
    // After cancel, title may move to past or empty
    const afterCancel = await page.locator('body').innerText();
    if (/No upcoming|CANCELLED|cancelled/i.test(afterCancel)) {
      findings.push('UI after cancel: reflects cancelled/empty upcoming');
    } else {
      findings.push('UI after cancel: still shows upcoming (may need refresh)');
    }
  } else {
    findings.push('Cancel button: not visible');
  }

  // ── Hard crashes ────────────────────────────────────────────────────────
  expect(pageErrors, `pageerrors: ${pageErrors.join(' | ')}`).toEqual([]);
  findings.push('page crashes: none');

  // Persist report
  const report = findings.join('\n');
  fs.writeFileSync(path.join(SHOT, 'FINDINGS.txt'), report);
  console.log('\n=== FINDINGS ===\n' + report + '\n');

  // Soft annotation for playwright report
  test.info().annotations.push({ type: 'findings', description: report });
});
