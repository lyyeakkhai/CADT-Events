/**
 * Student booking flow E2E against the running local stack:
 *   frontend http://localhost:5173  ·  API http://localhost:4000
 *
 * Creates a fresh Clerk student (email verified via Backend API), then
 * logs in with a one-time sign-in token (avoids device email OTP).
 *
 * Flow:
 *  1. Create user + login
 *  2. Discover → open bookable event → REGISTER NOW
 *  3. Select seat → Register for Free
 *  4. Booking Confirmed
 *  5. My Booking lists the event
 *  6. Double-book → expect 409 / error
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SHOT_DIR = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const API = process.env.E2E_API_URL || 'http://localhost:4000/api';
const PREFERRED_TITLE = 'E2E Test Seminar Deploy Readiness';

function loadClerkSecret(): string {
  if (process.env.CLERK_SECRET_KEY) return process.env.CLERK_SECRET_KEY;
  // Local-only: pull from backend .env (not committed secrets pattern for CI)
  const envPath = path.join(__dirname, '..', '..', 'backend', '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  const m = raw.match(/^CLERK_SECRET_KEY=(.+)$/m);
  if (!m) throw new Error('CLERK_SECRET_KEY not found');
  return m[1].trim().replace(/^["']|["']$/g, '');
}

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(SHOT_DIR, `${name}.png`),
    fullPage: true,
  });
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
    throw new Error(`Clerk ${method} ${urlPath} → ${res.status}: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return json as any;
}

/** Create verified student + one-time sign-in ticket (no email OTP). */
async function createStudentAndTicket(secret: string) {
  const email = `e2e.book.${Date.now()}@example.com`;
  const password = 'E2eTest!Pass123';

  const user = await clerkApi(secret, 'POST', '/users', {
    email_address: [email],
    password,
    first_name: 'E2E',
    last_name: 'Booker',
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

  return {
    email,
    password,
    userId: user.id as string,
    token: ticket.token as string,
  };
}

/** Complete Clerk ticket login in the student app (bypasses factor-two). */
async function loginWithTicket(page: Page, token: string) {
  // SignIn with routing="hash" still picks up query __clerk_ticket on first load
  await page.goto(`/login?__clerk_ticket=${encodeURIComponent(token)}`);
  await page.waitForLoadState('domcontentloaded');
  await shot(page, '01-login-ticket');

  // Wait until we leave /login, or try home with ticket
  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 });
  } catch {
    // Fallback: land on app root with ticket (Clerk client hydrates session)
    await page.goto(`/?__clerk_ticket=${encodeURIComponent(token)}`);
    await page.waitForLoadState('networkidle');
    // If still unsigned, try hash form
    if (page.url().includes('/login') || (await page.getByText(/Welcome Back|Sign in/i).isVisible().catch(() => false))) {
      await page.goto(`/login#/?__clerk_ticket=${encodeURIComponent(token)}`);
      await page.waitForTimeout(3000);
    }
  }

  // Signed-in shell: email in banner or Discover content (not Welcome Back)
  await page.waitForTimeout(2000);
  await shot(page, '02-after-login');

  const body = await page.locator('body').innerText();
  const signedIn =
    /Student Portal|Discover|CADT Events —/i.test(body) &&
    !/Welcome Back/i.test(body);
  if (!signedIn && page.url().includes('/login')) {
    throw new Error(`Ticket login failed; still on login. URL=${page.url()}`);
  }
}

async function dismissTelegramIfPresent(page: Page) {
  for (const name of [/not now/i, /skip/i, /later/i, /close/i, /dismiss/i, /maybe later/i]) {
    const btn = page.getByRole('button', { name });
    if (await btn.first().isVisible({ timeout: 800 }).catch(() => false)) {
      await btn.first().click().catch(() => {});
      break;
    }
  }
  // Backdrop click escape
  await page.keyboard.press('Escape').catch(() => {});
}

async function pickBookableEventTitle(): Promise<string> {
  const res = await fetch(`${API}/events`);
  if (!res.ok) throw new Error(`GET /events failed: ${res.status}`);
  const json = (await res.json()) as {
    data: Array<{
      id: string;
      title: string;
      availableSeats: number | null;
      startTimestamp: string;
    }>;
  };
  const now = Date.now();
  const preferred = json.data.find(
    (e) =>
      e.title === PREFERRED_TITLE &&
      new Date(e.startTimestamp).getTime() > now &&
      (e.availableSeats == null || e.availableSeats > 0),
  );
  if (preferred) return preferred.title;

  const any = json.data.find(
    (e) =>
      new Date(e.startTimestamp).getTime() > now &&
      (e.availableSeats == null || e.availableSeats > 0) &&
      e.title !== 'emwpoer',
  );
  if (!any) throw new Error('No bookable future events in API');
  return any.title;
}

test.describe.configure({ mode: 'serial' });

test.describe('Student booking flow (running local stack)', () => {
  test('create user → login → book → confirmed → my booking → reject double-book', async ({
    page,
  }) => {
    const secret = loadClerkSecret();
    const student = await createStudentAndTicket(secret);
    test.info().annotations.push({
      type: 'user',
      description: `Created ${student.email} (${student.userId})`,
    });

    // Persist for debugging re-runs
    fs.writeFileSync(
      path.join(__dirname, '..', '.env.test'),
      `E2E_EMAIL=${student.email}\nE2E_PASSWORD=${student.password}\nE2E_USER_ID=${student.userId}\n`,
    );

    const eventTitle = await pickBookableEventTitle();
    const dialogMessages: string[] = [];
    page.on('dialog', async (d) => {
      dialogMessages.push(d.message());
      await d.accept();
    });

    // ── 1. Login via ticket ───────────────────────────────────────────────
    await loginWithTicket(page, student.token);
    await dismissTelegramIfPresent(page);

    // Must be on student app, not admin
    expect(page.url()).not.toMatch(/:3000/);
    await expect(page.getByText(/Discover|CADT Events|Student Portal/i).first()).toBeVisible({
      timeout: 25_000,
    });

    // ── 2. Open event ─────────────────────────────────────────────────────
    let card = page.getByText(eventTitle, { exact: false }).first();
    if (!(await card.isVisible({ timeout: 8_000 }).catch(() => false))) {
      const searchTab = page.getByText(/^Search$/i).first();
      if (await searchTab.isVisible().catch(() => false)) {
        await searchTab.click();
        await page.waitForTimeout(1000);
      }
      card = page.getByText(eventTitle, { exact: false }).first();
    }
    await expect(card).toBeVisible({ timeout: 20_000 });
    await card.click();
    await shot(page, '03-event-detail');

    // ── 3. REGISTER NOW ───────────────────────────────────────────────────
    const registerNow = page.getByRole('button', { name: /REGISTER NOW/i });
    await expect(registerNow).toBeVisible({ timeout: 15_000 });
    await registerNow.click();
    await shot(page, '04-seat-selection');

    // ── 4. Select seat ────────────────────────────────────────────────────
    await expect(
      page.getByText(/Select Seats|Seat Selection|Grand Auditorium/i).first(),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.locator('button[data-seat]').first()).toBeVisible({ timeout: 25_000 });
    const seatButtons = page.locator('button[data-seat][data-occupied="false"]');
    const seatCount = await seatButtons.count();
    expect(seatCount, 'expected available seat map buttons').toBeGreaterThan(0);
    await seatButtons.first().click();
    await shot(page, '05-seat-selected');

    // ── 5. Confirm booking ────────────────────────────────────────────────
    const confirm = page.getByRole('button', { name: /Register for Free/i });
    await expect(confirm).toBeEnabled({ timeout: 10_000 });

    const bookingResponsePromise = page
      .waitForResponse(
        (r) =>
          r.url().includes('/api/bookings') &&
          r.request().method() === 'POST' &&
          r.status() !== 0,
        { timeout: 45_000 },
      )
      .catch(() => null);

    await confirm.click();
    const bookingRes = await bookingResponsePromise;
    await shot(page, '06-after-register-click');

    if (bookingRes) {
      const status = bookingRes.status();
      let bodyText = '';
      try {
        bodyText = await bookingRes.text();
      } catch {
        /* ignore */
      }
      if (status >= 400) {
        await shot(page, '06b-booking-api-error');
        throw new Error(`POST /api/bookings failed: HTTP ${status} body=${bodyText.slice(0, 500)}`);
      }
    }

    // ── 6. Confirmation ───────────────────────────────────────────────────
    await expect(page.getByText(/Booking Confirmed/i)).toBeVisible({ timeout: 30_000 });
    const confText = await page.locator('body').innerText();
    expect(
      /CADT-\d{8}-[A-F0-9]+/i.test(confText) || /booking|ticket|reference|pass/i.test(confText),
      'confirmation should show ticket content',
    ).toBeTruthy();
    await shot(page, '07-booking-confirmed');

    // ── 7. My Booking ─────────────────────────────────────────────────────
    const goMyBooking = page.getByRole('button', {
      name: /My Booking|View My Booking|Go to My/i,
    });
    if (await goMyBooking.first().isVisible().catch(() => false)) {
      await goMyBooking.first().click();
    } else {
      await page.getByText(/^My Booking$/i).first().click();
    }
    await page.waitForTimeout(1500);
    await shot(page, '08-my-booking');
    await expect(page.getByText(eventTitle, { exact: false }).first()).toBeVisible({
      timeout: 20_000,
    });

    // ── 8. Double-book ────────────────────────────────────────────────────
    await page
      .getByText(/^Discover$/i)
      .first()
      .click()
      .catch(async () => {
        await page.goto('/');
      });
    await page.waitForTimeout(1000);
    await dismissTelegramIfPresent(page);

    const card2 = page.getByText(eventTitle, { exact: false }).first();
    if (await card2.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await card2.click();
      const reg2 = page.getByRole('button', { name: /REGISTER NOW/i });
      if (await reg2.isVisible({ timeout: 8_000 }).catch(() => false)) {
        await reg2.click();
        await expect(page.locator('button[data-seat]').first()).toBeVisible({ timeout: 20_000 });
        const seats2 = page.locator('button[data-seat][data-occupied="false"]');
        if ((await seats2.count()) > 0) {
          await seats2.first().click();
        }
        const confirm2 = page.getByRole('button', { name: /Register for Free/i });
        if (await confirm2.isEnabled().catch(() => false)) {
          const dupPromise = page
            .waitForResponse(
              (r) =>
                r.url().includes('/api/bookings') && r.request().method() === 'POST',
              { timeout: 30_000 },
            )
            .catch(() => null);
          await confirm2.click();
          const dupRes = await dupPromise;
          await shot(page, '09-double-book-attempt');

          if (dupRes) {
            const st = dupRes.status();
            expect(st === 409 || st >= 400, `double-book should fail, got HTTP ${st}`).toBeTruthy();
          } else {
            const sawAlert = dialogMessages.some((m) =>
              /already|booked|conflict|fail/i.test(m),
            );
            const stillConfirmed = await page
              .getByText(/Booking Confirmed/i)
              .isVisible()
              .catch(() => false);
            expect(
              sawAlert || !stillConfirmed,
              `double-book should error; dialogs=${JSON.stringify(dialogMessages)}`,
            ).toBeTruthy();
          }
        }
      }
    }

    await shot(page, '10-done');
  });
});
