# SeaORM Data Models & Database Schema

This document details all database entities, relations, table definitions, and multi-dialect configurations implemented via **SeaORM** in `crates/engine/src/db/sea/`.

---

## 1. Database Entity Overview

The Rust engine abstracts persistence through SeaORM entities, supporting **PostgreSQL**, **MySQL**, and **SQLite** without dialect-specific raw queries.

```mermaid
erDiagram
    RAW_EVENTS ||--o{ SESSIONS : "belongs to"
    SESSIONS ||--o{ USERS : "stitched to"
    RAW_EVENTS ||--o{ CONVERSIONS : "attributes"
    WORKSPACES ||--o{ CONTAINERS : "contains"
    CONTAINERS ||--o{ TAGS : "manages"
    CONTAINERS ||--o{ TRIGGERS : "evaluates"
    CONTAINERS ||--o{ VARIABLES : "references"
    WORKSPACES ||--o{ VERSIONS : "publishes"
```

---

## 2. SeaORM Entity Specifications

### 2.1 `raw_events` (`crates/engine/src/db/sea/raw_events.rs`)
Stores all raw incoming wire-protocol hits, Measurement Protocol hits, and cookieless pings.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (PK) | No | Unique event hit ID (e.g., `hit_1731900000_abc123`). |
| `property_id` | `String` | No | Target GA4 property identifier (`prop_1` or `G-XXXXXX`). |
| `stream_id` | `String` | No | Associated data stream identifier. |
| `event_name` | `String` | No | Name of event (`page_view`, `app_open`, `purchase`). |
| `client_id` | `String` | No | Pseudo-anonymous device identifier (`cid`). |
| `user_id` | `String` | Yes | First-party authenticated business user ID (`uid`). |
| `session_id` | `i64` | Yes | Monotonic epoch session timestamp (`sid`). |
| `session_number` | `i64` | Yes | Monotonic session index for visitor (`sne`). |
| `timestamp_micros` | `i64` | No | Monotonic timestamp in microseconds. |
| `event_params_json` | `String` | No | Sanitized JSON object of parameters (PII redacted). |
| `user_properties_json`| `String` | Yes | JSON object of user properties. |
| `consent_state_json` | `String` | Yes | Consent Mode v2 decoded state (`analytics_storage`, etc.). |
| `gcs` | `String` | Yes | Encoded Google Consent Status string (e.g. `G111`, `G100`). |
| `gcd` | `String` | Yes | Encoded Google Consent Detail string (e.g. `13r3r3r5r5l1`). |
| `ip_address` | `String` | Yes | Client IP address (optionally anonymized). |
| `user_agent` | `String` | Yes | Raw User-Agent string. |
| `is_conversion` | `bool` | No | Flag indicating if event is marked as a Key Event. |

---

### 2.2 `sessions` (`crates/engine/src/db/sea/sessions.rs`)
Tracks visitor session lifecycles, engagement metrics, and campaign attribution source.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `session_id` | `String` (PK) | No | Composite session identifier (`{client_id}_{sid}`). |
| `property_id` | `String` | No | Associated property ID. |
| `client_id` | `String` | No | Device identifier. |
| `user_id` | `String` | Yes | Authenticated user ID (if stitched). |
| `start_time_ms` | `i64` | No | Timestamp of first event in session. |
| `last_event_time_ms`| `i64` | No | Timestamp of most recent event in session. |
| `event_count` | `i32` | No | Total events recorded in session. |
| `engagement_time_msec`| `i64`| No | Cumulative engaged foreground time in milliseconds. |
| `is_engaged` | `bool` | No | True if session > 10s, 2+ page views, or 1+ conversion. |
| `source` | `String` | Yes | UTM source / campaign origin (`google`, `newsletter`). |
| `medium` | `String` | Yes | UTM medium (`cpc`, `organic`, `email`). |
| `campaign` | `String` | Yes | UTM campaign name. |

---

### 2.3 `users` (`crates/engine/src/db/sea/users.rs`)
Stores persistent visitor identities, first-seen timestamps, and predictive metrics.

| Column | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` (PK) | No | Canonical user identifier (`uid` or primary `cid`). |
| `property_id` | `String` | No | Associated property ID. |
| `first_seen_timestamp`| `i64`| No | Epoch timestamp in milliseconds. |
| `last_seen_timestamp` | `i64`| No | Epoch timestamp of latest recorded event. |
| `total_sessions` | `i32` | No | Cumulative sessions count. |
| `purchase_probability`| `f64`| Yes | Predictive ML score (0.0 to 1.0) for 7-day purchase. |
| `churn_probability` | `f64` | Yes | Predictive ML score (0.0 to 1.0) for 7-day churn. |

---

### 2.4 GTM Entities (`workspaces`, `containers`, `tags`, `triggers`, `variables`, `versions`)
- **`workspaces`**: Sandboxed drafting environments (`id`, `container_id`, `name`, `is_default`).
- **`tags`**: Executable snippets (`id`, `workspace_id`, `name`, `tag_type`, `parameters`, `priority`, `consent_settings`).
- **`triggers`**: Execution rules (`id`, `workspace_id`, `name`, `trigger_type`, `predicates_json`).
- **`variables`**: Macro references (`id`, `workspace_id`, `name`, `variable_type`, `parameters_json`).
- **`versions`**: Immutable published releases (`id`, `container_id`, `version_number`, `snapshot_json`).

---

## 3. Multi-Database Dialect Configuration

SeaORM configures dynamic SQL dialects in `crates/engine/src/db/connectors.rs`:

```bash
# SQLite (Local file or in-memory)
DATABASE_URL=sqlite://analytics.db?mode=rwc
DATABASE_URL=sqlite::memory:

# PostgreSQL (Production)
DATABASE_URL=postgres://user:password@localhost:5432/analytics_db

# MySQL (Production)
DATABASE_URL=mysql://user:password@localhost:3306/analytics_db
```

Table creation and schema bootstrapping are executed dynamically upon server start in `crates/engine/src/db/sea_db.rs`, ensuring immediate readiness with zero manual migration overhead.
