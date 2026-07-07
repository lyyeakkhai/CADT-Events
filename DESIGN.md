# CADT Events — Design System & Principles (User Frontend)

**Status**: Established during /plan-design-review (2026-07-07)
**Scope**: Student / regular user-facing frontend (Discovery home, event detail flow, My Bookings, shell). Admin frontend may differ.
**Reference**: Login screen branding (deep navy #0b2c6a) is source of truth for institutional identity.

## Core Brand & Color

- **Primary / Institutional**: `#0b2c6a` (deep navy) — used for headers, primary actions, emphasis. Matches login left panel.
- **Accent / Energy**: Warm amber `#d97706` or `#f59e0b` (amber-600/amber-500) — CTAs, highlights, "Register Now", badges when meaningful. Use sparingly.
- **Surfaces**: 
  - Light: `#f8fafc` (slate-50) or pure white `#ffffff`
  - Cards / elevated: white with subtle border `border-slate-200` or `border-slate-100`
  - Dark nav / footer / ribbon (if kept minimal): `#0f172a` (slate-900) or align closer to navy
- **Text**:
  - Primary: `text-slate-900` or near black for high contrast
  - Secondary / meta: `text-slate-600` or `text-slate-500`
  - Muted: `text-slate-400`
- **Never**: Generic purple gradients, excessive slate-only dark UIs for student home, low-contrast overlays on hero.

## Typography

- **Font**: Geist Variable (already imported) or Inter as strong fallback. Avoid pure system-ui as primary.
- **Scale & Weights** (aim for calm, readable, not shouty):
  - Hero title: `text-3xl md:text-4xl lg:text-5xl font-black tracking-[-0.02em]`
  - Section / card titles: `text-xl md:text-2xl font-extrabold tracking-tight`
  - Body / description: `text-[15px] leading-relaxed` (or 16px)
  - Meta / small: `text-sm font-medium` (never below 13-14px for critical info)
  - Badges / labels: `text-[10px] tracking-[0.5px] uppercase font-semibold` — use very sparingly; prefer subtle colored pill or plain text when possible.
- **Rule**: Delete 30%+ of bold/uppercase instances. Strong hierarchy comes from size + weight + position, not decoration.

## Spacing & Layout

- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Generous breathing: cards and sections need more air than current.
- Card padding: `p-5` or `24px` minimum on content.
- Section gaps: `py-10` or larger between major blocks.
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` (or 8 on desktop for breathing).

## Hero / Featured Event (Discovery Home)

- Strong visual anchor. Use high-quality, relevant photography (real CADT events, Cambodian students in tech settings, campus innovation spaces preferred over generic stock).
- Text must be highly legible: prefer solid dark overlay areas or careful gradient only on image bottom/text zone. Avoid heavy mix-blend-luminosity + low opacity that kills contrast.
- Content priority: Category/type badge (minimal), large title, short compelling description or key benefit, clear date / speaker / venue strip, prominent primary CTA "Register Now".
- One job: Drive excitement + immediate registration intent for the featured event.

## Event Cards (Discovery Grid)

- Image: Top, good aspect (recommend 16:9 or ~4:3), high quality, subtle treatment if needed.
- Content stack (clear hierarchy):
  1. Date + time (prominent, e.g. `text-sm font-semibold text-amber-700`)
  2. Title (large, bold, line-clamp-2)
  3. Short description (2 lines max)
  4. Speaker / Host
  5. Venue (subtle)
- Optional high-value: remaining seats or "Limited seats" indicator if data available.
- Action: Clear "View Details" or direct "Register" when appropriate. Primary button style using navy or amber consistently.
- No decorative left borders, no icon circles, no unnecessary shadows unless elevation is earned.

## Filters & Controls (Discovery)

- One primary search (prefer the filter bar; reduce or remove duplication in Navbar for Discover tab).
- Refined controls: clean selects or better — department as visual pills / segmented control where space allows.
- Results count + "Clear all" visible and lightweight.
- "Calendar View" as secondary action.
- On mobile: stack or collapse gracefully; ensure 44px+ touch targets.

## Navigation Shell (User)

- **Navbar**: Unify toward institutional navy where possible. Logo treatment clean (white card on dark ok if balanced). Centered tabs with clear active indicator (underline or background). Actions (search if kept, notifications, favorites, profile) right-aligned.
- **Session ribbon**: Remove or significantly de-emphasize for student users. "CADT Student Session" language feels internal. If status needed, make tiny and non-intrusive.
- **Footer**: Minimal and useful. Real links only. Keep simple institutional footer.

## States

- **Loading**: Skeleton cards that match final card dimensions + structure.
- **Empty**: Warm, actionable. Icon + clear message + primary action (e.g. "Clear filters" or "Explore all").
- **Error**: Friendly message + retry. Never silent fail.
- Micro: Subtle transitions on hover, active scale on buttons.

## Accessibility & Quality

- Minimum body text 15px with 4.5:1+ contrast.
- Touch targets ≥44px.
- Visible focus states.
- ARIA where interactive (filters, carousel if kept, cards as buttons or links).
- Keyboard navigable.

## Photography & Content Guidelines

- Prefer real or high-fidelity CADT event/campus photos.
- Descriptions must match titles and be specific (no copy-paste mismatch like "zero-trust" for non-security events).
- Dates in demo should be current/future relative to today.

## Anti-Slop Rules (enforced)

- No 3-column icon feature grids.
- No purple/indigo gradients as default.
- No excessive centered text.
- Cards only when the card *is* the primary interaction.
- One job per major section.
- Delete decorative elements that don't carry information.

## Next Steps After This Review

1. Implement homepage polish per decisions (hero, cards, branding unification, type scale).
2. Create / update real event data or seed with accurate descriptions.
3. After visual changes land, run `/design-review` (or use browse) on running site for pixel-level QA.
4. Expand DESIGN.md as more screens (SeatSelection, MyBooking, detail) are reviewed.

---

*This document was created as the direct output of /plan-design-review on the user home page. All future user-frontend work should calibrate against it.*

---

## GSTACK PLAN-DESIGN-REVIEW REPORT (User Home Page)

**Date**: 2026-07-07  
**Target**: User-facing home (DiscoveryFeed + AuthenticatedApp shell in `frontend/`)

| Pass | Dimension              | Initial | After Decisions | Notes |
|------|------------------------|---------|-----------------|-------|
| 0    | Overall completeness   | 3.5/10  | Target 8/10     | Major gaps in branding, hierarchy, polish |
| 1    | Information Architecture | 3/10  | 8/10            | Ribbon softened, navy unify, clear headings + single search |
| 2    | Interaction States     | 4/10    | 8/10            | Better skeletons, warm empty, add error handling |
| 3    | User Journey           | 5/10    | 8/10            | Stronger hero excitement, clearer CTAs, relevant meta |
| 4    | AI Slop Risk           | 2/10    | 9/10            | Major hero refresh + card hierarchy + remove templated patterns |
| 5    | Design System          | 1/10    | 9/10            | DESIGN.md created, login navy as source of truth |
| 6    | Responsive + a11y      | 5/10    | 8/10            | Larger text, 44px targets, contrast fixes |
| 7    | Unresolved Decisions   | Many    | 3 remaining     | Photo direction, seat counts on grid, pagination |

**Decisions made**: 5 (IA restructure, hero+card refresh, branding unification + DESIGN.md, states direction, type scale)

**VERDICT**: Plan for the user home page is now design-complete on paper. Implement the tasks below, then run `/design-review` on the live site (or use gstack browse for visual audit).

**Next**: 
- Apply changes (several high-impact edits already landed in this session)
- Seed better demo data + real images
- Expand to EventDetail + MyBooking

**Unresolved (small)**:
- Source of production photography for CADT events
- Whether to surface live seat counts on the grid (backend data)
- Full mobile filter pattern (pills vs sheet) — can be iterated post-launch

NO UNRESOLVED DECISIONS (major)
