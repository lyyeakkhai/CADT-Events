# Product Requirements Document (PRD)

## 1. Document Control

* **Project Name:** CADT Events (V1)
* **Author:** Product Manager / Senior Software Engineer
* **Status:** Approved / Ready for Architecture Design
* **Target Stack:** Next.js (TypeScript), Tailwind CSS, Express.js (TypeScript), Prisma ORM, PostgreSQL (Supabase), Docker, VPS

---

## 2. Executive Summary & Objective

CADT Events is a centralized event management and discoverability platform designed specifically for the Cambodia Academy of Digital Technology (CADT) community. The platform eliminates communication fragmentation by replacing chaotic Telegram chat feeds with a high-performance web dashboard, featuring frictionless one-click registration, personalized Telegram direct-message (DM) notifications, and a gamified student credit/badge system.

---

## 3. Problem Statement

The current reliance on public Telegram channels for announcing seminars, tech talks, and workshops results in significant operational friction:

* **Information Inundation:** Critical announcements are buried under standard chat histories. Students frequently mute large group channels, causing them to miss key academic and career opportunities.
* **Zero Personalization:** Students interested in highly specific tracks (e.g., AI, Fullstack, Soft Skills) cannot filter incoming events based on their preferences.
* **Registration Bottlenecks:** Manual registration forms and on-site paper sign-in sheets slow down entries, cause massive administrative overhead, and lead to inaccurate attendance tracking.

---

## 4. User Personas

| Persona | Role / Context | Core Pain Points | Primary Needs |
| --- | --- | --- | --- |
| **The CADT Student** | Enrolled in digital tracks (CS, Telecom, eCommerce). | Mutes channels due to spam; misses specific tech seminars; detests long registration queues. | A unified feed to instantly discover relevant talks, book a seat in 1 click, and track earned event credits. |
| **The Academy Administrator** | Event organizer, lecturer, or department coordinator. | Spends hours compiling Excel sign-in sheets; manually tallies attendance; lacks data on student participation trends. | An intuitive portal to publish events, instantly notify interested segments, and cleanly track and export attendance. |

---

## 5. Functional Scope (Features & Requirements)

### 5.1. Core Module: Student Discovery & Booking Hub

The student-facing interface is a web application optimized for mobile viewports, prioritizing visual hierarchy and zero-friction navigation.

* **Centralized Event Grid:** A clean, visually rich gallery displaying upcoming seminars. Each event card highlights category badges (e.g., **AI**, **Software Engineering**, **Soft Skills**), date, time, remaining capacity, and speaker profiles.
* **Advanced Categorization & Filtering:** Dynamic client-side filtering matching student interest domains.
* **"Cinema-Style" 1-Click Booking:**
  * Logged-in users register instantly with a single button press.
  * The platform automatically extracts student profile data (Name, ID, Major) from their session token.
  * Generates a virtual "Ticket" marked as `REGISTERED`.
* **Race-Condition Concurrency Control:** System must strictly enforce event caps. If a workshop holds 40 seats, the backend must safely reject concurrent user registrations when the limit is breached.

### 5.2. Core Module: Gamification & Profile Engine

Encourages long-term student engagement by providing tangible recognition for event participation.

* **Student Profile Dashboard:** Acts as an automated "Event Resume" displaying all past seminars attended.
* **Credit Accrual System:** Every successfully verified attendance logs a predefined amount of "Academic/Event Credits" to the student profile.
* **Automated Badge Tiering:** Prisma schema triggers automatically progress students through tiers based on total credits accumulated:
  * *Bronze Attendee* (Baseline tier)
  * *Silver Engineer* (Intermediate milestone)
  * *CADT Tech Elite* (Advanced tier)

### 5.3. Core Module: Specialized Telegram Bot Integration

Solves the "muted channel" issue by delivering highly targeted, high-priority notifications.

* **User Account Linkage:** A secure opt-in flow where students tie their web profile to their Telegram profile using a deep-linked temporary token (`/start token_hash`).
* **Segmented DM Broadcasting:** Direct messages are delivered strictly based on saved user category preferences. If a student checks "AI", the bot sends a direct notification when an AI event drops.
* **Event Reminders:** Automated, non-intrusive reminder alerts dispatched at 24-hour and 1-hour marks prior to event execution.

### 5.4. Core Module: Admin Control Portal & Attendance Management

A clean desktop-first management application enabling effortless data entry and operational execution.

* **Event CRUD Interface:** Intuitive form handling event creation, descriptions, category allocation, maximum attendance caps, and speaker assignments.
* **Omnichannel Notification Control:** Single-click distribution that simultaneously creates the web entry, broadcasts to the main public Telegram group channel, and fires private DM alerts to subscribed segments.
* **Traditional Web Attendance Check-in (V1 Approach):**
  * Admin opens the live event roster page on their device at the venue door.
  * Displays a list of registered students with search functionality.
  * Features immediate toggle actions (`Mark Checked-In` / `Mark Checked-Out`) with real-time backend state persistence.
* **Data Export Pipeline:** One-click generation of structured CSV/Excel documents containing Student Name, ID, Major, Check-In Time, and Check-Out Time for internal administrative audits.

---

## 6. Non-Functional Requirements & System Constraints

### 6.1. Performance & Reliability

* **Response Times:** Standard API read/write cycles must resolve under 200 milliseconds to guarantee an exceptional user registration experience.
* **High-Concurrency Stability:** The reservation engine must manage rapid bursts of user traffic during high-profile tech seminar openings without database lockups.

### 6.2. Technical Implementation Architecture

* **Frontend Ecosystem:** Next.js (TypeScript) utilizing Tailwind CSS to achieve a rapid, unified, design-system-driven user interface.
* **Backend Services:** Express.js (TypeScript) backend runtime enforcing clean architectural separation, middleware-based validation, and robust routing.
* **Data Tier:** PostgreSQL database cluster hosted via Supabase, safely navigated via a type-safe Prisma ORM configuration.
* **DevOps & Infrastructure:** Containerized runtime profiles packaged with Docker and deployed to an optimized Virtual Private Server (VPS) configuration for high economic efficiency and environment stability.

---

## 7. Success Criteria & Key Metrics

The viability and success of the CADT Events V1 release will be calculated using three core technical and product KPIs:

1. **Platform Adoption:** Over 60% of active CADT students creating profiles and linking their Telegram accounts within 45 days of deployment.
2. **Administrative Efficiency:** Reduction of event check-in processing times from minutes to under 3 seconds per student transaction via the dashboard workspace.
3. **Discovery Conversion Rate:** A demonstrable lift in seat utilization percentages across specialized sub-category seminars compared to legacy static group pinning metrics.
