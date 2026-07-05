import re

with open('docs/architecture/erd-schema.md', 'r') as f:
    content = f.read()

# Replace the mermaid section
new_mermaid = """```mermaid
erDiagram
    departments {
        uuid id PK
        string name
        string code UK
        text description "nullable"
        string logo_url "nullable"
    }

    users {
        uuid id PK
        string clerk_id UK "nullable"
        string email UK
        string password_hash "nullable"
        string name
        string student_staff_id UK "nullable"
        string organization "nullable"
        string avatar_url "nullable"
        enum role
        uuid department_id FK "nullable"
        int total_credits
        boolean is_blocked
        timestamp blocked_at "nullable"
        uuid blocked_by "nullable"
        timestamp deleted_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    speakers {
        uuid id PK
        string name
        string title_role "nullable"
        string organization "nullable"
        text bio "nullable"
        string profile_image_url "nullable"
    }

    venues {
        uuid id PK
        string name
        int total_capacity
        string address "nullable"
        string building_floor "nullable"
    }

    venue_seats {
        uuid id PK
        uuid venue_id FK
        string seat_label
        string seating_zone "nullable"
    }

    events {
        uuid id PK
        string title
        text description
        string cover_image_url "nullable"
        uuid venue_id FK "nullable"
        uuid department_id FK "nullable"
        string event_type "nullable"
        enum status
        timestamp start_timestamp
        timestamp end_timestamp
        string badge_text "nullable"
        boolean is_featured
        int credit_value
        int max_registrations_per_user
        timestamp deleted_at "nullable"
        uuid admin_id FK "nullable"
        timestamp created_at
        timestamp updated_at
    }

    event_agenda_items {
        uuid id PK
        uuid event_id FK
        timestamp start_time
        timestamp end_time
        string title
        text description "nullable"
        uuid speaker_id FK "nullable"
        int sort_order
    }

    event_speakers {
        uuid event_id PK, FK
        uuid speaker_id PK, FK
    }

    categories {
        uuid id PK
        string name UK
        string description "nullable"
        string icon_url "nullable"
        string color "nullable"
    }

    event_categories {
        uuid event_id PK, FK
        uuid category_id PK, FK
    }

    event_seats {
        uuid id PK
        uuid event_id FK
        uuid venue_seat_id FK
        enum status
    }

    seat_holds {
        uuid id PK
        uuid event_seat_id FK, UK
        uuid user_id FK
        timestamp held_at
        timestamp expires_at
    }

    bookings {
        uuid id PK
        string booking_reference_id UK
        uuid user_id FK
        uuid event_id FK
        uuid event_seat_id FK, UK "nullable"
        enum status
        uuid qr_code_token UK
        timestamp checked_in_at "nullable"
        uuid checked_in_by "nullable"
        timestamp deleted_at "nullable"
        timestamp created_at
        timestamp updated_at
    }

    favorites {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        timestamp created_at
    }

    telegram_links {
        uuid id PK
        uuid user_id FK, UK
        string chat_id UK
        string username "nullable"
        timestamp created_at
    }

    telegram_link_tokens {
        uuid id PK
        uuid user_id FK
        string token UK
        timestamp expires_at
        timestamp used_at "nullable"
    }

    notifications {
        uuid id PK
        uuid user_id FK
        enum type
        uuid reference_id "nullable"
        string title
        text message
        boolean is_read
        timestamp sent_at
    }

    notification_preferences {
        uuid id PK
        uuid user_id FK, UK
        boolean event_reminders
        boolean seat_alerts
        boolean new_events
        boolean event_updates
    }

    credit_transactions {
        uuid id PK
        uuid user_id FK
        enum type
        int amount
        int balance_before
        int balance_after
        uuid reference_id "nullable"
        text note "nullable"
        timestamp created_at
        uuid created_by "nullable"
    }

    %% ─── Core Relationships ───
    departments ||--o{ users             : "belongs to (1:N)"
    departments ||--o{ events            : "organises (1:N)"
    users       ||--o{ bookings          : "makes (1:N)"
    users       ||--o{ favorites         : "saves (1:N)"
    users       ||--o{ seat_holds        : "holds (1:N)"
    users       ||--o{ notifications     : "receives (1:N)"
    users       ||--o{ events            : "administers (1:N)"
    users       ||--o| telegram_links    : "links (1:1)"
    users       ||--o{ telegram_link_tokens : "generates (1:N)"
    users       ||--o| notification_preferences : "configures (1:1)"
    users       ||--o{ credit_transactions : "logs (1:N)"

    %% ─── Event Relationships ───
    venues      ||--o{ venue_seats       : "contains (1:N)"
    venues      ||--o{ events            : "hosts (1:N)"
    events      ||--|{ event_speakers    : "features (1:N)"
    events      ||--|{ event_categories  : "tagged (1:N)"
    events      ||--o{ event_seats       : "allocates (1:N)"
    events      ||--o{ bookings          : "receives (1:N)"
    events      ||--o{ favorites         : "bookmarked (1:N)"
    events      ||--o{ event_agenda_items : "has (1:N)"

    %% ─── Pivot Relationships ───
    speakers    ||--|{ event_speakers    : "presents at (1:N)"
    speakers    ||--o{ event_agenda_items : "presents at (1:N)"
    categories  ||--|{ event_categories  : "groups (1:N)"
    venue_seats ||--o{ event_seats       : "instantiated as (1:N)"

    %% ─── Seat Relationships ───
    event_seats ||--o| seat_holds        : "locked by (1:1)"
    event_seats ||--o| bookings          : "reserved by (1:1)"
```"""
content = re.sub(r'```mermaid.*?```', new_mermaid, content, flags=re.DOTALL)

# Add missing schemas to Section 3
missing_schemas = """---

### 3.17 `event_agenda_items`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `event_id` | UUID | FK → `events.id` ON DELETE CASCADE | |
| `start_time` | TIMESTAMP | NOT NULL | |
| `end_time` | TIMESTAMP | NOT NULL | |
| `title` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NULLABLE | |
| `speaker_id` | UUID | FK → `speakers.id`, NULLABLE | |
| `sort_order` | INT | Default: `0` | |

---

### 3.18 `telegram_link_tokens`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE | |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | |
| `expires_at` | TIMESTAMP | NOT NULL | |
| `used_at` | TIMESTAMP | NULLABLE | |

---

### 3.19 `credit_transactions`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | UUID | PK | |
| `user_id` | UUID | FK → `users.id` ON DELETE CASCADE | |
| `type` | ENUM | NOT NULL | `EARNED`, `BONUS`, `DEDUCTED`, `EXPIRED` |
| `amount` | INT | NOT NULL | |
| `balance_before` | INT | NOT NULL | |
| `balance_after` | INT | NOT NULL | |
| `reference_id` | UUID | NULLABLE | |
| `note` | TEXT | NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL, Default: `NOW()` | |
| `created_by` | UUID | FK → `users.id`, NULLABLE | Admin who triggered |
"""
if "### 3.17" not in content:
    content = content.replace("## 4. Performance Indexes", missing_schemas + "\n## 4. Performance Indexes")

with open('docs/architecture/erd-schema.md', 'w') as f:
    f.write(content)
