# OpenAnalytics Custom Debugger & Tag Assistant Extension

A developer browser extension for inspecting, verifying, and debugging open-source Google Tag Manager and Google Analytics 4 telemetry in real time.

## Capabilities
- **Real-Time DataLayer Stream**: Intercepts `window.dataLayer.push` calls with full state inspection.
- **Wire Hit Decoder**: Decodes single and batch requests to `/g/collect`, `/mp/collect`, and custom obfuscated first-party reverse proxy paths.
- **Consent Mode v2 Parser**: Decodes `gcs` and `gcd` signal strings to display granular `ad_storage`, `analytics_storage`, `ad_user_data`, and `ad_personalization` statuses.
- **Diagnostics & Validation**: Flags missing configuration tags, unconsented hits, and parameter validation errors.
- **Export**: Exports captured telemetry traces to JSON.

## Installation in Chrome / Brave / Edge
1. Navigate to `chrome://extensions/` (or `brave://extensions/` / `edge://extensions/`).
2. Toggle **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory from this repository.
5. Open Chrome DevTools on any website (<kbd>F12</kbd> or <kbd>Cmd+Option+I</kbd>) and navigate to the **OpenAnalytics** panel!
