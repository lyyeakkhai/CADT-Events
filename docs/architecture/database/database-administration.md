# Database Administration — CADT Events

> **Engine:** PostgreSQL 16+  
> **ORM:** Prisma (schema-first, migration-controlled)  
> **Host:** Supabase (managed PostgreSQL) or self-hosted  
> **Last updated:** 2026-07-04

---

## 1. Migration Workflow

All schema changes **must** flow through Prisma migrations. Direct DDL on the database is prohibited except for SUPER_ADMIN-run analytics views.

### 1.1 Development Workflow

```bash
# 1. Edit backend/prisma/schema.prisma

# 2. Generate and apply migration (creates migration file in prisma/migrations/)
cd backend
npx prisma migrate dev --name <descriptive_name>

# 3. Regenerate Prisma Client
npx prisma generate

# 4. Inspect the DB visually
npx prisma studio
```

### 1.2 Production Deployment

```bash
# CI/CD pipeline (GitHub Actions)
npx prisma migrate deploy   # applies all pending migrations — never interactive
npx prisma generate         # regenerates client
```

### 1.3 Naming Convention for Migrations

| Pattern | Example |
|---------|---------|
| `add_<table>` | `add_departments` |
| `add_<column>_to_<table>` | `add_credit_value_to_events` |
| `create_<table>` | `create_seat_holds` |
| `drop_<column>_from_<table>` | `drop_available_seats_from_events` |
| `alter_<column>_type` | `alter_booking_reference_to_varchar` |
| `add_index_<name>` | `add_index_events_featured` |

---

## 2. Seed Data

### 2.1 Run the seed script

```bash
cd backend
npx prisma db seed
```

### 2.2 Seed file structure (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Departments
  const departments = await prisma.department.createMany({
    data: [
      { name: 'Computer Science', code: 'CS' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Electrical Engineering', code: 'EE' },
      { name: 'Business Administration', code: 'BA' },
    ],
    skipDuplicates: true,
  });

  // 2. Seed Categories
  await prisma.category.createMany({
    data: [
      { name: 'AI & Machine Learning' },
      { name: 'Cybersecurity' },
      { name: 'Web Development' },
      { name: 'Soft Skills' },
      { name: 'Entrepreneurship' },
      { name: 'Data Science' },
    ],
    skipDuplicates: true,
  });

  // 3. Seed Venues
  await prisma.venue.createMany({
    data: [
      { name: 'Main Auditorium', totalCapacity: 500 },
      { name: 'Room A101', totalCapacity: 80 },
      { name: 'Room B201', totalCapacity: 60 },
      { name: 'Conference Hall', totalCapacity: 200 },
    ],
    skipDuplicates: true,
  });

  // 4. Seed Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@cadt.edu.kh' },
    update: {},
    create: {
      email: 'admin@cadt.edu.kh',
      name: 'System Administrator',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 3. Analytics Views & Reporting SQL

These read-only views support the Admin Analytics Dashboard and CSV export features.

### 3.1 Event Attendance Summary

```sql
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
```

---

### 3.2 Student Credit Leaderboard

```sql
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
```

---

### 3.3 Department Engagement Report

```sql
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
```

---

### 3.4 Seat Utilisation Report

```sql
CREATE OR REPLACE VIEW v_seat_utilisation AS
SELECT
    e.id                                                      AS event_id,
    e.title,
    v.name                                                    AS venue,
    v.total_capacity,
    COUNT(es.id)                                              AS seats_allocated,
    COUNT(CASE WHEN es.status = 'OCCUPIED' THEN 1 END)        AS seats_occupied,
    COUNT(CASE WHEN es.status = 'HELD'     THEN 1 END)        AS seats_held,
    COUNT(CASE WHEN es.status = 'AVAILABLE' THEN 1 END)       AS seats_available
FROM events e
JOIN venues     v  ON e.venue_id = v.id
JOIN event_seats es ON e.id      = es.event_id
WHERE e.deleted_at IS NULL
GROUP BY e.id, e.title, v.name, v.total_capacity;
```

---

### 3.5 Monthly Registration Trend

```sql
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
```

---

## 4. Background Job Administration

### 4.1 Seat Hold Sweeper

Runs every 60 seconds to release expired seat locks.

```sql
-- Sweeper query (runs inside cron worker)
WITH expired AS (
    DELETE FROM seat_holds
    WHERE expires_at < NOW()
    RETURNING event_seat_id
)
UPDATE event_seats
SET    status = 'AVAILABLE'
WHERE  id IN (SELECT event_seat_id FROM expired);
```

**Application worker (BullMQ / pg_cron):**
```sql
-- If using pg_cron extension (Supabase compatible)
SELECT cron.schedule(
  'seat-hold-sweeper',
  '* * * * *',  -- every minute
  $$
    WITH expired AS (
      DELETE FROM seat_holds WHERE expires_at < NOW() RETURNING event_seat_id
    )
    UPDATE event_seats SET status = 'AVAILABLE'
    WHERE id IN (SELECT event_seat_id FROM expired);
  $$
);
```

### 4.2 Telegram Notification Scheduler

Two jobs are queued per event at creation time:

| Job | Delay | Condition |
|-----|-------|-----------|
| `24h-reminder` | `event.start_timestamp - 24h` | `notification_preferences.event_reminders = TRUE` |
| `30min-reminder` | `event.start_timestamp - 30m` | `notification_preferences.event_reminders = TRUE` |

Query to build recipient list:
```sql
SELECT
    u.id,
    u.name,
    tl.chat_id                          AS telegram_chat_id,
    e.title                             AS event_title,
    e.start_timestamp,
    v.name                              AS venue_name
FROM bookings         b
JOIN users            u  ON b.user_id  = u.id
JOIN events           e  ON b.event_id = e.id
LEFT JOIN telegram_links tl ON u.id   = tl.user_id
JOIN notification_preferences np ON u.id = np.user_id
LEFT JOIN venues      v  ON e.venue_id = v.id
WHERE b.event_id   = :event_id
  AND b.status     = 'CONFIRMED'
  AND b.deleted_at IS NULL
  AND np.event_reminders = TRUE
  AND tl.chat_id IS NOT NULL;
```

---

## 5. Backup & Recovery

| Strategy | Frequency | Retention | Tool |
|----------|-----------|-----------|------|
| Automated snapshot | Daily | 7 days | Supabase built-in / `pg_dump` |
| Point-in-time recovery | Continuous WAL | 48 hours | Supabase Pro |
| Manual export | Before each major migration | Indefinite | `pg_dump -Fc` |

### 5.1 Manual Backup Command
```bash
pg_dump \
  --format=custom \
  --no-acl \
  --no-owner \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  > "cadt_events_$(date +%Y%m%d_%H%M%S).dump"
```

### 5.2 Restore Command
```bash
pg_restore \
  --clean \
  --no-acl \
  --no-owner \
  --host=$DB_HOST \
  --port=$DB_PORT \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  cadt_events_20260704_120000.dump
```

---

## 6. Database Health Checks

### 6.1 Index Usage Report
```sql
-- Check if indexes are being used (run after 1+ week of traffic)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan          AS scans,
    idx_tup_read      AS rows_read,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- low scan count = unused index candidate
```

### 6.2 Table Size Report
```sql
SELECT
    relname                                              AS table_name,
    pg_size_pretty(pg_total_relation_size(relid))        AS total_size,
    pg_size_pretty(pg_relation_size(relid))              AS table_size,
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

### 6.3 Slow Query Detection
```sql
-- Enable pg_stat_statements extension first
SELECT
    query,
    calls,
    ROUND(mean_exec_time::NUMERIC, 2) AS avg_ms,
    ROUND(total_exec_time::NUMERIC, 2) AS total_ms
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries slower than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 6.4 Connection Pool Status
```sql
SELECT
    state,
    COUNT(*) AS connections,
    MAX(EXTRACT(EPOCH FROM (NOW() - state_change))) AS longest_seconds
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;
```

---

## 7. Soft-Delete Maintenance

### 7.1 Purge old soft-deleted records (quarterly)
```sql
-- Permanently delete records soft-deleted more than 90 days ago
-- Run manually by SUPER_ADMIN after audit review

DELETE FROM bookings WHERE deleted_at < NOW() - INTERVAL '90 days';
DELETE FROM events   WHERE deleted_at < NOW() - INTERVAL '90 days';
DELETE FROM users    WHERE deleted_at < NOW() - INTERVAL '90 days';
```

> ⚠️ **Caution:** Run inside a transaction and verify counts before committing.

```sql
BEGIN;
SELECT COUNT(*) FROM bookings WHERE deleted_at < NOW() - INTERVAL '90 days'; -- verify
DELETE FROM bookings WHERE deleted_at < NOW() - INTERVAL '90 days';
-- Review row count in output, then:
COMMIT;  -- or ROLLBACK if unexpected
```

---

## 8. Analytics SQL File Location

All analytics views are maintained in:

```
backend/prisma/
└── migrations/           ← Schema evolution (auto-generated by Prisma)
docs/architecture/
└── database/
    ├── analytics.sql     ← All CREATE VIEW statements (source of truth)
    ├── indexes.sql       ← All CREATE INDEX statements
    └── maintenance.sql   ← Sweeper, purge, and health check queries
```
