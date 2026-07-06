# Dynamic Calendar Implementation Plan

This document outlines the step-by-step engineering plan to migrate the current hardcoded calendar in `frontend-admin` to a dynamic, production-ready implementation using **FullCalendar**.

## 1. Technical Stack Selection
* **Core Library:** `FullCalendar` (`@fullcalendar/react`) - The most robust and feature-rich calendar library for React.
* **Plugins:** 
  * `@fullcalendar/daygrid` (for month view)
  * `@fullcalendar/timegrid` (for week/day views)
  * `@fullcalendar/interaction` (for drag/drop and click events)
  * `@fullcalendar/google-calendar` (for direct Google Calendar syncing)
* **Date Utility:** `date-fns` for any manual date manipulations.

## 2. Phase 1: Installation & Setup
We will install the required dependencies in the `frontend-admin` directory:
```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/google-calendar date-fns
```

## 3. Phase 2: Refactoring `CalendarView.tsx`
We will rewrite `CalendarView.tsx` to maintain the current premium aesthetic while replacing the static HTML grid with the dynamic `<FullCalendar />` component.

### UI / UX Requirements:
* **Custom Navigation:** The existing UI has custom "Previous", "Next", and "Today" buttons, as well as view switchers ("Month", "Week", "Day"). We will use the FullCalendar API (`calendarRef.current.getApi()`) to hook these custom React buttons directly into FullCalendar's state, preserving the custom UI instead of using FullCalendar's default toolbar.
* **Theming & Aesthetics:** We will inject custom CSS in a new `calendar.css` file to override FullCalendar's default styles (like border colors, background colors, and event pills) so that they seamlessly match the existing glassmorphism and Tailwind utility variables (`bg-surface-container`, `text-primary`, etc.).

## 4. Phase 3: Data Management & Integration

### Step 3A: Local State (Dummy Data)
Initially, we will populate the calendar with a dynamic array of Javascript objects. This allows us to ensure the UI looks perfect with events spanning multiple days, timed events, and categories.

```javascript
const events = [
  { title: 'AI Ethics Seminar', date: '2024-10-03', extendedProps: { category: 'Tech' } },
  // ...
]
```

### Step 3B: Google Calendar Integration (Optional/Configurable)
To fulfill the requirement of reading from a Google Calendar, we will implement the `@fullcalendar/google-calendar` plugin.
1. The user will need to provide a **Google API Key** (restricted to Google Calendar API).
2. The user will need the **Calendar ID** of a public Google Calendar.
3. We configure the `<FullCalendar>` component with:
   ```javascript
   googleCalendarApiKey: 'YOUR_API_KEY',
   events: 'your-calendar-id@group.calendar.google.com'
   ```

## 5. Phase 4: Event Interactions
* **Clicking a day:** Will open a "Create Event" modal or navigate to the `create` view (with the date pre-filled).
* **Clicking an event:** Will open a side-panel or modal showing event details (Location, Time, Attendees, Category).

## 6. Execution Steps
If you approve this plan, I will execute the following sequentially:
1. Run `npm install` for the FullCalendar packages.
2. Create a `Calendar.css` file for custom styling overrides.
3. Rewrite `CalendarView.tsx` to implement the dynamic FullCalendar, hooked up to your custom UI buttons.
4. Add interactive functionality (clicking days/events).
