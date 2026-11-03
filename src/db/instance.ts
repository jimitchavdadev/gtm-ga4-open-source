import { DatabaseManager } from "./connection";
import { EntityRepository } from "./entity-repository";
import { EventRepository } from "./event-repository";
import { AnalyticsRepository } from "./repository";

// Global singleton instance for Next.js server runtime
const globalForDb = globalThis as unknown as {
	dbManager?: DatabaseManager;
};

const dbPath = process.env.DATABASE_PATH || ":memory:";
export const dbManager = globalForDb.dbManager ?? new DatabaseManager(dbPath);

if (process.env.NODE_ENV !== "production") {
	globalForDb.dbManager = dbManager;
}

const db = dbManager.getDb();
export const analyticsRepo = new AnalyticsRepository(db);
export const eventRepo = new EventRepository(db);
export const entityRepo = new EntityRepository(db);

export function seedDefaults() {
	const hasAcc = db.prepare("SELECT 1 FROM accounts WHERE id = 'acc_1'").get();
	if (!hasAcc) {
		const now = Date.now();
		db.exec(`
      INSERT OR IGNORE INTO accounts (id, name, share_data, created_at, updated_at)
      VALUES ('acc_1', 'Default Organization', 0, ${now}, ${now});

      INSERT OR IGNORE INTO containers (id, account_id, name, public_id, usage_context, is_360, created_at, updated_at)
      VALUES ('GTM-OPENSOURCE', 'acc_1', 'Production Container', 'GTM-OPENSOURCE', 'WEB', 1, ${now}, ${now});

      INSERT OR IGNORE INTO workspaces (id, container_id, name, is_default, created_at, updated_at)
      VALUES ('ws_default', 'GTM-OPENSOURCE', 'Default Workspace', 1, ${now}, ${now});

      INSERT OR IGNORE INTO ga4_properties (id, account_id, display_name, is_360, data_retention_months, created_at, updated_at)
      VALUES ('prop_1', 'acc_1', 'Production GA4 Property', 1, 14, ${now}, ${now});

      INSERT OR IGNORE INTO ga4_data_streams (id, property_id, stream_type, display_name, measurement_id, api_secret, config_json, created_at)
      VALUES ('stream_1', 'prop_1', 'WEB', 'Web Data Stream', 'G-TESTSTREAM', 'sec_123', '{}', ${now});
    `);
	}
}

seedDefaults();
