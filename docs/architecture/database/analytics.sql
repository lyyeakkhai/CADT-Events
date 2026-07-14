-- ─────────────────────────────────────────────────────────────────────────────
-- CADT Events — Analytics Views
-- Source of truth for all DB-level analytics views.
-- Apply manually via SUPER_ADMIN or as part of post-migration hook.
-- Last updated: 2026-07-04
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────
-- 1. Event Attendance Summary
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_event_attendance AS
SELECT
    e.id                                                      AS event_id,
    e.title                                                   AS event_title,
    d.name                                                    AS department,
    e.start_timestamp,
    e.credit_value,
    COUNT(b.id)                                               AS total_bookings,
    COUNT(b.checked_in_at)                                    AS total_attended,
    ROUND(
        COUNT(b.checked_in_at)::NUMERIC / NULLIF(COUNT(b.id), 0) * 100, 1
    )                                                         AS attendance_rate_pct,
    v.total_capacity,
    ROUND(
        COUNT(b.id)::NUMERIC / NULLIF(v.total_capacity, 0) * 100, 1
    )                                                         AS fill_rate_pct
FROM events e
LEFT JOIN departments  d ON e.department_id  = d.id
LEFT JOIN venues       v ON e.venue_id       = v.id
LEFT JOIN bookings     b ON e.id             = b.event_id
                         AND b.deleted_at IS NULL
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.title, d.name, e.start_timestamp, e.credit_value,
         v.total_capacity;

-- ─────────────────────────────────────────────
-- 2. Student Credit Leaderboard
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_student_leaderboard AS
SELECT
    u.id,
    u.name,
    u.email,
    u.student_staff_id                                        AS student_id,
    d.name                                                    AS department,
    u.total_credits,
    COUNT(b.id)                                               AS events_attended,
    RANK() OVER (ORDER BY u.total_credits DESC)               AS credit_rank
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN bookings    b ON u.id            = b.user_id
                       AND b.checked_in_at IS NOT NULL
                       AND b.deleted_at    IS NULL
WHERE u.deleted_at IS NULL
  AND u.role = 'STUDENT'
GROUP BY u.id, u.name, u.email, u.student_staff_id, d.name, u.total_credits;

-- ─────────────────────────────────────────────
-- 3. Department Engagement Report
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_department_engagement AS
SELECT
    d.code,
    d.name                                                    AS department,
    COUNT(DISTINCT e.id)                                      AS events_hosted,
    COUNT(DISTINCT b.user_id)                                 AS unique_attendees,
    COUNT(b.id)                                               AS total_bookings,
    COUNT(b.checked_in_at)                                    AS total_check_ins,
    ROUND(
        COUNT(b.checked_in_at)::NUMERIC / NULLIF(COUNT(b.id), 0) * 100, 1
    )                                                         AS dept_attendance_rate_pct,
    SUM(e.credit_value * (b.checked_in_at IS NOT NULL)::INT)  AS total_credits_issued
FROM departments d
LEFT JOIN events    e ON d.id  = e.department_id AND e.deleted_at IS NULL
LEFT JOIN bookings  b ON e.id  = b.event_id      AND b.deleted_at IS NULL
GROUP BY d.id, d.code, d.name;

-- ─────────────────────────────────────────────
-- 4. Seat Utilisation Report
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_seat_utilisation AS
SELECT
    e.id                                                      AS event_id,
    e.title,
    v.name                                                    AS venue,
    v.total_capacity,
    COUNT(es.id)                                              AS seats_allocated,
    COUNT(CASE WHEN es.status = 'OCCUPIED'  THEN 1 END)       AS seats_occupied,
    COUNT(CASE WHEN es.status = 'HELD'      THEN 1 END)       AS seats_held,
    COUNT(CASE WHEN es.status = 'AVAILABLE' THEN 1 END)       AS seats_available
FROM events e
JOIN venues      v  ON e.venue_id = v.id
JOIN event_seats es ON e.id       = es.event_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.title, v.name, v.total_capacity;

-- ─────────────────────────────────────────────
-- 5. Monthly Registration Trend
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_monthly_registrations AS
SELECT
    DATE_TRUNC('month', b.created_at)                        AS month,
    COUNT(b.id)                                              AS total_registrations,
    COUNT(b.checked_in_at)                                   AS total_attended,
    COUNT(DISTINCT b.user_id)                                AS unique_students
FROM bookings b
WHERE b.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', b.created_at)
ORDER BY month DESC;

-- ─────────────────────────────────────────────
-- 6. Top Events by Attendance (for homepage widget)
-- ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_top_events AS
SELECT
    e.id,
    e.title,
    e.start_timestamp,
    e.cover_image_url,
    COUNT(b.id)                                              AS registration_count,
    COUNT(b.checked_in_at)                                   AS attendance_count
FROM events e
LEFT JOIN bookings b ON e.id = b.event_id AND b.deleted_at IS NULL
WHERE e.status     = 'COMPLETED'
  AND e.deleted_at IS NULL
GROUP BY e.id, e.title, e.start_timestamp, e.cover_image_url
ORDER BY attendance_count DESC
LIMIT 10;
