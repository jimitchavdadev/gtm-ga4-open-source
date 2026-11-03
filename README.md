# Open Source Analytics Kit (GTM & GA4 Full Parity)

An open-source, self-hostable analytics kit built in TypeScript with **Next.js (App Router)** and **Tailwind CSS** on [Bun](https://bun.com), providing exact functional parity with Google Tag Manager (GTM) and Google Analytics 4 (GA4), implementing both Free (Standard) and 360 (Enterprise) features.

Tested with SQLite (`bun:sqlite`), strictly verified with Biome linting and TypeScript typechecking, designed with a modular architecture where **every single file is kept under 200 lines**.

---

## 🚀 Key Modules & Capabilities

### Next.js Frontend & Route Handlers (`app/` & `components/`)
- **Interactive UI (`components/`)**:
  - **Platform Switcher**: Seamless toggle between Tag Manager (GTM) and Analytics (GA4).
  - **GTM UI**: Workspace bar, unsubmitted changes, tag manager with type/priority/consent options, triggers creator, variable manager, Tag Assistant Preview & Debug mode, and 360 Container Zones & Multi-Stage Approvals.
  - **GA4 UI**: Home dashboard with KPI scorecards, Realtime active users & live wire event stream, standard reports (Traffic Acquisition, Engagement, Ecommerce Monetization, Tech), Attribution Model Comparison (Cross-Channel Last Click vs Markov Chain Removal Effects vs Shapley Value DDA), Funnel Exploration, and Admin (Data streams, custom definitions, email redaction, 360 subproperties).
- **Next.js App Router Route Handlers (`app/api/`, `app/g/`, `app/mp/`, `app/gtm.js/`)**:
  - `GET /gtm.js`: Serves client-side container runtime script.
  - `POST & GET /g/collect`: Ingests single and batch wire protocol hits with email and query parameter redaction.
  - `POST /mp/collect` & `/debug/mp/collect`: Ingests and validates Measurement Protocol v2 payloads.
  - `GET & POST /api/v1/workspaces/[id]/entities`: Manages tags, triggers, variables.
  - `PUT & DELETE /api/v1/entities/[id]`: Entity mutations.
  - `POST /api/v1/workspaces/[id]/publish`: Version publishing snapshots.
  - `GET /api/v1/properties/[id]/realtime`: Realtime active users and recent events stream.
  - `GET /api/v1/properties/[id]/reports/standard`: Acquisition, engagement, ecommerce metrics.
  - `GET /api/v1/properties/[id]/reports/attribution`: Cross-channel DDA attribution models.
  - `GET /api/v1/properties/[id]/reports/funnel`: Multi-step checkout funnel analysis.

### Google Tag Manager (GTM) Core Engine (`src/gtm/`)
- **Data Layer Engine**: Array monkey-patching, deep-merge v2 algorithm, array overwrite semantics, function execution, and monotonic `uniqueEventId`.
- **Macro DAG**: Directed acyclic graph variable dependency resolution with cycle detection and per-event memoization.
- **Predicates & Triggers**: 11 evaluation operators (CSS selector, regex, numeric comparisons) and Trigger Groups.
- **Tag Scheduler & Consent Mode v2**: Priority sorting, Setup/Primary/Teardown sequencing, frequency capping, and `gcs`/`gcd` consent encoding across 7 consent types.
- **GTM 360 Enterprise**: Multi-container Zones, multi-stage approval workflows with inline comments, and authenticated environments (`gtm_auth`).

### Server-Side GTM & FPID (`src/server-gtm/`)
- **Wire Protocol Parsing**: Single and newline-separated batch `/g/collect` wire requests into canonical format.
- **Transformation Pipeline**: Allowlisting, blocklisting, SHA-256 hashing, and payload augmentation.
- **First-Party Device ID**: AES-256-GCM encrypted FPID generation and HttpOnly, Secure cookie management.

### Google Analytics 4 (GA4) Core Engine (`src/ga4/`)
- **Sessionization**: 30-minute inactivity timeout, midnight session boundary splitting, engagement qualification, engagement/bounce rates.
- **Identity Graph**: Blended, Observed, and Device-Based reporting identity modes.
- **Ecommerce Engine**: Validation of 14 standard GA4 ecommerce events, required purchase parameters, and currency validation.
- **Custom Definitions**: Enforces Free vs 360 quota limits and calculated metrics formula evaluation.
- **Attribution & DDA**: Cross-channel Last Click, Markov Chain Removal Effects transition graph analysis, and Shapley Value cooperative game theory credit.
- **Predictive Audiences**: Custom audience evaluation, predictive ML metrics (Purchase Probability, Churn Probability), and Audience Triggers.
- **Enterprise Hierarchy**: 360 subproperty routing and Roll-up Property cross-property aggregation (`_source_property_id`).
- **Data Redaction**: Client-side & server-side regex email scrubbing and sensitive query parameter stripping.

---

## 🛠️ Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.4.0 or later)

### Installation
```bash
bun install
```

### Run Next.js Development Server
```bash
bun run dev
```

Server runs on `http://localhost:3000`.

### Production Build & Start
```bash
bun run build
bun run start
```

### Testing & Quality Checks
Run all 44 unit & integration tests across 11 modules:
```bash
bun test
```

Run linter and formatter:
```bash
bun run lint:fix
```

Run TypeScript strict typecheck:
```bash
bun run typecheck
```

Verify that no file exceeds the 200-line modularity limit:
```bash
find src app components hooks tests index.ts -type f \( -name "*.ts" -o -name "*.tsx" \) -exec wc -l {} + | sort -n
```

---

## 🌿 Git Branching Strategy
- **`main`**: Production trunk. Kept completely untouched at initial release.
- **`staging`**: Integration branch for all merged features and route implementations.
- Feature branches (e.g. `feat/nextjs-tailwind-migration`) branch from and merge exclusively into `staging`.
