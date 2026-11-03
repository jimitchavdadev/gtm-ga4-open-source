// Database
export * from "./src/db/connection";
export * from "./src/db/event-repository";
export * from "./src/db/repository";
export * from "./src/db/schema";

// GTM Core
export * from "./src/gtm/consent-manager";
export * from "./src/gtm/datalayer";
export * from "./src/gtm/macro-dag";
export * from "./src/gtm/predicates";
export * from "./src/gtm/tag-scheduler";
export * from "./src/gtm/trigger-engine";
export * from "./src/gtm/types";

// GTM Enterprise 360
export * from "./src/gtm-enterprise/approval-engine";
export * from "./src/gtm-enterprise/environments";
export * from "./src/gtm-enterprise/zone-engine";

// Server-Side GTM & FPID
export * from "./src/server-gtm/client";
export * from "./src/server-gtm/fpid";
export * from "./src/server-gtm/transformations";
export * from "./src/server-gtm/types";

// GA4 Core & Analytics
export * from "./src/ga4/attribution";
export * from "./src/ga4/audiences";
export * from "./src/ga4/custom-definitions";
export * from "./src/ga4/data-redaction";
export * from "./src/ga4/ecommerce";
export * from "./src/ga4/identity-graph";
export * from "./src/ga4/measurement-protocol";
export * from "./src/ga4/sessionizer";
export * from "./src/ga4/subproperties";
export * from "./src/ga4/types";

// Ingestion Server
export * from "./src/server/client-template";
export * from "./src/server/collect-handler";
export * from "./src/server/http-server";

// Self-Hosted Server Runner
import { DatabaseManager } from "./src/db/connection";
import { EventRepository } from "./src/db/event-repository";
import { createAnalyticsServer } from "./src/server/http-server";

if (import.meta.main) {
	const port = Number(process.env.PORT) || 3000;
	const dbPath = process.env.DATABASE_PATH || "analytics.sqlite";
	const dbManager = new DatabaseManager(dbPath);
	const eventRepo = new EventRepository(dbManager.getDb());

	const server = createAnalyticsServer({ port, eventRepo });
	console.log(
		`🚀 Open Source GTM/GA4 Analytics Server listening on http://localhost:${server.port}`,
	);
}
