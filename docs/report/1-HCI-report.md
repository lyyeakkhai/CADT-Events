# HCI Report — CADT Events

| Field | Value |
|---|---|
| **Course / Module** | Human–Computer Interaction (HCI) |
| **Project** | CADT Events Platform |
| **Team** | _[Names / IDs]_ |
| **Date** | _[YYYY-MM-DD]_ |
| **Version** | 0.1 (template) |

> **Status:** Draft template — fill each section with project-specific content.  
> **Related docs:** [`../product/prd.md`](../product/prd.md), frontend apps (`frontend/`, `frontend-admin/`)

---

## 1. Introduction

### 1.1 Introduction to the project

**CADT Events** is a centralized event management and discoverability platform for the Cambodia Academy of Digital Technology (CADT) community. It replaces fragmented Telegram announcements and manual sign-up processes with a web-based system where students can discover seminars and workshops, register quickly, and track participation, while administrators can publish events, manage capacity, and follow attendance more reliably.

The platform consists of a **student web app**, an **admin web app**, and a shared **Express + TypeScript API** backed by **PostgreSQL (Supabase)**. From an HCI perspective, the product must work for two very different audiences: students who need a fast, clear, mobile-friendly discovery and booking experience, and administrators who need efficient tools to create and manage events without unnecessary friction.

### 1.2 Objectives of this report

The objectives of this HCI report are to:

1. **Describe the project and its users** so design decisions are grounded in real CADT student and admin needs.
2. **Document user research findings, personas, and usability goals** that guided the interface design.
3. **Present the information architecture, interaction design, and visual system** of the student and admin applications.
4. **Explain key user flows** (e.g. browse → detail → register; admin create/publish event) and how feedback, errors, and empty states are handled.
5. **Evaluate usability** through methods such as heuristic review and usability testing, and record issues with severity and recommendations.
6. **Reflect on design–implementation gaps and future HCI improvements** for later iterations of CADT Events.

### 1.3 Purpose of this report

This report focuses on the human–computer interaction aspects of CADT Events: how users understand the product, complete tasks, and experience the interface on student and admin surfaces.

### 1.4 Scope
- **In scope:** student web UI, admin web UI, key flows, usability evaluation
- **Out of scope:** native mobile apps; deep backend/API implementation detail

### 1.5 Target users
| Persona | Goals | Context / constraints |
|---|---|---|
| Student | Discover & register for events | Mobile + desktop; limited time |
| Admin / organizer | Create events, manage attendance | Desktop; efficiency |
| _[Add more]_ | | |

---

## 2. User research & requirements

### 2.1 Research methods
_[Interviews, surveys, observation, competitive analysis — what you did or plan to do.]_

### 2.2 Key findings
1. _[Finding 1]_
2. _[Finding 2]_
3. _[Finding 3]_

### 2.3 User needs & pain points
| Need / pain | Current workaround | How CADT Events addresses it |
|---|---|---|
| | | |

### 2.4 Usability goals
- **Effectiveness:** _[e.g. complete registration without error]_
- **Efficiency:** _[e.g. find event in ≤ 3 clicks]_
- **Satisfaction:** _[e.g. SUS target score]_
- **Learnability:** _[e.g. first-time user completes core flow]_

---

## 3. Design principles & system

### 3.1 Design principles
_[e.g. clarity, feedback, consistency, accessibility, progressive disclosure]_

### 3.2 Information architecture
_[Sitemap / main navigation for student app and admin app.]_

```
Student app
├── Home / Events list
├── Event detail
├── My registrations
└── Profile / auth
Admin app
├── Dashboard
├── Events CRUD
├── Users / roles
└── ...
```

### 3.3 Visual design system
| Token / element | Choice | Rationale |
|---|---|---|
| Typography | _[fonts]_ | |
| Color palette | _[primary, secondary, semantic]_ | |
| Spacing / layout | _[grid, breakpoints]_ | |
| Components | _[buttons, cards, forms]_ | |

### 3.4 Accessibility considerations
- WCAG level target: _[A / AA]_
- Keyboard navigation, contrast, labels, focus states, etc.

---

## 4. Interaction design

### 4.1 Key user flows
For each flow: goal → steps → success criteria → error/edge cases.

1. **Browse & register for an event**
2. **Admin create / publish event**
3. **Check-in / attendance** _(if applicable)_
4. _[Additional flows]_

### 4.2 Wireframes / mockups
_[Link or embed low-fi and high-fi designs. Describe major screens.]_

| Screen | Purpose | Key interactions |
|---|---|---|
| | | |

### 4.3 Feedback & system status
_[Loading states, empty states, toasts, validation messages, error recovery.]_

---

## 5. Prototyping & evaluation

### 5.1 Prototype fidelity
_[Paper / Figma / coded UI — what was tested.]_

### 5.2 Evaluation methods
- Heuristic evaluation (Nielsen)
- Usability testing (task scenarios)
- SUS / other questionnaires
- _[Other]_

### 5.3 Test plan
| Task ID | Task description | Success metric |
|---|---|---|
| T1 | | |
| T2 | | |

### 5.4 Results & findings
| Issue | Severity | Recommendation | Status |
|---|---|---|---|
| | High / Med / Low | | Open / Fixed |

### 5.5 Heuristic checklist (summary)
_[Brief notes against major heuristics: visibility of status, match real world, user control, consistency, error prevention, recognition vs recall, flexibility, aesthetic minimalism, error recovery, help.]_

---

## 6. Implementation notes (UI)

### 6.1 Student frontend
- Stack: _[React, Vite, …]_
- Key pages/components: _[list]_
- Responsive behavior: _[breakpoints]_

### 6.2 Admin frontend
- Stack: _[React, Vite, …]_
- Key pages/components: _[list]_

### 6.3 Design–implementation gaps
_[Any intentional differences between mockups and shipped UI.]_

---

## 7. Reflection & future work

### 7.1 What worked well
### 7.2 What we would improve
### 7.3 Future HCI work
_[A/B tests, more personas, mobile-first polish, accessibility audit, etc.]_

---

## 8. Conclusion

_[2–4 paragraphs summarizing HCI contribution to the project.]_

---

## References

1. _[Nielsen Norman Group / course textbook / papers]_
2. _[Internal: PRD, design docs]_

## Appendices

- **A.** Personas (full)
- **B.** Wireframes / screenshots
- **C.** Usability test scripts & raw notes
- **D.** SUS scores / survey data

---

## Checklist before submission

- [ ] All placeholders replaced
- [ ] Screenshots included and captioned
- [ ] User flows match current product
- [ ] References formatted correctly
- [ ] Team names and date filled
- [ ] PDF export (if required by lecturer)
_
