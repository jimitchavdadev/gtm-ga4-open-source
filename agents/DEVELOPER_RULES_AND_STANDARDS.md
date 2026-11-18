# Developer Rules & Invariants for Agents

This document defines the strict, non-negotiable coding standards, architectural boundaries, and verification procedures that every AI agent and software engineer must adhere to when operating on this codebase.

---

## 1. The 6 Non-Negotiable Invariants

### Invariant 1: Strict Modularity & File Length Limit (< 200 Lines)
- **Rule**: Every single `.ts`, `.tsx`, `.rs`, and `.js` file in the repository must be strictly **under 200 lines of code**.
- **Rationale**: Keeps components, route handlers, and engine modules easily reviewable, prevents monolithic state accumulation, simplifies automated reasoning for LLMs with bounded context windows, and enforces high cohesion and single-responsibility principles.
- **Enforcement**: Run the project line validator:
  ```bash
  bun run verify:lines
  ```
- **Refactoring Strategy When Approaching ~170–180 Lines**:
  1. *Subcomponents*: Move modals, table bodies, scorecards, or forms into a dedicated subfolder (e.g., `components/onboarding/OnboardingStep1Setup.tsx`).
  2. *Types*: Extract TypeScript interfaces and type aliases into a local `types.ts`.
  3. *Utilities*: Move pure math or string transformation helpers into adjacent utility files (e.g., `components/onboarding/snippets.ts`).
  4. *Custom Hooks*: Move state-management and effect logic into dedicated hooks under `hooks/`.

---

### Invariant 2: Backend Source of Truth & Zero Database in Next.js
- **Rule**: Next.js App Router (`app/`) is **strictly for presentation UI** and serving client scripts (`/tracker.js`, `/gtm.js`). **Zero direct database queries are permitted inside Next.js.**
- **Rationale**: Avoids dual database state synchronization, connection pooling issues in serverless runtimes, and maintains the Rust engine as the sole authority on transactions, migrations, and analytics pipelines.
- **Gateway Mechanism**:
  - `next.config.mjs` uses `beforeFiles` rewrites to proxy all `/api/events/*`, `/api/analytics/*`, `/api/tag-manager/*`, `/api/admin/*`, and `/_trk/*` traffic to the Rust engine (`http://localhost:8080` or `RUST_ENGINE_URL`).
  - `src/server/rust-proxy.ts` handles runtime proxying with an automatic **offline fallback** for Bun unit testing when the Rust daemon is not running.

---

### Invariant 3: SeaORM Everywhere in Rust
- **Rule**: All database operations in Rust must use **SeaORM** models, active models, entities, and query builders located in `crates/engine/src/db/sea/`.
- **Rationale**: Eliminates fragile raw SQL strings, guarantees compile-time schema safety, and provides multi-database dialect flexibility across **SQLite**, **PostgreSQL**, and **MySQL** with zero code changes.
- **Code Pattern**:
  ```rust
  // Correct SeaORM pattern:
  let event = raw_events::ActiveModel {
      id: Set(ev.id),
      property_id: Set(ev.property_id),
      event_name: Set(ev.event_name),
      ..Default::default()
  };
  event.insert(db).await?;
  ```

---

### Invariant 4: Zero Errors & Zero Warnings Across Quality Gates
- **Rule**: Code changes must never introduce compiler errors, TypeScript type errors, or Biome lint warnings.
- **Verification Commands**:
  - `bun run lint`: Must return `0 errors, 0 warnings`. (Use `bun run lint:fix` for auto-formatting).
  - `bun run typecheck`: Must complete with `0 errors`.
  - `bun test`: All 50+ TypeScript tests must pass 100%.
  - `cargo test --manifest-path crates/engine/Cargo.toml`: All 40+ Rust tests must pass 100%.

---

### Invariant 5: Continuous Documentation Synchronization
- **Rule**: Agents and engineers must continuously update the repository's `.md` files (`AGENTS.md`, `ARCHITECTURE.md`, `ONBOARDING.md`, `DEVELOPMENT.md`, `README.md`, `GLOSSARY.md`, and `agents/*`) in the same commit whenever progress is made.
- **Rationale**: Documentation must never lag behind code. An out-of-sync codebase degrades agent reasoning quality and confuses contributors across different machines.
- **Sync Checklist**:
  - Added or changed an endpoint? -> Update `INGESTION_AND_ENDPOINTS.md`, `AGENTS.md`, and `ARCHITECTURE.md`.
  - Added or changed a database entity? -> Update `DATA_MODELS_AND_SCHEMA.md` and `AGENTS.md`.
  - Modified onboarding or setup? -> Update `ONBOARDING.md`, `MULTI_PLATFORM_INTEGRATION.md`, and `README.md`.
  - Added a new jargon or concept? -> Update `GLOSSARY.md`.

---

### Invariant 6: Git Branch Discipline
- **Rule**: Never commit or push directly to `main`.
- **Branch Hierarchy**:
  - `main`: Protected production trunk.
  - `staging`: Primary integration branch. All feature branches merge into `staging`.
  - `feat/<topic>` or `fix/<topic>`: Isolated feature branches created from `staging`.

---

## 2. Pre-Commit Command Matrix

Execute this single composite command before finalizing any turn or committing:

```bash
bun run verify:lines && bun run lint && bun run typecheck && bun test && cargo test --manifest-path crates/engine/Cargo.toml
```
