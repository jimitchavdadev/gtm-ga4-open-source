# Ingestion Pipelines, Custom Endpoints & Privacy Engineering

This document specifies the first-party custom HTTP endpoints, wire-protocol parameters, legacy aliases, and privacy redaction filters implemented across the Next.js gateway and the Rust Axum engine.

---

## 1. Custom First-Party Endpoints vs Legacy Aliases

To eliminate third-party ad-block dropoff and maintain a clean first-party posture, the platform exposes native first-party endpoints while maintaining backward-compatible aliases for legacy integrations:

| Custom First-Party Endpoint | Legacy Google Alias | Method | Purpose |
| :--- | :--- | :--- | :--- |
| **`GET /tracker.js?id=...`** | `GET /gtm.js?id=...` | GET | Serves first-party client container script. |
| **`POST /api/events/collect`** | `POST /g/collect` | POST/GET | Single wire-protocol event ingestion. |
| **`POST /api/events/batch`** | `POST /mp/collect` | POST | Measurement Protocol v2 batch ingestion. |
| **`POST /api/events/validate`** | `POST /debug/mp/collect`| POST | Payload validation and error diagnostics. |
| **`GET /api/events/pixel`** | N/A | GET | 1x1 transparent GIF beacon for cookieless email/image tracking. |
| **`GET /api/analytics/properties/:id/realtime`** | `GET /v1beta/...:runRealtimeReport` | GET/POST | Realtime active user count & recent events. |
| **`POST /api/analytics/properties/:id/reports/standard`**| `POST /v1beta/...:runReport` | POST | Acquisition, engagement, and monetization reports. |
| **`GET /api/analytics/properties/:id/reports/attribution`**| N/A | GET | DDA attribution model comparisons (Last-Click vs Markov vs Shapley). |
| **`GET /api/tag-manager/workspaces/:id/entities`** | `GET /api/v1/workspaces/:id/entities` | GET/POST | CRUD management of tags, triggers, and variables. |
| **`POST /api/tag-manager/workspaces/:id/publish`** | `POST /api/v1/workspaces/:id/publish` | POST | Creates immutable version snapshots. |

---

## 2. Wire Protocol Query Parameters

Browser and mobile tracking dispatches hits formatted as URL query parameters or newline-delimited batch lines:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `v` | Integer | Yes | Protocol version. Must be `2`. |
| `tid` | String | Yes | Measurement ID (`G-XXXXXXXXXX` or property stream ID). |
| `cid` | String | Yes | Client ID (`UUID` or pseudo-random device cookie identifier). |
| `uid` | String | No | Authenticated User ID for cross-device identity stitching. |
| `en` | String | Yes | Event Name (`page_view`, `app_open`, `purchase`, `click`). |
| `sid` | Integer | No | Session timestamp in seconds. |
| `sct` | Integer | No | Session count (`session_number` for current user). |
| `seg` | Integer | No | Session engaged flag (`1` for engaged session). |
| `ep.*` | String/Num | No | Event parameter prefix (e.g., `ep.page_title=Home`, `ep.value=99`). |
| `up.*` | String | No | User property prefix (e.g., `up.customer_tier=gold`). |
| `_p` | String | No | Platform override (`web`, `android`, `ios`). |
| `aid` | String | No | Android application package name (`com.example.app`). |
| `bundle_id`| String | No | iOS application bundle identifier (`com.example.app`). |
| `gcs` | String | No | Google Consent Status (e.g., `G100`, `G111`, `G101`). |
| `gcd` | String | No | Google Consent Detail string (e.g., `13r3r3r5r5l1`). |

---

## 3. Anti-Adblock & Privacy Redaction Mechanics

### 3.1 First-Party URL Cloaking
- Tracking scripts and collection routes are served directly from the customer's top-level domain (`/tracker.js`, `/api/events/collect`).
- Ad-blocking filters (uBlock, AdGuard, Brave Shields) that match `google-analytics.com` or `googletagmanager.com` never flag first-party assets.

### 3.2 First-Party Device ID (FPID) Cookie Armor
- Client-side cookies set via JavaScript (`document.cookie`) are capped at 7 days or 24 hours by Apple Safari ITP (Intelligent Tracking Prevention).
- The platform issues a server-side `HttpOnly`, `Secure`, `SameSite=Lax` cookie containing an AES-256-GCM encrypted token, preserving long-term visitor identity.

### 3.3 Automated Email & Sensitive Parameter Scrubbing
- **Email Scrubbing**: Regex `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}` replaces detected emails with `(redacted)` before database persistence.
- **Sensitive Parameter Stripping**: Strips URL query parameters containing security tokens (e.g. `token`, `auth`, `password`, `ssn`, `session_secret`).
