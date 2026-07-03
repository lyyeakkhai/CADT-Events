// App-wide route path constants
// Use these instead of hard-coding strings in Link / navigate() calls.

export const ROUTES = {
  HOME: '/',
  DISCOVER: '/discover',
  MY_BOOKING: '/my-booking',
  CALENDAR: '/calendar',
  ABOUT: '/about',
  EVENT_DETAIL: '/events/:id',
  SEAT_SELECTION: '/events/:id/seats',
  BOOKING_CONFIRMED: '/booking/confirmed',

  // Auth
  ROLE_SELECTION: '/auth',
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  EXTERNAL_LOGIN: '/auth/external-login',
  ADMIN_LOGIN: '/auth/admin',
} as const;
