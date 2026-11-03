# Open Source Analytics Kit (GTM & GA4 Full Parity)

An open-source, self-hostable analytics kit built in TypeScript on [Bun](https://bun.com) with exact functional parity with Google Tag Manager (GTM) and Google Analytics 4 (GA4), implementing both Free (Standard) and 360 (Enterprise) features.

Tested with SQLite (`bun:sqlite`), strictly verified with Biome linting and TypeScript typechecking, designed with a modular architecture where **every single file is kept under 200 lines**.

---

## 🚀 Key Modules & Capabilities

### Google Tag Manager (GTM) Engine
- **Data Layer Engine (`src/gtm/datalayer.ts`)**: Array monkey-patching, deep-merge v2 algorithm, array overwrite semantics, function execution, and monotonic `uniqueEventId`.
- **Macro DAG (`src/gtm/macro-dag.ts`)**: Directed acyclic graph variable dependency resolution with cycle detection and per-event memoization.
- **Predicates & Triggers (`src/gtm/predicates.ts`, `src/gtm/trigger-engine.ts`)**: 11 evaluation operators (CSS selector, regex, numeric comparisons) and Trigger Groups with state tracking.
- **Tag Scheduler & Consent Mode v2 (`src/gtm/tag-scheduler.ts`, `src/gtm/consent-manager.ts`)**: Priority sorting, Setup/Primary/Teardown sequencing, once-per-event/page frequency caps, and `gcs`/`gcd` consent encoding across 7 consent types.
- **GTM 360 Enterprise (`src/gtm-enterprise/`)**: Multi-container Zones with boundary conditions and tag type restrictions, multi-stage approval workflows with inline comments, and authenticated environments (`gtm_auth`).

### Server-Side GTM & FPID
- **GA4 Wire Protocol Client (`src/server-gtm/client.ts`)**: Parses single and newline-separated batch `/g/collect` wire requests into canonical event representations.
- **Transformation Pipeline (`src/server-gtm/transformations.ts`)**: Allowlisting, blocklisting, SHA-256 hashing (with salt), and payload augmentation.
- **First-Party Device ID (`src/server-gtm/fpid.ts`)**: AES-256-GCM encrypted FPID generation and validation with HttpOnly, Secure cookie management.

### Google Analytics 4 (GA4) Engine
- **Sessionization (`src/ga4/sessionizer.ts`)**: 30-minute inactivity timeout, midnight session boundary splitting, engagement qualification, engagement rate, and bounce rate calculation.
- **Identity Graph (`src/ga4/identity-graph.ts`)**: Blended, Observed, and Device-Based reporting identity modes with thresholding protection.
- **Ecommerce Engine (`src/ga4/ecommerce.ts`)**: Strict validation of 14 standard GA4 ecommerce events, required purchase parameters (`transaction_id`, `value`, `currency`), and ISO-4217 validation.
- **Custom Definitions (`src/ga4/custom-definitions.ts`)**: Enforces Free vs 360 quota limits (Event Scoped, User Scoped, Item Scoped) and calculated metrics formula evaluation.
- **Attribution & DDA (`src/ga4/attribution.ts`)**: Cross-channel Last Click (ignoring direct), Markov Chain Removal Effects transition graph analysis, and Shapley Value cooperative game theory credit.
- **Predictive Audiences (`src/ga4/audiences.ts`)**: Custom audience membership evaluation, predictive ML metrics (Purchase Probability, Churn Probability), and Audience Triggers.
- **Enterprise Hierarchy (`src/ga4/subproperties.ts`)**: Subproperty routing and Roll-up Property cross-property aggregation with source property tagging (`_source_property_id`).
- **Data Redaction (`src/ga4/data-redaction.ts`)**: Client-side & server-side regex email scrubbing (plain and URL encoded) and sensitive query parameter stripping.
- **Measurement Protocol v2 (`src/ga4/measurement-protocol.ts`)**: `/mp/collect` ingestion and `/debug/mp/collect` validation diagnostics conforming to standard GA4 codes.

### Ingestion Server & Persistence
- **HTTP Gateway (`src/server/http-server.ts`)**: High-performance HTTP server serving `/gtm.js`, `/g/collect`, `/mp/collect`, `/debug/mp/collect`, and Realtime Reporting APIs (`/api/v1/properties/:id/realtime`).
- **Database (`src/db/`)**: SQLite persistence with WAL mode and foreign key enforcement for accounts, containers, workspaces, versions, properties, streams, sessions, and raw events.

---

## 🛠️ Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.4.0 or later)

### Installation
```bash
bun install
```

### Run Server
```bash
bun run start
# Or directly:
bun run index.ts
```

Server starts on `http://localhost:3000` (or `PORT` environment variable).

### Testing & Quality Checks
Run all 37 tests across 10 modules:
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
find src tests index.ts -type f -name "*.ts" -exec wc -l {} + | sort -n
```
