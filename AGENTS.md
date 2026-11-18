# AGENTS.md — Agent & Developer Context Guide

Welcome to the **Open Source Analytics Kit (GTM & GA4 Full Parity)**. This file is the primary context guide for AI agents (Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf, Cline, Devin) and human engineers working on this repository on any device or environment.

---

## 1. Project Mission & Architecture

This repository delivers an open-source, enterprise-grade, self-hostable analytics and tag management platform with 100% functional parity with **Google Tag Manager (Standard + 360)** and **Google Analytics 4 (Standard + 360)**.

```mermaid
flowchart TD
    Client["Browser / Mobile App / Client (/tracker.js)"] --> NextProxy["Next.js Gateway (:3000)"]
    NextProxy -->|beforeFiles rewrite| Axum["Rust Analytics Engine (:8080)"]
    Axum --> SeaORM["SeaORM Multi-DB Layer"]
    SeaORM --> DB[("PostgreSQL / MySQL / SQLite")]
    Axum --> EngineCore["Ingestion Pipeline & Anti-Adblock"]
    EngineCore --> Attribution["Attribution & Sessionization Engine"]
    Attribution --> AnalyticsAPI["Realtime & Reporting APIs"]
```

### Architectural Separation of Concerns
1. **Next.js (App Router + Tailwind CSS)**:
   - **Role**: STRICTLY frontend presentation UI, client runtime serving (`/tracker.js`, `/gtm.js`), and gateway reverse proxying.
   - **Rule**: ZERO direct database queries inside `app/`. All data queries route through the Rust engine.
   - **Proxying**: `next.config.mjs` rewrites all `/api/events/*`, `/api/analytics/*`, `/api/tag-manager/*`, `/api/admin/*`, and `/_trk/*` traffic to the Rust backend (`http://localhost:8080` or `process.env.RUST_ENGINE_URL`).
2. **Rust Engine (`crates/engine`)**:
   - **Role**: Single source of truth for all database operations, migrations, data models, wire parsing, anti-adblock cloaking, sessionization, and analytics reporting.
   - **ORM**: Powered exclusively by **SeaORM** with multi-database connectors (`sqlite`, `postgres`, `mysql`).
3. **First-Party Custom Endpoints**:
   - First-party endpoints replace Google-branded URLs while retaining backward-compatible aliases:
     - Ingestion: `/api/events/collect`, `/api/events/batch`, `/api/events/validate` (legacy `/g/collect`, `/mp/collect`, `/debug/mp/collect`).
     - Script loader: `/tracker.js` (legacy `/gtm.js`).
     - Analytics: `/api/analytics/properties/:id/reports/standard`, `/realtime`, `/attribution`, `/funnel` (legacy `/v1beta/*`).
     - Tag Manager: `/api/tag-manager/workspaces/:id/entities`, `/publish`.

---

## 2. Hard Invariants & Rules

When modifying or adding code, you **MUST** uphold these non-negotiable rules:

| Rule | Requirement | How to Verify |
| :--- | :--- | :--- |
| **File Length** | Every `.ts`, `.tsx`, `.rs`, `.js` file must be **< 200 lines**. Split files aggressively into submodules. | `bun run verify:lines` or check with `wc -l` |
| **No DB in Next.js** | Next.js is frontend presentation only. All DB persistence goes through Rust / SeaORM. | Code review of `app/` and `src/server/` |
| **SeaORM Everywhere** | All database interactions in Rust must use SeaORM models, entities, and query builders. | `crates/engine/src/db/sea/` |
| **Zero Errors & Warnings** | No compiler errors, no lint warnings, no type errors. | `cargo test && bun test && bun run lint && bun run typecheck` |
| **Git Branch Discipline** | Never commit directly to `main`. Create feature branches and merge into `staging`. | `git status` |
| **Continuous Docs Sync** | **MANDATORY**: Constantly update `.md` files (`AGENTS.md`, `ARCHITECTURE.md`, `ONBOARDING.md`, `DEVELOPMENT.md`, `README.md`) based on progress made. Documentation must never lag behind code. | Review modified `.md` files |
| **Multi-Platform Parity** | Support Web, Android (Kotlin), iOS (Swift), and Server ingestion. | Test `/api/events/collect` with `_p=android`, `_p=ios` |

---

## 3. Directory Structure & Key Files

```
gtm-ga4-open-source/
├── AGENTS.md                  # This file (Agent & developer quickstart context)
├── ARCHITECTURE.md            # Deep architectural design and data flow specifications
├── ONBOARDING.md              # GTM container & GA4 property user onboarding guide
├── DEVELOPMENT.md             # Developer setup, commands, testing & contributing guide
├── next.config.mjs            # Gateway rewrites mapping custom endpoints to Rust
├── package.json               # Bun scripts, dependencies, biome config
├── crates/engine/             # Rust Analytics Engine (Axum + SeaORM)
│   ├── Cargo.toml             # Rust dependencies (axum, sea-orm, tokio, etc.)
│   ├── src/
│   │   ├── main.rs            # Axum HTTP server entry point (:8080)
│   │   ├── lib.rs             # Public crate exports & AppState
│   │   ├── anti_adblock/      # URL cloaking, payload armor, header spoofing
│   │   ├── attribution/       # Markov chain removal effects, Shapley value DDA
│   │   ├── db/
│   │   │   ├── connectors.rs  # Multi-DB config (SQLite, Postgres, MySQL)
│   │   │   ├── sea/           # SeaORM entity definitions & migrations
│   │   │   └── sea_db.rs      # SeaORM database connection & schema bootstrap
│   │   ├── ga4/               # Sessionization, custom definitions, validation
│   │   ├── gtm/               # DataLayer deep-merge, Macro DAG, trigger evaluation
│   │   └── server/
│   │       ├── routes.rs      # Axum router composition
│   │       ├── routes_events.rs      # /api/events/* and legacy /g/collect
│   │       ├── routes_analytics.rs   # /api/analytics/* and legacy /v1beta/*
│   │       └── routes_tagmanager.rs  # /api/tag-manager/* endpoints
│   └── tests/                 # Rust unit and integration test suites
├── app/                       # Next.js App Router (Frontend UI + Route Handlers)
│   ├── page.tsx               # Main analytics & tag management single-page app
│   ├── layout.tsx             # Root HTML layout & fonts
│   ├── tracker.js/route.ts    # First-party tracker client script endpoint
│   ├── gtm.js/route.ts        # Legacy GTM script backward compatibility
│   └── api/healthz/route.ts   # System health probe
├── components/                # React presentation components (< 200 lines each)
│   ├── Navbar.tsx             # Header navigation with platform switcher & setup guide
│   ├── Sidebar.tsx            # Contextual navigation sidebar
│   ├── onboarding/            # Product onboarding wizard & connection verification
│   ├── ga4/                   # GA4 dashboards (Realtime, Reports, Attribution, Admin)
│   └── gtm/                   # GTM dashboards (Overview, Tags, Triggers, Preview)
├── hooks/                     # Custom React hooks
│   └── useAnalyticsData.ts    # Data fetching & state synchronizer
├── src/server/                # Next.js server helpers
│   ├── rust-proxy.ts          # Gateway proxy to Rust Axum server
│   ├── offline-fallback.ts    # In-memory test fallback when Rust is offline
│   └── mp-fallback.ts         # Measurement Protocol offline fallback
└── tests/                     # Bun TypeScript integration tests
```

---

## 4. Key Endpoints Quick Reference

| Custom First-Party Endpoint | Legacy Google Alias | Purpose |
| :--- | :--- | :--- |
| `GET /tracker.js?id=...` | `GET /gtm.js?id=...` | Serves client tracking runtime script |
| `POST /api/events/collect` | `POST /g/collect` | Single wire-protocol event ingestion |
| `POST /api/events/batch` | `POST /mp/collect` | Batch conversion & server-side hit ingestion |
| `POST /api/events/validate` | `POST /debug/mp/collect` | Ingestion validation & diagnostics |
| `GET /api/analytics/properties/:id/realtime` | `/v1beta/properties/:id:runRealtimeReport` | Realtime user count & recent events |
| `POST /api/analytics/properties/:id/reports/standard` | `/v1beta/properties/:id:runReport` | Standard reporting (Acquisition, Engagement) |
| `GET /api/analytics/properties/:id/reports/attribution` | N/A | DDA attribution model comparisons |
| `GET /api/tag-manager/workspaces/:id/entities` | `/api/v1/workspaces/:id/entities` | Tags, Triggers, Variables CRUD |
| `POST /api/tag-manager/workspaces/:id/publish` | `/api/v1/workspaces/:id/publish` | Workspace version publishing |

---

## 5. Standard Commands Cheat Sheet

```bash
# Minimal-Step Quickstart & Self-Hosting
./quickstart.sh                  # 1-command setup & run (Bun + Cargo)
docker compose up -d             # 1-command Docker production stack

# Frontend & TypeScript (Bun)
bun install                      # Install frontend dependencies
bun test                         # Run all 50+ Bun integration tests
bun run dev                      # Start Next.js frontend on localhost:3000
bun run build                    # Build production Next.js bundle
bun run lint                     # Check code with Biome linter
bun run lint:fix                 # Auto-fix linting issues
bun run typecheck                # Strict TypeScript compiler check

# Backend & Rust Engine (Cargo)
cargo test --manifest-path crates/engine/Cargo.toml     # Run all 40+ Rust test suites
cargo run --manifest-path crates/engine/Cargo.toml      # Start Rust Axum engine on :8080
cargo fmt --manifest-path crates/engine/Cargo.toml      # Format Rust code

# Verification Checklist Before Any Commit
bun test && bun run lint && bun run typecheck && cargo test --manifest-path crates/engine/Cargo.toml
```

---

## 6. SeaORM Database Schema

The Rust engine abstracts the database via SeaORM. Entity definitions are located in `crates/engine/src/db/sea/`:

1. **`raw_events`**: Stores incoming raw hits with client ID, session ID, parameters, consent flags, and IP/UA metadata.
2. **`sessions`**: Tracks active user sessions, engagement duration, page view count, and campaign source.
3. **`users`**: User identities, blended IDs, first-seen timestamps, and predictive audience traits.
4. **`conversions`**: Attributed conversion hits with transaction value, currency, and attribution weights.
5. **`workspaces`**, **`containers`**, **`tags`**, **`triggers`**, **`variables`**, **`versions`**: GTM entity repository.

---

## 7. Troubleshooting & Gotchas

1. **Rust Engine Port 8080**:
   - In local development, start the Rust engine first (`cargo run --manifest-path crates/engine/Cargo.toml`), then Next.js (`bun run dev`).
   - If the Rust engine is not running during Bun unit tests, `src/server/rust-proxy.ts` automatically falls back to `offline-fallback.ts` so tests never fail due to a missing background daemon.
2. **File Length Limit**:
   - If a file reaches 180+ lines, proactively split helper functions, sub-components, or types into adjacent files.
   - Example: `AdminTab.tsx` delegates to `admin/ReportingIdentitySection.tsx` and `admin/CustomDefinitionsTable.tsx`.
3. **Database URL**:
   - Default: SQLite in-memory (`sqlite::memory:`) or local file (`sqlite://analytics.db?mode=rwc`).
   - PostgreSQL: set `DATABASE_URL=postgres://user:pass@localhost:5432/analytics`.
   - MySQL: set `DATABASE_URL=mysql://user:pass@localhost:3306/analytics`.
