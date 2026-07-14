# Final Presentation Slides — CADT Events

| Field | Value |
|---|---|
| **Deliverable** | Final project presentation |
| **Project** | CADT Events Platform |
| **Team** | _[Names / IDs]_ |
| **Date** | _[YYYY-MM-DD]_ |
| **Duration target** | _[e.g. 10–15 minutes + Q&A]_ |
| **Version** | 0.1 (template outline) |

> **Status:** Slide outline only — turn each section into 1+ slides (PowerPoint / Google Slides / Keynote / PDF).  
> **Tip:** Keep slides visual; put detail in speaker notes. Aim ~1 slide per minute.

---

## Introduction to the project (for speakers & deck intro)

**CADT Events** is a centralized event management and discoverability platform for the Cambodia Academy of Digital Technology (CADT). Campus seminars and workshops are often announced in busy Telegram channels and registered through manual forms or paper lists, so students miss relevant events and organizers struggle with capacity and attendance tracking.

The product provides:

- **Student web app** — discover events, view details, register with low friction  
- **Admin web app** — create/manage events, monitor registrations  
- **Backend API** — Express + TypeScript + Prisma  
- **PostgreSQL (Supabase)** — system of record  
- **Cloud deploy** — API, web, and admin services (e.g. Render)

This final presentation summarizes the full project for submission: problem, solution, architecture, design (HCI, database, backend), engineering process, demo, and lessons learned.

### Objectives of this presentation

1. **Introduce CADT Events** — context, problem, and who the product serves.  
2. **State clear project objectives** — what we set out to build and succeed at.  
3. **Show the solution** — architecture, tech stack, and main features (student + admin).  
4. **Highlight design work** — database, backend/API, and HCI/UX.  
5. **Demonstrate the working system** and evidence of quality (testing, deploy).  
6. **Reflect on process, challenges, and future work**, then open for Q&A.

---

## Slide map (overview)

| # | Slide title | Time (est.) |
|---|---|---|
| 1 | Title | 0:30 |
| 2 | Agenda | 0:30 |
| 3 | Introduction to the project | 1:00 |
| 4 | Project objectives | 0:45 |
| 5 | Problem & motivation | 1:00 |
| 6 | Goals & scope | 0:45 |
| 7 | Target users | 0:45 |
| 8 | Solution overview | 1:00 |
| 9 | System architecture | 1:30 |
| 10 | Tech stack | 0:45 |
| 11 | Key features (student) | 1:00 |
| 12 | Key features (admin) | 1:00 |
| 13 | Database design | 1:00 |
| 14 | Backend / API | 1:00 |
| 15 | HCI & UX highlights | 1:00 |
| 16 | SE process & teamwork | 0:45 |
| 17 | Demo | 2:00–3:00 |
| 18 | Testing & quality | 0:45 |
| 19 | Deployment | 0:45 |
| 20 | Challenges & lessons | 0:45 |
| 21 | Future work | 0:30 |
| 22 | Conclusion & Q&A | 0:30 |
| — | Backup slides | — |

---

## Slide 1 — Title

**Title:** CADT Events  
**Subtitle:** Campus event discovery & management platform  
**Team:** _[names]_  
**Course / institution:** _[…]_  
**Date:** _[…]_

_Visual:_ logo / campus-event hero image  

**Speaker notes:** Introduce team in one sentence each.

---

## Slide 2 — Agenda

1. Project introduction & objectives  
2. Problem & solution  
3. Architecture & features  
4. Design (DB, API, UX)  
5. Demo  
6. Process, challenges, future  
7. Q&A  

---

## Slide 3 — Introduction to the project

- **What:** CADT Events — centralized event platform for CADT  
- **Who:** Students (discover & register) and admins (publish & manage)  
- **How:** Student web + admin web + Express API + PostgreSQL  
- **Why:** Reduce missed events and replace manual, fragmented workflows  

**Speaker notes:** One-minute product pitch; avoid feature laundry list yet.

---

## Slide 4 — Project objectives

1. Deliver a **usable student experience** for discovering and joining campus events  
2. Provide **admin tools** to create events and manage registrations  
3. Implement a **secure, maintainable backend API** with clear business rules (e.g. capacity, roles)  
4. Store data reliably with a **well-designed relational schema**  
5. Follow a **software engineering process** (requirements → design → build → test → deploy)  
6. Ship a **demo-ready** system suitable for academic final presentation  

---

## Slide 5 — Problem & motivation

- Managing campus events is fragmented (chat groups, paper, spreadsheets)
- Students miss events; organizers lack visibility
- Need one place for **discover → register → manage**

**Speaker notes:** Real CADT context / anecdote.

---

## Slide 6 — Goals & scope

**Goals**
- Central event catalog for students  
- Reliable registration  
- Admin tools for organizers  
- Secure roles (RBAC)

**In scope / out of scope**
| In | Out |
|---|---|
| Web student + admin + API | Native mobile _(if out)_ |
| Postgres-backed data | _[…]_ |

---

## Slide 7 — Target users

| Persona | Need |
|---|---|
| Student | Find & join events quickly |
| Admin / organizer | Create events, track registrations |
| _[…]._ | |

---

## Slide 8 — Solution overview

**CADT Events** = three clients + one API + one database

```
Student Web  ──┐
               ├──▶ API (Express) ──▶ PostgreSQL
Admin Web    ──┘
```

One-liner value prop: _[fill]_

---

## Slide 9 — System architecture

- Diagram: packages `frontend`, `frontend-admin`, `backend`, DB  
- Deploy: Render (3 services) + Supabase Postgres  
- Auth / RBAC layer  

_Visual:_ architecture diagram from `docs/architecture/`

---

## Slide 10 — Tech stack

| Layer | Stack |
|---|---|
| Student UI | React + Vite |
| Admin UI | React + Vite |
| API | Express + TypeScript |
| Data | Prisma + PostgreSQL |
| CI / Deploy | GitHub Actions + Render |

---

## Slide 11 — Key features (student)

- Browse / search events  
- Event detail  
- Register / cancel _(as implemented)_  
- Profile / auth  
- Screenshots  

---

## Slide 12 — Key features (admin)

- Dashboard  
- Event CRUD  
- Registration management  
- Roles / users _(as implemented)_  
- Screenshots  

---

## Slide 13 — Database design

- ERD snapshot (main entities only)  
- Core tables: User, Event, Registration, Role…  
- Integrity rules (unique registration, capacity)  
- Prisma migrations  

---

## Slide 14 — Backend / API

- REST conventions  
- Auth middleware  
- Feature modules  
- Sample endpoints (`GET /api/health`, events, registrations)  
- Error handling pattern  

---

## Slide 15 — HCI & UX highlights

- Design principles used  
- Key flow (register in N steps)  
- Before/after or wireframe → UI  
- Accessibility / responsive notes  

---

## Slide 16 — SE process & teamwork

- Process model (Agile / sprints)  
- Roles  
- Tools: GitHub, CI, docs  
- Timeline / milestones (1 visual)  

---

## Slide 17 — Live demo

**Scripted path (keep short):**
1. Student: list → detail → register  
2. Admin: create/edit event → view registrations  
3. _(Optional)_ health / deploy URL  

**Backup:** pre-recorded video if network fails  

---

## Slide 18 — Testing & quality

- Test levels used  
- CI builds (3 packages)  
- Manual / E2E highlights  
- Defect examples fixed  

---

## Slide 19 — Deployment

| Service | Production URL |
|---|---|
| API | `https://cadt-events-api.onrender.com` |
| Web | `https://cadt-events-web.onrender.com` |
| Admin | `https://cadt-events-admin.onrender.com` |

- Auto-deploy on push to `main`  
- Health check: `/api/health`  

---

## Slide 20 — Challenges & lessons

| Challenge | What we learned |
|---|---|
| | |
| | |

Keep to 3 bullets max on slide.

---

## Slide 21 — Future work

1. _[e.g. richer notifications / Telegram]_  
2. _[better analytics]_  
3. _[mobile polish / PWA]_  
4. _[deeper automated tests]_  

---

## Slide 22 — Conclusion & Q&A

- Restate problem → solution → impact  
- Thank you  
- **Questions?**  

Team contacts / GitHub: _[link]_

---

## Backup slides (optional)

- **B1.** Full requirements list  
- **B2.** Detailed ERD  
- **B3.** Sequence diagram (registration)  
- **B4.** Security & RBAC detail  
- **B5.** Sprint burndown / contribution split  
- **B6.** Known limitations  

---

## Presentation checklist

- [ ] Slide deck file created (`.pptx` / Google Slides) from this outline  
- [ ] Architecture + ERD diagrams readable from the back of the room  
- [ ] Demo account credentials ready (non-production secrets)  
- [ ] Offline demo video backup  
- [ ] Speaker notes assigned per team member  
- [ ] Rehearsed within time limit  
- [ ] Production URLs verified alive before presentation day  

---

## Export notes

When ready to produce the actual deck:
1. Copy each slide title + 3–5 bullets into your slide tool  
2. Prefer diagrams/screenshots over long text  
3. Consistent template: CADT colors, one font family, large titles  
4. File naming: `CADT-Events-Final-Presentation.pptx`
