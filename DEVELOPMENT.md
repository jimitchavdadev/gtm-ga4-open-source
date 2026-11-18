# DEVELOPMENT.md — Developer Workflow & Coding Standards

This guide covers setup instructions, architecture standards, coding invariants, and testing practices for developers contributing to the **Open Source Analytics Kit**.

---

## 1. Prerequisites & Toolchain

Ensure the following tools are installed on your machine:

- **Bun**: v1.4.0+ ([https://bun.sh](https://bun.sh))
- **Rust Toolchain**: 1.80+ ([https://rustup.rs](https://rustup.rs))
- **Git**: 2.30+
- (Optional) **SQLite CLI**, **PostgreSQL**, or **MySQL** for direct database inspection.

---

## 2. Strict Coding Invariants

Every pull request and commit must strictly adhere to these 5 invariants:

### Invariant 1: Modularity & File Length Limit (< 200 Lines)
- **Every single `.ts`, `.tsx`, `.rs`, and `.js` file must be under 200 lines.**
- Avoid monolithic components or giant utility files.
- If a file approaches ~180 lines, break it down:
  - Extract subcomponents into a dedicated subfolder (e.g. `components/onboarding/`).
  - Extract helper calculation functions into pure utilities.
  - Extract TypeScript interfaces and types into a shared `types.ts` or local type file.
- Verify file lengths before committing:
  ```bash
  find src app components hooks tests crates/engine/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.rs" \) -exec wc -l {} + | sort -n
  ```

### Invariant 2: Backend Source of Truth & Zero DB in Next.js
- **Next.js is strictly for frontend presentation and client tracker script serving.**
- Never import database drivers (`bun:sqlite`, `pg`, `mysql2`, Drizzle, etc.) inside `app/` routes or pages.
- All database schemas, relations, migrations, queries, mutations, and analytics processing belong exclusively in `crates/engine` using **SeaORM**.

### Invariant 3: SeaORM Everywhere in Rust
- All database operations in Rust must use **SeaORM** entities and query builders.
- Raw SQL queries must not be used unless performing vendor-specific dialect initialization.
- Models and relations are defined in `crates/engine/src/db/sea/`.

### Invariant 4: Quality Gates (Zero Errors & Warnings)
- All test suites must pass 100%:
  - `cargo test --manifest-path crates/engine/Cargo.toml` (Rust test suite)
  - `bun test` (TypeScript test suite)
- Zero linter warnings: `bun run lint`
- Zero typecheck errors: `bun run typecheck`

### Invariant 5: Git Branch Strategy
- **`main`**: Protected production branch. Never commit or push directly to `main`.
- **`staging`**: Primary integration branch for merged features.
- **`feat/*`** or **`fix/*`**: Work on dedicated feature branches branched from `staging`.

---

## 3. Working with the Rust Engine (`crates/engine`)

### Running the Engine
```bash
cargo run --manifest-path crates/engine/Cargo.toml
```
The server listens on `http://localhost:8080` (or `PORT` environment variable).

### Adding a New SeaORM Entity
1. Define the entity model in `crates/engine/src/db/sea/<entity_name>.rs`:
   ```rust
   use sea_orm::entity::prelude::*;

   #[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
   #[sea_orm(table_name = "example_entity")]
   pub struct Model {
       #[sea_orm(primary_key, auto_increment = false)]
       pub id: String,
       pub name: String,
       pub created_at: i64,
   }

   #[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
   pub enum Relation {}

   impl ActiveModelBehavior for ActiveModel {}
   ```
2. Re-export the module in `crates/engine/src/db/sea/mod.rs`.
3. Add the table bootstrap schema to `crates/engine/src/db/sea_db.rs`.

### Running Backend Tests
```bash
cargo test --manifest-path crates/engine/Cargo.toml
```

---

## 4. Working with Next.js & Frontend

### Running the Dev Server
```bash
bun run dev
```
The frontend listens on `http://localhost:3000`.

### Custom Endpoints & Reverse Proxy
`next.config.mjs` proxies all first-party API calls directly to the Rust engine:
- `/api/events/:path*` -> `${rustEngineUrl}/api/v1/events/:path*`
- `/api/analytics/:path*` -> `${rustEngineUrl}/api/v1/analytics/:path*`
- `/api/tag-manager/:path*` -> `${rustEngineUrl}/api/v1/tag-manager/:path*`
- `/api/admin/:path*` -> `${rustEngineUrl}/api/v1/admin/:path*`

### Offline Unit Testing Fallback
When running unit tests without a live Rust server, `src/server/rust-proxy.ts` automatically uses `src/server/offline-fallback.ts` to return mock responses, ensuring CI test suites remain lightning-fast and self-contained.

---

## 5. Pre-Commit Checklist

Run this composite command before creating any pull request:

```bash
bun test && bun run lint && bun run typecheck && cargo test --manifest-path crates/engine/Cargo.toml
```
