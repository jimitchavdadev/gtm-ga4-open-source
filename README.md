# Open Source Analytics Kit (GTM & GA4 Full Parity)

An open-source, enterprise-grade, self-hostable analytics and tag management platform built in **TypeScript (Next.js App Router)** and **Rust (Axum + SeaORM)** on [Bun](https://bun.sh), providing 100% functional parity with **Google Tag Manager (GTM)** and **Google Analytics 4 (GA4)**, implementing both Standard and 360 Enterprise tiers.

Featuring a multi-database backend powered by **SeaORM** (PostgreSQL, MySQL, SQLite), first-party **Anti-Adblock cloaking**, and custom platform endpoints. Strictly verified with Biome linting, TypeScript compiler checks, and modular architecture where **every single file is kept under 200 lines**.

---

## 📚 Essential Project Documentation

- **[AGENTS.md](./AGENTS.md)**: Agent & developer reference guide for any AI agent or IDE (Antigravity, Cursor, Claude Code, Copilot).
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Deep architectural topology, data flow sequence diagrams, and SeaORM schema.
- **[ONBOARDING.md](./ONBOARDING.md)**: Product onboarding guide for GTM containers, GA4 streams, script snippets, and live verification.
- **[DEVELOPMENT.md](./DEVELOPMENT.md)**: Developer setup, coding standards, modularity rules, and contribution workflow.

---

## 🚀 Key Modules & Capabilities

### 1. High-Performance Rust Engine (`crates/engine/`)
- **Axum Web Framework**: High-concurrency event ingestion running on Tokio.
- **SeaORM Multi-Database Layer**: Native ORM abstraction supporting PostgreSQL, MySQL, and SQLite without raw queries.
- **Anti-Adblock & FPID Cloaking**: First-party script delivery via `/tracker.js` and AES-256-GCM encrypted first-party device IDs.
- **Sessionization & Identity Graph**: 30-minute inactivity cutoff, midnight boundary splitting, Blended/Observed/Device-based identity modes.
- **Data-Driven Attribution (DDA)**: Algorithmic attribution via Markov Chain Removal Effects and Shapley Value cooperative game theory.

### 2. Next.js Presentation Gateway (`app/` & `components/`)
- **Strict Separation of Concerns**: Next.js is pure frontend presentation and client tracker serving; all DB queries are handled by Rust.
- **Gateway Reverse Proxying**: `next.config.mjs` transparently rewrites custom endpoints (`/api/events/*`, `/api/analytics/*`, `/api/tag-manager/*`) to the Rust engine.
- **Custom First-Party Endpoints**: First-party paths replace Google-branded URLs (`/api/events/collect`, `/api/events/batch`, `/tracker.js`) while maintaining backward-compatible aliases (`/g/collect`, `/mp/collect`, `/gtm.js`).
- **Interactive Dashboards**:
  - **GTM**: Container zones, unsubmitted changes, visual tag/trigger/variable builders, Tag Assistant preview, multi-stage approvals.
  - **GA4**: Realtime active users, standard acquisition & engagement reports, funnel exploration, attribution model comparisons, custom definitions, and BigQuery export.
  - **Setup & Onboarding Wizard**: Guided 4-step modal for container creation, snippet generation, consent configuration, and live verification.

### 3. Google Tag Manager (GTM) Core Engine (`src/gtm/`)
- **Data Layer Engine**: Deep-merge v2 algorithm, array overwrite semantics, and monotonic `uniqueEventId`.
- **Macro DAG**: Directed acyclic graph variable dependency resolution with cycle detection and memoization.
- **Consent Mode v2**: Evaluates `ad_storage`, `analytics_storage`, `ad_user_data`, and `ad_personalization` with `gcs`/`gcd` encoding.

---

## 🛠️ Minimal-Step Self-Hosting & Quickstart

### Option 1: 1-Command Docker Compose (Production Ready)
```bash
# Clone and start full stack in background
git clone https://github.com/jimitchavda/gtm-ga4-open-source.git
cd gtm-ga4-open-source
docker compose up -d
```
Access the dashboard at **`http://localhost:3000`**.

### Option 2: 1-Command Native Quickstart (Development)
```bash
./quickstart.sh
```

### Option 3: Manual Step-by-Step
```bash
# Install frontend dependencies
bun install

# Start Rust Analytics Engine (:8080)
cargo run --manifest-path crates/engine/Cargo.toml

# In a separate terminal, start Next.js Frontend (:3000)
bun run dev
```

---

## 📱 Multi-Platform Integration

- **Web**: First-party `/tracker.js` script with anti-adblock cloaking.
- **Android**: Direct Kotlin singleton (`OpenAnalytics.kt`) and batch JSON.
- **iOS**: Swift `URLSession` singleton (`OpenAnalytics.swift`) and batch JSON.
- **Server**: REST API batch ingestion (`/api/events/batch`) with API secrets.
- **Interactive Wizard**: Open the dashboard and click **"⚡ Setup Guide"** to get copy-paste code snippets customized for your project.

---

## 🧪 Testing & Quality Gates

Run all automated test suites and linters:

```bash
# Run all TypeScript frontend integration tests (50+ tests)
bun test

# Run all Rust backend integration tests (40+ tests)
cargo test --manifest-path crates/engine/Cargo.toml

# Biome code formatting & linting (0 errors, 0 warnings)
bun run lint

# TypeScript strict typechecking (0 errors)
bun run typecheck
```

Verify that no file exceeds the 200-line modularity limit:
```bash
find src app components hooks tests crates/engine/src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.rs" \) -exec wc -l {} + | sort -n
```

---

## 🌿 Git Branching Strategy
- **`main`**: Production trunk. Kept completely untouched at initial release.
- **`staging`**: Primary integration branch for all merged features and route implementations.
- Feature branches branch from and merge exclusively into `staging`.
