# GLOSSARY.md — GTM & GA4 Terminology & Concepts Reference

This glossary defines all domain-specific terminology, technical jargons, wire protocol primitives, and mathematical models used across **Google Tag Manager (GTM)**, **Google Analytics 4 (GA4)**, and this open-source platform.

---

## 1. Google Tag Manager (GTM) Concepts

| Jargon / Term | Technical Definition & Role in Platform |
| :--- | :--- |
| **Account** | Top-level organizational entity representing an organization, company, or holding group. Can contain multiple Containers. |
| **Container** | A collection of tags, triggers, variables, and runtime configurations deployed to a specific website or mobile app (e.g. `GTM-XXXXXXX` or custom `GTM-OPENSOURCE`). Loaded via `/tracker.js` or `/gtm.js`. |
| **Workspace** | An isolated branch/sandbox where team members create and edit tags, triggers, and variables without impacting the published live container. Merged upon publish. |
| **Tag** | An executable snippet of code (HTML, JavaScript, or HTTP beacon) dispatched to analytics or marketing endpoints when specific criteria are satisfied. |
| **Trigger** | A set of evaluation rules and conditions that listen for runtime events (DOM ready, click, timer, custom event) and decide when a Tag should fire. |
| **Trigger Group** | A composite trigger that fires only after all member triggers have evaluated to true within the same page lifecycle. |
| **Variable** | Named placeholders for dynamic values (e.g., `{{Page URL}}`, `{{Click ID}}`, `{{DLV - transaction_id}}`). Evaluated during trigger checks and tag executions. |
| **Data Layer (`window.dataLayer`)** | A client-side JavaScript array/queue used to pass unstructured event data from the application to the tag management container via `dataLayer.push({ event: '...' })`. |
| **DataLayer Deep-Merge v2** | GTM specification algorithm where incoming push objects merge recursively into the global state, with array overwrite semantics (arrays replace rather than concatenate). |
| **Macro DAG** | Directed Acyclic Graph used to evaluate variable dependencies in topological order, detecting circular dependencies and memoizing values per event execution. |
| **Tag Sequencing** | Enforces execution order across tags: Setup Tag (fires before primary), Primary Tag, and Teardown Tag (fires after primary completes). |
| **Tag Priority** | An integer determining execution order when multiple tags fire on the same event (higher numbers execute first; e.g., 100 fires before 10). |
| **Preview & Debug Mode (Tag Assistant)** | An interactive diagnostic overlay that connects to the browser session, visualizes dataLayer events chronologically, and reveals which tags fired or failed. |
| **Version** | An immutable, published snapshot of a workspace container configuration. Can be rolled back or promoted across environments. |
| **Container Zones (GTM 360)** | Enterprise capability allowing parent containers to delegate sub-sections of a site or digital asset to independent child containers with tag-type restrictions. |
| **Multi-Stage Approvals (GTM 360)** | Governance workflow where workspace changes require review, inline comment threads, and multi-tier approval before publishing. |
| **Custom Templates** | Reusable, sandboxed JavaScript tag/variable definitions created via a visual UI, enforcing fine-grained security policies and API permissions. |

---

## 2. Google Analytics 4 (GA4) Concepts

| Jargon / Term | Technical Definition & Role in Platform |
| :--- | :--- |
| **Property** | The reporting container and database grouping for an enterprise's digital properties, holding user profiles, sessions, and conversion metrics. |
| **Data Stream** | A pipeline of incoming hits from a specific platform into a GA4 property. GA4 supports **Web**, **iOS App**, and **Android App** streams. |
| **Measurement ID (`tid`)** | The public identifier for a web data stream (e.g. `G-XXXXXXXXXX`). Included in all wire payloads (`tid=...`) to route hits to the correct property. |
| **Event-Driven Data Model** | GA4's unified architecture replacing Universal Analytics' "session/hit/pageview" model. Everything in GA4 is an event with key-value parameters. |
| **Standard / Automatic Events** | Hits emitted by default: `page_view`, `first_visit`, `session_start`, `user_engagement`. |
| **Enhanced Measurement** | Automatic client-side capture of user interactions without custom code: 90% page scroll depth, outbound link clicks, site search queries, YouTube video engagement, and file downloads. |
| **Custom Dimensions** | User-defined descriptive attributes stored alongside events. Scoped to **Event** (hit attributes), **User** (visitor traits), or **Item** (ecommerce catalog attributes). |
| **Custom Metrics** | User-defined quantitative numerical measurements (e.g., loyalty points redeemed, custom scores). |
| **Calculated Metrics** | Formulas combining existing metrics using math operators (e.g. `{Event count} / {Total users}`). |
| **Key Events (Conversions)** | High-value events marked by marketers (e.g., `purchase`, `generate_lead`). Marked as **Primary** (used for ad optimization and attribution) or **Secondary** (reporting only). |
| **Session & Session ID** | A series of user interactions bounded by a 30-minute inactivity timeout or a midnight boundary in the property's timezone. Monotonically identified by `sid`. |
| **Engaged Session** | A session that lasts longer than 10 seconds, triggers 1 or more key events, or views 2 or more distinct pages/screens. |
| **Engagement Rate & Bounce Rate** | `Engagement Rate = Engaged Sessions / Total Sessions`. `Bounce Rate = 100% - Engagement Rate` (the inverse of engaged sessions). |
| **Reporting Identity** | The hierarchy used to deduplicate and stitch visitor journeys: **Blended** (User ID > Device ID > Modeled), **Observed** (User ID > Device ID), **Device-Based** (Cookie/FPID only). |
| **Client ID (`cid`)** | Pseudo-anonymous device identifier generated on the client (e.g. `123456789.987654321`) stored in cookies or mobile storage. |
| **User ID (`uid`)** | First-party authenticated business ID assigned to logged-in users, enabling cross-device identity stitching. |
| **Predictive Audiences** | Machine-learning audiences predicting future actions: Purchase Probability (next 7 days), Churn Probability (next 7 days), and Revenue Prediction. |
| **Data-Driven Attribution (DDA)** | Algorithmic credit assignment across touchpoints using **Markov Chain Removal Effects** and **Shapley Value** cooperative game theory. |
| **Subproperties & Rollups (GA4 360)** | Subproperties filter a parent property's data for specific regions/brands; Roll-up properties aggregate multiple properties into a single enterprise view. |
| **Explorations** | Advanced ad-hoc reporting tools: Free-form crosstabs, Funnel Exploration, Path Exploration, Segment Overlap, and Cohort Exploration. |

---

## 3. Wire Protocol, Privacy & Anti-Adblock Jargons

| Jargon / Term | Technical Definition & Role in Platform |
| :--- | :--- |
| **Measurement Protocol v2 (MPv2)** | HTTP REST specification used to send raw event batches (`/api/events/batch` or `/mp/collect`) from servers, apps, POS, or offline databases to GA4. |
| **Wire Protocol (`/g/collect` / `/api/events/collect`)** | High-throughput, URL-encoded query string protocol used by browser tracking scripts to emit hits (e.g., `v=2&tid=G-XXX&cid=...&en=page_view`). |
| **First-Party Cloaking / Custom Endpoints** | Hosting tracker scripts (`/tracker.js`) and collection routes (`/api/events/collect`) on the first-party application domain to bypass ad-block filters and Safari ITP. |
| **First-Party Device ID (FPID)** | Server-managed, AES-256-GCM encrypted, `HttpOnly` cookie replacing client-accessible JavaScript cookies to preserve identity beyond 7-day browser limits. |
| **Consent Mode v2** | Google standard framework allowing websites to adjust tracking behavior based on user consent across 7 granular types (`analytics_storage`, `ad_storage`, etc.). |
| **`gcs` (Google Consent Status)** | A 4-character string encoding consent status in wire hits: e.g. `G100` (denied both ads and analytics), `G111` (granted both), `G101` (denied ads, granted analytics). |
| **`gcd` (Google Consent Detail)** | A granular string encoding default vs updated signal states across each consent category (e.g. `13r3r3r5r5l1`). |
| **Cookieless Pings** | Network hits dispatched when consent is denied: cookies are omitted, `cid` is randomized per hit, and data is used exclusively for aggregate modeling. |
| **PII Redaction** | Server-side and client-side regex engines that strip email addresses (`user@domain.com` -> `(redacted)`) and query tokens before persistence. |
| **BigQuery Export Schema** | Standardized nested/repeated JSON schema containing timestamps, event parameters, user properties, traffic sources, and geo data for data lake ingestion. |
