# Admin E2E test report — 2026-07-13

**Tester:** automated browser (gstack browse / Playwright Chromium)  
**Account:** `yeakkhai.ly@student.cadt.edu.kh` (ADMIN)  
**Apps:** admin `http://localhost:3000`, student `http://localhost:5173`, API `:4000`  

---

## Verdict

**Admin core path works.** Login, create/publish, roster, check-in, users list, export list, notifications API — all functional for a demo.

Not demo-ready polish issues remain (fake stats, duplicate users, calendar mock data).

---

## Results

| # | Flow | Result | Evidence |
|---|------|--------|----------|
| 1 | Admin login (email + password + email OTP) | **PASS** | Landed on admin dashboard |
| 2 | Dashboard loads events from API | **PASS** | `GET /api/events/all` 200; lists real events |
| 3 | Create + **Publish** event | **PASS** | `POST /api/events` **201**; “E2E Test Seminar Deploy Readiness” appears PUBLISHED |
| 4 | Create + **Save Draft** | **PASS** | `POST /api/events` **201**; draft not on public list |
| 5 | Public student feed sees published event | **PASS** | Event title present on Discover; public API count 8 |
| 6 | Event detail + attendee roster | **PASS** | `emwpoer` shows 2 attendees with booking refs |
| 7 | Check-in attendee | **PASS** | `PATCH .../checkin` **200**; UI “Checked in at 5:03:06 PM” |
| 8 | Export attendees button | **PASS** | Click no crash (client download) |
| 9 | Users page | **PASS with bugs** | `GET /api/users` 200; shows students + admins |
| 10 | Calendar page | **PARTIAL** | Renders, but **mock** “Upcoming Events” (AI Ethics, etc.) not live DB |
| 11 | Export page | **PASS** | Event list includes E2E + emwpoer (2 attendees) |
| 12 | Notifications | **PARTIAL** | API 200; empty unread; badge still shows **3** |
| 13 | Settings page | **PASS** | Loads form (UI-only config) |

Screenshots: `/tmp/cadt-e2e/*.png`

---

## Bugs / issues found

| Sev | Issue | Detail |
|-----|--------|--------|
| **P1** | **Duplicate users in DB / UI** | Same emails listed twice (Admin + Student rows). React error: *Encountered two children with the same key* (`user_3G5B…`, `user_3GAA…`). |
| **P1** | **Dashboard fake metrics** | “Displaying 1-10 of **124** global events”, “**243** New User Signups”, “System Cap **76%**” do not match real data (8 events). Misleading for demo. |
| **P2** | **Calendar uses mock upcoming list** | Sidebar shows AI Ethics / Web Dev Hub / Pitch Day — not from API events. |
| **P2** | **Notifications badge vs empty state** | Sidebar “Notifications **3**” while page says “No unread notifications”. |
| **P2** | **Duplicate seed events** | Same titles appear twice (AI / Cyber / Web3). |
| **P2** | **Junk demo event** | Title `emwpoer` still live. |
| **P3** | **Clerk email OTP on new device** | Headless/automation always hits factor-two; fine for humans on known devices. |
| **P3** | **Slow API** | Some admin calls 1–4s (`/api/users`, bookings roster). |

---

## What was created during test

| Item | Status | Notes |
|------|--------|--------|
| `E2E Test Seminar Deploy Readiness` | PUBLISHED | capacity 25, Aug 20 2026 — **safe to keep or delete** |
| `E2E Draft Only Event` | DRAFT | should not show on student Discover |
| Check-in on `emwpoer` attendee | Applied | first roster row checked in |

---

## Not tested (needs student Google OAuth)

- Student Google login (`yeakkhaily3738@gmail.com`)  
- Student book → cancel  
- Student favorites / calendar authenticated  

---

## Demo script (admin only — proven)

1. Login admin → dashboard  
2. Create Event → fill → **Publish**  
3. Open student site → new event visible  
4. Open event with attendees → **Mark as checked in**  
5. Export page → select event with attendees  

---

## Recommendation before deploy

1. Fix **Users duplicate React keys** (dedupe by `clerkId` or unique DB constraint).  
2. Replace **hardcoded dashboard numbers** with real counts.  
3. Clean **duplicate / junk events** for presentation.  
4. Align **notification badge** with unread count.  
5. Optionally wire calendar to real events.  
6. Still run one **student booking** path (Google login manual once).  
