# Agent Knowledge Base (`agents/`)

Welcome to the **Agent Knowledge Base** for the **Open Source Analytics Kit (GTM & GA4 Full Parity)**. This directory contains modular, exhaustive, and domain-specific architectural context files designed to empower AI coding agents (Antigravity, Cursor, Claude Code, GitHub Copilot, Cline, Windsurf, Devin) and human engineers to reason about, implement, test, and maintain this codebase with zero ambiguity on any machine or device.

---

## 1. Document Index & Reading Guide

| File | Primary Domain | When to Consult |
| :--- | :--- | :--- |
| **[`DEVELOPER_RULES_AND_STANDARDS.md`](./DEVELOPER_RULES_AND_STANDARDS.md)** | Non-negotiable coding rules & quality gates | **MANDATORY**: Before writing or modifying any code. Covers the `< 200 lines` rule, SeaORM mandate, and branch discipline. |
| **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** | Full system topology & pipeline flows | When working across frontend-backend boundaries, reverse proxying, or understanding Tokio/Axum concurrency. |
| **[`DATA_MODELS_AND_SCHEMA.md`](./DATA_MODELS_AND_SCHEMA.md)** | SeaORM database entities, relations & migrations | When querying the database, designing migrations, modifying tables, or configuring multi-DB dialects (Postgres, MySQL, SQLite). |
| **[`INGESTION_AND_ENDPOINTS.md`](./INGESTION_AND_ENDPOINTS.md)** | HTTP routes, wire protocols & privacy filters | When modifying `/api/events/*`, `/api/analytics/*`, `/tracker.js`, anti-adblock cloaking, or email scrubbing. |
| **[`GTM_ENGINE.md`](./GTM_ENGINE.md)** | Tag manager internals (DataLayer, DAG, Triggers) | When working on `window.dataLayer`, macro dependency graphs, tag execution priorities, or GTM 360 zones. |
| **[`GA4_ENGINE.md`](./GA4_ENGINE.md)** | Analytics internals (Sessions, DDA, Consent) | When working on sessionization, attribution models (Markov/Shapley), Consent Mode v2 (`gcs`/`gcd`), or explorations. |
| **[`MULTI_PLATFORM_INTEGRATION.md`](./MULTI_PLATFORM_INTEGRATION.md)** | Web, Android, iOS & Server tracking SDKs | When updating client code snippets, mobile parameter parsing, or onboarding guides for developers. |
| **[`SELF_HOSTING_AND_DEPLOYMENT.md`](./SELF_HOSTING_AND_DEPLOYMENT.md)** | 1-command Docker & production deployment | When maintaining `docker-compose.yml`, `quickstart.sh`, container volumes, or cloud reverse proxy configurations. |

---

## 2. Cardinal Operating Invariants

Every agent executing tasks in this repository must uphold these 6 cardinal rules:

1. **Strict File Length Limit**: Every `.ts`, `.tsx`, `.rs`, and `.js` file must be strictly **< 200 lines**. Split subcomponents and helpers aggressively. Verify with `bun run verify:lines`.
2. **Zero Database in Next.js**: Next.js (`app/`) is strictly for frontend presentation UI and client script distribution (`/tracker.js`). All database queries and persistence belong in the Rust engine (`crates/engine`).
3. **SeaORM Everywhere in Rust**: All database operations in Rust must use **SeaORM** entities and query builders. No raw queries.
4. **First-Party Custom Endpoints**: First-party endpoints (`/api/events/*`, `/api/analytics/*`, `/api/tag-manager/*`, `/tracker.js`) replace legacy Google URLs while retaining backward-compatible aliases (`/g/collect`, `/mp/collect`, `/gtm.js`).
5. **Continuous Documentation Synchronization**: Agents must continuously update the `.md` files (`AGENTS.md`, `ARCHITECTURE.md`, `ONBOARDING.md`, `DEVELOPMENT.md`, `README.md`, `GLOSSARY.md`, and `agents/*`) in the same commit whenever code changes.
6. **Git Branch Discipline**: Never commit to `main`. Always create feature branches off `staging`, merge into `staging`, and push to `origin/staging`.

---

## 3. Quick Verification Command

Before completing any task, run the universal quality check:

```bash
bun run verify:lines && bun run lint && bun run typecheck && bun test && cargo test --manifest-path crates/engine/Cargo.toml
```
All suites must pass with **0 errors and 0 warnings**.
