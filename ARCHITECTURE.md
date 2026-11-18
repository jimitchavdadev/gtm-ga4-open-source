# ARCHITECTURE.md — System Architecture & Design

This document details the internal architecture, design principles, component interactions, and data pipelines of the **Open Source Analytics Kit (GTM & GA4 Full Parity)**.

---

## 1. High-Level Architecture Topology

```mermaid
flowchart TB
    subgraph ClientLayer["Client Layer (Browser / Mobile / Server SDK)"]
        Tracker["/tracker.js or /gtm.js Runtime"]
        DataLayer["window.dataLayer.push()"]
        Consent["Consent Mode v2 (gcs / gcd)"]
    end

    subgraph GatewayLayer["Gateway Layer (Next.js :3000)"]
        NextRewrites["next.config.mjs (beforeFiles rewrites)"]
        TrackerRoute["app/tracker.js/route.ts"]
        HealthRoute["app/api/healthz/route.ts"]
        ProxyHelper["src/server/rust-proxy.ts (Offline Fallback)"]
    end

    subgraph RustEngine["Rust Analytics Core Engine (Axum :8080)"]
        Router["Axum HTTP Router"]
        AntiAdblock["Anti-Adblock Cloaking & FPID Engine"]
        WireParser["Wire Protocol & MPv2 Parser"]
        Redaction["Email Redaction & Query Stripping"]
        Sessionizer["GA4 Sessionization & Identity Graph"]
        AttributionEng["Attribution Engine (Markov + Shapley DDA)"]
        GtmEngine["GTM Macro DAG & Tag Scheduler"]
    end

    subgraph StorageLayer["Persistence & Database Layer"]
        SeaORM["SeaORM ORM Layer (crates/engine/src/db/sea)"]
        SQLDB[("Relational Database: SQLite / PostgreSQL / MySQL")]
    end

    Tracker --> NextRewrites
    DataLayer --> Tracker
    Consent --> Tracker
    NextRewrites -->|Reverse Proxy| Router
    Router --> AntiAdblock
    AntiAdblock --> WireParser
    WireParser --> Redaction
    Redaction --> Sessionizer
    Sessionizer --> SeaORM
    AttributionEng --> SeaORM
    GtmEngine --> SeaORM
    SeaORM --> SQLDB
```

---

## 2. Core Architectural Pillars

### Pillar 1: Separation of Presentation and Persistence
- **Next.js** handles **pure UI presentation** and **client tracking script distribution**.
- There are **no direct database queries** inside any Next.js API route or page component.
- All requests for analytics data, reports, real-time metrics, tags, triggers, and containers are proxied to the **Rust Engine** via `next.config.mjs` beforeFiles rewrites.

### Pillar 2: Rust Engine as the Single Source of Truth
- Built in Rust using **Axum** and **Tokio** for high-throughput, low-latency concurrent event ingestion.
- Database access is abstracted entirely via **SeaORM**, providing compile-time type safety, automated migration management, and dialect portability across **SQLite**, **PostgreSQL**, and **MySQL**.

### Pillar 3: First-Party Custom Endpoints
- Google's legacy endpoints are replaced with custom first-party paths:
  - `/api/events/collect` (replaces `/g/collect`)
  - `/api/events/batch` (replaces `/mp/collect`)
  - `/api/events/validate` (replaces `/debug/mp/collect`)
  - `/tracker.js` (replaces `/gtm.js`)
  - `/api/analytics/properties/:id/...` (replaces `/v1beta/properties/:id/...`)
  - `/api/tag-manager/workspaces/:id/...` (replaces `/api/v1/workspaces/:id/...`)
- Backward-compatible route aliases are maintained so existing Google Tag Manager and GA4 setups work without modification.

---

## 3. Data Flow Sequences

### 3.1 Event Ingestion Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Web Browser
    participant Gateway as Next.js Gateway (:3000)
    participant Engine as Axum Engine (:8080)
    participant Privacy as Redaction & Anti-Adblock
    participant Session as Sessionizer & Identity
    participant DB as SeaORM & Database

    User->>Gateway: POST /api/events/collect?v=2&tid=G-TESTSTREAM...
    Gateway->>Engine: Forward request via reverse proxy
    Engine->>Privacy: Parse payload, cloak headers, scrub emails
    Privacy->>Privacy: Generate / decrypt AES-256-GCM FPID
    Privacy->>Session: Sessionize hit (30m window, midnight boundary)
    Session->>DB: Insert into raw_events & upsert sessions
    DB-->>Engine: Persistence confirmed
    Engine-->>Gateway: HTTP 204 No Content
    Gateway-->>User: HTTP 204 No Content
```

### 3.2 GTM Macro DAG & Tag Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor App as Client Code
    participant DL as window.dataLayer
    participant DAG as Macro DAG Resolver
    participant Consent as Consent Mode v2 Evaluator
    participant Scheduler as Tag Scheduler

    App->>DL: dataLayer.push({ event: 'purchase', value: 99.0 })
    DL->>DAG: Trigger evaluation for event 'purchase'
    DAG->>DAG: Topologically sort variable dependencies (memoized)
    DAG->>Consent: Check required consent (e.g. 'analytics_storage')
    alt Consent Denied
        Consent-->>Scheduler: Suppress execution (blocked by policy)
    else Consent Granted
        Consent-->>Scheduler: Authorize tag execution
        Scheduler->>Scheduler: Order tags by priority (Setup -> Primary -> Teardown)
        Scheduler->>App: Execute tag actions / HTTP beacon
    end
```

---

## 4. SeaORM Database Schema

The entity definitions reside in `crates/engine/src/db/sea/`:

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

    RAW_EVENTS {
        string event_id PK
        string property_id
        string event_name
        string client_id
        string session_id
        string user_id
        json parameters
        string gcs_consent
        string gcd_consent
        bigint timestamp_micros
    }

    SESSIONS {
        string session_id PK
        string property_id
        string client_id
        bigint start_time_ms
        bigint last_event_time_ms
        int event_count
        boolean is_engaged
    }

    WORKSPACES {
        string id PK
        string container_id
        string name
        boolean is_default
    }

    TAGS {
        string id PK
        string workspace_id
        string name
        string tag_type
        json parameters
        json consent_settings
    }
```

---

## 5. Anti-Adblock & Privacy Engineering

1. **First-Party Cloaking**:
   - Tracking scripts are served directly from the customer's first-party domain (`/tracker.js`).
   - Query strings and endpoints use neutral, first-party paths (`/api/events/collect`, `/_trk/collect`).
2. **First-Party Device ID (FPID)**:
   - Server-set, `HttpOnly`, `Secure`, `SameSite=Lax` cookies with AES-256-GCM encrypted tokens.
   - Prevents Safari ITP (Intelligent Tracking Prevention) 7-day or 24-hour cookie capping.
3. **Automated PII Redaction**:
   - Built-in regex filters detect and redact email addresses (`user@domain.com` -> `(redacted)`) across all incoming parameters before persistence.
   - Configurable list of stripped query parameters (e.g., `token`, `ssn`, `password`, `session_secret`).
4. **Consent Mode v2**:
   - Supports all 7 consent types: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`, `functionality_storage`, `personalization_storage`, `security_storage`.
   - Encodes and decodes Google-standard `gcs` (e.g. `G100`, `G111`) and `gcd` granular signal strings.

---

## 6. Multi-Platform Ingestion & Deployment Topology

### 6.1 Platform Ingestion Matrix
- **Web**: Dispatches wire payloads (`v=2&tid=...&cid=...&en=page_view`) through `/tracker.js` first-party script.
- **Android**: Dispatches hits with `_p=android&aid=<package_name>` via direct HTTP or Measurement Protocol v2 batch JSON.
- **iOS**: Dispatches hits with `_p=ios&bundle_id=<bundle_id>` via `URLSession` or Measurement Protocol v2 batch JSON.
- **Server**: Dispatches JSON hits with API secrets directly to `/api/events/batch`.

### 6.2 1-Command Self-Hosting Container Topology
```
[Host System]
  ├── docker-compose.yml
  ├── Service 'engine': Rust Axum (Port 8080) + SeaORM -> Volume /data/analytics.db
  └── Service 'web': Next.js Gateway (Port 3000) -> Proxies /api/* to engine:8080
```

