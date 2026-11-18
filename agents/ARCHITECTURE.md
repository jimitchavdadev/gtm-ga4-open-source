# System Architecture Specification for Agents

This document provides the definitive architectural blueprint of the **Open Source Analytics Kit (GTM & GA4 Full Parity)**, detailing tier interactions, threading models, data flows, and sub-engine responsibilities.

---

## 1. Complete System Topology

```mermaid
flowchart TB
    subgraph ClientTier["Client Ingestion Tier"]
        Browser["Web Browser (window.dataLayer)"]
        AndroidSDK["Android Mobile App (Kotlin)"]
        IOSSDK["iOS Mobile App (Swift)"]
        ServerBackend["Server / Microservice (cURL / Node.js)"]
    end

    subgraph GatewayTier["Next.js Gateway Tier (:3000)"]
        NextConfig["next.config.mjs (beforeFiles rewrites)"]
        TrackerHandler["app/tracker.js/route.ts (Client Script CDN)"]
        LegacyGtmHandler["app/gtm.js/route.ts (Backward Compatibility)"]
        HealthHandler["app/api/healthz/route.ts (Gateway Health)"]
        OfflineProxy["src/server/rust-proxy.ts (Offline Fallback)"]
    end

    subgraph RustCore["Rust Analytics Core Engine (Axum :8080)"]
        AxumRouter["Axum HTTP Router (crates/engine/src/server/)"]
        AntiAdblock["Anti-Adblock & FPID Armor (src/anti_adblock/)"]
        WirePipeline["Wire Protocol & MPv2 Parser (src/ga4/ & src/server/)"]
        Redaction["PII & Query Stripper (src/server-gtm/)"]
        Sessionizer["Sessionization & Identity Graph (src/ga4/session.rs)"]
        Attribution["DDA Attribution Engine (src/attribution/)"]
        GtmRuntime["Macro DAG & Tag Scheduler (src/gtm/)"]
    end

    subgraph DatabaseTier["Persistence Layer (SeaORM)"]
        SeaORMLayer["SeaORM ORM Layer (crates/engine/src/db/sea/)"]
        DBInstance[("Multi-DB Engine: SQLite / PostgreSQL / MySQL")]
    end

    Browser -->|/tracker.js| TrackerHandler
    Browser -->|POST /api/events/collect| NextConfig
    AndroidSDK -->|POST /api/events/collect| NextConfig
    IOSSDK -->|POST /api/events/collect| NextConfig
    ServerBackend -->|POST /api/events/batch| NextConfig

    NextConfig -->|Reverse Proxy| AxumRouter
    AxumRouter --> AntiAdblock
    AntiAdblock --> WirePipeline
    WirePipeline --> Redaction
    Redaction --> Sessionizer
    Sessionizer --> SeaORMLayer
    Attribution --> SeaORMLayer
    GtmRuntime --> SeaORMLayer
    SeaORMLayer --> DBInstance
```

---

## 2. Gateway Tier: Next.js Presentation & Proxying

- **Strict Separation**: The Next.js layer executes zero database operations. It renders the Tailwind CSS single-page dashboards, serves the tracking script `/tracker.js`, and rewrites API traffic to the Rust engine.
- **Rewrites Map in `next.config.mjs`**:
  - `/api/events/:path*` -> `${RUST_ENGINE_URL}/api/v1/events/:path*`
  - `/api/analytics/:path*` -> `${RUST_ENGINE_URL}/api/v1/analytics/:path*`
  - `/api/tag-manager/:path*` -> `${RUST_ENGINE_URL}/api/v1/tag-manager/:path*`
  - `/api/admin/:path*` -> `${RUST_ENGINE_URL}/api/v1/admin/:path*`
  - `/_trk/:path*` -> `${RUST_ENGINE_URL}/_trk/:path*`
- **Offline Fallback Architecture (`src/server/rust-proxy.ts`)**:
  - During development or automated Bun unit tests where the Rust engine background process might not be running on port 8080, `rust-proxy.ts` detects connection timeouts and falls back seamlessly to `offline-fallback.ts` and `mp-fallback.ts`.
  - Guarantees instant, zero-flake CI test execution.

---

## 3. Rust Engine Tier (`crates/engine/`)

The core engine is built in Rust using **Axum**, **Tokio**, and **SeaORM** for high-throughput, low-latency concurrent processing.

### Subsystem Breakdown:
1. **`anti_adblock/`**:
   - `path_obfuscator.rs`: Generates pseudo-randomized endpoints with SHA-256 HMAC tokens.
   - `cookie_armor.rs`: Issues AES-256-GCM encrypted `HttpOnly` First-Party Device IDs (`FPID`).
   - `transport.rs`: Handles fallback beaconing and synthetic header normalization.
2. **`attribution/`**:
   - `markov.rs`: Computes cross-channel Markov Chain Removal Effects transition matrices across conversion journeys.
   - `shapley.rs`: Evaluates cooperative game theory Shapley value marginal contributions across marketing touchpoints.
3. **`ga4/`**:
   - `session.rs`: Evaluates 30-minute inactivity timeouts, midnight boundary splitting, and engagement qualification.
   - `identity.rs`: Implements the 3-tiered reporting identity resolution (Blended, Observed, Device-Based).
   - `custom_definitions.rs`: Quota enforcement (Free vs 360) and formula engine for calculated metrics.
4. **`gtm/`**:
   - `datalayer.rs`: DataLayer deep-merge v2 algorithm with array overwrite semantics.
   - `macro_dag.rs`: Topologically sorts variable dependencies, detects circular cycles, and memoizes values per event.
   - `triggers.rs`: Evaluates 11 predicate operators and Trigger Groups.
   - `scheduler.rs`: Tag scheduling, priority ordering, and Setup/Primary/Teardown sequencing.
5. **`server/`**:
   - `routes.rs`: Axum router composition and CORS headers.
   - `routes_events.rs`: Ingestion endpoints (`/api/v1/events/collect`, `/batch`, `/validate`, `/_trk/*`).
   - `routes_analytics.rs`: Reporting APIs (`reports/standard`, `realtime`, `attribution`, `funnel`).
   - `routes_tagmanager.rs`: Entity CRUD and workspace version publishing.

---

## 4. End-to-End Event Ingestion Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser / Mobile App
    participant Next as Next.js Gateway (:3000)
    participant Axum as Axum Router (:8080)
    participant Privacy as PII Redactor & FPID
    participant Session as Sessionizer
    participant Sea as SeaORM
    participant DB as Database

    Client->>Next: POST /api/events/collect?v=2&tid=G-TESTSTREAM...
    Next->>Axum: Forward request via beforeFiles rewrite
    Axum->>Privacy: Parse query/payload & scrub email addresses
    Privacy->>Privacy: Verify / issue encrypted FPID cookie
    Privacy->>Session: Sessionize hit (check active session window)
    Session->>Sea: raw_events::ActiveModel & sessions::ActiveModel
    Sea->>DB: INSERT into raw_events / UPSERT sessions
    DB-->>Sea: Confirmed
    Sea-->>Axum: Success
    Axum-->>Next: HTTP 204 No Content
    Next-->>Client: HTTP 204 No Content
```
